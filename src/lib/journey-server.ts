import "server-only";
import { getHistory, getRawDays } from "./repo";
import { getInput, saveInput } from "./tools/server";
import { hasDb } from "./db";
import { isoDay } from "./dates";
import { questForUser } from "./quest-server";
import { positionFor, progressToNext, xpFor, coachLine, type JourneyFacts, type Position } from "./journey";

export const JOURNEY_KIND = "journey"; // ToolInput row: { selfLevel } — no schema change needed.
type JourneyInput = { selfLevel: number | null };
// Local dev without a database: keep the picked level in memory.
const g = globalThis as unknown as { __helixJourney?: Map<string, number | null> };
const mem = (g.__helixJourney ??= new Map());

/** Real (non-example) sales totals for the "You are here" marker. */
export async function journeyFacts(userId: string, today = isoDay()): Promise<JourneyFacts> {
  const real = (await getRawDays(userId)).filter((d) => !d.example);
  const from = new Date(Date.parse(today + "T00:00:00Z") - 30 * 864e5).toISOString().slice(0, 10);
  const sum = (ds: typeof real, f: (d: (typeof real)[number]) => number) => ds.reduce((a, d) => a + (f(d) || 0), 0);
  return { lifetimeOrders: sum(real, (d) => d.orders), lifetimeSales: sum(real, (d) => d.revenue), last30Sales: sum(real.filter((d) => d.date > from && d.date <= today), (d) => d.revenue) };
}

export async function journeyPosition(userId: string): Promise<{ pos: Position; facts: JourneyFacts; selfLevel: number | null; progress: number | null }> {
  const [facts, input] = await Promise.all([journeyFacts(userId), hasDb ? getInput<JourneyInput>(userId, JOURNEY_KIND, { selfLevel: null }) : Promise.resolve({ selfLevel: mem.get(userId) ?? null })]);
  const pos = positionFor(facts, input.selfLevel);
  return { pos, facts, selfLevel: input.selfLevel, progress: pos.source === "numbers" ? progressToNext(facts, pos.level) : null };
}

export async function journeyForUser(userId: string) {
  const [p, qx, h, raw] = await Promise.all([journeyPosition(userId), questForUser(userId), getHistory(userId, null), getRawDays(userId)]);
  const xp = xpFor({
    lessonXp: qx.quest.xp,
    tasksDone: h.completions.length,
    goalsDone: h.events.filter((e) => e.kind === "goal_done").length,
    daysWithNumbers: raw.filter((d) => !d.example && (d.revenue > 0 || d.orders > 0)).length,
  });
  return { ...p, xp, streak: qx.streak, quest: qx.quest };
}

export async function saveSelfLevel(userId: string, level: number | null) {
  const v = level && Number.isInteger(level) && level >= 1 && level <= 7 ? level : null;
  if (!hasDb) mem.set(userId, v);
  else await saveInput(userId, JOURNEY_KIND, { selfLevel: v });
}

export async function journeyCoachLine(userId: string): Promise<string | null> {
  return coachLine((await journeyPosition(userId)).pos);
}
