import "server-only";
import { createHash } from "node:crypto";
import { hasDb, prisma } from "../db";
import { getAccount } from "../repo";
import type { PlanId } from "../plans";
import { AI_MODEL, AI_MONTHLY_CAP, aiAvailable, costUsd, gate, gatewayOptions, MAX_INPUT_CHARS, MAX_OUTPUT_TOKENS, monthlyBudgetUsd, monthStart, type AiKind } from "./config";

export type AiResult = { text: string; source: "ai" | "cache" | "rules"; reason?: "off" | "budget" | "cap" | "error"; left?: number };

type MemUse = { userId: string; costUsd: number; cached: boolean; at: number };
const g = globalThis as unknown as { __helixAi?: { use: MemUse[]; cache: Map<string, string> } };
const mem: { use: MemUse[]; cache: Map<string, string> } = (g.__helixAi ??= { use: [], cache: new Map() });

async function usage(userId: string) {
  const since = monthStart();
  if (!hasDb) {
    const m = mem.use.filter((u) => u.at >= since.getTime());
    return { used: m.filter((u) => u.userId === userId && !u.cached).length, spent: m.reduce((a, u) => a + u.costUsd, 0) };
  }
  const [used, spent] = await Promise.all([
    prisma.aiUsage.count({ where: { userId, cached: false, createdAt: { gte: since } } }),
    prisma.aiUsage.aggregate({ _sum: { costUsd: true }, where: { createdAt: { gte: since } } }),
  ]);
  return { used, spent: spent._sum.costUsd ?? 0 };
}

async function log(userId: string, kind: AiKind, r: { inputTokens?: number; outputTokens?: number; cached: boolean; ok: boolean }) {
  const cost = costUsd(r.inputTokens ?? 0, r.outputTokens ?? 0);
  if (!hasDb) return void mem.use.push({ userId, costUsd: cost, cached: r.cached, at: Date.now() });
  await prisma.aiUsage.create({ data: { userId, kind, model: AI_MODEL, inputTokens: r.inputTokens ?? 0, outputTokens: r.outputTokens ?? 0, costUsd: cost, cached: r.cached, ok: r.ok } });
}

/** How many AI calls the user has left this month (for the UI). */
export async function aiAllowance(userId: string) {
  const plan = (await getAccount(userId)).plan;
  const u = await usage(userId);
  return { cap: AI_MONTHLY_CAP[plan], used: u.used, left: Math.max(0, AI_MONTHLY_CAP[plan] - u.used), available: aiAvailable() && u.spent < monthlyBudgetUsd() };
}

/**
 * One short AI call with caching, a hard per-user monthly cap and a global monthly budget.
 * Anything unavailable or failing returns the rule-based fallback, so the page always works.
 */
export async function aiText(userId: string, kind: AiKind, system: string, prompt: string, fallback: string): Promise<AiResult> {
  const input = prompt.slice(0, MAX_INPUT_CHARS);
  const key = createHash("sha256").update(`${kind}\n${AI_MODEL}\n${system}\n${input}`).digest("hex");
  // Step 4: held outside the try so a failed call can still release its hold.
  let heldPricing: import("@/lib/pricing/store").PricingState | null = null;
  let heldReservation: import("@/lib/pricing/cost-guard").Reservation | null = null;
  let heldPlan: PlanId | null = null;
  try {
    const hit = hasDb ? (await prisma.aiCache.findUnique({ where: { key } }))?.text : mem.cache.get(key);
    if (hit) {
      await log(userId, kind, { cached: true, ok: true });
      return { text: hit, source: "cache" };
    }
    const plan = (await getAccount(userId)).plan;
    const u = await usage(userId);
    const gt = gate({ available: aiAvailable(), plan, usedThisMonth: u.used, spentThisMonthUsd: u.spent, budgetUsd: monthlyBudgetUsd() });
    if (!gt.ok) return { text: fallback, source: "rules", reason: gt.reason };
    // Step 4: unified credit pool (reserve-then-charge). Kind -> priced action:
    // audits carry their own cost; ad copy and "I'm lost" help are short Tier-2 chats.
    // Cache hits cost nothing and do not count, as before. The count ceiling
    // (AI_MONTHLY_CAP) and the credit pool must BOTH pass.
    const action = kind === "audit" ? ("store-audit" as const) : ("chat" as const);
    const pricingStore = await import("@/lib/pricing/store");
    const { hardCapViolation } = await import("@/lib/pricing/cost-guard");
    let pricing = await pricingStore.loadPricingState(userId, plan);
    const capHit = hardCapViolation(action, { deepChatsToday: 0, auditsThisHour: pricing.auditsThisHour, trendAdaptsToday: 0 });
    if (capHit) return { text: fallback, source: "rules", reason: "cap" };
    const auth = pricingStore.authorize(pricing, { action, feature: kind, plan });
    if (!("reservation" in auth)) return { text: fallback, source: "rules", reason: "cap" };
    pricing = auth.state;
    const reservation = auth.reservation;
    heldPricing = pricing;
    heldReservation = reservation;
    heldPlan = plan;
    await pricingStore.savePricingState(userId, pricing);
    const { generateText } = await import("ai");
    const r = await generateText({
      model: AI_MODEL,
      system,
      prompt: input,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.4,
      abortSignal: AbortSignal.timeout(20_000),
      providerOptions: { gateway: gatewayOptions(userId, kind) },
    });
    const text = r.text.trim();
    const actualUsd = costUsd(r.usage.inputTokens ?? 0, r.usage.outputTokens ?? 0);
    // Step 4: settle the REAL cost (a failed/empty call settles $0 and releases the hold).
    let settled = pricingStore.settleReservation(pricing, reservation, text ? actualUsd : 0, { userId, orgId: userId, plan, feature: kind });
    settled = pricingStore.recordCount(settled, "writeUps");
    if (action === "store-audit") settled = pricingStore.bumpDailyCount(settled, "auditsThisHour");
    await pricingStore.savePricingState(userId, settled);
    await log(userId, kind, { inputTokens: r.usage.inputTokens, outputTokens: r.usage.outputTokens, cached: false, ok: Boolean(text) });
    if (!text) return { text: fallback, source: "rules", reason: "error" };
    if (hasDb) await prisma.aiCache.upsert({ where: { key }, create: { key, userId, kind, text }, update: {} });
    else mem.cache.set(key, text);
    return { text, source: "ai", left: AI_MONTHLY_CAP[plan] - u.used - 1 };
  } catch (e) {
    // Release any hold placed before the failure, so a failed call never costs credits.
    if (heldPricing && heldReservation && heldPlan) {
      try {
        const pricingStore = await import("@/lib/pricing/store");
        await pricingStore.savePricingState(
          userId,
          pricingStore.settleReservation(heldPricing, heldReservation, 0, { userId, orgId: userId, plan: heldPlan, feature: kind }),
        );
      } catch {
        /* the fallback below still works */
      }
    }
    console.error("[ai] call failed", (e as Error).message.slice(0, 200));
    return { text: fallback, source: "rules", reason: "error" };
  }
}

const RULES = "Write in plain English for a small online store owner. Be short and specific. No hype, no emojis, no markdown headings. Never promise results. Never invent numbers that are not in the input.";

export const PROMPTS = {
  audit: `You turn a store check's findings into a short write-up. ${RULES} Give: one sentence on the overall state, then the top 3 fixes in order, each one line starting with "1.", "2.", "3.". Under 150 words.`,
  adcopy: `You write ad copy drafts for Meta and Google ads. ${RULES} Give 3 primary texts (each under 125 characters) and 3 headlines (each under 30 characters) as lines starting with "Primary:" or "Headline:". No claims about price, health, money or results that are not in the input.`,
  help: `You are the in-app helper for E-commerce Helix, self-serve software that guides store owners to grow. ${RULES} The user is stuck. Point them to one or two next steps inside Helix (Today, Profit, Scorecard, Cards, Learn, Connections, Store check, Campaigns) and say why. Under 120 words. If the question is not about their store or Helix, say you can only help with their store.`,
} as const;
