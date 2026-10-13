import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureUser, setPlan, getBilling } from "@/lib/repo";
import { stripe, priceFor } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

export async function POST(req: Request) {
  const form = await req.formData();
  const plan = String(form.get("plan") ?? "") as PlanId;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const s = await auth();
  if (!s?.user?.id) return NextResponse.redirect(new URL("/signin?next=/dashboard/billing", base), 303);
  const userId = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  if (!["free", "starter", "growth"].includes(plan)) return NextResponse.json({ error: "bad plan" }, { status: 400 });

  const price = priceFor(plan);
  const billing = await getBilling(userId);
  // Already paying through Stripe: plan changes and cancelling happen in the customer portal.
  if (stripe && billing.subscriptionId && billing.customerId && billing.status !== "canceled") {
    const portal = await stripe.billingPortal.sessions.create({ customer: billing.customerId, return_url: `${base}/dashboard/billing` });
    return NextResponse.redirect(portal.url, 303);
  }
  // A paid plan is never granted without a real payment when billing is configured,
  // and never in production. A missing price env var must not hand out a free upgrade.
  if (plan !== "free" && (stripe ? !price : process.env.VERCEL_ENV === "production")) {
    return NextResponse.json({ error: "Billing is not available right now. Please try again later." }, { status: 503 });
  }
  if (!stripe || plan === "free") {
    // Demo mode (no Stripe keys) or downgrade: set the plan directly.
    await setPlan(userId, plan);
    return NextResponse.redirect(new URL(`/dashboard/billing?dev=${stripe ? 0 : 1}&plan=${plan}`, base), 303);
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: userId,
    ...(billing.customerId ? { customer: billing.customerId } : { customer_email: s.user.email ?? undefined }),
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    custom_text: { submit: { message: `This subscription renews automatically every month at the price shown until you cancel. Cancel any time in Plan & billing on E-commerce Helix; you keep paid features to the end of the month you paid for. Terms: ${base}/terms` } },
    success_url: `${base}/dashboard/billing?success=1`,
    cancel_url: `${base}/dashboard/billing?canceled=1`,
  });
  return NextResponse.redirect(session.url!, 303);
}
