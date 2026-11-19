/**
 * Step 4 — Pricing: the cost table and the margin maths.
 *
 * Source of every number: docs/pricing.md. Nothing here is invented.
 * 1 credit = $0.01 of provider cost (buffered estimate). Per-action credit
 * costs are the buffered provider cost x 100, to 1 decimal place — charged
 * exactly, not rounded up per action, so the "typical month" in
 * docs/pricing.md (§4: Starter $2.48, Growth $5.78) still fits inside the
 * allowance. Rounding is only for display (whole credits, rounded down).
 *
 * Two caps always apply together: the credit pool (dollars) and the
 * per-kind count ceilings (write-ups 3/50/150, coach messages 20/300/800,
 * deep 0/40/100 — see allowance.ts). Neither count ceiling was raised or
 * lowered; the credit pool is the shared budget they now draw from.
 */

export const CREDIT_USD = 0.01;

/** One AI action Helix can charge for. `tier` is the model tier that does it. */
export type AiActionId =
  | "store-audit"
  | "daily-plan"
  | "chat"
  | "deep-chat"
  | "approval-card"
  | "ad-batch"
  | "email-draft"
  | "flow-draft"
  | "theme-edit"
  | "weekly-report"
  | "constraint-diagnosis"
  | "review-tagging"
  | "trend-adapt"
  | "coach-fast"
  | "coach-deep"
  | "memory-extract"
  | "tier0";

export const ACTION_COSTS: Record<
  AiActionId,
  { credits: number; providerUsd: number; tier: 0 | 1 | 2 | 3; label: string }
> = {
  // docs/pricing.md §3, "With 1.5x buffer" column, x100 = credits.
  "store-audit": { credits: 4.2, providerUsd: 0.042, tier: 1, label: "Store audit" },
  "daily-plan": { credits: 2.3, providerUsd: 0.023, tier: 2, label: "Daily plan" },
  chat: { credits: 1.3, providerUsd: 0.013, tier: 2, label: "Chat message" },
  "deep-chat": { credits: 6.3, providerUsd: 0.063, tier: 3, label: "Deep chat" },
  "approval-card": { credits: 0.9, providerUsd: 0.009, tier: 2, label: "Approval card" },
  "ad-batch": { credits: 13.2, providerUsd: 0.132, tier: 3, label: "Ad batch draft (8 ads)" },
  "email-draft": { credits: 2.2, providerUsd: 0.022, tier: 2, label: "Email draft" },
  "flow-draft": { credits: 16.5, providerUsd: 0.165, tier: 3, label: "Flow draft (5 emails)" },
  "theme-edit": { credits: 16.5, providerUsd: 0.165, tier: 3, label: "Shopify theme edit draft" },
  "weekly-report": { credits: 12.0, providerUsd: 0.12, tier: 3, label: "Weekly report" },
  "constraint-diagnosis": { credits: 9.8, providerUsd: 0.098, tier: 3, label: "Constraint diagnosis" },
  "review-tagging": { credits: 1.1, providerUsd: 0.011, tier: 1, label: "Review tagging (200 reviews)" },
  "trend-adapt": { credits: 1.4, providerUsd: 0.014, tier: 2, label: "Adapt a trend card" },
  // Coach messages use the coach's own models (Haiku 5.5 $0.10/$0.50 in/out),
  // so a fast coach message costs ~$0.002 in real tokens — 0.2 credits.
  // A deep coach message is Sonnet at the docs/pricing.md deep-chat rate
  // without the 1.5x buffer ($0.042), because the coach's own priceOf() is
  // already measured from real usage, not estimated.
  "coach-fast": { credits: 0.2, providerUsd: 0.002, tier: 2, label: "Coach message (fast)" },
  "coach-deep": { credits: 4.2, providerUsd: 0.042, tier: 3, label: "Coach message (deep)" },
  // Memory extraction is a system cost (~$0.0003): never charged to the
  // user, counted only against the $50/month global coach cap.
  "memory-extract": { credits: 0, providerUsd: 0.0003, tier: 1, label: "Memory extraction" },
  tier0: { credits: 0, providerUsd: 0, tier: 0, label: "Rules / maths (no LLM)" },
};

/** Provider cost (USD) of one action, and what the user pays if it comes from the wallet (2x provider cost). */
export function costOf(action: AiActionId): { credits: number; providerUsd: number; walletUsd: number } {
  const c = ACTION_COSTS[action];
  return { credits: c.credits, providerUsd: c.providerUsd, walletUsd: round2(c.providerUsd * 2) };
}

/** Credits for an arbitrary provider-cost figure (e.g. an approval card's estAiCost): $1 = 100 credits, 1 decimal. */
export function creditsForProviderUsd(providerUsd: number): number {
  return Math.round(Math.max(0, providerUsd) * 1000) / 10;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Stripe's cut on a card payment: 2.9% + $0.30. The 0.7% Billing fee
 * applies to subscriptions only, so one-off payments (wallet top-ups, PAYG)
 * do not pay it — that is why docs/pricing.md §4 shows $0.59 on a $10
 * top-up but $1.34 on a $29 subscription. Pass billing=true for
 * subscriptions.
 */
export function stripeFeeUsd(amountUsd: number, billing = false): number {
  return round2(0.3 + amountUsd * (0.029 + (billing ? 0.007 : 0)));
}

/** Wallet top-up options, docs/pricing.md §1. The user can consume provider cost = top-up / 2. */
export const TOP_UP_OPTIONS = [10, 25, 50] as const;
export type TopUpAmount = (typeof TOP_UP_OPTIONS)[number];
export const isTopUpAmount = (n: number): n is TopUpAmount =>
  (TOP_UP_OPTIONS as readonly number[]).includes(n);

/** Margin on one wallet top-up: top-up - Stripe fee - provider cost the user can consume. */
export function topUpMargin(topUpUsd: TopUpAmount): { stripeFee: number; providerCost: number; marginUsd: number; marginPct: number } {
  const stripeFee = stripeFeeUsd(topUpUsd);
  const providerCost = topUpUsd / 2;
  const marginUsd = round2(topUpUsd - stripeFee - providerCost);
  return { stripeFee, providerCost, marginUsd, marginPct: round1((marginUsd / topUpUsd) * 100) };
}

/**
 * Weekly-expiring credit packs (Step 4). Prices are the subscription prices —
 * $0/$29/$59, unchanged — so the "pack" here is the weekly grant inside the
 * plan. The margin proof prices each pack at the provider cost of the
 * credits it contains AT ITS CAP (every credit spent), not at typical use.
 *
 * Effective monthly credits are 60 x 52/12 = 260 (Starter) and 180 x 52/12
 * = 780 (Growth): weekly expiry means ~$0.40/$0.20 of the monthly dollar
 * allowance ($3.00/$8.00) is breakage, never spendable. That breakage is
 * the margin cushion, and it is stated here, not hidden.
 */
export const WEEKLY_GRANTS = {
  free: { creditsPerWeek: 0, graceWeeks: 0 },
  starter: { creditsPerWeek: 60, graceWeeks: 0 },
  growth: { creditsPerWeek: 180, graceWeeks: 1 },
} as const;

/** PAYG pack: $10 = 100 credits, expiring 7 days after purchase. */
export const PAYG_PACK = { priceUsd: 10, credits: 100, expiresDays: 7 } as const;
/** Optional agent add-on: +$29/month for +120 credits/week. */
export const AGENT_ADD_ON = { priceUsd: 29, extraCreditsPerWeek: 120 } as const;

/** Monthly P&L inputs from docs/pricing.md §4 (Stripe, hosting, support). */
export const PLAN_ECONOMICS = {
  free: { price: 0, stripeFee: 0, hosting: 0.05, support: 0, aiAllowanceUsd: 0.6 },
  starter: { price: 29, stripeFee: 1.34, hosting: 1.0, support: 1.5, aiAllowanceUsd: 3.0 },
  growth: { price: 59, stripeFee: 2.42, hosting: 1.5, support: 2.5, aiAllowanceUsd: 8.0 },
} as const;

/**
 * Contribution of one plan month if the user spends every credit they are
 * granted (the cap case). `providerUsdAtCap` is the provider cost of those
 * credits: 1 credit = $0.01 by construction, so the nominal case is exact.
 * Pass a higher per-credit cost (e.g. $0.013, the least efficient action —
 * a generic chat at $0.013 for 1.3 credits) for the worst-case column.
 */
export function contributionAtCap(
  plan: "starter" | "growth",
  providerUsdPerCredit = CREDIT_USD,
): { creditsPerMonth: number; providerUsd: number; contributionUsd: number; contributionPct: number } {
  const grant = WEEKLY_GRANTS[plan].creditsPerWeek;
  const creditsPerMonth = Math.round((grant * 52) / 12);
  const providerUsd = round2(creditsPerMonth * providerUsdPerCredit);
  const e = PLAN_ECONOMICS[plan];
  const contributionUsd = round2(e.price - e.stripeFee - providerUsd - e.hosting - e.support);
  return { creditsPerMonth, providerUsd, contributionUsd, contributionPct: round1((contributionUsd / e.price) * 100) };
}

/** Contribution of a PAYG pack or the agent add-on at its cap. */
export function packContribution(pack: "payg" | "add-on"): {
  priceUsd: number;
  stripeFee: number;
  providerUsd: number;
  contributionUsd: number;
  contributionPct: number;
} {
  if (pack === "payg") {
    const providerUsd = PAYG_PACK.credits * CREDIT_USD;
    const stripeFee = stripeFeeUsd(PAYG_PACK.priceUsd);
    const contributionUsd = round2(PAYG_PACK.priceUsd - stripeFee - providerUsd);
    return { priceUsd: PAYG_PACK.priceUsd, stripeFee, providerUsd, contributionUsd, contributionPct: round1((contributionUsd / PAYG_PACK.priceUsd) * 100) };
  }
  const creditsPerMonth = Math.round((AGENT_ADD_ON.extraCreditsPerWeek * 52) / 12);
  const providerUsd = round2(creditsPerMonth * CREDIT_USD);
  const stripeFee = stripeFeeUsd(AGENT_ADD_ON.priceUsd, true); // a subscription: +0.7% Billing
  // Add-on shares the plan's hosting/support, so only its own Stripe fee and
  // AI cost are charged against it here; the plan P&L carries the rest.
  const contributionUsd = round2(AGENT_ADD_ON.priceUsd - stripeFee - providerUsd);
  return { priceUsd: AGENT_ADD_ON.priceUsd, stripeFee, providerUsd, contributionUsd, contributionPct: round1((contributionUsd / AGENT_ADD_ON.priceUsd) * 100) };
}
