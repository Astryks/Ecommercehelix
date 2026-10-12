/** Pure helpers for the "Your progress" page. Everything is computed from existing rows; nothing is stored twice. */
import { addDays } from "./dates";

export type Hist = { completions: { taskId: string; completedOn: string }[]; steps: { stepKey: string; at: string }[]; events: { kind: string; ref: string; at: string }[] };

export function bestStreak(dates: string[]): number {
  const set = [...new Set(dates)].sort();
  let best = 0, run = 0, prev = "";
  for (const d of set) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export type DayEntry = { date: string; tasks: number; lessons: Map<string, number>; goals: string[]; profitSetup: boolean };

/** One entry per active day, newest first. */
export function timeline(h: Hist): DayEntry[] {
  const m = new Map<string, DayEntry>();
  const get = (date: string) => m.get(date) ?? (m.set(date, { date, tasks: 0, lessons: new Map(), goals: [], profitSetup: false }), m.get(date)!);
  for (const c of h.completions) get(c.completedOn).tasks++;
  for (const s of h.steps) {
    const e = get(s.at.slice(0, 10));
    const ref = s.stepKey.split("#")[0];
    e.lessons.set(ref, (e.lessons.get(ref) ?? 0) + 1);
  }
  for (const ev of h.events) {
    const e = get(ev.at.slice(0, 10));
    if (ev.kind === "goal_done") e.goals.push(ev.ref);
    if (ev.kind === "profit_setup") e.profitSetup = true;
  }
  return [...m.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export type MonthRecap = { month: string; tasks: number; steps: number; goals: number; activeDays: number };

export function monthly(h: Hist): MonthRecap[] {
  const m = new Map<string, MonthRecap & { days: Set<string> }>();
  const get = (d: string) => {
    const k = d.slice(0, 7);
    if (!m.has(k)) m.set(k, { month: k, tasks: 0, steps: 0, goals: 0, activeDays: 0, days: new Set() });
    return m.get(k)!;
  };
  for (const c of h.completions) { const r = get(c.completedOn); r.tasks++; r.days.add(c.completedOn); }
  for (const s of h.steps) { const r = get(s.at.slice(0, 10)); r.steps++; r.days.add(s.at.slice(0, 10)); }
  for (const e of h.events) if (e.kind === "goal_done") get(e.at.slice(0, 10)).goals++;
  return [...m.values()].map(({ days, ...r }) => ({ ...r, activeDays: days.size })).sort((a, b) => b.month.localeCompare(a.month));
}
