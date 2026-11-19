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
import { hasDb, prisma } from "../db";

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

/**
 * All usage events across orgs, for the admin margin view (finishing step).
 * Reads every ToolInput row of kind "pricing". In-memory/demo mode there is
 * no cross-user store, so it returns [] and the admin view says so.
 */
export async function allOrgsUsageEvents(): Promise<UsageEvent[]> {
  if (!hasDb) return [];
  const rows = await prisma.toolInput.findMany({ where: { kind: "pricing" }, select: { data: true } });
  const events: UsageEvent[] = [];
  for (const r of rows) {
    const state = r.data as Partial<PricingState> | null;
    for (const e of state?.usageEvents ?? []) events.push(e);
  }
  return events;
}

/** Margin dashboard data for one org's events (all-orgs: see allOrgsUsageEvents). */
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
