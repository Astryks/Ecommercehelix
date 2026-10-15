import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { requireUser } from "@/lib/session";
import { appUrl } from "@/lib/meta/config";

export const dynamic = "force-dynamic";

/** TikTok Ads sign-in. Needs TIKTOK_APP_ID and TIKTOK_APP_SECRET (TikTok for Business developer app). */
export async function GET(req: NextRequest) {
  await requireUser("/dashboard/connect");
  const base = appUrl(req.nextUrl.origin);
  const id = process.env.TIKTOK_APP_ID;
  if (!id || !process.env.TIKTOK_APP_SECRET) return NextResponse.redirect(`${base}/dashboard/connect?err=tiktok_not_configured`);
  const state = randomBytes(16).toString("hex");
  const url = new URL("https://business-api.tiktok.com/portal/auth");
  url.searchParams.set("app_id", id);
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", `${base}/api/tiktok/callback`);
  const res = NextResponse.redirect(url.toString());
  res.cookies.set("tt_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
