/**
 * The daily topic: one lesson-based theme per day, shared by the daily email (teaser), Instagram (short hook)
 * and the members' Facebook group (full lesson summary). Pure and client-safe.
 * Topics come from Helix's own lessons (scripts/build_daily_topics.py), ordered Attract, then Convert, then Grow.
 * Day 1 of the first cycle is TOPIC_EPOCH; every topic is used once before the cycle starts again.
 */
import data from "./daily-topics.json";
import type { StageId } from "./stages";

export type DailyTopic = { n: number; ref: string; title: string; stage: StageId; why: string; steps: string[]; results: string[]; href: string; module: number };
export const TOPICS = data.topics as DailyTopic[];
export const TOPIC_EPOCH = "2026-10-27";
const STAGE_NAME: Record<StageId, string> = { attract: "Attract", convert: "Convert", grow: "Grow" };
const SITE = "https://ecommercehelix.com";

const dayNo = (d: string) => Math.floor(Date.parse(d + "T12:00:00Z") / 864e5);
/** Topic index for a date: walks the list in order, then starts the cycle again. */
export function topicIndex(date: string): number {
  const n = TOPICS.length;
  return (((dayNo(date) - dayNo(TOPIC_EPOCH)) % n) + n) % n;
}
export const topicFor = (date: string): DailyTopic => TOPICS[topicIndex(date)];
export const cycleDay = (date: string) => topicIndex(date) + 1;

const lower1 = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const firstSentence = (s: string) => s.match(/^(.+?[.!?])(\s|$)/)?.[1] ?? s;
const trim = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "...");
/** The one line to remember: the last sentence of "why this matters" (usually the point), kept short. */
export function takeaway(t: DailyTopic): string {
  const parts = t.why.split(/(?<=[.!?])\s+/);
  return trim(parts.length > 1 ? parts[parts.length - 1] : parts[0], 220);
}

/** Email teaser: a "today let's look at" line, the hook, one takeaway, and the link into the lesson. */
export function emailTopic(t: DailyTopic) {
  return {
    subject: trim(`Today: ${t.title}`, 70),
    intro: `Today let's look at ${lower1(t.title)} (${STAGE_NAME[t.stage]} stage).`,
    hook: trim(firstSentence(t.why), 240),
    takeaway: `Key takeaway: ${takeaway(t)}`,
    teaserStep: `First step: ${trim(t.steps[0], 180)}`,
    button: { label: trim(`Open today's lesson: ${t.title}`, 52), href: t.href },
  };
}

const HOOKS = [
  "{t}: most store owners get this wrong.", "Stop scrolling if your store needs this: {t}.", "The 10-minute fix nobody talks about: {t}.",
  "{t}. Small change, big difference.", "Quick question: have you sorted {t} yet?", "Save this for later: {t}.",
  "If sales feel stuck, start here: {t}.", "One lesson, one step, today: {t}.", "What the best stores do differently: {t}.",
];
/** Instagram: short, curiosity-led teaser with a hook and a call to action. */
export function instagramPost(t: DailyTopic): string {
  const tags = { attract: "#ecommercemarketing #facebookads #contentcreation", convert: "#shopifystore #conversionrate #ecommercetips", grow: "#ecommercegrowth #smallbusinessowner #profit" }[t.stage];
  return [
    HOOKS[(t.n - 1) % HOOKS.length].replace("{t}", t.title),
    trim(firstSentence(t.why), 160),
    `The fix starts with one step: ${lower1(trim(t.steps[0], 120))}`,
    `Want the rest? Full step-by-step lesson inside Helix. Link in bio.`,
    `${tags} #onlinestore #shopsmall`,
  ].join("\n\n");
}

/** Members' Facebook group: the full lesson summary, steps, what good looks like, and a discussion question. */
export function facebookGroupPost(t: DailyTopic, date: string): string {
  const steps = t.steps.map((s, i) => `${i + 1}. ${s}${t.results[i] ? `\n   What good looks like: ${t.results[i]}` : ""}`).join("\n");
  return [
    `Day ${cycleDay(date)} of ${TOPICS.length} · ${STAGE_NAME[t.stage]} · ${t.title}`,
    `Why it matters\n${t.why}`,
    `Step by step\n${steps}`,
    `Key takeaway\n${takeaway(t)}`,
    `Full lesson with tick-boxes: ${SITE}${t.href}`,
    `Discussion: have you tried this yet? Share what you did, your numbers before and after, or where you got stuck, and we'll help you with the next step.`,
  ].join("\n\n");
}
