import { describe, expect, it } from "vitest";
import { reorderList, scaleBlockedByStock, marginCheck, cashForecast } from "@/lib/agent/stock-plan";
import { exampleStock, exampleSuppliers } from "@/lib/stock";
import { buyPlan } from "@/lib/tools/inventory";
import { forecast } from "@/lib/tools/forecast";
import { exampleDays, type Settings } from "@/lib/scorecard";

const TODAY = "2026-11-19";
const SETTINGS: Settings = { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 9000 };

describe("stock plan — reorder list", () => {
  it("lists only items that need ordering, with quantity, order-by date and stock-out date", () => {
    const list = reorderList(exampleStock(), exampleSuppliers(), TODAY);
    // The Weekend Bundle is out of stock with daily sales — it must be first.
    expect(list[0].sku).toBe("BUN-05");
    for (const l of list) {
      expect(l.orderQty).toBeGreaterThan(0);
      expect(l.orderBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(l.reorderPoint).toBeGreaterThan(0);
    }
  });

  it("flags low confidence when velocity is based on under 7 days of history", () => {
    const list = reorderList(exampleStock(), exampleSuppliers(), TODAY, "US", 3);
    expect(list.every((l) => l.lowConfidence)).toBe(true);
    expect(list[0].lowConfidenceReason).toContain("Low confidence");
  });

  it("blocks scaling a winner under 14 days of stock, and allows it above", () => {
    const items = exampleStock();
    expect(scaleBlockedByStock("BUN-05", items, exampleSuppliers(), TODAY).blocked).toBe(true);
    expect(scaleBlockedByStock("LIN-SH-01", items, exampleSuppliers(), TODAY).blocked).toBe(false);
  });
});

describe("margin-checked offers", () => {
  it("passes at 15%+ contribution and blocks below, with an override note", () => {
    expect(marginCheck({ contributionPctBefore: 22, contributionPctAfter: 18 }).ok).toBe(true);
    const blocked = marginCheck({ contributionPctBefore: 22, contributionPctAfter: 9 });
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toContain("15%");
    expect(blocked.reason).toContain("owner override");
  });
});

describe("13-week cash forecast", () => {
  it("returns 13 weeks, a lowest week, and its assumptions in plain words", () => {
    const days = exampleDays(TODAY).map((d) => ({ ...d, example: false }));
    const fc = forecast(days, SETTINGS, TODAY);
    const buys = buyPlan(exampleStock(), exampleSuppliers(), TODAY);
    const { plan, assumptions } = cashForecast(fc, buys, TODAY, { startBalance: 20000, floor: 2000, fixedMonthly: 9000 });
    expect(plan.weeks).toHaveLength(13);
    expect(plan.lowest).toBeDefined();
    expect(assumptions.length).toBeGreaterThanOrEqual(4);
    expect(assumptions.join(" ")).toContain("Opening balance");
  });
});
