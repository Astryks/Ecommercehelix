import "server-only";
import { hasDb, prisma } from "./db";
import { SUPPORT_EMAIL } from "./support";

export type WinRow = { id: string; text: string; firstName: string; weekOf: string; status: string; createdAt: string };

/** Monday (UTC date) of the week a date falls in. */
export function mondayOf(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  const back = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}

const toRow = (w: { id: string; text: string; firstName: string; weekOf: string; status: string; createdAt: Date }): WinRow => ({ ...w, createdAt: w.createdAt.toISOString() });

export async function approvedWins(weekOf: string): Promise<WinRow[]> {
  if (!hasDb) return [];
  return (await prisma.win.findMany({ where: { status: "approved", weekOf }, orderBy: { createdAt: "desc" }, take: 50 })).map(toRow);
}
export async function myWins(userId: string): Promise<WinRow[]> {
  if (!hasDb) return [];
  return (await prisma.win.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 })).map(toRow);
}
export async function pendingWins(): Promise<WinRow[]> {
  if (!hasDb) return [];
  return (await prisma.win.findMany({ where: { status: "pending" }, orderBy: { createdAt: "asc" }, take: 100 })).map(toRow);
}
export async function addWin(userId: string, text: string, firstName: string, weekOf: string) {
  if (!hasDb) return;
  const recent = await prisma.win.count({ where: { userId, weekOf } });
  if (recent >= 3) return; // a few per week is plenty
  await prisma.win.create({ data: { userId, text, firstName, weekOf } });
}
export async function decideWin(id: string, status: "approved" | "rejected") {
  if (!hasDb) return;
  await prisma.win.update({ where: { id }, data: { status, decidedAt: new Date() } });
}

/** Moderators are listed by email in WINS_MODERATORS (comma separated). */
export function isModerator(email: string | null | undefined, env: Record<string, string | undefined> = process.env): boolean {
  const list = (env.WINS_MODERATORS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && list.includes(email.toLowerCase()));
}

export async function seenAchievements(userId: string): Promise<Set<string>> {
  if (!hasDb) return new Set();
  return new Set((await prisma.achievementSeen.findMany({ where: { userId } })).map((r) => r.key));
}
export async function markAchievementsSeen(userId: string, keys: string[]) {
  if (!hasDb || !keys.length) return;
  await prisma.achievementSeen.createMany({ data: keys.map((key) => ({ userId, key })), skipDuplicates: true });
}

/** Send a plain email through Resend. Returns false when email is not set up or fails. */
export async function sendPlainEmail(to: string, subject: string, text: string, replyTo?: string): Promise<boolean> {
  const key = process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function addReviewRequest(userId: string, email: string, storeUrl: string, question: string): Promise<boolean> {
  const recent = hasDb ? await prisma.reviewRequest.count({ where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } }) : 0;
  if (recent >= 2) return false;
  const emailed = await sendPlainEmail(SUPPORT_EMAIL, `Review my store: ${storeUrl}`, `A Helix member asked for a store review.\n\nStore: ${storeUrl}\nMember email: ${email}\n\nWhat they want help with:\n${question || "(nothing added)"}`, email);
  if (hasDb) await prisma.reviewRequest.create({ data: { userId, storeUrl, question, emailed } });
  return true;
}
