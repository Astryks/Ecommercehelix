import { NextResponse } from "next/server";
import { seminarById } from "@/lib/seminars/curriculum";
import { seminarStripe, viewer, passCookieValue } from "@/lib/seminars/access";
import { PASS_COOKIE, PRICE_CENTS, demoUnlockAllowed } from "@/lib/seminars/pass";

export const dynamic = "force-dynamic";

/** GET /api/seminars/checkout?id=<seminar>: one-off US$1 Stripe Checkout (test mode unless SEMINARS_LIVE=1). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = (process.env.NEXT_PUBLIC_APP_URL && process.env.VERCEL_ENV === "production" ? process.env.NEXT_PUBLIC_APP_URL : url.origin).replace(/\/$/, "");
  const s = seminarById(String(url.searchParams.get("id") ?? ""));
  if (!s) return NextResponse.json({ error: "unknown seminar" }, { status: 404 });
  const stripe = seminarStripe();
  if (!stripe) {
    if (!demoUnlockAllowed()) return NextResponse.json({ error: "Seminar checkout is not available yet." }, { status: 503 });
    // Preview/dev with no test key: unlock without payment so the flow can be reviewed. Never on production.
    const res = NextResponse.redirect(new URL(`/seminars/${s.id}?demo=1`, base), 303);
    res.cookies.set(PASS_COOKIE, passCookieValue(req.headers.get("cookie")?.match(/helix_seminars=([^;]+)/)?.[1], s.id), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 * 5 });
    return res;
  }
  const v = await viewer();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: PRICE_CENTS, product_data: { name: `Helix Daily Seminar: ${s.title}`, description: `${s.minutes}-minute seminar. Yours to rewatch any time.` } } }],
    ...(v.email ? { customer_email: v.email } : {}),
    client_reference_id: v.userId ?? undefined,
    metadata: { kind: "seminar", seminarId: s.id, userId: v.userId ?? "" },
    payment_intent_data: { metadata: { kind: "seminar", seminarId: s.id } },
    success_url: `${base}/api/seminars/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/seminars/${s.id}?canceled=1`,
  });
  return NextResponse.redirect(session.url!, 303);
}
