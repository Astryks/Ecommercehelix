import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { DIALOG_URL, META_SCOPES, appUrl, metaMode, redirectUri } from "@/lib/meta/config";

export const dynamic = "force-dynamic";

/** Starts Facebook Login for Business. A random state is kept in an httpOnly cookie and checked on return. */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  await requireUser("/dashboard/integrations");
  const mode = metaMode();
  if (mode === "off") return NextResponse.redirect(`${appUrl(origin)}/dashboard/integrations?error=not_configured`);
  const state = randomBytes(24).toString("base64url");
  let target: string;
  if (mode === "mock") {
    target = `${appUrl(origin)}/api/meta/callback?code=mock-code&state=${state}`;
  } else {
    const q = new URLSearchParams({ client_id: process.env.META_APP_ID!, redirect_uri: redirectUri(origin), state, response_type: "code" });
    // Facebook Login for Business: the configuration holds the permissions and token type.
    if (process.env.META_CONFIG_ID) q.set("config_id", process.env.META_CONFIG_ID);
    else q.set("scope", META_SCOPES.join(","));
    target = `${DIALOG_URL}?${q}`;
  }
  const res = NextResponse.redirect(target);
  res.cookies.set("helix_meta_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/meta", maxAge: 600 });
  return res;
}
