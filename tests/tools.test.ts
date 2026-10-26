import { describe, expect, it } from "vitest";
import { exampleDays, type Settings } from "@/lib/scorecard";
import { forecast, DEFAULT_SHAPE } from "@/lib/tools/forecast";
import { cashPlan } from "@/lib/tools/cash";
import { buyPlan, upliftFor } from "@/lib/tools/inventory";
import { customerValue } from "@/lib/tools/customers";
import { newCustomerCost } from "@/lib/tools/new-customer-cost";
import { productProfit } from "@/lib/tools/product-profit";
import { targets } from "@/lib/tools/targets";
import { band, guidesFor, sizeFor } from "@/lib/tools/benchmarks";
import { mondayReview } from "@/lib/tools/weekly-review";
import { adCheck } from "@/lib/tools/ad-check";
import { planToday } from "@/lib/today-tasks";

const today = "2026-10-15";
const s: Settings = { monthlyRevenueTarget: 50000, targetMerPct: 30, fixedCostsMonthly: 3000 };
const days = exampleDays(today, 400).map((d) => ({ ...d, example: false }));

describe("planning tools", () => {
  it("forecast: 12 months, goal split by season shape, ad budget at target MER", () => {
    const f = forecast(days, s, today, { yearGoal: 600000 });
    expect(f.months).toHaveLength(12);
    expect(f.months[0].month).toBe("2026-10");
    expect(Math.abs(f.yearSales - 600000)).toBeLessThan(20);
    expect(f.months[0].adBudget).toBe(Math.round(f.months[0].sales * 0.3));
    expect(f.months.find((m) => m.month === "2026-11")!.events.join()).toMatch(/Black Friday/);
    expect(forecast([], s, today).shapeFrom).toBe("default");
    expect(DEFAULT_SHAPE).toHaveLength(12);
  });
  it("cash plan flags the first week under the floor", () => {
    const f = forecast([], s, today);
    const c = cashPlan(f, [{ sku: "A", name: "A", onHand: 0, dailySales: 5, weeksCover: 0, daysCover: 0, orderBy: "2026-10-20", status: "order-now", uplift: 1, upliftReason: null, orderQty: 1000, cash: 40000, landed: 40 }], today, { startBalance: 20000, floor: 5000, fixedMonthly: 3000 });
    expect(c.weeks).toHaveLength(13);
    expect(c.firstLow?.start).toBe("2026-10-15");
    expect(c.weeks[0].stock).toBe(40000);
  });
  it("buy plan raises orders before Black Friday", () => {
    expect(upliftFor("2026-10-01", 30).uplift).toBeGreaterThan(1);
    const rows = buyPlan([{ id: "1", sku: "A", name: "Mug", supplierId: null, unitCost: 4, freightPerUnit: 1, dutyPct: 0, otherPerUnit: 0, onHand: 20, onOrder: 0, dailySales: 3, leadTimeDays: 30, safetyDays: 14 }], [], "2026-10-01");
    expect(rows[0].orderQty).toBeGreaterThan(0);
    expect(rows[0].cash).toBe(rows[0].orderQty * 5);
  });
  it("customer value and cohorts come from new vs returning orders", () => {
    const c = customerValue(days, s, today);
    expect(c.ordersPerCustomer).toBeGreaterThanOrEqual(1);
    expect(c.cohorts.length).toBeGreaterThanOrEqual(12);
    expect(c.value12m).toBeGreaterThan(0);
  });
  it("new customer ad cost has break-even above target and 12 weeks", () => {
    const n = newCustomerCost(days, s, today);
    expect(n.weeks).toHaveLength(12);
    expect(n.breakEven).toBeGreaterThan(n.target);
  });
  it("profit per product flags a loss maker", () => {
    const p = productProfit([{ date: today, sku: "A", name: "Good", units: 10, price: 50, unitCost: 10 }, { date: today, sku: "B", name: "Bad", units: 10, price: 12, unitCost: 12 }], null, 0, "2026-09-15");
    expect(p[0].sku).toBe("B");
    expect(p[0].flag).toBe("loss");
    expect(p[1].flag).toBe("ok");
  });
  it("targets: next sits between now and stretch", () => {
    const t = targets(days, s, today);
    const cr = t.find((x) => x.id === "cr")!;
    if (cr.current !== null && cr.current < cr.stretch) { expect(cr.next).toBeGreaterThan(cr.current); expect(cr.next).toBeLessThanOrEqual(cr.stretch); }
    const mer = t.find((x) => x.id === "mer")!;
    if (mer.current !== null && mer.current > mer.stretch) expect(mer.next).toBeLessThan(mer.current);
  });
  it("benchmarks: size from sales, bands both directions", () => {
    expect(sizeFor(5000)).toBe("starting");
    expect(sizeFor(20000)).toBe("growing");
    expect(sizeFor(50000)).toBe("scaling");
    const g = guidesFor("growing", "beauty").guides;
    expect(band(3.6, g.find((x) => x.id === "cr")!)).toBe("great");
    expect(band(40, g.find((x) => x.id === "mer")!)).toBe("low");
    expect(guidesFor("starting", "other").guides.find((x) => x.id === "mer")!.good).toBe(30);
  });
  it("Monday review pre-fills five numbers and flags the worst", () => {
    const base = exampleDays("2026-10-11", 14).map((d) => ({ ...d, example: false }));
    const bad = base.map((d) => (d.date >= "2026-10-05" ? { ...d, revenue: d.revenue * 0.5, newCustomerRevenue: d.newCustomerRevenue * 0.5 } : d));
    const r = mondayReview(bad, s, "2026-10-12");
    expect(r.numbers.map((n) => n.id)).toEqual(["sales", "profit", "orders", "mer", "cr"]);
    expect(r.worst).not.toBeNull();
    expect(r.fixes.length).toBeGreaterThan(0);
  });
  it("ad check gives at most 3 fixes, worst first", () => {
    const a = adCheck(days, { ...s, targetMerPct: 5 }, today, { metaConnected: true, googleConnected: false, pixel: false, frequency: 4.2, ctr: 0.5, cpa: 80, campaigns: 9, activeAds: null, spend30: 1000 }, 40);
    expect(a.fixes).toHaveLength(3);
    expect(a.items.find((i) => i.id === "tracking")!.grade).toBe("fail");
    expect(adCheck([], s, today, { metaConnected: false, googleConnected: false, pixel: false, frequency: null, ctr: null, cpa: null, campaigns: 0, activeAds: null, spend30: 0 }, null).fixes[0].id).toBe("connected");
  });
  it("Today puts the Monday review and alerts in Main focus and stays short", () => {
    const p = planToday({ date: "2026-10-12", done: new Set(), hasTodayNumbers: false, day: null, insight: null, season: [], flows: [], hasAds: true, review: { saved: false, worst: "Sales" }, alerts: [{ key: "cash-x", kind: "cash", title: "Cash gets tight", why: "w", href: "/dashboard/numbers/cash" }] } as never);
    const main = p.blocks.find((b) => b.id === "main")!;
    expect(main.tasks[0].title).toMatch(/Monday review/);
    expect(main.tasks[1].tag).toBe("Cash");
    expect(p.total).toBeLessThanOrEqual(7);
  });
});
