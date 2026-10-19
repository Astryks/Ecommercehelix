"use server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma, hasDb } from "@/lib/db";
import { ensureUser } from "@/lib/repo";
import { hashIp, overLimit } from "@/lib/limits";
import { deliverContact, validateContact, type ContactResult } from "@/lib/contact";

export async function sendContact(_prev: ContactResult | null, f: FormData): Promise<ContactResult> {
  const get = (k: string) => String(f.get(k) ?? "").trim();
  // Honeypot: real people never fill this hidden field. Pretend success.
  if (get("website")) return { ok: true };
  const input = { name: get("name"), email: get("email"), topic: get("topic"), message: get("message") };
  const err = validateContact(input);
  if (err) return { ok: false, error: err, values: input };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  // Lasting limit for everyone (works across servers): 5 messages per 10 minutes per hashed IP and per email.
  const tenMin = 10 * 60_000;
  const limited = (await overLimit(`contact:ip:${hashIp(ip)}`, 5, tenMin).catch(() => false)) || (await overLimit(`contact:em:${hashIp(input.email)}`, 5, tenMin).catch(() => false));
  if (limited) return { ok: false, error: "You have sent a few messages already. Please wait a few minutes and try again.", values: input };
  let account: { id: string; plan: string } | undefined;
  const s = await auth().catch(() => null);
  if (s?.user?.id) {
    const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "").catch(() => s.user!.id!);
    let plan = "FREE";
    if (hasDb) {
      const sub = await prisma.subscription.findUnique({ where: { userId: id }, select: { plan: true } }).catch(() => null);
      if (sub) plan = String(sub.plan);
    }
    account = { id, plan };
    // Lasting limit for members (works across servers): 5 messages an hour, kept in the audit log.
    if (hasDb) {
      const recent = await prisma.auditLog.count({ where: { userId: id, action: "contact.send", createdAt: { gte: new Date(Date.now() - 3_600_000) } } }).catch(() => 0);
      if (recent >= 5) return { ok: false, error: "You have sent a few messages already. Please wait a little and try again.", values: input };
    }
  }
  const r = await deliverContact(input, account);
  if (r.ok && account && hasDb) await prisma.auditLog.create({ data: { userId: account.id, actor: "user", action: "contact.send", target: "support", outcome: "ok" } }).catch(() => null);
  return r.ok ? r : { ...r, values: input };
}
