import { addDays } from "./dates";
import { daysBetween, upcomingEvents, type CalendarEntry, type Country } from "./seasons";

/**
 * Run your business: the 13 operating topics store owners ask about most (fulfilment, shipping,
 * returns, stock, payments, chargebacks, account safety, agencies, GST, US sales tax, selling
 * abroad, books and tax time, team and money), plus dated admin reminders (BAS, tax returns,
 * 1099s, estimated tax, year-end counts, quarterly security checks).
 *
 * General information only, never tax or legal advice. Every threshold below was checked against
 * the official source on the date in THRESHOLDS_CHECKED.
 */

export type Topic = {
  id: string;
  title: string;
  icon: "truck" | "send" | "undo" | "boxes" | "card" | "shield-alert" | "lock" | "megaphone" | "receipt" | "landmark" | "globe" | "book" | "users";
  summary: string;
  /** Lesson refs like "23.1"; the page resolves titles and anchors from the playbook. */
  lessons: string[];
  tool?: { href: string; label: string };
  tax?: boolean;
};

export const TOPICS: Topic[] = [
  { id: "fulfilment", title: "Fulfilment and 3PLs", icon: "truck", summary: "When to stop packing yourself, how to compare warehouse quotes on the same month of orders, and how to move without losing orders.", lessons: ["23.1", "23.2"] },
  { id: "shipping", title: "Shipping, carriers and delays", icon: "send", summary: "Know your shipping cost per order, pick a free shipping rule, keep a second carrier ready and handle lost or damaged parcels fairly.", lessons: ["23.3", "23.4"] },
  { id: "returns", title: "Returns and exchanges", icon: "undo", summary: "Measure your return rate, fix the top reason, offer exchanges first and always meet consumer law.", lessons: ["23.5"] },
  { id: "stock", title: "Stock systems", icon: "boxes", summary: "Reorder points and stock-out dates in Helix, and the signs it is time for inventory software.", lessons: ["23.6", "14.9"], tool: { href: "/dashboard/stock", label: "Open Suppliers & stock" } },
  { id: "payments", title: "Payments, fees and payout holds", icon: "card", summary: "Your real blended fee rate, what buy now pay later costs, and how to avoid frozen payouts before a big sale.", lessons: ["24.1", "24.2", "24.5"] },
  { id: "chargebacks", title: "Chargebacks and fraud", icon: "shield-alert", summary: "The deadlines, the evidence for each reason, and how to stop card-testing bots before they cost you.", lessons: ["24.3", "24.4"] },
  { id: "security", title: "Account safety", icon: "lock", summary: "Two-factor sign-in on every account, two trusted admins, a spending limit, and the first hour after a hack.", lessons: ["25.1", "25.4", "25.6"] },
  { id: "ad-accounts", title: "Ad accounts and agencies", icon: "megaphone", summary: "Own your business portfolio, get a disabled account reviewed the right way, and leave an agency with your data.", lessons: ["25.2", "25.3", "25.5"] },
  { id: "gst", title: "GST and BAS (Australia, NZ)", icon: "receipt", summary: "The $75,000 threshold, GST on ads and imports, BAS due dates, and New Zealand GST on low-value goods.", lessons: ["26.1", "26.2"], tax: true },
  { id: "sales-tax", title: "US sales tax", icon: "landmark", summary: "Physical and economic nexus, the state thresholds, registering before you collect, and filing on time.", lessons: ["26.3"], tax: true },
  { id: "abroad", title: "Selling abroad, VAT and duties", icon: "globe", summary: "UK VAT under £135, EU IOSS up to 150 euros, Canada GST/HST, tariff codes and the end of US de minimis.", lessons: ["26.4", "26.5"], tax: true },
  { id: "books", title: "Books, accountants and tax time", icon: "book", summary: "Registered helpers, clean payout entries, stock and product cost in your books, the monthly close and year-end steps.", lessons: ["27.1", "27.2", "27.3", "27.4", "27.5", "27.6"], tax: true },
  { id: "team-money", title: "Team, creators and money", icon: "users", summary: "Your first hire, paying creators and suppliers safely, comparing funding offers, tool costs, Amazon and looking after yourself.", lessons: ["28.1", "28.2", "28.3", "28.4", "28.5", "28.6", "28.7", "28.8"] },
];

export const THRESHOLDS_CHECKED = "2026-10-06";

/** Key numbers, each checked against the official source on THRESHOLDS_CHECKED. */
export const THRESHOLDS: { where: string; rule: string; source: { label: string; url: string } }[] = [
  { where: "Australia", rule: "Register for GST within 21 days of GST turnover reaching $75,000 (this month plus the previous 11), or when you expect to.", source: { label: "ATO", url: "https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/registering-for-gst" } },
  { where: "Australia", rule: "Quarterly BAS due 28 October, 28 February, 28 April and 28 July.", source: { label: "ATO", url: "https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas" } },
  { where: "New Zealand", rule: "Overseas sellers register for 15% GST once sales of goods worth NZ$1,000 or less to NZ consumers pass NZ$60,000 in 12 months.", source: { label: "IRD", url: "https://www.ird.govt.nz/gst/gst-for-overseas-businesses/gst-on-low-value-imported-goods/registering-for-gst-on-low-value-imported-goods" } },
  { where: "US states", rule: "Economic nexus is often $100,000 of sales a year into a state; California and Texas use $500,000; New York uses more than $500,000 and more than 100 sales.", source: { label: "California CDTFA", url: "https://cdtfa.ca.gov/industry/wayfair/" } },
  { where: "US imports", rule: "The $800 de minimis exemption has been suspended for all countries since 29 August 2025. Low-value parcels pay duty.", source: { label: "US Customs", url: "https://www.cbp.gov/trade/basic-import-export/e-commerce/faqs" } },
  { where: "US contractors", rule: "Form 1099-NEC for contractors paid $2,000 or more in 2026 (it was $600 for 2025 payments).", source: { label: "IRS", url: "https://www.irs.gov/instructions/i1099mec" } },
  { where: "UK", rule: "Overseas sellers register for UK VAT and charge it at checkout on parcels worth £135 or less.", source: { label: "GOV.UK", url: "https://www.gov.uk/guidance/vat-and-overseas-goods-sold-directly-to-customers-in-the-uk" } },
  { where: "EU", rule: "IOSS covers parcels worth up to 150 euros; most non-EU sellers need an EU intermediary.", source: { label: "European Commission", url: "https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en" } },
  { where: "Canada", rule: "Non-resident sellers of goods generally register for GST/HST once Canadian sales pass C$30,000 in 12 months.", source: { label: "CRA", url: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/find-out-need-register.html" } },
  { where: "Australia (team)", rule: "From 1 July 2026, super is paid with each payday and must reach the fund within 7 business days.", source: { label: "ATO", url: "https://www.ato.gov.au/businesses-and-organisations/super-for-employers/payday-super/about-payday-super" } },
];

// ---------- Dated admin reminders ----------

export type AdminDate = {
  key: string;
  name: string;
  countries: Country[];
  date: (y: number) => string;
  /** Show on Today this many days before the date. */
  remindDays: number;
  note: string;
  /** Lesson ref, e.g. "26.1". */
  lesson: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const WEEKEND = " If it falls on a weekend or public holiday, it moves to the next business day.";

export const ADMIN_DATES: AdminDate[] = [
  // Australia
  { key: "bas-q1", name: "BAS due (July to September)", countries: ["AU"], date: (y) => ymd(y, 10, 28), remindDays: 28, lesson: "26.1",
    note: "Quarterly BAS and GST payment due. Lodging online may give you 2 more weeks; agents may have later dates." + WEEKEND },
  { key: "bas-q2", name: "BAS due (October to December)", countries: ["AU"], date: (y) => ymd(y, 2, 28), remindDays: 28, lesson: "26.1",
    note: "Quarterly BAS and GST payment due. This quarter already includes extra time, so no online extension applies." + WEEKEND },
  { key: "bas-q3", name: "BAS due (January to March)", countries: ["AU"], date: (y) => ymd(y, 4, 28), remindDays: 28, lesson: "26.1",
    note: "Quarterly BAS and GST payment due. Lodging online may give you 2 more weeks." + WEEKEND },
  { key: "bas-q4", name: "BAS due (April to June)", countries: ["AU"], date: (y) => ymd(y, 7, 28), remindDays: 28, lesson: "26.1",
    note: "Quarterly BAS and GST payment due for the June quarter. Lodging online may give you 2 more weeks." + WEEKEND },
  { key: "eofy-plan", name: "EOFY tax planning chat", countries: ["AU"], date: (y) => ymd(y, 5, 15), remindDays: 14, lesson: "27.5",
    note: "Book a chat with your accountant about expected profit and tax before 30 June." },
  { key: "stocktake-au", name: "Stocktake and end of financial year", countries: ["AU"], date: (y) => ymd(y, 6, 30), remindDays: 30, lesson: "27.5",
    note: "Count stock, write off dead stock, check super is paid and gather receipts before 30 June." },
  { key: "tax-return-au", name: "Tax return due (if you lodge it yourself)", countries: ["AU"], date: (y) => ymd(y, 10, 31), remindDays: 30, lesson: "27.5",
    note: "Individuals and sole traders lodging their own return. A registered tax agent can often lodge later if you are on their list before 31 October." },
  // United States
  { key: "us-1099", name: "1099-NEC forms due", countries: ["US"], date: (y) => ymd(y, 1, 31), remindDays: 30, lesson: "27.6",
    note: "Send 1099-NEC to contractors you paid $2,000 or more (2026 payments) and file with the IRS." + WEEKEND },
  { key: "us-est-q4", name: "Estimated tax payment (4th)", countries: ["US"], date: (y) => ymd(y, 1, 15), remindDays: 14, lesson: "27.6",
    note: "Last estimated tax payment for the previous year, if you pay estimates." + WEEKEND },
  { key: "us-entity-return", name: "S corporation and partnership returns due", countries: ["US"], date: (y) => ymd(y, 3, 15), remindDays: 30, lesson: "27.6",
    note: "Forms 1120-S and 1065 for calendar-year businesses." + WEEKEND },
  { key: "us-tax-day", name: "Tax day: returns and 1st estimated payment", countries: ["US"], date: (y) => ymd(y, 4, 15), remindDays: 30, lesson: "27.6",
    note: "Individual returns (including sole proprietors) and C corporation returns, plus the first estimated payment for this year." + WEEKEND },
  { key: "us-est-q2", name: "Estimated tax payment (2nd)", countries: ["US"], date: (y) => ymd(y, 6, 15), remindDays: 14, lesson: "27.6",
    note: "Second estimated tax payment, if you pay estimates." + WEEKEND },
  { key: "us-sales-tax-mid", name: "Mid-year sales tax threshold check", countries: ["US"], date: (y) => ymd(y, 7, 1), remindDays: 7, lesson: "26.3",
    note: "Check your sales into each state against its economic nexus threshold, and register before you collect." },
  { key: "us-est-q3", name: "Estimated tax payment (3rd)", countries: ["US"], date: (y) => ymd(y, 9, 15), remindDays: 14, lesson: "27.6",
    note: "Third estimated tax payment, if you pay estimates." + WEEKEND },
  { key: "us-year-end", name: "Year-end stock count and sales tax review", countries: ["US"], date: (y) => ymd(y, 12, 31), remindDays: 30, lesson: "27.6",
    note: "Count stock, review state sales tax registrations, and collect W-9s from contractors before January." },
  // Both
  ...[1, 4, 7, 10].map((m, i): AdminDate => ({
    key: `security-q${i + 1}`, name: "Quarterly account security check", countries: ["AU", "US"], date: (y) => ymd(y, m, 1), remindDays: 7, lesson: "25.1",
    note: "Check two-factor sign-in, remove old admins and partners, and confirm your ad account spending limit.",
  })),
];

export type AdminItem = { key: string; adminKey: string; name: string; date: string; daysTo: number; note: string; lesson: string; taskId: string };

/** Admin dates for a country in the next `horizon` days (and up to `past` days ago), soonest first. */
export function adminDates(today: string, country: Country, horizon = 365, past = 0): AdminItem[] {
  const y = Number(today.slice(0, 4));
  const out: AdminItem[] = [];
  for (const year of [y - 1, y, y + 1, y + 2]) {
    for (const a of ADMIN_DATES) {
      if (!a.countries.includes(country)) continue;
      const date = a.date(year);
      const daysTo = daysBetween(today, date);
      if (daysTo < -past || daysTo > horizon) continue;
      out.push({ key: `${a.key}-${year}`, adminKey: a.key, name: a.name, date, daysTo, note: a.note, lesson: a.lesson, taskId: `biz-${a.key}-${year}` });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

export const BIZ_TASK_ID = /^biz-[a-z0-9-]+-\d{4}$/;

/** Admin items to show on Today: inside their reminder window, not done yet, soonest first. */
export function adminDueSoon(today: string, country: Country, done: Set<string>, n = 3): AdminItem[] {
  const windows = new Map(ADMIN_DATES.map((a) => [a.key, a.remindDays]));
  return adminDates(today, country, 60).filter((a) => a.daysTo <= (windows.get(a.adminKey) ?? 14) && !done.has(a.taskId)).slice(0, n);
}

/** The full calendar: sale and gifting dates plus business admin dates. */
export function calendarWithAdmin(today: string, country: Country, horizon = 365): CalendarEntry[] {
  const admin: CalendarEntry[] = adminDates(today, country, horizon).map((a) => ({
    key: a.key, eventKey: a.adminKey, name: a.name, date: a.date, daysTo: a.daysTo, kind: "admin", note: a.note, lesson: a.lesson,
    prepFrom: addDays(a.date, -(ADMIN_DATES.find((d) => d.key === a.adminKey)?.remindDays ?? 14)),
  }));
  return [...upcomingEvents(today, country, horizon), ...admin].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

/** "26.1" -> the playbook file slug for module 26. */
export const MODULE_SLUGS: Record<number, string> = {
  14: "14-inventory-cash-planning",
  23: "23-fulfilment-shipping-returns",
  24: "24-payments-fraud-chargebacks",
  25: "25-account-safety-agencies",
  26: "26-tax-gst-sales-tax-duties",
  27: "27-accounting-bookkeeping-tax-time",
  28: "28-team-creators-money",
};
