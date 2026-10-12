import { addDays } from "./dates";
import { derive, sum, type DayInput, type Settings } from "./scorecard";

/**
 * Growth dashboard maths: revenue, costs and net profit by day, week, month or
 * year, the change against the previous period, a trend line and plain-English
 * summaries. Built only from the daily numbers (typed, imported or synced from Meta).
 */
export type Grain = "day" | "week" | "month" | "year";
export const GRAINS: { id: Grain; label: string; sub: string }[] = [
  { id: "day", label: "Day", sub: "last 30 days" },
  { id: "week", label: "Week", sub: "last 12 weeks (7-day blocks)" },
  { id: "month", label: "Month", sub: "last 12 months" },
  { id: "year", label: "Year", sub: "each calendar year" },
];
export const toGrain = (v: unknown): Grain => (GRAINS.some((g) => g.id === v) ? (v as Grain) : "week");

export type Range = { from: string; to: string };
export type Totals = { revenue: number; costs: number; profit: number; adSpend: number; orders: number; marginPct: number; dataDays: number; metaDays: number; exampleDays: number };
export type GrowthPoint = Totals & Range & { label: string; partial: boolean; trend: number | null };

const daysIn = (r: Range) => Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86_400_000) + 1;
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-AU", { ...o, timeZone: "UTC" });
const lastOfMonth = (iso: string) => addDays(`${monthAdd(iso, 1)}`, -1);
function monthAdd(iso: string, n: number) {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7)) - 1 + n;
  const yy = y + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  return `${yy}-${String(mm + 1).padStart(2, "0")}-01`;
}
const clampDay = (y: number, m: number, d: number) => {
  const max = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(Math.min(d, max)).padStart(2, "0")}`;
};

export function totalsFor(days: DayInput[], r: Range, s: Settings): Totals {
  const rows = days.filter((d) => d.date >= r.from && d.date <= r.to);
  const x = derive(sum(rows), s, rows.length ? daysIn(r) : 0);
  return {
    revenue: x.netRevenue,
    costs: x.netRevenue - x.netProfit,
    profit: x.netProfit,
    adSpend: x.adSpend,
    orders: rows.reduce((a, d) => a + d.orders, 0),
    marginPct: x.netRevenue ? (x.netProfit / x.netRevenue) * 100 : 0,
    dataDays: rows.length,
    metaDays: rows.filter((d) => d.source === "meta").length,
    exampleDays: rows.filter((d) => d.example).length,
  };
}

/** The buckets shown on the chart for a grain, oldest first. The last one ends on `latest`. */
export function growthBuckets(grain: Grain, latest: string, firstDate?: string): (Range & { label: string; partial: boolean })[] {
  const out: (Range & { label: string; partial: boolean })[] = [];
  if (grain === "day") {
    for (let i = 29; i >= 0; i--) {
      const d = addDays(latest, -i);
      out.push({ from: d, to: d, label: fmt(d, { day: "numeric", month: "short" }), partial: false });
    }
  } else if (grain === "week") {
    for (let i = 11; i >= 0; i--) {
      const to = addDays(latest, -7 * i);
      const from = addDays(to, -6);
      out.push({ from, to, label: fmt(to, { day: "numeric", month: "short" }), partial: false });
    }
  } else if (grain === "month") {
    for (let i = 11; i >= 0; i--) {
      const from = monthAdd(latest.slice(0, 8) + "01", -i);
      const end = lastOfMonth(from);
      const to = end > latest ? latest : end;
      out.push({ from, to, label: fmt(from, { month: "short", year: "2-digit" }), partial: to < end });
    }
  } else {
    const y1 = Number(latest.slice(0, 4));
    const y0 = Math.max(y1 - 4, Number((firstDate ?? latest).slice(0, 4)));
    for (let y = y0; y <= y1; y++) {
      const end = `${y}-12-31`;
      const to = end > latest ? latest : end;
      out.push({ from: `${y}-01-01`, to, label: to < end ? `${y} so far` : String(y), partial: to < end });
    }
  }
  return out;
}

/** Least-squares straight line through the values (null where there is no data). */
export function trendLine(values: (number | null)[]): (number | null)[] {
  const pts = values.map((v, i) => [i, v] as const).filter((p): p is readonly [number, number] => p[1] !== null);
  if (pts.length < 2) return values.map(() => null);
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p[0], 0) / n;
  const my = pts.reduce((a, p) => a + p[1], 0) / n;
  const sxx = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
  const slope = sxx ? pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / sxx : 0;
  return values.map((_, i) => my + slope * (i - mx));
}

export function growthSeries(days: DayInput[], grain: Grain, latest: string, s: Settings): GrowthPoint[] {
  const pts = growthBuckets(grain, latest, days[0]?.date).map((b) => ({ ...b, ...totalsFor(days, b, s), trend: null as number | null }));
  const trend = trendLine(pts.map((p) => (p.dataDays ? p.profit : null)));
  return pts.map((p, i) => ({ ...p, trend: trend[i] }));
}

/**
 * The current period and the fair one to compare it with:
 * day = latest day vs the same weekday a week earlier; week = last 7 days vs the 7 before;
 * month = month to date vs the same days last month; year = year to date vs the same dates last year.
 */
export function comparison(grain: Grain, latest: string): { cur: Range; prev: Range; curLabel: string; prevLabel: string; vsWord: string } {
  const y = Number(latest.slice(0, 4));
  const m = Number(latest.slice(5, 7));
  const d = Number(latest.slice(8, 10));
  if (grain === "day") {
    const p = addDays(latest, -7);
    return { cur: { from: latest, to: latest }, prev: { from: p, to: p }, curLabel: fmt(latest, { weekday: "long", day: "numeric", month: "short" }), prevLabel: fmt(p, { weekday: "long", day: "numeric", month: "short" }), vsWord: "the same day last week" };
  }
  if (grain === "week") {
    const from = addDays(latest, -6);
    const prev = { from: addDays(from, -7), to: addDays(from, -1) };
    return { cur: { from, to: latest }, prev, curLabel: `${fmt(from, { day: "numeric", month: "short" })} to ${fmt(latest, { day: "numeric", month: "short" })}`, prevLabel: `${fmt(prev.from, { day: "numeric", month: "short" })} to ${fmt(prev.to, { day: "numeric", month: "short" })}`, vsWord: "last week" };
  }
  if (grain === "month") {
    const from = latest.slice(0, 8) + "01";
    const pm = m === 1 ? 12 : m - 1;
    const py = m === 1 ? y - 1 : y;
    const prev = { from: `${py}-${String(pm).padStart(2, "0")}-01`, to: clampDay(py, pm, d) };
    return { cur: { from, to: latest }, prev, curLabel: `${fmt(from, { month: "long" })} 1 to ${d}`, prevLabel: `${fmt(prev.from, { month: "long" })} 1 to ${Number(prev.to.slice(8))}`, vsWord: "the same days last month" };
  }
  const prev = { from: `${y - 1}-01-01`, to: clampDay(y - 1, m, d) };
  return { cur: { from: `${y}-01-01`, to: latest }, prev, curLabel: `${y} to ${fmt(latest, { day: "numeric", month: "short" })}`, prevLabel: `${y - 1} to ${fmt(prev.to, { day: "numeric", month: "short" })}`, vsWord: "the same dates last year" };
}

export type Change = { abs: number; pct: number | null; dir: "up" | "down" | "flat" };
export function changeOf(cur: number, prev: number): Change {
  const abs = cur - prev;
  // A percentage only makes sense against a positive base, and huge swings off a tiny base read as noise.
  const raw = prev > 0 ? (abs / prev) * 100 : null;
  const pct = raw !== null && Math.abs(raw) <= 500 ? raw : null;
  const dir = Math.abs(abs) < 0.5 || (pct !== null && Math.abs(pct) < 0.5) ? "flat" : abs > 0 ? "up" : "down";
  return { abs, pct, dir };
}

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-AU");

/** "Profit is up 12% on last week ($1,240 more)." */
export function plainLine(name: string, c: Change, vsWord: string): string {
  if (c.dir === "flat") return `${name} is flat on ${vsWord}.`;
  const more = c.abs > 0 ? "more" : "less";
  const pct = c.pct === null ? "" : ` ${Math.abs(Math.round(c.pct))}%`;
  return `${name} is ${c.dir}${pct} on ${vsWord} (${money(Math.abs(c.abs))} ${more}).`;
}

/** Net profit margin bands for online stores (after product, shipping, fees, ads and fixed costs). */
export const MARGIN_BANDS = [
  { from: -100, to: 0, label: "Losing money", tone: "red" as const },
  { from: 0, to: 10, label: "Thin: 0% to 10%", tone: "amber" as const },
  { from: 10, to: 20, label: "Healthy: 10% to 20%", tone: "green" as const },
  { from: 20, to: 100, label: "Strong: 20% or more", tone: "green" as const },
];
export const marginBand = (pct: number) => MARGIN_BANDS.find((b) => pct >= b.from && pct < b.to) ?? MARGIN_BANDS[MARGIN_BANDS.length - 1];

export function yearToDate(days: DayInput[], latest: string, s: Settings) {
  const y = Number(latest.slice(0, 4));
  const cur = totalsFor(days, { from: `${y}-01-01`, to: latest }, s);
  const prev = totalsFor(days, { from: `${y - 1}-01-01`, to: clampDay(y - 1, Number(latest.slice(5, 7)), Number(latest.slice(8, 10))) }, s);
  return { cur, prev, change: changeOf(cur.profit, prev.profit), hasPrev: prev.dataDays > 0 };
}
