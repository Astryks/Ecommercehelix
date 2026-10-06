import { addDays } from "./dates";

/**
 * Proactive seasonal calendar.
 *
 * Every big retail date has a lead time. Stock, offers and creative take weeks,
 * so Helix starts warning you well before the day. Dates are Sydney-local
 * (Australian defaults: EOFY is 30 June, Father's Day is in September).
 * Everything here is pure, so it is easy to test and safe to run anywhere.
 */

export type Country = "AU" | "US";
export const COUNTRIES: { id: Country; name: string; flag: string }[] = [
  { id: "AU", name: "Australia", flag: "AU" },
  { id: "US", name: "United States", flag: "US" },
];
export const toCountry = (v: unknown): Country => (v === "US" ? "US" : "AU");

export type Kind = "sale" | "gifting" | "seasonal";
export type Learn = { slug: string; anchor: string; label: string };
export type PrepTask = { id: string; offset: number; title: string; steps: string[]; learn?: Learn };
export type SeasonEvent = {
  key: string;
  name: string;
  countries: Country[];
  kind: Kind;
  /** Event date for a given year, YYYY-MM-DD. */
  date: (year: number) => string;
  /** Start showing the alert this many days before the event. */
  leadDays: number;
  /** Stop showing it this many days after the event (negative = before it). */
  endOffset: number;
  headline: (ctx: AlertCtx) => string;
  why: string;
  tasks: PrepTask[];
};
export type AlertCtx = { today: string; date: string; daysTo: number; weeksTo: number; month: string };
export type PlannedTask = PrepTask & { taskId: string; due: string; overdue: boolean };
export type SeasonAlert = {
  /** Unique per year, e.g. "black-friday-2026". Used as the plan key. */
  key: string;
  eventKey: string;
  name: string;
  date: string;
  daysTo: number;
  headline: string;
  why: string;
  tasks: PlannedTask[];
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** The nth given weekday (0 = Sunday) of a month (1-12). */
export function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const day = 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  return ymd(year, month, day);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + "T12:00:00Z") - Date.parse(from + "T12:00:00Z")) / 86_400_000);
}

/** Black Friday is the day after the fourth Thursday of November (US Thanksgiving). */
export const blackFriday = (y: number) => addDays(nthWeekday(y, 11, 4, 4), 1);

const L = (slug: string, anchor: string, label: string): Learn => ({ slug, anchor, label });
const PROMO = "13-promotions-and-sales";
const LEARN = {
  bigSale: L(PROMO, "lesson-134-the-big-sale-step-by-step", "Lesson 13.4"),
  hype: L(PROMO, "lesson-135-hype-phase", "Lesson 13.5"),
  running: L(PROMO, "lesson-136-running-the-sale", "Lesson 13.6"),
  after: L(PROMO, "lesson-137-after-the-sale", "Lesson 13.7"),
  keyDates: L(PROMO, "lesson-1310-key-dates-and-beyond-black-friday", "Lesson 13.10"),
  checklist: L(PROMO, "lesson-1311-cross-channel-checklist", "Lesson 13.11"),
  rhythm: L(PROMO, "lesson-131-the-promotional-rhythm", "Lesson 13.1"),
  stock: L("14-inventory-cash-planning", "lesson-142-the-weekly-stock-snapshot", "Lesson 14.2"),
  cash: L("14-inventory-cash-planning", "lesson-144-cash-flow-forecast", "Lesson 14.4"),
  seasonalAds: L("06-defining-campaigns", "lesson-614-promotional-and-seasonal-campaigns", "Lesson 6.14"),
  brief: L("19-creators-ugc-and-video-ads", "lesson-1912-the-ugc-brief", "Lesson 19.12"),
  list: L("11-list-and-audience-growth", "lesson-114-fill-the-funnel-before-peaks", "Lesson 11.4"),
  saleEmails: L("10-email-sms-whatsapp", "lesson-1013-sale-email-and-sms-schedule", "Lesson 10.13"),
  shipping: L("09-website-and-cro", "lesson-911-shipping-psychology", "Lesson 9.11"),
  pricing: L("03-offer-and-product", "lesson-36-make-yes-easy-pricing", "Lesson 3.6"),
};

const weeks = (n: number) => (n === 1 ? "1 week" : `${n} weeks`);
const days = (n: number) => (n === 1 ? "1 day" : `${n} days`);

/** Shared plan for gift days (Valentine's, Mother's Day, Father's Day). */
function giftTasks(who: string): PrepTask[] {
  return [
    { id: "pick", offset: -35, title: `Pick your ${who} gift range`, steps: [
      "Choose 3 to 6 products that make an easy gift.",
      "Check you have enough stock of each for about 2 times a normal fortnight.",
      "Put 2 or 3 together as a gift bundle at a price that still leaves profit.",
    ], learn: LEARN.stock },
    { id: "page", offset: -28, title: "Build a gift page", steps: [
      "Make one page or collection with the gift range and bundles.",
      "Add gift wrap or a gift note if you can.",
      "Show the last order date for delivery in time near the Add to cart button.",
    ], learn: LEARN.shipping },
    { id: "ads", offset: -21, title: "Brief and launch gift ads", steps: [
      "Write 3 ad ideas that answer 'what do I buy them?'",
      "Run them as a separate seasonal campaign so they do not disturb your always-on ads.",
      "Point them at the gift page, not the home page.",
    ], learn: LEARN.seasonalAds },
    { id: "emails", offset: -14, title: "Schedule gift emails and texts", steps: [
      "Email 1: the gift guide. Email 2: best sellers. Email 3: last day to order.",
      "Send the last-day reminder by text as well.",
    ], learn: LEARN.saleEmails },
    { id: "lastcall", offset: -4, title: "Switch to last-minute messaging", steps: [
      "After the delivery cut-off, switch ads and banners to gift cards and express shipping.",
      "Turn off ads that promise delivery you can no longer make.",
    ] },
  ];
}

export const EVENTS: SeasonEvent[] = [
  {
    key: "black-friday",
    name: "Black Friday",
    countries: ["AU", "US"],
    kind: "sale",
    date: blackFriday,
    leadDays: 84,
    endOffset: 4,
    why: "Black Friday is the biggest sales weekend of the year. Stock takes weeks to arrive, and ads and emails need to be built before the rush.",
    headline: ({ daysTo, weeksTo, month }) =>
      daysTo > 42 ? `It's ${month}. Black Friday planning needs to start now: order stock, lock your offer, start creative.`
      : daysTo > 14 ? `Black Friday is ${weeks(weeksTo)} away. Build your sale campaigns (switched off), plan your emails and grow your list now.`
      : daysTo > 0 ? `Black Friday is ${days(daysTo)} away. Freeze site changes, test every discount code and start your hype ads.`
      : `Black Friday weekend is live. Check MER every day against your plan and refresh ads halfway through.`,
    tasks: [
      { id: "offer", offset: -56, title: "Set your target and lock your offer", steps: [
        "Write down a sales target for the weekend and the most you will spend on ads.",
        "Pick one simple offer (for example 25% off sitewide, or a gift with purchase).",
        "Check the offer still leaves profit after product cost, shipping and ads.",
      ], learn: LEARN.bigSale },
      { id: "stock", offset: -56, title: "Order stock and gifts", steps: [
        "Look at last year's sale (or 3 times a normal week if this is your first).",
        "Order enough of your best sellers to cover it, plus any free gifts.",
        "Ask your supplier for the latest date stock can still arrive.",
      ], learn: LEARN.stock },
      { id: "creative", offset: -49, title: "Brief your sale ads", steps: [
        "Plan 5 to 10 new ads: product close-ups, customer videos and a clear offer image.",
        "Book any creators now. They get busy in November.",
      ], learn: LEARN.brief },
      { id: "list", offset: -42, title: "Grow your email and SMS list", steps: [
        "Run an 'early access' sign-up so people join before the sale.",
        "Spend a little more on new-customer ads now, while they are cheaper.",
      ], learn: LEARN.list },
      { id: "emails", offset: -35, title: "Plan your sale emails and texts", steps: [
        "Write the schedule: teaser, early access, launch, reminder, last chance.",
        "Load them into your email tool and set them to send.",
      ], learn: LEARN.saleEmails },
      { id: "campaigns", offset: -28, title: "Build your sale campaigns, switched off", steps: [
        "Set up the sale campaigns in Ads Manager now, paused, so launch day is one click.",
        "Helix can draft a paused campaign for you from the Builder.",
      ], learn: LEARN.seasonalAds },
      { id: "freeze", offset: -14, title: "Freeze the site and test every code", steps: [
        "No big theme or app changes from now until the sale ends.",
        "Place a test order with every discount code on phone and desktop.",
      ], learn: LEARN.checklist },
      { id: "hype", offset: -5, title: "Start the hype", steps: [
        "Turn on teaser ads and emails that say when the sale starts.",
        "Remind your early-access list they get in first.",
      ], learn: LEARN.hype },
      { id: "launch", offset: 0, title: "Launch day", steps: [
        "Switch on the sale campaigns and send the launch email.",
        "Check the site, codes and stock every few hours.",
      ], learn: LEARN.running },
      { id: "review", offset: 7, title: "Review the sale", steps: [
        "Compare sales, ad spend and profit against your target.",
        "Write 3 things to keep and 3 to change for next year.",
      ], learn: LEARN.after },
    ],
  },
  {
    key: "christmas",
    name: "Christmas shipping cut-offs",
    countries: ["AU", "US"],
    kind: "gifting",
    date: (y) => ymd(y, 12, 25),
    leadDays: 56,
    endOffset: -3,
    why: "Most Christmas orders need to arrive by the 24th. If customers cannot tell whether a gift will arrive in time, they buy somewhere else.",
    headline: ({ daysTo, weeksTo }) =>
      daysTo > 21 ? `Christmas is ${weeks(weeksTo)} away. Set your last order dates for standard and express shipping, and plan your gift guides.`
      : `Christmas delivery cut-offs are close. Show "order by" dates on every page and email, then switch to gift cards and express.`,
    tasks: [
      { id: "cutoffs", offset: -49, title: "Check your carriers' Christmas cut-off dates", steps: [
        "Look up the last send dates for standard and express from your carriers.",
        "Add 1 to 2 days for packing. These are your last order dates.",
      ], learn: LEARN.shipping },
      { id: "banner", offset: -42, title: "Add an 'order by' banner", steps: [
        "Put 'Order by [date] for Christmas delivery' in the site banner, product pages and cart.",
        "Use the standard date first, then switch to the express date.",
      ], learn: LEARN.shipping },
      { id: "guides", offset: -35, title: "Build gift guides and bundles", steps: [
        "Make gift pages by price (under $50, under $100) and by person.",
        "Create 2 or 3 gift bundles that still leave profit.",
      ], learn: LEARN.pricing },
      { id: "giftcards", offset: -21, title: "Set up gift cards for late shoppers", steps: [
        "Make sure digital gift cards are on sale and easy to find.",
        "Prepare ads and an email for them, ready for after the cut-off.",
      ] },
      { id: "lastship", offset: -14, title: "Schedule last-shipping-day emails and texts", steps: [
        "Send a reminder 3 days before, and on, each cut-off date.",
        "Send the final one by text as well.",
      ], learn: LEARN.saleEmails },
      { id: "switch", offset: -6, title: "Switch to gift cards and express", steps: [
        "When standard shipping closes, change ads and banners to express and gift cards.",
        "Pause ads that promise delivery you can no longer make.",
      ] },
    ],
  },
  {
    key: "boxing-day",
    name: "Boxing Day and New Year sales",
    countries: ["AU"],
    kind: "sale",
    date: (y) => ymd(y, 12, 26),
    leadDays: 35,
    endOffset: 10,
    why: "Shoppers come back after Christmas with gift money, and ad costs usually drop in the quiet weeks that follow. It is a good time to clear stock and win new customers cheaply.",
    headline: ({ daysTo, weeksTo }) =>
      daysTo > 7 ? `Boxing Day and New Year sales are ${weeks(weeksTo)} away. Decide what stock to clear, plan your offer and get your campaigns ready.`
      : daysTo > 0 ? `Boxing Day is ${days(daysTo)} away. Load your sale emails and build the campaigns, switched off, before you take a break.`
      : `Boxing Day and New Year sales are on. Ad costs are usually lower now, so it is a good time to win new customers.`,
    tasks: [
      { id: "clear", offset: -28, title: "Pick the stock to clear", steps: [
        "Open your stock snapshot and list anything with more than 12 weeks of cover.",
        "Those products go in the sale first.",
      ], learn: LEARN.stock },
      { id: "offer", offset: -21, title: "Plan an offer that keeps profit", steps: [
        "Bigger discounts on slow stock, smaller or none on best sellers.",
        "Check each discount still leaves profit after ads.",
      ], learn: LEARN.bigSale },
      { id: "emails", offset: -14, title: "Schedule the sale emails and texts", steps: [
        "Write and schedule them now so they send while you are away.",
        "Plan a Boxing Day launch, a New Year reminder and a last-chance email.",
      ], learn: LEARN.saleEmails },
      { id: "campaigns", offset: -10, title: "Build the campaigns, switched off", steps: [
        "Set up the sale campaigns paused, so launch is one click on the day.",
      ], learn: LEARN.seasonalAds },
      { id: "newcustomers", offset: -3, title: "Plan for the cheaper January ad weeks", steps: [
        "Set aside some budget for new-customer ads in early January.",
        "Pick the ads that worked best in November to run again.",
      ], learn: LEARN.keyDates },
      { id: "review", offset: 12, title: "Review the summer sale", steps: [
        "Compare sales, profit and stock cleared against the plan.",
      ], learn: LEARN.after },
    ],
  },
  {
    key: "valentines",
    name: "Valentine's Day",
    countries: ["AU", "US"],
    kind: "gifting",
    date: (y) => ymd(y, 2, 14),
    leadDays: 42,
    endOffset: -1,
    why: "Valentine's Day is a short, gift-driven window. People shop in the last two weeks and need delivery to be certain.",
    headline: ({ weeksTo, daysTo }) =>
      daysTo > 10 ? `Valentine's Day is ${weeks(weeksTo)} away. Pick your gift range, build a gift page and plan your ads now.`
      : `Valentine's Day is ${days(daysTo)} away. Push your last order date and switch to gift cards after the cut-off.`,
    tasks: giftTasks("Valentine's Day"),
  },
  {
    key: "mothers-day",
    name: "Mother's Day",
    countries: ["AU", "US"],
    kind: "gifting",
    date: (y) => nthWeekday(y, 5, 0, 2),
    leadDays: 56,
    endOffset: -1,
    why: "Mother's Day is one of the biggest gifting days of the year for many stores. Stock and gift bundles need to be ready weeks before.",
    headline: ({ weeksTo, daysTo }) =>
      daysTo > 14 ? `Mother's Day is ${weeks(weeksTo)} away. Check gift stock, build bundles and plan your gift ads.`
      : `Mother's Day is ${days(daysTo)} away. Show your last order date everywhere and send the gift reminder emails.`,
    tasks: giftTasks("Mother's Day"),
  },
  {
    key: "eofy",
    name: "End of financial year (EOFY)",
    countries: ["AU"],
    kind: "sale",
    date: (y) => ymd(y, 6, 30),
    leadDays: 42,
    endOffset: 0,
    why: "In Australia many shoppers and businesses buy before 30 June. It is also the time to clear slow stock before your stocktake.",
    headline: ({ weeksTo, daysTo }) =>
      daysTo > 10 ? `End of financial year is ${weeks(weeksTo)} away. Plan your EOFY sale and clear slow stock before 30 June.`
      : `EOFY is ${days(daysTo)} away. Launch your sale, send the reminders and get ready for stocktake.`,
    tasks: [
      { id: "clear", offset: -35, title: "Pick the stock to clear", steps: [
        "List products with more than 12 weeks of cover in your stock snapshot.",
        "Put those first in the EOFY sale.",
      ], learn: LEARN.stock },
      { id: "offer", offset: -28, title: "Lock an offer that keeps profit", steps: [
        "Choose one clear offer and check it still leaves profit after ads.",
      ], learn: LEARN.bigSale },
      { id: "creative", offset: -21, title: "Brief the EOFY ads", steps: [
        "Plan 3 to 5 sale ads with the offer and the end date in the first second.",
      ], learn: LEARN.seasonalAds },
      { id: "emails", offset: -14, title: "Schedule sale emails and texts", steps: [
        "Launch, reminder and last-chance emails. Send the last one by text too.",
      ], learn: LEARN.saleEmails },
      { id: "cash", offset: -7, title: "Check cash for the new year", steps: [
        "Update your cash flow forecast with expected sale income and July bills.",
      ], learn: LEARN.cash },
    ],
  },
  {
    key: "fathers-day",
    name: "Father's Day",
    countries: ["AU"],
    kind: "gifting",
    date: (y) => nthWeekday(y, 9, 0, 1),
    leadDays: 49,
    endOffset: -1,
    why: "Father's Day (first Sunday of September in Australia) is a strong gifting date. Stock and gift ideas need to be ready early.",
    headline: ({ weeksTo, daysTo }) =>
      daysTo > 14 ? `Father's Day is ${weeks(weeksTo)} away. Pick your gift range, build bundles and plan your gift ads.`
      : `Father's Day is ${days(daysTo)} away. Show your last order date everywhere and send the reminder emails.`,
    tasks: giftTasks("Father's Day"),
  },
  {
    key: "fathers-day-us",
    name: "Father's Day (US)",
    countries: ["US"],
    kind: "gifting",
    date: (y) => nthWeekday(y, 6, 0, 3),
    leadDays: 49,
    endOffset: -1,
    why: "Father's Day in the US (third Sunday of June) is a strong gifting date. Stock and gift ideas need to be ready early.",
    headline: ({ weeksTo, daysTo }) =>
      daysTo > 14 ? `Father's Day is ${weeks(weeksTo)} away. Pick your gift range, build bundles and plan your gift ads.`
      : `Father's Day is ${days(daysTo)} away. Show your last order date everywhere and send the reminder emails.`,
    tasks: giftTasks("Father's Day"),
  },
];

/** Easter Sunday (Gregorian, anonymous algorithm). */
export function easterSunday(y: number): string {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(y, month, day);
}

/** Last given weekday (0 = Sunday) of a month. */
export function lastWeekday(year: number, month: number, weekday: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dow = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay();
  return ymd(year, month, lastDay - ((dow - weekday + 7) % 7));
}

/** Calendar-only dates: shown on the Calendar page and Upcoming strip, no prep plan. */
export type CalendarOnly = { key: string; name: string; countries: Country[]; kind: Kind; date: (y: number) => string; note: string; approx?: string };
export const CALENDAR_ONLY: CalendarOnly[] = [
  { key: "back-to-school-au", name: "Back to school", countries: ["AU"], kind: "seasonal", date: (y) => ymd(y, 1, 27),
    note: "School goes back from late January to early February, depending on the state. Shopping peaks in the 2 weeks before.", approx: "Varies by state" },
  { key: "easter", name: "Easter long weekend", countries: ["AU", "US"], kind: "seasonal", date: (y) => addDays(easterSunday(y), -2),
    note: "Good Friday to Easter Monday. Good for gifting and treats. Check carrier closures and set shipping expectations." },
  { key: "memorial-day", name: "Memorial Day sales", countries: ["US"], kind: "sale", date: (y) => lastWeekday(y, 5, 1),
    note: "Last Monday of May. A big long-weekend sale and the unofficial start of summer." },
  { key: "july-4", name: "Fourth of July sales", countries: ["US"], kind: "sale", date: (y) => ymd(y, 7, 4),
    note: "Independence Day. A popular summer sale weekend in the US." },
  { key: "back-to-school-us", name: "Back to school", countries: ["US"], kind: "seasonal", date: (y) => ymd(y, 8, 1),
    note: "Shopping runs from mid-July to early September. The busiest weeks are late July and early August.", approx: "Season, not one day" },
  { key: "labor-day", name: "Labor Day sales", countries: ["US"], kind: "sale", date: (y) => nthWeekday(y, 9, 1, 1),
    note: "First Monday of September. A long-weekend sale that closes out summer." },
  { key: "halloween", name: "Halloween", countries: ["US"], kind: "seasonal", date: (y) => ymd(y, 10, 31),
    note: "Big for costumes, decor and treats. Many stores also use it to start teasing Black Friday." },
  { key: "click-frenzy", name: "Click Frenzy", countries: ["AU"], kind: "sale", date: (y) => nthWeekday(y, 11, 2, 2),
    note: "A big Australian online sale event, usually over 3 days in mid-November. Decide by late October if you join it or keep your offer for Black Friday.", approx: "Usually the 2nd week of November. Check the official dates" },
  { key: "singles-day", name: "Singles Day (11.11)", countries: ["AU", "US"], kind: "sale", date: (y) => ymd(y, 11, 11),
    note: "The world's biggest online shopping day, started in China. Some stores run a one-day 11.11 offer as an early taste of Black Friday." },
  { key: "thanksgiving", name: "Thanksgiving", countries: ["US"], kind: "seasonal", date: (y) => nthWeekday(y, 11, 4, 4),
    note: "Fourth Thursday of November. Black Friday starts the next day; many US stores open their sale on Thanksgiving." },
  { key: "cyber-monday", name: "Cyber Monday", countries: ["AU", "US"], kind: "sale", date: (y) => addDays(blackFriday(y), 3),
    note: "The Monday after Black Friday. Usually the last big day of the sale weekend. Plan a final reminder email and text." },
];

export type CalendarEntry = {
  key: string;
  eventKey: string;
  name: string;
  date: string;
  daysTo: number;
  kind: Kind;
  note: string;
  approx?: string;
  /** For dates with a prep plan: when Helix starts alerting. */
  prepFrom?: string;
  planSteps?: number;
};

/** Every key date for a country in the next `horizon` days, soonest first. */
export function upcomingEvents(today: string, country: Country, horizon = 365): CalendarEntry[] {
  const y = Number(today.slice(0, 4));
  const out: CalendarEntry[] = [];
  for (const year of [y - 1, y, y + 1, y + 2]) {
    for (const ev of EVENTS) {
      if (!ev.countries.includes(country)) continue;
      const date = ev.date(year);
      const daysTo = daysBetween(today, date);
      if (daysTo < 0 || daysTo > horizon) continue;
      out.push({ key: `${ev.key}-${year}`, eventKey: ev.key, name: ev.name, date, daysTo, kind: ev.kind, note: ev.why, prepFrom: addDays(date, -ev.leadDays), planSteps: ev.tasks.length });
    }
    for (const ev of CALENDAR_ONLY) {
      if (!ev.countries.includes(country)) continue;
      const date = ev.date(year);
      const daysTo = daysBetween(today, date);
      if (daysTo < 0 || daysTo > horizon) continue;
      out.push({ key: `${ev.key}-${year}`, eventKey: ev.key, name: ev.name, date, daysTo, kind: ev.kind, note: ev.note, approx: ev.approx });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

export const countdownText = (daysTo: number) => (daysTo === 0 ? "today" : daysTo === 1 ? "tomorrow" : `in ${daysTo} days`);

function toAlert(ev: SeasonEvent, year: number, today: string): SeasonAlert | null {
  const date = ev.date(year);
  const daysTo = daysBetween(today, date);
  if (daysTo > ev.leadDays || daysTo < -ev.endOffset) return null;
  const key = `${ev.key}-${year}`;
  const month = MONTHS[Number(today.slice(5, 7)) - 1];
  const ctx: AlertCtx = { today, date, daysTo, weeksTo: Math.max(1, Math.round(daysTo / 7)), month };
  return {
    key,
    eventKey: ev.key,
    name: ev.name,
    date,
    daysTo,
    headline: ev.headline(ctx),
    why: ev.why,
    tasks: ev.tasks.map((t) => {
      const due = addDays(date, t.offset);
      return { ...t, taskId: `season-${key}-${t.id}`, due, overdue: due < today };
    }),
  };
}

/** Active alerts for a date, most urgent (soonest event) first. */
export function seasonalAlerts(today: string, country: Country = "AU"): SeasonAlert[] {
  const y = Number(today.slice(0, 4));
  const out: SeasonAlert[] = [];
  for (const ev of EVENTS.filter((e) => e.countries.includes(country))) for (const year of [y - 1, y, y + 1]) {
    const a = toAlert(ev, year, today);
    if (a) out.push(a);
  }
  return out.sort((a, b) => a.daysTo - b.daysTo || a.name.localeCompare(b.name));
}

/** The one alert to show prominently. Events that have already started stay on top while they run. */
export function primaryAlert(today: string, country: Country = "AU"): SeasonAlert | null {
  return seasonalAlerts(today, country)[0] ?? null;
}

/** Find an alert by plan key (e.g. "black-friday-2026"), even if it is no longer active. */
export function alertByKey(key: string, today: string): SeasonAlert | null {
  const m = key.match(/^([a-z-]+)-(\d{4})$/);
  if (!m) return null;
  const ev = EVENTS.find((e) => e.key === m[1]);
  if (!ev) return null;
  const date = ev.date(Number(m[2]));
  const daysTo = daysBetween(today, date);
  // Build with a wide window so a plan stays viewable after the alert ends.
  return toAlert({ ...ev, leadDays: Math.max(ev.leadDays, daysTo), endOffset: Math.max(ev.endOffset, -daysTo) }, Number(m[2]), today);
}

/** Next undone tasks: anything due now (overdue or today) first, then the next upcoming one. */
export function nextTasks(alert: SeasonAlert, done: Set<string>, n = 3): PlannedTask[] {
  return alert.tasks.filter((t) => !done.has(t.taskId)).sort((a, b) => a.due.localeCompare(b.due)).slice(0, n);
}

export const SEASON_TASK_ID = /^season-[a-z-]+-\d{4}-[a-z]+$/;
