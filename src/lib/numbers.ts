import { derive, type DayInput, type Settings } from "./scorecard";
import { addDays } from "./dates";

/** One day on the Numbers screen, ready to draw. All money in the store's currency. */
export type NumbersDay = {
  date: string;
  hasData: boolean;
  revenue: number; // sales after discounts and refunds
  orders: number;
  cogs: number;
  cogsEstimated: boolean;
  adSpend: number;
  adMeta: number;
  adGoogle: number;
  shipping: number;
  fees: number;
  other: number;
  profit: number;
  marginPct: number;
  roas: number;
  merPct: number;
  costPerOrder: number;
  breakEvenRoas: number;
  fromShopify: boolean;
};

/**
 * Days for the chart, oldest first, with gaps filled as empty days.
 * When a day has units but no product cost, cost of goods is unit cost x units (set once in Profit setup).
 * Profit here is the day's contribution: sales minus product cost, shipping, fees, ads and other marketing.
 */
export function numbersDays(days: DayInput[], settings: Settings, lastDay: string, count: number, unitCost = 0): NumbersDay[] {
  const by = new Map(days.map((d) => [d.date, d]));
  const out: NumbersDay[] = [];
  for (let k = count - 1; k >= 0; k--) {
    const date = addDays(lastDay, -k);
    const raw = by.get(date);
    if (!raw) {
      out.push({ date, hasData: false, revenue: 0, orders: 0, cogs: 0, cogsEstimated: false, adSpend: 0, adMeta: 0, adGoogle: 0, shipping: 0, fees: 0, other: 0, profit: 0, marginPct: 0, roas: 0, merPct: 0, costPerOrder: 0, breakEvenRoas: 0, fromShopify: false });
      continue;
    }
    const cogsEstimated = !raw.cogs && unitCost > 0 && raw.units > 0;
    const d = cogsEstimated ? { ...raw, cogs: Math.round(unitCost * raw.units * 100) / 100 } : raw;
    const x = derive(d, settings, 1);
    out.push({
      date, hasData: true,
      revenue: x.netRevenue, orders: d.orders, cogs: d.cogs, cogsEstimated,
      adSpend: x.adSpend, adMeta: d.adMeta, adGoogle: d.adGoogle,
      shipping: d.shipping, fees: d.paymentFees, other: d.otherMarketing,
      profit: x.contribution, marginPct: x.contributionPct,
      roas: x.adSpend ? x.netRevenue / x.adSpend : 0, merPct: x.merPct,
      costPerOrder: x.aCpa, breakEvenRoas: x.breakEvenRoas,
      fromShopify: d.source === "shopify",
    });
  }
  return out;
}

export function totals(rows: NumbersDay[]) {
  const t = rows.reduce((a, r) => ({ revenue: a.revenue + r.revenue, profit: a.profit + r.profit, orders: a.orders + r.orders, adSpend: a.adSpend + r.adSpend }), { revenue: 0, profit: 0, orders: 0, adSpend: 0 });
  return { ...t, marginPct: t.revenue ? (t.profit / t.revenue) * 100 : 0, roas: t.adSpend ? t.revenue / t.adSpend : 0 };
}
