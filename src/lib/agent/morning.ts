/**
 * Step 3 — Daily metrics (Job 3 of the pivot, §11).
 *
 * The 7am QA walk and 8am scorecard run on the deterministic maths already
 * in code (profit waterfall in scorecard.ts, stance in today.ts). The LLM
 * only writes the words; it never computes a number.
 *
 * Exceptions interrupt the owner (red-flag card, any time). Everything else
 * is logged silently — "Nothing needs you today" is a valid briefing.
 *
 * Also in this module: the 21-field DayInput replacement. Each field names
 * its auto source; manual entry survives only as a fallback for a field with
 * no source, and the UI must badge any day whose data is example or stale.
 */
import { derive, sum, type DayInput, type Settings } from "../scorecard";
import { stanceFor, type Stance } from "../today";

export type MorningException = {
  key: string;
  severity: "red" | "amber";
  title: string;
  evidence: string;
  /** True = interrupt the owner (push / red-flag card). False = log silently. */
  interrupt: boolean;
};

export type QaInput = {
  days: DayInput[];
  settings: Settings;
  /** Yesterday's date, YYYY-MM-DD. */
  yesterday: string;
  /** Same weekday last week, for the >40% drop check. */
  sameWeekdayLastWeek: string;
  /** Days of stock left on the best-selling product, if known. */
  heroStockDaysLeft: number | null;
  /** Refund rate (%) over the last 7 days, if known. */
  refundRatePct7d: number | null;
  /** Checkout / pixel health from the site check, if known. */
  checkoutOk: boolean | null;
  pixelOk: boolean | null;
  /** Last successful sync per feed, ISO timestamps. */
  lastSyncAt: { shopify: string | null; meta: string | null; google: string | null; tiktok: string | null };
  now: string;
};

/** Exceptions worth interrupting (pivot §11 Job 3). */
export function qaWalk(i: QaInput): MorningException[] {
  const out: MorningException[] = [];
  const real = i.days.filter((d) => !d.example);
  const y = real.find((d) => d.date === i.yesterday);
  const lw = real.find((d) => d.date === i.sameWeekdayLastWeek);
  const last7 = real.filter((d) => d.date <= i.yesterday).slice(-7);
  const t7 = sum(last7);
  const d7 = last7.length ? derive(t7, i.settings, last7.length) : null;

  // Dead checkout / broken pixel: spend firing, Shopify orders zero.
  if (i.checkoutOk === false)
    out.push({ key: "dead-checkout", severity: "red", title: "Checkout looks broken — stop scaling", evidence: "The site check could not complete a checkout. Do not scale ads until this is fixed.", interrupt: true });
  if (i.pixelOk === false)
    out.push({ key: "broken-pixel", severity: "red", title: "Pixel not firing", evidence: "Meta cannot see purchases, so its numbers cannot be trusted. Fix tracking before judging any ad.", interrupt: true });
  if (y && y.adMeta + y.adGoogle + y.adTiktok > 0 && y.orders === 0)
    out.push({ key: "spend-no-orders", severity: "red", title: "Ad spend yesterday, zero orders", evidence: `Spent $${Math.round(y.adMeta + y.adGoogle + y.adTiktok)} with 0 orders. Check the store is up and checkout works before spending more.`, interrupt: true });

  // Revenue / sessions down >40% vs the same weekday last week.
  if (y && lw && lw.revenue > 0 && (lw.revenue - y.revenue) / lw.revenue > 0.4)
    out.push({ key: "revenue-drop", severity: "red", title: "Revenue down more than 40% vs last week", evidence: `Yesterday $${Math.round(y.revenue)} vs $${Math.round(lw.revenue)} the same weekday last week. Check the site is up, checkout works, tracking fires and ads are delivering.`, interrupt: true });
  if (y && lw && lw.sessions > 0 && (lw.sessions - y.sessions) / lw.sessions > 0.4)
    out.push({ key: "sessions-drop", severity: "red", title: "Sessions down more than 40% vs last week", evidence: `Yesterday ${y.sessions} sessions vs ${lw.sessions} the same weekday last week.`, interrupt: true });

  // CPA above break-even for 3 days.
  if (d7 && last7.length >= 3) {
    const cpa3 = d7.aCpa;
    const be3 = d7.breakEvenCpa;
    if (be3 > 0 && cpa3 > be3)
      out.push({ key: "cpa-above-breakeven", severity: "red", title: "Cost per sale above break-even for 3 days", evidence: `CPA $${cpa3.toFixed(2)} vs break-even $${be3.toFixed(2)} over the last 3 days. Every sale loses money at this rate — pause the worst ads.`, interrupt: true });
  }

  // Stock-out on a winning product.
  if (i.heroStockDaysLeft !== null && i.heroStockDaysLeft <= 0)
    out.push({ key: "hero-out-of-stock", severity: "red", title: "Best seller out of stock", evidence: "Your best seller has 0 days of stock left. Pause or redirect its ads until it is back.", interrupt: true });

  // Refund spike: last-7-day refund rate above 5%.
  if (i.refundRatePct7d !== null && i.refundRatePct7d > 5)
    out.push({ key: "refund-spike", severity: "amber", title: "Refund rate spiking", evidence: `Refunds are ${i.refundRatePct7d.toFixed(1)}% of sales over the last 7 days (over 5%). Check the top return reason before scaling.`, interrupt: true });

  // Stale feeds: logged, and the profit number must carry the badge (see scorecardBrief).
  for (const [feed, at] of Object.entries(i.lastSyncAt)) {
    if (at && Date.parse(i.now) - Date.parse(at) > 24 * 3600 * 1000)
      out.push({ key: `stale-${feed}`, severity: "amber", title: `${feed} feed stale`, evidence: `Last successful ${feed} pull was more than 24 hours ago. Numbers from this feed are shown with a stale badge, never as fresh.`, interrupt: false });
  }
  return out;
}

export type ScorecardBrief = {
  date: string;
  stance: Stance;
  revenue: number;
  orders: number;
  sessions: number;
  adSpend: number;
  contribution: number;
  netProfit: number;
  merPct3d: number | null;
  merPctMtd: number | null;
  targetMerPct: number;
  cpa: number;
  breakEvenCpa: number;
  contributionPct: number;
  refundRatePct: number | null;
  /** True when any feed is stale: the UI must badge the profit number "stale — last synced [time]". */
  stale: boolean;
  staleFeeds: string[];
  /** "Nothing needs you today" — the briefing is willing to be boring out loud. */
  boring: boolean;
  lines: string[];
};

/** 8am scorecard: code maths, plain words. Never a fake precise number: a missing cost makes the profit "estimate incomplete". */
export function scorecardBrief(days: DayInput[], settings: Settings, today: string, lastSyncAt: QaInput["lastSyncAt"], now: string): ScorecardBrief {
  const real = days.filter((d) => !d.example);
  const yesterday = real.filter((d) => d.date < today).sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const stance = stanceFor(real, today, settings.targetMerPct);
  const staleFeeds = (Object.entries(lastSyncAt) as [string, string | null][]).filter(([, at]) => at && Date.parse(now) - Date.parse(at) > 24 * 3600 * 1000).map(([f]) => f);
  const lines: string[] = [];
  if (!yesterday) {
    return { date: today, stance: stance.stance, revenue: 0, orders: 0, sessions: 0, adSpend: 0, contribution: 0, netProfit: 0, merPct3d: stance.mer3, merPctMtd: stance.merMtd, targetMerPct: settings.targetMerPct, cpa: 0, breakEvenCpa: 0, contributionPct: 0, refundRatePct: null, stale: staleFeeds.length > 0, staleFeeds, boring: true, lines: ["No numbers for yesterday yet. Add yesterday's sales and ad spend — it takes a minute."] };
  }
  const x = derive(yesterday, settings);
  const refundRatePct = x.netRevenue > 0 ? (yesterday.refunds / x.netRevenue) * 100 : null;
  const boring = stance.stance === "Push" || stance.stance === "Careful push";
  lines.push(
    `Yesterday: $${Math.round(x.netRevenue)} revenue, ${yesterday.orders} orders, $${Math.round(x.adSpend)} ad spend, about $${Math.round(x.contribution)} contribution.`,
    `Stance: ${stance.stance} (MER 3-day ${stance.mer3 === null ? "n/a" : stance.mer3.toFixed(1) + "%"} vs target ${settings.targetMerPct}%).`,
    x.aCpa > x.breakEvenCpa && x.breakEvenCpa > 0
      ? `Cost per sale $${x.aCpa.toFixed(2)} is above break-even $${x.breakEvenCpa.toFixed(2)} — yesterday's ads lost money.`
      : `Cost per sale $${x.aCpa.toFixed(2)} vs break-even $${x.breakEvenCpa.toFixed(2)}.`,
  );
  if (staleFeeds.length) lines.push(`Stale — last synced: ${staleFeeds.join(", ")}. Treat these numbers as last-known, not fresh.`);
  return {
    date: yesterday.date, stance: stance.stance, revenue: x.netRevenue, orders: yesterday.orders, sessions: yesterday.sessions,
    adSpend: x.adSpend, contribution: x.contribution, netProfit: x.netProfit, merPct3d: stance.mer3, merPctMtd: stance.merMtd,
    targetMerPct: settings.targetMerPct, cpa: x.aCpa, breakEvenCpa: x.breakEvenCpa, contributionPct: x.contributionPct,
    refundRatePct, stale: staleFeeds.length > 0, staleFeeds, boring, lines,
  };
}

// ---------- The 21-field DayInput, replaced field by field (pivot §11 Job 3) ----------

export type DayFieldSource = {
  field: string;
  label: string;
  /** Where the number comes from automatically. "manual" = genuinely owner-entered. */
  autoSource: string;
  /** When, if ever, the owner is asked for this field. */
  manualFallback: string;
};

/** One row per DayInput numeric field (21). Manual entry survives only where the source is "manual". */
export const DAY_FIELD_SOURCES: DayFieldSource[] = [
  { field: "orders", label: "Orders", autoSource: "Shopify orders", manualFallback: "Ask only if Shopify is not connected" },
  { field: "newCustomerOrders", label: "New-customer orders", autoSource: "Shopify (first-order flag)", manualFallback: "Never ask — derived/omitted" },
  { field: "units", label: "Units sold", autoSource: "Shopify line items", manualFallback: "—" },
  { field: "sessions", label: "Sessions", autoSource: "Shopify Analytics / GA4", manualFallback: "—" },
  { field: "addToCarts", label: "Sessions with an add to cart", autoSource: "Shopify Analytics", manualFallback: "—" },
  { field: "revenue", label: "Gross sales ($)", autoSource: "Shopify orders", manualFallback: "Yesterday's revenue — 1 of only 2 fields asked when unconnected" },
  { field: "newCustomerRevenue", label: "New-customer sales ($)", autoSource: "Shopify (first-order flag)", manualFallback: "—" },
  { field: "discounts", label: "Discounts ($)", autoSource: "Shopify orders", manualFallback: "—" },
  { field: "refunds", label: "Refunds ($)", autoSource: "Shopify refunds", manualFallback: "—" },
  { field: "cogs", label: "Product cost / COGS ($)", autoSource: "Store Brain per-SKU landed cost × units", manualFallback: "Owner enters landed cost once per SKU; a missing cost blocks break-even for that SKU — never guess" },
  { field: "shipping", label: "Shipping and fulfilment ($)", autoSource: "Store Brain per-order shipping × orders", manualFallback: "Owner-entered per-order default, set once" },
  { field: "paymentFees", label: "Payment fees ($)", autoSource: "Fee % in Store Brain × revenue", manualFallback: "Owner-entered fee %, set once" },
  { field: "adMeta", label: "Meta ad spend ($)", autoSource: "Meta Marketing API", manualFallback: "Spend for that channel only, if Meta is not connected" },
  { field: "adGoogle", label: "Google ad spend ($)", autoSource: "Google Ads API", manualFallback: "Spend for that channel only, if Google is not connected" },
  { field: "adTiktok", label: "TikTok ad spend ($)", autoSource: "TikTok Ads API", manualFallback: "Spend for that channel only, if TikTok is not connected" },
  { field: "adOther", label: "Other ad spend ($)", autoSource: "None — no API", manualFallback: "Owner-entered (the one genuinely manual spend field)" },
  { field: "otherMarketing", label: "Other marketing ($)", autoSource: "None", manualFallback: "Owner-entered, optional" },
  { field: "metaRevenue", label: "Meta-attributed sales ($)", autoSource: "Meta Marketing API", manualFallback: "— (attribution comparison only, never the verdict)" },
  { field: "googleRevenue", label: "Google-attributed sales ($)", autoSource: "Google Ads API", manualFallback: "—" },
  { field: "tiktokRevenue", label: "TikTok-attributed sales ($)", autoSource: "TikTok Ads API", manualFallback: "—" },
  { field: "source", label: "Provenance flags", autoSource: "Set by the sync job (shopify / meta / …); example: true on seeded data", manualFallback: "Never owner-entered — the UI badges example or stale days" },
];

/**
 * Which fields still need the owner, given what is connected. When everything
 * is connected the answer is only adOther / otherMarketing (both optional).
 */
export function fieldsStillManual(connected: { shopify: boolean; meta: boolean; google: boolean; tiktok: boolean; ga4: boolean }): string[] {
  const out: string[] = [];
  if (!connected.shopify) out.push("orders", "revenue");
  if (!connected.meta) out.push("adMeta");
  if (!connected.google) out.push("adGoogle");
  if (!connected.tiktok) out.push("adTiktok");
  // adOther / otherMarketing are always manual, but optional — listed separately, never blocking.
  return out;
}
