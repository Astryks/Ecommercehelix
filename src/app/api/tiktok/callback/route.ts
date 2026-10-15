import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { appUrl } from "@/lib/meta/config";

export const dynamic = "force-dynamic";

/**
 * TikTok sign-in return. The state is checked; storing the token and the daily spend sync are the next build step
 * (they need a TikTok app approved for the Reporting API). Until then TikTok spend comes in by sheet, CSV or by hand.
 */
export async function GET(req: NextRequest) {
  await requireUser("/dashboard/connect");
  const base = appUrl(req.nextUrl.origin);
  const ok = req.nextUrl.searchParams.get("state") && req.nextUrl.searchParams.get("state") === req.cookies.get("tt_state")?.value && req.nextUrl.searchParams.get("auth_code");
  const res = NextResponse.redirect(`${base}/dashboard/connect?${ok ? "ok=tiktok_pending" : "err=tiktok_state"}`);
  res.cookies.delete("tt_state");
  return res;
}
