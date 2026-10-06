import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureUser, setPlan } from "@/lib/repo";
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
  if (!stripe || !price || plan === "free") {
    // Demo mode (no Stripe keys) or downgrade: set the plan directly.
    await setPlan(userId, plan);
    return NextResponse.redirect(new URL(`/dashboard/billing?dev=${stripe ? 0 : 1}&plan=${plan}`, base), 303);
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: userId,
    customer_email: s.user.email ?? undefined,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    success_url: `${base}/dashboard/billing?success=1`,
    cancel_url: `${base}/dashboard/billing?canceled=1`,
  });
  return NextResponse.redirect(session.url!, 303);
}
