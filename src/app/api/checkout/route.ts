import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureUser, setPlan, getBilling, getAccount } from "@/lib/repo";
import { stripe, priceFor } from "@/lib/stripe";
import { CANCEL_LINE, LIVE_STATUSES, prorationFor } from "@/lib/billing";
import { writeSub } from "@/lib/billing-store";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

const PLANS: PlanId[] = ["free", "starter", "growth"];

/**
 * One click to pay: GET /api/checkout?plan=starter (links on pricing and upgrade prompts) or POST (billing page).
 * Signed out: sign in first, then straight back here. Already subscribed: the plan is changed in place with
 * proration (never a second subscription).
 */
async function handle(req: Request, plan: PlanId) {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
  const back = (q: string) => NextResponse.redirect(new URL(`/dashboard/billing?${q}`, base), 303);
  if (!PLANS.includes(plan)) return NextResponse.json({ error: "bad plan" }, { status: 400 });
  const s = await auth();
  if (!s?.user?.id) return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(`/api/checkout?plan=${plan}`)}`, base), 303);
  const userId = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const price = priceFor(plan);
  const billing = await getBilling(userId);

  // A paid plan is never granted without a real payment when billing is configured, and never in production.
  if (plan !== "free" && (stripe ? !price : process.env.VERCEL_ENV === "production")) return NextResponse.json({ error: "Billing is not available right now. Please try again later." }, { status: 503 });
  if (!stripe) {
    await setPlan(userId, plan); // demo mode (no Stripe keys)
    return back(`dev=1&plan=${plan}`);
  }

  // No double subscriptions: look for any live subscription on this customer in Stripe, not just the one we stored.
  if (billing.customerId) {
    const live = (await stripe.subscriptions.list({ customer: billing.customerId, status: "all", limit: 10 })).data.filter((x) => (LIVE_STATUSES as readonly string[]).includes(x.status));
    const cur = live[0];
    if (cur) {
      if (plan === "free") return back("cancel=1"); // moving to Free = cancel at period end, with a confirm step
      const item = cur.items.data[0];
      if (item?.price?.id === price) {
        if (cur.cancel_at_period_end) await stripe.subscriptions.update(cur.id, { cancel_at_period_end: false });
        return back("already=1");
      }
      const from = (await getAccount(userId)).plan;
      await stripe.subscriptions.update(cur.id, { items: [{ id: item.id, price }], proration_behavior: prorationFor(from, plan), cancel_at_period_end: false, metadata: { userId, plan } });
      await writeSub(userId, { subscriptionId: cur.id });
      return back(`changed=${plan}`);
    }
  }
  if (plan === "free") {
    await setPlan(userId, "free");
    return back("plan=free");
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: userId,
    ...(billing.customerId ? { customer: billing.customerId } : { customer_email: s.user.email ?? undefined }),
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    allow_promotion_codes: true,
    custom_text: { submit: { message: `${CANCEL_LINE} Renews monthly at the price shown until you cancel in Plan & billing; you keep paid features to the end of the month you paid for. Terms: ${base}/terms` } },
    success_url: `${base}/dashboard/billing?success=1`,
    cancel_url: `${base}/dashboard/billing?canceled=1`,
  }, { idempotencyKey: `checkout-${userId}-${plan}-${Math.floor(Date.now() / 60000)}` });
  return NextResponse.redirect(session.url!, 303);
}

export async function GET(req: Request) {
  return handle(req, String(new URL(req.url).searchParams.get("plan") ?? "") as PlanId);
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "bad request" }, { status: 400 });
  return handle(req, String(form.get("plan") ?? "") as PlanId);
}
