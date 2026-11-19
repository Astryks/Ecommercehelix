/**
 * Step 4 — Pricing state: wallet, credit buckets, ledger, usage events.
 *
 * Persistence follows the established pattern (see src/lib/agent/settings.ts):
 * a ToolInput row (kind "pricing") when a database is present, an in-memory
 * map in demo mode. The Prisma models in schema.prisma (WalletLedger,
 * CreditBucket, UsageEvent) are the durable shape for production; this
 * module is the runtime that works with or without the database, the same
 * way agent settings and the journey level already do.
 *
 * Money rules enforced here (never in the UI):
 * - Wallet balance never goes below zero (a top-up that would overdraw is refused).
 * - Ledger entries are append-only; a hold is always followed by a charge or
 *   a release. Refunds only ever return unused wallet balance, never
 *   consumed AI (guarantee 10).
 * - Auto top-up is OFF by default. Turning it on is opt-in, with a monthly
 *   ceiling the owner sets (guarantee: docs/pricing.md §1).
 * - Demo mode: top-ups are recorded as demo credit and labelled "Demo
 *   credit — no real charge", mirroring the existing demo plan switch. A
 *   demo top-up never claims to be a Stripe charge.
 */
import "server-only";
import { hasDb } from "../db";
import { getInput, saveInput } from "../tools/server";
import type { PlanId } from "../plans";
import {
  PAYG_PACK,
  TOP_UP_OPTIONS,
  isTopUpAmount,
  stripeFeeUsd,
  type TopUpAmount,
} from "./costs";
import {
  expireBuckets,
  mondayOfWeek,
  nextWeeklyBucket,
  paygBucket,
  quoteForProviderUsd,
  reserve,
  settle,
  type CreditBucket,
  type Reservation,
  type UsageEvent,
} from "./cost-guard";
import { UNIFIED_ALLOWANCE } from "./allowance";

export const PRICING_KIND = "pricing";

export type LedgerEntry = {
  id: string;
  type: "topup" | "hold" | "charge" | "release" | "refund" | "payg";
  amountUsd: number; // + in, - out
  credits?: number;
  at: string;
  ref?: string;
  demo?: boolean;
  note?: string;
};

export type PricingState = {
  version: 1;
  walletBalanceUsd: number;
  ledger: LedgerEntry[];
  buckets: CreditBucket[];
  usageEvents: UsageEvent[];
  monthKey: string; // YYYY-MM
  creditsSpentThisMonth: number;
  freeSpentCredits: number;
  counts: { writeUps: number; coachTotal: number; coachDeep: number };
  dayKey: string; // YYYY-MM-DD, for per-day caps
  deepChatsToday: number;
  trendAdaptsToday: number;
  auditHourKey: string; // YYYY-MM-DDTHH
  auditsThisHour: number;
  autoTopUp: { enabled: boolean; amount: TopUpAmount; ceilingUsd: number; spentThisMonthUsd: number } | null;
  /** Approvals whose AI cost has already been covered (taskId -> credits). The executor checks this. */
  coveredApprovals: Record<string, { credits: number; at: string }>;
  lastWeeklyGrantWeekKey: string | null;
};

export function emptyPricingState(now = new Date()): PricingState {
  return {
    version: 1,
    walletBalanceUsd: 0,
    ledger: [],
    buckets: [],
    usageEvents: [],
    monthKey: now.toISOString().slice(0, 7),
    creditsSpentThisMonth: 0,
    freeSpentCredits: 0,
    counts: { writeUps: 0, coachTotal: 0, coachDeep: 0 },
    dayKey: now.toISOString().slice(0, 10),
    deepChatsToday: 0,
    trendAdaptsToday: 0,
    auditHourKey: now.toISOString().slice(0, 13),
    auditsThisHour: 0,
    autoTopUp: null,
    coveredApprovals: {},
    lastWeeklyGrantWeekKey: null,
  };
}

const g = globalThis as unknown as { __helixPricing?: Map<string, PricingState> };
const mem = (g.__helixPricing ??= new Map<string, PricingState>());

export async function getPricingState(userId: string): Promise<PricingState> {
  if (!hasDb) return mem.get(userId) ?? emptyPricingState();
  const stored = await getInput<Partial<PricingState>>(userId, PRICING_KIND, {});
  const base = emptyPricingState();
  return { ...base, ...stored, counts: { ...base.counts, ...(stored.counts ?? {}) } };
}

export async function savePricingState(userId: string, state: PricingState): Promise<void> {
  if (!hasDb) {
    mem.set(userId, state);
    return;
  }
  await saveInput(userId, PRICING_KIND, state);
}

/** Reset the monthly / daily counters when the calendar has moved on. Pure on the state object. */
export function rollover(state: PricingState, now = new Date()): PricingState {
  const monthKey = now.toISOString().slice(0, 7);
  const dayKey = now.toISOString().slice(0, 10);
  const auditHourKey = now.toISOString().slice(0, 13);
  const next = { ...state };
  if (next.monthKey !== monthKey) {
    next.monthKey = monthKey;
    next.creditsSpentThisMonth = 0;
    next.freeSpentCredits = 0;
    next.counts = { writeUps: 0, coachTotal: 0, coachDeep: 0 };
    if (next.autoTopUp) next.autoTopUp = { ...next.autoTopUp, spentThisMonthUsd: 0 };
  }
  if (next.dayKey !== dayKey) {
    next.dayKey = dayKey;
    next.deepChatsToday = 0;
    next.trendAdaptsToday = 0;
  }
  if (next.auditHourKey !== auditHourKey) {
    next.auditHourKey = auditHourKey;
    next.auditsThisHour = 0;
  }
  return next;
}

function pushLedger(state: PricingState, e: Omit<LedgerEntry, "id" | "at"> & { at?: string }): PricingState {
  const entry: LedgerEntry = { ...e, id: `led_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`, at: e.at ?? new Date().toISOString() };
  const ledger = [...state.ledger, entry].slice(-200);
  return { ...state, ledger };
}

function pushUsage(state: PricingState, e: UsageEvent): PricingState {
  return { ...state, usageEvents: [...state.usageEvents, e].slice(-500) };
}

/**
 * Grant this week's credits if they have not been granted yet (idempotent
 * per weekKey). Expires old buckets first (Growth grace applied). Free
 * gets no weekly grant — its 60-credit monthly pool is the allowance.
 */
export function ensureWeeklyGrant(state: PricingState, plan: PlanId, addOnActive = false, now = new Date()): PricingState {
  let next = rollover(state, now);
  const expired = expireBuckets(next.buckets, plan, now);
  next = { ...next, buckets: expired.kept };
  const weekKey = mondayOfWeek(now);
  if (next.lastWeeklyGrantWeekKey === weekKey) return next;
  const bucket = nextWeeklyBucket({ plan, addOnActive, weekKey, now });
  if (!bucket) return { ...next, lastWeeklyGrantWeekKey: weekKey };
  return { ...next, buckets: [...next.buckets, bucket], lastWeeklyGrantWeekKey: weekKey };
}

/**
 * Top up the wallet. `demo` is true only in demo mode (no Stripe keys, no
 * database) — the credit is then labelled demo and is never presented as a
 * real charge. Real top-ups go through Stripe Checkout; this function only
 * records a top-up that Stripe has already confirmed (via the webhook) or a
 * demo one. It never creates a charge itself.
 */
export function topUpWallet(
  state: PricingState,
  amountUsd: number,
  opts: { demo: boolean; ref?: string } = { demo: false },
): { state: PricingState } | { state: PricingState; error: string } {
  if (!isTopUpAmount(amountUsd)) {
    return { state, error: `Top-ups are $${TOP_UP_OPTIONS.join(", $")} — $${amountUsd} is not one of them.` };
  }
  const fee = stripeFeeUsd(amountUsd);
  const next = pushLedger(state, {
    type: "topup",
    amountUsd,
    demo: opts.demo || undefined,
    ref: opts.ref,
    note: opts.demo ? "Demo credit — no real charge" : `Stripe fee about $${fee.toFixed(2)}`,
  });
  return { state: { ...next, walletBalanceUsd: Math.round((next.walletBalanceUsd + amountUsd) * 100) / 100 } };
}

/**
 * Buy a PAYG pack: $10 = 500 credits, expiring 7 days after purchase.
 * Pay from the wallet (deducts $10 of balance) or by card — card purchases
 * need Stripe, so without it the purchase is refused, never faked.
 */
export function buyPaygPack(
  state: PricingState,
  payFrom: "wallet" | "card",
  stripeConfigured: boolean,
  now = new Date(),
): { state: PricingState; bucket: CreditBucket } | { state: PricingState; error: string } {
  if (payFrom === "card" && !stripeConfigured) {
    return { state, error: "Card payments are not set up yet (Stripe is not connected). Top up the wallet instead, or ask us to connect Stripe." };
  }
  let next = state;
  if (payFrom === "wallet") {
    if (next.walletBalanceUsd < PAYG_PACK.priceUsd) {
      return { state, error: `The wallet has $${next.walletBalanceUsd.toFixed(2)} and a PAYG pack costs $${PAYG_PACK.priceUsd}. Top up first.` };
    }
    next = { ...next, walletBalanceUsd: Math.round((next.walletBalanceUsd - PAYG_PACK.priceUsd) * 100) / 100 };
  }
  const bucket = paygBucket(now);
  next = pushLedger(next, { type: "payg", amountUsd: -PAYG_PACK.priceUsd, credits: PAYG_PACK.credits, ref: bucket.id, note: `PAYG pack: ${PAYG_PACK.credits} credits, expires ${bucket.expiresAt.slice(0, 10)}` });
  return { state: { ...next, buckets: [...next.buckets, bucket] }, bucket };
}

/** Load the state with this week's grant applied (call before any authorize/quote). */
export async function loadPricingState(userId: string, plan: PlanId, addOnActive = false, now = new Date()): Promise<PricingState> {
  const raw = await getPricingState(userId);
  return ensureWeeklyGrant(raw, plan, addOnActive, now);
}

/** Bump a count ceiling counter (display mirror only — AiUsage/CoachUsage tables stay the source of truth for the hard ceilings). */
export function recordCount(state: PricingState, key: "writeUps" | "coachTotal" | "coachDeep", by = 1): PricingState {
  return { ...state, counts: { ...state.counts, [key]: state.counts[key] + by } };
}

export function bumpDailyCount(state: PricingState, key: "deepChatsToday" | "trendAdaptsToday" | "auditsThisHour", by = 1): PricingState {
  return { ...state, [key]: state[key] + by };
}

/** Grant a PAYG bucket paid by card (Stripe webhook path) — no wallet deduction, the card already took the $10. */
export function grantPaygPack(state: PricingState, ref: string, now = new Date()): { state: PricingState; bucket: CreditBucket } {
  const bucket = paygBucket(now);
  const next = pushLedger(state, { type: "payg", amountUsd: 0, credits: PAYG_PACK.credits, ref, note: `PAYG pack paid by card: ${PAYG_PACK.credits} credits, expires ${bucket.expiresAt.slice(0, 10)}` });
  return { state: { ...next, buckets: [...next.buckets, bucket] }, bucket };
}

/** Refund unused wallet balance only (guarantee 10). Never refunds consumed AI. */
export function refundWallet(
  state: PricingState,
  amountUsd: number,
): { state: PricingState } | { state: PricingState; error: string } {
  if (amountUsd <= 0) return { state, error: "Refund amount must be above $0." };
  if (amountUsd > state.walletBalanceUsd) {
    return { state, error: `Only $${state.walletBalanceUsd.toFixed(2)} of unused wallet balance is left to refund. Consumed AI is never refunded.` };
  }
  const next = pushLedger(state, { type: "refund", amountUsd: -amountUsd, note: "Refund of unused wallet balance" });
  return { state: { ...next, walletBalanceUsd: Math.round((next.walletBalanceUsd - amountUsd) * 100) / 100 } };
}

/** Auto top-up: off by default, opt-in only, with a monthly ceiling. */
export function setAutoTopUp(
  state: PricingState,
  pref: { enabled: boolean; amount: TopUpAmount; ceilingUsd: number } | null,
): { state: PricingState } | { state: PricingState; error: string } {
  if (pref && !isTopUpAmount(pref.amount)) return { state, error: "Auto top-up amount must be $10, $25 or $50." };
  if (pref && pref.ceilingUsd < pref.amount) {
    return { state, error: `The monthly ceiling ($${pref.ceilingUsd}) has to cover at least one top-up ($${pref.amount}).` };
  }
  const next = pref
    ? { ...state, autoTopUp: { ...pref, spentThisMonthUsd: state.autoTopUp?.spentThisMonthUsd ?? 0 } }
    : { ...state, autoTopUp: null };
  return { state: next };
}

export type AuthorizeInput = {
  action: Parameters<typeof reserve>[0]["action"];
  feature: string;
  plan: PlanId;
  /** For approval cards created by Steps 1–3: the known provider cost in $, used instead of the action table. */
  providerUsdOverride?: number;
  now?: Date;
};

/**
 * Reserve-then-charge, step 1: place the hold. On success the state is
 * returned with the hold applied (buckets reduced, wallet held in the
 * ledger); call settleReservation() after the call with the real cost.
 * On refusal nothing is taken and the caller gets the plain-words reason.
 */
export function authorize(
  state: PricingState,
  input: AuthorizeInput,
): { state: PricingState; reservation: Reservation } | { state: PricingState; error: string; walletCostUsd: number } {
  const now = input.now ?? new Date();
  const next = rollover(state, now);
  const creditsNeeded =
    input.providerUsdOverride !== undefined
      ? Math.round(input.providerUsdOverride * 1000) / 10
      : undefined;
  const r = reserve({
    action: input.action,
    plan: input.plan,
    freeSpentCredits: next.freeSpentCredits,
    buckets: next.buckets,
    walletBalanceUsd: next.walletBalanceUsd,
    now,
    creditsOverride: creditsNeeded,
  });
  if (!r.ok) return { state: next, error: r.message, walletCostUsd: r.walletCostUsd };
  const reservation = r.reservation;
  // Apply the hold: reduce bucket balances oldest-expiring first (the same
  // order reserve() took them in), hold the wallet share in the ledger.
  const byId = new Map(next.buckets.map((b) => [b.id, { ...b }]));
  let allowanceLeft = reservation.taken.filter((t) => t.source === "allowance").reduce((a, t) => a + t.credits, 0);
  for (const b of [...byId.values()].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))) {
    if (allowanceLeft <= 0) break;
    const take = Math.min(b.remaining, allowanceLeft);
    b.remaining = Math.round((b.remaining - take) * 10) / 10;
    allowanceLeft = Math.round((allowanceLeft - take) * 10) / 10;
  }
  const buckets = next.buckets.map((b) => byId.get(b.id) ?? b);
  const held = pushLedger({ ...next, buckets }, {
    type: "hold",
    amountUsd: -reservation.walletUsdReserved,
    credits: reservation.creditsReserved,
    ref: reservation.id,
    note: `${input.feature}: hold for ${reservation.action}`,
  });
  return {
    state: { ...held, walletBalanceUsd: Math.round((held.walletBalanceUsd - reservation.walletUsdReserved) * 100) / 100 },
    reservation,
  };
}

/** Reserve-then-charge, step 2: charge the real cost, release the rest. */
export function settleReservation(
  state: PricingState,
  reservation: Reservation,
  actualProviderUsd: number,
  p: { userId: string; orgId: string; plan: PlanId; feature: string; now?: Date },
): PricingState {
  const s = settle(reservation, actualProviderUsd);
  let next = state;
  // Return released allowance credits to the buckets they were held from
  // (oldest-expiring first, the order the hold took them in).
  if (s.creditsReleased > 0 && reservation.bucketIds.length > 0) {
    let toReturn = s.creditsReleased;
    const buckets = next.buckets.map((b) => ({ ...b }));
    for (const id of reservation.bucketIds) {
      if (toReturn <= 0) break;
      const b = buckets.find((x) => x.id === id);
      if (!b) continue;
      const room = Math.round((b.credits - b.remaining) * 10) / 10;
      const back = Math.min(room, toReturn);
      b.remaining = Math.round((b.remaining + back) * 10) / 10;
      toReturn = Math.round((toReturn - back) * 10) / 10;
    }
    next = { ...next, buckets };
  }
  // Return the released wallet hold.
  if (s.walletUsdReleased > 0) {
    next = pushLedger(next, { type: "release", amountUsd: s.walletUsdReleased, credits: s.creditsReleased, ref: reservation.id, note: `Released unused hold for ${reservation.action}` });
    next = { ...next, walletBalanceUsd: Math.round((next.walletBalanceUsd + s.walletUsdReleased) * 100) / 100 };
  }
  // Charge what was actually spent.
  const walletSpent = s.walletUsdSpent;
  if (s.creditsSpent > 0 || walletSpent > 0) {
    next = pushLedger(next, {
      type: "charge",
      amountUsd: -walletSpent,
      credits: s.creditsSpent,
      ref: reservation.id,
      note: `${p.feature}: ${reservation.action}, actual provider cost $${Math.max(0, actualProviderUsd).toFixed(4)}`,
    });
  }
  next = {
    ...next,
    creditsSpentThisMonth: Math.round((next.creditsSpentThisMonth + s.creditsSpent) * 10) / 10,
    freeSpentCredits:
      p.plan === "free"
        ? Math.round((next.freeSpentCredits + s.creditsSpent) * 10) / 10
        : next.freeSpentCredits,
  };
  const event: UsageEvent = {
    id: `ue_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
    userId: p.userId,
    orgId: p.orgId,
    plan: p.plan,
    feature: p.feature,
    action: reservation.action,
    credits: s.creditsSpent,
    providerUsd: Math.round(Math.max(0, actualProviderUsd) * 10000) / 10000,
    billedUsd: walletSpent,
    at: (p.now ?? new Date()).toISOString(),
  };
  next = pushUsage(next, event);
  return next;
}

/** Quote an approval card's AI cost (provider $ from Steps 1–3) against the state. No reservation is made. */
export function quoteApprovalCost(
  state: PricingState,
  plan: PlanId,
  providerUsd: number,
): { credits: number; paysFrom: string; covered: boolean; walletCostUsd: number } {
  return quoteForProviderUsd(providerUsd, {
    plan,
    freeSpentCredits: state.freeSpentCredits,
    buckets: state.buckets,
    walletBalanceUsd: state.walletBalanceUsd,
  });
}

/** Mark an approval as paid for, so the executor can run it. */
export function markApprovalCovered(state: PricingState, taskId: string, credits: number, now = new Date()): PricingState {
  return { ...state, coveredApprovals: { ...state.coveredApprovals, [taskId]: { credits, at: now.toISOString() } } };
}

export function isApprovalCovered(state: PricingState, taskId: string): boolean {
  return Boolean(state.coveredApprovals[taskId]);
}

/** The allowance summary the billing page shows: credits used / granted this period, wallet, buckets. */
export function pricingSummary(state: PricingState, plan: PlanId): {
  monthlyCap: number;
  creditsSpentThisMonth: number;
  creditsLeftThisWeek: number;
  walletBalanceUsd: number;
  buckets: CreditBucket[];
  counts: PricingState["counts"];
} {
  const cap = UNIFIED_ALLOWANCE[plan].monthlyCreditCap;
  const weeklyLeft = Math.round(state.buckets.reduce((a, b) => a + Math.max(0, b.remaining), 0) * 10) / 10;
  return {
    monthlyCap: cap,
    creditsSpentThisMonth: state.creditsSpentThisMonth,
    creditsLeftThisWeek: weeklyLeft,
    walletBalanceUsd: state.walletBalanceUsd,
    buckets: state.buckets,
    counts: state.counts,
  };
}
