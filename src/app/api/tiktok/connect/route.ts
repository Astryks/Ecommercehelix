import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { appUrl } from "@/lib/meta/config";
import { tiktokAuthUrl, tiktokMode } from "@/lib/tiktok/config";

export const dynamic = "force-dynamic";

/** Starts TikTok For Business auth. Off (redirects with tiktok=soon) unless TIKTOK_ADS=1 and the app keys are set. */
export async function GET(req: NextRequest) {
  const origin = appUrl(req.nextUrl.origin);
  const u = await requireUser("/dashboard/connect");
  if (tiktokMode() !== "live") return NextResponse.redirect(`${origin}/dashboard/connect?err=tiktok_not_configured`);
  if (PLAN_RANK[(await getAccount(u.id)).plan] < PLAN_RANK.starter) return NextResponse.redirect(`${origin}/dashboard/billing?need=starter&for=tiktok`);
  const state = randomBytes(24).toString("base64url");
  const res = NextResponse.redirect(tiktokAuthUrl(process.env.TIKTOK_APP_ID!, `${origin}/api/tiktok/callback`, state));
  res.cookies.set("helix_tt_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/tiktok", maxAge: 600 });
  return res;
}
