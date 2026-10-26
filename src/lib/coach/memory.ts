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
  yesterdayOpen: { title: string; href: string }[];
  nextLesson: { title: string; href: string; stage: string } | null;
  topic: { title: string; href: string } | null;
  flags: { title: string; href: string }[];
  facts: MemoryFact[];
};
export type CoachTask = { key: string; title: string; href: string; why: string };

/** Today's 1-3 tasks, rule-based (no model call, no cost): follow up yesterday, fix a red number, next checklist lesson, daily topic. */
export function dailyTasks(i: TaskInput): CoachTask[] {
  const out: CoachTask[] = [];
  const add = (t: CoachTask) => out.length < 3 && !out.some((o) => o.href === t.href || o.title === t.title) && out.push(t);
  const y = i.yesterdayOpen[0];
  if (y) add({ key: "carry", title: y.title, href: y.href, why: "Carried over from yesterday. Let's finish it." });
  for (const f of i.flags.slice(0, 1)) add({ key: "flag", title: f.title, href: f.href, why: "Your numbers say this needs a look." });
  if (i.nextLesson) add({ key: "lesson", title: `Next on your ${i.nextLesson.stage} checklist: ${i.nextLesson.title}`, href: i.nextLesson.href, why: "Your next step in Attract, Convert, Grow." });
  if (i.topic) add({ key: "topic", title: `Today's topic: ${i.topic.title}`, href: i.topic.href, why: "One short lesson for today." });
  return out;
}

/** Fixed greeting from Sid, then one personal line built from memory and yesterday (no model call). */
export function dailyGreeting(i: { firstName: string; facts: MemoryFact[]; yesterdayDone: string[]; yesterdayOpen: string[] }): string {
  const name = i.firstName ? `, ${i.firstName}` : "";
  const goal = i.facts.find((f) => f.kind === "goals")?.fact;
  let line: string;
  if (i.yesterdayDone.length) line = `Good to see you${name}. Nice work finishing "${i.yesterdayDone[0]}" yesterday.`;
  else if (i.yesterdayOpen.length) line = `Welcome back${name}. Yesterday's "${i.yesterdayOpen[0]}" is still open, so it's first on today's list.`;
  else line = `Welcome back${name}.`;
  if (goal) line += ` Still working toward: ${goal.replace(/\.$/, "")}.`;
  return `${GREETING}\n\n${line} Here are today's tasks.`;
}
