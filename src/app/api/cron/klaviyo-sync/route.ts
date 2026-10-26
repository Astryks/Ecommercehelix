import { NextResponse, type NextRequest } from "next/server";
import { syncAllKlaviyo } from "@/lib/klaviyo/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vercel Cron (see vercel.json). Yesterday's Klaviyo email totals for every connected store. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const r = await syncAllKlaviyo();
  return NextResponse.json({ synced: r.filter((x) => x.ok).length, failed: r.filter((x) => !x.ok).length });
}
