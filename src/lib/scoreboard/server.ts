import "server-only";
import { hasDb, prisma } from "../db";
import { getAccount, getCompletions, getDays, getSettings } from "../repo";
import { getShopify } from "../shopify/service";
import { hasFullLearn } from "../paywall/access";
import { addDays } from "../dates";
import { didIGrow, localDays, personalBests, rollup, spreadManual, targetHistory, targetStreak, toScoreDay, ytd, manualToRollup, type ManualPeriod, type ScoreDay } from "./core";

/** Saved in ToolInput kind "scoreboard" (no schema change). Totals only, never customer details. */
export type ScoreboardInput = { dailyTarget: number | null; manual: ManualPeriod[] };
const KIND = "scoreboard";
const EMPTY: ScoreboardInput = { dailyTarget: null, manual: [] };
const g = globalThis as unknown as { __helixScoreboard?: Map<string, ScoreboardInput> };
const mem = (g.__helixScoreboard ??= new Map());

export async function getScoreboardInput(userId: string): Promise<ScoreboardInput> {
  if (!hasDb) return mem.get(userId) ?? EMPTY;
  const r = await prisma.toolInput.findUnique({ where: { userId_kind: { userId, kind: KIND } } }).catch(() => null);
  return r ? { ...EMPTY, ...(r.data as Partial<ScoreboardInput>) } : EMPTY;
}
export async function saveScoreboardInput(userId: string, data: ScoreboardInput) {
  const clean: ScoreboardInput = { dailyTarget: data.dailyTarget && data.dailyTarget > 0 ? Math.round(data.dailyTarget) : null, manual: data.manual.slice(-400) };
  if (!hasDb) { mem.set(userId, clean); return; }
  await prisma.toolInput.upsert({ where: { userId_kind: { userId, kind: KIND } }, create: { userId, kind: KIND, data: clean }, update: { data: clean } });
}

export async function userTimezone(userId: string): Promise<string> {
  if (!hasDb) return "Australia/Sydney";
  const p = await prisma.emailPrefs.findUnique({ where: { userId }, select: { timezone: true } }).catch(() => null);
  return p?.timezone || "Australia/Sydney";
}

/** Everything the scoreboard needs. Paid-only parts (full history, YTD) are left out for Free on the server. */
export async function loadScoreboard(userId: string, now = new Date()) {
  const [days, settings, input, acct, tz, shop] = await Promise.all([getDays(userId), getSettings(userId), getScoreboardInput(userId), getAccount(userId), userTimezone(userId), getShopify(userId).catch(() => null)]);
  const { today, yesterday } = localDays(now, tz);
  const score: ScoreDay[] = days.filter((d) => d.date <= yesterday).map((d) => toScoreDay(d, settings));
  const grow = didIGrow(score, yesterday, input.dailyTarget);
  const todayTarget = didIGrow(score, today, input.dailyTarget).target;
  const hist = targetHistory(score, yesterday, 120, input.dailyTarget);
  const streak = targetStreak(hist, yesterday);
  // Screenshot-only: lets a demo user preview the paid view locally. Ignored in production and for real users.
  const previewPaid = process.env.SCOREBOARD_PREVIEW_PAID === "true" && process.env.NODE_ENV !== "production" && userId.startsWith("demo-");
  const paid = previewPaid || hasFullLearn(acct.plan);
  const withManual = spreadManual(score, input.manual);
  const weekFrom = addDays(yesterday, -6);
  return {
    today, yesterday, tz, paid, plan: acct.plan, shopify: Boolean(shop), example: days.some((d) => d.example),
    yRow: score.find((d) => d.date === yesterday) ?? null,
    rawYesterday: days.find((d) => d.date === yesterday) ?? null,
    grow, todayTarget, streak, input,
    week: score.filter((d) => d.date >= weekFrom),
    bests: personalBests(score),
    // Paid only:
    ytd: paid ? ytd(withManual, yesterday) : null,
    history: paid ? { week: rollup(score, "week").slice(-104), month: rollup(score, "month", input.manual.filter((m) => m.kind === "month").map(manualToRollup)), year: rollup(withManual, "year") } : null,
    days: score,
  };
}

/**
 * Small read-only hook for the Road-to-$100M / Progress work: daily streaks, target hits and bests,
 * plus XP suggestions. Reads only existing rows; safe to call from any server component.
 */
export async function scoreboardProgress(userId: string) {
  const [s, completions] = await Promise.all([loadScoreboard(userId), getCompletions(userId)]);
  const growDone = completions.filter((c) => c.taskId.startsWith("grow-")).length;
  return {
    targetStreak: s.streak.current, bestTargetStreak: s.streak.best, targetHits: s.streak.hits,
    bests: s.bests, lastYesterday: { verdict: s.grow.verdict, sales: s.grow.sales, target: s.grow.target.amount },
    growTasksDone: growDone,
    /** Suggested XP: 10 per target hit, 5 per grow task done, 25 per personal best. The Progress page decides how to use it. */
    xp: s.streak.hits * 10 + growDone * 5 + s.bests.length * 25,
  };
}

/** One line for the coach's store context. */
export async function scoreboardCoachLine(userId: string): Promise<string | null> {
  const s = await loadScoreboard(userId).catch(() => null);
  if (!s) return null;
  const g = s.grow;
  const y = g.sales === null ? `Yesterday (${s.yesterday}): no numbers recorded.` : `Yesterday (${s.yesterday}): sales ${Math.round(g.sales)}, costs ${Math.round(s.yRow?.costs ?? 0)}, profit ${Math.round(s.yRow?.profit ?? 0)}; grew: ${g.verdict}${g.vsUsual ? ` (${g.vsUsual.change >= 0 ? "+" : ""}${Math.round(g.vsUsual.change)} vs ${g.vsUsual.label})` : ""}; target ${g.target.amount ?? "none"}${g.hitTarget ? " (hit)" : ""}.`;
  return `${y} Today's sales target: ${s.todayTarget.amount ?? "not set"}. Target streak: ${s.streak.current} days.`;
}
