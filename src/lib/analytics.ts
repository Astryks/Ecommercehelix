import { addDays } from "./dates";
import { derive, sum, type DayInput, type Flag, type Settings } from "./scorecard";

/**
 * Dashboard maths: period ranges, metrics, chart series and green/amber/red ratings.
 * Everything is calculated from the daily numbers (quick update, scorecard, CSV, Meta sync).
 * Pure functions, so they are tested and never need the user to do maths.
 */

export type PeriodId = "week" | "month" | "ytd" | "l12m";
export const PERIODS: { id: PeriodId; label: string; sub: string; group: "week" | "month" | "year" }[] = [
  { id: "week", label: "Week", sub: "Last 7 days", group: "week" },
  { id: "month", label: "Month", sub: "Last 30 days", group: "month" },
  { id: "ytd", label: "Year to date", sub: "1 Jan to now", group: "year" },
  { id: "l12m", label: "Last 12 months", sub: "Last 365 days", group: "year" },
];
export const toPeriod = (v: unknown): PeriodId => (PERIODS.some((p) => p.id === v) ? (v as PeriodId) : "week");

export type Range = { from: string; to: string };
const daysIn = (r: Range) => Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86_400_000) + 1;
const fmt = (iso: string, withYear = false) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-AU", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
const sameDayLastYear = (iso: string) => {
  const y = Number(iso.slice(0, 4)) - 1;
  const md = iso.slice(5) === "02-29" ? "02-28" : iso.slice(5);
  return `${y}-${md}`;
};

export function periodRanges(id: PeriodId, latest: string): { cur: Range; prev: Range; curLabel: string; prevLabel: string } {
  let cur: Range, prev: Range;
  if (id === "week" || id === "month") {
    const n = id === "week" ? 7 : 30;
    cur = { from: addDays(latest, -(n - 1)), to: latest };
    prev = { from: addDays(cur.from, -n), to: addDays(cur.from, -1) };
  } else if (id === "ytd") {
    cur = { from: latest.slice(0, 4) + "-01-01", to: latest };
    prev = { from: sameDayLastYear(cur.from), to: sameDayLastYear(latest) };
  } else {
    cur = { from: addDays(latest, -364), to: latest };
    prev = { from: addDays(cur.from, -365), to: addDays(cur.from, -1) };
  }
  return { cur, prev, curLabel: `${fmt(cur.from, true)} to ${fmt(cur.to, true)}`, prevLabel: `${fmt(prev.from, true)} to ${fmt(prev.to, true)}` };
}

export const inRange = (days: DayInput[], r: Range) => days.filter((d) => d.date >= r.from && d.date <= r.to);

export function metricsFor(days: DayInput[], r: Range, s: Settings) {
  const rows = inRange(days, r);
  const t = sum(rows);
  const x = derive(t, s, daysIn(r));
  const grossMarginFrac = x.netRevenue ? x.grossProfit / x.netRevenue : 0;
  const marginBeforeAds = x.netRevenue ? 1 - x.vcrPct / 100 : 0;
  return {
    ...x,
    t,
    dataDays: rows.length,
    exampleDays: rows.filter((d) => d.example).length,
    calendarDays: daysIn(r),
    grossRevenue: t.revenue,
    orders: t.orders,
    cogs: t.cogs,
    shipping: t.shipping,
    fees: t.paymentFees,
    discounts: t.discounts,
    refunds: t.refunds,
    otherMarketing: t.otherMarketing,
    fixedCosts: x.contribution - x.netProfit,
    totalCosts: t.cogs + t.shipping + t.paymentFees + x.adSpend + t.otherMarketing,
    refundRatePct: t.revenue ? (t.refunds / t.revenue) * 100 : 0,
    blendedRoas: x.adSpend ? x.netRevenue / x.adSpend : 0,
    newSharePct: x.netRevenue ? (Math.min(x.newRevenue, x.netRevenue) / x.netRevenue) * 100 : 0,
    grossMarginFrac,
    marginBeforeAds,
    /** The simple rule of thumb: 1 / gross margin (product cost only). */
    simpleBreakEvenRoas: grossMarginFrac > 0 ? 1 / grossMarginFrac : 0,
    /** Ad spend share of revenue at which contribution hits $0 (before other marketing). */
    breakEvenMerPct: marginBeforeAds * 100,
  };
}
export type Metrics = ReturnType<typeof metricsFor>;

export type Bucket = Range & { label: string };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Chart buckets: weekly for the week and month views, monthly for the year views. */
export function buckets(id: PeriodId, latest: string): Bucket[] {
  if (id === "week" || id === "month") {
    const n = id === "week" ? 12 : 13;
    return Array.from({ length: n }, (_, k) => {
      const to = addDays(latest, -7 * (n - 1 - k));
      return { from: addDays(to, -6), to, label: fmt(to) };
    });
  }
  const { cur } = periodRanges(id, latest);
  const out: Bucket[] = [];
  let y = Number(cur.from.slice(0, 4)), m = Number(cur.from.slice(5, 7));
  for (;;) {
    const first = `${y}-${String(m).padStart(2, "0")}-01`;
    if (first > latest) break;
    const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    const from = first < cur.from ? cur.from : first;
    const to = last > latest ? latest : last;
    out.push({ from, to, label: MON[m - 1] + (id === "l12m" ? ` ${String(y).slice(2)}` : "") });
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

/** Shift a bucket back to the matching earlier period (previous weeks, or the same months last year). */
const shiftBack = (id: PeriodId, b: Bucket, n: number): Range =>
  id === "week" || id === "month" ? { from: addDays(b.from, -7 * n), to: addDays(b.to, -7 * n) } : { from: sameDayLastYear(b.from), to: sameDayLastYear(b.to) };

export type SeriesRow = {
  label: string; revenue: number; costs: number; contribution: number; netProfit: number; prevContribution: number | null;
  merPct: number; roas: number; roasMeta: number | null; roasGoogle: number | null; roasTiktok: number | null; breakEvenRoas: number; newRevenue: number; returningRevenue: number;
};

export function seriesFor(days: DayInput[], id: PeriodId, latest: string, s: Settings): SeriesRow[] {
  const bs = buckets(id, latest);
  const first = days[0]?.date ?? latest;
  const r = (n: number) => Math.round(n);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return bs.map((b) => {
    const m = metricsFor(days, b, s);
    const pb = shiftBack(id, b, bs.length);
    const p = pb.from >= first ? metricsFor(days, pb, s) : null;
    return {
      label: b.label, revenue: r(m.netRevenue), costs: r(m.totalCosts), contribution: r(m.contribution), netProfit: r(m.netProfit),
      prevContribution: p && p.dataDays ? r(p.contribution) : null,
      merPct: r2(m.merPct), roas: r2(m.blendedRoas),
      roasMeta: m.t.adMeta ? r2(m.roasMeta) : null, roasGoogle: m.t.adGoogle ? r2(m.roasGoogle) : null, roasTiktok: m.t.adTiktok ? r2(m.roasTiktok) : null,
      breakEvenRoas: r2(m.breakEvenRoas), newRevenue: r(Math.min(m.newRevenue, m.netRevenue)), returningRevenue: r(m.returningRevenue),
    };
  });
}

export function costBreakdown(m: Metrics) {
  return [
    { name: "Product cost (COGS)", value: m.cogs, color: "#0ea5e9" },
    { name: "Shipping", value: m.shipping, color: "#14b8a6" },
    { name: "Payment fees", value: m.fees, color: "#a3a3a3" },
    { name: "Meta ads", value: m.t.adMeta, color: "#6366f1" },
    { name: "Google ads", value: m.t.adGoogle, color: "#f59e0b" },
    { name: "TikTok ads", value: m.t.adTiktok, color: "#ec4899" },
    { name: "Other ads", value: m.t.adOther, color: "#8b5cf6" },
    { name: "Other marketing", value: m.otherMarketing, color: "#64748b" },
    { name: "Fixed costs (share)", value: Math.max(0, m.fixedCosts), color: "#334155" },
  ].filter((c) => c.value > 0).map((c) => ({ ...c, value: Math.round(c.value) }));
}

export function channels(m: Metrics) {
  return [
    { name: "Meta", spend: m.t.adMeta, revenue: m.t.metaRevenue, live: true },
    { name: "Google", spend: m.t.adGoogle, revenue: m.t.googleRevenue, live: false },
    { name: "TikTok", spend: m.t.adTiktok, revenue: m.t.tiktokRevenue, live: false },
    { name: "Other", spend: m.t.adOther, revenue: 0, live: false },
  ].filter((c) => c.spend > 0).map((c) => ({ ...c, spend: Math.round(c.spend), revenue: Math.round(c.revenue), roas: c.spend ? Math.round((c.revenue / c.spend) * 100) / 100 : 0 }));
}

// ---------- ratings against the user's own break-even targets ----------

/** ROAS: under break-even loses money; up to 20% above is thin; more is healthy. */
export const rateRoas = (roas: number, breakEven: number): Flag | null =>
  !roas || !breakEven ? null : roas >= breakEven * 1.2 ? "green" : roas >= breakEven ? "amber" : "red";
/** Cost per order or CAC against break-even CPA. */
export const rateCpa = (cpa: number, breakEven: number): Flag | null =>
  !cpa || !breakEven ? null : cpa <= breakEven * 0.85 ? "green" : cpa <= breakEven ? "amber" : "red";
export const rateMer = (mer: number, target: number, breakEven: number): Flag | null =>
  !mer ? null : mer <= target ? "green" : mer < breakEven ? "amber" : "red";
export const rateContributionPct = (p: number): Flag => (p >= 15 ? "green" : p >= 5 ? "amber" : "red");
export const rateNetProfit = (n: number, revenue: number): Flag => (n > 0 ? "green" : revenue && n > -0.05 * revenue ? "amber" : "red");
export const rateGrossMargin = (pct: number): Flag => (pct >= 60 ? "green" : pct >= 45 ? "amber" : "red");
export const rateRefunds = (pct: number): Flag => (pct <= 3 ? "green" : pct <= 8 ? "amber" : "red");
export const rateVsTarget = (actual: number, target: number): Flag | null => (!target ? null : actual >= target ? "green" : actual >= target * 0.85 ? "amber" : "red");

/** Percentage change versus the previous period, or null when there is nothing to compare. */
export const change = (cur: number, prev: number | undefined | null) => (prev ? ((cur - prev) / Math.abs(prev)) * 100 : null);
