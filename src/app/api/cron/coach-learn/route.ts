import { NextResponse, type NextRequest } from "next/server";
import { hasDb, prisma } from "@/lib/db";
import { coachEnabled } from "@/lib/coach/config";
import { learnStore } from "@/lib/coach/lifecycle";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vercel Cron, after the nightly syncs: refresh each paid user's store memory from totals (no customer details, no model calls, no cost). */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDb || !coachEnabled()) return NextResponse.json({ skipped: "coach off" });
  const t0 = Date.now();
  const users = await prisma.user.findMany({ where: { isDemo: false, subscription: { plan: { in: ["STARTER", "GROWTH"] } } }, select: { id: true }, take: 5000 });
  let facts = 0, done = 0;
  for (const u of users) {
    if (Date.now() - t0 > 240_000) break;
    facts += await learnStore(u.id); done++;
  }
  return NextResponse.json({ users: done, facts });
}
