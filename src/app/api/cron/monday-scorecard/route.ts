import { NextResponse, type NextRequest } from "next/server";
import { isoDay } from "@/lib/dates";
import { appUrl } from "@/lib/meta/config";
import { logAudit } from "@/lib/meta/store";
import { getDays, getSettings, listNudgeRecipients } from "@/lib/repo";
import { buildScorecardEmail } from "@/lib/scorecard-email";
import { mondayOf } from "@/lib/community";
import { notify } from "@/lib/email/notify";
import { scorecardHtmlEmail } from "@/lib/email/templates";
import { getAccount } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Monday scorecard email (Vercel Cron, Mondays about 8 AM Sydney). Sends only when SCORECARD_EMAIL_LIVE=1; otherwise it logs. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const live = process.env.SCORECARD_EMAIL_LIVE === "1";
  const monday = mondayOf(isoDay());
  let sent = 0, skipped = 0;
  for (const u of await listNudgeRecipients()) {
    const [days, settings] = await Promise.all([getDays(u.userId), getSettings(u.userId)]);
    const mail = buildScorecardEmail(days, settings, monday, { name: u.name, baseUrl: appUrl(new URL(req.url).origin) });
    if (!mail || !u.email) { skipped++; continue; }
    // Branded email with one-click unsubscribe; respects the Monday scorecard preference; once per Monday.
    const r = live ? await notify({ userId: u.userId, email: u.email, plan: (await getAccount(u.userId)).plan }, "scorecard", monday, (l) => scorecardHtmlEmail({ name: u.name, baseUrl: l.baseUrl, unsubUrl: l.unsubUrl, prefsUrl: l.prefsUrl }, mail.subject, mail.text)) : "stub";
    await logAudit(u.userId, { actor: "system", action: "email.scorecard", target: monday, outcome: r });
    sent++;
  }
  return NextResponse.json({ live, sent, skipped });
}
