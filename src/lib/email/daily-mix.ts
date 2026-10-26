/**
 * The daily email, different every day. Pure and seeded: the same user on the same date always gets the same email,
 * and each pool is walked through a per-user shuffle, so a user sees no repeat subject, opener or idea for at least 30 days.
 * What makes it personal (next lesson, goal, numbers) is loaded by daily-facts.ts and passed in; anything missing is skipped.
 * Ideas come from content Helix already has (the 30 sequence emails, site tips, glossary). No made-up numbers.
 */
import { GLOSSARY } from "../glossary";
import { TIPS } from "@/content/site-content";
import { SEQUENCE } from "./sequence";
import { emailTopic, topicForStage } from "../daily-topic";
import type { StageId } from "../stages";

export type DailyLesson = { title: string; step: string; href: string; minutes: number };
export type DailyGoal = { title: string; day: number; days: number };
/** Yesterday against the 7 days before it, from real (not example) scorecard days. */
export type DailyNumbers = { sales: number; orders: number; adSpend: number; merPct: number; avgSales: number | null; avgMerPct: number | null; target?: number | null };
/** `stage`: the stage of the user's next lesson in the guided path (null before Attract or when unknown). */
export type DailyFacts = { lesson: DailyLesson | null; goal: DailyGoal | null; numbers: DailyNumbers | null; hasAnyNumbers: boolean; hasAds: boolean | null; stage?: StageId | null };
export const NO_FACTS: DailyFacts = { lesson: null, goal: null, numbers: null, hasAnyNumbers: false, hasAds: null, stage: null };

/** What this user was already sent (oldest first), so nothing repeats: kept in ToolInput kind "email-history". */
export type SentDay = { date: string; subject: string; tasks: string[]; idea: string; topic: string };
export type DailyHistory = { days: SentDay[] };
export const HISTORY_KEEP = 90;
export type DailyInput = { seed: string; date: string; season?: string | null; facts?: DailyFacts; history?: DailyHistory };
export type DailyTask = { title: string; minutes: number };
export type DailyMix = {
  subject: string; preheader: string; title: string; opener: string;
  goalLine: string | null; numbersLine: string | null;
  tasks: DailyTask[]; minutes: number; idea: string;
  /** Today's topic (same for everyone, one per day from the topic calendar): intro, hook, takeaway, link. */
  topic: { intro: string; hook: string; takeaway: string; teaserStep: string; label: string; href: string };
  button: { label: string; href: string };
};

// ---------- seeded picking ----------

/** FNV-1a: a small stable string hash. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed || 1;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** A per-user shuffle of 0..n-1. */
function order(key: string, n: number): number[] {
  const r = rng(hash(key));
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Item `step` of this user's shuffle of the pool: consecutive steps never repeat until the pool is used up. */
export function pick<T>(pool: readonly T[], seed: string, salt: string, step: number): T {
  const n = pool.length;
  const o = order(`${seed}|${salt}`, n);
  const start = hash(`${salt}|${seed}`) % n;
  return pool[o[(((start + step) % n) + n) % n]];
}
export const dayNumber = (date: string) => Math.floor(Date.parse(date + "T12:00:00Z") / 864e5);

// ---------- content pools ----------

type ThemeId = "plan" | "ads" | "site" | "customers" | "cash" | "light";
const THEME_OF_DAY: ThemeId[] = ["light", "plan", "ads", "site", "customers", "cash", "light"]; // Sunday = 0
export const THEMES: Record<ThemeId, { name: string; focus: string; tasks: DailyTask[] }> = {
  plan: { name: "plan the week", focus: "your week plan", tasks: [
    { title: "Pick the one thing that matters most this week and write it down", minutes: 5 },
    { title: "Compare last week's sales and profit with the week before", minutes: 5 },
    { title: "Book 30 minutes in your calendar for your lesson this week", minutes: 3 },
    { title: "List three things you will not do this week, so the big one gets done", minutes: 5 },
    { title: "Check your monthly sales target: are you ahead or behind?", minutes: 5 },
    { title: "Look at last week's to-do list and move anything still open", minutes: 5 },
  ] },
  ads: { name: "ads check", focus: "your ads", tasks: [
    { title: "Compare yesterday's cost per sale with your break-even line", minutes: 10 },
    { title: "Pause the ad that spent the most this week with no sales", minutes: 5 },
    { title: "Watch the first 3 seconds of your best ad and write one new hook like it", minutes: 15 },
    { title: "Check how often the same people saw your ads this week (frequency)", minutes: 5 },
    { title: "Write down your MER for the last 7 days next to your target", minutes: 5 },
    { title: "Check your ad links open the right page and the price matches", minutes: 5 },
  ] },
  site: { name: "store page fix", focus: "your store pages", tasks: [
    { title: "Open your best product page on your phone: can you see the price and button without scrolling?", minutes: 5 },
    { title: "Read your best product page as a stranger and fix one confusing line", minutes: 10 },
    { title: "Add one real review or customer photo near the Add to cart button", minutes: 10 },
    { title: "Check shipping costs and returns are easy to find before checkout", minutes: 5 },
    { title: "Place a test order on your phone and note anything slow or confusing", minutes: 15 },
    { title: "Check how fast your home page loads on your phone", minutes: 5 },
  ] },
  customers: { name: "customers day", focus: "your customers", tasks: [
    { title: "Reply to every open customer message", minutes: 10 },
    { title: "Read your last 5 reviews and copy the best words customers use", minutes: 10 },
    { title: "Read your welcome email as if you just signed up, and fix one line", minutes: 5 },
    { title: "Send a short thank-you note to a repeat customer", minutes: 5 },
    { title: "Check how many people joined your email list this week", minutes: 5 },
    { title: "Check your abandoned cart email is on and reads well", minutes: 5 },
  ] },
  cash: { name: "stock and cash", focus: "stock and cash", tasks: [
    { title: "Check stock on your best seller: how many days will it last?", minutes: 5 },
    { title: "List the money going out of your bank this week and next", minutes: 10 },
    { title: "Pick one slow product and decide: bundle it, discount it or stop it", minutes: 10 },
    { title: "Confirm the date on any supplier order that is due", minutes: 5 },
    { title: "Put money aside for tax and bills from this week's sales", minutes: 5 },
    { title: "Check this week's refunds: is one product coming back more than others?", minutes: 5 },
  ] },
  light: { name: "light day", focus: "a light check-in", tasks: [
    { title: "Look at your week's numbers. No changes today, just notice", minutes: 5 },
    { title: "Look at a store you like and note one idea worth trying", minutes: 10 },
    { title: "Read today's idea below and jot down one thought", minutes: 3 },
    { title: "Tidy one thing: an old note, a weak product photo or a stuck task", minutes: 10 },
    { title: "Sketch one post or email for next week", minutes: 10 },
    { title: "Write down one question to look up in your lessons next week", minutes: 3 },
    { title: "Clear your inbox of anything a customer is waiting on", minutes: 10 },
    { title: "Take a real break. A rested head makes better choices on Monday", minutes: 1 },
  ] },
};
const NO_ADS_TASKS: DailyTask[] = [
  { title: "Post one helpful photo or short video about your product", minutes: 15 },
  { title: "Answer one common customer question in a short post", minutes: 10 },
  { title: "Ask one happy customer if you can share their photo", minutes: 5 },
  { title: "Write down where your last 10 customers found you", minutes: 10 },
  { title: "Reply to every comment on your last three posts", minutes: 10 },
];

const CHECKS_WITH_DATA = [
  "Check yesterday's numbers", "Look at yesterday's sales and profit", "Glance at yesterday's sales, ad spend and MER",
  "Check yesterday: did you keep money?", "Compare yesterday with your 7-day average", "Look at yesterday's orders and average order",
  "Check yesterday's ad spend against your sales", "Open Numbers and read yesterday's line",
];
const CHECKS_NO_DATA = [
  "Type in yesterday's sales and ad spend", "Add yesterday's numbers in Helix", "Put yesterday's sales into Numbers",
  "Add yesterday's orders and sales so Helix can show your profit",
];
export const WINS = [
  "Write down one win, however small", "Write down one thing that went well yesterday", "Note one customer message that made you smile",
  "Write down one thing you finished this week", "Note one number that moved the right way", "Write one sentence: what did you learn yesterday?",
  "Add one win to your wins file", "Write down one problem you solved recently", "Note one thing you are proud of in your store",
  "Write down one kind review or comment you got", "Note one thing you do better than last month", "Write down one decision you made and why",
  "Note one thing you stopped doing, and why that helps", "Write down one thing a customer loved", "Note one step today that future you will thank you for",
  "Write down the best part of this week so far", "Note one idea you want to try next week", "Write down one thing that was easier than you thought",
  "Note one person who helped you, and thank them", "Write down one record: best day, best ad or best email", "Note one thing you learned from a mistake",
];

/** {wd} weekday, {date} "Oct 27", {focus}, {Focus}, {n} steps, {min} minutes, {next} next lesson (short) or "one small step". */
export const SUBJECTS = [
  "{wd}: {focus} + 1 lesson step", "Your {wd} in Helix: {focus}", "{wd} plan: {focus}, then one lesson step", "Today ({date}): {focus}",
  "{n} small steps for {wd}", "{wd} morning: {n} steps, about {min} min", "One idea and {n} steps for {wd}", "{Focus} today, plus your next lesson",
  "Quick {wd} list: {focus}", "{date}: your {min}-minute Helix list", "Start {wd} with {focus}", "Good morning. {Focus} is up today",
  "{wd}'s lesson: {next}", "Your next step in Helix ({wd})", "{wd}: numbers, {focus}, one lesson", "A short list for {wd}, {date}",
  "{min} minutes to move your store forward", "Today: {focus} and one new idea", "{wd} check-in: {focus}", "What to do this {wd} morning",
  "Your {date} steps: {focus} first", "Small steps, {wd} edition", "{wd} to-do: {n} things, {min} min", "Here is your {wd} focus: {focus}",
  "Ready for {wd}? Start with {focus}", "{Focus}, one lesson step, one win", "Your Helix morning note for {wd}", "{wd}: one idea worth 2 minutes",
  "Keep going: {focus} on {wd}", "{date} in Helix: {focus}", "A calm {wd} list for your store", "{wd}: do these {n} things, then rest",
  "Today's focus: {focus}", "{n} steps to a good {wd}", "Fresh {wd} list: {focus} + an idea", "Your store, this {wd}: {focus}",
];
export const OPENERS = [
  "Here is your short list for {wd}. It takes about {min} minutes.", "Good morning. One small step today beats a big plan someday.",
  "Happy {wd}. Coffee first, then these {n} steps.", "Today is about {focus}. The rest can wait.",
  "A quick list for today. Do them in order and stop when they are done.", "Small steps add up. Here are today's.",
  "New day, new small step. Here is what matters this {wd}.", "You do not need a big day. You need a done day.",
  "Here is the plan for {wd}, {date}. Short and doable.", "Let's keep the habit going. {n} steps today.",
  "Today's theme is {focus}. Fifteen focused minutes is enough.", "Start with your numbers, then pick off the rest.",
  "Busy morning? Do the first step now and the rest after lunch.", "Here is what will move your store forward today.",
  "One idea, a few steps, one win. That is the whole plan for {wd}.", "No big decisions today. Just these {n} steps.",
  "Ready? It is {wd}, and the focus is {focus}.", "Quick one today. About {min} minutes, start to finish.",
  "Progress beats perfect. Here is today's progress list.", "Here are today's steps, picked for a {wd}.",
  "Open Helix, tick these off, get on with your day.", "A short, useful list. Skip nothing, rush nothing.",
  "Good {wd}. Your store will thank you for these {min} minutes.", "Today you do a little on {focus} and a little on your lesson.",
  "Fresh list, fresh start. Here we go.", "Good stores are built on steady, ordinary days. Here is today's.",
  "Let's make {wd} count. Small and steady.", "These steps are small on purpose. Do them, then look after yourself.",
  "Here is your next move, plus one idea to think about.", "Not every day needs a big push. Today is steady work on {focus}.",
  "Pick up where you left off. Here is the next bit.", "Same habit, new steps. Here is {wd}'s list.",
  "Morning. {Focus} first, then your lesson.", "Here is a {min}-minute list that keeps your store moving.",
];

// ---------- ideas: one a day, from content Helix already has ----------

export type Idea = { key: string; text: string };
/** Whole sentences up to about `max` characters, so a story stays a short read. */
const sentences = (t: string, max: number) => {
  let out = "";
  for (const p of t.split(/(?<=[.!?]["')]?)\s+/)) { if (out && out.length + 1 + p.length > max) break; out = out ? `${out} ${p}` : p; }
  return out;
};
const stories: Idea[] = SEQUENCE.map((s, i) => ({ key: `seq-${i}`, text: sentences(`${s.kind === "founder" ? "" : "Today's idea: "}${s.title}. ${s.paras.join(" ")}`, 340) }));
const tips: Idea[] = TIPS.map((t) => ({ key: `tip-${t.key}`, text: `Tip of the day: ${t.text}` }));
const words: Idea[] = GLOSSARY.map((t) => ({ key: `word-${t.term}`, text: `Word of the day: ${t.term}. ${t.means}` }));
/** Day by day: a story or lesson idea, then a tip, then a word, so each kind comes round every third day. */
export function ideaFor(seed: string, day: number): Idea {
  const k = ((day % 3) + 3) % 3;
  const step = Math.floor(day / 3);
  return k === 0 ? pick(stories, seed, "story", step) : k === 1 ? pick(tips, seed, "tip", step) : pick(words, seed, "word", step);
}

// ---------- compose ----------

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const trimTo = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "...");

export function numbersLine(x: DailyNumbers): string {
  const vs = x.avgSales && x.avgSales > 0 ? (() => {
    const pct = Math.round(((x.sales - x.avgSales) / x.avgSales) * 100);
    return pct === 0 ? ", right on your 7-day average" : `, ${pct > 0 ? "up" : "down"} ${Math.abs(pct)}% on your 7-day average of ${money(x.avgSales)}`;
  })() : "";
  const ads = x.adSpend > 0 ? ` You spent ${money(x.adSpend)} on ads (MER ${x.merPct.toFixed(0)}%${x.avgMerPct !== null && x.avgMerPct > 0 ? `, ${x.avgMerPct.toFixed(0)}% over the week` : ""}).` : "";
  const tgt = x.target && x.target > 0 ? ` Today's target: ${money(x.target)} in sales.` : "";
  return `Yesterday: ${money(x.sales)} in sales from ${x.orders} ${x.orders === 1 ? "order" : "orders"}${vs}.${ads}${tgt}`;
}

/** Step through a pool from `step` and return the first item `ok` accepts, or null when the whole pool is used. */
function pickFresh<T>(pool: readonly T[], seed: string, salt: string, step: number, ok: (x: T) => boolean): T | null {
  for (let k = 0; k < pool.length; k++) { const x = pick(pool, seed, salt, step + k); if (ok(x)) return x; }
  return null;
}

/**
 * The daily email, or null when there is nothing new to say (then nothing is sent, rather than a repeat).
 * With `history`: no subject, task, idea or topic that was already sent comes back; the next-lesson reminder
 * comes back at most once a week while it stays open.
 */
export function composeDaily(i: DailyInput & { history?: undefined }): DailyMix;
export function composeDaily(i: DailyInput): DailyMix | null;
export function composeDaily(i: DailyInput): DailyMix | null {
  const h = i.history?.days.filter((d) => d.date < i.date) ?? [];
  const sentSubjects = new Set(h.map((d) => d.subject));
  const sentTasks = new Set(h.flatMap((d) => d.tasks));
  const recentTasks = new Set(h.filter((d) => dayNumber(i.date) - dayNumber(d.date) < 7).flatMap((d) => d.tasks));
  const sentIdeas = new Set(h.map((d) => d.idea));
  const sentTopics = new Set(h.map((d) => d.topic));
  const f = i.facts ?? NO_FACTS;
  const day = dayNumber(i.date);
  const dow = new Date(i.date + "T12:00:00Z").getUTCDay();
  const themeId = THEME_OF_DAY[dow];
  const theme = THEMES[themeId];
  const week = Math.floor((day + 4) / 7); // changes every Monday
  const seed = i.seed;
  const newTask = (t: string) => !sentTasks.has(t);

  const themePool = themeId === "ads" && f.hasAds === false ? NO_ADS_TASKS : theme.tasks;
  const themeStep = themeId === "light" ? week * 2 + (dow === 0 ? 1 : 0) : week;
  const themeTask = pickFresh(themePool, seed, `theme-${themeId}-${f.hasAds === false ? "organic" : "ads"}`, themeStep, (t) => newTask(t.title));
  // Sale prep matters, but so does variety: on a busy season week it takes the theme slot every other day.
  const seasonTask = i.season && day % 2 === 0 && newTask(i.season) ? { title: i.season, minutes: 15 } : null;
  const middle = seasonTask ?? themeTask;
  const checkTitle = pickFresh(f.hasAnyNumbers ? CHECKS_WITH_DATA : CHECKS_NO_DATA, seed, f.hasAnyNumbers ? "check" : "check-new", day, newTask);
  const lessonTitle = f.lesson ? `Lesson step: ${trimTo(f.lesson.step.replace(/[.!]$/, ""), 110)} (${f.lesson.title})` : null;
  const lessonTask = lessonTitle && !recentTasks.has(lessonTitle) ? { title: lessonTitle, minutes: Math.max(3, Math.min(20, f.lesson!.minutes)) } : null;
  const winTitle = pickFresh(WINS, seed, "win", day, newTask);
  const tasks = [checkTitle ? { title: checkTitle, minutes: 2 } : null, middle, lessonTask, winTitle ? { title: winTitle, minutes: 2 } : null].filter((t): t is DailyTask => Boolean(t));
  const minutes = tasks.reduce((a, t) => a + t.minutes, 0);

  const wd = new Date(i.date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const date = new Date(i.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const next = f.lesson && f.lesson.title.length <= 36 ? f.lesson.title : "one small step";
  const fill = (t: string) => t.replace(/\{wd\}/g, wd).replace(/\{date\}/g, date).replace(/\{Focus\}/g, cap(theme.focus)).replace(/\{focus\}/g, theme.focus)
    .replace(/\{n\}/g, String(tasks.length)).replace(/\{min\}/g, String(minutes)).replace(/\{next\}/g, next);

  const t = emailTopic(topicForStage(i.date, f.stage ?? null));
  // Today's topic leads; the rotating story, tip or word stays as a short P.S. Step on past anything already sent.
  let idea: Idea | null = null;
  for (let k = 0; k < 300 && !idea; k += 3) { const x = ideaFor(seed, day + k); if (!sentIdeas.has(x.text)) idea = x; }
  const topicNew = !sentTopics.has(t.intro);
  // Nothing new to say: no new topic, no new idea and no new task. Send nothing rather than repeat.
  if (!topicNew && !idea && tasks.length === 0) return null;
  if (tasks.length === 0 && !topicNew) return null;
  // Subject: today's topic subject, unless it was used before; then a rotating subject that was never used.
  // Shapes rotate so the inbox does not read "Today: ..." every morning.
  const topicTitle = t.subject.replace(/^Today:\s*/, "");
  const shapes = [t.subject, `${wd}'s lesson idea: ${topicTitle}`, `${topicTitle}, plus ${tasks.length} quick ${tasks.length === 1 ? "step" : "steps"}`, `${wd}: ${topicTitle.charAt(0).toLowerCase()}${topicTitle.slice(1)}`].map((x) => trimTo(x, 70));
  const rotating = pickFresh(SUBJECTS.map(fill), seed, "subject", day, (x) => !sentSubjects.has(x));
  const first = day % 5 === 4 && rotating ? rotating : shapes[((day % 4) + 4) % 4];
  const subject = [first, ...shapes, rotating ?? ""].find((x) => x && !sentSubjects.has(x)) ?? `${wd} ${date}: ${t.intro}`;
  if (sentSubjects.has(subject)) return null;
  const pre = themeTask?.title ?? middle?.title ?? t.hook;
  return {
    subject,
    topic: { intro: t.intro, hook: t.hook, takeaway: t.takeaway, teaserStep: t.teaserStep, label: t.button.label, href: t.button.href },
    opener: fill(pick(OPENERS, seed, "opener", day)),
    preheader: trimTo(f.lesson ? `Next up: ${f.lesson.title}. ${pre}.` : `${pre}.`, 110),
    title: `${wd}: ${theme.name}`,
    goalLine: f.goal ? `You are working on: ${f.goal.title}${f.goal.days > 1 ? ` (day ${Math.min(f.goal.day, f.goal.days)} of ${f.goal.days})` : ""}.` : null,
    numbersLine: f.numbers ? numbersLine(f.numbers) : f.hasAnyNumbers ? "No numbers for yesterday yet. Add them in Numbers, it takes 2 minutes." : null,
    tasks, minutes, idea: idea?.text ?? "",
    button: f.lesson ? { label: trimTo(`Next lesson: ${f.lesson.title}`, 52), href: f.lesson.href } : { label: "Open Today", href: "/dashboard" },
  };
}

/** Add a sent email to the history (keeps the last HISTORY_KEEP days). */
export function recordSent(h: DailyHistory, date: string, m: DailyMix): DailyHistory {
  const days = [...h.days.filter((d) => d.date !== date), { date, subject: m.subject, tasks: m.tasks.map((t) => t.title), idea: m.idea, topic: m.topic.intro }];
  return { days: days.sort((a, b) => a.date.localeCompare(b.date)).slice(-HISTORY_KEEP) };
}
