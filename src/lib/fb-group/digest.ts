/** The owner's daily "To approve / To remove" email. Pure: give it the people and a link maker. */
export type DigestPerson = { userId: string; name: string; email: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function digestEmail(o: { approve: DigestPerson[]; remove: DigestPerson[]; link: (action: "approve" | "remove", p: DigestPerson) => string; dashboardUrl: string; groupMissing?: boolean }) {
  const n = o.approve.length + o.remove.length;
  const subject = `Members group: ${o.approve.length} to approve, ${o.remove.length} to remove`;
  const btn = (href: string, label: string, color: string) => `<a href="${esc(href)}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:8px 14px;border-radius:9px">${label}</a>`;
  const rows = (list: DigestPerson[], action: "approve" | "remove") => list.length
    ? list.map((p) => `<tr><td style="padding:10px 0;border-top:1px solid #e5e3dc"><div style="font-size:16px;font-weight:700;color:#1A1718">${esc(p.name)}</div><div style="font-size:14px;color:#55514c">${esc(p.email)}</div></td><td align="right" style="padding:10px 0;border-top:1px solid #e5e3dc;white-space:nowrap">${action === "approve" ? btn(o.link("approve", p), "Approve", "#5A50D6") : btn(o.link("remove", p), "Remove", "#b4372f")}</td></tr>`).join("")
    : `<tr><td style="padding:10px 0;border-top:1px solid #e5e3dc;font-size:14px;color:#6b6760">Nobody right now.</td></tr>`;
  const section = (title: string, list: DigestPerson[], action: "approve" | "remove", help: string) =>
    `<h2 style="margin:24px 0 4px;font-size:18px;color:#1A1718">${title} (${list.length})</h2><p style="margin:0 0 8px;font-size:14px;color:#55514c">${help}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows(list, action)}</table>`;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#F2F1EC;font-family:Nunito,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F1EC;padding:24px 0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1.5px solid #1A1718;border-radius:16px">
<tr><td style="padding:20px 28px;border-bottom:1px solid #e5e3dc"><span style="font-size:18px;font-weight:700;color:#1A1718">E-commerce <span style="color:#5A50D6;font-style:italic">Helix</span></span></td></tr>
<tr><td style="padding:24px 28px">
<h1 style="margin:0 0 8px;font-family:'Permanent Marker',Impact,sans-serif;font-size:24px;line-height:30px;text-transform:uppercase;color:#5A50D6">Members group: ${n} to do</h1>
<p style="margin:0;font-size:15px;line-height:22px;color:#1A1718">Each button marks it done in Helix, then opens the right Facebook page. Links work for 7 days.</p>
${o.groupMissing ? `<p style="margin:12px 0 0;padding:10px 12px;background:#fff6dd;border-radius:10px;font-size:14px;color:#6b4e00">The group link (FB_GROUP_URL) is not set, so new members did not get a join email.</p>` : ""}
${section("To approve", o.approve, "approve", "New paying members. Approve their join request in the group.")}
${section("To remove", o.remove, "remove", "Members who cancelled. Remove them from the group.")}
<p style="margin:24px 0 0">${btn(o.dashboardUrl, "Open dashboard", "#1A1718")}</p>
</td></tr>
<tr><td style="padding:14px 28px;border-top:1px solid #e5e3dc;font-size:12px;color:#6b6760">Sent only on days with something to do. E-commerce Helix</td></tr>
</table></td></tr></table></body></html>`;
  const line = (p: DigestPerson, a: "approve" | "remove") => `- ${p.name} <${p.email}>  ${a === "approve" ? "Approve" : "Remove"}: ${o.link(a, p)}`;
  const text = [`Members group: ${n} to do`, "", o.groupMissing ? "The group link (FB_GROUP_URL) is not set, so new members did not get a join email.\n" : null,
    `To approve (${o.approve.length})`, ...(o.approve.length ? o.approve.map((p) => line(p, "approve")) : ["Nobody right now."]), "",
    `To remove (${o.remove.length})`, ...(o.remove.length ? o.remove.map((p) => line(p, "remove")) : ["Nobody right now."]), "", `Open dashboard: ${o.dashboardUrl}`].filter((x) => x !== null).join("\n");
  return { subject, html, text };
}
