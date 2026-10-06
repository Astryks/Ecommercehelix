import { prettyDay } from "./dates";
import { nextTasks, type SeasonAlert } from "./seasons";

/**
 * Seasonal nudges: the same alert you see on Today, sent as an email and a push
 * notification. Building the message is pure (and tested). Delivery is a stub
 * unless NUDGES_LIVE=1 and an email key are set, so nothing is sent by accident.
 */

export type Nudge = {
  planKey: string;
  email: { subject: string; text: string };
  push: { title: string; body: string; url: string };
};

export function buildNudge(alert: SeasonAlert, opts: { name?: string; planAdded: boolean; done: Set<string>; baseUrl: string }): Nudge | null {
  const todo = nextTasks(alert, opts.done, 3);
  if (opts.planAdded && todo.length === 0) return null; // plan finished, stay quiet
  const url = `${opts.baseUrl}/dashboard#season`;
  const hi = opts.name ? `Hi ${opts.name.split(" ")[0]},` : "Hi,";
  const lines = opts.planAdded
    ? ["Your next prep steps:", ...todo.map((t, i) => `${i + 1}. ${t.title} (${t.overdue ? "due now" : "due " + prettyDay(t.due)})`)]
    : ["Helix has a step-by-step prep plan ready. One click adds it to your Today page, with a due date for each step."];
  return {
    planKey: alert.key,
    email: {
      subject: alert.headline.split(":")[0].replace(/\.$/, "") + (alert.daysTo > 0 ? ` (${alert.daysTo} days to go)` : ""),
      text: [hi, "", alert.headline, "", alert.why, "", ...lines, "", `Open Helix: ${url}`].join("\n"),
    },
    push: {
      title: `${alert.name}: ${alert.daysTo > 0 ? alert.daysTo + " days to go" : "it's on"}`,
      body: opts.planAdded && todo[0] ? `Next: ${todo[0].title}` : alert.headline,
      url,
    },
  };
}

export type Delivery = { email: "sent" | "stub" | "failed" | "skipped"; push: "stub" };

/** Send a nudge. Email goes out only when NUDGES_LIVE=1 and AUTH_RESEND_KEY + EMAIL_FROM are set. Push is a stub. */
export async function deliverNudge(to: string, n: Nudge): Promise<Delivery> {
  const key = process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  let email: Delivery["email"] = "stub";
  if (!to) email = "skipped";
  else if (process.env.NUDGES_LIVE === "1" && key && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: n.email.subject, text: n.email.text }),
    }).catch(() => null);
    email = res?.ok ? "sent" : "failed";
  } else {
    console.log(`[nudge stub] email to ${to}: ${n.email.subject}`);
  }
  // Push needs a service worker and stored subscriptions (or a mobile app). Until then, log it.
  console.log(`[nudge stub] push: ${n.push.title} | ${n.push.body}`);
  return { email, push: "stub" };
}
