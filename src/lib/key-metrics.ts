import type { Metrics } from "./analytics";
import type { Settings } from "./scorecard";

/**
 * The key metrics panel: for every number, who fills it in (you, Helix, or Helix
 * once you connect a tool), exactly where to find it, and what a good number looks like.
 * Pure, so it can be tested and reused by the daily form.
 */
export type MetricSource =
  | { kind: "manual"; where: string }
  | { kind: "auto"; how: string }
  | { kind: "connect"; tool: "Meta" | "Shopify"; href: string; connected: boolean; until: string };

export type Tone = "green" | "amber" | "red" | "none";
export type KeyMetric = {
  id: string;
  name: string;
  plain: string;
  value: string;
  raw: number | null;
  good: string;
  tone: Tone;
  source: MetricSource;
  learn: string;
};

export type MetricsContext = { settings: Settings; metaConnected: boolean; metaSynced: boolean; metaCtr: number | null; shopifyConnected: boolean };

const money = (n: number, dp = 0) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const pct = (n: number) => `${n.toFixed(1)}%`;
const x = (n: number) => (n ? `${n.toFixed(2)}x` : "n/a");
const band = (v: number, green: number, amber: number, higherIsBetter = true): Tone =>
  higherIsBetter ? (v >= green ? "green" : v >= amber ? "amber" : "red") : v <= green ? "green" : v <= amber ? "amber" : "red";

export function keyMetrics(m: Metrics, prev: Metrics | null, c: MetricsContext): KeyMetric[] {
  const s = c.settings;
  const rev = m.netRevenue;
  const share = (v: number) => (rev ? (v / rev) * 100 : 0);
  const meta = (until: string): MetricSource => ({ kind: "connect", tool: "Meta", href: "/dashboard/integrations", connected: c.metaConnected, until });
  const sessionsUp = prev?.t.sessions ? m.t.sessions >= prev.t.sessions : null;
  const pace = m.revenueTarget ? (rev / m.revenueTarget) * 100 : 0;
  const atc = m.t.sessions ? ((m.t.addToCarts ?? 0) / m.t.sessions) * 100 : 0;
  return [
    {
      id: "sessions", name: "Sessions", plain: "Visits to your store.", value: m.t.sessions.toLocaleString("en-AU"), raw: m.t.sessions,
      good: "Growing week on week", tone: sessionsUp === null ? "none" : sessionsUp ? "green" : "amber",
      source: { kind: "manual", where: "Shopify admin > Analytics > Reports > Sessions over time. Type yesterday's number." }, learn: "/learn/02-diagnose-and-fix",
    },
    {
      id: "ctr", name: "CTR (click-through rate)", plain: "Share of people who saw your ad and clicked through to your store.", value: c.metaCtr !== null ? pct(c.metaCtr) : "Connect Meta", raw: c.metaCtr,
      good: "1% or more on cold Meta ads (1.2% or more is strong)", tone: c.metaCtr === null ? "none" : band(c.metaCtr, 1, 0.7),
      source: meta("Until then, read Link CTR in Meta Ads Manager > Campaigns > Columns: Performance and clicks."), learn: "/learn/08-meta-ads",
    },
    {
      id: "atc", name: "Add-to-cart rate", plain: "Share of visits where someone added a product to the cart.", value: m.t.addToCarts ? pct(atc) : "Not filled in", raw: m.t.addToCarts ? atc : null,
      good: "About 6% or more of sessions", tone: m.t.addToCarts ? band(atc, 6, 4) : "none",
      source: { kind: "manual", where: "Optional. Shopify admin > Analytics > Reports > Conversion rate over time > Sessions with cart additions." }, learn: "/learn/14-website-and-cro",
    },
    {
      id: "cr", name: "Conversion rate", plain: "Share of visits that become an order (orders divided by sessions).", value: pct(m.cr), raw: m.cr,
      good: "2% or more is solid (many stores sit between 1 and 3%)", tone: m.t.sessions ? band(m.cr, 2, 1) : "none",
      source: { kind: "auto", how: "Helix works it out from your orders and sessions." }, learn: "/learn/14-website-and-cro",
    },
    {
      id: "aov", name: "AOV (average order value)", plain: "What the average order is worth (revenue divided by orders).", value: money(m.aov, 2), raw: m.aov,
      good: "At least 1.5 times your cost per order from ads", tone: m.aCpa ? band(m.aov / m.aCpa, 1.5, 1.1) : "none",
      source: { kind: "auto", how: "Helix works it out from revenue and orders." }, learn: "/learn/15-offer-and-product",
    },
    {
      id: "revenue", name: "Revenue", plain: "Sales after discounts and refunds, without GST or VAT.", value: money(rev), raw: rev,
      good: `On pace for your ${money(s.monthlyRevenueTarget)} monthly target`, tone: m.revenueTarget ? band(pace, 100, 85) : "none",
      source: { kind: "manual", where: "Shopify admin > Analytics > Reports > Total sales over time. Type the Gross sales and Orders columns for yesterday. Helix takes off discounts and returns." }, learn: "/learn/01-daily-profit-foundations",
    },
    {
      id: "adspend", name: "Ad spend", plain: "Everything you paid Meta, Google, TikTok and others for ads.", value: money(m.adSpend), raw: m.adSpend,
      good: `Inside your target MER of ${s.targetMerPct}%`, tone: rev ? band(m.merPct, s.targetMerPct, s.targetMerPct * 1.15, false) : "none",
      source: meta(c.metaConnected ? "Meta spend fills in daily. Type Google and TikTok spend yourself (Google Ads > Campaigns > Cost; TikTok Ads Manager > Cost)." : "Until then type spend from Meta Ads Manager > Amount spent, Google Ads > Cost and TikTok Ads Manager > Cost."), learn: "/learn/07-defining-campaigns",
    },
    {
      id: "roas", name: "ROAS and MER", plain: "ROAS (return on ad spend): sales from ads divided by ad spend. MER (marketing efficiency ratio): Helix shows it as all ad spend as a % of all revenue. Many tools show it the other way round, as sales ÷ ad spend (30% is about 3.3x).", value: `${x(m.blendedRoas)} · MER ${pct(m.merPct)}`, raw: m.blendedRoas,
      good: `ROAS above break-even ${x(m.breakEvenRoas)}; MER at or under ${s.targetMerPct}%`, tone: m.adSpend ? (m.blendedRoas >= m.breakEvenRoas * 1.2 ? "green" : m.blendedRoas >= m.breakEvenRoas ? "amber" : "red") : "none",
      source: { kind: "auto", how: c.metaConnected ? "Helix works out MER from your totals and reads Meta ROAS from your synced account." : "Helix works out MER and blended ROAS from your totals. Meta ROAS appears once you connect Meta." }, learn: "/learn/01-daily-profit-foundations",
    },
    {
      id: "cpa", name: "CPA (cost per acquisition)", plain: "What you spend on ads for each order.", value: money(m.aCpa, 2), raw: m.aCpa,
      good: `Under your break-even CPA of ${money(m.breakEvenCpa, 2)}`, tone: m.aCpa ? band(m.aCpa, m.breakEvenCpa * 0.85, m.breakEvenCpa, false) : "none",
      source: { kind: "auto", how: "Helix works it out: ad spend divided by orders." }, learn: "/learn/01-daily-profit-foundations",
    },
    {
      id: "cogs", name: "COGS (cost of goods sold)", plain: "What the products you sold cost you, landed (product, freight and duty).", value: `${money(m.cogs)} · ${pct(share(m.cogs))}`, raw: share(m.cogs),
      good: "35% of revenue or less", tone: rev ? band(share(m.cogs), 35, 45, false) : "none",
      source: { kind: "manual", where: "Shopify admin > Analytics > Reports > Profit by product (needs Cost per item on each product; not on every Shopify plan). Leave blank and Helix estimates it from your recent days." }, learn: "/learn/15-offer-and-product",
    },
    {
      id: "shipping", name: "Shipping and fulfilment", plain: "Postage, packaging and any warehouse fees for the orders you sent.", value: `${money(m.shipping)} · ${pct(share(m.shipping))}`, raw: share(m.shipping),
      good: "10% of revenue or less", tone: rev ? band(share(m.shipping), 10, 14, false) : "none",
      source: { kind: "manual", where: "Your Shopify bills (Settings > Billing) for shipping labels, or your carrier or 3PL invoice. Leave blank and Helix estimates it per order." }, learn: "/learn/21-fulfilment-shipping-returns",
    },
    {
      id: "fees", name: "Payment fees", plain: "What Shopify Payments, other payment providers and buy now pay later keep from each sale.", value: `${money(m.fees)} · ${pct(share(m.fees))}`, raw: share(m.fees),
      good: "2% to 3% of revenue", tone: rev ? band(share(m.fees), 3, 4, false) : "none",
      source: { kind: "auto", how: "Helix estimates fees from your fee rate. Type the real number from your payout report if you have it." }, learn: "/learn/20-payments-fraud-chargebacks",
    },
    {
      id: "contribution", name: "Contribution margin", plain: "What is left after product, shipping, fees and marketing, before fixed costs.", value: `${money(m.contribution)} · ${pct(m.contributionPct)}`, raw: m.contributionPct,
      good: "15% of revenue or more", tone: rev ? band(m.contributionPct, 15, 5) : "none",
      source: { kind: "auto", how: "Helix works it out from everything above." }, learn: "/learn/01-daily-profit-foundations",
    },
    {
      id: "profit", name: "Net profit", plain: "What you keep after every cost, including your fixed costs (rent, software, wages).", value: `${money(m.netProfit)} · ${pct(share(m.netProfit))}`, raw: share(m.netProfit),
      good: "10% of revenue or more", tone: rev ? band(share(m.netProfit), 10, 0) : "none",
      source: { kind: "auto", how: `Helix works it out, spreading your ${money(s.fixedCostsMonthly)} monthly fixed costs evenly over each day.` }, learn: "/learn/01-daily-profit-foundations",
    },
  ];
}

/** Which metrics fall in each group, for the summary at the top of the panel. */
export function splitBySource(list: KeyMetric[]) {
  return {
    manual: list.filter((k) => k.source.kind === "manual"),
    auto: list.filter((k) => k.source.kind === "auto"),
    connect: list.filter((k) => k.source.kind === "connect"),
  };
}
