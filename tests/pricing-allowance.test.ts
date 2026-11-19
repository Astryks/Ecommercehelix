import { describe, expect, it } from "vitest";
import { UNIFIED_ALLOWANCE, countCeilingHit, countsLeft, effectiveMonthlyCredits } from "@/lib/pricing/allowance";

describe("unified allowance — the two counters, reconciled", () => {
  it("count ceilings are exactly the old ones — nothing raised or lowered", () => {
    // AI write-ups (src/lib/ai/config.ts AI_MONTHLY_CAP): 3 / 50 / 150.
    expect(UNIFIED_ALLOWANCE.free.writeUpCap).toBe(3);
    expect(UNIFIED_ALLOWANCE.starter.writeUpCap).toBe(50);
    expect(UNIFIED_ALLOWANCE.growth.writeUpCap).toBe(150);
    // Coach messages (src/lib/coach/config.ts COACH_LIMITS): 20 / 300 / 800, deep 0 / 40 / 100.
    expect(UNIFIED_ALLOWANCE.free.coachTotalCap).toBe(20);
    expect(UNIFIED_ALLOWANCE.starter.coachTotalCap).toBe(300);
    expect(UNIFIED_ALLOWANCE.growth.coachTotalCap).toBe(800);
    expect(UNIFIED_ALLOWANCE.free.coachDeepCap).toBe(0);
    expect(UNIFIED_ALLOWANCE.starter.coachDeepCap).toBe(40);
    expect(UNIFIED_ALLOWANCE.growth.coachDeepCap).toBe(100);
  });
  it("monthly credit caps are the dollar allowances in docs/pricing.md §4", () => {
    expect(UNIFIED_ALLOWANCE.free.monthlyCreditCap).toBe(60); // $0.60 hard cap
    expect(UNIFIED_ALLOWANCE.starter.monthlyCreditCap).toBe(300); // $3.00
    expect(UNIFIED_ALLOWANCE.growth.monthlyCreditCap).toBe(800); // $8.00
    expect(UNIFIED_ALLOWANCE.free.monthlyAllowanceUsd).toBe(0.6);
    expect(UNIFIED_ALLOWANCE.starter.monthlyAllowanceUsd).toBe(3.0);
    expect(UNIFIED_ALLOWANCE.growth.monthlyAllowanceUsd).toBe(8.0);
  });
  it("weekly grants are 0 / 60 / 180, Growth with 1-week grace", () => {
    expect(UNIFIED_ALLOWANCE.free.weeklyGrantCredits).toBe(0);
    expect(UNIFIED_ALLOWANCE.starter.weeklyGrantCredits).toBe(60);
    expect(UNIFIED_ALLOWANCE.growth.weeklyGrantCredits).toBe(180);
    expect(UNIFIED_ALLOWANCE.growth.graceWeeks).toBe(1);
    expect(UNIFIED_ALLOWANCE.starter.graceWeeks).toBe(0);
  });
  it("weekly expiry means the effective month is below the monthly ceiling (breakage, stated not hidden)", () => {
    expect(effectiveMonthlyCredits("free")).toBe(60);
    expect(effectiveMonthlyCredits("starter")).toBe(260); // 60 x 52/12, not 300
    expect(effectiveMonthlyCredits("growth")).toBe(780); // 180 x 52/12, not 800
  });
  it("each ceiling is individually reachable inside the credit pool", () => {
    // 300 fast coach messages x 0.2 credits = 60 credits — inside a Starter month.
    expect(300 * 0.2).toBeLessThanOrEqual(effectiveMonthlyCredits("starter"));
    // The typical Starter mix in docs/pricing.md §4 costs $2.48 = 248 credits.
    expect(248).toBeLessThanOrEqual(effectiveMonthlyCredits("starter"));
    // The typical Growth mix costs $5.78 = 578 credits.
    expect(578).toBeLessThanOrEqual(effectiveMonthlyCredits("growth"));
  });
  it("count ceilings name which one is hit", () => {
    expect(countCeilingHit("starter", { writeUps: 50, coachTotal: 0, coachDeep: 0 })).toBe("write-ups");
    expect(countCeilingHit("starter", { writeUps: 0, coachTotal: 300, coachDeep: 0 })).toBe("coach");
    expect(countCeilingHit("starter", { writeUps: 0, coachTotal: 0, coachDeep: 40 })).toBe("coach-deep");
    expect(countCeilingHit("starter", { writeUps: 49, coachTotal: 299, coachDeep: 39 })).toBeNull();
    expect(countsLeft("starter", { writeUps: 49, coachTotal: 299, coachDeep: 39 })).toEqual({ writeUps: 1, coachTotal: 1, coachDeep: 1 });
  });
});
