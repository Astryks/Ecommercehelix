/**
 * Which curriculum day to show. Pure, so it is easy to test.
 *
 * Rules:
 * - The next lesson is always the lowest-numbered day that is not done.
 *   Days finished early (for example Day 2 via the quick update form) stay done
 *   but never push the next lesson past an unfinished earlier day.
 * - "Today's lesson is done" only shows when the user finished a day today
 *   that sits below the next lesson (so the banner and the roadmap agree).
 */
export type DayStatus = "done" | "locked" | "today" | "tomorrow" | "next";

export function dayProgress<D extends { day: number; stage: number }>(opts: {
  days: D[];
  doneIds: Set<string>;
  completedToday: string[];
  ahead: boolean;
  unlocked: (stage: number) => boolean;
  taskId: (day: number) => string;
}) {
  const { days, doneIds, completedToday, ahead, unlocked, taskId } = opts;
  const sorted = [...days].sort((a, b) => a.day - b.day);
  const nextDay = sorted.find((d) => !doneIds.has(taskId(d.day)));
  const finishedTodayDays = completedToday
    .map((id) => /^day-(\d+)$/.exec(id))
    .filter((m): m is RegExpExecArray => Boolean(m))
    .map((m) => Number(m[1]));
  const lessonDoneToday = finishedTodayDays.some((n) => !nextDay || n < nextDay.day);
  const current = lessonDoneToday && !ahead ? undefined : nextDay;
  const status = (d: D): DayStatus => {
    if (doneIds.has(taskId(d.day))) return "done";
    if (!unlocked(d.stage)) return "locked";
    if (d.day === nextDay?.day) return current ? "today" : "tomorrow";
    return "next";
  };
  return { nextDay, current, lessonDoneToday, status };
}
