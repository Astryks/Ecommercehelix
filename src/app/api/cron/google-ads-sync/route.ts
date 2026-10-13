import { NextResponse, type NextRequest } from "next/server";
import { syncAllGoogleAds } from "@/lib/google-ads/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const r = await syncAllGoogleAds();
  return NextResponse.json({ synced: r.filter((x) => x.ok).length, failed: r.filter((x) => !x.ok).length });
}
