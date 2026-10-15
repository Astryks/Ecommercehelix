/** Achievements: small, honest milestones worked out from what the user has done. Pure, so it is easy to test. */
export type Achievement = { key: string; title: string; note: string; group: "profit" | "streak" | "habit" | "ads" | "learn" };

export type AchievementInputs = {
  /** Total real profit (contribution) since joining. */
  totalProfit: number;
  /** Best single day of real profit. */
  bestDayProfit: number;
  bestStreak: number;
  tasksDone: number;
  lessonsDone: number;
  daysWithNumbers: number;
  /** True once any real ad spend is recorded (typed in or synced). */
  firstAd: boolean;
  goalsDone: number;
};

const PROFIT_STEPS = [100, 1000, 5000, 10000, 50000, 100000];
const STREAK_STEPS = [3, 7, 30, 100];

export function achievementsFor(i: AchievementInputs): Achievement[] {
  const out: Achievement[] = [];
  for (const p of PROFIT_STEPS) if (i.totalProfit >= p) out.push({ key: `profit-${p}`, group: "profit", title: `$${p.toLocaleString("en-US")} profit`, note: "Money you kept, added up since you joined." });
  if (i.bestDayProfit >= 100) out.push({ key: "best-day-100", group: "profit", title: "A $100 profit day", note: "One day where you kept $100 or more." });
  for (const s of STREAK_STEPS) if (i.bestStreak >= s) out.push({ key: `streak-${s}`, group: "streak", title: `${s}-day streak`, note: `You did something for your store ${s} days in a row.` });
  if (i.tasksDone >= 1) out.push({ key: "first-task", group: "habit", title: "First task done", note: "The first small step." });
  if (i.tasksDone >= 25) out.push({ key: "tasks-25", group: "habit", title: "25 tasks done", note: "Small steps add up." });
  if (i.daysWithNumbers >= 7) out.push({ key: "numbers-7", group: "habit", title: "A week of numbers", note: "Seven days of sales and costs in Helix." });
  if (i.firstAd) out.push({ key: "first-ad", group: "ads", title: "First ad", note: "You ran your first ad and tracked what it cost." });
  if (i.lessonsDone >= 1) out.push({ key: "first-lesson", group: "learn", title: "First lesson", note: "You finished a lesson." });
  if (i.lessonsDone >= 10) out.push({ key: "lessons-10", group: "learn", title: "10 lessons", note: "You finished ten lessons." });
  if (i.goalsDone >= 1) out.push({ key: "first-goal", group: "habit", title: "First goal finished", note: "A whole goal in your course, done." });
  return out;
}

/** The newest achievement not shown yet, for the celebration toast. */
export function nextToCelebrate(all: Achievement[], seen: Set<string>): Achievement | null {
  return [...all].reverse().find((a) => !seen.has(a.key)) ?? null;
}
