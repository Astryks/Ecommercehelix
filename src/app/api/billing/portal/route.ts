import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureUser, getBilling } from "@/lib/repo";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Stripe customer portal (card, invoices). ?update=1 (or form field update) opens straight on "update card". Always returns to Plan & billing. */
export async function POST(req: Request) {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
  const s = await auth();
  if (!s?.user?.id) return NextResponse.redirect(new URL("/signin?next=/dashboard/billing", base), 303);
  const userId = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const b = await getBilling(userId);
  if (!stripe || !b.customerId) return NextResponse.redirect(new URL("/dashboard/billing?noportal=1", base), 303);
  const form = await req.formData().catch(() => null);
  const update = form?.get("update") === "1" || new URL(req.url).searchParams.get("update") === "1";
  const portal = await stripe.billingPortal.sessions.create({
    customer: b.customerId,
    return_url: `${base}/dashboard/billing?from=portal`,
    ...(update ? { flow_data: { type: "payment_method_update" as const, after_completion: { type: "redirect" as const, redirect: { return_url: `${base}/dashboard/billing?card=1` } } } } : {}),
  });
  return NextResponse.redirect(portal.url, 303);
}
