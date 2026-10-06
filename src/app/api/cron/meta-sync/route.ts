import { NextResponse, type NextRequest } from "next/server";
import { syncAll } from "@/lib/meta/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vercel Cron (see vercel.json). Vercel sends Authorization: Bearer CRON_SECRET. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const results = await syncAll();
  return NextResponse.json({ synced: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length });
}
