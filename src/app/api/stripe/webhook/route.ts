import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe as stripeClient, planForPrice } from "@/lib/stripe";
import { isStale, prettyDate, subFields, type SubLike } from "@/lib/billing";
import { claimEvent, findSub, releaseEvent, writeSub } from "@/lib/billing-store";
import { notify } from "@/lib/email/notify";
import { cancelEmail, paymentFailedEmail, receiptEmail } from "@/lib/email/templates";
import { planName } from "@/lib/plans";

export const dynamic = "force-dynamic";

const idOf = (x: string | { id: string } | null | undefined) => (typeof x === "string" ? x : x?.id);
const usd = (cents: number, cur = "usd") => `${cur.toUpperCase() === "USD" ? "US$" : cur.toUpperCase() + " "}${(cents / 100).toFixed(2)}`;

/** Store a subscription's state (newest event wins) and send the cancellation email when cancel-at-period-end is switched on. */
async function applySub(sub: SubLike & { customer?: string | { id: string } | null; metadata?: Record<string, string> | null }, created: number, hintUserId?: string | null) {
  const row = (await findSub({ subscriptionId: sub.id })) ?? (hintUserId || sub.metadata?.userId ? await findSub({ userId: (hintUserId || sub.metadata?.userId)! }) : null);
  const userId = row?.userId ?? hintUserId ?? sub.metadata?.userId;
  if (!userId) return "no-user";
  if (row && row.subscriptionId === sub.id && isStale(created, row.lastEventAt)) return "stale";
  // Never let an old or second subscription overwrite a different live one.
  if (row?.subscriptionId && row.subscriptionId !== sub.id && ["active", "trialing", "past_due"].includes(row.status) && !["active", "trialing", "past_due"].includes(sub.status)) return "other-sub";
  const f = subFields(sub, (p, price) => planForPrice(p, process.env, price));
  await writeSub(userId, { ...f, customerId: idOf(sub.customer), subscriptionId: sub.id, lastEventAt: new Date(created * 1000) });
  const nowCanceling = (f.cancelAtPeriodEnd && !row?.cancelAtPeriodEnd) || (sub.status === "canceled" && row?.status !== "canceled" && !row?.cancelAtPeriodEnd);
  if (nowCanceling && row?.email)
    await notify({ userId, email: row.email, plan: row.plan }, "cancel", sub.id, (l) => cancelEmail({ name: row.name, baseUrl: l.baseUrl }, { until: sub.status === "canceled" ? "today" : prettyDate(f.currentPeriodEnd) }));
  return "ok";
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = stripeClient;
  if (!stripe || !secret) return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  const sig = req.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  if (!(await claimEvent(event.id, event.type))) return NextResponse.json({ received: true, duplicate: true });

  try {
    let result = "ignored";
    switch (event.type) {
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        const userId = cs.client_reference_id ?? cs.metadata?.userId;
        const subId = idOf(cs.subscription);
        if (cs.mode === "subscription" && userId && subId) {
          // The plan comes from the real subscription and price, never from checkout metadata.
          const sub = await stripe.subscriptions.retrieve(subId);
          result = await applySub(sub as unknown as SubLike, event.created, userId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        result = await applySub(event.data.object as unknown as SubLike & { metadata?: Record<string, string> }, event.created);
        break;
      }
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        const row = await findSub({ customerId: idOf(inv.customer) ?? "" });
        if (row) {
          if (row.status === "past_due") await writeSub(row.userId, { status: "active" });
          if (inv.amount_paid > 0 && row.email)
            await notify({ userId: row.userId, email: row.email, plan: row.plan }, "receipt", inv.id ?? String(event.id), (l) => receiptEmail({ name: row.name, baseUrl: l.baseUrl }, { amount: usd(inv.amount_paid, inv.currency), plan: planName(row.plan), date: prettyDate(new Date(event.created * 1000)), invoiceUrl: inv.hosted_invoice_url }));
          result = "ok";
        }
        break;
      }
      case "invoice.payment_failed": {
        // Stripe retries the card; the plan stays during the retries (past_due grace) and drops to Free if the subscription ends.
        const inv = event.data.object as Stripe.Invoice;
        const row = await findSub({ customerId: idOf(inv.customer) ?? "" });
        if (row) {
          await writeSub(row.userId, { status: "past_due" });
          if (row.email)
            await notify({ userId: row.userId, email: row.email, plan: row.plan }, "failed", inv.id ?? String(event.id), (l) => paymentFailedEmail({ name: row.name, baseUrl: l.baseUrl }, { amount: usd(inv.amount_due, inv.currency), updateUrl: inv.hosted_invoice_url || `${l.baseUrl}/dashboard/billing?update=1` }));
          result = "ok";
        }
        break;
      }
    }
    return NextResponse.json({ received: true, result });
  } catch (e) {
    await releaseEvent(event.id); // let Stripe retry
    console.error("stripe webhook failed", event.type, (e as Error).message);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
