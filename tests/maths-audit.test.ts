import { describe, it, expect } from "vitest";
import { waterfall, EXAMPLE_INPUTS, marketingGuide } from "@/lib/profit-setup";
import { metricsFor, periodRanges, rateRoas, change } from "@/lib/analytics";
import { sum, type DayInput } from "@/lib/scorecard";

const day = (date: string, o: Partial<DayInput> = {}): DayInput => ({ ...sum([]), date, ...o });

describe("profit waterfall", () => {
  const w = waterfall(EXAMPLE_INPUTS);
  it("layers step down from sales to net profit, and costs add up", () => {
    const costs = w.layers.reduce((a, l) => a + l.cost, 0);
    expect(w.netPerOrder).toBeCloseTo(w.sales - costs, 2);
    expect(w.layers.at(-1)!.left).toBe(w.netPerOrder);
    for (let k = 1; k < w.layers.length; k++) expect(w.layers[k].left).toBeLessThanOrEqual(w.layers[k - 1].left);
  });
  it("worked $60 example", () => {
    expect(w.fees).toBe(1.35); // 60 * 1.75% + 0.30
    expect(w.landed).toBe(15);
    expect(w.beforeMarketing).toBe(33.15);
    expect(w.contribution).toBe(18.15);
    expect(w.breakEvenCpa).toBe(33.15);
    expect(w.breakEvenRoas).toBeCloseTo(60 / 33.15, 6);
    expect(w.month.net).toBeCloseTo(3050, 2);
  });
  it("no orders means no fixed share and no divide by zero", () => {
    const z = waterfall({ ...EXAMPLE_INPUTS, ordersPerMonth: 0, price: 0 });
    expect(Number.isFinite(z.netMarginPct)).toBe(true);
    expect(z.breakEvenRoas).toBe(0);
  });
  it("marketing band boundaries", () => {
    expect(marketingGuide(4999).stage).toBe("pre");
    expect(marketingGuide(5000).stage).toBe("growing");
    expect(marketingGuide(80000).stage).toBe("scaling");
  });
});

describe("dashboard metrics", () => {
  const s = { monthlyRevenueTarget: 0, targetMerPct: 20, fixedCostsMonthly: 304 };
  const days = [
    day("2026-10-01", { revenue: 1000, discounts: 50, refunds: 50, orders: 10, cogs: 300, shipping: 100, paymentFees: 20, adMeta: 200 }),
    day("2026-10-02", { revenue: 1000, orders: 10, cogs: 300, shipping: 100, paymentFees: 20, adMeta: 200, otherMarketing: 80 }),
    day("2026-09-01", { revenue: 99999 }),
  ];
  const m = metricsFor(days, { from: "2026-10-01", to: "2026-10-02" }, s);
  it("aggregates only days in range", () => {
    expect(m.dataDays).toBe(2);
    expect(m.netRevenue).toBe(1900);
  });
  it("ROAS, marketing % of sales, contribution and net", () => {
    expect(m.blendedRoas).toBeCloseTo(1900 / 400, 6);
    expect(m.merPct).toBeCloseTo((400 / 1900) * 100, 6);
    expect(m.contribution).toBe(1900 - 840 - 400 - 80);
    expect(m.netProfit).toBeCloseTo(m.contribution - 20, 6); // 304/30.4 * 2 days
  });
  it("week, month and YTD ranges", () => {
    expect(periodRanges("week", "2026-10-13").cur).toEqual({ from: "2026-10-07", to: "2026-10-13" });
    expect(periodRanges("month", "2026-10-13").prev).toEqual({ from: "2026-08-15", to: "2026-09-13" });
    expect(periodRanges("ytd", "2026-10-13").prev).toEqual({ from: "2025-01-01", to: "2025-10-13" });
  });
  it("ratings and change", () => {
    expect(rateRoas(2.4, 2)).toBe("green");
    expect(rateRoas(1.9, 2)).toBe("red");
    expect(change(110, 100)).toBeCloseTo(10);
    expect(change(5, 0)).toBeNull();
  });
});
