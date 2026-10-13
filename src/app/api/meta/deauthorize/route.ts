import { NextResponse } from "next/server";
import { parseSignedRequest } from "@/lib/meta/signed-request";
import { clearRevokedConnection } from "@/lib/meta/service";
import { usersForFbUser } from "@/lib/meta/store";

export const dynamic = "force-dynamic";

/** Meta deauthorize callback: the user removed Helix in Facebook, so clear their stored connection. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""), process.env.META_APP_SECRET ?? "");
  if (!data?.user_id) return NextResponse.json({ error: "invalid signed_request" }, { status: 400 });
  const users = await usersForFbUser(String(data.user_id));
  for (const userId of users) await clearRevokedConnection(userId, "meta", "deauthorize callback");
  return NextResponse.json({ ok: true, cleared: users.length });
}
