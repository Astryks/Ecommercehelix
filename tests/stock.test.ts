import { describe, expect, it } from "vitest";
import { bfPlan, exampleStock, exampleSuppliers, landedCost, nextBlackFriday, stockAlerts, stockRow, stockRows, type StockItem } from "@/lib/stock";

const base: StockItem = { id: "a", sku: "A", name: "A", supplierId: null, unitCost: 10, freightPerUnit: 2, dutyPct: 5, otherPerUnit: 1, onHand: 140, onOrder: 0, dailySales: 2, leadTimeDays: 50, safetyDays: 14 };

describe("stock maths", () => {
  it("works out landed cost", () => {
    expect(landedCost(base)).toBe(13.5);
  });
  it("works out the reorder point, countdown and order-by date", () => {
    const r = stockRow(base, [], "2026-10-06");
    expect(r.reorderPoint).toBe(128);
    expect(r.daysLeft).toBe(70);
    expect(r.stockOutDate).toBe("2026-12-15");
    expect(r.daysUntilOrder).toBe(6);
    expect(r.orderBy).toBe("2026-10-12");
    expect(r.status).toBe("order-soon");
    // covers lead + safety + 60 days, minus stock
    expect(r.suggestedQty).toBe(2 * (50 + 14 + 60) - 140);
  });
  it("counts stock on order and respects the supplier minimum", () => {
    const sup = { ...exampleSuppliers()[0], id: "s", moq: 500, leadTimeDays: 30 };
    const r = stockRow({ ...base, supplierId: "s", leadTimeDays: null, onHand: 50, onOrder: 30 }, [sup], "2026-10-06");
    expect(r.leadTime).toBe(30);
    expect(r.status).toBe("order-now");
    expect(r.suggestedQty).toBe(500);
  });
  it("flags out of stock and ignores items with no sales", () => {
    expect(stockRow({ ...base, onHand: 0 }, [], "2026-10-06").status).toBe("out");
    expect(stockRow({ ...base, dailySales: 0 }, [], "2026-10-06").status).toBe("no-sales");
  });
  it("sorts the most urgent first and raises alerts from the example data", () => {
    const rows = stockRows(exampleStock(), exampleSuppliers(), "2026-10-06");
    expect(rows[0].status).toBe("out");
    expect(stockAlerts(rows).length).toBeGreaterThan(0);
    expect(rows.every((r, i) => i === 0 || ["out", "order-now", "order-soon", "ok", "no-sales"].indexOf(r.status) >= ["out", "order-now", "order-soon", "ok", "no-sales"].indexOf(rows[i - 1].status))).toBe(true);
  });
  it("plans Black Friday stock back from the date", () => {
    expect(nextBlackFriday("2026-10-06")).toMatchObject({ date: "2026-11-27", daysTo: 52, year: 2026 });
    expect(nextBlackFriday("2026-12-10").date).toBe("2027-11-26");
    const p = bfPlan(stockRow(base, [], "2026-10-06"), "2026-10-06");
    expect(p.lastOrder).toBe("2026-10-01");
    expect(p.daysToLastOrder).toBe(-5);
    expect(p.extraUnits).toBe(28);
    expect(p.taskId).toBe("season-black-friday-2026-stock");
  });
});
