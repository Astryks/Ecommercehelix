import type { StageId } from "./stages";
import type { Metrics } from "./analytics";
import type { TrackId } from "./tracks";

/**
 * The goals ladder: the numbers to aim at, in funnel order, ending in net profit.
 * Benchmarks match the Dashboard's explanations (metric-info.ts) and the audit rules
 * (audit.ts, campaigns.ts) so the same number never gets two different "good" ranges.
 * Pure, so it is tested.
 */

export type Goals = {
  sessions: number;
  ctrPct: number;
  atcPct: number;
  crPct: number;
  aov: number;
  cpa: number;
  contributionPct: number;
  netProfit: number;
};
export type GoalKey = keyof Goals | "mer";
export type Unit = "count" | "pct" | "money";

export type GoalStep = {
  key: GoalKey;
  label: string;
  short: string;
  stage: StageId;
  better: "up" | "down";
  unit: Unit;
  plain: string;
  good: string;
  /** Short benchmark for tight spaces. */
  bench: string;
};

/** The headline for the goals ladder everywhere it appears. */
export const GOALS_HEADLINE = {
  title: "The goal is profit, not just revenue",
  order: "Chase these in order: site visits, click-through rate, add-to-cart rate, conversion rate, average order value, ROAS and MER, cost per acquisition, contribution margin, and finally net profit.",
};

export const LADDER: GoalStep[] = [
  { key: "sessions", bench: "Grows with ads, content and email", label: "Site visits (sessions)", short: "Visits", stage: "attract", better: "up", unit: "count",
    plain: "How many times people came to your store this month.",
    good: "No single right number. Visits grow with ads, content and email. What matters is that each extra visit comes at a cost you can afford." },
  { key: "ctrPct", bench: "1%+ solid · 1.2%+ strong", label: "Click-through rate (CTR)", short: "CTR", stage: "attract", better: "up", unit: "pct",
    plain: "Out of every 100 people who see your ad, how many click it.",
    good: "1% or more is solid and 1.2% or more is strong. Under 0.5% means the ad is not stopping people: try a new opening or a new message." },
  { key: "atcPct", bench: "About 7.5%+", label: "Add-to-cart rate", short: "Add to cart", stage: "convert", better: "up", unit: "pct",
    plain: "Out of every 100 visits, how many add something to the cart.",
    good: "Around 7.5% or more is a good guide. Lots of add-to-carts but few sales usually points at shipping costs or the checkout." },
  { key: "crPct", bench: "2%+ solid · most stores 1 to 3%", label: "Conversion rate", short: "Conversion", stage: "convert", better: "up", unit: "pct",
    plain: "Out of every 100 visits, how many buy.",
    good: "2% or more is solid for most stores, and many sit between 1 and 3%. Small lifts here make every ad dollar work harder." },
  { key: "aov", bench: "No universal target: lift it", label: "Average order value (AOV)", short: "AOV", stage: "convert", better: "up", unit: "money",
    plain: "How much a customer spends in one order, on average.",
    good: "No universal target. A higher AOV means you can afford to pay more to win each customer. Bundles, gifts and a free-shipping amount a little above your usual order help." },
  { key: "mer", bench: "MER 20 to 35% (ROAS about 2.9x to 5x)", label: "ROAS and MER", short: "MER", stage: "grow", better: "down", unit: "pct",
    plain: "ROAS is sales per $1 of ads. MER is the share of all your sales that went on ads (the honest version, because no platform can overcount it).",
    good: "Many growing stores keep MER between 20 and 35%, which is a blended ROAS of about 2.9x to 5x. Keep each platform's ROAS at least 20% above your break-even ROAS." },
  { key: "cpa", bench: "Below your break-even CPA", label: "Cost per acquisition (CPA)", short: "CPA", stage: "grow", better: "down", unit: "money",
    plain: "What you spend on ads, on average, for each order.",
    good: "Keep it below your break-even CPA (your average order times what you keep before ads). 15% or more below it is green." },
  { key: "contributionPct", bench: "15%+ healthy", label: "Contribution margin", short: "Contribution", stage: "grow", better: "up", unit: "pct",
    plain: "What is left of each $1 of sales after product, shipping, fees and ads. It pays your fixed bills and your profit.",
    good: "15% or more is healthy, 5 to 15% is thin, under 5% is risky." },
  { key: "netProfit", bench: "Above $0 · healthy stores 10 to 20%", label: "Net profit", short: "Net profit", stage: "grow", better: "up", unit: "money",
    plain: "What the business actually made after everything, including rent, software, staff and your own wage.",
    good: "Above $0 means the business pays for itself. Many healthy online stores make 10 to 20% net. This is the goal." },
];

export const GOAL_KEYS: (keyof Goals)[] = ["sessions", "ctrPct", "atcPct", "crPct", "aov", "cpa", "contributionPct", "netProfit"];

/** Suggested starting goals for each track. MER comes from Your numbers (default 30%). */
export const DEFAULT_GOALS: Record<TrackId, Goals> = {
  starting: { sessions: 3000, ctrPct: 1, atcPct: 6, crPct: 1.5, aov: 60, cpa: 21, contributionPct: 10, netProfit: 0 },
  growing: { sessions: 30000, ctrPct: 1.2, atcPct: 7.5, crPct: 2.2, aov: 92, cpa: 28, contributionPct: 20, netProfit: 3000 },
};
export const DEFAULT_MER: Record<TrackId, number> = { starting: 35, growing: 30 };

const LIMITS: Record<keyof Goals, [number, number]> = {
  sessions: [0, 100_000_000], ctrPct: [0, 100], atcPct: [0, 100], crPct: [0, 100], aov: [0, 1_000_000],
  cpa: [0, 1_000_000], contributionPct: [-100, 100], netProfit: [-100_000_000, 100_000_000],
};

/** Read goals from a form, falling back to the given defaults for blank or bad values. */
export function goalsFromForm(f: FormData, fallback: Goals): Goals {
  const out = { ...fallback };
  for (const k of GOAL_KEYS) {
    const raw = String(f.get(k) ?? "").replace(/[$,%\s]/g, "");
    if (raw === "") continue;
    const n = Number(raw);
    if (!Number.isFinite(n)) continue;
    const [lo, hi] = LIMITS[k];
    out[k] = k === "sessions" ? Math.round(Math.min(hi, Math.max(lo, n))) : Math.min(hi, Math.max(lo, n));
  }
  return out;
}

/** Read the MER target from a form (above 0, up to 100%), or the fallback. */
export function merFromForm(f: FormData, fallback: number): number {
  const raw = String(f.get("merPct") ?? "").replace(/[%\s]/g, "");
  const n = Number(raw);
  return raw !== "" && Number.isFinite(n) && n > 0 && n <= 100 ? n : fallback;
}

/** What the funnel goals add up to: sales (the vanity number) and the profit it should leave. */
export function impliedMonth(g: Goals, merPct: number, fixedCostsMonthly: number) {
  const orders = g.sessions * (g.crPct / 100);
  const revenue = orders * g.aov;
  const adSpend = revenue * (merPct / 100);
  const contribution = revenue * (g.contributionPct / 100);
  return { orders, revenue, adSpend, contribution, netProfit: contribution - fixedCostsMonthly, roas: merPct > 0 ? 100 / merPct : 0 };
}

export type Actuals = Partial<Record<GoalKey, number | null>>;

/** Actuals for the last 30 days from the daily numbers, plus CTR from Meta when connected. */
export function actualsFrom(m: Metrics, opts: { ctrPct?: number | null; atcPct?: number | null } = {}): Actuals {
  const has = m.dataDays > 0;
  const sessions = m.t.sessions;
  return {
    sessions: has && sessions > 0 ? sessions : null,
    ctrPct: opts.ctrPct ?? null,
    atcPct: opts.atcPct ?? null,
    crPct: has && sessions > 0 ? (m.orders / sessions) * 100 : null,
    aov: has && m.orders > 0 ? m.aov : null,
    mer: has && m.netRevenue > 0 ? m.merPct : null,
    cpa: has && m.orders > 0 && m.adSpend > 0 ? m.aCpa : null,
    contributionPct: has && m.netRevenue > 0 ? m.contributionPct : null,
    netProfit: has ? m.netProfit : null,
  };
}

export type Rating = "green" | "amber" | "red";
/** On track (green), within 15% (amber) or further off (red). Net profit uses $ and the sign. */
export function rateGoal(step: GoalStep, raw: number | null | undefined, target: number): Rating | null {
  if (raw === null || raw === undefined) return null;
  // Rate what the user sees: percentages to 2 decimals, dollars and counts to whole numbers.
  const actual = step.unit === "pct" ? Math.round(raw * 100) / 100 : Math.round(raw);
  if (step.key === "netProfit") return actual >= target ? "green" : actual >= 0 ? "amber" : "red";
  if (step.better === "up") return actual >= target ? "green" : actual >= target * 0.85 ? "amber" : "red";
  return actual <= target ? "green" : actual <= target * 1.15 ? "amber" : "red";
}

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-AU");
export function fmtGoal(unit: Unit, n: number): string {
  if (unit === "money") return money(n);
  if (unit === "pct") return `${n < 10 ? String(Number(n.toFixed(2))) : n.toFixed(0)}%`;
  return Math.round(n).toLocaleString("en-AU");
}

/** Target value for a ladder step (MER comes from the user's settings). */
export const targetOf = (step: GoalStep, g: Goals, merPct: number) => (step.key === "mer" ? merPct : g[step.key]);
