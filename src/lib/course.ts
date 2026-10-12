import "server-only";
import { findLesson } from "./learn";
import { lessonLink } from "./lesson-links";
import { stepKey } from "./lesson-actions";
import { addDays, isoDay } from "./dates";
import { metricsFor } from "./analytics";
import { adminDueSoon } from "./business";
import { nextTasks, seasonalAlerts } from "./seasons";
import { getAccount, getCompletions, getCourseState, getLessonSteps, getRawDays, getSettings, saveCourseState } from "./repo";
import {
  buildDays, currentDay, finishStatus, goalsFor, nextGoalId, toCourseTrack, slotDated,
  type CourseDay, type CourseState, type CourseTrack, type DatedTask, type FinishCtx, type FinishStatus, type GoalDef, type LessonInfo,
} from "./course-plan";
import type { DayInput, Settings } from "./scorecard";

const lessonCache = new Map<string, LessonInfo | null>();
export function lookupLesson(ref: string): LessonInfo | null {
  if (lessonCache.has(ref)) return lessonCache.get(ref)!;
  const l = findLesson(ref);
  const link = lessonLink(ref);
  const info = l && link ? { ref, title: link.title, href: link.href, steps: l.steps.map((s) => ({ n: s.n, instruction: s.instruction, expected: s.expected, action: s.action })) } : null;
  lessonCache.set(ref, info);
  return info;
}

const daysCache = new Map<string, CourseDay[]>();
export function goalDays(g: GoalDef): CourseDay[] {
  if (!daysCache.has(g.id)) daysCache.set(g.id, buildDays(g, lookupLesson));
  return daysCache.get(g.id)!;
}

/** Finish-line numbers from real (not example) days. */
export function finishCtx(raw: DayInput[], s: Settings, baselineAov: number, today = isoDay()): FinishCtx {
  const real = raw.filter((d) => !d.example);
  const y = addDays(today, -1);
  const r7 = { from: addDays(y, -6), to: y };
  const r30 = { from: addDays(y, -29), to: y };
  const p30 = { from: addDays(y, -59), to: addDays(y, -30) };
  const m7 = metricsFor(real, r7, s);
  const m30 = metricsFor(real, r30, s);
  const mp = metricsFor(real, p30, s);
  return {
    realDays7: m7.dataDays,
    realDays30: m30.dataDays,
    sessionsPerDay7: m7.dataDays ? m7.t.sessions / m7.dataDays : 0,
    atcPct7: m7.t.addToCarts ? (m7.t.addToCarts / Math.max(1, m7.t.sessions)) * 100 : null,
    crPct7: m7.cr,
    aov7: m7.aov,
    marginPct30: m30.netRevenue ? (m30.netProfit / m30.netRevenue) * 100 : 0,
    revenue30: m30.netRevenue,
    revenuePrev30: mp.netRevenue,
    returningPct30: m30.netRevenue && m30.t.newCustomerRevenue ? Math.max(0, 100 - m30.newSharePct) : 0,
    merPct30: m30.merPct,
    targetMerPct: s.targetMerPct,
    costsEntered: real.some((d) => d.cogs > 0 && d.revenue > 0),
    baselineAov,
  };
}

export type GoalPathItem = { goal: GoalDef; n: number; days: number; status: "done" | "current" | "locked" };
export type CourseView = {
  track: CourseTrack;
  path: GoalPathItem[];
  current: null | {
    goal: GoalDef;
    n: number;
    days: CourseDay[];
    day: number;
    allDaysDone: boolean;
    finish: FinishStatus;
    dated: DatedTask[];
  };
  done: Set<string>;
  celebrate: GoalDef | null;
  finished: boolean;
};

/** Load (and if needed advance) the user's course. Finishing a goal unlocks the next one. */
export async function getCourse(userId: string, today = isoDay()): Promise<CourseView> {
  const [acct, completions, steps, raw, settings, saved] = await Promise.all([getAccount(userId), getCompletions(userId), getLessonSteps(userId), getRawDays(userId), getSettings(userId), getCourseState(userId)]);
  const stepSet = new Set(steps);
  const done = new Set(completions.map((c) => c.taskId));
  let state: CourseState = saved ?? { track: toCourseTrack(acct.track), goalId: "", doneGoals: [], confirmed: [], baselineAov: 0, celebrate: null };
  const goals = goalsFor(state.track);
  // A course task is also done when its lesson step was ticked on the lesson page.
  for (const g of goals) for (const d of goalDays(g)) for (const t of d.tasks) if (stepSet.has(stepKey(t.lessonRef, t.step))) done.add(t.id);

  const ctxFor = (s: CourseState) => finishCtx(raw, settings, s.baselineAov, today);
  let changed = !saved;
  if (!state.goalId || !goals.some((g) => g.id === state.goalId)) {
    state = { ...state, goalId: nextGoalId(state.track, state.doneGoals) ?? "", baselineAov: ctxFor(state).aov7 };
    changed = true;
  }
  // Advance while the current goal's finish line is met and its days are done.
  for (let guard = 0; guard < goals.length && state.goalId; guard++) {
    const g = goals.find((x) => x.id === state.goalId)!;
    const days = goalDays(g);
    const cd = currentDay(days, done);
    const f = finishStatus(g, ctxFor(state), cd.allDone ? days.length : cd.n - 1, days.length, state.confirmed.includes(g.id));
    if (!(cd.allDone && f.met)) break;
    const doneGoals = [...state.doneGoals, g.id];
    const next = nextGoalId(state.track, doneGoals);
    state = { ...state, doneGoals, goalId: next ?? "", celebrate: g.id, baselineAov: ctxFor(state).aov7 };
    changed = true;
  }
  if (changed) await saveCourseState(userId, state);

  const path: GoalPathItem[] = goals.map((g, i) => ({ goal: g, n: i + 1, days: goalDays(g).length, status: state.doneGoals.includes(g.id) ? "done" : g.id === state.goalId ? "current" : "locked" }));
  const cur = goals.find((g) => g.id === state.goalId) ?? null;
  let current: CourseView["current"] = null;
  if (cur) {
    const days = goalDays(cur);
    const cd = currentDay(days, done);
    const finish = finishStatus(cur, ctxFor(state), cd.allDone ? days.length : cd.n - 1, days.length, state.confirmed.includes(cur.id));
    current = { goal: cur, n: path.find((p) => p.goal.id === cur.id)!.n, days, day: cd.n, allDaysDone: cd.allDone, finish, dated: slotDated(days[cd.n - 1]?.tasks ?? [], datedTasks(today, acct.country, done), today, done) };
  }
  return { track: state.track, path, current, done, celebrate: goals.find((g) => g.id === state.celebrate) ?? null, finished: !cur };
}

/** Sale prep from the seasonal calendar and tax dates, as dated tasks. */
export function datedTasks(today: string, country: "AU" | "US", done: Set<string>): DatedTask[] {
  const out: DatedTask[] = [];
  for (const a of seasonalAlerts(today, country).filter((x) => !x.reviewing).slice(0, 3)) {
    for (const t of nextTasks(a, done, 2)) out.push({ id: t.taskId, title: t.title, due: t.due, why: `${a.name} prep`, href: "/dashboard/calendar", minutes: 15, kind: "season" });
  }
  for (const b of adminDueSoon(today, country, done, 2).filter((x) => x.daysTo <= 14)) {
    out.push({ id: b.taskId, title: b.name, due: b.date, why: "Tax and admin date", href: lessonLink(b.lesson)?.href ?? "/dashboard/business", minutes: 20, kind: "admin" });
  }
  return out;
}
