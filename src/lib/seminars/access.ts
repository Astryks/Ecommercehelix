import "server-only";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { hasDb, prisma } from "../db";
import { PASS_COOKIE, readPass, seminarKey, signPass } from "./pass";

export const passSecret = () => process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.VERCEL_ENV === "production" ? "" : "helix-dev-only-seminar-secret");

export function seminarStripe(): Stripe | null {
  const k = seminarKey();
  return k ? new Stripe(k) : null;
}

export async function viewer(): Promise<{ userId: string | null; email: string | null }> {
  try {
    const s = await auth();
    return { userId: s?.user?.id ?? null, email: s?.user?.email ?? null };
  } catch {
    return { userId: null, email: null };
  }
}

/** Every seminar id this visitor has bought: signed cookie plus purchases saved against their account or email. */
export async function purchasedIds(): Promise<Set<string>> {
  const jar = await cookies();
  const ids = new Set(readPass(jar.get(PASS_COOKIE)?.value, passSecret()));
  if (hasDb) {
    const v = await viewer();
    if (v.userId || v.email) {
      try {
        const rows = await prisma.seminarPurchase.findMany({ where: { OR: [v.userId ? { userId: v.userId } : undefined, v.email ? { email: v.email } : undefined].filter(Boolean) as object[] }, select: { seminarId: true } });
        rows.forEach((r) => ids.add(r.seminarId));
      } catch (e) {
        console.error("[seminars] purchase lookup failed (table missing?)", (e as Error).message.slice(0, 160));
      }
    }
  }
  return ids;
}

export async function recordPurchase(p: { seminarId: string; sessionId: string; userId?: string | null; email?: string | null; amountCents: number; livemode: boolean }) {
  if (!hasDb) return;
  try {
    await prisma.seminarPurchase.upsert({ where: { stripeSessionId: p.sessionId }, update: {}, create: { seminarId: p.seminarId, stripeSessionId: p.sessionId, userId: p.userId ?? null, email: p.email ?? null, amountCents: p.amountCents, livemode: p.livemode } });
  } catch (e) {
    console.error("[seminars] could not save purchase (run docs/sql/2026-11-02-seminars.sql)", (e as Error).message.slice(0, 160));
  }
}

export function passCookieValue(existing: string | undefined, add: string): string {
  return signPass([...readPass(existing, passSecret()), add], passSecret());
}
