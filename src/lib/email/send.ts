import "server-only";
import type { Email } from "./templates";

/**
 * Send through Resend (RESEND_API_KEY, or the existing AUTH_RESEND_KEY) from EMAIL_FROM.
 * Marketing emails get List-Unsubscribe and List-Unsubscribe-Post (one click, RFC 8058).
 * Returns false when email is not set up or the send failed.
 */
export async function sendEmail(to: string, e: Email, unsubUrl?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || !to) return false;
  const headers: Record<string, string> = {};
  if (e.marketing && unsubUrl) {
    headers["List-Unsubscribe"] = `<${unsubUrl}>, <mailto:support@astryks.com?subject=unsubscribe>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: e.subject, html: e.html, text: e.text, reply_to: "support@astryks.com", headers }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
