import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, planForPrice } from "@/lib/stripe";
import { setPlan, setPlanBySubscription } from "@/lib/repo";
import type { PlanId } from "@/lib/plans";

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
      if (userId)
        await setPlan(userId, plan, {
          customerId: typeof cs.customer === "string" ? cs.customer : cs.customer?.id,
          subscriptionId: typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id,
          status: "active",
        });
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const plan = planForPrice(sub.items.data[0]?.price?.id);
      const active = sub.status === "active" || sub.status === "trialing";
      await setPlanBySubscription(sub.id, active ? plan : "free", sub.status);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setPlanBySubscription(sub.id, "free", "canceled");
      break;
    }
  }
  return NextResponse.json({ received: true });
}
