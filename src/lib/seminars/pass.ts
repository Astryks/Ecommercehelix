import { createHmac, timingSafeEqual } from "node:crypto";

/** Signed list of purchased seminar ids kept in an HttpOnly cookie, so buyers keep access even without an account. */
export const PASS_COOKIE = "helix_seminars";
export const PRICE_CENTS = 100; // US$1 per seminar

const sig = (body: string, secret: string) => createHmac("sha256", secret).update(`seminars:${body}`).digest("base64url");

export function signPass(ids: string[], secret: string): string {
  const body = Buffer.from(JSON.stringify([...new Set(ids)].sort())).toString("base64url");
  return `${body}.${sig(body, secret)}`;
}

export function readPass(raw: string | undefined, secret: string): string[] {
  if (!raw || !secret) return [];
  const [body, s] = raw.split(".");
  if (!body || !s) return [];
  const want = Buffer.from(sig(body, secret));
  const got = Buffer.from(s);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return [];
  try {
    const ids = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string").slice(0, 500) : [];
  } catch {
    return [];
  }
}

type Env = Record<string, string | undefined>;
/**
 * Test mode only until Sid approves live sales: a key is used only if it is a Stripe *test* key (sk_test_ / rk_test_),
 * unless SEMINARS_LIVE=1 is set on purpose. SEMINAR_STRIPE_SECRET_KEY wins over the shared STRIPE_SECRET_KEY.
 */
export function seminarKey(env: Env = process.env): string | null {
  const key = env.SEMINAR_STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY || "";
  if (!key) return null;
  if (/^(sk|rk)_test_/.test(key)) return key;
  return env.SEMINARS_LIVE === "1" ? key : null;
}

/** Demo unlock (no payment) is allowed only off production when no usable key is set. */
export const demoUnlockAllowed = (env: Env = process.env) => !seminarKey(env) && env.VERCEL_ENV !== "production";
