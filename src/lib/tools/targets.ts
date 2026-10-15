/** Current, next and stretch target per metric. Next is a realistic step from today; stretch is the "great" guide. Recalculated from data every day. */
import type { DayInput, Settings } from "../scorecard";
import { guidesFor, sizeFor, type Category, type Guide, type MetricId } from "./benchmarks";
import { lastNDays, real, stats } from "./common";

export type Target = { id: MetricId; name: string; unit: "%" | "$"; current: number | null; next: number; stretch: number; gapToNext: number | null; higherIsBetter: boolean; guide: Guide };

export function metricValues(days: DayInput[], s: Settings, today: string): Record<MetricId, number | null> & { monthlySales: number } {
  const d = lastNDays(real(days), today, 30);
  const { t, x } = stats(d, s);
  const has = d.length > 0 && x.netRevenue > 0;
  return {
    cr: t.sessions ? (t.orders / t.sessions) * 100 : null,
    aov: t.orders ? x.netRevenue / t.orders : null,
    repeat: t.orders ? ((t.orders - t.newCustomerOrders) / t.orders) * 100 : null,
    mer: has ? x.merPct : null,
    contribution: has ? x.contributionPct : null,
    net: has ? (x.netProfit / x.netRevenue) * 100 : null,
    monthlySales: d.length ? (x.netRevenue / d.length) * 30.4 : 0,
  };
}

const step = (g: Guide, cur: number) => {
  // A tenth better, at least a small fixed step, never past the "great" guide.
  const s = g.unit === "$" ? Math.max(5, cur * 0.1) : Math.max(g.id === "cr" ? 0.3 : 2, Math.abs(cur) * 0.1);
  return g.higherIsBetter ? Math.min(Math.max(cur + s, Math.min(g.good, cur + s * 2)), g.great) : Math.max(Math.min(cur - s, Math.max(g.good, cur - s * 2)), g.great);
};

export function targets(days: DayInput[], s: Settings, today: string, cat: Category = "other"): Target[] {
  const v = metricValues(days, s, today);
  const { guides } = guidesFor(sizeFor(v.monthlySales), cat);
  return guides.map((g) => {
    const cur = v[g.id];
    const next = Math.round((cur === null ? g.good : step(g, cur)) * 10) / 10;
    return { id: g.id, name: g.name, unit: g.unit, current: cur === null ? null : Math.round(cur * 10) / 10, next, stretch: g.great, gapToNext: cur === null ? null : Math.round((next - cur) * 10) / 10, higherIsBetter: g.higherIsBetter, guide: g };
  });
}
