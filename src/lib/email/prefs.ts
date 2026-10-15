import "server-only";
import { hasDb, prisma } from "../db";
import type { PlanId } from "../plans";
import { PLAN_RANK } from "../plans";

export type MarketingKind = "daily" | "event" | "winback" | "scorecard";
export const MARKETING_KINDS: MarketingKind[] = ["daily", "event", "winback", "scorecard"];
export type Prefs = { dailyTasks: boolean | null; events: boolean; winback: boolean; scorecard: boolean; timezone: string; unsubToken: string };

const DEFAULT: Prefs = { dailyTasks: null, events: true, winback: true, scorecard: true, timezone: "Australia/Sydney", unsubToken: "" };

export async function getPrefs(userId: string): Promise<Prefs> {
  if (!hasDb) return { ...DEFAULT, unsubToken: `mem-${userId}` };
  const r = await prisma.emailPrefs.upsert({ where: { userId }, create: { userId }, update: {} });
  return { dailyTasks: r.dailyTasks, events: r.events, winback: r.winback, scorecard: r.scorecard, timezone: r.timezone, unsubToken: r.unsubToken };
}

export async function savePrefs(userId: string, p: Partial<Omit<Prefs, "unsubToken">>) {
  if (!hasDb) return;
  await prisma.emailPrefs.upsert({ where: { userId }, create: { userId, ...p }, update: p });
}

/** One-click unsubscribe by token. kind "all" switches off every marketing email. */
export async function unsubscribe(token: string, kind: string): Promise<boolean> {
  if (!hasDb || !token) return false;
  const data = kind === "daily" ? { dailyTasks: false } : kind === "event" ? { events: false } : kind === "winback" ? { winback: false } : kind === "scorecard" ? { scorecard: false } : { dailyTasks: false, events: false, winback: false, scorecard: false };
  const r = await prisma.emailPrefs.updateMany({ where: { unsubToken: token }, data });
  return r.count > 0;
}

/** Daily tasks email: on by default for paid plans, off by default for Free; the user's choice wins. */
export const dailyOn = (p: Prefs, plan: PlanId) => (p.dailyTasks === null ? PLAN_RANK[plan] >= PLAN_RANK.starter : p.dailyTasks);
export function allowed(p: Prefs, plan: PlanId, kind: string): boolean {
  if (kind === "daily") return dailyOn(p, plan);
  if (kind === "event") return p.events;
  if (kind === "winback") return p.winback;
  if (kind === "scorecard") return p.scorecard;
  return true; // transactional
}

/** Claim a send so it happens once (per user, kind and key). */
export async function claimSend(userId: string, kind: string, key: string): Promise<boolean> {
  if (!hasDb) return true;
  return (await prisma.emailSent.createMany({ data: [{ userId, kind, key }], skipDuplicates: true })).count === 1;
}
export async function unclaimSend(userId: string, kind: string, key: string) {
  if (hasDb) await prisma.emailSent.deleteMany({ where: { userId, kind, key } });
}
