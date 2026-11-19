import { NextResponse, type NextRequest } from "next/server";
import { isoDay, addDays } from "@/lib/dates";
import { getDays, getSettings, getStock, getSuppliers, listApprovals, createApproval, listNudgeRecipients } from "@/lib/repo";
import { getSnapshot } from "@/lib/meta/store";
import { getGoogleSnapshot } from "@/lib/google-ads/service";
import { qaWalk, scorecardBrief } from "@/lib/agent/morning";
import { stockRows } from "@/lib/stock";
import { logAudit } from "@/lib/meta/store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Morning brief (Step 3, Job 3): 7am QA walk + 8am scorecard.
 * Runs after the 05:00/05:30 syncs. It does NOT email the briefing yet —
 * it creates approval/red-flag cards in the queue for exceptions that
 * interrupt the owner, and logs the rest silently. "Nothing needs you
 * today" is a valid outcome: no card is created then.
 * Schedule in vercel.json: 07:00 Sydney (20:00 UTC previous day, AEDT).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const today = isoDay();
  const yesterday = addDays(today, -1);
  const lastWeek = addDays(today, -8);
  const now = new Date().toISOString();
  let users = 0, exceptions = 0, cards = 0, boring = 0;
  for (const u of await listNudgeRecipients()) {
    const [days, settings, stock, suppliers, snap, gaSnap, approvals] = await Promise.all([
      getDays(u.userId), getSettings(u.userId), getStock(u.userId), getSuppliers(u.userId),
      getSnapshot(u.userId), getGoogleSnapshot(u.userId).catch(() => null), listApprovals(u.userId),
    ]);
    const real = days.filter((d) => !d.example);
    if (!real.length) continue;
    users++;
    // Hero product = the SKU with the highest daily sales.
    const rows = stockRows(stock, suppliers, today);
    const hero = rows.filter((r) => r.dailySales > 0).sort((a, b) => b.dailySales - a.dailySales)[0];
    const last7 = real.filter((d) => d.date <= yesterday).slice(-7);
    const refunds7 = last7.reduce((a, d) => a + d.refunds, 0);
    const net7 = last7.reduce((a, d) => a + (d.revenue - d.discounts - d.refunds), 0);
    const found = qaWalk({
      days: real, settings, yesterday, sameWeekdayLastWeek: lastWeek,
      heroStockDaysLeft: hero?.daysLeft ?? null,
      refundRatePct7d: net7 > 0 ? (refunds7 / net7) * 100 : null,
      checkoutOk: null, pixelOk: null, // site-check health is not wired into this cron yet — unknown, never assumed ok
      lastSyncAt: { shopify: null, meta: snap?.syncedAt ?? null, google: gaSnap ? gaSnap.to : null, tiktok: null },
      now,
    });
    const brief = scorecardBrief(real, settings, today, { shopify: null, meta: snap?.syncedAt ?? null, google: gaSnap ? gaSnap.to : null, tiktok: null }, now);
    if (brief.boring && !found.some((e) => e.interrupt)) boring++;
    const pending = new Set(approvals.filter((a) => a.status === "pending").map((a) => a.taskId));
    for (const e of found.filter((x) => x.interrupt)) {
      exceptions++;
      const taskId = `morning-${e.key}-${today}`;
      if (pending.has(taskId)) continue;
      await createApproval(u.userId, {
        taskId,
        title: `Red flag: ${e.title}`,
        detail: `${e.evidence}\n\nFrom the 7am QA walk and 8am scorecard for ${yesterday}. ${brief.lines.join(" ")}\n\nThis card interrupts because the issue can cost money today. Fix the cause first — Helix will not propose scaling while it stands.`,
        estAiCost: 0.006,
      });
      await logAudit(u.userId, { actor: "system", action: "morning.red-flag", target: e.key, outcome: "ok", detail: { date: yesterday } });
      cards++;
    }
  }
  return NextResponse.json({ users, exceptions, cards, boring });
}
