import { describe, expect, it } from "vitest";
import { buckets, change, costBreakdown, metricsFor, periodRanges, rateCpa, rateMer, rateRoas, seriesFor } from "@/lib/analytics";
import { metricCards } from "@/lib/metric-info";
import { exampleDays, sum, type DayInput, type Settings } from "@/lib/scorecard";

const S: Settings = { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 9000 };
const day = (date: string, o: Partial<DayInput> = {}): DayInput => ({ ...sum([]), date, ...o });

describe("periods", () => {
  it("builds week, month, YTD and last-12-month ranges with comparisons", () => {
    expect(periodRanges("week", "2026-10-05")).toMatchObject({ cur: { from: "2026-09-29", to: "2026-10-05" }, prev: { from: "2026-09-22", to: "2026-09-28" } });
    expect(periodRanges("month", "2026-10-05").cur.from).toBe("2026-09-06");
    expect(periodRanges("ytd", "2026-10-05")).toMatchObject({ cur: { from: "2026-01-01" }, prev: { from: "2025-01-01", to: "2025-10-05" } });
    expect(periodRanges("l12m", "2026-10-05")).toMatchObject({ cur: { from: "2025-10-06" }, prev: { from: "2024-10-06", to: "2025-10-05" } });
  });
  it("uses weekly buckets for week/month and monthly buckets for year views", () => {
    expect(buckets("week", "2026-10-05")).toHaveLength(12);
    expect(buckets("month", "2026-10-05")).toHaveLength(13);
    const ytd = buckets("ytd", "2026-10-05");
    expect(ytd.map((b) => b.label)).toEqual(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]);
    expect(ytd.at(-1)).toMatchObject({ from: "2026-10-01", to: "2026-10-05" });
    const l12 = buckets("l12m", "2026-10-05");
    expect(l12[0].from).toBe("2025-10-06");
    expect(l12).toHaveLength(13);
  });
});

describe("metrics", () => {
  // $1,000 sales, $300 product, $100 shipping, $30 fees, $200 Meta for $700 Meta-reported sales
  const days = [day("2026-10-05", { revenue: 1000, orders: 10, newCustomerOrders: 6, newCustomerRevenue: 600, cogs: 300, shipping: 100, paymentFees: 30, adMeta: 200, metaRevenue: 700, refunds: 0 })];
  const m = metricsFor(days, { from: "2026-10-05", to: "2026-10-05" }, S);
  it("works out break-even from the user's own margin", () => {
    expect(m.grossMarginPct).toBeCloseTo(70);
    expect(m.marginBeforeAds).toBeCloseTo(0.57);
    expect(m.breakEvenRoas).toBeCloseTo(1 / 0.57);
    expect(m.simpleBreakEvenRoas).toBeCloseTo(1 / 0.7);
    expect(m.breakEvenCpa).toBeCloseTo(57);
    expect(m.breakEvenMerPct).toBeCloseTo(57);
  });
  it("computes profit, MER, CAC and cost per order with no manual maths", () => {
    expect(m.contribution).toBe(370);
    expect(m.netProfit).toBeCloseTo(370 - 9000 / 30.4);
    expect(m.merPct).toBeCloseTo(20);
    expect(m.blendedRoas).toBeCloseTo(5);
    expect(m.roasMeta).toBeCloseTo(3.5);
    expect(m.blendedCac).toBeCloseTo(200 / 6);
    expect(m.aCpa).toBeCloseTo(20);
    expect(m.newSharePct).toBeCloseTo(60);
    expect(costBreakdown(m).map((c) => c.name)).toContain("Fixed costs (share)");
  });
  it("rates against break-even lines", () => {
    expect(rateRoas(2.2, 1.75)).toBe("green");
    expect(rateRoas(1.9, 1.75)).toBe("amber");
    expect(rateRoas(1.5, 1.75)).toBe("red");
    expect(rateCpa(40, 57)).toBe("green");
    expect(rateCpa(60, 57)).toBe("red");
    expect(rateMer(25, 30, 57)).toBe("green");
    expect(rateMer(40, 30, 57)).toBe("amber");
    expect(rateMer(60, 30, 57)).toBe("red");
    expect(change(110, 100)).toBeCloseTo(10);
    expect(change(5, 0)).toBeNull();
  });
  it("explains every card in plain words with the user's numbers", () => {
    const cards = metricCards(m, null, S);
    const keys = cards.map((c) => c.key);
    for (const k of ["revenue", "orders", "aov", "cogs", "grossMargin", "adSpend", "roasMeta", "mer", "cac", "cpo", "beRoas", "beCpa", "contribution", "netProfit", "newReturning", "refunds"]) expect(keys).toContain(k);
    const be = cards.find((c) => c.key === "beRoas")!;
    expect(be.info.how).toContain("1 ÷ 0.57 = 1.75x");
    for (const c of cards) for (const t of [c.info.what, c.info.how, c.info.good]) expect(t).not.toMatch(/\u2014/);
  });
});

describe("example data", () => {
  const ex = exampleDays("2026-10-06");
  it("seeds two years of labelled example days so year views can compare", () => {
    expect(ex).toHaveLength(730);
    expect(ex.every((d) => d.example)).toBe(true);
    expect(ex.at(-1)?.date).toBe("2026-10-05");
  });
  it("shows a Black Friday peak and growth over time", () => {
    const bf = ex.find((d) => d.date === "2025-11-28")!;
    const normal = ex.find((d) => d.date === "2025-10-28")!;
    expect(bf.revenue).toBeGreaterThan(normal.revenue * 2);
    const s = seriesFor(ex, "l12m", "2026-10-05", S);
    expect(s.every((r) => r.prevContribution !== null)).toBe(true);
  });
});
