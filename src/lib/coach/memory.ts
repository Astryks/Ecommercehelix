/**
 * Per-user coach memory, greeting and daily tasks. Pure functions (no DB, no model), so they are cheap and testable.
 * Memory holds durable business facts only. Never customer PII.
 */
import { redact } from "./prompt";

export const MEMORY_KINDS = ["business", "store", "products", "channels", "goals", "budget", "decisions", "tried", "results"] as const;
export type MemoryKind = (typeof MEMORY_KINDS)[number];
export const MEMORY_LABEL: Record<MemoryKind, string> = {
  business: "Your business", store: "Your store", products: "Products", channels: "Ad accounts and channels", goals: "Goals",
  budget: "Budget", decisions: "Decisions", tried: "What you have tried", results: "Results",
};
export type MemoryFact = { id?: string; kind: MemoryKind; key: string; fact: string; updatedAt?: string };
export const MAX_FACTS = 60;
export const MAX_FACT_CHARS = 240;

export const GREETING = "Hi, I'm here to help you grow your business. Ask me anything!";

const PII_HINT = /\b(customer|client|buyer)s?\b.*\b(name|email|phone|address)\b|\[email\]|\[phone\]|\[address\]|\[number\]/i;

/** Clean one fact: redact, trim, drop anything that still looks like customer PII. Returns null to drop it. */
export function cleanFact(f: { kind: string; key?: string; fact: string }): MemoryFact | null {
  if (!(MEMORY_KINDS as readonly string[]).includes(f.kind)) return null;
  const fact = redact(String(f.fact ?? "")).replace(/\s+/g, " ").trim().slice(0, MAX_FACT_CHARS);
  if (fact.length < 3 || PII_HINT.test(fact)) return null;
  const key = String(f.key || fact).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "fact";
  return { kind: f.kind as MemoryKind, key, fact };
}

/** Parse the extractor model's JSON ({"facts":[{kind,key,fact}], "forget":[key]}). Bad JSON gives nothing. */
export function parseExtraction(raw: string): { facts: MemoryFact[]; forget: string[] } {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return { facts: [], forget: [] };
  try {
    const j = JSON.parse(m[0]) as { facts?: { kind: string; key?: string; fact: string }[]; forget?: string[] };
    return { facts: (j.facts ?? []).slice(0, 8).map(cleanFact).filter((x): x is MemoryFact => Boolean(x)), forget: (j.forget ?? []).map(String).slice(0, 8) };
  } catch {
    return { facts: [], forget: [] };
  }
}

/** Upsert by kind+key (newest wins), apply forgets, keep the newest MAX_FACTS. */
export function mergeFacts(old: MemoryFact[], add: MemoryFact[], forget: string[] = [], now = new Date().toISOString()): MemoryFact[] {
  const map = new Map(old.map((f) => [`${f.kind}:${f.key}`, f]));
  for (const k of forget) for (const key of [...map.keys()]) if (key === k || key.endsWith(`:${k}`)) map.delete(key);
  for (const f of add) map.set(`${f.kind}:${f.key}`, { ...map.get(`${f.kind}:${f.key}`), ...f, updatedAt: now });
  return [...map.values()].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")).slice(0, MAX_FACTS);
}

/** Memory as prompt text, grouped by kind. */
export function memoryText(facts: MemoryFact[]): string | null {
  if (!facts.length) return null;
  return MEMORY_KINDS.flatMap((k) => {
    const fs = facts.filter((f) => f.kind === k);
    return fs.length ? [`${MEMORY_LABEL[k]}: ${fs.map((f) => f.fact).join("; ")}`] : [];
  }).join("\n");
}

export const EXTRACT_SYSTEM = `You keep short notes about a store owner for their business coach.
From the chat turn, pull out durable facts about THEIR BUSINESS only: business, store, products, channels (ad accounts, platforms), goals, budget, decisions, tried (what they have tried), results.
Never record anything about their customers (names, emails, phones, addresses, order details) or payment details.
Reply with JSON only: {"facts":[{"kind":"goals","key":"short-slug","fact":"one short sentence"}],"forget":["key"]}.
Reuse an existing key to update a fact. Put a key in "forget" if the owner says it is no longer true. Return {"facts":[],"forget":[]} if nothing new.`;

export type TaskInput = {
  firstName: string;
  day?: string; // YYYY-MM-DD, picks the rotating extras
  yesterday?: { title: string; href: string }[]; // every task shown yesterday: never repeated today
  yesterdayOpen: { title: string; href: string }[];
  nextLesson: { title: string; href: string; stage: string } | null;
  topic: { title: string; href: string } | null;
  flags: { title: string; href: string }[];
  facts: MemoryFact[];
};
export type CoachTask = { key: string; title: string; href: string; why: string };

/** Short Helix tasks that rotate by day when there is room left. */
export const ROTATING_TASKS: { title: string; href: string; why: string }[] = [
  { title: "Check yesterday's numbers on the Numbers page", href: "/dashboard/numbers", why: "Two minutes a day keeps surprises small." },
  { title: "Run a store check and fix the top item", href: "/dashboard/store-check", why: "Small fixes on the store page lift sales." },
  { title: "Check your profit per order", href: "/dashboard/profit", why: "Know what you keep after costs." },
  { title: "Review this week's goal", href: "/dashboard/goals", why: "A clear goal makes each day's choice easier." },
  { title: "Look at which ads made money", href: "/dashboard/campaigns", why: "Move budget toward what works." },
  { title: "Check stock on your best sellers", href: "/dashboard/stock", why: "Running out stops sales and ads." },
  { title: "Ask one happy customer for a review", href: "/dashboard/review", why: "Reviews help new visitors trust you." },
];

const seedOf = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Today's 1-3 tasks, rule-based (no model call, no cost): a red number, something from memory, next checklist lesson, daily topic, then a rotating extra.
 *  Never repeats a task (same title or link) that was on yesterday's list. */
export function dailyTasks(i: TaskInput): CoachTask[] {
  const out: CoachTask[] = [];
  const seen = [...(i.yesterday ?? []), ...i.yesterdayOpen];
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const yTitles = new Set(seen.map((t) => norm(t.title))), yHrefs = new Set(seen.map((t) => t.href));
  const add = (t: CoachTask) => {
    if (out.length >= 3 || yTitles.has(norm(t.title)) || yHrefs.has(t.href) || out.some((o) => o.href === t.href || o.title === t.title)) return;
    out.push(t);
  };
  for (const f of i.flags.slice(0, 2)) add({ key: "flag", title: f.title, href: f.href, why: "Your numbers say this needs a look." });
  const goal = i.facts.find((f) => f.kind === "goals");
  const tried = i.facts.find((f) => f.kind === "tried");
  if (goal) add({ key: "memory", title: `Check progress on your goal: ${goal.fact.replace(/\.$/, "")}`, href: "/dashboard/goals", why: "You told me this matters." });
  else if (tried) add({ key: "memory", title: `See if it worked: ${tried.fact.replace(/\.$/, "")}`, href: "/dashboard/numbers", why: "Check results before trying the next thing." });
  if (i.nextLesson) add({ key: "lesson", title: `Next on your ${i.nextLesson.stage} checklist: ${i.nextLesson.title}`, href: i.nextLesson.href, why: "Your next step in Attract, Convert, Grow." });
  if (i.topic) add({ key: "topic", title: `Today's topic: ${i.topic.title}`, href: i.topic.href, why: "One short lesson for today." });
  const start = seedOf(i.day ?? "") % ROTATING_TASKS.length;
  for (let k = 0; k < ROTATING_TASKS.length && out.length < 3; k++) add({ key: "extra", ...ROTATING_TASKS[(start + k) % ROTATING_TASKS.length] });
  return out;
}

/** Store summary (totals only, never customer details) turned into memory facts the coach can use. */
export type StoreSummaryInput = {
  shopName?: string | null; currency?: string | null; productCount?: number;
  last30?: { orders: number; revenue: number; adSpend: number; profit?: number | null } | null;
  topProducts?: string[];
  channels?: string[];
  storeCheck?: { score: number; topIssue?: string | null } | null;
  profit?: { avgOrder?: number | null; margin?: number | null } | null;
  email?: { revenue30: number; listGrowth30: number; flowsOff: string[] } | null;
};
const money = (n: number, cur?: string | null) => `${cur && cur !== "USD" ? cur + " " : "$"}${Math.round(n).toLocaleString("en-US")}`;
export function storeFacts(i: StoreSummaryInput): MemoryFact[] {
  const f: MemoryFact[] = [];
  const push = (kind: MemoryKind, key: string, fact: string) => { const c = cleanFact({ kind, key, fact }); if (c) f.push(c); };
  if (i.shopName) push("store", "sync-shop", `Store: ${i.shopName}${i.productCount ? ` with ${i.productCount} products` : ""}.`);
  if (i.last30 && (i.last30.orders || i.last30.revenue)) {
    const p = i.last30.profit != null ? `, profit about ${money(i.last30.profit, i.currency)}` : "";
    push("results", "sync-30d", `Last 30 days: ${i.last30.orders} orders, ${money(i.last30.revenue, i.currency)} sales, ${money(i.last30.adSpend, i.currency)} ad spend${p}.`);
  }
  if (i.topProducts?.length) push("products", "sync-top", `Best sellers: ${i.topProducts.slice(0, 3).join(", ")}.`);
  if (i.channels?.length) push("channels", "sync-channels", `Connected: ${i.channels.join(", ")}.`);
  if (i.storeCheck) push("store", "sync-check", `Store check score ${i.storeCheck.score}/100${i.storeCheck.topIssue ? `; top fix: ${i.storeCheck.topIssue}` : ""}.`);
  if (i.profit && (i.profit.avgOrder || i.profit.margin)) push("business", "sync-profit", `Profit setup: ${i.profit.avgOrder ? `average order ${money(i.profit.avgOrder, i.currency)}` : ""}${i.profit.avgOrder && i.profit.margin ? ", " : ""}${i.profit.margin ? `gross margin ${Math.round(i.profit.margin * 100)}%` : ""}.`);
  if (i.email) push("channels", "sync-email", `Email (Klaviyo) last 30 days: ${money(i.email.revenue30, i.currency)} email revenue, list ${i.email.listGrowth30 >= 0 ? "+" : ""}${i.email.listGrowth30}${i.email.flowsOff.length ? `; not running: ${i.email.flowsOff.join(", ")}` : ""}.`);
  return f;
}

/** First coach message after someone subscribes. */
export function welcomeMessage(firstName: string, plan: string): string {
  const name = firstName ? `, ${firstName}` : "";
  return `Welcome to Helix ${plan}${name}! I'm your Helix coach. I know your numbers and the Helix course, and I'll remember what you tell me about your business.\n\nEach day I'll give you 1-3 short tasks here and in your daily email. Your first tasks are below. Ask me anything, any time.`;
}

/** Fixed greeting from Sid, then one personal line built from memory and yesterday (no model call). */
export function dailyGreeting(i: { firstName: string; facts: MemoryFact[]; yesterdayDone: string[]; yesterdayOpen: string[] }): string {
  const name = i.firstName ? `, ${i.firstName}` : "";
  const goal = i.facts.find((f) => f.kind === "goals")?.fact;
  let line: string;
  if (i.yesterdayDone.length) line = `Good to see you${name}. Nice work finishing "${i.yesterdayDone[0]}" yesterday.`;
  else if (i.yesterdayOpen.length) line = `Welcome back${name}. Yesterday's "${i.yesterdayOpen[0]}" is still open if you want to come back to it.`;
  else line = `Welcome back${name}.`;
  if (goal) line += ` Still working toward: ${goal.replace(/\.$/, "")}.`;
  return `${GREETING}\n\n${line} Here are today's tasks.`;
}

/** Paid plans that get the coach welcome (in-app plus email, once per subscription). */
export const shouldWelcome = (next: { plan: string; status: string }) =>
  ["starter", "growth"].includes(next.plan.toLowerCase()) && ["active", "trialing"].includes(next.status);
