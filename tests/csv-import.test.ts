import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { detectSource, guessMapping, parseTable, rollUp, toYmd } from "@/lib/csv-import";

const load = (f: string) => parseTable(readFileSync(`tests/fixtures/${f}`, "utf8"));

describe("csv import", () => {
  it("Shopify orders export: one order per id, summed by day", () => {
    const [h, ...rows] = load("shopify-orders.csv");
    const s = detectSource(h);
    expect(s).toBe("shopify-orders");
    const days = rollUp(rows, guessMapping(h, s), s);
    expect(days).toEqual([
      { date: "2026-10-01", orders: 2, revenue: 1280, shipping: 15, discounts: 20, refunds: 0 },
      { date: "2026-10-02", orders: 1, revenue: 50.5, shipping: 0, discounts: 0, refunds: 10 },
    ]);
  });
  it("Meta ads export: spend and attributed sales by day", () => {
    const [h, ...rows] = load("meta-ads.csv");
    const s = detectSource(h);
    expect(s).toBe("meta");
    const days = rollUp(rows, guessMapping(h, s), s);
    expect(days).toEqual([{ date: "2026-10-01", adMeta: 50, metaRevenue: 200 }, { date: "2026-10-02", adMeta: 30, metaRevenue: 0 }]);
  });
  it("Shopify sales over time and dates", () => {
    const t = parseTable("Day,Orders,Gross sales,Discounts,Returns,Net sales,Total sales\n15/10/2026,3,$300.00,-10,0,290,300\n");
    const s = detectSource(t[0]);
    expect(s).toBe("shopify-sales");
    expect(rollUp(t.slice(1), guessMapping(t[0], s), s)[0]).toMatchObject({ date: "2026-10-15", orders: 3, revenue: 300 });
    expect(toYmd("10/15/2026")).toBe("2026-10-15");
  });
});
