/**
 * Daily seminar rotation. Pure and deterministic: the same date always gives the same seminar, so no manual
 * switch is needed. The page reads "today" in Australia/Sydney and is revalidated just after midnight Sydney.
 *
 * Rules
 * 1. Cycle 0 (the first pass) teaches every seminar once, in an order that builds (Start, Launch, Attract, Convert, Grow).
 * 2. Every later cycle is a seeded shuffle (seed = cycle number), repaired so that the same topic cluster never runs
 *    on two days in a row, and no seminar from the last MIN_GAP days of the previous cycle opens the next one.
 * 3. Calendar override: from EVENT_LEAD_DAYS before an event until it ends, on every EVENT_EVERY-th day a seminar
 *    tagged with that event replaces the normal pick (several tagged seminars take turns). Highest-weight event wins.
 */
import { SEMINARS, type Seminar } from "./curriculum";
import { CAL_EVENTS, daysFrom } from "../season-calendar";
import { addDays, isoDay } from "../dates";

export const EPOCH = "2026-11-02"; // day 0 of the schedule
export const MIN_GAP = 14;
export const EVENT_LEAD_DAYS = 21;
export const EVENT_EVERY = 4;

const STAGE_RANK: Record<Seminar["stage"], number> = { Start: 0, Launch: 1, Attract: 2, Convert: 3, Grow: 4 };

export function firstPass(list: Seminar[] = SEMINARS): Seminar[] {
  const sorted = [...list].sort((a, b) => STAGE_RANK[a.stage] - STAGE_RANK[b.stage] || a.order - b.order);
  return repairClusters(sorted, null);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  const r = mulberry32(seed * 2654435761);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Greedy repair: whenever two neighbours share a cluster, swap in the next later item that fits. */
function repairClusters(a: Seminar[], prevLast: Seminar | null): Seminar[] {
  const out = [...a];
  for (let i = 0; i < out.length; i++) {
    const prev = i === 0 ? prevLast : out[i - 1];
    if (!prev || out[i].cluster !== prev.cluster) continue;
    const j = out.findIndex((x, k) => k > i && x.cluster !== prev.cluster && (k + 1 >= out.length || out[k + 1].cluster !== out[i].cluster || k + 1 === i));
    if (j > i) [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const cycleCache = new Map<number, Seminar[]>();
export function cycleOrder(c: number): Seminar[] {
  const hit = cycleCache.get(c);
  if (hit) return hit;
  let order: Seminar[];
  if (c <= 0) order = firstPass();
  else {
    const prev = cycleOrder(c - 1);
    const recent = new Set(prev.slice(-MIN_GAP).map((s) => s.id));
    const shuffled = seededShuffle(SEMINARS, c);
    // Push seminars seen in the last MIN_GAP days of the previous cycle out of the first MIN_GAP slots.
    const fresh = shuffled.filter((s) => !recent.has(s.id));
    const stale = shuffled.filter((s) => recent.has(s.id));
    const head = fresh.slice(0, MIN_GAP);
    order = repairTail([...head, ...[...fresh.slice(MIN_GAP), ...stale]], prev[prev.length - 1]);
  }
  cycleCache.set(c, order);
  return order;
}

/** Cluster repair that only moves items forward, so the fresh head stays fresh. */
function repairTail(a: Seminar[], prevLast: Seminar): Seminar[] {
  const out = [...a];
  for (let i = 0; i < out.length; i++) {
    const prev = i === 0 ? prevLast : out[i - 1];
    if (out[i].cluster !== prev.cluster) continue;
    const next = out[i + 1];
    const j = out.findIndex((x, k) => k > i && x.cluster !== prev.cluster && x.cluster !== next?.cluster);
    const k = j > i ? j : out.findIndex((x, kk) => kk > i && x.cluster !== prev.cluster);
    if (k > i) {
      const [item] = out.splice(k, 1);
      out.splice(i, 0, item);
    }
  }
  return out;
}

export function baseForDate(date: string): Seminar {
  const idx = daysFrom(EPOCH, date);
  const L = SEMINARS.length;
  const c = Math.floor(idx / L);
  const pos = ((idx % L) + L) % L;
  return cycleOrder(Math.max(0, c))[pos];
}

export type ActiveEvent = { key: string; name: string; start: string; end: string; daysTo: number; weight: number };

export function eventWindowFor(date: string): ActiveEvent | null {
  const y = Number(date.slice(0, 4));
  const hits: ActiveEvent[] = [];
  for (const e of CAL_EVENTS) {
    for (const yy of [y, y + 1]) {
      const span = e.span(yy);
      if (!span) continue;
      const daysTo = daysFrom(date, span.start);
      const inWindow = daysTo <= EVENT_LEAD_DAYS && daysFrom(date, span.end) >= 0;
      if (inWindow && SEMINARS.some((s) => s.events.includes(e.key))) hits.push({ key: e.key, name: e.name, start: span.start, end: span.end, daysTo, weight: e.weight });
    }
  }
  hits.sort((a, b) => b.weight - a.weight || a.daysTo - b.daysTo);
  return hits[0] ?? null;
}

export type DailyPick = { date: string; seminar: Seminar; reason: "first-pass" | "shuffle" | "event"; event?: { key: string; name: string; start: string } };

function eventPick(date: string): { seminar: Seminar; ev: ActiveEvent } | null {
  const ev = eventWindowFor(date);
  if (!ev) return null;
  const k = EVENT_LEAD_DAYS - ev.daysTo; // days into the window (keeps counting during the event)
  if (k % EVENT_EVERY !== 0) return null;
  const tagged = SEMINARS.filter((s) => s.events.includes(ev.key));
  const seminar = tagged[Math.floor(k / EVENT_EVERY) % tagged.length];
  return seminar ? { seminar, ev } : null;
}

export function seminarForDate(date: string): DailyPick {
  const hit = eventPick(date);
  if (hit) {
    const y = addDays(date, -1), t = addDays(date, 1);
    // Yesterday's final pick may itself be an event pick; tomorrow's is checked one level only (base + event).
    const near = [baseForDate(y).id, baseForDate(t).id, eventPick(y)?.seminar.id, eventPick(t)?.seminar.id];
    if (!near.includes(hit.seminar.id)) return { date, seminar: hit.seminar, reason: "event", event: { key: hit.ev.key, name: hit.ev.name, start: hit.ev.start } };
  }
  const idx = daysFrom(EPOCH, date);
  return { date, seminar: baseForDate(date), reason: idx < SEMINARS.length ? "first-pass" : "shuffle" };
}

export const todayInSydney = (now: Date = new Date()) => isoDay(now, "Australia/Sydney");

export function schedule(from: string, days: number): DailyPick[] {
  return Array.from({ length: days }, (_, i) => seminarForDate(addDays(from, i)));
}
