import { describe, expect, it } from "vitest";
import { changeOf, comparison, growthBuckets, growthSeries, marginBand, plainLine, totalsFor, trendLine, yearToDate } from "@/lib/growth";
import { exampleDays } from "@/lib/scorecard";

const S = { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 9000 };
const days = exampleDays("2026-10-05");

describe("growth dashboard", () => {
  it("builds buckets for each grain", () => {
    expect(growthBuckets("day", "2026-10-05")).toHaveLength(30);
    const w = growthBuckets("week", "2026-10-05");
    expect(w).toHaveLength(12);
    expect(w.at(-1)).toMatchObject({ from: "2026-09-29", to: "2026-10-05" });
    const m = growthBuckets("month", "2026-10-05");
    expect(m.at(-1)).toMatchObject({ from: "2026-10-01", to: "2026-10-05", partial: true });
    expect(m[0].from).toBe("2025-11-01");
    const y = growthBuckets("year", "2026-10-05", "2024-10-06");
    expect(y.map((b) => b.label)).toEqual(["2024", "2025", "2026 so far"]);
  });

  it("compares like with like", () => {
    expect(comparison("month", "2026-03-31").prev).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(comparison("year", "2026-10-05").prev).toEqual({ from: "2025-01-01", to: "2025-10-05" });
    expect(comparison("day", "2026-10-05").prev).toEqual({ from: "2026-09-28", to: "2026-09-28" });
  });

  it("revenue minus costs equals profit", () => {
    const t = totalsFor(days, { from: "2026-09-01", to: "2026-09-30" }, S);
    expect(t.revenue - t.costs).toBeCloseTo(t.profit, 6);
    expect(t.dataDays).toBe(30);
  });

  it("writes plain-English changes", () => {
    expect(plainLine("Profit", changeOf(1120, 1000), "last week")).toBe("Profit is up 12% on last week ($120 more).");
    expect(plainLine("Revenue", changeOf(900, 1000), "last week")).toBe("Revenue is down 10% on last week ($100 less).");
    expect(plainLine("Profit", changeOf(1000, 1000), "last week")).toBe("Profit is flat on last week.");
    expect(plainLine("Profit", changeOf(500, -200), "last week")).toBe("Profit is up on last week ($700 more).");
    expect(changeOf(2000, 10).pct).toBeNull();
  });

  it("fits a trend line and bands margins", () => {
    expect(trendLine([1, 2, 3])).toEqual([1, 2, 3]);
    expect(trendLine([null, 5])).toEqual([null, null]);
    expect(marginBand(-3).tone).toBe("red");
    expect(marginBand(14).label).toMatch(/Healthy/);
  });

  it("works out year to date with the same dates last year", () => {
    const y = yearToDate(days, "2026-10-05", S);
    expect(y.hasPrev).toBe(true);
    expect(y.cur.dataDays).toBeGreaterThan(270);
    expect(growthSeries(days, "month", "2026-10-05", S).every((p) => p.trend !== null)).toBe(true);
  });
});
