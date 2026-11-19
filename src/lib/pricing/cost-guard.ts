/**
 * Step 4 — The cost guard (guarantees 1–8 of docs/pricing.md §5).
 *
 * Pure functions only: no database, no Stripe, no model calls. The server
 * layer (store.ts / server.ts) supplies state and persists the result, so
 * every rule below is unit-testable without a database.
 *
 * Bucket order (guarantee 3): free cap -> plan allowance -> wallet.
 *   - Free plan: a monthly pool of 60 credits ($0.60 hard cap, §4).
 *   - Paid plans: weekly buckets, oldest-expiring first. A bucket that
 *     cannot cover the whole reservation is never half-spent: the guard
 *     takes what it can from allowance and the rest from the wallet, or
 *     refuses with the shortfall and the wallet price.
 *   - Wallet: billed at 2x provider cost. The reservation is the *maximum*
 *     cost (buffered estimate); settle() charges the real cost and releases
 *     the rest (guarantee 2).
 *
 * A reservation is never silent: a refused action returns why it was
 * refused and what it would cost, so the UI can say so in plain words.
 */
import {
  ACTION_COSTS,
  CREDIT_USD,
  PAYG_PACK,
  WEEKLY_GRANTS,
  creditsForProviderUsd,
  round1,
  round2,
  type AiActionId,
} from "./costs";

export type BucketSource = "free-cap" | "allowance" | "wallet";
export type PlanId = "free" | "starter" | "growth";

/** One weekly (or PAYG) grant of credits. `grace` marks a Growth bucket in its 1-week grace period. */
export type CreditBucket = {
  id: string;
  kind: "weekly" | "payg" | "addon";
  credits: number;
  remaining: number;
  grantedAt: string; // ISO
  expiresAt: string; // ISO
  grace?: boolean;
};

/** A hold placed before an LLM call (guarantee 2). */
export type Reservation = {
  id: string;
  action: AiActionId;
  creditsReserved: number;
  providerUsdReserved: number;
  /** Where the credits come from, in order. Wallet entries carry the USD the user will pay (2x provider). */
  taken: { source: BucketSource; credits: number; walletUsd: number }[];
  bucketIds: string[];
  walletUsdReserved: number;
  createdAt: string;
};

export type ReserveResult =
  | { ok: true; reservation: Reservation }
  | {
      ok: false;
      reason: "insufficient";
      creditsNeeded: number;
      creditsAvailable: number;
      shortfallCredits: number;
      /** What the shortfall would cost from the wallet (2x provider, $). */
      walletCostUsd: number;
      /** What the whole action would cost from the wallet if no allowance were left. */
      fullWalletCostUsd: number;
      message: string;
    };

/** Hard caps per call / per day (guarantee 4). From docs/pricing.md §5 + the coach's own limits. */
export const HARD_CAPS = {
  maxTokensPerTier: { 0: 0, 1: 4000, 2: 12000, 3: 30000 } as Record<0 | 1 | 2 | 3, number>,
  maxDeepChatsPerDay: 10,
  maxAuditsPerHourPerOrg: 3,
  maxTrendAdaptsPerDay: 4,
  /** Free plan: monthly model-cost hard cap, USD (docs/pricing.md §4). */
  freeMonthlyCapUsd: 0.6,
  /** Free plan: worst realistic month, USD — used for the "about to pause" warning, not as a cap. */
  freeTypicalUsd: 0.38,
} as const;

export type DailyCounts = {
  deepChatsToday: number;
  auditsThisHour: number;
  trendAdaptsToday: number;
};

/** Which hard cap (if any) a planned call would break. */
export function hardCapViolation(action: AiActionId, counts: DailyCounts): string | null {
  if (action === "deep-chat" || action === "coach-deep") {
    if (counts.deepChatsToday >= HARD_CAPS.maxDeepChatsPerDay)
      return `Deep chats are capped at ${HARD_CAPS.maxDeepChatsPerDay} a day. Try again tomorrow, or ask the fast coach.`;
  }
  if (action === "store-audit" && counts.auditsThisHour >= HARD_CAPS.maxAuditsPerHourPerOrg)
    return `Store audits are capped at ${HARD_CAPS.maxAuditsPerHourPerOrg} an hour. Audits are cached for 7 days, so a re-check of the same store costs nothing.`;
  if (action === "trend-adapt" && counts.trendAdaptsToday >= HARD_CAPS.maxTrendAdaptsPerDay)
    return `Trend adaptations are capped at ${HARD_CAPS.maxTrendAdaptsPerDay} a day.`;
  return null;
}

/** Pre-flight estimate (guarantee 1): maximum cost of an action, before any LLM call. */
export function estimate(action: AiActionId): { credits: number; providerUsd: number; walletUsd: number; tier: 0 | 1 | 2 | 3 } {
  const c = ACTION_COSTS[action];
  return { credits: c.credits, providerUsd: c.providerUsd, walletUsd: round2(c.providerUsd * 2), tier: c.tier };
}

/** Credits left across a set of buckets (expired buckets must already be removed by expireBuckets). */
export function allowanceRemaining(buckets: CreditBucket[]): number {
  return round1(buckets.reduce((a, b) => a + Math.max(0, b.remaining), 0));
}

/**
 * Reserve-then-charge (guarantees 2–3). Takes from the free monthly pool
 * first (free plan), then weekly allowance buckets oldest-expiring first,
 * then the wallet. Never takes a partial credit from a bucket it cannot
 * cover in full from the remaining buckets + wallet: if the total cannot
 * cover the reservation, nothing is taken and the action does not run.
 */
export function reserve(p: {
  action: AiActionId;
  plan: PlanId;
  /** Free plan only: credits already spent this month (0–60). */
  freeSpentCredits: number;
  buckets: CreditBucket[];
  walletBalanceUsd: number;
  now?: Date;
  /**
   * Override the table cost (credits) — used for approval cards created by
   * Steps 1–3, which carry their own estAiCost in provider $. When set, the
   * reservation is for exactly this many credits.
   */
  creditsOverride?: number;
}): ReserveResult {
  const est = estimate(p.action);
  const creditsNeeded = p.creditsOverride ?? est.credits;
  if (creditsNeeded === 0) {
    return {
      ok: true,
      reservation: {
        id: `res_${Date.now().toString(36)}`,
        action: p.action,
        creditsReserved: 0,
        providerUsdReserved: 0,
        taken: [],
        bucketIds: [],
        walletUsdReserved: 0,
        createdAt: (p.now ?? new Date()).toISOString(),
      },
    };
  }
  const taken: Reservation["taken"] = [];
  const bucketIds: string[] = [];
  let left = creditsNeeded;
  // Free plan: the monthly pool is the first bucket.
  if (p.plan === "free") {
    const freeLeft = Math.max(0, 60 - p.freeSpentCredits);
    const take = Math.min(freeLeft, left);
    if (take > 0) {
      taken.push({ source: "free-cap", credits: round1(take), walletUsd: 0 });
      left = round1(left - take);
    }
  }
  // Paid plans: weekly buckets, oldest-expiring first.
  const ordered = [...p.buckets].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
  for (const b of ordered) {
    if (left <= 0) break;
    const take = Math.min(Math.max(0, b.remaining), left);
    if (take > 0) {
      taken.push({ source: "allowance", credits: round1(take), walletUsd: 0 });
      bucketIds.push(b.id);
      left = round1(left - take);
    }
  }
  // Wallet: 2x provider cost on the remaining credits.
  let walletUsdReserved = 0;
  if (left > 0) {
    const walletUsdNeeded = round2(left * CREDIT_USD * 2);
    if (p.walletBalanceUsd < walletUsdNeeded) {
      const available = round1(
        (p.plan === "free" ? Math.max(0, 60 - p.freeSpentCredits) : 0) +
          allowanceRemaining(p.buckets),
      );
      return {
        ok: false,
        reason: "insufficient",
        creditsNeeded,
        creditsAvailable: available,
        shortfallCredits: round1(creditsNeeded - available),
        walletCostUsd: walletUsdNeeded,
        fullWalletCostUsd: round2(creditsNeeded * CREDIT_USD * 2),
        message:
          p.plan === "free"
            ? `This needs ${creditsNeeded} credits and your Free plan has ${available} left this month. The scorecard, guides and rules-based checks keep working. Upgrade to Starter for 60 credits a week, or top up the wallet.`
            : `This needs ${creditsNeeded} credits and you have ${available} left in this week's allowance. Top up the wallet ($${walletUsdNeeded} would cover this one) or wait for Monday's fresh weekly credits.`,
      };
    }
    taken.push({ source: "wallet", credits: round1(left), walletUsd: walletUsdNeeded });
    walletUsdReserved = walletUsdNeeded;
    left = 0;
  }
  return {
    ok: true,
    reservation: {
      id: `res_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
      action: p.action,
      creditsReserved: creditsNeeded,
      providerUsdReserved: round2(creditsNeeded * CREDIT_USD),
      taken,
      bucketIds,
      walletUsdReserved,
      createdAt: (p.now ?? new Date()).toISOString(),
    },
  };
}

/**
 * Settle a reservation after the call (guarantee 2): charge the REAL cost,
 * release the rest. `actualProviderUsd` is measured from real token usage.
 * Returns the credits actually spent and the wallet USD actually spent, so
 * the store can apply them. A failed call (actual 0) releases everything.
 */
export function settle(reservation: Reservation, actualProviderUsd: number): {
  creditsSpent: number;
  walletUsdSpent: number;
  creditsReleased: number;
  walletUsdReleased: number;
} {
  const actualCredits = round1(Math.min(reservation.creditsReserved, Math.max(0, actualProviderUsd) * 100));
  const creditsReleased = round1(reservation.creditsReserved - actualCredits);
  // Wallet spend is proportional: wallet covered (creditsReserved - allowance
  // credits) of the reservation; charge it the same fraction of the real cost.
  const walletCredits = reservation.taken.filter((t) => t.source === "wallet").reduce((a, t) => a + t.credits, 0);
  const walletShare = reservation.creditsReserved > 0 ? walletCredits / reservation.creditsReserved : 0;
  const walletUsdSpent = round2(actualCredits * CREDIT_USD * 2 * walletShare);
  return {
    creditsSpent: actualCredits,
    walletUsdSpent,
    creditsReleased,
    walletUsdReleased: round2(reservation.walletUsdReserved - walletUsdSpent),
  };
}

/** Quote an action for an approval card: estimated cost + which bucket pays. Pure — no reservation is made. */
export function quote(action: AiActionId, p: { plan: PlanId; freeSpentCredits: number; buckets: CreditBucket[]; walletBalanceUsd: number }): {
  credits: number;
  providerUsd: number;
  paysFrom: "plan allowance" | "wallet" | "free allowance" | "free allowance + wallet" | "allowance + wallet" | "not covered";
  walletUsdIfNeeded: number;
  covered: boolean;
} {
  const est = estimate(action);
  if (est.credits === 0) return { credits: 0, providerUsd: 0, paysFrom: "plan allowance", walletUsdIfNeeded: 0, covered: true };
  const r = reserve({ action, plan: p.plan, freeSpentCredits: p.freeSpentCredits, buckets: p.buckets, walletBalanceUsd: p.walletBalanceUsd });
  if (!r.ok) {
    return { credits: est.credits, providerUsd: est.providerUsd, paysFrom: "not covered", walletUsdIfNeeded: r.walletCostUsd, covered: false };
  }
  const sources = new Set(r.reservation.taken.map((t) => t.source));
  const paysFrom =
    sources.has("wallet") && sources.size === 1
      ? "wallet"
      : sources.has("wallet")
        ? p.plan === "free"
          ? "free allowance + wallet"
          : "allowance + wallet"
        : p.plan === "free"
          ? "free allowance"
          : "plan allowance";
  return { credits: est.credits, providerUsd: est.providerUsd, paysFrom, walletUsdIfNeeded: r.reservation.walletUsdReserved, covered: true };
}

/** Quote from a bare provider-cost figure (approval cards created by Step 1–3 carry estAiCost in $). */
export function quoteForProviderUsd(providerUsd: number, p: { plan: PlanId; freeSpentCredits: number; buckets: CreditBucket[]; walletBalanceUsd: number }): {
  credits: number;
  paysFrom: string;
  covered: boolean;
  walletCostUsd: number;
} {
  const credits = creditsForProviderUsd(providerUsd);
  if (credits === 0) return { credits: 0, paysFrom: "plan allowance", covered: true, walletCostUsd: 0 };
  const available =
    (p.plan === "free" ? Math.max(0, 60 - p.freeSpentCredits) : 0) + allowanceRemaining(p.buckets);
  if (available >= credits) {
    return { credits, paysFrom: p.plan === "free" ? "free allowance" : "plan allowance", covered: true, walletCostUsd: 0 };
  }
  const shortfall = round1(credits - available);
  const walletCostUsd = round2(shortfall * CREDIT_USD * 2);
  if (p.walletBalanceUsd >= walletCostUsd) {
    return { credits, paysFrom: p.plan === "free" ? "free allowance + wallet" : "allowance + wallet", covered: true, walletCostUsd };
  }
  return { credits, paysFrom: "not covered", covered: false, walletCostUsd };
}

/**
 * Weekly expiry (Step 4). Buckets expiring at or before `now` lapse; on
 * Growth, a lapsed weekly bucket's remainder gets ONE grace week (moved to
 * a grace bucket expiring 7 days later), then it lapses for good. PAYG and
 * add-on buckets never get grace. Returns the buckets that survive and the
 * credits that lapsed.
 */
export function expireBuckets(
  buckets: CreditBucket[],
  plan: PlanId,
  now = new Date(),
): { kept: CreditBucket[]; lapsedCredits: number; gracedCredits: number } {
  const kept: CreditBucket[] = [];
  let lapsedCredits = 0;
  let gracedCredits = 0;
  for (const b of buckets) {
    if (new Date(b.expiresAt).getTime() > now.getTime() || b.remaining <= 0) {
      if (b.remaining > 0) kept.push(b);
      continue;
    }
    if (plan === "growth" && b.kind === "weekly" && !b.grace && b.remaining > 0) {
      kept.push({
        ...b,
        id: `${b.id}-grace`,
        grace: true,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      gracedCredits = round1(gracedCredits + b.remaining);
    } else {
      lapsedCredits = round1(lapsedCredits + b.remaining);
    }
  }
  return { kept, lapsedCredits, gracedCredits };
}

/**
 * The next weekly grant. Weeks run Monday 00:00 to Sunday 23:59 in the
 * org's timezone (default Australia/Sydney, UTC+11 AEDT — same winter-shift
 * caveat as the morning-brief cron: during AEST, UTC+10, the boundary moves
 * an hour; the grant is still one per calendar week, never two).
 * `weekKey` is the ISO date of the Monday the grant belongs to.
 */
export function mondayOfWeek(d: Date, tzOffsetHours = 11): string {
  const local = new Date(d.getTime() + tzOffsetHours * 60 * 60 * 1000);
  const day = local.getUTCDay(); // 0 Sun .. 6 Sat
  const back = (day + 6) % 7; // days back to Monday
  const monday = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - back));
  return monday.toISOString().slice(0, 10);
}

export function nextWeeklyBucket(p: {
  plan: PlanId;
  addOnActive: boolean;
  weekKey: string;
  now?: Date;
  tzOffsetHours?: number;
}): CreditBucket | null {
  const grant = WEEKLY_GRANTS[p.plan];
  const credits = grant.creditsPerWeek + (p.addOnActive ? 120 : 0);
  if (credits <= 0) return null;
  const now = p.now ?? new Date();
  // Expires Sunday 23:59 local = Monday 00:00 local of the next week.
  const monday = new Date(`${p.weekKey}T00:00:00Z`);
  const expiresLocal = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiresAt = new Date(expiresLocal.getTime() - (p.tzOffsetHours ?? 11) * 60 * 60 * 1000).toISOString();
  void now;
  return { id: `wk-${p.weekKey}`, kind: "weekly", credits, remaining: credits, grantedAt: new Date().toISOString(), expiresAt };
}

/** PAYG bucket: $10 = 500 credits, expiring 7 days after purchase (aligned to the $10 wallet top-up, finishing step). */
export function paygBucket(purchasedAt = new Date()): CreditBucket {
  return {
    id: `payg-${purchasedAt.getTime()}`,
    kind: "payg",
    credits: PAYG_PACK.credits,
    remaining: PAYG_PACK.credits,
    grantedAt: purchasedAt.toISOString(),
    expiresAt: new Date(purchasedAt.getTime() + PAYG_PACK.expiresDays * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Downgrade before stopping (guarantee 5, free users only): as the free
 * monthly pool runs down, plans fall back to Tier 1, then to rules-only.
 * Paid plans never downgrade — they hit the wallet or stop with a message.
 */
export function downgradeForFree(freeSpentCredits: number): "full" | "tier1" | "tier0" {
  if (freeSpentCredits >= 60) return "tier0";
  if (freeSpentCredits >= 45) return "tier1";
  return "full";
}

/** No silent upgrades (guarantee 6): a tier is usable only if its maximum cost is covered by the buckets that can pay for it. */
export function tierAffordable(
  tier: 0 | 1 | 2 | 3,
  p: { plan: PlanId; freeSpentCredits: number; buckets: CreditBucket[]; walletBalanceUsd: number },
): boolean {
  if (tier === 0) return true;
  // Worst action on each tier, from the cost table (buffered provider $).
  const worstUsd = { 1: 0.042, 2: 0.023, 3: 0.165 }[tier];
  const available =
    (p.plan === "free" ? Math.max(0, 60 - p.freeSpentCredits) : 0) +
    allowanceRemaining(p.buckets) +
    (p.walletBalanceUsd / 2 / CREDIT_USD);
  return available >= worstUsd * 100;
}

// ---------- Abuse controls (guarantee 8, pure predicates) ----------

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
  "yopmail.com", "trashmail.com", "getnada.com", "maildrop.cc",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.trim().toLowerCase() ?? "";
  return DISPOSABLE_DOMAINS.has(domain);
}

export function abuseCheck(p: {
  email: string;
  emailVerified: boolean;
  freeStoresForDomain: number;
  isAnonymousAudit: boolean;
  captchaPassed: boolean;
}): { ok: true } | { ok: false; reason: string } {
  if (isDisposableEmail(p.email)) return { ok: false, reason: "That email address looks like a throwaway address. Use a real email to create a store." };
  if (!p.emailVerified) return { ok: false, reason: "Verify your email first — the link is in your inbox." };
  if (p.freeStoresForDomain >= 1) return { ok: false, reason: "There is already a free store on this domain. Upgrade to add another." };
  if (p.isAnonymousAudit && !p.captchaPassed) return { ok: false, reason: "Complete the check that you are human before running an anonymous audit." };
  return { ok: true };
}

// ---------- Daily margin dashboard (guarantee 9) ----------

export type UsageEvent = {
  id: string;
  userId: string;
  orgId: string;
  plan: PlanId;
  feature: string; // e.g. "chat", "ad-batch", "coach"
  action: AiActionId;
  credits: number;
  providerUsd: number;
  billedUsd: number; // what the user paid: 0 from allowance, 2x provider from wallet
  at: string; // ISO
};

export type MarginRow = {
  key: string;
  revenueUsd: number;
  providerUsd: number;
  marginUsd: number;
  marginPct: number;
};

/**
 * Aggregate usage events into margin rows. Revenue per org comes from the
 * plan price (+ wallet top-ups / PAYG, passed in as `otherRevenueUsd`);
 * provider cost comes from the events. Shared hosting/support are NOT in
 * these rows — the plan P&L in costs.ts carries them; this dashboard is the
 * early-warning view (guarantee 9), not the P&L.
 */
export function marginBy(
  events: UsageEvent[],
  groupBy: "plan" | "feature" | "org",
  planPrices: Record<PlanId, number>,
  otherRevenueUsd: Record<string, number> = {},
): MarginRow[] {
  const groups = new Map<string, { revenue: number; provider: number }>();
  for (const e of events) {
    const key = groupBy === "plan" ? e.plan : groupBy === "feature" ? e.feature : e.orgId;
    const g = groups.get(key) ?? { revenue: 0, provider: 0 };
    // 4 decimals: provider costs are cents-and-fractions ($0.013 a chat);
    // rounding to 2 decimals here would erase them.
    g.provider = Math.round((g.provider + e.providerUsd) * 10000) / 10000;
    groups.set(key, g);
  }
  for (const [key, g] of groups) {
    const price = groupBy === "plan" ? planPrices[key as PlanId] ?? 0 : 0;
    g.revenue = round2(price + (otherRevenueUsd[key] ?? 0));
  }
  return [...groups.entries()]
    .map(([key, g]) => ({
      key,
      revenueUsd: g.revenue,
      providerUsd: g.provider,
      marginUsd: round2(g.revenue - g.provider),
      marginPct: g.revenue > 0 ? round1(((g.revenue - g.provider) / g.revenue) * 100) : 0,
    }))
    .sort((a, b) => a.providerUsd - b.providerUsd);
}

/**
 * Alert if an org's cost has passed 80% of its allowance in the first half
 * of the month (guarantee 9). `allowanceUsd` is the plan's monthly AI
 * allowance ($0.60 / $3 / $8).
 */
export function marginAlert(p: { providerUsdThisMonth: number; allowanceUsd: number; now?: Date }): boolean {
  const day = (p.now ?? new Date()).getUTCDate();
  if (day > 15) return false;
  // Compare in whole cents: 3 x 0.8 is 2.4000000000000004 in binary floating point.
  return Math.round(p.providerUsdThisMonth * 100) >= Math.round(p.allowanceUsd * 0.8 * 100);
}
