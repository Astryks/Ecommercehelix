/**
 * Step 3 — Ads autonomy ladder (Job 2 of the pivot, §11).
 *
 * Three modes, per store, defaulting to the safest:
 *   L1 propose-only — paused drafts + proposals as approval cards. Nothing
 *      money-moving happens without the owner tapping Approve, and the owner
 *      presses Launch in Ads Manager themselves.
 *   L2 assisted — auto-pause losers under an owner-written rule, never
 *      auto-spend-up. Every auto-pause notifies and is undoable.
 *   L3 autonomous (opt-in, capped) — scale winners at most +20%/day up to
 *      the owner-set daily spend cap.
 *
 * This module is pure: it decides and writes the approval card / revert
 * payload. It never calls an ad API and never changes a live budget or bid —
 * that stays behind meta/guardrail.ts (paused drafts and pauses only) and
 * the approvals queue. At L1/L2 a "scale" decision is instructions for the
 * owner in Ads Manager, exactly as lib/campaigns.ts already phrases it.
 * At L3 the executor (not this module) re-checks live state, enforces the
 * cap, and records the previous budget as the revert payload.
 */

import { metrics, recommend, type Campaign, type Targets } from "../campaigns";

export type AutonomyMode = "propose" | "assisted" | "autonomous";

/** The owner-written L2 rule, in plain language, as the pivot specifies it. */
export const L2_RULE_TEXT =
  "Pause any ad with spend ≥ $50 over 3 days, 0 orders, or ROAS < 0.7 → auto-pause + notify + undo.";

export type SocialChannel = "instagram" | "tiktok" | "pinterest" | "youtube";

export type AgentSettings = {
  /** Autonomy ladder level. Default "propose". */
  mode: AutonomyMode;
  /** Owner-set daily spend cap across platforms, $/day. 0 = no cap set (L3 blocked until set). */
  dailySpendCap: number;
  /** Max scale step, % of current daily budget. Default 20. */
  maxScalePct: number;
  /** Max auto-pauses the agent may do per day at L2/L3. Default 3. */
  autoPausePerDayCap: number;
  /** Campaign ids (or names) the agent must never pause — hero products, brand search. */
  neverPause: string[];
  /** Max concurrent ad tests. Default 4 (spec: 3–6). */
  maxConcurrentTests: number;
  /** Discount ceiling, % off. Proposals above this are blocked. Default 20. */
  discountCeilingPct: number;
  /** Per-channel "Let Helix post" opt-in. Default: all off. */
  autoPost: Record<SocialChannel, { enabled: boolean; perDayCap: number }>;
  /** Drafts that must never auto-post even with auto-post on (e.g. price/promo posts). */
  neverPost: string[];
  /** Quiet hours, local time, e.g. ["21:00", "07:00"]. Non-critical notifications only. */
  quietHours: [string, string];
};

export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  mode: "propose",
  dailySpendCap: 0,
  maxScalePct: 20,
  autoPausePerDayCap: 3,
  neverPause: [],
  maxConcurrentTests: 4,
  discountCeilingPct: 20,
  autoPost: {
    instagram: { enabled: false, perDayCap: 1 },
    tiktok: { enabled: false, perDayCap: 1 },
    pinterest: { enabled: false, perDayCap: 1 },
    youtube: { enabled: false, perDayCap: 1 },
  },
  neverPost: ["price", "promotion", "discount"],
  quietHours: ["21:00", "07:00"],
};

/** Kill rule, exact (pivot §11 Job 2): $50/day × 3 days (~$150 test) — kill on 0 orders or ROAS < 0.7. */
export const KILL_SPEND_PER_DAY = 50;
export const KILL_DAYS = 3;
export const KILL_TEST_SPEND = KILL_SPEND_PER_DAY * KILL_DAYS; // $150
export const KILL_ROAS = 0.7;
/** Undo window for every pause, draft and scale. */
export const UNDO_WINDOW_DAYS = 7;
/** Scale is blocked when the winner has fewer days of stock than this. */
export const SCALE_MIN_STOCK_DAYS = 14;

export type AgentDecisionAction = "kill" | "scale" | "hold" | "refresh" | "wait-learning";

export type AgentDecision = {
  campaignId: string;
  campaignName: string;
  channel: Campaign["channel"];
  action: AgentDecisionAction;
  /** Plain-English reason, with the numbers in it. */
  reason: string;
  evidence: { label: string; value: string; benchmark?: string }[];
  /** Has the ad had a fair test? max(3 days, 1–1.5× target CPP spend). No fair test → never kill. */
  fairTest: boolean;
  /** What the agent may do without another tap, given the store's mode. */
  autoAllowed: "none" | "pause" | "scale";
  /** What happens if the owner approves (or, at L2/L3, what the agent does + notifies). */
  approval: { title: string; detail: string; estAiCost: number };
  /** One-tap undo within 7 days: what to restore. */
  revert: { kind: "resume" | "restore-budget" | "none"; previousBudgetPerDay: number | null; note: string };
  /** Why the decision is blocked, if it is (never-pause list, stock, stale feed, no cap). */
  blockedBy: string | null;
};

export type DecisionContext = {
  settings: AgentSettings;
  /** Break-even CPA for this store, from profit-setup.ts (before-marketing per order). */
  breakEvenCpa: number;
  /** Spend already auto-paused today (for the per-day cap). */
  autoPausedToday: number;
  /** Days of stock left on the campaign's hero product, if known. */
  stockDaysLeft: number | null;
  /**
   * Per-campaign stock, when the campaign can be matched to a product
   * (finishing step): campaign id -> days of stock left on that
   * campaign's product, or null when the campaign's SKU is unknown.
   * When present for a campaign it overrides stockDaysLeft for it.
   */
  stockDaysByCampaign?: Map<string, number | null>;
  /** Matched product label per campaign id, for the block message. */
  stockLabelByCampaign?: Map<string, string>;
  /** Last successful ad pull, ISO timestamp. Null = never synced. */
  lastSyncAt: string | null;
  /** "now", ISO timestamp — passed in so tests are deterministic. */
  now: string;
  /** Ad spend already committed today across platforms, $ (for the daily cap). */
  spendToday: number;
};

const money = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;

/**
 * Match a campaign to a stocked product, by SKU or product name inside the
 * campaign name. Normalised (lowercase, non-alphanumerics stripped); the
 * longest match wins so "Linen Shirt" beats a short SKU fragment. Returns
 * null when nothing matches — the campaign's SKU is genuinely unknown and
 * the stock block stays unknown (null), never assumed.
 * Pure function, so the campaigns page and the morning brief share it.
 */
export function matchCampaignStock(
  campaignName: string,
  rows: { sku: string; name: string; daysLeft: number | null }[],
): { sku: string; name: string; daysLeft: number | null } | null {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hay = norm(campaignName);
  if (!hay) return null;
  let best: { sku: string; name: string; daysLeft: number | null } | null = null;
  let bestLen = 0;
  for (const r of rows) {
    for (const needle of [r.sku, r.name]) {
      const n = norm(needle);
      if (n.length >= 3 && hay.includes(n) && n.length > bestLen) {
        best = r;
        bestLen = n.length;
      }
    }
  }
  return best;
}
const isStale = (lastSyncAt: string | null, now: string) =>
  !lastSyncAt || Date.parse(now) - Date.parse(lastSyncAt) > 24 * 3600 * 1000;

function baseEvidence(c: Campaign, t: Targets, breakEvenCpa: number) {
  const m = metrics(c);
  return {
    m,
    list: [
      { label: "Spend (7d)", value: money(c.spend) },
      { label: "Orders (7d)", value: String(c.purchases) },
      { label: "Revenue (7d)", value: money(c.revenue) },
      { label: "CPA", value: m.cpa === null ? "no orders yet" : money(m.cpa), benchmark: `Break-even ${money(breakEvenCpa)}` },
      { label: "ROAS", value: `${m.roas.toFixed(2)}x`, benchmark: `Kill below ${KILL_ROAS}x` },
      { label: "Daily budget", value: money(c.budget) },
    ] as { label: string; value: string; benchmark?: string }[],
  };
}

/**
 * One campaign, one decision. The existing recommend() call (SOP 06 rules) is
 * kept as the base; this layer adds the exact kill rule, the fair-test gate,
 * the never-pause list, the stock block, the stale-feed block, and the
 * mode-dependent autoAllowed flag.
 */
export function evaluateCampaign(c: Campaign, t: Targets, ctx: DecisionContext): AgentDecision {
  const { m, list: evidence } = baseEvidence(c, t, ctx.breakEvenCpa);
  const s = ctx.settings;
  const inNeverPause = s.neverPause.some((n) => n === c.id || n === c.externalId || n.toLowerCase() === c.name.toLowerCase());
  // Fair test: at least 3 days since the last edit AND at least ~1× the
  // target cost-per-purchase spent (spend here is the last 7 days).
  const targetCpp = Math.max(1, ctx.breakEvenCpa);
  const fairTest = c.daysSinceEdit >= KILL_DAYS && c.spend >= targetCpp;
  const killHit =
    fairTest && c.spend >= KILL_TEST_SPEND && (c.purchases === 0 || m.roas < KILL_ROAS);
  const stale = isStale(ctx.lastSyncAt, ctx.now);
  const rec = recommend(c, t);

  const approvalBase = (action: AgentDecisionAction, title: string, detail: string): AgentDecision["approval"] => ({
    title,
    detail,
    estAiCost: 0.006, // docs/pricing.md: approval card $0.006
  });

  if (stale) {
    return {
      campaignId: c.id, campaignName: c.name, channel: c.channel, action: "hold",
      reason: "Data unreliable — do not scale. The last ad pull is more than 24 hours old, so no money move is proposed.",
      evidence, fairTest, autoAllowed: "none",
      approval: approvalBase("hold", `Do not scale ${c.name}: feed stale`, "The ad feed is stale (last pull more than 24 hours ago). Reconnect / re-sync the ad account first, then Helix will judge this campaign again. Nothing money-moving is proposed."),
      revert: { kind: "none", previousBudgetPerDay: null, note: "Nothing changed." },
      blockedBy: "stale-feed",
    };
  }

  if (killHit) {
    const autoPauseOk =
      s.mode !== "propose" && !inNeverPause && ctx.autoPausedToday < s.autoPausePerDayCap;
    return {
      campaignId: c.id, campaignName: c.name, channel: c.channel, action: "kill",
      reason:
        c.purchases === 0
          ? `Spent ${money(c.spend)} over ${KILL_DAYS}+ days with 0 orders — past the $${KILL_TEST_SPEND} fair test.`
          : `ROAS ${m.roas.toFixed(2)}x is below the ${KILL_ROAS}x kill line after ${money(c.spend)} spent over ${KILL_DAYS}+ days.`,
      evidence, fairTest,
      autoAllowed: autoPauseOk ? "pause" : "none",
      approval: approvalBase(
        "kill",
        `Pause ${c.name} — it is losing money`,
        `Spend ${money(c.spend)}, ${c.purchases} orders, ROAS ${m.roas.toFixed(2)}x (kill below ${KILL_ROAS}x), CPA ${m.cpa === null ? "—" : money(m.cpa)} vs break-even ${money(ctx.breakEvenCpa)}.\n\n` +
          (s.mode === "propose"
            ? "Helix will pause this ad in your account after you approve. Undo within 7 days restores it."
            : `Auto-pause rule (${L2_RULE_TEXT}) applies. Helix will pause it and notify you; undo within 7 days restores it.`) +
          (inNeverPause ? "\n\nBlocked: this campaign is on your never-pause list, so it will not auto-pause." : ""),
      ),
      revert: { kind: "resume", previousBudgetPerDay: null, note: "Undo resumes the campaign with its previous settings (7-day window)." },
      blockedBy: inNeverPause ? "never-pause-list" : null,
    };
  }

  if (rec.rec === "Scale") {
    const newBudget = Math.round(c.budget * (1 + s.maxScalePct / 100));
    // Per-campaign stock when the campaign matches a product; otherwise
    // the hero-product figure passed in ctx.stockDaysLeft (null = unknown).
    const stockForCampaign = ctx.stockDaysByCampaign?.has(c.id) ? ctx.stockDaysByCampaign.get(c.id) ?? null : ctx.stockDaysLeft;
    const stockLabel = ctx.stockLabelByCampaign?.get(c.id);
    const stockBlocked = stockForCampaign !== null && stockForCampaign < SCALE_MIN_STOCK_DAYS;
    const capBlocked =
      s.mode === "autonomous" && (s.dailySpendCap <= 0 || ctx.spendToday + (newBudget - c.budget) > s.dailySpendCap);
    const blockedBy = stockBlocked ? "stock-low" : capBlocked ? "daily-cap" : null;
    const autoScaleOk = s.mode === "autonomous" && !blockedBy;
    return {
      campaignId: c.id, campaignName: c.name, channel: c.channel, action: "scale",
      reason: `Each sale costs ${m.cpa === null ? "—" : money(m.cpa)}, at or under your good line, and frequency is in range. Scale ${s.maxScalePct}% — ${money(c.budget)} → ${money(newBudget)}/day.`,
      evidence: [...evidence, { label: "Proposed budget", value: `${money(newBudget)}/day`, benchmark: `Max +${s.maxScalePct}%/day` }],
      fairTest,
      autoAllowed: autoScaleOk ? "scale" : "none",
      approval: approvalBase(
        "scale",
        `Scale ${c.name} ${money(c.budget)} → ${money(newBudget)}/day`,
        `Proposed budget: ${money(c.budget)} → ${money(newBudget)}/day (+${s.maxScalePct}%). CPA ${m.cpa === null ? "—" : money(m.cpa)} vs break-even ${money(ctx.breakEvenCpa)}; ROAS ${m.roas.toFixed(2)}x.\n\n` +
          (stockBlocked
            ? `Blocked: ${stockLabel ? `${stockLabel} has` : "the hero product has"} ${stockForCampaign} days of stock left (under ${SCALE_MIN_STOCK_DAYS}). Reorder first — scaling an ad for a product about to sell out wastes the spend.`
            : capBlocked
              ? `Blocked: this step would take today's spend over your daily cap of ${money(s.dailySpendCap)}. Raise the cap or wait until tomorrow.`
              : s.mode === "autonomous"
                ? "Autonomous mode: Helix will make this change and log it, with the previous budget saved for one-tap undo (7 days)."
                : "You make this change in Ads Manager (Helix never changes a live budget without an approval card, and never at L1/L2). The previous budget is saved so you can undo it within 7 days."),
      ),
      revert: { kind: "restore-budget", previousBudgetPerDay: c.budget, note: `Undo restores the daily budget to ${money(c.budget)} (7-day window).` },
      blockedBy,
    };
  }

  // Hold / refresh / wait-learning: proposals only, in every mode.
  const action: AgentDecisionAction = rec.rec === "Refresh creative" ? "refresh" : rec.rec === "Kill" ? "hold" : "hold";
  const waitLearning = c.status === "Learning" || c.daysSinceEdit < 3;
  return {
    campaignId: c.id, campaignName: c.name, channel: c.channel,
    action: waitLearning ? "wait-learning" : action,
    reason: rec.reason,
    evidence, fairTest, autoAllowed: "none",
    approval: approvalBase(
      waitLearning ? "wait-learning" : action,
      waitLearning ? `Leave ${c.name} alone — still learning` : `${rec.rec === "Refresh creative" ? "Refresh creative for" : "Hold"} ${c.name}`,
      `${rec.reason}\n\nNo money moves in this card. ${rec.rec === "Refresh creative" ? "Helix can draft 3 new ad variants as paused drafts for your approval." : "Helix will check again after the next daily pull."}`,
    ),
    revert: { kind: "none", previousBudgetPerDay: null, note: "Nothing changed." },
    blockedBy: null,
  };
}

/** Run the ladder over every campaign. Kill/scale first, then refresh, then hold. */
export function evaluateCampaigns(cs: Campaign[], t: Targets, ctx: DecisionContext): AgentDecision[] {
  const rank: Record<AgentDecisionAction, number> = { kill: 0, scale: 1, refresh: 2, hold: 3, "wait-learning": 4 };
  return cs.map((c) => evaluateCampaign(c, t, ctx)).sort((a, b) => rank[a.action] - rank[b.action]);
}

/** L3 gate: autonomous mode is only offered after 30 days of L2 with a revert rate under 5%. */
export function autonomousGate(args: { l2Days: number; revertRatePct: number; dailySpendCap: number }): { allowed: boolean; reason: string } {
  if (args.dailySpendCap <= 0) return { allowed: false, reason: "Set a daily spend cap first — autonomous scaling needs a cap." };
  if (args.l2Days < 30) return { allowed: false, reason: `Autonomous mode unlocks after 30 days of assisted auto-pause (you have ${args.l2Days}).` };
  if (args.revertRatePct >= 5) return { allowed: false, reason: `Revert rate is ${args.revertRatePct}% — autonomous mode needs under 5%.` };
  return { allowed: true, reason: "Eligible: 30+ days of assisted auto-pause, revert rate under 5%, daily cap set." };
}

/** Sanitise owner-entered settings: clamp numbers, cap the test count, keep mode valid. */
export function parseAgentSettings(input: Partial<AgentSettings> | null | undefined): AgentSettings {
  const d = DEFAULT_AGENT_SETTINGS;
  const mode: AutonomyMode =
    input?.mode === "assisted" || input?.mode === "autonomous" ? input.mode : "propose";
  const clamp = (n: unknown, lo: number, hi: number, fb: number) => {
    const v = typeof n === "number" && Number.isFinite(n) ? n : fb;
    return Math.min(hi, Math.max(lo, v));
  };
  const autoPost = { ...d.autoPost };
  for (const ch of Object.keys(autoPost) as SocialChannel[]) {
    const v = input?.autoPost?.[ch];
    if (v) autoPost[ch] = { enabled: Boolean(v.enabled), perDayCap: clamp(v.perDayCap, 1, 5, 1) };
  }
  return {
    mode,
    dailySpendCap: clamp(input?.dailySpendCap, 0, 100000, d.dailySpendCap),
    maxScalePct: clamp(input?.maxScalePct, 5, 20, d.maxScalePct),
    autoPausePerDayCap: clamp(input?.autoPausePerDayCap, 0, 10, d.autoPausePerDayCap),
    neverPause: Array.isArray(input?.neverPause) ? input!.neverPause.filter((x) => typeof x === "string").slice(0, 50) : [],
    maxConcurrentTests: clamp(input?.maxConcurrentTests, 1, 6, d.maxConcurrentTests),
    discountCeilingPct: clamp(input?.discountCeilingPct, 0, 50, d.discountCeilingPct),
    autoPost,
    neverPost: Array.isArray(input?.neverPost) ? input!.neverPost.filter((x) => typeof x === "string").slice(0, 50) : d.neverPost,
    quietHours: d.quietHours,
  };
}
