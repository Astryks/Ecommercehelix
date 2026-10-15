import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { detectSource, guessMapping, parseTable, parseNum, rollUp, rollUpReport, toYmd } from "@/lib/csv-import";

const load = (f: string) => parseTable(readFileSync(`tests/fixtures/${f}`, "utf8"));

describe("csv import", () => {
  it("Shopify orders export: one order per id, summed by day", () => {
    const [h, ...rows] = load("shopify-orders.csv");
    const s = detectSource(h);
    expect(s).toBe("shopify-orders");
    const days = rollUp(rows, guessMapping(h, s), s);
    expect(days).toEqual([
      { date: "2026-10-01", orders: 2, revenue: 1280, discounts: 20, refunds: 0 },
      { date: "2026-10-02", orders: 1, revenue: 50.5, discounts: 0, refunds: 10 },
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
  it("dates in words keep their day in any time zone", () => {
    expect(toYmd("Oct 11 2026")).toBe("2026-10-11");
    expect(toYmd("October 1, 2026")).toBe("2026-10-01");
  });
  it("blank cells are skipped, not saved as 0", () => {
    const t = parseTable('Day,Orders,Gross sales,Discounts,Returns,Net sales,Total sales\n2026-10-09,,"$1,986.50",,"($45.00)",x,\n');
    const s = detectSource(t[0]);
    const d = rollUp(t.slice(1), guessMapping(t[0], s), s)[0];
    expect(d).toEqual({ date: "2026-10-09", revenue: 1986.5, refunds: 45 });
    expect(parseNum("")).toBeNull();
    expect(parseNum("-")).toBeNull();
    expect(parseNum(" $1,234.50 ")).toBe(1234.5);
    expect(parseNum("-$84.00")).toBe(-84);
  });
  it("Shopify shipping charges are not counted as a shipping cost", () => {
    const h = ["Day", "Orders", "Gross sales", "Net sales", "Shipping charges"];
    expect(guessMapping(h, detectSource(h))).not.toContain("shipping");
    expect(guessMapping(["Day", "Shipping cost"], "generic")).toContain("shipping");
  });
  it("flags rows with no date or a date it cannot read, and skips totals quietly", () => {
    const t = parseTable("Day,Orders,Gross sales\n2026-10-08,1,10\n,2,20\nsoon,3,30\nTotal,6,60\n");
    const s = detectSource(["Day", "Orders", "Gross sales", "Net sales"]);
    const r = rollUpReport(t.slice(1), guessMapping(t[0], s), s);
    expect(r.days).toHaveLength(1);
    expect(r.skipped.map((x) => [x.line, x.reason])).toEqual([[3, "No date"], [4, 'We could not read the date "soon"']]);
  });
});
