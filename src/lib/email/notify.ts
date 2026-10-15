import "server-only";
import { appUrl } from "../meta/config";
import type { PlanId } from "../plans";
import type { Email } from "./templates";
import { sendEmail } from "./send";
import { allowed, claimSend, getPrefs, unclaimSend } from "./prefs";

export const baseUrl = () => appUrl("https://ecommercehelix.com");
export const unsubLink = (token: string, kind: string) => `${baseUrl()}/api/email/unsubscribe?t=${encodeURIComponent(token)}&k=${kind}`;

/**
 * Send one email to one user, once per key. Marketing kinds respect preferences and carry one-click unsubscribe.
 * `build` gets the unsubscribe and preferences links so the footer matches the headers.
 */
export async function notify(u: { userId: string; email: string; plan: PlanId }, kind: string, key: string, build: (links: { unsubUrl: string; prefsUrl: string; baseUrl: string }) => Email | null): Promise<"sent" | "skipped" | "failed" | "off"> {
  if (!u.email) return "skipped";
  const prefs = await getPrefs(u.userId);
  if (!allowed(prefs, u.plan, kind)) return "off";
  const links = { unsubUrl: unsubLink(prefs.unsubToken, kind), prefsUrl: `${baseUrl()}/dashboard/settings/emails`, baseUrl: baseUrl() };
  const mail = build(links);
  if (!mail) return "skipped";
  if (!(await claimSend(u.userId, kind, key))) return "skipped";
  const ok = await sendEmail(u.email, mail, mail.marketing ? links.unsubUrl : undefined);
  if (!ok) await unclaimSend(u.userId, kind, key);
  return ok ? "sent" : "failed";
}
