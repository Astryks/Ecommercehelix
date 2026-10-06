import { NextResponse, type NextRequest } from "next/server";
import { isoDay } from "@/lib/dates";
import { appUrl } from "@/lib/meta/config";
import { logAudit } from "@/lib/meta/store";
import { buildNudge, deliverNudge } from "@/lib/nudges";
import { getAccount, getCompletions, getSeasonPlans, listNudgeRecipients } from "@/lib/repo";
import { primaryAlert } from "@/lib/seasons";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Weekly seasonal nudge (Vercel Cron, see vercel.json: Mondays 08:00 Sydney summer time).
 * For the most urgent seasonal alert, emails and pushes each user their next prep steps,
 * or an invite to add the plan. Users who finished the plan are skipped.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const today = isoDay();
  let sent = 0, skipped = 0;
  const keys = new Set<string>();
  for (const u of await listNudgeRecipients()) {
    const [plans, comps, acct] = await Promise.all([getSeasonPlans(u.userId), getCompletions(u.userId), getAccount(u.userId)]);
    const alert = primaryAlert(today, acct.country); // each user's own country calendar
    if (!alert) { skipped++; continue; }
    keys.add(alert.key);
    const nudge = buildNudge(alert, {
      name: u.name,
      planAdded: plans.some((p) => p.planKey === alert.key),
      done: new Set(comps.map((c) => c.taskId)),
      baseUrl: appUrl(new URL(req.url).origin),
    });
    if (!nudge) { skipped++; continue; }
    const d = await deliverNudge(u.email, nudge);
    await logAudit(u.userId, { actor: "system", action: "nudge.seasonal", target: alert.key, outcome: d.email, detail: { subject: nudge.email.subject, push: d.push } });
    sent++;
  }
  return NextResponse.json({ alerts: [...keys], sent, skipped });
}
