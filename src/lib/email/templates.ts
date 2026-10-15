/**
 * Helix emails: short, simple words, one button. Pure functions so they can be tested and previewed.
 * Marketing emails carry an unsubscribe link; transactional ones (receipts, payment problems, cancellation) do not need one.
 */
export type Email = { subject: string; html: string; text: string; marketing: boolean; kind: string };
export type Ctx = { name?: string; baseUrl: string; unsubUrl?: string; prefsUrl?: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hi = (name?: string) => (name?.trim() ? `Hi ${name.trim().split(/\s+/)[0]},` : "Hi,");

function layout(c: Ctx, o: { kind: string; marketing: boolean; subject: string; preheader: string; title: string; paras: string[]; list?: string[]; button?: { label: string; href: string }; after?: string[] }): Email {
  const p = (t: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:24px;color:#1A1718">${esc(t)}</p>`;
  const foot = o.marketing
    ? `You get this because you have a Helix account. <a href="${esc(c.unsubUrl ?? c.baseUrl + "/dashboard/settings/emails")}" style="color:#5A50D6">Unsubscribe in one click</a> or <a href="${esc(c.prefsUrl ?? c.baseUrl + "/dashboard/settings/emails")}" style="color:#5A50D6">choose your emails</a>.`
    : "This is an account email about your Helix plan, so it is always sent.";
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
<tr><td style="padding:16px 28px;border-top:1px solid #e5e3dc;font-size:12px;line-height:18px;color:#6b6760">${foot}<br>Astryks, NSW, Australia</td></tr>
</table></td></tr></table></body></html>`;
  const text = [hi(c.name), "", ...o.paras.flatMap((x) => [x, ""]), ...(o.list ?? []).map((l) => `- ${l}`), o.list?.length ? "" : null, o.button ? `${o.button.label}: ${o.button.href}` : null, "", ...(o.after ?? []).flatMap((x) => [x, ""]), "The Helix team", "", o.marketing ? `Unsubscribe: ${c.unsubUrl ?? c.baseUrl + "/dashboard/settings/emails"}` : "This is an account email about your Helix plan."]
    .filter((x) => x !== null).join("\n");
  return { subject: o.subject, html, text, marketing: o.marketing, kind: o.kind };
}

export function welcomeEmail(c: Ctx): Email {
  return layout(c, { kind: "welcome", marketing: false, subject: "Welcome to Helix: your first small step", preheader: "One small step a day. Here is where to start.", title: "Welcome to Helix",
    paras: ["Thanks for joining. Helix shows your profit every day and gives you one small step to grow it.", "Here is how to start:"],
    list: ["Open Today and do the first task (about 5 minutes).", "Connect Shopify, or type in yesterday's numbers.", "Stuck? Press I'm lost on any screen."],
    button: { label: "Open Today", href: `${c.baseUrl}/dashboard` } });
}

export function dailyTasksEmail(c: Ctx, tasks: { title: string; minutes: number }[], dateLabel: string): Email {
  const total = tasks.reduce((a, t) => a + t.minutes, 0);
  return layout(c, { kind: "daily", marketing: true, subject: `Today in Helix: ${tasks.length} small steps (${total} min)`, preheader: tasks[0]?.title ?? "Your steps for today", title: `Your steps for ${dateLabel}`,
    paras: ["Here is your list for today. Do them in order. Small steps add up."], list: tasks.map((t) => `${t.title} (${t.minutes} min)`), button: { label: "Start today's steps", href: `${c.baseUrl}/dashboard` } });
}

export function eventEmail(c: Ctx, e: { name: string; daysTo: number; line: string; lesson: { label: string; href: string } }): Email {
  const when = e.daysTo <= 0 ? "is on now" : e.daysTo === 1 ? "is tomorrow" : `is ${e.daysTo} days away`;
  return layout(c, { kind: "event", marketing: true, subject: `${e.name} ${when}: your simple plan`, preheader: e.line, title: `${e.name} ${when}`,
    paras: [e.line, "Helix has added the right steps to your Today list, in the right order."], button: { label: e.lesson.label, href: e.lesson.href.startsWith("http") ? e.lesson.href : `${c.baseUrl}${e.lesson.href}` } });
}

export function receiptEmail(c: Ctx, r: { amount: string; plan: string; date: string; invoiceUrl?: string | null }): Email {
  return layout(c, { kind: "receipt", marketing: false, subject: `Payment received: ${r.amount} for Helix ${r.plan}`, preheader: "Thanks. Your plan is active.", title: "Payment received",
    paras: [`We got your payment of ${r.amount} for the ${r.plan} plan on ${r.date}. Thank you.`, "Cancel anytime, in one click. No lock-in."],
    button: r.invoiceUrl ? { label: "View your receipt", href: r.invoiceUrl } : { label: "Plan and billing", href: `${c.baseUrl}/dashboard/billing` } });
}

export function paymentFailedEmail(c: Ctx, r: { amount: string; updateUrl: string }): Email {
  return layout(c, { kind: "failed", marketing: false, subject: "Your Helix payment did not go through", preheader: "Update your card to keep your plan.", title: "Payment problem",
    paras: [`We could not take your payment of ${r.amount}. This happens when a card expires or the bank says no.`, "You keep your plan for now. Stripe will try again over the next few days."],
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
