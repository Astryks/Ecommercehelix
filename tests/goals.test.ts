import { describe, expect, it } from "vitest";
import { DEFAULT_GOALS, DEFAULT_MER, GOAL_KEYS, LADDER, actualsFrom, fmtGoal, goalsFromForm, impliedMonth, merFromForm, rateGoal, targetOf } from "@/lib/goals";
import { metricsFor } from "@/lib/analytics";
import { BANDS, MILESTONES } from "@/lib/audience";
import type { DayInput } from "@/lib/scorecard";

const step = (k: string) => LADDER.find((s) => s.key === k)!;

describe("goals ladder", () => {
  it("runs in funnel order and ends in net profit", () => {
    expect(LADDER.map((s) => s.key)).toEqual(["sessions", "ctrPct", "atcPct", "crPct", "aov", "mer", "cpa", "contributionPct", "netProfit"]);
    expect(LADDER.map((s) => s.stage)).toEqual(["attract", "attract", "convert", "convert", "convert", "grow", "grow", "grow", "grow"]);
    expect(LADDER.at(-1)?.good).toMatch(/This is the goal/);
  });
  it("uses the same benchmarks as the Dashboard", () => {
    expect(step("mer").good).toMatch(/between 20 and 35%/);
    expect(step("contributionPct").good).toMatch(/15% or more is healthy/);
    expect(step("netProfit").good).toMatch(/10 to 20% net/);
    expect(step("ctrPct").good).toMatch(/Under 0\.5%/);
    expect(step("atcPct").good).toMatch(/7\.5%/);
  });
  it("has suggested goals for each track that hang together", () => {
    for (const t of ["starting", "growing"] as const) {
      const g = DEFAULT_GOALS[t];
      expect(Object.keys(g).sort()).toEqual([...GOAL_KEYS].sort());
      // CPA target = what MER allows on one average order (within $1).
      expect(Math.abs(g.cpa - g.aov * (DEFAULT_MER[t] / 100))).toBeLessThanOrEqual(1);
    }
    const m = impliedMonth(DEFAULT_GOALS.growing, 30, 9000);
    expect(Math.round(m.revenue)).toBe(60720);
    expect(Math.round(m.netProfit)).toBe(3144);
    expect(m.roas).toBeCloseTo(3.33, 2);
  });
  it("reads goals from a form, keeping fallbacks for blank or bad fields", () => {
    const f = new FormData();
    f.set("sessions", "12,500"); f.set("crPct", "2.5%"); f.set("aov", "$110"); f.set("ctrPct", "abc"); f.set("atcPct", "250"); f.set("merPct", "28");
    const g = goalsFromForm(f, DEFAULT_GOALS.growing);
    expect(g.sessions).toBe(12500);
    expect(g.crPct).toBe(2.5);
    expect(g.aov).toBe(110);
    expect(g.ctrPct).toBe(DEFAULT_GOALS.growing.ctrPct);
    expect(g.atcPct).toBe(100);
    expect(merFromForm(f, 30)).toBe(28);
    expect(merFromForm(new FormData(), 35)).toBe(35);
  });
  it("rates actuals against targets, with lower-is-better for MER and CPA", () => {
    expect(rateGoal(step("crPct"), 2.3, 2.2)).toBe("green");
    expect(rateGoal(step("crPct"), 1.9, 2.2)).toBe("amber");
    expect(rateGoal(step("crPct"), 1.5, 2.2)).toBe("red");
    expect(rateGoal(step("mer"), 28, 30)).toBe("green");
    expect(rateGoal(step("cpa"), 34, 28)).toBe("red");
    expect(rateGoal(step("netProfit"), 500, 3000)).toBe("amber");
    expect(rateGoal(step("netProfit"), -1, 0)).toBe("red");
    expect(rateGoal(step("aov"), null, 90)).toBeNull();
    expect(targetOf(step("mer"), DEFAULT_GOALS.growing, 27)).toBe(27);
    expect(fmtGoal("money", 3144.4)).toBe("$3,144");
    expect(fmtGoal("pct", 2.2)).toBe("2.2%");
  });
  it("works out actuals from the daily numbers", () => {
    const day = (date: string): DayInput => ({ date, orders: 20, newCustomerOrders: 12, units: 30, sessions: 1000, revenue: 2000, newCustomerRevenue: 1200, discounts: 0, refunds: 0, cogs: 600, shipping: 100, paymentFees: 40, adMeta: 500, adGoogle: 0, adTiktok: 0, adOther: 0, otherMarketing: 0, metaRevenue: 1500, googleRevenue: 0, tiktokRevenue: 0 });
    const days = ["2026-10-01", "2026-10-02"].map(day);
    const m = metricsFor(days, { from: "2026-10-01", to: "2026-10-02" }, { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 0 });
    const a = actualsFrom(m, { ctrPct: 1.3 });
    expect(a.sessions).toBe(2000);
    expect(a.crPct).toBeCloseTo(2, 5);
    expect(a.aov).toBeCloseTo(100, 5);
    expect(a.mer).toBeCloseTo(25, 5);
    expect(a.cpa).toBeCloseTo(25, 5);
    expect(a.ctrPct).toBe(1.3);
    expect(a.atcPct).toBeNull();
  });
});

describe("who Helix is for", () => {
  it("has three bands from $0 to about $10M a year and the milestones between", () => {
    expect(BANDS.map((b) => b.name)).toEqual(["Just starting", "Growing", "Scaling"]);
    expect(BANDS[1].range).toBe("Up to about $1M a year");
    expect(BANDS[2].range).toBe("About $1M to $10M a year");
    expect(MILESTONES).toContain("First $100k month");
  });
});
