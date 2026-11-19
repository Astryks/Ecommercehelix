import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ hasDb: false, prisma: {} }));
vi.mock("server-only", () => ({}));

import {
  authorize,
  buyPaygPack,
  emptyPricingState,
  ensureWeeklyGrant,
  grantPaygPack,
  isApprovalCovered,
  markApprovalCovered,
  pricingSummary,
  refundWallet,
  rollover,
  setAutoTopUp,
  settleReservation,
  topUpWallet,
  type PricingState,
} from "@/lib/pricing/store";

const state = (over: Partial<PricingState> = {}): PricingState => ({
  ...emptyPricingState(new Date("2026-11-19T08:00:00.000Z")),
  ...over,
});

describe("weekly grants — idempotent, expiring", () => {
  it("grants 60 credits on Starter once per week, never twice", () => {
    const once = ensureWeeklyGrant(state(), "starter", false, new Date("2026-11-19T08:00:00.000Z"));
    expect(once.buckets).toHaveLength(1);
    expect(once.buckets[0].remaining).toBe(60);
    expect(once.lastWeeklyGrantWeekKey).toBe("2026-11-16");
    const twice = ensureWeeklyGrant(once, "starter", false, new Date("2026-11-20T08:00:00.000Z"));
    expect(twice.buckets).toHaveLength(1);
    const nextWeek = ensureWeeklyGrant(twice, "starter", false, new Date("2026-11-23T08:00:00.000Z"));
    // Last week's bucket lapsed on Sunday night (no grace on Starter), so
    // there is still one bucket — this week's, not last week's.
    expect(nextWeek.buckets).toHaveLength(1);
    expect(nextWeek.buckets[0].id).toBe("wk-2026-11-23");
    expect(nextWeek.buckets[0].remaining).toBe(60);
  });
  it("Free gets no weekly grant", () => {
    const s = ensureWeeklyGrant(state(), "free", false, new Date("2026-11-19T08:00:00.000Z"));
    expect(s.buckets).toEqual([]);
  });
  it("the add-on adds 120 credits a week", () => {
    const s = ensureWeeklyGrant(state(), "starter", true, new Date("2026-11-19T08:00:00.000Z"));
    expect(s.buckets[0].credits).toBe(180);
  });
  it("rollover resets monthly and daily counters", () => {
    const s = rollover(
      state({ monthKey: "2026-10", creditsSpentThisMonth: 100, dayKey: "2026-10-31", deepChatsToday: 5 }),
      new Date("2026-11-01T08:00:00.000Z"),
    );
    expect(s.monthKey).toBe("2026-11");
    expect(s.creditsSpentThisMonth).toBe(0);
    expect(s.deepChatsToday).toBe(0);
  });
});

describe("wallet — prepaid only, balance never below zero", () => {
  it("accepts $10/$25/$50 top-ups and rejects anything else", () => {
    const ok = topUpWallet(state(), 25, { demo: true });
    expect("error" in ok).toBe(false);
    if (!("error" in ok)) expect(ok.state.walletBalanceUsd).toBe(25);
    expect("error" in topUpWallet(state(), 5, { demo: true })).toBe(true);
    expect("error" in topUpWallet(state(), 100, { demo: true })).toBe(true);
  });
  it("demo top-ups are labelled demo", () => {
    const r = topUpWallet(state(), 10, { demo: true });
    if ("error" in r) throw new Error("unexpected");
    expect(r.state.ledger[0].demo).toBe(true);
    expect(r.state.ledger[0].note).toMatch(/Demo credit/);
  });
  it("refunds only unused balance, never consumed AI", () => {
    const funded = topUpWallet(state(), 10, { demo: true });
    if ("error" in funded) throw new Error("unexpected");
    expect("error" in refundWallet(funded.state, 11)).toBe(true);
    const refunded = refundWallet(funded.state, 4);
    if ("error" in refunded) throw new Error("unexpected");
    expect(refunded.state.walletBalanceUsd).toBe(6);
    expect(refunded.state.ledger.at(-1)?.type).toBe("refund");
  });
});

describe("PAYG packs — $10 = 100 credits, 7-day expiry", () => {
  it("buys from the wallet balance", () => {
    const funded = topUpWallet(state(), 10, { demo: true });
    if ("error" in funded) throw new Error("unexpected");
    const bought = buyPaygPack(funded.state, "wallet", false, new Date("2026-11-19T08:00:00.000Z"));
    expect("error" in bought).toBe(false);
    if (!("error" in bought)) {
      expect(bought.state.walletBalanceUsd).toBe(0);
      expect(bought.bucket.remaining).toBe(100);
      expect(bought.bucket.expiresAt).toBe("2026-11-26T08:00:00.000Z");
    }
  });
  it("refuses when the wallet cannot cover $10, and refuses card without Stripe — never fakes a charge", () => {
    expect("error" in buyPaygPack(state(), "wallet", false)).toBe(true);
    expect("error" in buyPaygPack(state(), "card", false)).toBe(true);
  });
  it("a card-paid pack is granted without a wallet deduction (webhook path)", () => {
    const { state: next, bucket } = grantPaygPack(state(), "cs_test_123");
    expect(bucket.remaining).toBe(100);
    expect(next.walletBalanceUsd).toBe(0);
    expect(next.ledger[0].ref).toBe("cs_test_123");
  });
});

describe("auto top-up — off by default, opt-in with a ceiling", () => {
  it("is off until the owner turns it on", () => {
    expect(state().autoTopUp).toBeNull();
  });
  it("requires the ceiling to cover at least one top-up", () => {
    expect("error" in setAutoTopUp(state(), { enabled: true, amount: 25, ceilingUsd: 10 })).toBe(true);
    const ok = setAutoTopUp(state(), { enabled: true, amount: 25, ceilingUsd: 50 });
    expect("error" in ok).toBe(false);
    if (!("error" in ok)) {
      expect(ok.state.autoTopUp).toEqual({ enabled: true, amount: 25, ceilingUsd: 50, spentThisMonthUsd: 0 });
    }
    const off = setAutoTopUp(state(), null);
    expect("error" in off).toBe(false);
  });
});

describe("authorize + settle — reserve-then-charge end to end", () => {
  it("reserves from the weekly bucket and settles the real cost", () => {
    const granted = ensureWeeklyGrant(state(), "starter", false, new Date("2026-11-19T08:00:00.000Z"));
    const auth = authorize(granted, { action: "ad-batch", feature: "ads", plan: "starter", now: new Date("2026-11-19T08:00:00.000Z") });
    expect("reservation" in auth).toBe(true);
    if (!("reservation" in auth)) return;
    expect(auth.state.buckets[0].remaining).toBeCloseTo(46.8, 1); // 60 - 13.2 held
    const settled = settleReservation(auth.state, auth.reservation, 0.1, { userId: "u1", orgId: "u1", plan: "starter", feature: "ads" });
    expect(settled.creditsSpentThisMonth).toBe(10); // real $0.10, not the $0.132 reservation
    expect(settled.buckets[0].remaining).toBe(50); // 60 - 10 real; the 3.2 released credits went back to the bucket
    expect(settled.usageEvents).toHaveLength(1);
    expect(settled.usageEvents[0].action).toBe("ad-batch");
  });
  it("refuses with a plain-words reason when the pool is empty", () => {
    // Free pool is 60 credits; 50 spent leaves 10, a 16.5-credit flow draft does not fit.
    const auth = authorize(state({ freeSpentCredits: 50 }), { action: "flow-draft", feature: "email", plan: "free" });
    expect("error" in auth).toBe(true);
    if ("error" in auth) expect(auth.error).toMatch(/Free plan/);
  });
  it("marks approvals covered so the executor can run them", () => {
    const s = markApprovalCovered(state(), "flow-welcome", 16.5);
    expect(isApprovalCovered(s, "flow-welcome")).toBe(true);
    expect(isApprovalCovered(s, "flow-other")).toBe(false);
  });
  it("pricing summary shows the allowance the billing page renders", () => {
    const granted = ensureWeeklyGrant(state(), "growth", false, new Date("2026-11-19T08:00:00.000Z"));
    const summary = pricingSummary(granted, "growth");
    expect(summary.monthlyCap).toBe(800);
    expect(summary.creditsLeftThisWeek).toBe(180);
    expect(summary.walletBalanceUsd).toBe(0);
  });
});
