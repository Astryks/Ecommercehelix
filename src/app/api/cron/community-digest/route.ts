import { NextResponse, type NextRequest } from "next/server";
import { groupPeople, markDigested, undigested } from "@/lib/fb-group/store";
import { digestEmail } from "@/lib/fb-group/digest";
import { groupUrl, signGroupLink } from "@/lib/fb-group/links";
import { baseUrl } from "@/lib/email/notify";
import { SUPPORT_EMAIL } from "@/lib/support";

export const dynamic = "force-dynamic";

/** Daily: email the owner the members to approve and to remove, only when something new is waiting. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const signing = process.env.AUTH_SECRET;
  if (!signing) return NextResponse.json({ error: "AUTH_SECRET missing" }, { status: 501 });
  const people = await groupPeople();
  const fresh = await undigested(people);
  if (!fresh.length) return NextResponse.json({ sent: false, reason: "nothing new" });
  const approve = people.filter((p) => p.status === "approve");
  const remove = people.filter((p) => p.status === "remove");
  const base = baseUrl();
  const mail = digestEmail({
    approve, remove, dashboardUrl: `${base}/admin/community`, groupMissing: !groupUrl(),
    link: (action, p) => `${base}/api/community/act?t=${encodeURIComponent(signGroupLink({ action, userId: p.userId }, signing))}`,
  });
  const key = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return NextResponse.json({ sent: false, reason: "email not set up" }, { status: 501 });
  const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: SUPPORT_EMAIL, subject: mail.subject, html: mail.html, text: mail.text }) });
  if (!res.ok) return NextResponse.json({ sent: false, reason: "send failed" }, { status: 502 });
  await markDigested(fresh);
  return NextResponse.json({ sent: true, approve: approve.length, remove: remove.length });
}
