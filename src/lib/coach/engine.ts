/**
 * The coach's decision flow, with every outside call injected so tests can run it with mocks.
 * Order: limits -> classify -> retrieve -> mode -> tier -> call model (Claude, Gemini on error) -> self-check (fast may escalate to deep) -> label -> log.
 */
import type { PlanId } from "../plans";
import { COACH_MODELS, MAX_CONTEXT_TOKENS, MAX_OUTPUT, priceOf } from "./config";
import { buildUserMessage, citedLinks, COACH_SYSTEM, ensureLabel, MODE_LABEL, redact } from "./prompt";
import { approxTokens, classify, grounded, limitGate, packContext, pickMode, pickTier, selfCheckFails, type Hit, type Mode, type RouteWhy, type Tier } from "./router";

export type LlmResult = { text: string; inputTokens: number; outputTokens: number; cachedTokens?: number };
export type CoachDeps = {
  llm: (p: { model: string; system: string; prompt: string; maxOutputTokens: number }) => Promise<LlmResult>;
  retrieve: (q: string) => Promise<Hit[]>;
  storeSummary: () => Promise<string | null>;
  usage: () => Promise<{ used: number; usedDeep: number; spentUsd: number }>;
  log: (row: { tier: Tier; mode: Mode; why: RouteWhy; model: string; inputTokens: number; cachedTokens: number; outputTokens: number; costUsd: number; topScore: number; ok: boolean; question: string; answer: string }) => Promise<void>;
  /** Durable facts about this owner (memory), as prompt text. */
  memory?: () => Promise<string | null>;
  /** Today's earlier turns (short), so follow-ups make sense. */
  history?: () => Promise<string | null>;
  /** After a good answer: update memory from this turn. Errors are ignored. */
  remember?: (question: string, answer: string) => Promise<void>;
  /** Extra names the answer must never contain (from env, not committed). */
  blocked?: string[];
};
export type CoachInput = { question: string; deepDive: boolean; plan: PlanId; live: boolean; budgetUsd: number };
export type CoachAnswer = {
  text: string;
  mode: Mode;
  modeLabel: string;
  tier: Tier | null;
  why: RouteWhy | null;
  model: string | null;
  links: { title: string; href: string }[];
  left: number;
  deepLeft: number;
  limited?: "off" | "budget" | "cap" | "error" | "deep-cap";
};

const LIMIT_TEXT = {
  off: "The coach is not switched on yet. Your lessons are all in Learn.",
  budget: "The coach is resting for the rest of this month. Your lessons are all in Learn.",
  cap: "You have used this month's coach messages on your plan. They reset on the 1st, or upgrade for more.",
  error: "Sorry, the coach could not answer just now. Please try again in a minute.",
} as const;

/** Remove any blocked outside name from an answer (belt and braces; the system prompt already forbids them). */
export function scrub(text: string, blocked: string[] = []): string {
  let t = text;
  for (const b of blocked.map((x) => x.trim()).filter((x) => x.length >= 3)) t = t.replace(new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "another source");
  return t;
}

async function call(deps: CoachDeps, tier: Tier, prompt: string): Promise<LlmResult & { model: string }> {
  const req = { system: COACH_SYSTEM, prompt, maxOutputTokens: MAX_OUTPUT[tier] };
  try {
    return { ...(await deps.llm({ model: COACH_MODELS[tier], ...req })), model: COACH_MODELS[tier] };
  } catch (e) {
    console.error("[coach] model failed, trying fallback", COACH_MODELS[tier], String((e as Error)?.message ?? e).slice(0, 300));
    return { ...(await deps.llm({ model: COACH_MODELS.fallback, ...req })), model: COACH_MODELS.fallback };
  }
}

export async function runCoach(deps: CoachDeps, input: CoachInput): Promise<CoachAnswer> {
  const question = input.question.trim();
  const u = await deps.usage();
  const g = limitGate({ plan: input.plan, used: u.used, usedDeep: u.usedDeep, spentUsd: u.spentUsd, budgetUsd: input.budgetUsd, live: input.live });
  const base = { links: [], left: g.left, deepLeft: g.deepLeft, tier: null, why: null, model: null };
  if (!g.ok) return { ...base, text: LIMIT_TEXT[g.reason], mode: "general", modeLabel: MODE_LABEL.general, limited: g.reason };

  const c = classify(question);
  const [hitsAll, summary, memory, history] = await Promise.all([
    deps.retrieve(question).catch(() => [] as Hit[]),
    c.aboutStore ? deps.storeSummary().catch(() => null) : Promise.resolve(null),
    deps.memory ? deps.memory().catch(() => null) : Promise.resolve(null),
    deps.history ? deps.history().catch(() => null) : Promise.resolve(null),
  ]);
  const mode = pickMode({ aboutStore: c.aboutStore, hasStoreData: Boolean(summary), hits: hitsAll });
  const hits = grounded(hitsAll) ? packContext(hitsAll, MAX_CONTEXT_TOKENS) : [];
  const contextTokens = hits.reduce((a, h) => a + h.tokens, 0) + approxTokens(summary ?? "");
  let { tier, why } = pickTier({ deepDive: input.deepDive, multiStep: c.multiStep, contextTokens, deepLeft: g.deepLeft });
  const deepBlocked = input.deepDive && tier === "fast";

  const msg = (deep: boolean) => buildUserMessage({ mode, question, storeSummary: mode === "store" ? summary : null, hits, deep, memory, history });
  const prompt = msg(tier === "deep");
  let r: LlmResult & { model: string };
  let cost = 0;
  try {
    r = await call(deps, tier, prompt);
    cost += priceOf(r.model, r.inputTokens, r.outputTokens, r.cachedTokens ?? 0);
    if (tier === "fast" && g.deepLeft > 0 && selfCheckFails(r.text, mode, hits.length > 0)) {
      const d = await call(deps, "deep", msg(true)).catch(() => null);
      if (d) {
        // log the failed fast try too, so spend is counted
        cost += priceOf(d.model, d.inputTokens, d.outputTokens, d.cachedTokens ?? 0);
        r = { ...d, inputTokens: d.inputTokens + r.inputTokens, outputTokens: d.outputTokens + r.outputTokens };
        tier = "deep";
        why = "self-check";
      }
    }
  } catch (e) {
    console.error("[coach] fallback failed too", String((e as Error)?.message ?? e).slice(0, 300));
    await deps.log({ tier, mode, why, model: COACH_MODELS[tier], inputTokens: 0, cachedTokens: 0, outputTokens: 0, costUsd: 0, topScore: hitsAll[0]?.score ?? 0, ok: false, question: redact(question).slice(0, 1000), answer: "" });
    return { ...base, text: LIMIT_TEXT.error, mode, modeLabel: MODE_LABEL[mode], limited: "error" };
  }

  const text = ensureLabel(scrub(r.text, deps.blocked), mode);
  await deps.log({ tier, mode, why, model: r.model, inputTokens: r.inputTokens, cachedTokens: r.cachedTokens ?? 0, outputTokens: r.outputTokens, costUsd: cost, topScore: hitsAll[0]?.score ?? 0, ok: true, question: redact(question).slice(0, 1000), answer: redact(text).slice(0, 4000) });
  if (deps.remember) await deps.remember(redact(question), redact(text)).catch(() => undefined);
  const links = mode === "general" ? [] : citedLinks(text, hits).slice(0, 4);
  return {
    text: text.replace(/\s*\[L\d+\]/g, ""),
    mode,
    modeLabel: MODE_LABEL[mode],
    tier,
    why,
    model: r.model,
    links,
    left: Math.max(0, g.left - 1),
    deepLeft: Math.max(0, g.deepLeft - (tier === "deep" ? 1 : 0)),
    ...(deepBlocked ? { limited: "deep-cap" as const } : {}),
  };
}
