/**
 * Daily scoreboard maths. Pure functions only (no database), so targets, streaks and rollups are easy to test.
 * Every number is a store total. No customer details are ever read or stored here.
 *
 * Plain words used on screen:
 *  - Sales  = what customers paid after discounts and refunds (net sales, tax taken out where set).
 *  - Costs  = product cost + shipping + payment fees + ads + other marketing.
 *  - Profit = sales minus those costs (the day's contribution, same as the Numbers page).
 */
import { derive, type DayInput, type Settings } from "../scorecard";
import { addDays, isoDay, monthStart, weekStart } from "../dates";

export type ScoreDay = { date: string; sales: number; costs: number; profit: number; orders: number; adSpend: number; source: string; example: boolean };

const r2 = (n: number) => Math.round(n * 100) / 100;

export function toScoreDay(d: DayInput, s: Settings): ScoreDay {
  const x = derive(d, s, 1);
  return { date: d.date, sales: r2(x.netRevenue), costs: r2(x.netRevenue - x.contribution), profit: r2(x.contribution), orders: d.orders, adSpend: r2(x.adSpend), source: d.source ?? "manual", example: Boolean(d.example) };
}

/** "Today" and "yesterday" in the store's own time zone (default Australia/Sydney). */
export function localDays(now: Date = new Date(), tz = "Australia/Sydney") {
  let today: string;
  try { today = isoDay(now, tz); } catch { today = isoDay(now); }
  return { today, yesterday: addDays(today, -1) };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const dow = (iso: string) => new Date(iso + "T12:00:00Z").getUTCDay();

export type Target = {
  amount: number | null;
  /** Where the number came from, in plain words, so the user can trust it. */
  how: string;
  basis: { recentAvg: number | null; sameWeekdayAvg: number | null; trendPct: number | null; lastYear: number | null };
  custom: boolean;
};

/**
 * Sales target for `day`, using only days before it.
 * 1. Base = average of the last 4 same weekdays (60%) and the last 14 days (40%).
 * 2. Trend = last 14 days vs the 14 before, capped to -10%..+10%, applied to the base.
 * 3. If last year's sales for the same weekday-aligned date (364 days back) exist, blend 25% of
 *    "last year x this year's growth vs last year" so seasonal peaks show up.
 * 4. A gentle stretch of +5% so hitting it means you grew. Rounded to the nearest $10.
 * Needs at least 5 days of data in the last 28; otherwise null (we ask the user to set one).
 * A custom goal the user typed always wins.
 */
export function targetFor(days: ScoreDay[], day: string, custom?: number | null): Target {
  const by = new Map(days.map((d) => [d.date, d]));
  const back = (n: number) => by.get(addDays(day, -n));
  const last14 = Array.from({ length: 14 }, (_, i) => back(i + 1)).filter(Boolean) as ScoreDay[];
  const prev14 = Array.from({ length: 14 }, (_, i) => back(i + 15)).filter(Boolean) as ScoreDay[];
  const same = [7, 14, 21, 28].map(back).filter(Boolean) as ScoreDay[];
  const last28 = last14.length + prev14.length;
  const recentAvg = last14.length ? avg(last14.map((d) => d.sales)) : null;
  const sameWeekdayAvg = same.length ? avg(same.map((d) => d.sales)) : null;
  const trend = recentAvg && prev14.length >= 5 && avg(prev14.map((d) => d.sales)) > 0 ? recentAvg / avg(prev14.map((d) => d.sales)) - 1 : null;
  const ly = back(364);
  // Growth vs last year over the last 28 days, only when both years have the days.
  const lyPairs = Array.from({ length: 28 }, (_, i) => [back(i + 1), back(i + 365)]).filter(([a, b]) => a && b) as [ScoreDay, ScoreDay][];
  const yoy = lyPairs.length >= 14 && lyPairs.reduce((a, [, b]) => a + b.sales, 0) > 0 ? lyPairs.reduce((a, [x]) => a + x.sales, 0) / lyPairs.reduce((a, [, b]) => a + b.sales, 0) : null;
  const basis = { recentAvg: recentAvg && r2(recentAvg), sameWeekdayAvg: sameWeekdayAvg && r2(sameWeekdayAvg), trendPct: trend === null ? null : Math.round(trend * 1000) / 10, lastYear: ly ? ly.sales : null };
  if (custom && custom > 0) return { amount: Math.round(custom), how: "Your own goal.", basis, custom: true };
  if (last28 < 5 || recentAvg === null) return { amount: null, how: "Add a few days of sales and Helix will suggest a target.", basis, custom: false };
  let base = sameWeekdayAvg !== null && same.length >= 2 ? 0.6 * sameWeekdayAvg + 0.4 * recentAvg : recentAvg;
  const t = trend === null ? 0 : Math.max(-0.1, Math.min(0.1, trend));
  base *= 1 + t;
  const parts = ["your recent days" + (same.length >= 2 ? " and the same weekday" : "")];
  if (trend !== null) parts.push(`your ${t >= 0 ? "up" : "down"}trend (${t >= 0 ? "+" : ""}${Math.round(t * 100)}%)`);
  if (ly && ly.sales > 0 && yoy) { base = 0.75 * base + 0.25 * ly.sales * Math.max(0.5, Math.min(2, yoy)); parts.push("this day last year"); }
  const amount = Math.max(10, Math.round((base * 1.05) / 10) * 10);
  return { amount, how: `Based on ${parts.join(", ")}, plus 5% so hitting it means you grew.`, basis, custom: false };
}

export type Verdict = "yes" | "not-yet" | "no" | "no-data";
export type GrowResult = {
  verdict: Verdict;
  day: string;
  sales: number | null;
  /** Change vs the usual for this weekday (average of the last 4 same weekdays, or the day before). */
  vsUsual: { base: number; label: string; change: number; pct: number | null } | null;
  target: Target;
  hitTarget: boolean;
  headline: string;
  detail: string;
};

/**
 * "Did I grow yesterday?"
 *  - YES: sales beat the usual for that weekday (or the target).
 *  - NOT YET: within 10% below the usual, or under the usual but above 90% of target. Close, keep going.
 *  - NO: clearly below the usual and the target.
 *  - no-data: nothing recorded for the day. Honest empty state.
 */
export function didIGrow(days: ScoreDay[], day: string, custom?: number | null): GrowResult {
  const by = new Map(days.map((d) => [d.date, d]));
  const row = by.get(day);
  const target = targetFor(days, day, custom);
  if (!row) return { verdict: "no-data", day, sales: null, vsUsual: null, target, hitTarget: false, headline: "No numbers yet", detail: "Connect Shopify or add yesterday's sales in one tap to see if you grew." };
  const same = [7, 14, 21, 28].map((n) => by.get(addDays(day, -n))).filter(Boolean) as ScoreDay[];
  const prev = by.get(addDays(day, -1));
  const vsUsual = same.length >= 2
    ? { base: r2(avg(same.map((d) => d.sales))), label: `your usual ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dow(day)]}` }
    : prev ? { base: prev.sales, label: "the day before" } : null;
  const cmp = vsUsual ? { ...vsUsual, change: r2(row.sales - vsUsual.base), pct: vsUsual.base > 0 ? Math.round(((row.sales - vsUsual.base) / vsUsual.base) * 1000) / 10 : null } : null;
  const hitTarget = target.amount !== null && row.sales >= target.amount;
  let verdict: Verdict;
  if (hitTarget || (cmp && cmp.change > 0)) verdict = "yes";
  else if ((cmp && cmp.base > 0 && row.sales >= cmp.base * 0.9) || (target.amount && row.sales >= target.amount * 0.9)) verdict = "not-yet";
  else if (!cmp && target.amount === null) verdict = row.sales > 0 ? "yes" : "no";
  else verdict = "no";
  const headline = verdict === "yes" ? "Yes, you grew" : verdict === "not-yet" ? "Not yet, but close" : "No, a slower day";
  const detail = cmp ? `${money(row.sales)} in sales, ${cmp.change >= 0 ? "up" : "down"} ${money(Math.abs(cmp.change))}${cmp.pct !== null ? ` (${cmp.pct >= 0 ? "+" : ""}${cmp.pct}%)` : ""} on ${cmp.label}.` : `${money(row.sales)} in sales.`;
  return { verdict, day, sales: row.sales, vsUsual: cmp, target, hitTarget, headline, detail };
}

export const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

/** Target hits for each day with data, newest last. A day only counts when a target existed for it. */
export function targetHistory(days: ScoreDay[], until: string, lookback = 120, custom?: number | null) {
  const by = new Map(days.map((d) => [d.date, d]));
  const out: { date: string; hit: boolean; target: number; sales: number }[] = [];
  for (let k = lookback - 1; k >= 0; k--) {
    const date = addDays(until, -k);
    const row = by.get(date);
    if (!row) continue;
    const t = targetFor(days, date, custom).amount;
    if (t !== null) out.push({ date, hit: row.sales >= t, target: t, sales: row.sales });
  }
  return out;
}

/** Days in a row that hit the target, ending at `until` (a missing or missed day breaks it). Also the best run. */
export function targetStreak(hist: { date: string; hit: boolean }[], until: string) {
  const hits = new Set(hist.filter((h) => h.hit).map((h) => h.date));
  let cur = 0, d = until;
  while (hits.has(d)) { cur++; d = addDays(d, -1); }
  let best = 0, run = 0, prev = "";
  for (const h of [...hist].sort((a, b) => a.date.localeCompare(b.date))) {
    run = h.hit ? (prev && addDays(prev, 1) === h.date ? run + 1 : 1) : 0;
    prev = h.hit ? h.date : "";
    best = Math.max(best, run);
  }
  return { current: cur, best, hits: hist.filter((h) => h.hit).length };
}

// ---------- rollups ----------

export type Period = "week" | "month" | "year";
export type Rollup = { key: string; label: string; from: string; to: string; sales: number; costs: number; profit: number; marginPct: number | null; orders: number; adSpend: number; roas: number | null; days: number };

export function periodKey(date: string, p: Period) {
  return p === "week" ? weekStart(date) : p === "month" ? monthStart(date) : date.slice(0, 4) + "-01-01";
}
function periodEnd(start: string, p: Period) {
  if (p === "week") return addDays(start, 6);
  if (p === "year") return start.slice(0, 4) + "-12-31";
  const d = new Date(start + "T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + 1, 0); return d.toISOString().slice(0, 10);
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function periodLabel(start: string, p: Period) {
  const [y, m, d] = start.split("-").map(Number);
  return p === "year" ? String(y) : p === "month" ? `${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]} ${y}`;
}

export function rollup(days: ScoreDay[], p: Period, extra: Rollup[] = []): Rollup[] {
  const m = new Map<string, Rollup>();
  for (const d of days) {
    const key = periodKey(d.date, p);
    const r = m.get(key) ?? { key, label: periodLabel(key, p), from: key, to: periodEnd(key, p), sales: 0, costs: 0, profit: 0, marginPct: null, orders: 0, adSpend: 0, roas: null, days: 0 };
    r.sales += d.sales; r.costs += d.costs; r.profit += d.profit; r.orders += d.orders; r.adSpend += d.adSpend; r.days++;
    m.set(key, r);
  }
  // Periods entered by hand (last year's months/weeks) only fill periods with no daily data.
  for (const e of extra) if (!m.has(e.key)) m.set(e.key, { ...e });
  return [...m.values()].map((r) => ({ ...r, sales: r2(r.sales), costs: r2(r.costs), profit: r2(r.profit), adSpend: r2(r.adSpend), marginPct: r.sales ? Math.round((r.profit / r.sales) * 1000) / 10 : null, roas: r.adSpend ? Math.round((r.sales / r.adSpend) * 100) / 100 : null })).sort((a, b) => a.key.localeCompare(b.key));
}

// ---------- last year entered by hand ----------

/** A month or week typed in (or imported) for a time before daily data exists. Totals only. */
export type ManualPeriod = { kind: "month" | "week"; start: string; sales: number; costs: number; adSpend: number; orders: number };

export function manualToRollup(e: ManualPeriod): Rollup {
  const p: Period = e.kind;
  const key = periodKey(e.start, p);
  return { key, label: periodLabel(key, p), from: key, to: periodEnd(key, p), sales: e.sales, costs: e.costs, profit: r2(e.sales - e.costs), marginPct: null, orders: e.orders, adSpend: e.adSpend, roas: null, days: 0 };
}

/** Daily rows win; a manual month/week only covers the dates with no daily row, spread evenly across its days. */
export function spreadManual(days: ScoreDay[], manual: ManualPeriod[]): ScoreDay[] {
  const have = new Set(days.map((d) => d.date));
  const out = [...days];
  for (const e of manual) {
    const r = manualToRollup(e);
    const n = Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86400000) + 1;
    for (let i = 0; i < n; i++) {
      const date = addDays(r.from, i);
      if (have.has(date)) continue;
      out.push({ date, sales: e.sales / n, costs: e.costs / n, profit: (e.sales - e.costs) / n, orders: e.orders / n, adSpend: e.adSpend / n, source: "manual-" + e.kind, example: false });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- year to date ----------

export type Ytd = { from: string; to: string; lyFrom: string; lyTo: string; now: Totals; ly: Totals; lyCoverage: number; salesChangePct: number | null; profitChange: number };
export type Totals = { sales: number; costs: number; profit: number; orders: number; adSpend: number; days: number };
const tot = (xs: ScoreDay[]): Totals => xs.reduce((a, d) => ({ sales: a.sales + d.sales, costs: a.costs + d.costs, profit: a.profit + d.profit, orders: a.orders + d.orders, adSpend: a.adSpend + d.adSpend, days: a.days + 1 }), { sales: 0, costs: 0, profit: 0, orders: 0, adSpend: 0, days: 0 });

/** 1 Jan to `to` (yesterday, in the store's time zone) vs 1 Jan to the same calendar date last year. 29 Feb maps to 28 Feb. */
export function ytd(days: ScoreDay[], to: string): Ytd {
  const y = Number(to.slice(0, 4));
  const from = `${y}-01-01`, lyFrom = `${y - 1}-01-01`;
  let lyTo = `${y - 1}${to.slice(4)}`;
  if (lyTo.endsWith("02-29")) lyTo = `${y - 1}-02-28`;
  const now = tot(days.filter((d) => d.date >= from && d.date <= to));
  const lyRows = days.filter((d) => d.date >= lyFrom && d.date <= lyTo);
  const ly = tot(lyRows);
  const span = Math.round((Date.parse(lyTo) - Date.parse(lyFrom)) / 86400000) + 1;
  return { from, to, lyFrom, lyTo, now, ly, lyCoverage: Math.min(1, new Set(lyRows.map((d) => d.date)).size / span), salesChangePct: ly.sales > 0 ? Math.round(((now.sales - ly.sales) / ly.sales) * 1000) / 10 : null, profitChange: r2(now.profit - ly.profit) };
}

// ---------- personal bests ----------

export type Best = { kind: "day" | "week" | "month"; label: string; sales: number; key: string };
export function personalBests(days: ScoreDay[]): Best[] {
  const real = days.filter((d) => !d.source.startsWith("manual-"));
  const out: Best[] = [];
  const bd = real.reduce<ScoreDay | null>((a, d) => (!a || d.sales > a.sales ? d : a), null);
  if (bd && bd.sales > 0) out.push({ kind: "day", label: bd.date, sales: bd.sales, key: bd.date });
  for (const p of ["week", "month"] as const) {
    const r = rollup(real, p).filter((x) => x.days >= (p === "week" ? 7 : 28));
    const b = r.reduce<Rollup | null>((a, x) => (!a || x.sales > a.sales ? x : a), null);
    if (b && b.sales > 0) out.push({ kind: p, label: b.label, sales: b.sales, key: b.key });
  }
  return out;
}
