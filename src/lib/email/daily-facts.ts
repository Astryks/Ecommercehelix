import "server-only";
import { getCourse } from "../course";
import { metricsFor } from "../analytics";
import { derive } from "../scorecard";
import { addDays } from "../dates";
import { getRawDays, getSettings } from "../repo";
import { NO_FACTS, type DailyFacts } from "./daily-mix";
import { questForUser } from "../quest-server";
import { PATH } from "../learn-path";
import { journeyPosition } from "../journey-server";
import { MILESTONES } from "../journey";
import { targetFor, toScoreDay } from "../scoreboard/core";
import { getScoreboardInput } from "../scoreboard/server";

/**
 * What makes one user's daily email personal: the next lesson step and goal from the course (same logic as Today),
 * and yesterday's numbers against the week before from real scorecard days. Anything missing is left out, never guessed.
 */
export async function dailyFacts(userId: string, date: string): Promise<DailyFacts> {
  const [course, raw, settings] = await Promise.all([getCourse(userId, date).catch(() => null), getRawDays(userId).catch(() => []), getSettings(userId).catch(() => null)]);
  const out: DailyFacts = { ...NO_FACTS };
  // Stage of the next lesson in the guided path, so the daily topic can match where the user is.
  try {
    const { quest } = await questForUser(userId);
    const step = quest.next ? PATH.find((p) => p.id === quest.next!.stepId) : undefined;
    out.stage = step && step.stage !== "start" ? step.stage : quest.next ? null : "grow";
  } catch { out.stage = null; }

  // Road to $100M: one line with the level (only when known).
  try {
    const { pos } = await journeyPosition(userId);
    if (pos.level) out.road = { title: MILESTONES[pos.level - 1].title, next: MILESTONES[pos.level]?.title ?? null };
  } catch { out.road = null; }

  const cur = course?.current;
  if (cur) {
    out.goal = { title: cur.goal.title, day: cur.day, days: cur.days.length };
    if (!cur.needs) {
      const next = cur.days.slice(Math.max(0, cur.day - 1)).flatMap((d) => d.tasks).find((t) => !course!.done.has(t.id));
      if (next) out.lesson = { title: next.lessonTitle, step: next.title, href: next.href, minutes: next.minutes };
    }
  }

  const real = raw.filter((d) => !d.example);
  if (real.length && settings) {
    out.hasAnyNumbers = true;
    const y = addDays(date, -1);
    const recent = real.filter((d) => d.date >= addDays(y, -13) && d.date <= y);
    out.hasAds = recent.length ? recent.some((d) => d.adMeta + d.adGoogle + d.adTiktok + d.adOther > 0) : null;
    const row = real.find((d) => d.date === y);
    if (row) {
      const x = derive(row, settings);
      const wk = metricsFor(real, { from: addDays(y, -7), to: addDays(y, -1) }, settings);
      out.numbers = {
        sales: x.netRevenue, orders: row.orders, adSpend: x.adSpend, merPct: x.merPct,
        avgSales: wk.dataDays >= 3 ? wk.netRevenue / wk.dataDays : null,
        avgMerPct: wk.dataDays >= 3 && wk.adSpend > 0 ? wk.merPct : null,
        target: await getScoreboardInput(userId).then((i) => targetFor(real.filter((d) => d.date < date).map((d) => toScoreDay(d, settings)), date, i.dailyTarget).amount).catch(() => null),
      };
    }
  }
  return out;
}
