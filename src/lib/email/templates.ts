/**
 * Helix emails: short, simple words, one button. Pure functions so they can be tested and previewed.
 * Marketing emails carry an unsubscribe link; transactional ones (receipts, payment problems, cancellation) do not need one.
 */
import { postalAddress } from "./postal";
import { SEQUENCE, lessonPath } from "./sequence";
import type { DailyMix } from "./daily-mix";

export type Email = { subject: string; html: string; text: string; marketing: boolean; kind: string };
/** postalAddress: footer address for marketing emails; defaults to BUSINESS_POSTAL_ADDRESS (null shows none). */
export type Ctx = { name?: string; baseUrl: string; unsubUrl?: string; prefsUrl?: string; postalAddress?: string | null };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hi = (name?: string) => (name?.trim() ? `Hi ${name.trim().split(/\s+/)[0]},` : "Hi,");

function layout(c: Ctx, o: { kind: string; marketing: boolean; subject: string; preheader: string; title: string; paras: string[]; list?: string[]; button?: { label: string; href: string }; after?: string[] }): Email {
  const p = (t: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:24px;color:#1A1718">${esc(t)}</p>`;
  const foot = o.marketing
    ? `You get this because you have a Helix account. <a href="${esc(c.unsubUrl ?? c.baseUrl + "/dashboard/settings/emails")}" style="color:#5A50D6">Unsubscribe in one click</a> or <a href="${esc(c.prefsUrl ?? c.baseUrl + "/dashboard/settings/emails")}" style="color:#5A50D6">choose your emails</a>. Questions? <a href="${esc(c.baseUrl + "/contact")}" style="color:#5A50D6">Contact us</a>.`
    : "This is an account email about your Helix plan, so it is always sent.";
  const addr = o.marketing ? (c.postalAddress !== undefined ? c.postalAddress : postalAddress()) : null;
  const html = `<!doctype html><html><body style="margin:0;background:#F2F1EC;font-family:Nunito,Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${esc(o.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F1EC;padding:24px 0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1.5px solid #1A1718;border-radius:16px">
<tr><td style="padding:20px 28px;border-bottom:1px solid #e5e3dc"><span style="font-size:18px;font-weight:700;color:#1A1718">E-commerce <span style="color:#5A50D6;font-style:italic">Helix</span></span></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-family:'Permanent Marker',Impact,sans-serif;font-size:26px;line-height:32px;text-transform:uppercase;color:#5A50D6">${esc(o.title)}</h1>
${p(hi(c.name))}${o.paras.map(p).join("")}
${o.list?.length ? `<ul style="margin:0 0 16px;padding-left:20px">${o.list.map((l) => `<li style="font-size:16px;line-height:24px;color:#1A1718;margin-bottom:6px">${esc(l)}</li>`).join("")}</ul>` : ""}
${o.button ? `<p style="margin:22px 0"><a href="${esc(o.button.href)}" style="display:inline-block;background:#5A50D6;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">${esc(o.button.label)}</a></p>` : ""}
${(o.after ?? []).map(p).join("")}
${p("The Helix team")}
</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #e5e3dc;font-size:12px;line-height:18px;color:#6b6760">${foot}<br>E-commerce Helix${addr ? `<br>${esc(addr)}` : ""}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [hi(c.name), "", ...o.paras.flatMap((x) => [x, ""]), ...(o.list ?? []).map((l) => `- ${l}`), o.list?.length ? "" : null, o.button ? `${o.button.label}: ${o.button.href}` : null, "", ...(o.after ?? []).flatMap((x) => [x, ""]), "The Helix team", "", o.marketing ? `Unsubscribe: ${c.unsubUrl ?? c.baseUrl + "/dashboard/settings/emails"}\nContact us: ${c.baseUrl}/contact\nE-commerce Helix${addr ? `, ${addr}` : ""}` : "This is an account email about your Helix plan."]
    .filter((x) => x !== null).join("\n");
  return { subject: o.subject, html, text, marketing: o.marketing, kind: o.kind };
}

export function welcomeEmail(c: Ctx): Email {
  return layout(c, { kind: "welcome", marketing: false, subject: "Welcome to Helix: your first small step", preheader: "One small step a day. Here is where to start.", title: "Welcome to Helix",
    paras: ["Thanks for joining. Helix shows your profit every day and gives you one small step to grow it.", "Here is how to start:"],
    list: ["Open Today and do the first task (about 5 minutes).", "Type in yesterday's numbers, or connect Shopify on a paid plan.", "Stuck? Press I'm lost on any screen."],
    button: { label: "Open Today", href: `${c.baseUrl}/dashboard` } });
}

/**
 * The daily email. With a sequence step it sends that day's email from SEQUENCE (one idea, one action, one lesson link);
 * without one it falls back to the plain task list.
 */
export function dailyTasksEmail(c: Ctx, tasks: { title: string; minutes: number }[], dateLabel: string, step?: number): Email {
  const s = step === undefined ? undefined : SEQUENCE[((step % SEQUENCE.length) + SEQUENCE.length) % SEQUENCE.length];
  if (s) {
    const extra = tasks.length ? [`Your Today list in Helix has ${tasks.length} more small steps waiting for ${dateLabel}.`] : [];
    return layout(c, { kind: "daily", marketing: true, subject: s.subject, preheader: s.preview, title: s.title,
      paras: [...s.paras, `Your one step today: ${s.action}`], button: { label: s.lesson.label, href: `${c.baseUrl}${lessonPath(s.lesson)}` }, after: extra });
  }
  const total = tasks.reduce((a, t) => a + t.minutes, 0);
  return layout(c, { kind: "daily", marketing: true, subject: `Today in Helix: ${tasks.length} small steps (${total} min)`, preheader: tasks[0]?.title ?? "Your steps for today", title: `Your steps for ${dateLabel}`,
    paras: ["Here is your list for today. Do them in order. Small steps add up."], list: tasks.map((t) => `${t.title} (${t.minutes} min)`), button: { label: "Start today's steps", href: `${c.baseUrl}/dashboard` } });
}

/** The daily email, built by composeDaily (daily-mix.ts): a varied subject and opener, the user's goal and numbers when known, four steps, one idea and a button to the next lesson. */
export function dailyEmail(c: Ctx, m: DailyMix): Email {
  const abs = (h: string) => (h.startsWith("http") ? h : `${c.baseUrl}${h}`);
  // Today's topic is the teaser (different every day); the button opens the right lesson. Steps and numbers follow.
  return layout(c, { kind: "daily", marketing: true, subject: m.subject, preheader: m.topic.hook, title: m.topic.intro,
    paras: [m.topic.hook, m.topic.takeaway, m.topic.teaserStep, ...(m.goalLine ? [m.goalLine] : []), ...(m.numbersLine ? [m.numbersLine] : []), `Your steps today (about ${m.minutes} min):`],
    list: m.tasks.map((t) => `${t.title} (${t.minutes} min)`), button: { label: m.topic.label, href: abs(m.topic.href) },
    after: [`Also: ${m.button.label}: ${abs(m.button.href)}`, `P.S. ${m.idea}`] });
}

export function eventEmail(c: Ctx, e: { name: string; daysTo: number; line: string; lesson: { label: string; href: string } }): Email {
  const when = e.daysTo <= 0 ? "is on now" : e.daysTo === 1 ? "is tomorrow" : `is ${e.daysTo} days away`;
  return layout(c, { kind: "event", marketing: true, subject: `${e.name} ${when}: your simple plan`, preheader: e.line, title: `${e.name} ${when}`,
    paras: [e.line, "Helix has added the right steps to your Today list, in the right order."], button: { label: e.lesson.label, href: e.lesson.href.startsWith("http") ? e.lesson.href : `${c.baseUrl}${e.lesson.href}` } });
}

export function communityJoinEmail(c: Ctx, groupUrl: string): Email {
  return layout(c, { kind: "community", marketing: false, subject: "You're in: join the Helix members group", preheader: "A private group for store owners who are building.", title: "Join our community",
    paras: ["Thanks for joining Helix. You can now join our private Facebook group for members.", "It is a friendly place to ask questions, share what works, share your numbers and cheer each other on.", "Tap the button, then press Join. We let new members in within a day."],
    button: { label: "Join the members group", href: groupUrl } });
}

export function receiptEmail(c: Ctx, r: { amount: string; plan: string; date: string; invoiceUrl?: string | null }): Email {
  return layout(c, { kind: "receipt", marketing: false, subject: `Payment received: ${r.amount} for Helix ${r.plan}`, preheader: "Thanks. Your plan is active.", title: "Payment received",
    paras: [`We got your payment of ${r.amount} for the ${r.plan} plan on ${r.date}. Thank you.`, "Cancel anytime, in one click. No lock-in."],
    button: r.invoiceUrl ? { label: "View your receipt", href: r.invoiceUrl } : { label: "Plan and billing", href: `${c.baseUrl}/dashboard/billing` } });
}

export function paymentFailedEmail(c: Ctx, r: { amount: string; updateUrl: string }): Email {
  return layout(c, { kind: "failed", marketing: false, subject: "Your Helix payment did not go through", preheader: "Update your card to keep your plan.", title: "Payment problem",
    paras: [`We could not take your payment of ${r.amount}. This happens when a card expires or the bank says no.`, "You keep your plan for now. Stripe will try the payment again automatically."],
    button: { label: "Update my card", href: r.updateUrl }, after: ["Questions? Just reply to this email."] });
}

export function cancelEmail(c: Ctx, r: { until: string }): Email {
  return layout(c, { kind: "cancel", marketing: false, subject: "Thank you for being a Helix member", preheader: `You keep everything until ${r.until}.`, title: "Thank you for being a member",
    paras: [`Your plan is cancelled. You keep all paid features until ${r.until}. After that you move to the Free plan and your numbers and lessons stay.`, "Changed your mind? You can come back any time, in one click."],
    button: { label: "Resubscribe", href: `${c.baseUrl}/dashboard/billing` } });
}

export function winbackEmail(c: Ctx): Email {
  return layout(c, { kind: "winback", marketing: true, subject: "We saved your spot in Helix", preheader: "Your numbers and progress are still here.", title: "Your spot is still here",
    paras: ["It has been two weeks since your paid plan ended. Your numbers, lessons and progress are all still saved.", "If you want daily steps, syncing and Do it for me again, come back in one click. Cancel anytime, in one click. No lock-in."],
    button: { label: "Come back to Helix", href: `${c.baseUrl}/dashboard/billing` } });
}

export function scorecardHtmlEmail(c: Ctx, subject: string, text: string): Email {
  const lines = text.split("\n").filter((l) => l && !/^Hi\b/.test(l) && !/^Open Helix:/.test(l) && !/^You get this email/.test(l));
  return layout(c, { kind: "scorecard", marketing: true, subject, preheader: lines[1] ?? subject, title: "Your week in Helix", paras: lines, button: { label: "Open Helix", href: `${c.baseUrl}/dashboard` } });
}

export function alertsEmail(c: Ctx, alerts: { title: string; why: string }[]): Email {
  return layout(c, { kind: "alerts", marketing: true, subject: alerts.length === 1 ? `Heads-up: ${alerts[0].title}` : `Heads-up: ${alerts.length} things need you`, preheader: alerts[0]?.why ?? "", title: "A quick heads-up",
    paras: ["Helix spotted something in your numbers. It is on your Today list too."], list: alerts.map((a) => `${a.title}. ${a.why}`), button: { label: "Open Today", href: `${c.baseUrl}/dashboard` } });
}
