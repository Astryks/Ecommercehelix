/**
 * Step 4 — Server view: what Billing shows, and the admin margin dashboard.
 *
 * Billing shows credits + a progress bar, not a dollar figure, unless the
 * user opens details (docs/pricing.md §6). The margin dashboard aggregates
 * the usage events the cost guard writes on every settle (guarantee 9).
 */
import "server-only";
import type { PlanId } from "../plans";
import { UNIFIED_ALLOWANCE, UNIFICATION_NOTE, countsLeft } from "./allowance";
import { marginAlert, marginBy, type UsageEvent } from "./cost-guard";
import { PLAN_ECONOMICS } from "./costs";
import { ensureWeeklyGrant, getPricingState, pricingSummary, type PricingState } from "./store";

export type PricingView = {
  plan: PlanId;
  monthlyCap: number;
  creditsSpentThisMonth: number;
  creditsLeftThisWeek: number;
  weeklyGrant: number;
  walletBalanceUsd: number;
  buckets: PricingState["buckets"];
  counts: PricingState["counts"];
  countsLeft: PricingState["counts"];
  autoTopUp: PricingState["autoTopUp"];
  usageHistory: UsageEvent[];
  ledger: PricingState["ledger"];
  unificationNote: string;
  marginAlert: boolean;
};

export async function getPricingView(userId: string, plan: PlanId, addOnActive = false, now = new Date()): Promise<PricingView> {
  const raw = await getPricingState(userId);
  const state = ensureWeeklyGrant(raw, plan, addOnActive, now);
  const summary = pricingSummary(state, plan);
  const allowance = UNIFIED_ALLOWANCE[plan];
  const providerUsdThisMonth = state.usageEvents
    .filter((e) => e.at.slice(0, 7) === state.monthKey)
    .reduce((a, e) => a + e.providerUsd, 0);
  return {
    plan,
    monthlyCap: summary.monthlyCap,
    creditsSpentThisMonth: summary.creditsSpentThisMonth,
    creditsLeftThisWeek: summary.creditsLeftThisWeek,
    weeklyGrant: allowance.weeklyGrantCredits,
    walletBalanceUsd: summary.walletBalanceUsd,
    buckets: summary.buckets,
    counts: summary.counts,
    countsLeft: countsLeft(plan, summary.counts),
    autoTopUp: state.autoTopUp,
    usageHistory: [...state.usageEvents].slice(-20).reverse(),
    ledger: [...state.ledger].slice(-20).reverse(),
    unificationNote: UNIFICATION_NOTE,
    marginAlert: marginAlert({ providerUsdThisMonth, allowanceUsd: allowance.monthlyAllowanceUsd, now }),
  };
}

export type MarginView = {
  byPlan: ReturnType<typeof marginBy>;
  byFeature: ReturnType<typeof marginBy>;
  byOrg: ReturnType<typeof marginBy>;
  alertOrgs: string[];
};

/** Margin dashboard data for one org's events (the all-orgs view needs an admin role — not built in Step 4). */
export function marginView(events: UsageEvent[], planPrices: Record<PlanId, number>, now = new Date()): MarginView {
  const byPlan = marginBy(events, "plan", planPrices);
  const byFeature = marginBy(events, "feature", planPrices);
  const byOrg = marginBy(events, "org", planPrices);
  const monthKey = now.toISOString().slice(0, 7);
  const alertOrgs = [...new Set(
    events
      .filter((e) => e.at.slice(0, 7) === monthKey)
      .filter((e) => {
        const monthSpend = events
          .filter((x) => x.orgId === e.orgId && x.at.slice(0, 7) === monthKey)
          .reduce((a, x) => a + x.providerUsd, 0);
        return marginAlert({ providerUsdThisMonth: monthSpend, allowanceUsd: PLAN_ECONOMICS[e.plan].aiAllowanceUsd, now });
      })
      .map((e) => e.orgId),
  )];
  return { byPlan, byFeature, byOrg, alertOrgs };
}
