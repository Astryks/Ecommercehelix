/**
 * Signed one-tap links for the owner's community email. Pure (node:crypto only), so it is tested.
 * Each link does one thing for one person and expires (7 days by default). Signed with AUTH_SECRET.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export type GroupAction = "approve" | "remove";
export const LINK_DAYS = 7;

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const sign = (payload: string, secret: string) => createHmac("sha256", secret).update(`fbgroup:${payload}`).digest("base64url");

export function signGroupLink(a: { action: GroupAction; userId: string }, secret: string, now = Date.now(), days = LINK_DAYS): string {
  const payload = b64(JSON.stringify({ a: a.action, u: a.userId, e: Math.floor(now / 1000) + days * 86_400 }));
  return `${payload}.${sign(payload, secret)}`;
}

export type Verified = { ok: true; action: GroupAction; userId: string } | { ok: false; reason: "bad" | "expired" };

export function verifyGroupLink(token: string, secret: string, now = Date.now()): Verified {
  const [payload, sig] = String(token ?? "").split(".");
  if (!payload || !sig || !secret) return { ok: false, reason: "bad" };
  const want = Buffer.from(sign(payload, secret));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return { ok: false, reason: "bad" };
  try {
    const p = JSON.parse(Buffer.from(payload, "base64url").toString()) as { a?: string; u?: string; e?: number };
    if ((p.a !== "approve" && p.a !== "remove") || !p.u || typeof p.e !== "number") return { ok: false, reason: "bad" };
    if (now / 1000 > p.e) return { ok: false, reason: "expired" };
    return { ok: true, action: p.a, userId: p.u };
  } catch {
    return { ok: false, reason: "bad" };
  }
}

/** The group link from FB_GROUP_URL (or the older FACEBOOK_GROUP_URL), without a trailing slash. */
export function groupUrl(env: Record<string, string | undefined> = process.env): string | null {
  const u = (env.FB_GROUP_URL || env.FACEBOOK_GROUP_URL || "").trim().replace(/\/+$/, "");
  return /^https:\/\/(www\.)?facebook\.com\/groups\//.test(u) ? u : null;
}
export const approveUrl = (g: string) => `${g}/member-requests`;
export const removeUrl = (g: string, name: string) => `${g}/members?search=${encodeURIComponent(name)}`;
