import "server-only";

export const CONTACT_TOPICS = ["General question", "Billing and plans", "Technical problem", "Connecting my store or ads", "Feedback or idea", "Privacy or data"] as const;

export type ContactInput = { name: string; email: string; topic: string; message: string; website?: string };
export type ContactResult = { ok: boolean; error?: string; id?: string };

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

/** Server-side validation. Returns an error message or null. */
export function validateContact(i: ContactInput): string | null {
  if (!i.name || i.name.length > 100) return "Please add your name (up to 100 characters).";
  if (!EMAIL_RE.test(i.email) || i.email.length > 200) return "Please add a valid email address so we can reply.";
  if (!(CONTACT_TOPICS as readonly string[]).includes(i.topic)) return "Please pick a topic.";
  if (i.message.length < 10) return "Please write a little more (at least 10 characters).";
  if (i.message.length > 5000) return "Please keep your message under 5,000 characters.";
  return null;
}

// Best-effort rate limit per key (IP and email): 5 per 10 minutes per server instance.
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) { hits.set(key, list); return true; }
  list.push(now); hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

async function resend(body: Record<string, unknown>): Promise<{ ok: boolean; id?: string }> {
  const key = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return { ok: false };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, ...body }),
    });
    const j = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: res.ok, id: j.id };
  } catch {
    return { ok: false };
  }
}

const clean = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/** Email the message to support (CONTACT_TO), reply-to the sender, then send the sender a short confirmation. */
export async function deliverContact(i: ContactInput, account?: { id: string; plan: string }): Promise<ContactResult> {
  const to = process.env.CONTACT_TO || "support@astryks.com";
  const lines = [
    `From: ${i.name} <${i.email}>`,
    `Topic: ${i.topic}`,
    account ? `Account id: ${account.id}\nPlan: ${account.plan}` : "Account: not signed in (public contact page)",
    "",
    i.message,
  ];
  const sent = await resend({ to, reply_to: i.email, subject: `[Helix contact] ${clean(i.topic)}: ${clean(i.name).slice(0, 60)}`, text: lines.join("\n") });
  if (!sent.ok) return { ok: false, error: "Sorry, your message could not be sent right now. Please try again in a few minutes." };
  console.log("contact: accepted by Resend", sent.id);
  await resend({
    to: i.email,
    reply_to: to,
    subject: "We got your message - E-commerce Helix",
    text: `Hi ${clean(i.name)},\n\nThanks for getting in touch. A real person will reply, usually within one business day.\n\nYour message (${i.topic}):\n${i.message}\n\nE-commerce Helix`,
  });
  return { ok: true, id: sent.id };
}
