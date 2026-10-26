import { describe, expect, it } from "vitest";
import { metricsFor } from "@/lib/analytics";
import { keyMetrics, splitBySource } from "@/lib/key-metrics";
import { exampleDays } from "@/lib/scorecard";

const S = { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 9000 };
const days = exampleDays("2026-10-05");
const m = metricsFor(days, { from: "2026-09-28", to: "2026-10-04" }, S);
const p = metricsFor(days, { from: "2026-09-21", to: "2026-09-27" }, S);

describe("key metrics panel", () => {
  it("covers all 18 key metrics with a benchmark and a source", () => {
    const list = keyMetrics(m, p, { settings: S, metaConnected: false, metaSynced: false, metaCtr: null, shopifyConnected: false });
    expect(list.map((k) => k.id)).toEqual(["sessions", "ctr", "atc", "cr", "aov", "revenue", "adspend", "roas", "cpa", "cogs", "shipping", "fees", "contribution", "profit", "newcac", "returning", "refunds", "abandon"]);
    for (const k of list) expect(k.good.length, k.id).toBeGreaterThan(5);
  });

  it("splits into manual, automatic and automatic once connected", () => {
    const list = keyMetrics(m, p, { settings: S, metaConnected: false, metaSynced: false, metaCtr: null, shopifyConnected: false });
    const s = splitBySource(list);
    expect(s.manual.map((k) => k.id)).toEqual(["sessions", "atc", "revenue", "cogs", "shipping"]);
    expect(s.connect.map((k) => k.id)).toEqual(["ctr", "adspend"]);
    expect(s.auto.map((k) => k.id)).toEqual(["cr", "aov", "roas", "cpa", "fees", "contribution", "profit", "newcac", "returning", "refunds", "abandon"]);
    expect(list.find((k) => k.id === "ctr")!.tone).toBe("none");
  });

  it("rates CTR once Meta is connected and add-to-cart from the new field", () => {
    const list = keyMetrics(m, p, { settings: S, metaConnected: true, metaSynced: true, metaCtr: 1.4, shopifyConnected: false });
    expect(list.find((k) => k.id === "ctr")!.tone).toBe("green");
    expect(list.find((k) => k.id === "atc")!.raw).toBeGreaterThan(5);
  });

  it("works out the extra numbers from the basics", () => {
    const list = keyMetrics(m, p, { settings: S, metaConnected: false, metaSynced: false, metaCtr: null, shopifyConnected: false });
    const get = (id: string) => list.find((k) => k.id === id)!;
    expect(get("contribution").plain).toMatch(/You kept \$/);
    expect(get("newcac").raw).toBeCloseTo(m.adSpend / m.t.newCustomerOrders, 6);
    expect(get("refunds").raw).toBeCloseTo((m.t.refunds / m.t.revenue) * 100, 6);
    if (m.t.addToCarts) expect(get("abandon").raw).toBeCloseTo((1 - m.orders / m.t.addToCarts) * 100, 6);
  });
});
