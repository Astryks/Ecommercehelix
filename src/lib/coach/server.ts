import "server-only";
import { hasDb, prisma } from "../db";
import { getAccount, getDays, getProfitSetup } from "../repo";
import { auditRuns } from "../site-audit/run";
import { waterfall } from "../profit-setup";
import { monthStart } from "../ai/config";
import { allChunks, type Chunk } from "./chunk";
import { keywordSearch } from "./keyword";
import { coachBudgetUsd, coachLive, COACH_MODELS, EMBED_DIMS, TOP_K } from "./config";
import { runCoach, type CoachAnswer, type CoachDeps } from "./engine";
import { approxTokens, type Hit } from "./router";
import { dailyGreeting, dailyTasks, EXTRACT_SYSTEM, memoryText, parseExtraction, type MemoryFact } from "./memory";
import { addMessage, getFacts, getMessages, getTasks, saveFacts, setTasks, today, yesterday } from "./store";
import { questForUser } from "../quest-server";
import { topicFor } from "../daily-topic";
import { priceOf } from "./config";
import { redact } from "./prompt";

let local: Chunk[] | null = null;
const localChunks = () => (local ??= allChunks(process.cwd()));

/** Hybrid search: 0.7 x cosine similarity (pgvector) + 0.3 x keyword rank (tsvector), top-k. Keyword-only in memory when there is no index yet. */
export async function retrieve(q: string, userId: string): Promise<Hit[]> {
  if (hasDb && coachLive()) {
    try {
      const n = await prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "CoachChunk" WHERE "embedding" IS NOT NULL`;
      if (Number(n[0]?.n ?? 0) > 0) {
        const { embed } = await import("ai");
        const e = await embed({ model: COACH_MODELS.embed, value: q.slice(0, 2000), providerOptions: { google: { outputDimensionality: EMBED_DIMS, taskType: "RETRIEVAL_QUERY" }, gateway: { user: userId, tags: ["feature:coach-embed"] } }, abortSignal: AbortSignal.timeout(8000) });
        const vec = `[${e.embedding.join(",")}]`;
        const rows = await prisma.$queryRaw<{ id: string; title: string; href: string; text: string; tokens: number; score: number }[]>`
          WITH q AS (SELECT ${vec}::vector AS v, websearch_to_tsquery('english', ${q}) AS t)
          SELECT c."id", c."title", c."href", c."text", c."tokens",
                 (0.7 * (1 - (c."embedding" <=> q.v)) + 0.3 * LEAST(1, ts_rank_cd(c."tsv", q.t) * 5))::float AS score
          FROM "CoachChunk" c, q WHERE c."embedding" IS NOT NULL
          ORDER BY score DESC LIMIT ${TOP_K}`;
        return rows.map((r) => ({ ...r, tokens: r.tokens || approxTokens(r.text) }));
      }
    } catch (e) {
      console.error("[coach] vector search failed, using keyword search", (e as Error).message.slice(0, 200));
    }
  }
  return keywordSearch(localChunks(), q, TOP_K);
}

const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

/** The user's own store as short aggregates only: no customer names, emails, addresses or order rows. */
export async function storeSummary(userId: string): Promise<string | null> {
  const [acct, profit, days, runs] = await Promise.all([getAccount(userId), getProfitSetup(userId), getDays(userId), auditRuns(userId, 1).catch(() => [])]);
  const lines: string[] = [`Plan: ${acct.plan}. Country: ${acct.country}. Track: ${acct.track}.`];
  if (profit && profit.price > 0) {
    const w = waterfall(profit);
    lines.push(`Profit setup (per order): price ${profit.price}, landed cost ${w.landed}, fees ${w.fees}, before marketing ${w.beforeMarketing}, marketing ${profit.marketingPerOrder}, net ${w.netPerOrder} (${r1(w.netMarginPct)}%). Break-even ROAS ${r1(w.breakEvenRoas)}, break-even CPA ${w.breakEvenCpa}. Orders a month ${profit.ordersPerMonth}.`);
  }
  const last = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  if (last.length) {
    const s = (f: (d: (typeof last)[number]) => number) => last.reduce((a, d) => a + (f(d) || 0), 0);
    const rev = s((d) => d.revenue), orders = s((d) => d.orders), ad = s((d) => d.adMeta + d.adGoogle + d.adTiktok + d.adOther), sess = s((d) => d.sessions);
    lines.push(`Numbers, last ${last.length} days to ${last[last.length - 1].date}: sales ${r0(rev)}, orders ${r0(orders)}, AOV ${orders ? r1(rev / orders) : "n/a"}, ad spend ${r0(ad)} (Meta ${r0(s((d) => d.adMeta))}, Google ${r0(s((d) => d.adGoogle))}, TikTok ${r0(s((d) => d.adTiktok))}), MER ${ad ? r1(rev / ad) : "n/a"}, refunds ${r0(s((d) => d.refunds))}, sessions ${r0(sess)}, conversion ${sess ? r1((orders / sess) * 100) + "%" : "n/a"}, new-customer orders ${r0(s((d) => d.newCustomerOrders))}, Meta-reported revenue ${r0(s((d) => d.metaRevenue))}.`);
  }
  const run = runs[0];
  if (run?.findings?.length) {
    const bad = run.findings.filter((f) => f.severity !== "good").slice(0, 8);
    lines.push(`Store check ${run.startedAt.slice(0, 10)}: ${bad.length ? bad.map((f) => `[${f.severity}] ${f.title}`).join("; ") : "no issues found"}.`);
  }
  return lines.length > 1 ? lines.join("\n") : null;
}

async function usage(userId: string) {
  if (!hasDb) return { used: 0, usedDeep: 0, spentUsd: 0 };
  const since = monthStart();
  const [used, usedDeep, spent] = await Promise.all([
    prisma.coachUsage.count({ where: { userId, ok: true, tier: { in: ["fast", "deep"] }, createdAt: { gte: since } } }),
    prisma.coachUsage.count({ where: { userId, ok: true, tier: "deep", createdAt: { gte: since } } }),
    prisma.coachUsage.aggregate({ _sum: { costUsd: true }, where: { createdAt: { gte: since } } }),
  ]);
  return { used, usedDeep, spentUsd: spent._sum.costUsd ?? 0 };
}

async function llmCall(userId: string, { model, system, prompt, maxOutputTokens }: { model: string; system: string; prompt: string; maxOutputTokens: number }) {
  const { generateText } = await import("ai");
  const r = await generateText({
        model,
        // The fixed system prompt is the cacheable prefix (Anthropic prompt cache via the gateway).
        messages: [
          { role: "system", content: system, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } },
          { role: "user", content: prompt },
        ],
        maxOutputTokens,
        temperature: 0.3,
        abortSignal: AbortSignal.timeout(45_000),
        providerOptions: { gateway: { user: userId, tags: ["feature:coach"], disallowPromptTraining: true } },
      });
  return { text: r.text, inputTokens: r.usage.inputTokens ?? 0, outputTokens: r.usage.outputTokens ?? 0, cachedTokens: r.usage.inputTokenDetails?.cacheReadTokens ?? 0 };
}

export function realDeps(userId: string): CoachDeps {
  return {
    llm: (p) => llmCall(userId, p),
    memory: async () => memoryText(await getFacts(userId)),
    history: async () => {
      const m = (await getMessages(userId, today())).slice(-6);
      return m.length ? m.map((x) => `${x.role === "user" ? "Owner" : "Coach"}: ${x.text.slice(0, 400)}`).join("\n") : null;
    },
    /** Memory update: one small fast-tier call per answer (about $0.0002). Logged as tier "memory" so it counts toward the hard cap but not the user's message limit. */
    async remember(question, answer) {
      const facts = await getFacts(userId);
      const prompt = `Existing notes (kind/key: fact):\n${facts.map((f) => `${f.kind}/${f.key}: ${f.fact}`).join("\n") || "none"}\n\nOwner said: ${question}\nCoach replied: ${answer.slice(0, 1500)}`;
      const r = await llmCall(userId, { model: COACH_MODELS.fast, system: EXTRACT_SYSTEM, prompt, maxOutputTokens: 300 });
      const x = parseExtraction(r.text);
      if (x.facts.length || x.forget.length) await saveFacts(userId, x.facts, x.forget);
      if (hasDb) await prisma.coachUsage.create({ data: { userId, tier: "memory", mode: "memory", why: "default", model: COACH_MODELS.fast, inputTokens: r.inputTokens, outputTokens: r.outputTokens, costUsd: priceOf(COACH_MODELS.fast, r.inputTokens, r.outputTokens), ok: true, question: "", answer: x.facts.map((f) => f.key).join(",").slice(0, 400) } });
    },
    retrieve: (q) => retrieve(q, userId),
    storeSummary: () => storeSummary(userId),
    usage: () => usage(userId),
    async log(row) {
      if (hasDb) await prisma.coachUsage.create({ data: { userId, ...row } });
      else console.info("[coach]", row.tier, row.mode, row.why, row.model, row.costUsd.toFixed(5));
    },
    blocked: (process.env.COACH_BLOCKED_NAMES ?? "").split(",").filter(Boolean),
  };
}

export async function askCoach(userId: string, question: string, deepDive: boolean): Promise<CoachAnswer> {
  const acct = await getAccount(userId);
  const deps = realDeps(userId);
  const a = await runCoach(deps, { question, deepDive, plan: acct.plan, live: coachLive(), budgetUsd: coachBudgetUsd() });
  if (!a.limited || a.limited === "deep-cap") {
    await addMessage(userId, today(), "user", redact(question).slice(0, 1000));
    await addMessage(userId, today(), "coach", a.text.slice(0, 4000), { mode: a.mode, modeLabel: a.modeLabel, tier: a.tier, links: a.links });
  }
  return a;
}

/** Number flags for today's tasks (aggregates only, no model call). */
async function numberFlags(userId: string): Promise<{ title: string; href: string }[]> {
  const [profit, days] = await Promise.all([getProfitSetup(userId), getDays(userId)]);
  const out: { title: string; href: string }[] = [];
  if (!profit || !profit.price) out.push({ title: "Fill in your profit setup so Helix knows your break-even", href: "/dashboard/profit" });
  const last = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  if (!last.length || last[last.length - 1].date < yesterday()) out.push({ title: "Add yesterday's sales and ad spend", href: "/dashboard/numbers" });
  else if (profit && profit.price) {
    const rev = last.reduce((a, d) => a + d.revenue, 0), ad = last.reduce((a, d) => a + d.adMeta + d.adGoogle + d.adTiktok + d.adOther, 0);
    const be = waterfall(profit).breakEvenRoas;
    if (ad > 0 && be > 0 && rev / ad < be) out.push({ title: "Ads cost more than they bring in this week: check your weakest ad", href: "/dashboard/numbers" });
  }
  return out;
}

export type CoachOpen = {
  greeting: string;
  day: string;
  messages: { id: string; role: "user" | "coach"; text: string; meta: unknown }[];
  tasks: { id: string; title: string; href: string; why: string; done: boolean }[];
  facts: MemoryFact[];
};

/** Called when the widget opens: today's chat only (new chat each day), today's tasks (made once per day), memory, and a personal greeting. */
export async function openCoach(userId: string): Promise<CoachOpen> {
  const day = today();
  const [acct, facts, msgs, yTasks] = await Promise.all([getAccount(userId), getFacts(userId), getMessages(userId, day), getTasks(userId, yesterday())]);
  let tasks = await getTasks(userId, day);
  const firstName = (acct.name || "").split(" ")[0] ?? "";
  const yOpen = yTasks.filter((t) => !t.done), yDone = yTasks.filter((t) => t.done);
  if (!tasks.length) {
    const [{ quest }, flags] = await Promise.all([questForUser(userId).catch(() => ({ quest: null })), numberFlags(userId).catch(() => [])]);
    const topic = topicFor(day);
    const next = quest?.next ? { title: quest.next.title, href: quest.next.href, stage: quest.next.stage[0].toUpperCase() + quest.next.stage.slice(1) } : null;
    await setTasks(userId, day, dailyTasks({ firstName, yesterdayOpen: yOpen, nextLesson: next, topic: topic ? { title: topic.title, href: topic.href } : null, flags, facts }));
    tasks = await getTasks(userId, day);
  }
  const greeting = dailyGreeting({ firstName, facts, yesterdayDone: yDone.map((t) => t.title), yesterdayOpen: yOpen.map((t) => t.title) });
  return { greeting, day, messages: msgs.map(({ id, role, text, meta }) => ({ id, role, text, meta })), tasks: tasks.map(({ id, title, href, why, done }) => ({ id, title, href, why, done })), facts };
}

/** For the daily email (optional, not wired into the cron yet): today's coach tasks as plain lines. */
export async function coachTasksForEmail(userId: string): Promise<{ title: string; href: string }[]> {
  return (await openCoach(userId)).tasks.filter((t) => !t.done).map(({ title, href }) => ({ title, href }));
}
