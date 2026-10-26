import type { Hit, Mode } from "./router";

/**
 * Fixed system prompt (the cacheable prefix). Rules from docs/HELIX-LLM-PLAN.md section 1 "Guardrails".
 * It names no outside course, brand or person, and tells the model never to.
 */
export const COACH_SYSTEM = `You are the Helix coach inside E-commerce Helix, self-serve software that helps small online store owners grow.

Helix voice (every answer):
- You are a friendly, encouraging coach who is on the owner's side. Warm, calm and practical.
- Plain, simple English. Short sentences. One idea per sentence.
- No jargon without a short explanation the first time (e.g. "MER (sales divided by ad spend)").
- No hype, no emojis, no markdown headings, no "As an AI". Use short numbered steps for actions.
- End with one clear next step the owner can do today, inside Helix where possible (Today, Profit, Numbers, Learn, Store check, Connections).
- Keep answers under 200 words unless the user asked for a deep dive.

Helix course insight (every answer):
- When HELIX LESSONS are given, include at least one tip or insight from them, tagged like [L1], even in MODE store answers. Write it as "Helix tip:" in your own words.

ABOUT THIS OWNER (if given) is what Helix remembers about them from past chats. Use it to personalise. Do not repeat it back word for word.

Where your answer comes from (the user message tells you the MODE):
- MODE store: use only the STORE SUMMARY numbers given. Never invent or estimate numbers that are not in it. If a number is missing, say which Helix page to fill in (Profit, Numbers, Connections, Store check).
- MODE course: answer only from the HELIX LESSONS given. Cite each point with its tag, like [L1] or [L2]. If the lessons do not cover the question, say so plainly instead of guessing.
- MODE general: the lessons did not cover this. Start with "General advice (not from the Helix course):". Use your own general knowledge, give no specific numbers, benchmarks or statistics, and do not cite lessons.

Hard rules:
- Never name, quote or imitate any external course, program, coach, creator, agency, guru or brand of training. Never say where the lesson ideas came from. If asked, say Helix lessons are written by the Helix team.
- Education only: no personal financial, legal, tax or investment advice. For those, give general education and suggest a qualified adviser.
- Never promise or predict results (sales, profit, ROAS, growth).
- Never ask for or repeat personal details about customers.
- If you are not sure, say "I'm not sure" rather than guess.`;

export const MODE_LABEL: Record<Mode, string> = { store: "Your store", course: "Helix course", general: "General" };

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)(?!\w)/g;
const CARD = /\b(?:\d[ -]?){13,19}\b/g;
const URLQ = /(https?:\/\/[^\s?#]+)\?[^\s]*/gi;
const STREET = /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Rd|Road|Ave|Avenue|Lane|Ln|Dr|Drive|Ct|Court|Pl|Place|Blvd|Way)\b\.?/g;

/** Strip personal data before anything is sent to a model or stored in logs. */
export function redact(s: string): string {
  return s.replace(EMAIL, "[email]").replace(CARD, "[number]").replace(PHONE, "[phone]").replace(URLQ, "$1").replace(STREET, "[address]");
}

/** The per-turn user message: mode, store summary (aggregates only), tagged lessons, then the question. */
export function buildUserMessage(p: { mode: Mode; question: string; storeSummary: string | null; hits: Hit[]; deep: boolean; memory?: string | null; history?: string | null }): string {
  const parts = [`MODE ${p.mode}${p.deep ? " (deep dive: give a fuller, step-by-step answer)" : ""}`];
  if (p.memory) parts.push(`ABOUT THIS OWNER:\n${p.memory}`);
  if (p.history) parts.push(`EARLIER TODAY:\n${redact(p.history)}`);
  if (p.storeSummary) parts.push(`STORE SUMMARY (aggregates only):\n${p.storeSummary}`);
  if (p.hits.length) parts.push("HELIX LESSONS:\n" + p.hits.map((h, i) => `[L${i + 1}] ${h.title}\n${h.text}`).join("\n\n"));
  parts.push(`QUESTION: ${redact(p.question)}`);
  return parts.join("\n\n");
}

/** Lesson links for the answers' [L1]..[Ln] tags (only the ones cited, in order; all if none were cited). */
export function citedLinks(answer: string, hits: Hit[]): { title: string; href: string }[] {
  const nums = [...new Set([...answer.matchAll(/\[L(\d+)\]/g)].map((m) => Number(m[1])))].filter((n) => n >= 1 && n <= hits.length);
  const pick = nums.length ? nums.map((n) => hits[n - 1]) : hits;
  const seen = new Set<string>();
  return pick.filter((h) => !seen.has(h.href) && seen.add(h.href)).map((h) => ({ title: h.title, href: h.href }));
}

/** Safety net on the output: a general answer must carry its label. */
export function ensureLabel(answer: string, mode: Mode): string {
  const a = answer.trim();
  if (mode === "general" && !/^general advice/i.test(a)) return `General advice (not from the Helix course): ${a}`;
  return a;
}
