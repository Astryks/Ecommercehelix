/**
 * The seasonal calendar. Every date is worked out from rules (fixed days, "nth weekday", Easter)
 * or read from a checked table (moon-based dates), so the banner and the seasonal tasks move on
 * by themselves each year. Nobody needs to edit copy by hand.
 */
import { addDays } from "./dates";

export type CalRegion = "US" | "ALL";
export type CalEvent = {
  key: string; // lowercase letters and dashes only (used in task ids)
  name: string;
  regions: CalRegion[];
  /** First and last day of the event (inclusive), or null if we have no date for that year. */
  span: (year: number) => { start: string; end: string } | null;
  /** How many days before the start the banner begins to show. */
  bannerDays: number;
  /** Optional fixed banner start (e.g. 1 August for Black Friday). */
  bannerFrom?: (year: number) => string;
  /** Higher wins when two events overlap. */
  weight: number;
  /** True when the date comes from moon sighting and can move by a day. */
  approx?: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
export const daysFrom = (from: string, to: string) => Math.round((Date.parse(to + "T12:00:00Z") - Date.parse(from + "T12:00:00Z")) / 86_400_000);

/** The nth weekday (0 = Sunday) of a month (1-12). */
export function nthWeekdayOf(year: number, month: number, weekday: number, n: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return ymd(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
}
/** The last weekday (0 = Sunday) of a month (1-12). */
export function lastWeekdayOf(year: number, month: number, weekday: number): string {
  const last = new Date(Date.UTC(year, month, 0));
  const back = (last.getUTCDay() - weekday + 7) % 7;
  return ymd(year, month, last.getUTCDate() - back);
}
/** Western Easter Sunday (Anonymous Gregorian algorithm). */
export function easter(y: number): string {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(y, month, day);
}
export const thanksgiving = (y: number) => nthWeekdayOf(y, 11, 4, 4);

/**
 * Moon-based dates, checked against published calendars (Oct 2026).
 * Ramadan and Eid depend on the moon being seen, so they can move by a day in some places.
 * Add new years here before 2030 runs out; the tests fail if the table gets too short.
 */
export const LUNAR: Record<number, { lunarNewYear: string; ramadanStart: string; eid: string; diwali: string }> = {
  2026: { lunarNewYear: "2026-02-17", ramadanStart: "2026-02-18", eid: "2026-03-20", diwali: "2026-11-08" },
  2027: { lunarNewYear: "2027-02-06", ramadanStart: "2027-02-08", eid: "2027-03-09", diwali: "2027-10-29" },
  2028: { lunarNewYear: "2028-01-26", ramadanStart: "2028-01-28", eid: "2028-02-26", diwali: "2028-10-17" },
  2029: { lunarNewYear: "2029-02-13", ramadanStart: "2029-01-16", eid: "2029-02-14", diwali: "2029-11-05" },
  2030: { lunarNewYear: "2030-02-03", ramadanStart: "2030-01-05", eid: "2030-02-04", diwali: "2030-10-26" },
};
const lunar = (k: keyof (typeof LUNAR)[number]) => (y: number) => (LUNAR[y] ? LUNAR[y][k] : null);
const one = (f: (y: number) => string | null) => (y: number) => { const d = f(y); return d ? { start: d, end: d } : null; };

export const CAL_EVENTS: CalEvent[] = [
  { key: "valentines", name: "Valentine's Day", regions: ["ALL"], span: one((y) => ymd(y, 2, 14)), bannerDays: 42, weight: 6 },
  { key: "lunar-new-year", name: "Lunar New Year", regions: ["ALL"], span: one(lunar("lunarNewYear")), bannerDays: 35, weight: 4 },
  { key: "ramadan-eid", name: "Ramadan and Eid al-Fitr", regions: ["ALL"], approx: true, bannerDays: 35, weight: 4,
    span: (y) => (LUNAR[y] ? { start: LUNAR[y].ramadanStart, end: LUNAR[y].eid } : null) },
  { key: "easter", name: "Easter", regions: ["ALL"], span: (y) => ({ start: addDays(easter(y), -2), end: addDays(easter(y), 1) }), bannerDays: 35, weight: 5 },
  { key: "mothers-day", name: "Mother's Day", regions: ["US"], span: one((y) => nthWeekdayOf(y, 5, 0, 2)), bannerDays: 42, weight: 6 },
  { key: "memorial-day", name: "Memorial Day", regions: ["US"], span: one((y) => lastWeekdayOf(y, 5, 1)), bannerDays: 21, weight: 3 },
  { key: "fathers-day", name: "Father's Day", regions: ["US"], span: one((y) => nthWeekdayOf(y, 6, 0, 3)), bannerDays: 42, weight: 5 },
  { key: "july-fourth", name: "4th of July", regions: ["US"], span: one((y) => ymd(y, 7, 4)), bannerDays: 21, weight: 3 },
  { key: "labor-day", name: "Labor Day", regions: ["US"], span: one((y) => nthWeekdayOf(y, 9, 1, 1)), bannerDays: 21, weight: 3 },
  { key: "halloween", name: "Halloween", regions: ["US"], span: one((y) => ymd(y, 10, 31)), bannerDays: 28, weight: 4 },
  { key: "diwali", name: "Diwali", regions: ["ALL"], span: one(lunar("diwali")), bannerDays: 35, weight: 4 },
  { key: "singles-day", name: "Singles' Day (11.11)", regions: ["ALL"], span: one((y) => ymd(y, 11, 11)), bannerDays: 21, weight: 3 },
  { key: "thanksgiving", name: "Thanksgiving", regions: ["US"], span: one(thanksgiving), bannerDays: 21, weight: 5 },
  { key: "bfcm", name: "Black Friday and Cyber Monday", regions: ["ALL"], weight: 10, bannerDays: 120, bannerFrom: (y) => ymd(y, 8, 1),
    span: (y) => ({ start: addDays(thanksgiving(y), 1), end: addDays(thanksgiving(y), 4) }) },
  { key: "christmas", name: "Christmas", regions: ["ALL"], span: one((y) => ymd(y, 12, 25)), bannerDays: 56, weight: 8 },
  { key: "boxing-day", name: "Boxing Day", regions: ["ALL"], span: one((y) => ymd(y, 12, 26)), bannerDays: 21, weight: 4 },
  { key: "new-year", name: "New Year", regions: ["ALL"], span: (y) => ({ start: ymd(y, 12, 31), end: ymd(y + 1, 1, 1) }), bannerDays: 14, weight: 4 },
];

export type Phase = "prep" | "live";
export type CalHit = { event: CalEvent; year: number; start: string; end: string; phase: Phase; daysTo: number; daysLeft: number };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Which events apply to a country: US gets US events; everyone gets the worldwide ones. */
export const eventsForCountry = (country: string) => CAL_EVENTS.filter((e) => e.regions.includes("ALL") || (country === "US" && e.regions.includes("US")));

/** Every event that is in its banner window or running on `today`. */
export function activeEvents(today: string, country = "US"): CalHit[] {
  const y = Number(today.slice(0, 4));
  const out: CalHit[] = [];
  for (const ev of eventsForCountry(country)) for (const year of [y - 1, y, y + 1]) {
    const s = ev.span(year);
    if (!s) continue;
    const from = ev.bannerFrom ? ev.bannerFrom(year) : addDays(s.start, -ev.bannerDays);
    if (today < from || today > s.end) continue;
    const live = today >= s.start;
    out.push({ event: ev, year, start: s.start, end: s.end, phase: live ? "live" : "prep", daysTo: daysFrom(today, s.start), daysLeft: daysFrom(today, s.end) });
  }
  return out;
}

/** The one event to feature: anything running now first, then the most important one coming up, then the soonest. */
export function featuredEvent(today: string, country = "US"): CalHit | null {
  const hits = activeEvents(today, country);
  hits.sort((a, b) => (a.phase === "live" ? 0 : 1) - (b.phase === "live" ? 0 : 1) || b.event.weight - a.event.weight || a.daysTo - b.daysTo);
  return hits[0] ?? null;
}

/** The next event after `today` (for the quiet-time message). */
export function nextEvent(today: string, country = "US"): { event: CalEvent; start: string; daysTo: number } | null {
  const y = Number(today.slice(0, 4));
  let best: { event: CalEvent; start: string; daysTo: number } | null = null;
  for (const ev of eventsForCountry(country)) for (const year of [y, y + 1]) {
    const s = ev.span(year);
    if (!s || s.start <= today) continue;
    const d = daysFrom(today, s.start);
    if (!best || d < best.daysTo) best = { event: ev, start: s.start, daysTo: d };
  }
  return best;
}

const dayWord = (n: number) => (n === 1 ? "1 day" : `${n} days`);

export type Banner = { key: string; text: string; badge: string; cta: string; phase: Phase | "quiet" };

/** The banner line for a date. Calm, short and the same rules every year. */
export function bannerFor(today: string, country = "US"): Banner {
  const hit = featuredEvent(today, country);
  const month = MONTHS[Number(today.slice(5, 7)) - 1];
  if (!hit) {
    const nx = nextEvent(today, country);
    return {
      key: "quiet", phase: "quiet", cta: "Get your free plan",
      text: `It's ${month}, a quiet time for sales dates. A great time to fix one thing on your store and grow your email list.`,
      badge: nx ? `Next: ${nx.event.name} in ${dayWord(nx.daysTo)}` : "One small step a day",
    };
  }
  const name = hit.event.name;
  const key = `${hit.event.key}-${hit.year}`;
  if (hit.phase === "live")
    return {
      key, phase: "live", cta: "See today's steps",
      text: hit.daysLeft === 0 ? `${name} is happening now. Today is the last day. Check your numbers and thank your buyers.` : `${name} is happening now. Check your numbers once a day and keep your best ads running.`,
      badge: hit.daysLeft === 0 ? "Last day" : `${dayWord(hit.daysLeft + 1)} left`,
    };
  const d = hit.daysTo;
  const stage = d > 56 ? "planning" : d > 21 ? "build" : "final";
  const text = stage === "planning" ? `It's ${month}, the planning month for ${name}. Pick your offer and order stock early.`
    : stage === "build" ? `It's ${month}, the build month for ${name}. Line up your offer, creators and emails now.`
    : `${name} is close. Set up your codes, dress your store and write your emails.`;
  return { key, phase: "prep", cta: "Get the free prep plan", text, badge: `${dayWord(d)} to go${hit.event.approx ? " (date may move a day)" : ""}` };
}
