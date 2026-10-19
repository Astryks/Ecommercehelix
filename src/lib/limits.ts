import { createHmac } from "node:crypto";
import { prisma, hasDb } from "./db";

/**
 * Limits that hold across every server (Neon tables RateHit and Lease).
 * Without a database (local demo) they fall back to memory on this server.
 */

/** Hash an IP with the app secret, so raw IPs are never stored. */
export function hashIp(ip: string, secret = process.env.AUTH_SECRET ?? "helix-local"): string {
  return createHmac("sha256", secret).update("ip:" + ip.trim().toLowerCase()).digest("base64url").slice(0, 32);
}

const memHits = new Map<string, number[]>();
const memLeases = new Map<string, number>();

type Db = typeof prisma;

/** Record a hit and say whether the key is over `max` hits in the window. Counts the attempt only when allowed. */
export async function overLimit(key: string, max: number, windowMs: number, db: Db | null = hasDb ? prisma : null, now = Date.now()): Promise<boolean> {
  if (!db) {
    const list = (memHits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length >= max) { memHits.set(key, list); return true; }
    list.push(now); memHits.set(key, list);
    if (memHits.size > 5000) memHits.clear();
    return false;
  }
  const since = new Date(now - windowMs);
  const n = await db.rateHit.count({ where: { key, createdAt: { gte: since } } });
  if (n >= max) return true;
  await db.rateHit.create({ data: { key, createdAt: new Date(now) } });
  // Light clean-up of old rows for this key.
  if (Math.random() < 0.05) await db.rateHit.deleteMany({ where: { createdAt: { lt: new Date(now - 86_400_000) } } }).catch(() => null);
  return false;
}

/** Take a lease. True if we got it: no lease, or the old one expired. Atomic across servers. */
export async function takeLease(key: string, ms: number, db: Db | null = hasDb ? prisma : null, now = Date.now()): Promise<boolean> {
  const until = new Date(now + ms);
  if (!db) {
    if ((memLeases.get(key) ?? 0) > now) return false;
    memLeases.set(key, until.getTime());
    return true;
  }
  try {
    await db.lease.create({ data: { key, until } });
    return true;
  } catch {
    // Someone holds it. Take over only if it expired (conditional update is atomic).
    const r = await db.lease.updateMany({ where: { key, until: { lt: new Date(now) } }, data: { until } });
    return r.count === 1;
  }
}

/** Is a lease held right now? */
export async function leaseHeld(key: string, db: Db | null = hasDb ? prisma : null, now = Date.now()): Promise<boolean> {
  if (!db) return (memLeases.get(key) ?? 0) > now;
  const l = await db.lease.findUnique({ where: { key } });
  return Boolean(l && l.until.getTime() > now);
}

export async function releaseLease(key: string, db: Db | null = hasDb ? prisma : null): Promise<void> {
  if (!db) { memLeases.delete(key); return; }
  await db.lease.deleteMany({ where: { key } }).catch(() => null);
}
