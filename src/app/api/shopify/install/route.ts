import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { appUrl } from "@/lib/meta/config";
import { SHOPIFY_SCOPES, normaliseShop, shopifyMode, verifyQueryHmac } from "@/lib/shopify/config";

export const dynamic = "force-dynamic";

/** Starts Shopify OAuth (authorization code grant, offline token). Works from the Helix form (?shop=) and from Shopify's install link (shop + hmac). */
export async function GET(req: NextRequest) {
  const origin = appUrl(req.nextUrl.origin);
  const sp = req.nextUrl.searchParams;
  if (shopifyMode() !== "live") return NextResponse.redirect(`${origin}/dashboard/integrations?shopify=soon`);
  // A link from Shopify carries an hmac; reject it if it does not verify.
  if (sp.get("hmac") && !verifyQueryHmac(sp, process.env.SHOPIFY_API_SECRET!)) return NextResponse.redirect(`${origin}/dashboard/integrations?error=shopify_state`);
  const shop = normaliseShop(sp.get("shop"));
  const u = await requireUser(`/api/shopify/install${shop ? `?shop=${shop}` : ""}`);
  if (!shop) return NextResponse.redirect(`${origin}/dashboard/integrations?error=shopify_shop`);
  if (PLAN_RANK[(await getAccount(u.id)).plan] < PLAN_RANK.starter) return NextResponse.redirect(`${origin}/dashboard/billing?need=starter&for=shopify`);
  const state = randomBytes(24).toString("base64url");
  const q = new URLSearchParams({ client_id: process.env.SHOPIFY_API_KEY!, scope: SHOPIFY_SCOPES.join(","), redirect_uri: `${origin}/api/shopify/callback`, state });
  const res = NextResponse.redirect(`https://${shop}/admin/oauth/authorize?${q}`);
  res.cookies.set("helix_shopify_state", `${state}.${shop}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/shopify", maxAge: 600 });
  return res;
}
