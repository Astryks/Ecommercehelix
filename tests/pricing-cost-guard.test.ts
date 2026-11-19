import { describe, expect, it } from "vitest";
import {
  abuseCheck,
  downgradeForFree,
  estimate,
  expireBuckets,
  hardCapViolation,
  marginAlert,
  marginBy,
  mondayOfWeek,
  nextWeeklyBucket,
  paygBucket,
  quote,
  quoteForProviderUsd,
  reserve,
  settle,
  tierAffordable,
  type CreditBucket,
  type UsageEvent,
} from "@/lib/pricing/cost-guard";

const bucket = (over: Partial<CreditBucket> = {}): CreditBucket => ({
  id: "wk-2026-11-16",
  kind: "weekly",
  credits: 60,
  remaining: 60,
  grantedAt: "2026-11-16T00:00:00.000Z",
  expiresAt: "2026-11-22T13:00:00.000Z",
  ...over,
});

describe("estimate — guarantee 1, pre-flight", () => {
  it("quotes the buffered maximum before any call", () => {
    expect(estimate("flow-draft")).toEqual({ credits: 16.5, providerUsd: 0.165, walletUsd: 0.33, tier: 3 });
    expect(estimate("tier0")).toEqual({ credits: 0, providerUsd: 0, walletUsd: 0, tier: 0 });
  });
});

describe("reserve — guarantees 2–3, bucket order", () => {
  it("takes from the weekly allowance first, never the wallet", () => {
    const r = reserve({ action: "chat", plan: "starter", freeSpentCredits: 0, buckets: [bucket()], walletBalanceUsd: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.reservation.taken).toEqual([{ source: "allowance", credits: 1.3, walletUsd: 0 }]);
      expect(r.reservation.walletUsdReserved).toBe(0);
    }
  });
  it("takes the oldest-expiring bucket first", () => {
    const oldB = bucket({ id: "old", remaining: 0.5, expiresAt: "2026-11-20T00:00:00.000Z" });
    const newB = bucket({ id: "new", remaining: 60, expiresAt: "2026-11-29T00:00:00.000Z" });
    const r = reserve({ action: "chat", plan: "starter", freeSpentCredits: 0, buckets: [newB, oldB], walletBalanceUsd: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.reservation.bucketIds).toEqual(["old", "new"]);
  });
  it("spills to the wallet at 2x provider cost when the allowance runs out", () => {
    const r = reserve({ action: "flow-draft", plan: "starter", freeSpentCredits: 0, buckets: [bucket({ remaining: 10 })], walletBalanceUsd: 10 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.reservation.taken).toEqual([
        { source: "allowance", credits: 10, walletUsd: 0 },
        { source: "wallet", credits: 6.5, walletUsd: 0.13 },
      ]);
    }
  });
  it("free plan draws on the 60-credit monthly pool, then refuses", () => {
    const ok = reserve({ action: "chat", plan: "free", freeSpentCredits: 58.7, buckets: [], walletBalanceUsd: 0 });
    expect(ok.ok).toBe(true); // 1.3 credits left covers exactly one 1.3-credit chat
    const no = reserve({ action: "chat", plan: "free", freeSpentCredits: 59, buckets: [], walletBalanceUsd: 0 });
    expect(no.ok).toBe(false); // 1 credit left, chat needs 1.3
    if (!no.ok) {
      expect(no.reason).toBe("insufficient");
      expect(no.shortfallCredits).toBeCloseTo(0.3, 1);
      expect(no.message).toMatch(/Free plan/);
      expect(no.message).toMatch(/Upgrade to Starter/);
    }
  });
  it("refuses with the shortfall and the wallet price when nothing can cover it", () => {
    const r = reserve({ action: "ad-batch", plan: "starter", freeSpentCredits: 0, buckets: [bucket({ remaining: 5 })], walletBalanceUsd: 0.1 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.creditsNeeded).toBe(13.2);
      expect(r.creditsAvailable).toBe(5);
      expect(r.walletCostUsd).toBeCloseTo(0.16, 2); // 8.2 credits shortfall x $0.01 x 2
      expect(r.message).toMatch(/Top up the wallet/);
    }
  });
  it("a zero-cost action needs no reservation", () => {
    const r = reserve({ action: "tier0", plan: "free", freeSpentCredits: 60, buckets: [], walletBalanceUsd: 0 });
    expect(r.ok).toBe(true);
  });
});

describe("settle — guarantee 2, charge the real cost, release the rest", () => {
  it("charges actual usage and releases the unused hold", () => {
    const r = reserve({ action: "flow-draft", plan: "starter", freeSpentCredits: 0, buckets: [bucket({ remaining: 10 })], walletBalanceUsd: 10 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const s = settle(r.reservation, 0.1); // real cost $0.10, reserved $0.165
    expect(s.creditsSpent).toBe(10);
    expect(s.creditsReleased).toBe(6.5);
    // Wallet covered 6.5 of the 16.5 reserved credits, so it pays the same
    // share of the real cost: 10 credits x $0.01 x 2 x (6.5 / 16.5) = $0.08.
    expect(s.walletUsdSpent).toBeCloseTo(0.08, 2);
    expect(s.walletUsdReleased).toBeCloseTo(0.05, 2);
  });
  it("a failed call ($0 actual) releases everything", () => {
    const r = reserve({ action: "chat", plan: "starter", freeSpentCredits: 0, buckets: [bucket()], walletBalanceUsd: 0 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const s = settle(r.reservation, 0);
    expect(s.creditsSpent).toBe(0);
    expect(s.creditsReleased).toBe(1.3);
    expect(s.walletUsdSpent).toBe(0);
  });
});

describe("quote — approval cards name the cost and the bucket", () => {
  it("names the plan allowance when covered", () => {
    const q = quote("approval-card", { plan: "starter", freeSpentCredits: 0, buckets: [bucket()], walletBalanceUsd: 0 });
    expect(q).toEqual({ credits: 0.9, providerUsd: 0.009, paysFrom: "plan allowance", walletUsdIfNeeded: 0, covered: true });
  });
  it("names the wallet when the allowance cannot cover it", () => {
    const q = quote("flow-draft", { plan: "starter", freeSpentCredits: 0, buckets: [], walletBalanceUsd: 5 });
    expect(q.paysFrom).toBe("wallet");
    expect(q.covered).toBe(true);
  });
  it("says 'not covered' with the wallet price when neither can", () => {
    const q = quote("flow-draft", { plan: "starter", freeSpentCredits: 0, buckets: [], walletBalanceUsd: 0 });
    expect(q.covered).toBe(false);
    expect(q.paysFrom).toBe("not covered");
    expect(q.walletUsdIfNeeded).toBeCloseTo(0.33, 2);
  });
  it("quotes a bare provider-cost figure (Step 1–3 approval cards)", () => {
    const q = quoteForProviderUsd(0.006, { plan: "starter", freeSpentCredits: 0, buckets: [bucket()], walletBalanceUsd: 0 });
    expect(q).toEqual({ credits: 0.6, paysFrom: "plan allowance", covered: true, walletCostUsd: 0 });
    const uncovered = quoteForProviderUsd(0.11, { plan: "free", freeSpentCredits: 60, buckets: [], walletBalanceUsd: 0 });
    expect(uncovered.covered).toBe(false);
    expect(uncovered.walletCostUsd).toBeCloseTo(0.22, 2);
  });
});

describe("weekly expiry + Growth grace", () => {
  it("unspent weekly credits lapse on Sunday night", () => {
    const { kept, lapsedCredits } = expireBuckets([bucket({ remaining: 20 })], "starter", new Date("2026-11-23T00:00:00.000Z"));
    expect(kept).toEqual([]);
    expect(lapsedCredits).toBe(20);
  });
  it("Growth gets one grace week, then the credits lapse", () => {
    const first = expireBuckets([bucket({ remaining: 20 })], "growth", new Date("2026-11-23T00:00:00.000Z"));
    expect(first.gracedCredits).toBe(20);
    expect(first.kept).toHaveLength(1);
    expect(first.kept[0].grace).toBe(true);
    const second = expireBuckets(first.kept, "growth", new Date("2026-12-01T00:00:00.000Z"));
    expect(second.kept).toEqual([]);
    expect(second.lapsedCredits).toBe(20);
  });
  it("PAYG buckets expire 7 days after purchase, no grace", () => {
    const b = paygBucket(new Date("2026-11-19T00:00:00.000Z"));
    expect(b.credits).toBe(500); // finishing step: PAYG aligned to the $10 wallet top-up (was 100)
    expect(b.expiresAt).toBe("2026-11-26T00:00:00.000Z");
    const { kept, lapsedCredits } = expireBuckets([b], "growth", new Date("2026-11-27T00:00:00.000Z"));
    expect(kept).toEqual([]);
    expect(lapsedCredits).toBe(500); // PAYG pack is 500 credits now
  });
  it("weeks run Monday to Sunday", () => {
    expect(mondayOfWeek(new Date("2026-11-19T10:00:00.000Z"))).toBe("2026-11-16"); // Thursday
    expect(mondayOfWeek(new Date("2026-11-22T10:00:00.000Z"))).toBe("2026-11-16"); // Sunday
    expect(mondayOfWeek(new Date("2026-11-23T10:00:00.000Z"))).toBe("2026-11-23"); // Monday
  });
  it("weekly grants carry the plan's credits and the add-on's extra 120", () => {
    const g = nextWeeklyBucket({ plan: "starter", addOnActive: false, weekKey: "2026-11-16" });
    expect(g?.credits).toBe(60);
    const withAddOn = nextWeeklyBucket({ plan: "growth", addOnActive: true, weekKey: "2026-11-16" });
    expect(withAddOn?.credits).toBe(300);
    expect(nextWeeklyBucket({ plan: "free", addOnActive: false, weekKey: "2026-11-16" })).toBeNull();
  });
});

describe("downgrade before stopping — guarantee 5, free only", () => {
  it("falls back to Tier 1, then rules-only, as the free pool runs down", () => {
    expect(downgradeForFree(0)).toBe("full");
    expect(downgradeForFree(44)).toBe("full");
    expect(downgradeForFree(45)).toBe("tier1");
    expect(downgradeForFree(60)).toBe("tier0");
  });
  it("no silent upgrades — guarantee 6", () => {
    const broke = { plan: "free" as const, freeSpentCredits: 60, buckets: [], walletBalanceUsd: 0 };
    expect(tierAffordable(3, broke)).toBe(false);
    expect(tierAffordable(0, broke)).toBe(true);
    const rich = { plan: "growth" as const, freeSpentCredits: 0, buckets: [bucket()], walletBalanceUsd: 0 };
    expect(tierAffordable(3, rich)).toBe(true);
  });
});

describe("hard caps — guarantee 4", () => {
  const counts = { deepChatsToday: 0, auditsThisHour: 0, trendAdaptsToday: 0 };
  it("caps deep chats per day", () => {
    expect(hardCapViolation("deep-chat", { ...counts, deepChatsToday: 10 })).toMatch(/capped at 10 a day/);
    expect(hardCapViolation("deep-chat", { ...counts, deepChatsToday: 9 })).toBeNull();
  });
  it("caps audits per hour", () => {
    expect(hardCapViolation("store-audit", { ...counts, auditsThisHour: 3 })).toMatch(/capped at 3 an hour/);
  });
  it("caps trend adaptations per day", () => {
    expect(hardCapViolation("trend-adapt", { ...counts, trendAdaptsToday: 4 })).toMatch(/capped at 4 a day/);
  });
});

describe("abuse controls — guarantee 8", () => {
  const base = { email: "owner@shop.com", emailVerified: true, freeStoresForDomain: 0, isAnonymousAudit: false, captchaPassed: true };
  it("passes a real verified owner", () => {
    expect(abuseCheck(base)).toEqual({ ok: true });
  });
  it("blocks disposable emails, unverified emails, a second free store, and anonymous audits without captcha", () => {
    expect(abuseCheck({ ...base, email: "x@mailinator.com" }).ok).toBe(false);
    expect(abuseCheck({ ...base, emailVerified: false }).ok).toBe(false);
    expect(abuseCheck({ ...base, freeStoresForDomain: 1 }).ok).toBe(false);
    expect(abuseCheck({ ...base, isAnonymousAudit: true, captchaPassed: false }).ok).toBe(false);
  });
});

describe("margin dashboard — guarantee 9", () => {
  const events = (over: Partial<UsageEvent> = {}): UsageEvent => ({
    id: "e1", userId: "u1", orgId: "o1", plan: "starter", feature: "chat", action: "chat",
    credits: 1.3, providerUsd: 0.013, billedUsd: 0, at: "2026-11-19T08:00:00.000Z", ...over,
  });
  it("aggregates provider cost by plan, feature and org", () => {
    const rows = marginBy(
      [events(), events({ id: "e2", feature: "ad-batch", action: "ad-batch", providerUsd: 0.132 })],
      "feature",
      { free: 0, starter: 29, growth: 59 },
    );
    expect(rows.find((r) => r.key === "chat")?.providerUsd).toBeCloseTo(0.013, 3);
    expect(rows.find((r) => r.key === "ad-batch")?.providerUsd).toBeCloseTo(0.132, 3);
  });
  it("alerts at 80% of allowance in the first half of the month, not the second", () => {
    expect(marginAlert({ providerUsdThisMonth: 2.4, allowanceUsd: 3, now: new Date("2026-11-10T00:00:00.000Z") })).toBe(true);
    expect(marginAlert({ providerUsdThisMonth: 2.4, allowanceUsd: 3, now: new Date("2026-11-20T00:00:00.000Z") })).toBe(false);
    expect(marginAlert({ providerUsdThisMonth: 2.39, allowanceUsd: 3, now: new Date("2026-11-10T00:00:00.000Z") })).toBe(false);
  });
});
