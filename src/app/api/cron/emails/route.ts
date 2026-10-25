import { NextResponse, type NextRequest } from "next/server";
import { hasDb, prisma } from "@/lib/db";
import { dueEmails } from "@/lib/email/schedule";
import { notify } from "@/lib/email/notify";
import { dailyEmail, eventEmail, welcomeEmail, winbackEmail } from "@/lib/email/templates";
import { composeDaily } from "@/lib/email/daily-mix";
import { dailyFacts } from "@/lib/email/daily-facts";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Automated emails, run once an hour (24 daily Vercel crons, one per UTC hour, because the Hobby plan allows daily crons only).
 * Each user gets the morning emails in their own time zone; every send is logged once per key, so overlaps never double-send.
 * Sends only when EMAILS_LIVE=1; otherwise it reports what it would send.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDb) return NextResponse.json({ skipped: "no database" });
  const live = process.env.EMAILS_LIVE === "1";
  const now = new Date();
  const users = await prisma.user.findMany({ where: { isDemo: false, email: { not: null } }, select: { id: true, email: true, name: true, createdAt: true, isDemo: true, country: true, subscription: true, emailPrefs: { select: { timezone: true } } }, take: 5000 });
  const tally: Record<string, number> = {};
  for (const u of users) {
    const plan = (u.subscription?.plan ?? "FREE").toLowerCase() as PlanId;
    const due = dueEmails({ createdAt: u.createdAt, isDemo: u.isDemo, country: u.country, timezone: u.emailPrefs?.timezone ?? "Australia/Sydney", status: u.subscription?.status ?? "active", subscriptionId: u.subscription?.stripeSubscriptionId ?? null, currentPeriodEnd: u.subscription?.currentPeriodEnd ?? null }, now);
    for (const d of due) {
      if (!live) { tally[`would-${d.kind}`] = (tally[`would-${d.kind}`] ?? 0) + 1; continue; }
      const r = await notify({ userId: u.id, email: u.email!, plan }, d.kind, d.key, async (l) => {
        const c = { name: u.name ?? "", baseUrl: l.baseUrl, unsubUrl: l.unsubUrl, prefsUrl: l.prefsUrl };
        if (d.kind === "welcome") return welcomeEmail(c);
        // Different every day: seeded by user and date; next lesson, goal and numbers loaded only for users who get it.
        if (d.kind === "daily") return dailyEmail(c, composeDaily({ seed: u.id, date: d.date, season: d.season, facts: await dailyFacts(u.id, d.date) }));
        if (d.kind === "event") return eventEmail(c, d);
        return winbackEmail(c);
      });
      tally[`${d.kind}-${r}`] = (tally[`${d.kind}-${r}`] ?? 0) + 1;
    }
  }
  return NextResponse.json({ live, users: users.length, ...tally });
}
