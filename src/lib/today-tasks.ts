/** "Here's what to do today": pick 1 to 3 calm tasks from what Helix already knows. Pure, so it is easy to test. */
export type TodayTask = {
  id: string;
  title: string;
  why: string;
  minutes: number;
  guideHref: string;
  /** Task id for Done and Do it for me. */
  taskId: string;
  kind: "season" | "day" | "insight" | "numbers";
};

export type TodayInputs = {
  numbersMissingYesterday: boolean;
  today: string;
  season: TodayTask[];
  day: TodayTask | null;
  insight: TodayTask | null;
  done: Set<string>;
};

export function pickTodayTasks(i: TodayInputs, max = 3): TodayTask[] {
  const out: TodayTask[] = [];
  const add = (t: TodayTask | null | undefined) => {
    if (t && !i.done.has(t.taskId) && !out.some((o) => o.taskId === t.taskId) && out.length < max) out.push(t);
  };
  // Order: one seasonal step when an event is close, then the plan's day, then one fix, then numbers.
  add(i.season[0]);
  add(i.day);
  add(i.insight);
  if (i.numbersMissingYesterday)
    add({ id: "numbers", title: "Add yesterday's numbers", why: "Your profit only shows when Helix knows yesterday's sales and costs.", minutes: 2, guideHref: "/dashboard/numbers", taskId: `numbers-${i.today}`, kind: "numbers" });
  return out;
}

// ---------- Today in time blocks ----------
export type BlockId = "morning" | "main" | "finish";
export type PlannedTask = TodayTask & { done: boolean; tag?: string; lessonHref: string; lessonLabel: string };
export type TodayBlock = { id: BlockId; title: string; minutes: number; tasks: PlannedTask[] };
export type TodayPlan = { blocks: TodayBlock[]; done: number; total: number; pct: number };

export const ROUTINE_TASK_ID = /^routine-[a-z]+-\d{4}-\d{2}-\d{2}$/;

/**
 * Today's list in three blocks, most important first, 5 to 7 tasks in total.
 * Morning check: quick looks (numbers, ads). Main focus: one seasonal step (tagged), the plan's lesson, one fix.
 * Before you finish: write one win, glance at tomorrow. Done tasks stay on the list with a tick so the bar can fill.
 */
export function planToday(i: TodayInputs & { hasAds?: boolean; seasonTag?: string; tip?: { text: string; href: string; label: string } }, max = 7): TodayPlan {
  const d = i.today;
  const r = (key: string, t: Omit<PlannedTask, "id" | "taskId" | "done" | "kind"> & { kind?: TodayTask["kind"] }): PlannedTask => {
    const taskId = key === "numbers" ? `numbers-${d}` : `routine-${key}-${d}`;
    return { id: taskId, taskId, kind: t.kind ?? "numbers", done: i.done.has(taskId), ...t };
  };
  const morning: PlannedTask[] = [
    r("numbers", { title: i.numbersMissingYesterday ? "Add yesterday's numbers" : "Check yesterday's numbers", why: "Profit only shows when Helix knows yesterday's sales and costs.", minutes: 2, guideHref: "/dashboard/numbers", lessonHref: "/dashboard/numbers/table", lessonLabel: "Open the daily table" }),
  ];
  if (i.hasAds) morning.push(r("ads", { title: "Look at ad spend", why: "Catch an ad that costs more than it earns before it eats today's profit.", minutes: 3, guideHref: "/dashboard/campaigns", lessonHref: "/dashboard/campaigns", lessonLabel: "Your ads" }));
  const main: PlannedTask[] = [];
  const pushMain = (t: TodayTask | null | undefined, tag?: string) => {
    if (t && !main.some((m) => m.taskId === t.taskId)) main.push({ ...t, done: i.done.has(t.taskId), tag, lessonHref: t.guideHref, lessonLabel: t.kind === "season" ? "Season lesson" : "Lesson" });
  };
  pushMain(i.season[0], i.seasonTag ?? "Season");
  pushMain(i.day);
  pushMain(i.insight);
  // No sale date on? The weekly tip from the site content engine fills the gap.
  if (!i.season.length && i.tip) {
    const tid = `routine-tip-${d}`;
    main.push({ id: tid, taskId: tid, kind: "numbers", title: i.tip.text, why: "This week's tip. One small change can help your store.", minutes: 10, guideHref: i.tip.href, lessonHref: i.tip.href, lessonLabel: i.tip.label, done: i.done.has(tid), tag: "Tip of the week" });
  }
  const finish: PlannedTask[] = [
    r("win", { title: "Write down one win", why: "Small wins keep you going. Share it on the wins wall if you like.", minutes: 2, guideHref: "/dashboard/community", lessonHref: "/dashboard/progress", lessonLabel: "Your progress" }),
    r("tomorrow", { title: "Peek at tomorrow", why: "Knowing the next step makes tomorrow quicker to start.", minutes: 1, guideHref: "/dashboard/plan", lessonHref: "/dashboard/learn", lessonLabel: "Learn" }),
  ];
  // Keep it short: trim the main block first from the end, never below one task.
  while (morning.length + main.length + finish.length > max && main.length > 1) main.pop();
  const blocks: TodayBlock[] = [
    { id: "morning", title: "Morning check", minutes: morning.reduce((a, t) => a + t.minutes, 0), tasks: morning },
    { id: "main", title: "Main focus", minutes: main.reduce((a, t) => a + t.minutes, 0), tasks: main },
    { id: "finish", title: "Before you finish", minutes: finish.reduce((a, t) => a + t.minutes, 0), tasks: finish },
  ].filter((b) => b.tasks.length) as TodayBlock[];
  const all = blocks.flatMap((b) => b.tasks);
  const done = all.filter((t) => t.done).length;
  return { blocks, done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
}
