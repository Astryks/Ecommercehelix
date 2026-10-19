import { describe, expect, it } from "vitest";
import { dayExTax, dayTaxRate, effectiveTaxMode, exTax, productExTax, taxLabel, taxRate, toTaxMode, typedTaxLabel, typedTaxRate } from "@/lib/tax";
import { quickMerge, costRatios } from "@/lib/today";
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
  // Shopify's Gross sales report already leaves tax out (gross sales "does not include ... taxes"), so
  // the country default must not take GST off numbers typed or imported from it a second time.
  it("the country default never takes tax off typed Gross sales twice", () => {
    expect(dayTaxRate("auto", "AU", "manual")).toBe(0);
    expect(dayTaxRate("auto", "AU", "quick")).toBe(0);
    expect(dayTaxRate("auto", "AU", "csv")).toBe(0);
    expect(dayTaxRate("auto", "AU", undefined)).toBe(0);
    expect(typedTaxRate("auto", "GB")).toBe(0);
    expect(typedTaxLabel("auto", "AU")).toBe("");
    const typed = { ...exampleDays("2026-10-06")[0], source: "manual", revenue: 1000 };
    expect(dayExTax(typed, dayTaxRate("auto", "AU", typed.source)).revenue).toBe(1000);
  });
  it("the country default still takes tax off order prices (Shopify sync, orders export)", () => {
    expect(dayTaxRate("auto", "AU", "shopify")).toBe(0.1);
    expect(dayTaxRate("auto", "GB", "csv-orders")).toBe(0.2);
    expect(dayTaxRate("auto", "US", "shopify")).toBe(0);
  });
  it("an explicit Yes strips every day, an explicit No strips none", () => {
    expect(dayTaxRate("AU", "AU", "manual")).toBe(0.1);
    expect(typedTaxLabel("AU", "AU")).toBe("GST (10%)");
    expect(dayTaxRate("none", "AU", "shopify")).toBe(0);
  });
  it("typing sales over a synced day makes it a typed day", () => {
    const synced = { ...exampleDays("2026-10-06")[0], source: "shopify", example: false };
    const m = quickMerge(synced, synced.date, { revenue: 900, orders: 9, adMeta: 100, adGoogle: 0 }, costRatios([synced]));
    expect(dayTaxRate("auto", "AU", m.source)).toBe(0);
  });
});
