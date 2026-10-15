import { NextResponse, type NextRequest } from "next/server";
import { hasDb, prisma } from "@/lib/db";
import { refreshUser } from "@/lib/tools/server";
import { notify } from "@/lib/email/notify";
import { alertsEmail } from "@/lib/email/templates";
import { isoDay } from "@/lib/dates";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Daily: recalculate forecast, cash plan, buy plan, customers, targets and the monthly ad check for every store,
 * open or close alerts (they show on Today), and send an optional heads-up email for new alerts (when EMAILS_LIVE=1).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDb) return NextResponse.json({ skipped: "no database" });
  const today = isoDay();
  const users = await prisma.user.findMany({ where: { isDemo: false }, select: { id: true, email: true, name: true, subscription: { select: { plan: true } } }, take: 5000 });
  let refreshed = 0, opened = 0, emailed = 0, failed = 0;
  for (const u of users) {
    try {
      const fresh = (await refreshUser(u.id, today)).filter((a) => a.kind !== "adcheck");
      refreshed++; opened += fresh.length;
      if (fresh.length && u.email && process.env.EMAILS_LIVE === "1") {
        const plan = (u.subscription?.plan ?? "FREE").toLowerCase() as PlanId;
        const r = await notify({ userId: u.id, email: u.email, plan }, "alerts", `${today}-${fresh.map((a) => a.key).join(",")}`.slice(0, 180), (l) => alertsEmail({ name: u.name ?? "", baseUrl: l.baseUrl, unsubUrl: l.unsubUrl, prefsUrl: l.prefsUrl }, fresh));
        if (r === "sent") { emailed++; await prisma.toolAlert.updateMany({ where: { userId: u.id, key: { in: fresh.map((a) => a.key) } }, data: { emailed: true } }); }
      }
    } catch (e) { failed++; console.error("tools cron", u.id, (e as Error).message); }
  }
  return NextResponse.json({ today, users: users.length, refreshed, opened, emailed, failed });
}
