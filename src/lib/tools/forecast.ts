/** Forecast and budget planner: a year of monthly sales, ad budget, orders and profit. */
import type { DayInput, Settings } from "../scorecard";
import { CAL_EVENTS } from "../season-calendar";
import { marginBeforeAds, real, stats, lastNDays } from "./common";

/** A plain retail shape by month (1.0 = an average month), used until a store has a year of its own history. */
export const DEFAULT_SHAPE = [0.85, 0.8, 0.9, 0.9, 1.0, 0.95, 0.9, 0.9, 0.95, 1.05, 1.45, 1.35];

export type ForecastMonth = { month: string; label: string; sales: number; adBudget: number; orders: number; profit: number; events: string[] };
export type Forecast = { months: ForecastMonth[]; yearSales: number; yearAds: number; yearProfit: number; source: "goal" | "history" | "default"; shapeFrom: "history" | "default"; aov: number; margin: number; mer: number };

const LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Month shape from the store's own last 12 months when it has 10+ months of data; otherwise the default shape. */
export function monthShape(days: DayInput[]): { shape: number[]; from: "history" | "default" } {
  const by = new Array(12).fill(0), seen = new Set<string>();
  for (const d of real(days)) { by[Number(d.date.slice(5, 7)) - 1] += d.revenue; seen.add(d.date.slice(0, 7)); }
  if (seen.size < 10) return { shape: DEFAULT_SHAPE, from: "default" };
  const avg = by.reduce((a, b) => a + b, 0) / 12;
  return { shape: by.map((v) => (avg ? Math.max(0.3, v / avg) : 1)), from: "history" };
}

export function forecast(days: DayInput[], s: Settings, today: string, opts: { yearGoal?: number | null } = {}): Forecast {
  const recent = lastNDays(real(days), today, 90);
  const st = stats(recent, s);
  const aov = st.t.orders ? st.x.netRevenue / st.t.orders : 60;
  const margin = marginBeforeAds(recent, s);
  const mer = Math.max(0.05, Math.min(0.8, s.targetMerPct / 100));
  const { shape, from } = monthShape(days);
  const runRate = st.days ? (st.x.netRevenue / st.days) * 30.4 : 0;
  const curMonth = Number(today.slice(5, 7)) - 1;
  // Base month: the yearly goal / 12, or this store's run rate taken back to an average month, or the monthly target.
  const base = opts.yearGoal ? opts.yearGoal / 12 : runRate ? runRate / shape[curMonth] : s.monthlyRevenueTarget;
  const source: Forecast["source"] = opts.yearGoal ? "goal" : runRate ? "history" : "default";
  const y0 = Number(today.slice(0, 4));
  const months: ForecastMonth[] = [];
  const total = shape.reduce((a, b) => a + b, 0);
  for (let k = 0; k < 12; k++) {
    const m = (curMonth + k) % 12, y = y0 + Math.floor((curMonth + k) / 12);
    const sales = Math.round((opts.yearGoal ? (opts.yearGoal * shape[m]) / total : base * shape[m]));
    const adBudget = Math.round(sales * mer);
    const profit = Math.round(sales * margin - adBudget - s.fixedCostsMonthly);
    const events = CAL_EVENTS.filter((e) => { const sp = e.span(y); return sp && Number(sp.start.slice(5, 7)) - 1 === m && e.weight >= 5; }).map((e) => e.name);
    months.push({ month: `${y}-${String(m + 1).padStart(2, "0")}`, label: `${LABELS[m]} ${y}`, sales, adBudget, orders: Math.round(sales / aov), profit, events });
  }
  return { months, yearSales: months.reduce((a, m) => a + m.sales, 0), yearAds: months.reduce((a, m) => a + m.adBudget, 0), yearProfit: months.reduce((a, m) => a + m.profit, 0), source, shapeFrom: from, aov, margin, mer };
}
