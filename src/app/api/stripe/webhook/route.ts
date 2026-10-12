import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, planForPrice } from "@/lib/stripe";
import { planForStatus } from "@/lib/billing";
import { setPlan, setPlanBySubscription, setBillingStatusByCustomer } from "@/lib/repo";
import type { PlanId } from "@/lib/plans";

const idOf = (x: string | { id: string } | null | undefined) => (typeof x === "string" ? x : x?.id);

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  const sig = req.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      const userId = cs.client_reference_id ?? cs.metadata?.userId;
      const plan = (cs.metadata?.plan ?? "starter") as PlanId;
      if (userId && cs.mode === "subscription")
        await setPlan(userId, plan, { customerId: idOf(cs.customer), subscriptionId: idOf(cs.subscription), status: "active" });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const plan = planForStatus(sub.status, planForPrice(sub.items.data[0]?.price?.id));
      await setPlanBySubscription(sub.id, plan, sub.status, { userId: sub.metadata?.userId, customerId: idOf(sub.customer) });
      break;
    }
    case "customer.subscription.deleted": {
      // Downgrade to Free. Only plan and status change: the Meta connection and prep plans stay.
      const sub = event.data.object as Stripe.Subscription;
      await setPlanBySubscription(sub.id, "free", "canceled", { userId: sub.metadata?.userId, customerId: idOf(sub.customer) });
      break;
    }
    case "invoice.payment_failed": {
      // Stripe retries the card; the plan stays during the retries and drops to Free if the subscription ends.
      const inv = event.data.object as Stripe.Invoice;
      const customerId = idOf(inv.customer);
      if (customerId) await setBillingStatusByCustomer(customerId, "past_due");
      break;
    }
  }
  return NextResponse.json({ received: true });
}
