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
