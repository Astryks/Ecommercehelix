import type { PlanId } from "../plans";

/**
 * AI layer settings. Calls go through the Vercel AI Gateway with a small, cheap model.
 * Auth: AI_GATEWAY_API_KEY, or the VERCEL_OIDC_TOKEN that Vercel deployments receive.
 */
export const AI_MODEL = process.env.AI_MODEL || "google/gemini-2.5-flash-lite";
/** Price per million tokens in USD for the default model (from the gateway's /v1/models). Override with env if the model changes. */
export const PRICE_IN_PER_M = Number(process.env.AI_PRICE_IN_PER_M || 0.1);
export const PRICE_OUT_PER_M = Number(process.env.AI_PRICE_OUT_PER_M || 0.4);
export const MAX_OUTPUT_TOKENS = 400;
export const MAX_INPUT_CHARS = 6000;

/** Calls a month per plan. Cache hits do not count. */
export const AI_MONTHLY_CAP: Record<PlanId, number> = { free: 3, starter: 50, growth: 150 };

export type AiKind = "audit" | "adcopy" | "help";

/** Global kill-switch: AI_DISABLED=1 turns AI off; AI_MONTHLY_BUDGET_USD (default 25) stops all calls once the month's logged spend reaches it. */
export function aiAvailable(env: Record<string, string | undefined> = process.env): boolean {
  if (env.AI_DISABLED === "1") return false;
  return Boolean(env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN);
}
export const monthlyBudgetUsd = (env: Record<string, string | undefined> = process.env) => {
  const n = Number(env.AI_MONTHLY_BUDGET_USD);
  return Number.isFinite(n) && n >= 0 && env.AI_MONTHLY_BUDGET_USD !== undefined && env.AI_MONTHLY_BUDGET_USD !== "" ? n : 25;
};

export const costUsd = (inputTokens: number, outputTokens: number) => (inputTokens * PRICE_IN_PER_M + outputTokens * PRICE_OUT_PER_M) / 1e6;

/** First instant of the current month in UTC. */
export const monthStart = (now = new Date()) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

export type Gate = { ok: true } | { ok: false; reason: "off" | "budget" | "cap" };
export function gate(p: { available: boolean; plan: PlanId; usedThisMonth: number; spentThisMonthUsd: number; budgetUsd: number }): Gate {
  if (!p.available) return { ok: false, reason: "off" };
  if (p.spentThisMonthUsd >= p.budgetUsd) return { ok: false, reason: "budget" };
  if (p.usedThisMonth >= AI_MONTHLY_CAP[p.plan]) return { ok: false, reason: "cap" };
  return { ok: true };
}
