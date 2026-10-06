import "server-only";
import { getAccount, getDays, getGoals, getSettings } from "./repo";
import { signalsFor } from "./signals";
import { metricsFor, periodRanges } from "./analytics";
import { addDays, isoDay } from "./dates";
import { DEFAULT_GOALS, actualsFrom, impliedMonth } from "./goals";

/** Everything the goals ladder needs for one user: targets, the last 30 days and what the targets add up to. */
export async function goalsFor(userId: string) {
  const [acct, saved, days, settings, sig] = await Promise.all([getAccount(userId), getGoals(userId), getDays(userId), getSettings(userId), signalsFor(userId)]);
  const goals = saved ?? DEFAULT_GOALS[acct.track];
  const latest = days.at(-1)?.date ?? addDays(isoDay(), -1);
  const { cur } = periodRanges("month", latest);
  const m = metricsFor(days, cur, settings);
  const actuals = actualsFrom(m, { ctrPct: sig.metaLive ? sig.signals.meta.ctr : null });
  return {
    goals,
    isDefault: !saved,
    merPct: settings.targetMerPct,
    fixedCostsMonthly: settings.fixedCostsMonthly,
    actuals,
    exampleDays: m.exampleDays,
    implied: impliedMonth(goals, settings.targetMerPct, settings.fixedCostsMonthly),
    track: acct.track,
  };
}
