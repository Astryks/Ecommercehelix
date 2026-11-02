import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { seminarStripe, recordPurchase } from "@/lib/seminars/access";
import { seminarById } from "@/lib/seminars/curriculum";

export const dynamic = "force-dynamic";

/** Separate (test-mode) webhook for seminar purchases, so a buyer who closes the tab still gets the purchase saved. */
export async function POST(req: Request) {
  const stripe = seminarStripe();
  const secret = process.env.SEMINAR_STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "not configured" }, { status: 501 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const cs = event.data.object as Stripe.Checkout.Session;
    const sem = seminarById(cs.metadata?.seminarId ?? "");
    if (cs.metadata?.kind === "seminar" && sem && cs.payment_status === "paid")
      await recordPurchase({ seminarId: sem.id, sessionId: cs.id, userId: cs.client_reference_id, email: cs.customer_details?.email ?? cs.customer_email, amountCents: cs.amount_total ?? 0, livemode: cs.livemode });
  }
  return NextResponse.json({ received: true });
}
