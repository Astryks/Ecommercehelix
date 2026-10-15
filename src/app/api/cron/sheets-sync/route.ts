import { NextResponse, type NextRequest } from "next/server";
import { syncAllSheets } from "@/lib/sheets/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vercel Cron (see vercel.json). Re-imports every linked Google Sheet once a day. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const r = await syncAllSheets();
  return NextResponse.json({ synced: r.filter((x) => x.ok).length, failed: r.filter((x) => !x.ok).length });
}
