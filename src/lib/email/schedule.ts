/** Which automated emails a user is due, at a given moment. Pure, so the date rules are tested. */
import { featuredEvent } from "../season-calendar";
import { siteContent } from "../site-content";
import { seasonTasksFor } from "../season-tasks";
import { addDays, isoDay } from "../dates";
import { sequenceIndex } from "./sequence";

export const localHour = (now: Date, tz: string) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }).format(now));
/** Default zone per country, used when the saved zone is still the Sydney default but the store is elsewhere (so a US store does not get its "morning" email mid-afternoon). */
const COUNTRY_ZONE: Record<string, string> = { NZ: "Pacific/Auckland", US: "America/New_York", CA: "America/Toronto", GB: "Europe/London", UK: "Europe/London", IE: "Europe/Dublin", DE: "Europe/Berlin", FR: "Europe/Paris", NL: "Europe/Amsterdam", SG: "Asia/Singapore", IN: "Asia/Kolkata", AE: "Asia/Dubai" };
export function zoneFor(saved: string | null | undefined, country: string): string {
  if (saved && saved !== "Australia/Sydney") return saved;
  return COUNTRY_ZONE[(country || "").toUpperCase()] ?? saved ?? "Australia/Sydney";
}
export const EVENT_LEADS = [28, 14, 7, 1, 0];
export const WINBACK_DAYS = 14;

export type Due =
  | { kind: "welcome"; key: string }
  | { kind: "daily"; key: string; date: string; tasks: { title: string; minutes: number }[]; step: number; season: string | null }
  | { kind: "event"; key: string; name: string; daysTo: number; line: string; lesson: { label: string; href: string } }
  | { kind: "winback"; key: string };

export type Person = { createdAt: Date; isDemo: boolean; country: string; timezone: string; status: string; subscriptionId: string | null; currentPeriodEnd: Date | null };

/** Morning window is 6 to 9 AM local time, so a cron that fires late in its hour still lands; each send has a unique key per day. */
export function dueEmails(p: Person, now: Date): Due[] {
  if (p.isDemo) return [];
  const out: Due[] = [];
  const date = isoDay(now, p.timezone);
  const h = localHour(now, p.timezone);
  if (now.getTime() - p.createdAt.getTime() < 3 * 864e5) out.push({ kind: "welcome", key: "1" });
  if (h >= 6 && h <= 9) {
    const c = siteContent(date, p.country);
    const season = seasonTasksFor(date, p.country, new Set())[0];
    out.push({ kind: "daily", key: date, date, tasks: [
      { title: "Check yesterday's numbers", minutes: 2 },
      ...(season ? [{ title: season.title, minutes: 15 }] : [{ title: c.tip.text, minutes: 10 }]),
      { title: "Do your next lesson step", minutes: 10 },
      { title: "Write down one win", minutes: 2 },
    ], step: sequenceIndex(isoDay(p.createdAt, p.timezone), date), season: season?.title ?? null });
    const hit = featuredEvent(date, p.country);
    if (hit && c.mode === "event" && EVENT_LEADS.includes(hit.daysTo))
      out.push({ kind: "event", key: `${hit.event.key}-${hit.year}-${hit.daysTo}`, name: hit.event.name, daysTo: hit.daysTo, line: c.heroExtra ?? c.banner.text, lesson: c.featuredLesson });
    if (p.status === "canceled" && p.subscriptionId && p.currentPeriodEnd) {
      const since = Math.round((Date.parse(date + "T12:00:00Z") - Date.parse(isoDay(p.currentPeriodEnd, p.timezone) + "T12:00:00Z")) / 864e5);
      if (since >= WINBACK_DAYS && since <= WINBACK_DAYS + 2) out.push({ kind: "winback", key: p.subscriptionId });
    }
  }
  return out;
}
export const dayLabel = (date: string) => new Date(date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
export { addDays };
