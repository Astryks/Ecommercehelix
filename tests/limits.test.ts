import { describe, it, expect } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any -- a tiny fake of two Prisma tables */
import { hashIp, overLimit, takeLease, leaseHeld, releaseLease } from "@/lib/limits";

/** A tiny shared fake of the two tables. Two "servers" share one db, like Neon. */
function fakeDb() {
  const hits: { key: string; createdAt: Date }[] = [];
  const leases = new Map<string, Date>();
  return {
    rateHit: {
      count: async ({ where }: any) => hits.filter((h) => h.key === where.key && h.createdAt >= where.createdAt.gte).length,
      create: async ({ data }: any) => { hits.push({ key: data.key, createdAt: data.createdAt ?? new Date() }); return data; },
      deleteMany: async () => ({ count: 0 }),
    },
    lease: {
      create: async ({ data }: any) => { if (leases.has(data.key)) throw new Error("unique"); leases.set(data.key, data.until); return data; },
      updateMany: async ({ where, data }: any) => { const u = leases.get(where.key); if (u && u < where.until.lt) { leases.set(where.key, data.until); return { count: 1 }; } return { count: 0 }; },
      findUnique: async ({ where }: any) => (leases.has(where.key) ? { key: where.key, until: leases.get(where.key)! } : null),
      deleteMany: async ({ where }: any) => ({ count: leases.delete(where.key) ? 1 : 0 }),
    },
  } as any;
}

describe("lasting limits", () => {
  it("hashes IPs (stable, not the raw IP, secret-dependent)", () => {
    expect(hashIp("1.2.3.4", "s")).toBe(hashIp(" 1.2.3.4 ", "s"));
    expect(hashIp("1.2.3.4", "s")).not.toContain("1.2.3.4");
    expect(hashIp("1.2.3.4", "s")).not.toBe(hashIp("1.2.3.4", "t"));
  });

  it("rate limit is shared across servers and resets after the window", async () => {
    const db = fakeDb(); const t = 1_000_000;
    for (let i = 0; i < 5; i++) expect(await overLimit("k", 5, 600_000, db, t + i)).toBe(false);
    expect(await overLimit("k", 5, 600_000, db, t + 10)).toBe(true); // "another server", same db
    expect(await overLimit("other", 5, 600_000, db, t + 10)).toBe(false);
    expect(await overLimit("k", 5, 600_000, db, t + 700_000)).toBe(false);
  });

  it("only one server gets the store-check lease; it expires and can be released", async () => {
    const db = fakeDb(); const t = 5_000_000;
    const [a, b] = await Promise.all([takeLease("store-check:u", 120_000, db, t), takeLease("store-check:u", 120_000, db, t)]);
    expect([a, b].filter(Boolean)).toHaveLength(1);
    expect(await leaseHeld("store-check:u", db, t + 1)).toBe(true);
    expect(await takeLease("store-check:u", 120_000, db, t + 60_000)).toBe(false);
    expect(await takeLease("store-check:u", 120_000, db, t + 121_000)).toBe(true); // expired, taken over
    await releaseLease("store-check:u", db);
    expect(await leaseHeld("store-check:u", db, t + 121_001)).toBe(false);
    expect(await takeLease("store-check:u", 120_000, db, t + 121_002)).toBe(true);
  });
});
