import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/meta/config";
import { parseSignedRequest } from "@/lib/meta/signed-request";
import { deleteMetaData, logAudit, usersForFbUser } from "@/lib/meta/store";

export const dynamic = "force-dynamic";

/** Meta data deletion callback: verifies the signed request, deletes the Meta data Helix holds for that Facebook user. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""), process.env.META_APP_SECRET ?? "");
  if (!data?.user_id) return NextResponse.json({ error: "invalid signed_request" }, { status: 400 });
  const code = randomBytes(8).toString("hex");
  for (const userId of await usersForFbUser(String(data.user_id))) {
    await deleteMetaData(userId);
    await logAudit(userId, { actor: "meta", action: "meta.data_deletion", target: "meta", outcome: "ok", detail: { code } });
  }
  return NextResponse.json({ url: `${appUrl(new URL(req.url).origin)}/data-deletion?code=${code}`, confirmation_code: code });
}
