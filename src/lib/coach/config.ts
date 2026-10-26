import type { PlanId } from "../plans";

/**
 * Helix AI coach settings. Every model id is a constant here, so swapping a model is a one-line change.
 * Ids checked against the Vercel AI Gateway model list (https://ai-gateway.vercel.sh/v1/models) on 27 Oct 2026 (AEDT).
 * Env overrides exist so a swap can also be done in Vercel without a deploy.
 */
export const COACH_MODELS = {
  /** Default tier: fast and cheap. Gateway price $0.10 in / $0.50 out per 1M (prompts up to 100k), cached read $0.01. */
  fast: process.env.COACH_MODEL_FAST || "anthropic/claude-haiku-5.5",
  /** Deep tier: Deep dive, multi-step diagnosis, big context, or failed self-check. $2 in / $10 out per 1M, cached read $0.20. */
  deep: process.env.COACH_MODEL_DEEP || "anthropic/claude-sonnet-5",
  /** Used only when the Claude call errors. $0.75 in / $3.75 out per 1M (doubles on 1 Jan 2027 per the plan). */
  fallback: process.env.COACH_MODEL_FALLBACK || "google/gemini-3.8-flash",
  /** Embeddings for the lesson library and for each question. $0.20 per 1M input tokens. */
  embed: process.env.COACH_MODEL_EMBED || "google/gemini-embedding-2",
} as const;

export const EMBED_DIMS = 768;

/** USD per 1M tokens: [input, output, cached input]. Keep in step with COACH_MODELS. */
export const COACH_PRICES: Record<string, [number, number, number]> = {
  "anthropic/claude-haiku-5.5": [0.1, 0.5, 0.01],
  "anthropic/claude-sonnet-5": [2, 10, 0.2],
  "google/gemini-3.8-flash": [0.75, 3.75, 0.075],
  "google/gemini-embedding-2": [0.2, 0, 0],
};

export function priceOf(model: string, inTok: number, outTok: number, cachedTok = 0): number {
  const p = COACH_PRICES[model] ?? [2, 10, 0.2]; // unknown model: assume the dearest tier so the cap stays safe
  return ((inTok - cachedTok) * p[0] + outTok * p[1] + cachedTok * p[2]) / 1e6;
}

/** Retrieval and routing thresholds (from docs/HELIX-LLM-PLAN.md). */
export const TOP_K = 6;
export const MIN_SCORE = 0.55;
export const DEEP_CONTEXT_TOKENS = 12_000;
export const MAX_CONTEXT_TOKENS = 30_000;
export const MAX_QUESTION_CHARS = 1_000;
export const MAX_OUTPUT = { fast: 700, deep: 1_600 } as const;

/** Per-user fair-use limits per calendar month (UTC). Deep messages count toward the total too. */
export const COACH_LIMITS: Record<PlanId, { total: number; deep: number }> = {
  free: { total: 20, deep: 0 },
  starter: { total: 300, deep: 40 },
  growth: { total: 800, deep: 100 },
};

/** Hard monthly cap across all users, in USD. Coach stops (friendly message) once the month's logged spend reaches it. */
export function coachBudgetUsd(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.COACH_MONTHLY_BUDGET_USD);
  return env.COACH_MONTHLY_BUDGET_USD && Number.isFinite(n) && n >= 0 ? n : 50;
}

/** Feature flag. Off unless HELIX_COACH=1 (and never on in production without HELIX_COACH_PROD=1 as a second, explicit switch). */
export function coachEnabled(env: Record<string, string | undefined> = process.env): boolean {
  if (env.HELIX_COACH !== "1") return false;
  if (env.VERCEL_ENV === "production" && env.HELIX_COACH_PROD !== "1") return false;
  return true;
}

/** True when model calls can be made (gateway key or Vercel OIDC token present, AI not killed). */
export function coachLive(env: Record<string, string | undefined> = process.env): boolean {
  if (env.AI_DISABLED === "1") return false;
  return Boolean(env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN);
}
