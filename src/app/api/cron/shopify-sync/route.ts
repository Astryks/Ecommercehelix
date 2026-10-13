import { NextResponse, type NextRequest } from "next/server";
import { syncAllShopify } from "@/lib/shopify/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vercel Cron (see vercel.json). Re-syncs the last 7 days so late refunds are picked up. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const r = await syncAllShopify();
  return NextResponse.json({ synced: r.filter((x) => x.ok).length, failed: r.filter((x) => !x.ok).length });
}
