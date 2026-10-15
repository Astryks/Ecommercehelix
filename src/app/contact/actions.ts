"use server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma, hasDb } from "@/lib/db";
import { ensureUser } from "@/lib/repo";
import { deliverContact, rateLimited, validateContact, type ContactResult } from "@/lib/contact";

export async function sendContact(_prev: ContactResult | null, f: FormData): Promise<ContactResult> {
  const get = (k: string) => String(f.get(k) ?? "").trim();
  // Honeypot: real people never fill this hidden field. Pretend success.
  if (get("website")) return { ok: true };
  const input = { name: get("name"), email: get("email"), topic: get("topic"), message: get("message") };
  const err = validateContact(input);
  if (err) return { ok: false, error: err };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(`ip:${ip}`) || rateLimited(`em:${input.email.toLowerCase()}`)) return { ok: false, error: "You have sent a few messages already. Please wait a few minutes and try again." };
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
  }
  return deliverContact(input, account);
}
