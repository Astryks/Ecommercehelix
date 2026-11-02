import { NextResponse } from "next/server";
import { seminarById } from "@/lib/seminars/curriculum";
import { seminarStripe, recordPurchase, passCookieValue } from "@/lib/seminars/access";
import { PASS_COOKIE } from "@/lib/seminars/pass";

export const dynamic = "force-dynamic";

/** Stripe sends the buyer back here. The session is checked with Stripe (paid, seminar metadata) before access is given. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("session_id") ?? "";
  const stripe = seminarStripe();
  if (!stripe || !/^cs_[A-Za-z0-9_]+$/.test(id)) return NextResponse.redirect(new URL("/seminars?error=1", url.origin), 303);
  const cs = await stripe.checkout.sessions.retrieve(id).catch(() => null);
  const sem = seminarById(cs?.metadata?.seminarId ?? "");
  if (!cs || cs.payment_status !== "paid" || cs.metadata?.kind !== "seminar" || !sem) return NextResponse.redirect(new URL("/seminars?error=1", url.origin), 303);
  await recordPurchase({ seminarId: sem.id, sessionId: cs.id, userId: cs.client_reference_id, email: cs.customer_details?.email ?? cs.customer_email, amountCents: cs.amount_total ?? 0, livemode: cs.livemode });
  const res = NextResponse.redirect(new URL(`/seminars/${sem.id}?paid=1`, url.origin), 303);
  res.cookies.set(PASS_COOKIE, passCookieValue(req.headers.get("cookie")?.match(/helix_seminars=([^;]+)/)?.[1], sem.id), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 * 5 });
  return res;
}
