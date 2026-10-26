import type { PlanId } from "../plans";
import { COACH_LIMITS, DEEP_CONTEXT_TOKENS, MIN_SCORE } from "./config";

export type Tier = "fast" | "deep";
export type Mode = "store" | "course" | "general";
export type Hit = { id: string; text: string; title: string; href: string; score: number; tokens: number };

/** Rough token count (about 4 characters per token). Good enough for routing and caps. */
export const approxTokens = (s: string) => Math.ceil(s.length / 4);

const STORE_RE = /\b(my|our|me|mine)\b.*\b(store|shop|sales|orders?|profit|margin|ads?|spend|roas|mer|cpa|numbers?|revenue|aov|customers?|products?|month|week|check|site|conversion)\b|\b(how am i doing|how('?s| is) my|why (are|is|did) my)\b/i;
const MULTI_RE = /\b(why|diagnos\w*|what('?s| is) wrong|figure out|step[- ]by[- ]step|plan for|strategy|compare|break ?down|root cause|audit|walk me through|should i (scale|cut|kill|raise|lower)|dropp?(ed|ing)|fell|declin\w*)\b/i;

/** Cheap rule-based classifier: does the question want the user's own store data, and does it need multi-step reasoning? */
export function classify(q: string): { aboutStore: boolean; multiStep: boolean } {
  const multiHits = (q.match(new RegExp(MULTI_RE.source, "gi")) ?? []).length;
  return { aboutStore: STORE_RE.test(q), multiStep: multiHits >= 2 || (multiHits >= 1 && q.length > 220) || /\b(diagnos\w*|root cause|step[- ]by[- ]step|walk me through)\b/i.test(q) };
}

/** Is retrieval good enough to answer as Helix course content? */
export const grounded = (hits: Hit[]) => hits.length > 0 && hits[0].score >= MIN_SCORE;

/** Mode label shown in the chat. Store wins when the user asked about their store and we have their data. */
export function pickMode(p: { aboutStore: boolean; hasStoreData: boolean; hits: Hit[] }): Mode {
  if (p.aboutStore && p.hasStoreData) return "store";
  return grounded(p.hits) ? "course" : "general";
}

export type RouteWhy = "deep-dive" | "multi-step" | "big-context" | "self-check" | "default";

/** Fast by default; deep when one of the plan's triggers holds AND the plan still has deep messages left. */
export function pickTier(p: { deepDive: boolean; multiStep: boolean; contextTokens: number; deepLeft: number }): { tier: Tier; why: RouteWhy } {
  const why: RouteWhy = p.deepDive ? "deep-dive" : p.multiStep ? "multi-step" : p.contextTokens > DEEP_CONTEXT_TOKENS ? "big-context" : "default";
  if (why === "default" || p.deepLeft <= 0) return { tier: "fast", why: why === "default" ? "default" : why };
  return { tier: "deep", why };
}

const UNSURE_RE = /\b(i'?m not sure|i am not sure|not certain|i don'?t know|cannot tell|can'?t tell)\b/i;

/** Self-check on the fast answer. Fails (escalate to deep) when it hedges or a course answer cites nothing. */
export function selfCheckFails(answer: string, mode: Mode, hasLessons = mode === "course"): boolean {
  if (!answer.trim() || answer.trim().length < 40) return true;
  if (UNSURE_RE.test(answer)) return true;
  if ((mode === "course" || hasLessons) && mode !== "general" && !/\[L\d+\]/.test(answer)) return true;
  return false;
}

export type LimitGate = { ok: true; deepLeft: number; left: number } | { ok: false; reason: "off" | "budget" | "cap"; deepLeft: number; left: number };

/** Server-side fair-use check. Usage counts come from the CoachUsage table, never from the client. */
export function limitGate(p: { plan: PlanId; used: number; usedDeep: number; spentUsd: number; budgetUsd: number; live: boolean }): LimitGate {
  const lim = COACH_LIMITS[p.plan];
  const left = Math.max(0, lim.total - p.used);
  const deepLeft = Math.max(0, Math.min(lim.deep - p.usedDeep, left));
  if (!p.live) return { ok: false, reason: "off", left, deepLeft };
  if (p.spentUsd >= p.budgetUsd) return { ok: false, reason: "budget", left, deepLeft };
  if (left <= 0) return { ok: false, reason: "cap", left, deepLeft };
  return { ok: true, left, deepLeft };
}

/** Pick the hits to send: highest score first, stop at the token budget. */
export function packContext(hits: Hit[], maxTokens: number): Hit[] {
  const out: Hit[] = [];
  let t = 0;
  for (const h of [...hits].sort((a, b) => b.score - a.score)) {
    if (t + h.tokens > maxTokens) break;
    out.push(h);
    t += h.tokens;
  }
  return out;
}
