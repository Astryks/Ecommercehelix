import { derive, sum, type DayInput, type Settings } from "../scorecard";
import { addDays } from "../dates";

export const r2 = (n: number) => Math.round(n * 100) / 100;
export const real = (days: DayInput[]) => days.filter((d) => !d.example);
export const inRange = (days: DayInput[], from: string, to: string) => days.filter((d) => d.date >= from && d.date <= to);
/** Totals for a set of days, with the derived numbers Helix uses everywhere. */
export function stats(days: DayInput[], s: Settings) {
  const t = sum(days);
  const x = derive(t, s, Math.max(1, days.length));
  return { t, x, days: days.length };
}
/** Share of sales left after product cost, shipping and fees (before ads). Falls back to 45% when there is no data. */
export function marginBeforeAds(days: DayInput[], s: Settings, fallback = 0.45) {
  const { t, x } = stats(days, s);
  if (!x.netRevenue) return fallback;
  return Math.max(0, Math.min(0.95, (x.netRevenue - t.cogs - t.shipping - t.paymentFees) / x.netRevenue));
}
export const lastNDays = (days: DayInput[], end: string, n: number) => inRange(days, addDays(end, -(n - 1)), end);
export const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
