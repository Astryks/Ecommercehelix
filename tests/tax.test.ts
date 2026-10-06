import { describe, expect, it } from "vitest";
import { dayExTax, effectiveTaxMode, exTax, productExTax, taxLabel, taxRate, toTaxMode } from "@/lib/tax";
import { derive, exampleDays } from "@/lib/scorecard";

describe("prices include GST/VAT", () => {
  it("defaults by country", () => {
    expect(effectiveTaxMode("auto", "AU")).toBe("AU");
    expect(effectiveTaxMode("auto", "US")).toBe("none");
    expect(taxRate("auto", "AU")).toBe(0.1);
    expect(taxRate("auto", "US")).toBe(0);
  });
  it("an explicit choice beats the country", () => {
    expect(taxRate("NZ", "AU")).toBe(0.15);
    expect(taxRate("UK", "US")).toBe(0.2);
    expect(taxRate("none", "AU")).toBe(0);
    expect(taxLabel("UK", "AU")).toBe("VAT (20%)");
    expect(taxLabel("none", "AU")).toBe("");
    expect(toTaxMode("bogus")).toBe("auto");
  });
  it("strips tax from sales, not from costs", () => {
    expect(exTax(110, 0.1)).toBe(100);
    expect(exTax(115, 0.15)).toBe(100);
    expect(exTax(120, 0.2)).toBe(100);
    const d = { ...exampleDays("2026-10-06")[0], revenue: 1100, discounts: 110, refunds: 0, cogs: 300, adMeta: 200, metaRevenue: 550 };
    const n = dayExTax(d, 0.1);
    expect(n.revenue).toBe(1000);
    expect(n.discounts).toBe(100);
    expect(n.metaRevenue).toBe(500);
    expect(n.cogs).toBe(300);
    expect(n.adMeta).toBe(200);
    expect(n.orders).toBe(d.orders);
    expect(dayExTax(d, 0)).toBe(d);
  });
  it("lowers profit by exactly the tax collected", () => {
    const s = { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 0 };
    const d = { ...exampleDays("2026-10-06")[0], revenue: 1100, discounts: 0, refunds: 0 };
    const gap = derive(d, s).contribution - derive(dayExTax(d, 0.1), s).contribution;
    expect(Math.round(gap)).toBe(100);
  });
  it("strips product prices", () => {
    expect(productExTax({ date: "2026-10-06", sku: "A", name: "A", units: 1, price: 55, unitCost: 10 }, 0.1).price).toBe(50);
  });
});
