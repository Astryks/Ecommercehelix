/**
 * Step 4 — The unified allowance: one pool, two count ceilings, no silent changes.
 *
 * THE PROBLEM (flagged in Step 3): Helix had TWO monthly counters that never
 * met each other.
 *   1. AI write-ups — src/lib/ai/config.ts AI_MONTHLY_CAP: Free 3 / Starter
 *      50 / Growth 150 calls a month, with a $25/month global budget
 *      (AI_MONTHLY_BUDGET_USD) as the kill-switch.
 *   2. Coach messages — src/lib/coach/config.ts COACH_LIMITS: Free 20 /
 *      Starter 300 / Growth 800 messages a month, deep 0 / 40 / 100, with a
 *      $50/month global cap (COACH_MONTHLY_BUDGET_USD) as the kill-switch.
 *
 * THE UNIFICATION: both counters now draw from ONE credit pool per plan.
 * 1 credit = $0.01 of provider cost (see costs.ts). The pool is:
 *   - Free: 60 credits a month, hard-capped ($0.60, docs/pricing.md §4).
 *     No weekly grant — the 60 is the whole month.
 *   - Starter: 60 credits a week (weekly buckets, expiring Sunday night),
 *     inside a $3.00 monthly ceiling. Effective month: ~260 credits.
 *   - Growth: 180 credits a week, 1-week grace, inside an $8.00 monthly
 *     ceiling. Effective month: ~780 credits.
 *
 * WHAT DID NOT CHANGE (and must not, silently):
 *   - The count ceilings are exactly as before: write-ups 3/50/150, coach
 *     total 20/300/800, deep 0/40/100. A ceiling is a ceiling, not an
 *     entitlement: an action still needs BOTH a count left AND credits left.
 *   - The two global kill-switches stay as second layers: coach $50/month
 *     and generic AI $25/month. They are kill-switches for the whole
 *     business, not allowances for one user, so merging them would silently
 *     change the safety net. A future step may merge them; this step does
 *     not.
 *   - Tier prices $0/$29/$59 are unchanged.
 *
 * THE ONE USER-VISIBLE CHANGE (stated here, in the billing UI, and in
 * docs/pivot/step-4-pricing.md): previously the two counters were
 * independent — in theory a Starter user could use all 300 coach messages
 * AND all 50 write-ups. Now they share one pool, so heavy use of one
 * reduces what is left for the other. Each ceiling is still individually
 * reachable: 300 fast coach messages cost 300 x 0.2 = 60 credits (well
 * inside a Starter month), and the typical write-up mix in
 * docs/pricing.md §4 costs $2.48 = 248 credits. Only the combination of
 * both maxima is no longer free — that combination cost more than the
 * allowance, which is exactly the loss the old design allowed.
 */
import type { PlanId } from "../plans";
import { WEEKLY_GRANTS } from "./costs";

export type UnifiedAllowance = {
  plan: PlanId;
  /** Monthly credit ceiling (the dollar allowance in docs/pricing.md §4, x100). */
  monthlyCreditCap: number;
  /** Monthly dollar allowance, for display in admin views only (the UI shows credits + a progress bar, not dollars — docs/pricing.md §6). */
  monthlyAllowanceUsd: number;
  /** Weekly grant; 0 for Free (Free has a monthly pool, not a weekly grant). */
  weeklyGrantCredits: number;
  /** Free only: hard monthly cap in USD. */
  freeHardCapUsd: number | null;
  /** Count ceilings — unchanged from before Step 4. */
  writeUpCap: number;
  coachTotalCap: number;
  coachDeepCap: number;
  /** Grace on expired weekly buckets, in weeks. */
  graceWeeks: number;
};

export const UNIFIED_ALLOWANCE: Record<PlanId, UnifiedAllowance> = {
  free: {
    plan: "free",
    monthlyCreditCap: 60,
    monthlyAllowanceUsd: 0.6,
    weeklyGrantCredits: 0,
    freeHardCapUsd: 0.6,
    writeUpCap: 3,
    coachTotalCap: 20,
    coachDeepCap: 0,
    graceWeeks: 0,
  },
  starter: {
    plan: "starter",
    monthlyCreditCap: 300,
    monthlyAllowanceUsd: 3.0,
    weeklyGrantCredits: WEEKLY_GRANTS.starter.creditsPerWeek,
    freeHardCapUsd: null,
    writeUpCap: 50,
    coachTotalCap: 300,
    coachDeepCap: 40,
    graceWeeks: 0,
  },
  growth: {
    plan: "growth",
    monthlyCreditCap: 800,
    monthlyAllowanceUsd: 8.0,
    weeklyGrantCredits: WEEKLY_GRANTS.growth.creditsPerWeek,
    freeHardCapUsd: null,
    writeUpCap: 150,
    coachTotalCap: 800,
    coachDeepCap: 100,
    graceWeeks: 1,
  },
};

/** Effective credits a user can actually spend in a 4.33-week month, given weekly expiry. */
export function effectiveMonthlyCredits(plan: PlanId): number {
  const a = UNIFIED_ALLOWANCE[plan];
  if (a.weeklyGrantCredits === 0) return a.monthlyCreditCap;
  return Math.round((a.weeklyGrantCredits * 52) / 12);
}

export type CountUsage = { writeUps: number; coachTotal: number; coachDeep: number };

/**
 * The count check, unchanged in its limits: each kind has its own ceiling.
 * Returns which ceiling (if any) is hit, so the UI can name it.
 */
export function countCeilingHit(plan: PlanId, used: CountUsage): "write-ups" | "coach" | "coach-deep" | null {
  const a = UNIFIED_ALLOWANCE[plan];
  if (used.writeUps >= a.writeUpCap) return "write-ups";
  if (used.coachTotal >= a.coachTotalCap) return "coach";
  if (used.coachDeep >= a.coachDeepCap) return "coach-deep";
  return null;
}

export function countsLeft(plan: PlanId, used: CountUsage): CountUsage {
  const a = UNIFIED_ALLOWANCE[plan];
  return {
    writeUps: Math.max(0, a.writeUpCap - used.writeUps),
    coachTotal: Math.max(0, a.coachTotalCap - used.coachTotal),
    coachDeep: Math.max(0, a.coachDeepCap - used.coachDeep),
  };
}

/** Plain-words summary of the unification, shown on Billing > details. */
export const UNIFICATION_NOTE =
  "Your coach messages and AI write-ups now share one allowance, so heavy use of one leaves less for the other. " +
  "Your message and write-up limits themselves have not changed. " +
  "Free: 60 credits a month, then AI pauses until the 1st. " +
  "Starter: 60 credits every Monday, expiring Sunday night. " +
  "Growth: 180 credits every Monday, expiring Sunday night, with one extra week of grace on anything left over.";
