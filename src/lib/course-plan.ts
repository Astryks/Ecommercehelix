/**
 * The Helix Course: one clear goal at a time, each split into short days of
 * tasks. Goals follow the profit-first ladder (numbers first, then Attract,
 * Convert, Grow, then running the business and the team). Tasks are built
 * from the steps of existing lessons, so the course reuses the playbook rather
 * than repeating it. Pure and client-safe so it can be unit tested.
 */
export type CourseTrack = "starting" | "growing" | "scaling";
export type Phase = "numbers" | "attract" | "convert" | "grow" | "run";

export const COURSE_TRACKS: { id: CourseTrack; name: string; band: string; who: string }[] = [
  { id: "starting", name: "Just starting", band: "$0 to $10k a month", who: "Launching, or a few sales a week." },
  { id: "growing", name: "Growing", band: "$10k to $30k a month", who: "Regular sales, ready for more profit." },
  { id: "scaling", name: "Scaling", band: "$30k to $80k+ a month", who: "A real business that needs systems and a team." },
];
export const toCourseTrack = (v: unknown): CourseTrack => (v === "starting" || v === "scaling" ? v : "growing");

export const PHASES: Record<Phase, { name: string; blurb: string }> = {
  numbers: { name: "Your numbers", blurb: "Know what you really make before spending more." },
  attract: { name: "Attract", blurb: "Get the right people to your store." },
  convert: { name: "Convert", blurb: "Turn more visits into orders." },
  grow: { name: "Grow", blurb: "Keep more of every sale and bring buyers back." },
  run: { name: "Run the business", blurb: "Plans, rhythms, playbooks and a team." },
};

/** Numbers the finish line can be checked against (real days only, never example data). */
export type FinishCtx = {
  realDays7: number;
  realDays30: number;
  sessionsPerDay7: number;
  atcPct7: number | null;
  crPct7: number;
  aov7: number;
  marginPct30: number;
  revenue30: number;
  revenuePrev30: number;
  returningPct30: number;
  merPct30: number;
  targetMerPct: number;
  costsEntered: boolean;
  profitSetup: boolean;
  baselineAov: number;
};

export type Finish =
  | { kind: "metric"; label: string; unit: "count" | "pct" | "money" | "days"; target: number | ((c: FinishCtx) => number); value: (c: FinishCtx) => number | null; extra?: (c: FinishCtx) => boolean; minDays: number }
  | { kind: "self"; label: string };

export type GoalDef = {
  id: string;
  title: string;
  finishLine: string;
  why: string;
  phase: Phase;
  tracks: CourseTrack[];
  lessons: string[];
  finish: Finish;
  /** Days pattern: how many tasks on each day (1 = light, 5 = busy). */
  rhythm?: number[];
};

const ALL: CourseTrack[] = ["starting", "growing", "scaling"];
const GS: CourseTrack[] = ["growing", "scaling"];

export const GOALS: GoalDef[] = [
  // ---- Your numbers ----
  {
    id: "profit-dashboard", phase: "numbers", tracks: ALL,
    title: "Set up your profit dashboard",
    finishLine: "Your price, product, freight, packaging, shipping, fees, subscriptions and marketing costs are saved in Profit setup.",
    why: "Sales feel good, but profit is what you keep. Five minutes entering your costs shows what one order and one month really leave you, and every other screen in Helix uses it.",
    lessons: ["1.7", "1.8", "1.2"],
    finish: { kind: "metric", label: "Profit setup saved", unit: "count", target: 1, value: (c) => (c.profitSetup ? 1 : 0), minDays: 0 },
    rhythm: [2, 3, 3],
  },
  {
    id: "daily-numbers", phase: "numbers", tracks: ALL,
    title: "Fill in your numbers 7 days in a row",
    finishLine: "7 of the last 7 days are filled in with your real numbers.",
    why: "A daily 2-minute check catches a bad ad or a cost blow-out in one day instead of one month.",
    lessons: ["1.3", "1.6", "1.10"],
    finish: { kind: "metric", label: "Days filled in (last 7)", unit: "days", target: 7, value: (c) => c.realDays7, minDays: 0 },
    rhythm: [2, 2, 1, 1, 1, 1, 1, 1],
  },
  {
    id: "key-numbers", phase: "numbers", tracks: ALL,
    title: "Learn the numbers that run your store",
    finishLine: "You know your break-even MER, your target MER and your monthly sales and profit goals, and they are saved in Helix.",
    why: "A handful of numbers tell you whether to push, hold or fix. Knowing your limits before you spend more on growth keeps every next goal profitable.",
    lessons: ["1.1", "1.4", "1.5", "1.9"],
    finish: { kind: "self", label: "Break-even, target MER and monthly goals saved" },
  },
  {
    id: "store-ready", phase: "numbers", tracks: ["starting"],
    title: "Get your store ready to take orders",
    finishLine: "A real test order goes through checkout and lands in your inbox.",
    why: "Every visitor you pay for is wasted if the store is slow, unclear or cannot take a payment.",
    lessons: ["22.1", "22.3", "22.5", "22.9", "22.11", "22.12", "22.16"],
    finish: { kind: "self", label: "Test order placed and received" },
  },
  // ---- Attract ----
  {
    id: "first-100-visits", phase: "attract", tracks: ["starting"],
    title: "Get your first 100 site visits a day",
    finishLine: "An average of 100 sessions a day over the last 7 days.",
    why: "You need steady visitors before you can learn what makes people buy.",
    lessons: ["7.14", "7.1", "7.13", "4.2", "21.2", "29.3", "6.1", "6.2"],
    finish: { kind: "metric", label: "Sessions a day (7-day average)", unit: "count", target: 100, value: (c) => c.sessionsPerDay7, minDays: 5 },
  },
  {
    id: "1000-visits", phase: "attract", tracks: GS,
    title: "Get 1,000 site visits a day while ads stay profitable",
    finishLine: "1,000 sessions a day on average over 7 days, with ad spend at or under your target MER.",
    why: "More of the right visitors is the fastest lever, but only if each sale still makes money.",
    lessons: ["8.13", "8.12", "7.14", "7.13", "5.1", "5.7", "6.3", "6.12", "7.6", "19.12"],
    finish: { kind: "metric", label: "Sessions a day (7-day average)", unit: "count", target: 1000, value: (c) => c.sessionsPerDay7, extra: (c) => c.merPct30 <= c.targetMerPct, minDays: 5 },
  },
  {
    id: "email-list", phase: "attract", tracks: ALL,
    title: "Add 500 people to your email list",
    finishLine: "500 new subscribers since you started this goal (check your email tool).",
    why: "Your list is the one audience you own. Every subscriber can buy again without paying for another ad.",
    lessons: ["10.1", "11.1", "11.3", "11.4"],
    finish: { kind: "self", label: "500 new subscribers" },
  },
  {
    id: "referrals", phase: "attract", tracks: ALL,
    title: "Get your first 10 orders from referrals and partners",
    finishLine: "10 orders came through a referral link, partner code or guest feature.",
    why: "A friend's word or a trusted brand's mention often wins customers for far less than an ad costs.",
    lessons: ["29.4", "29.5", "29.6"],
    finish: { kind: "self", label: "10 referral or partner orders" },
  },
  // ---- Convert ----
  {
    id: "add-to-cart-8", phase: "convert", tracks: ALL,
    title: "Get add-to-cart above 8%",
    finishLine: "8% or more of sessions add something to the cart, over 7 days.",
    why: "If people do not add to cart, the product page is not convincing them. Fixing it lifts every channel at once.",
    lessons: ["29.1", "3.2", "9.1", "9.2", "9.5"],
    finish: { kind: "metric", label: "Add-to-cart rate (7 days)", unit: "pct", target: 8, value: (c) => c.atcPct7, minDays: 5 },
  },
  {
    id: "conversion-2-5", phase: "convert", tracks: ALL,
    title: "Get your conversion rate to 2.5%",
    finishLine: "2.5% or more of sessions become an order, over 7 days.",
    why: "Going from 1.5% to 2.5% conversion brings about two thirds more sales from the same ad spend.",
    lessons: ["3.3", "3.5", "9.4", "22.12", "9.8", "9.16"],
    finish: { kind: "metric", label: "Conversion rate (7 days)", unit: "pct", target: 2.5, value: (c) => c.crPct7, minDays: 5 },
  },
  {
    id: "email-flows", phase: "convert", tracks: ALL,
    title: "Switch on the five core email flows",
    finishLine: "Welcome, browse abandonment, cart abandonment, checkout abandonment and post-purchase flows are all live.",
    why: "Flows sell while you sleep. Each one reaches a shopper at the moment they are most likely to buy.",
    lessons: ["10.2", "10.3", "29.8", "29.7"],
    finish: { kind: "self", label: "Five flows live" },
  },
  {
    id: "aov-plus-10", phase: "convert", tracks: GS,
    title: "Raise your average order by 10%",
    finishLine: "Average order value is 10% higher than when you started this goal, over 7 days.",
    why: "A bigger order pays for the same ad click, so profit per order rises with no extra traffic.",
    lessons: ["9.10", "3.6", "9.12"],
    finish: { kind: "metric", label: "Average order value (7 days)", unit: "money", target: (c) => Math.round(c.baselineAov * 1.1 * 100) / 100, value: (c) => c.aov7, minDays: 5 },
  },
  // ---- Grow ----
  {
    id: "first-10k-month", phase: "grow", tracks: ["starting"],
    title: "Reach $10k a month in sales",
    finishLine: "$10,000 or more in sales over the last 30 days.",
    why: "At $10k a month you have proof people want what you sell, and enough data to grow on purpose.",
    lessons: ["6.14", "13.1", "6.6", "3.8"],
    finish: { kind: "metric", label: "Sales, last 30 days", unit: "money", target: 10_000, value: (c) => c.revenue30, minDays: 20 },
  },
  {
    id: "margin-10", phase: "grow", tracks: GS,
    title: "Get net profit margin to 10%",
    finishLine: "Net profit is 10% or more of sales over the last 30 days.",
    why: "Ten cents of every dollar kept is what lets you survive a bad month and fund the next stage.",
    lessons: ["2.1", "2.3", "2.4", "2.5", "13.12"],
    finish: { kind: "metric", label: "Net profit margin (30 days)", unit: "pct", target: 10, value: (c) => c.marginPct30, minDays: 20 },
  },
  {
    id: "returning-25", phase: "grow", tracks: GS,
    title: "Get 25% of sales from returning customers",
    finishLine: "A quarter of sales over 30 days come from people who bought before.",
    why: "You already paid to find returning customers, so their repeat orders are often your most profitable sales.",
    lessons: ["10.4", "10.12", "4.7", "3.10", "23.7"],
    finish: { kind: "metric", label: "Returning customer share (30 days)", unit: "pct", target: 25, value: (c) => c.returningPct30, minDays: 20 },
  },
  {
    id: "100k-month", phase: "grow", tracks: ["growing"],
    title: "Reach a $1M-a-year pace with at least 10% profit",
    finishLine: "$84,000 in sales over 30 days (about $1M a year) and a net margin of 10% or more.",
    why: "This is the jump from a busy shop to a real business that can pay a team and its owner.",
    lessons: ["2.7", "7.10", "8.6", "15.1", "28.9"],
    finish: { kind: "metric", label: "Sales, last 30 days", unit: "money", target: 84_000, value: (c) => c.revenue30, extra: (c) => c.marginPct30 >= 10, minDays: 20 },
  },
  {
    id: "scale-20", phase: "grow", tracks: ["scaling"],
    title: "Grow sales 20% month on month while ads stay profitable",
    finishLine: "Sales over the last 30 days are 20% higher than the 30 days before, with MER at or under target.",
    why: "Scaling only counts if profit scales with it. This proves you can add spend without losing money.",
    lessons: ["2.7", "7.10", "15.2", "15.6"],
    finish: { kind: "metric", label: "Sales growth vs previous 30 days", unit: "pct", target: 20, value: (c) => (c.revenuePrev30 ? ((c.revenue30 - c.revenuePrev30) / c.revenuePrev30) * 100 : null), extra: (c) => c.merPct30 <= c.targetMerPct, minDays: 25 },
  },
  // ---- Run the business ----
  {
    id: "90-day-plan", phase: "run", tracks: ALL,
    title: "Set your 90-day plan",
    finishLine: "One goal, three monthly checkpoints and up to three projects, written on one page.",
    why: "A clear plan stops you chasing every idea, so the next 90 days add up to real progress.",
    lessons: ["29.15", "29.13", "29.9"],
    finish: { kind: "self", label: "Plan written and saved" },
    rhythm: [2, 3, 3, 2],
  },
  {
    id: "weekly-meeting", phase: "run", tracks: ALL,
    title: "Run a weekly numbers meeting",
    finishLine: "Four weekly meetings held, each ending with one fix and an owner.",
    why: "Checking in every week gives you 52 chances a year to fix problems early.",
    lessons: ["29.10", "20.10", "29.12", "29.14"],
    finish: { kind: "self", label: "Four meetings held" },
  },
  {
    id: "playbooks", phase: "run", tracks: GS,
    title: "Write playbooks for your three most repeated tasks",
    finishLine: "Three playbooks exist and someone else has followed each one without help.",
    why: "Work that lives in your head only happens when you do it. Playbooks set you free.",
    lessons: ["29.11", "28.2"],
    finish: { kind: "self", label: "Three playbooks tested" },
  },
  {
    id: "hand-off-10h", phase: "run", tracks: GS,
    title: "Free up your first 10 hours a week",
    finishLine: "Someone else now does at least 10 hours a week of work you used to do.",
    why: "Your time is the business's scarcest resource. Freeing it is how you work on growth, not just in it.",
    lessons: ["28.1", "16.4", "28.6", "29.16"],
    finish: { kind: "self", label: "10 hours a week freed up" },
  },
];

/** Which plan a goal needs. The numbers goals are free; growth goals need a paid plan. */
export type GoalTier = "free" | "starter" | "growth";
export const goalTier = (g: Pick<GoalDef, "phase">): GoalTier => (g.phase === "numbers" ? "free" : g.phase === "grow" || g.phase === "run" ? "growth" : "starter");

/** Old goal ids that were renamed, so saved progress carries over. */
export const GOAL_ALIASES: Record<string, string> = { "true-profit": "profit-dashboard" };
export const canonicalGoalId = (id: string) => GOAL_ALIASES[id] ?? id;

export const goalsFor = (track: CourseTrack) => GOALS.filter((g) => g.tracks.includes(track));

// ---------- days and tasks ----------

export type LessonStepRef = { n: number; instruction: string; expected: string; action: string | null };
export type LessonInfo = { ref: string; title: string; href: string; steps: LessonStepRef[] };
export type Lookup = (ref: string) => LessonInfo | null;

export type CourseTask = {
  id: string;
  title: string;
  expected: string;
  minutes: number;
  lessonRef: string;
  lessonTitle: string;
  step: number;
  href: string;
  action: string | null;
};
export type CourseDay = { n: number; tasks: CourseTask[] };

const DEFAULT_RHYTHM = [1, 3, 4, 2, 5, 3, 4, 2, 3, 4, 2, 3];

/** Rough time for one step from what it asks. */
export function estimateMinutes(instruction: string): number {
  const s = instruction.toLowerCase();
  if (/\b(for two weeks|each month|every week|after four weeks|each quarter|on a hard day|when featured)\b/.test(s)) return 5;
  if (/\b(record|write|rewrite|draft|build|install|set up|create|shoot|film|list \d|send)\b/.test(s)) return /\b(\d{2,} |ten|five|three)\b/.test(s) ? 20 : 15;
  if (/\b(check|open|pick|choose|book|turn on|confirm|read)\b/.test(s)) return 5;
  return 10;
}

const firstSentence = (s: string) => {
  const t = s.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();
  const m = t.match(/^(.{20,180}?[.!?])(\s|$)/);
  return m ? m[1] : t.length > 180 ? t.slice(0, 177).replace(/\s\S*$/, "") + "..." : t;
};

export const courseTaskId = (goalId: string, ref: string, n: number) => `course-${goalId}-${ref.replace(".", "-")}-s${n}`;
export const COURSE_TASK_ID = /^course-[a-z0-9-]+-\d{1,2}-\d{1,2}-s\d{1,2}$/;

/** Split a goal's lesson steps into days, following its rhythm (1 to 5 tasks a day). */
export function buildDays(goal: GoalDef, lookup: Lookup): CourseDay[] {
  const tasks: CourseTask[] = [];
  for (const ref of goal.lessons) {
    const l = lookup(ref);
    if (!l) continue;
    for (const s of l.steps) {
      tasks.push({
        id: courseTaskId(goal.id, ref, s.n),
        title: firstSentence(s.instruction),
        expected: firstSentence(s.expected),
        minutes: estimateMinutes(s.instruction),
        lessonRef: ref,
        lessonTitle: l.title,
        step: s.n,
        href: l.href,
        action: s.action,
      });
    }
  }
  const rhythm = goal.rhythm ?? DEFAULT_RHYTHM;
  const days: CourseDay[] = [];
  let i = 0;
  while (i < tasks.length) {
    let size = Math.min(5, Math.max(1, rhythm[days.length % rhythm.length]));
    // Keep a day inside one lesson where the next lesson is about to start, so days read as one job.
    const day = tasks.slice(i, i + size);
    const nextRefStart = day.findIndex((t, k) => k > 0 && t.lessonRef !== day[k - 1].lessonRef);
    if (nextRefStart > 0 && size - nextRefStart <= 1 && tasks.length - i > size) size = nextRefStart;
    days.push({ n: days.length + 1, tasks: tasks.slice(i, i + size) });
    i += size;
  }
  return days;
}

// ---------- progress ----------

export type CourseState = { track: CourseTrack; goalId: string; doneGoals: string[]; confirmed: string[]; baselineAov: number; celebrate: string | null };

export type FinishStatus = { met: boolean; value: number | null; target: number; pct: number; enoughData: boolean; canSelfConfirm: boolean; label: string; unit: string };

export function finishStatus(goal: GoalDef, c: FinishCtx, daysDone: number, totalDays: number, confirmed: boolean): FinishStatus {
  const f = goal.finish;
  if (f.kind === "self") {
    const pct = totalDays ? Math.round((Math.min(daysDone, totalDays) / totalDays) * (confirmed ? 100 : 90)) : 0;
    return { met: confirmed, value: daysDone, target: totalDays, pct: confirmed ? 100 : pct, enoughData: true, canSelfConfirm: daysDone >= totalDays, label: f.label, unit: "days" };
  }
  const target = typeof f.target === "function" ? f.target(c) : f.target;
  const value = f.value(c);
  const enoughData = c.realDays30 >= f.minDays && value !== null;
  const metNumbers = enoughData && value !== null && value >= target && (f.extra ? f.extra(c) : true);
  const pct = value === null || !target ? 0 : Math.max(0, Math.min(100, Math.round((value / target) * 100)));
  return { met: metNumbers || confirmed, value, target, pct: metNumbers || confirmed ? 100 : Math.min(pct, 99), enoughData, canSelfConfirm: !enoughData && daysDone >= totalDays, label: f.label, unit: f.unit };
}

/** Which day the user is on: the first day with an undone task (or the last day when all are done). */
export function currentDay(days: CourseDay[], done: Set<string>): { n: number; allDone: boolean } {
  const idx = days.findIndex((d) => d.tasks.some((t) => !done.has(t.id)));
  return idx === -1 ? { n: days.length, allDone: true } : { n: idx + 1, allDone: false };
}

export const dayDone = (d: CourseDay, done: Set<string>) => d.tasks.every((t) => done.has(t.id));

/** Move to the next goal once the current one's finish line is met. */
export function nextGoalId(track: CourseTrack, doneGoals: string[]): string | null {
  return goalsFor(track).find((g) => !doneGoals.includes(g.id))?.id ?? null;
}

export function fmtFinish(unit: string, n: number | null): string {
  if (n === null) return "No data yet";
  if (unit === "pct") return `${n.toFixed(1)}%`;
  if (unit === "money") return "$" + Math.round(n).toLocaleString("en-AU");
  if (unit === "days") return `${Math.round(n)}`;
  return Math.round(n).toLocaleString("en-AU");
}

// ---------- dated tasks (seasonal calendar and tax dates) ----------

export type DatedTask = { id: string; title: string; due: string; why: string; href: string; minutes: number; kind: "season" | "admin" };

/**
 * Today's list: the day's tasks, plus up to two dated tasks (sale prep, tax dates)
 * that are due within the next week, so the calendar slots in without crowding the day.
 */
export function slotDated(dayTasks: CourseTask[], dated: DatedTask[], today: string, done: Set<string>, max = 5): DatedTask[] {
  const room = Math.max(1, Math.min(2, max - dayTasks.filter((t) => !done.has(t.id)).length));
  const soon = (d: DatedTask) => Date.parse(d.due) - Date.parse(today) <= 7 * 86_400_000;
  return dated.filter((d) => !done.has(d.id) && soon(d)).sort((a, b) => a.due.localeCompare(b.due)).slice(0, room);
}
