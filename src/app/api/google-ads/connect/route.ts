import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { appUrl } from "@/lib/meta/config";
import { googleAdsMode, googleScopes } from "@/lib/google-ads/config";

export const dynamic = "force-dynamic";

/** Starts Google sign-in for the Google Ads permission (offline access so the daily sync works). ?ga4=1 is the optional "Connect GA4" step: it adds read-only Analytics on top of what was granted. */
export async function GET(req: NextRequest) {
  const origin = appUrl(req.nextUrl.origin);
  const u = await requireUser("/dashboard/integrations");
  const ga4 = req.nextUrl.searchParams.get("ga4") === "1";
  if (googleAdsMode() !== "live") return NextResponse.redirect(`${origin}/dashboard/integrations?${ga4 ? "ga4" : "google"}=soon`);
  if (PLAN_RANK[(await getAccount(u.id)).plan] < PLAN_RANK.starter) return NextResponse.redirect(`${origin}/dashboard/billing?need=starter&for=google`);
  const state = randomBytes(24).toString("base64url");
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!, redirect_uri: `${origin}/api/google-ads/callback`, response_type: "code",
    scope: googleScopes(ga4).join(" "), access_type: "offline", prompt: "consent", include_granted_scopes: ga4 ? "true" : "false", state,
  });
  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${q}`);
  res.cookies.set("helix_gads_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/google-ads", maxAge: 600 });
  return res;
}
