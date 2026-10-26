import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { COACH_LIMITS, COACH_MODELS, coachEnabled, coachLive, priceOf } from "@/lib/coach/config";
import { classify, limitGate, pickMode, pickTier, selfCheckFails, type Hit } from "@/lib/coach/router";
import { COACH_SYSTEM, redact } from "@/lib/coach/prompt";
import { runCoach, scrub, type CoachDeps } from "@/lib/coach/engine";
import { allChunks } from "@/lib/coach/chunk";
import { keywordSearch } from "@/lib/coach/keyword";
import { cleanFact, dailyGreeting, dailyTasks, GREETING, mergeFacts, parseExtraction, shouldWelcome, storeFacts, welcomeMessage } from "@/lib/coach/memory";

const hit = (score: number, n = 1): Hit => ({ id: `h${n}`, text: "Price anchoring: show the compare-at price next to your offer.", title: `Lesson ${n}`, href: `/learn/convert#lesson-${n}`, score, tokens: 20 });
const GOOD = "Helix tip: show a compare-at price next to your offer and test it for a week [L1]. Then check conversion rate against last week before changing anything else.";

function deps(over: Partial<CoachDeps> = {}) {
  const calls: string[] = [];
  const logs: { tier: string; why: string; model: string }[] = [];
  const d: CoachDeps = {
    llm: vi.fn(async ({ model }) => { calls.push(model); return { text: GOOD, inputTokens: 800, outputTokens: 200 }; }),
    retrieve: async () => [hit(0.8)],
    storeSummary: async () => null,
    usage: async () => ({ used: 0, usedDeep: 0, spentUsd: 0 }),
    log: async (r) => { logs.push(r); },
    ...over,
  };
  return { d, calls, logs };
}
const input = (o: Partial<Parameters<typeof runCoach>[1]> = {}) => ({ question: "How should I price my bundle?", deepDive: false, plan: "starter" as const, live: true, budgetUsd: 50, ...o });

describe("coach config + flag", () => {
  it("model ids are config constants with a Gemini fallback", () => {
    expect(COACH_MODELS.fast).toMatch(/^anthropic\/claude-haiku/);
    expect(COACH_MODELS.deep).toMatch(/^anthropic\/claude-sonnet/);
    expect(COACH_MODELS.fallback).toMatch(/^google\/gemini/);
  });
  it("plan limits match the plan", () => {
    expect(COACH_LIMITS.free).toEqual({ total: 20, deep: 0 });
    expect(COACH_LIMITS.starter).toEqual({ total: 300, deep: 40 });
    expect(COACH_LIMITS.growth).toEqual({ total: 800, deep: 100 });
  });
  it("flag is off by default and off in production unless the prod flag is set", () => {
    expect(coachEnabled({})).toBe(false);
    expect(coachEnabled({ HELIX_COACH: "1", NODE_ENV: "development" })).toBe(true);
    expect(coachEnabled({ HELIX_COACH: "1", VERCEL_ENV: "production", NODE_ENV: "production" })).toBe(false);
    expect(coachEnabled({ HELIX_COACH: "1", HELIX_COACH_PROD: "1", VERCEL_ENV: "production", NODE_ENV: "production" })).toBe(true);
  });
  it("not live without a gateway key", () => {
    expect(coachLive({})).toBe(false);
    expect(coachLive({ AI_GATEWAY_API_KEY: "x" })).toBe(true);
    expect(coachLive({ AI_GATEWAY_API_KEY: "x", AI_DISABLED: "1" })).toBe(false);
  });
  it("prices a typical fast message well under a cent", () => {
    expect(priceOf(COACH_MODELS.fast, 3000, 400)).toBeLessThan(0.01);
  });
});

describe("routing", () => {
  it("fast by default, deep for a Deep dive / multi-step / big context", () => {
    expect(pickTier({ deepDive: false, multiStep: false, contextTokens: 2000, deepLeft: 10 })).toEqual({ tier: "fast", why: "default" });
    expect(pickTier({ deepDive: true, multiStep: false, contextTokens: 2000, deepLeft: 10 })).toEqual({ tier: "deep", why: "deep-dive" });
    expect(pickTier({ deepDive: false, multiStep: true, contextTokens: 2000, deepLeft: 10 }).tier).toBe("deep");
    expect(pickTier({ deepDive: false, multiStep: false, contextTokens: 13000, deepLeft: 10 })).toEqual({ tier: "deep", why: "big-context" });
  });
  it("stays fast when no deep messages are left", () => {
    expect(pickTier({ deepDive: true, multiStep: false, contextTokens: 0, deepLeft: 0 }).tier).toBe("fast");
  });
  it("classifies store and multi-step questions", () => {
    expect(classify("Why did my sales drop this week?").aboutStore).toBe(true);
    expect(classify("Give me a step-by-step 30 day plan to launch ads and then fix my emails").multiStep).toBe(true);
    expect(classify("What is a good headline?").aboutStore).toBe(false);
  });
  it("mode: store when asked about store data, course when grounded, else general", () => {
    expect(pickMode({ aboutStore: true, hasStoreData: true, hits: [] })).toBe("store");
    expect(pickMode({ aboutStore: false, hasStoreData: true, hits: [hit(0.7)] })).toBe("course");
    expect(pickMode({ aboutStore: false, hasStoreData: false, hits: [hit(0.4)] })).toBe("general");
  });
  it("limit gate enforces plan caps, deep caps and the hard budget", () => {
    expect(limitGate({ plan: "free", used: 20, usedDeep: 0, spentUsd: 0, budgetUsd: 50, live: true })).toMatchObject({ ok: false, reason: "cap" });
    expect(limitGate({ plan: "free", used: 0, usedDeep: 0, spentUsd: 0, budgetUsd: 50, live: true })).toMatchObject({ ok: true, deepLeft: 0, left: 20 });
    expect(limitGate({ plan: "starter", used: 10, usedDeep: 40, spentUsd: 0, budgetUsd: 50, live: true })).toMatchObject({ ok: true, deepLeft: 0 });
    expect(limitGate({ plan: "growth", used: 0, usedDeep: 0, spentUsd: 50, budgetUsd: 50, live: true })).toMatchObject({ ok: false, reason: "budget" });
    expect(limitGate({ plan: "growth", used: 0, usedDeep: 0, spentUsd: 0, budgetUsd: 50, live: false })).toMatchObject({ ok: false, reason: "off" });
  });
  it("self-check fails short, hedged or uncited course answers", () => {
    expect(selfCheckFails("Ok.", "course")).toBe(true);
    expect(selfCheckFails(GOOD.replace(" [L1]", ""), "course")).toBe(true);
    expect(selfCheckFails(GOOD, "course")).toBe(false);
  });
});

describe("runCoach (mocked, no spend)", () => {
  it("course answer on the fast model with Helix lesson links and no [Ln] tags", async () => {
    const { d, calls } = deps();
    const a = await runCoach(d, input());
    expect(calls).toEqual([COACH_MODELS.fast]);
    expect(a.mode).toBe("course");
    expect(a.modeLabel).toBe("Helix course");
    expect(a.links[0].href).toMatch(/^\/learn\//);
    expect(a.text).not.toMatch(/\[L\d\]/);
  });
  it("Deep dive uses the deep model", async () => {
    const { d, calls } = deps();
    const a = await runCoach(d, input({ deepDive: true }));
    expect(calls[0]).toBe(COACH_MODELS.deep);
    expect(a.tier).toBe("deep");
  });
  it("Deep dive on Free stays fast and says so", async () => {
    const { d, calls } = deps();
    const a = await runCoach(d, input({ deepDive: true, plan: "free" }));
    expect(calls[0]).toBe(COACH_MODELS.fast);
    expect(a.limited).toBe("deep-cap");
  });
  it("low score falls back to labelled general advice with no links", async () => {
    const { d } = deps({ retrieve: async () => [hit(0.3)], llm: async () => ({ text: "Keep your offer simple and test one change at a time so you know what worked.", inputTokens: 100, outputTokens: 50 }) });
    const a = await runCoach(d, input({ question: "What should I name my cat?" }));
    expect(a.mode).toBe("general");
    expect(a.text.startsWith("General advice (not from the Helix course):")).toBe(true);
    expect(a.links).toEqual([]);
  });
  it("falls back to Gemini when Claude errors", async () => {
    const calls: string[] = [];
    const { d } = deps({ llm: async ({ model }) => { calls.push(model); if (model.startsWith("anthropic/")) throw new Error("down"); return { text: GOOD, inputTokens: 1, outputTokens: 1 }; } });
    const a = await runCoach(d, input());
    expect(calls).toContain(COACH_MODELS.fallback);
    expect(a.model).toBe(COACH_MODELS.fallback);
  });
  it("escalates to deep when the fast self-check fails", async () => {
    const calls: string[] = [];
    const { d } = deps({ llm: async ({ model }) => { calls.push(model); return { text: model === COACH_MODELS.fast ? "Not sure." : GOOD, inputTokens: 1, outputTokens: 1 }; } });
    const a = await runCoach(d, input());
    expect(calls).toEqual([COACH_MODELS.fast, COACH_MODELS.deep]);
    expect(a.why).toBe("self-check");
  });
  it("makes no model call when not live (no key)", async () => {
    const { d, calls } = deps();
    const a = await runCoach(d, input({ live: false }));
    expect(calls).toEqual([]);
    expect(a.limited).toBe("off");
  });
  it("makes no model call over the monthly cap", async () => {
    const { d, calls } = deps({ usage: async () => ({ used: 300, usedDeep: 0, spentUsd: 0 }) });
    const a = await runCoach(d, input());
    expect(calls).toEqual([]);
    expect(a.limited).toBe("cap");
  });
  it("logs redacted questions", async () => {
    const { d, logs } = deps();
    await runCoach(d, input({ question: "Customer jane@example.com called 0412 345 678 about pricing" }));
    const row = logs[0] as unknown as { question: string };
    expect(row.question).not.toContain("jane@example.com");
    expect(row.question).not.toContain("0412 345 678");
  });
  it("scrubs blocked names from answers", () => {
    expect(scrub("As Acme Academy says, test prices.", ["Acme Academy"])).not.toMatch(/Acme Academy/i);
  });
});

describe("prompt + privacy", () => {
  it("system prompt forbids naming external courses and requires a Helix tip", () => {
    expect(COACH_SYSTEM).toMatch(/never name/i);
    expect(COACH_SYSTEM).toMatch(/Helix tip/);
  });
  it("redacts emails, cards and phones", () => {
    const r = redact("mail a@b.co card 4111 1111 1111 1111 phone +61 412 345 678");
    expect(r).not.toMatch(/a@b\.co|4111|412 345/);
  });
});

describe("corpus", () => {
  const chunks = allChunks(path.resolve(__dirname, ".."));
  it("chunks the in-repo Helix corpus with lesson links", () => {
    expect(chunks.length).toBeGreaterThan(100);
    expect(chunks.every((c) => c.href.startsWith("/learn/"))).toBe(true);
  });
  it("keyword retrieval finds relevant lessons with no key", () => {
    const hits = keywordSearch(chunks, "email welcome flow abandoned cart", 6);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThanOrEqual(6);
  });
});

describe("memory + daily", () => {
  it("cleanFact drops PII and unknown kinds", () => {
    expect(cleanFact({ kind: "goals", fact: "Hit $10k a month by June" })?.kind).toBe("goals");
    expect(cleanFact({ kind: "nope", fact: "x y z" })).toBeNull();
    expect(cleanFact({ kind: "results", fact: "customer jane@example.com complained" })?.fact ?? "").not.toContain("jane@example.com");
  });
  it("parses extraction JSON and merges/forgets facts", () => {
    const p = parseExtraction('noise {"facts":[{"kind":"budget","key":"ads","fact":"$20 a day on ads"}],"forget":["goals:old"]} end');
    expect(p.facts[0].fact).toBe("$20 a day on ads");
    const merged = mergeFacts([{ kind: "goals", key: "old", fact: "old goal" }], p.facts, p.forget);
    expect(merged.map((f) => f.key)).toEqual(["ads"]);
  });
  it("daily tasks: 1-3, flags first, never yesterday's tasks", () => {
    const t = dailyTasks({ firstName: "Sam", day: "2026-10-27", yesterday: [{ title: "Bundles", href: "/learn/z" }], yesterdayOpen: [{ title: "Fix shipping page", href: "/learn/x" }], nextLesson: { title: "Write a welcome email", href: "/learn/y", stage: "convert" }, topic: { title: "Bundles", href: "/learn/z" }, flags: [{ title: "Refunds are up", href: "/dashboard" }], facts: [] });
    expect(t.length).toBeGreaterThanOrEqual(1);
    expect(t.length).toBeLessThanOrEqual(3);
    expect(t[0].title).toMatch(/Refunds/);
    expect(t.some((x) => /Fix shipping|Bundles/.test(x.title))).toBe(false);
  });
  it("daily tasks: today's set never repeats yesterday's set", () => {
    const base = { firstName: "", yesterdayOpen: [], nextLesson: null, topic: null, flags: [], facts: [] };
    const d1 = dailyTasks({ ...base, day: "2026-10-27" });
    const d2 = dailyTasks({ ...base, day: "2026-10-28", yesterday: d1 });
    expect(d1.length).toBeGreaterThan(0);
    expect(d2.length).toBeGreaterThan(0);
    for (const t of d2) expect(d1.some((y) => y.href === t.href || y.title === t.title)).toBe(false);
  });
  it("store facts: totals only, no customer details", () => {
    const f = storeFacts({ shopName: "Sunny Socks", productCount: 12, last30: { orders: 40, revenue: 2400, adSpend: 600, profit: 500 }, topProducts: ["Wool socks"], channels: ["Shopify", "Meta"], storeCheck: { score: 71, topIssue: "Add reviews" }, profit: { avgOrder: 60, margin: 0.55 }, email: { revenue30: 300, listGrowth30: 25, flowsOff: ["abandoned cart"] } });
    expect(f.map((x) => x.key)).toEqual(expect.arrayContaining(["sync-shop", "sync-30d", "sync-top", "sync-channels", "sync-check", "sync-profit", "sync-email"]));
    const all = f.map((x) => x.fact).join(" ");
    expect(all).not.toMatch(/@|\+?\d{3}[ -]?\d{3}[ -]?\d{3}/);
    expect(all).toMatch(/40 orders/);
  });
  it("welcome: only paid active/trialing subs", () => {
    expect(shouldWelcome({ plan: "starter", status: "active" })).toBe(true);
    expect(shouldWelcome({ plan: "growth", status: "trialing" })).toBe(true);
    expect(shouldWelcome({ plan: "free", status: "active" })).toBe(false);
    expect(shouldWelcome({ plan: "starter", status: "canceled" })).toBe(false);
    expect(welcomeMessage("Sam", "Starter")).toMatch(/Sam/);
  });
  it("greeting starts with the fixed text then a personal line", () => {
    const g = dailyGreeting({ firstName: "Sam", facts: [{ kind: "goals", key: "g", fact: "Reach 100 orders a month" }], yesterdayDone: ["Fix shipping page"], yesterdayOpen: [] });
    expect(g.startsWith(GREETING)).toBe(true);
    expect(g).toMatch(/Sam/);
    expect(g).toMatch(/100 orders/);
  });
});
