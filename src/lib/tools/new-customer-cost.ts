/** New customer ad cost %: ad spend as a share of sales from new customers, with break-even and target lines, week by week. */
import type { DayInput, Settings } from "../scorecard";
import { addDays } from "../dates";
import { inRange, marginBeforeAds, real } from "./common";

export type NccWeek = { start: string; pct: number | null; adSpend: number; newRevenue: number };
export type Ncc = { current: number | null; breakEven: number; target: number; status: "good" | "watch" | "fix" | "none"; weeks: NccWeek[] };

export function newCustomerCost(days: DayInput[], s: Settings, today: string): Ncc {
  const r = real(days);
  const weeks: NccWeek[] = [];
  for (let w = 11; w >= 0; w--) {
    const end = addDays(today, -1 - w * 7), start = addDays(end, -6);
    const d = inRange(r, start, end);
    const ad = d.reduce((a, x) => a + x.adMeta + x.adGoogle + x.adTiktok + x.adOther, 0);
    const nr = d.reduce((a, x) => a + x.newCustomerRevenue, 0);
    weeks.push({ start, adSpend: Math.round(ad), newRevenue: Math.round(nr), pct: nr ? Math.round((ad / nr) * 1000) / 10 : null });
  }
  // Break-even: a first order can spend up to its margin before ads on ads. Target leaves a quarter of that as profit.
  const margin = marginBeforeAds(inRange(r, addDays(today, -90), today), s);
  const breakEven = Math.round(margin * 1000) / 10;
  const target = Math.round(margin * 0.75 * 1000) / 10;
  const last4 = weeks.slice(-4);
  const ad = last4.reduce((a, w) => a + w.adSpend, 0), nr = last4.reduce((a, w) => a + w.newRevenue, 0);
  const current = nr ? Math.round((ad / nr) * 1000) / 10 : null;
  return { current, breakEven, target, weeks, status: current === null ? "none" : current <= target ? "good" : current <= breakEven ? "watch" : "fix" };
}
