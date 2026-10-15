import "server-only";
import { getCompletions, getHistory, getRawDays, getSettings } from "./repo";
import { derive } from "./scorecard";
import { bestStreak } from "./history";
import { achievementsFor, type Achievement } from "./achievements";

export async function achievementsForUser(userId: string): Promise<Achievement[]> {
  const [raw, settings, comps, h] = await Promise.all([getRawDays(userId), getSettings(userId), getCompletions(userId), getHistory(userId, null)]);
  const real = raw.filter((d) => !d.example);
  const profits = real.map((d) => derive(d, settings, 1).contribution);
  return achievementsFor({
    totalProfit: profits.reduce((a, b) => a + b, 0),
    bestDayProfit: Math.max(0, ...profits),
    bestStreak: bestStreak(comps.map((c) => c.completedOn)),
    tasksDone: comps.length,
    lessonsDone: comps.filter((c) => /^lesson-\d+-\d+$/.test(c.taskId)).length,
    daysWithNumbers: real.filter((d) => d.revenue > 0 || d.orders > 0).length,
    firstAd: real.some((d) => d.adMeta + d.adGoogle + d.adTiktok + d.adOther > 0),
    goalsDone: h.events.filter((e) => e.kind === "goal_done").length,
  });
}
