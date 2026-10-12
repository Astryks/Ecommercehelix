import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureUser, getBilling } from "@/lib/repo";
import { stripe } from "@/lib/stripe";

/** Opens the Stripe customer portal (change plan, card, invoices, cancel). */
export async function POST(req: Request) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const s = await auth();
  if (!s?.user?.id) return NextResponse.redirect(new URL("/signin?next=/dashboard/billing", base), 303);
  const userId = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const b = await getBilling(userId);
  if (!stripe || !b.customerId) return NextResponse.redirect(new URL("/dashboard/billing?noportal=1", base), 303);
  const portal = await stripe.billingPortal.sessions.create({ customer: b.customerId, return_url: `${base}/dashboard/billing` });
  return NextResponse.redirect(portal.url, 303);
}
