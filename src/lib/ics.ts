import { addDays } from "./dates";
import { COUNTRIES, type Country } from "./seasons";
import { calendarWithAdmin } from "./business";

/** iCalendar (RFC 5545) export of the key retail dates, with a "start prep" entry for dates that have a prep plan. */

const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold lines longer than 75 octets, as the spec requires. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > (parts.length ? 74 : 75)) { parts.push(cur); cur = ""; }
    cur += ch;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

const d8 = (iso: string) => iso.replace(/-/g, "");

export function buildIcs(today: string, country: Country, opts: { baseUrl: string; stamp?: string } = { baseUrl: "" }): string {
  const name = COUNTRIES.find((c) => c.id === country)?.name ?? country;
  const stamp = opts.stamp ?? new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const L = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ecommerce Helix//Key retail dates//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(`Helix key retail dates (${name})`)}`, "REFRESH-INTERVAL;VALUE=DURATION:P1D", "X-PUBLISHED-TTL:P1D",
  ];
  const ev = (uid: string, date: string, summary: string, desc: string) => {
    L.push("BEGIN:VEVENT", `UID:${uid}@ecommercehelix.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d8(date)}`, `DTEND;VALUE=DATE:${d8(addDays(date, 1))}`,
      `SUMMARY:${esc(summary)}`, `DESCRIPTION:${esc(desc)}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  };
  for (const e of calendarWithAdmin(today, country, 400)) {
    ev(`${country}-${e.key}`, e.date, e.name, e.note + (e.approx ? ` (Date is approximate: ${e.approx}.)` : ""));
    if (e.prepFrom && e.planSteps && e.prepFrom >= today)
      ev(`${country}-${e.key}-prep`, e.prepFrom, `Start prep: ${e.name}`, `Helix starts your ${e.name} prep plan today (${e.planSteps} steps). Open Today: ${opts.baseUrl}/dashboard#season`);
  }
  L.push("END:VCALENDAR");
  return L.map(fold).join("\r\n") + "\r\n";
}
