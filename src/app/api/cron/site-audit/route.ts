import { NextResponse, type NextRequest } from "next/server";
import { dueForRecheck, runAndSave } from "@/lib/site-audit/run";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Daily Vercel Cron: re-check paid stores whose last check is 30+ days old. About 5 plain fetches per store. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const due = await dueForRecheck(30, 25);
  let ok = 0;
  let failed = 0;
  for (let i = 0; i < due.length; i += 5) {
    const batch = await Promise.all(due.slice(i, i + 5).map((d) => runAndSave(d.userId, d.url)));
    for (const r of batch) r.ok ? ok++ : failed++;
  }
  return NextResponse.json({ checked: due.length, ok, failed });
}
