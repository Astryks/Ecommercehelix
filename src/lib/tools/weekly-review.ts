/** Guided Monday review: five numbers vs last week and target, the biggest problem flagged, one fix picked. */
import type { DayInput, Settings } from "../scorecard";
import { addDays } from "../dates";
import { inRange, real, stats } from "./common";

export type ReviewNumber = { id: "sales" | "profit" | "orders" | "mer" | "cr"; name: string; now: number | null; prev: number | null; target: number | null; changePct: number | null; bad: boolean; score: number };
export type Fix = { id: string; label: string; href: string };
export type Review = { week: string; numbers: ReviewNumber[]; worst: ReviewNumber | null; fixes: Fix[] };

const FIXES: Record<ReviewNumber["id"], Fix[]> = {
  sales: [{ id: "email", label: "Send one email to your list this week", href: "/learn/10-email-sms-whatsapp" }, { id: "offer", label: "Make your best offer clearer on the home page", href: "/learn/03-offer-and-product" }],
  profit: [{ id: "costs", label: "Check product and shipping costs in Profit setup", href: "/dashboard/profit" }, { id: "ads-cut", label: "Pause the ad with the highest cost per sale", href: "/dashboard/campaigns" }],
  orders: [{ id: "new-ad", label: "Test one new ad idea", href: "/learn/05-creative-strategy" }, { id: "winback", label: "Email past buyers with a small thank-you offer", href: "/learn/10-email-sms-whatsapp" }],
  mer: [{ id: "pause", label: "Pause ads that spend without sales", href: "/dashboard/campaigns" }, { id: "budget", label: "Lower daily budgets by a fifth until MER is back on target", href: "/learn/07-meta-ads" }],
  cr: [{ id: "page", label: "Fix your best-selling product page", href: "/learn/09-website-and-cro" }, { id: "speed", label: "Run a store check for speed and trust", href: "/dashboard/store-check" }],
};

export function mondayReview(days: DayInput[], s: Settings, monday: string): Review {
  const r = real(days);
  const a = stats(inRange(r, addDays(monday, -7), addDays(monday, -1)), s), b = stats(inRange(r, addDays(monday, -14), addDays(monday, -8)), s);
  const weekTarget = s.monthlyRevenueTarget / 4.345;
  const mk = (id: ReviewNumber["id"], name: string, now: number | null, prev: number | null, target: number | null, lowerIsBetter = false): ReviewNumber => {
    const changePct = now !== null && prev ? Math.round(((now - prev) / Math.abs(prev)) * 1000) / 10 : null;
    const vsTarget = now !== null && target ? (lowerIsBetter ? (target - now) / target : (now - target) / target) : 0;
    const vsPrev = changePct === null ? 0 : (lowerIsBetter ? -changePct : changePct) / 100;
    const score = Math.min(vsTarget, vsPrev);
    return { id, name, now: now === null ? null : Math.round(now * 10) / 10, prev: prev === null ? null : Math.round(prev * 10) / 10, target, changePct, score, bad: score < -0.05 };
  };
  const has = a.days > 0;
  const numbers = [
    mk("sales", "Sales", has ? a.x.netRevenue : null, b.days ? b.x.netRevenue : null, Math.round(weekTarget)),
    mk("profit", "Profit after ads", has ? a.x.contribution : null, b.days ? b.x.contribution : null, Math.round(weekTarget * 0.15)),
    mk("orders", "Orders", has ? a.t.orders : null, b.days ? b.t.orders : null, null),
    mk("mer", "Ad spend as % of sales", has && a.x.netRevenue ? a.x.merPct : null, b.days && b.x.netRevenue ? b.x.merPct : null, s.targetMerPct, true),
    mk("cr", "Conversion rate %", has && a.t.sessions ? a.x.cr : null, b.days && b.t.sessions ? b.x.cr : null, 2.5),
  ];
  const worst = numbers.filter((n) => n.now !== null && n.bad).sort((x, y) => x.score - y.score)[0] ?? null;
  return { week: monday, numbers, worst, fixes: worst ? FIXES[worst.id] : [] };
}
