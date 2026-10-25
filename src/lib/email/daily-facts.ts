import "server-only";
import { getCourse } from "../course";
import { metricsFor } from "../analytics";
import { derive } from "../scorecard";
import { addDays } from "../dates";
import { getRawDays, getSettings } from "../repo";
import { NO_FACTS, type DailyFacts } from "./daily-mix";

/**
 * What makes one user's daily email personal: the next lesson step and goal from the course (same logic as Today),
 * and yesterday's numbers against the week before from real scorecard days. Anything missing is left out, never guessed.
 */
export async function dailyFacts(userId: string, date: string): Promise<DailyFacts> {
  const [course, raw, settings] = await Promise.all([getCourse(userId, date).catch(() => null), getRawDays(userId).catch(() => []), getSettings(userId).catch(() => null)]);
  const out: DailyFacts = { ...NO_FACTS };

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
      };
    }
  }
  return out;
}
