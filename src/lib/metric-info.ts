import type { Flag, Settings } from "./scorecard";
import { change, rateContributionPct, rateCpa, rateGrossMargin, rateMer, rateNetProfit, rateRefunds, rateRoas, rateVsTarget, type Metrics } from "./analytics";

/**
 * Every metric card on the Dashboard: value, rating and a plain-words explanation
 * (what it means, how it is calculated with the user's own numbers, what a good number is).
 * Benchmarks are general guides, not guarantees. Ratings use the user's own break-even lines.
 */

export type Card = {
  key: string;
  label: string;
  value: string;
  sub?: string;
  flag: Flag | null;
  /** % change vs previous period, and whether up is good. */
  delta: number | null;
  better: "up" | "down" | null;
  info: { what: string; how: string; good: string };
};

const $ = (n: number, dp = 0) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-AU", { maximumFractionDigits: dp, minimumFractionDigits: dp });
const pct = (n: number, dp = 0) => `${n.toFixed(dp)}%`;
const x2 = (n: number) => `${n.toFixed(2)}x`;
const GUIDE = "These ranges are general guides for online stores, not guarantees. Your own break-even line matters most.";

export function metricCards(m: Metrics, p: Metrics | null, s: Settings): Card[] {
  const d = (a: number, b: number | undefined) => (p && p.dataDays ? change(a, b) : null);
  const be = m.breakEvenRoas;
  const beCpa = m.breakEvenCpa;
  const cards: Card[] = [
    {
      key: "revenue", label: "Revenue (net sales)", value: $(m.netRevenue), sub: `Target ${$(m.revenueTarget)}`, flag: rateVsTarget(m.netRevenue, m.revenueTarget),
      delta: d(m.netRevenue, p?.netRevenue), better: "up",
      info: {
        what: "The money customers paid you, after discounts and refunds. This is the real size of your sales.",
        how: `Gross sales ${$(m.grossRevenue)} minus discounts ${$(m.discounts)} minus refunds ${$(m.refunds)} = ${$(m.netRevenue)}. Added up from your daily numbers.`,
        good: `Green when you hit your sales target for this period (${$(m.revenueTarget)}, from your monthly target of ${$(s.monthlyRevenueTarget)}). Amber within 15% of it. Red further below. Sales only matter if profit follows, so read this next to profit.`,
      },
    },
    {
      key: "orders", label: "Orders", value: m.orders.toLocaleString("en-AU"), sub: `${(m.orders / m.calendarDays).toFixed(1)} a day`, flag: null,
      delta: d(m.orders, p?.orders), better: "up",
      info: {
        what: "How many separate purchases were made.",
        how: `Added up from your daily numbers: ${m.orders} orders over ${m.calendarDays} days.`,
        good: "There is no single good number. Watch the trend against the previous period. More orders at the same or better profit per order is growth.",
      },
    },
    {
      key: "aov", label: "Average order value (AOV)", value: $(m.aov, 2), flag: null, delta: d(m.aov, p?.aov), better: "up",
      info: {
        what: "How much a customer spends in one order, on average.",
        how: `Revenue ${$(m.netRevenue)} ÷ orders ${m.orders} = ${$(m.aov, 2)}.`,
        good: "No universal target. A higher AOV means you can afford to pay more for each customer. Bundles, gifts and a free shipping threshold a little above your usual order help lift it.",
      },
    },
    {
      key: "cogs", label: "Product cost (COGS)", value: $(m.cogs), sub: `${pct(m.netRevenue ? (m.cogs / m.netRevenue) * 100 : 0)} of revenue`, flag: null, delta: d(m.cogs, p?.cogs), better: "down",
      info: {
        what: "What you paid suppliers for the products you sold (COGS means cost of goods sold).",
        how: `Added up from your daily numbers. When you only type sales, Helix estimates it from your recent product cost ratio. ${$(m.cogs)} ÷ revenue ${$(m.netRevenue)} = ${pct(m.netRevenue ? (m.cogs / m.netRevenue) * 100 : 0)}.`,
        good: `Many brands with healthy margins keep product cost under 30 to 35% of revenue. ${GUIDE}`,
      },
    },
    {
      key: "grossMargin", label: "Gross margin", value: pct(m.grossMarginPct, 1), sub: `Gross profit ${$(m.grossProfit)}`, flag: rateGrossMargin(m.grossMarginPct),
      delta: d(m.grossMarginPct, p?.grossMarginPct), better: "up",
      info: {
        what: "The share of each $1 of sales left after paying for the product itself.",
        how: `(Revenue ${$(m.netRevenue)} minus product cost ${$(m.cogs)}) ÷ revenue = ${pct(m.grossMarginPct, 1)}.`,
        good: `General guide: 60% or more is healthy, 45 to 60% is workable, under 45% makes paid ads hard. ${GUIDE}`,
      },
    },
    {
      key: "adSpend", label: "Ad spend", value: $(m.adSpend), sub: [m.t.adMeta && `Meta ${$(m.t.adMeta)}`, m.t.adGoogle && `Google ${$(m.t.adGoogle)}`, m.t.adTiktok && `TikTok ${$(m.t.adTiktok)}`].filter(Boolean).join(" · "),
      flag: null, delta: d(m.adSpend, p?.adSpend), better: null,
      info: {
        what: "Everything you paid ad platforms in this period.",
        how: `Meta ${$(m.t.adMeta)} (synced from Meta when connected) + Google ${$(m.t.adGoogle)} + TikTok ${$(m.t.adTiktok)} + other ${$(m.t.adOther)} = ${$(m.adSpend)}.`,
        good: "There is no right amount. Spend more only while ROAS stays above your break-even ROAS and MER stays under your target. Spending more is good when profit grows with it.",
      },
    },
  ];

  const ch: [string, string, number, number, number | undefined][] = [
    ["roasMeta", "Meta", m.roasMeta, m.t.adMeta, p?.roasMeta],
    ["roasGoogle", "Google", m.roasGoogle, m.t.adGoogle, p?.roasGoogle],
    ["roasTiktok", "TikTok", m.roasTiktok, m.t.adTiktok, p?.roasTiktok],
  ];
  for (const [key, name, roas, spend, prevRoas] of ch) {
    if (!spend) continue;
    cards.push({
      key, label: `ROAS: ${name}`, value: x2(roas), sub: `Break-even ${x2(be)}`, flag: rateRoas(roas, be), delta: d(roas, prevRoas), better: "up",
      info: {
        what: `ROAS (return on ad spend) shows how many dollars of sales ${name} says each $1 of ads brought in.`,
        how: `Sales ${name} reports ${$(name === "Meta" ? m.t.metaRevenue : name === "Google" ? m.t.googleRevenue : m.t.tiktokRevenue)} ÷ ${name} ad spend ${$(spend)} = ${x2(roas)}.`,
        good: `Compare it with your break-even ROAS of ${x2(be)}. Green when at least 20% above it (${x2(be * 1.2)}), amber between ${x2(be)} and ${x2(be * 1.2)}, red below ${x2(be)} (those ads lose money). Platforms count sales they think they caused, so their ROAS often looks better than reality. MER is the honest cross-check.`,
      },
    });
  }

  cards.push(
    {
      key: "mer", label: "MER (ad spend ÷ revenue)", value: pct(m.merPct, 1), sub: `Target ${pct(s.targetMerPct)} · break-even ${pct(m.breakEvenMerPct)}`, flag: rateMer(m.merPct, s.targetMerPct, m.breakEvenMerPct),
      delta: d(m.merPct, p?.merPct), better: "down",
      info: {
        what: "MER (marketing efficiency ratio) is the share of all your sales that went on ads. Unlike platform ROAS, it uses your real total sales, so no platform can overcount.",
        how: `All ad spend ${$(m.adSpend)} ÷ revenue ${$(m.netRevenue)} = ${pct(m.merPct, 1)}. The same thing as a blended ROAS of ${x2(m.blendedRoas)}.`,
        good: `Green at or under your target of ${pct(s.targetMerPct)} (set in Your numbers). Amber above target but under your break-even MER of ${pct(m.breakEvenMerPct)} (the point where ads eat all the margin left after product, shipping and fees). Red above that. Many growing stores sit between 20 and 35%. ${GUIDE}`,
      },
    },
    {
      key: "cac", label: "Blended CAC", value: $(m.blendedCac, 2), sub: `Break-even CPA ${$(beCpa, 2)}`, flag: rateCpa(m.blendedCac, beCpa), delta: d(m.blendedCac, p?.blendedCac), better: "down",
      info: {
        what: "CAC (customer acquisition cost) is what you pay in ads, on average, to win one new customer.",
        how: `All ad spend ${$(m.adSpend)} ÷ new-customer orders ${m.t.newCustomerOrders} = ${$(m.blendedCac, 2)}.`,
        good: `Below your break-even CPA of ${$(beCpa, 2)} means even a customer's first order pays for the ad. Green at 15% or more below it, amber up to it, red above it. A CAC above break-even can still work if customers come back often, but it is riskier.`,
      },
    },
    {
      key: "cpo", label: "Cost per order", value: $(m.aCpa, 2), sub: `Break-even CPA ${$(beCpa, 2)}`, flag: rateCpa(m.aCpa, beCpa), delta: d(m.aCpa, p?.aCpa), better: "down",
      info: {
        what: "How much ad money you spend for each order, new or returning.",
        how: `All ad spend ${$(m.adSpend)} ÷ all orders ${m.orders} = ${$(m.aCpa, 2)}.`,
        good: `Below your break-even CPA of ${$(beCpa, 2)}. Green at 15% or more below it (${$(beCpa * 0.85, 2)}), amber up to it, red above it.`,
      },
    },
    {
      key: "beRoas", label: "Break-even ROAS", value: x2(be), sub: `Quick rule (1 ÷ gross margin): ${x2(m.simpleBreakEvenRoas)}`, flag: null, delta: null, better: null,
      info: {
        what: "The lowest ROAS at which ads pay for themselves. Below it, every sale from ads loses money.",
        how: `1 ÷ your margin before ads. After product cost, shipping and payment fees you keep ${pct(m.marginBeforeAds * 100, 1)} of each $1 of sales, so 1 ÷ ${m.marginBeforeAds.toFixed(2)} = ${x2(be)}. The quick rule, 1 ÷ gross margin (${pct(m.grossMarginPct, 1)}), gives ${x2(m.simpleBreakEvenRoas)} but ignores shipping and fees.`,
        good: "It is a line, not a goal. Aim for ROAS at least 20% above it so there is money left for fixed costs and profit. Lower costs or higher prices bring the line down.",
      },
    },
    {
      key: "beCpa", label: "Break-even CPA", value: $(beCpa, 2), flag: null, delta: null, better: null,
      info: {
        what: "The most you can pay in ads for one order and still make $0 on it. CPA means cost per acquisition (per order).",
        how: `Average order ${$(m.aov, 2)} × margin before ads ${pct(m.marginBeforeAds * 100, 1)} = ${$(beCpa, 2)}.`,
        good: "Keep your cost per order below it. The further below, the more profit each order makes before fixed costs.",
      },
    },
    {
      key: "contribution", label: "Contribution profit", value: $(m.contribution), sub: `Margin ${pct(m.contributionPct, 1)}`, flag: rateContributionPct(m.contributionPct),
      delta: d(m.contribution, p?.contribution), better: "up",
      info: {
        what: "What your sales leave you after every cost that grows with sales: product, shipping, fees, ads and other marketing. It is the money that pays your fixed bills and your profit.",
        how: `Revenue ${$(m.netRevenue)} minus product ${$(m.cogs)}, shipping ${$(m.shipping)}, fees ${$(m.fees)}, ads ${$(m.adSpend)} and other marketing ${$(m.otherMarketing)} = ${$(m.contribution)}. Margin: ${$(m.contribution)} ÷ ${$(m.netRevenue)} = ${pct(m.contributionPct, 1)}.`,
        good: `General guide: a contribution margin of 15% or more is healthy (green), 5 to 15% is thin (amber), under 5% is risky (red). ${GUIDE}`,
      },
    },
    {
      key: "netProfit", label: "Net profit (after fixed costs)", value: $(m.netProfit), sub: `${pct(m.netRevenue ? (m.netProfit / m.netRevenue) * 100 : 0, 1)} of revenue`, flag: rateNetProfit(m.netProfit, m.netRevenue),
      delta: d(m.netProfit, p?.netProfit), better: "up",
      info: {
        what: "What the business actually made after everything, including fixed bills like rent, software, staff and your wage.",
        how: `Contribution profit ${$(m.contribution)} minus fixed costs for these ${m.calendarDays} days ${$(m.fixedCosts)} (your ${$(s.fixedCostsMonthly)} a month, shared out per day) = ${$(m.netProfit)}.`,
        good: `Above $0 is green: the business pays for itself. Amber when the loss is under 5% of revenue, red beyond that. Many healthy online stores make 10 to 20% net. ${GUIDE}`,
      },
    },
    {
      key: "newReturning", label: "New vs returning revenue", value: `${pct(m.newSharePct)} new`, sub: `${$(Math.min(m.newRevenue, m.netRevenue))} new · ${$(m.returningRevenue)} returning`, flag: null,
      delta: d(m.returningRevenue, p?.returningRevenue), better: "up",
      info: {
        what: "How much of your sales came from first-time buyers versus customers who bought before.",
        how: `New-customer sales ${$(Math.min(m.newRevenue, m.netRevenue))} ÷ revenue ${$(m.netRevenue)} = ${pct(m.newSharePct)}. Returning is the rest. The change arrow shows returning revenue.`,
        good: "Returning customers making 20 to 40% of revenue is common for growing stores. Higher means loyalty is strong. Very low means you rely on ads to find every sale. General guide, not a guarantee.",
      },
    },
    {
      key: "refunds", label: "Refund rate", value: pct(m.refundRatePct, 1), sub: `${$(m.refunds)} refunded`, flag: rateRefunds(m.refundRatePct), delta: d(m.refundRatePct, p?.refundRatePct), better: "down",
      info: {
        what: "The share of sales you gave back as refunds.",
        how: `Refunds ${$(m.refunds)} ÷ gross sales ${$(m.grossRevenue)} = ${pct(m.refundRatePct, 1)}.`,
        good: "General guide: under 3% is good (green), 3 to 8% is worth watching (amber), above 8% needs a look at product quality, sizing or descriptions (red). Clothing and shoes often run higher.",
      },
    },
  );
  return cards;
}
