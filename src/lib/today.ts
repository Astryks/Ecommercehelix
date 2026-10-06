import { derive, sum, type DayInput, type Settings } from "./scorecard";

/** Plain-English daily profit summary and the quick-update estimates for the Today screen. */

export const money = (n: number) => (n < 0 ? "-" : "") + "$" + Math.abs(Math.round(n)).toLocaleString("en-AU");

/** Cost ratios from the last 30 days with sales, used to estimate costs the user did not type in. */
export function costRatios(days: DayInput[]) {
  const recent = days.filter((d) => d.revenue > 0).slice(-30);
  const t = sum(recent);
  if (!t.revenue) return { cogs: 0.3, shippingPerOrder: 9, fees: 0.026, discounts: 0.05, refunds: 0.02, fromHistory: false };
  return {
    cogs: t.cogs / t.revenue,
    shippingPerOrder: t.orders ? t.shipping / t.orders : 0,
    fees: t.paymentFees / t.revenue,
    discounts: t.discounts / t.revenue,
    refunds: t.refunds / t.revenue,
    fromHistory: true,
  };
}

/** Merge a quick update (sales, orders, ad spend) into a day, estimating costs that are still empty. */
export function quickMerge(existing: DayInput | undefined, date: string, q: { revenue: number; orders: number; adMeta: number; adGoogle: number }, ratios: ReturnType<typeof costRatios>): DayInput {
  const base = existing ?? ({ ...sum([]), date } as DayInput);
  // Keep costs the user typed exactly (Scorecard, CSV or store sync); estimate the rest.
  const exact = Boolean(existing && ["manual", "csv", "shopify"].includes(existing.source ?? ""));
  const est = (cur: number, v: number) => (exact && cur > 0 ? cur : Math.round(v * 100) / 100);
  return {
    ...base,
    date,
    revenue: q.revenue,
    orders: q.orders,
    adMeta: q.adMeta,
    adGoogle: q.adGoogle,
    cogs: est(base.cogs, q.revenue * ratios.cogs),
    shipping: est(base.shipping, q.orders * ratios.shippingPerOrder),
    paymentFees: est(base.paymentFees, q.revenue * ratios.fees),
    discounts: est(base.discounts, q.revenue * ratios.discounts),
    refunds: est(base.refunds, q.revenue * ratios.refunds),
    source: existing?.source === "meta" || !existing ? "quick" : existing.source,
    example: false,
  };
}

export type TodaySummary = {
  hasDay: boolean;
  profit: number;
  sales: number;
  orders: number;
  adSpend: number;
  costPerSale: number;
  avgProfit: number;
  meaning: string;
  tone: "good" | "ok" | "bad" | "empty";
};

export function summarise(days: DayInput[], yesterday: string, s: Settings): TodaySummary {
  const y = days.find((d) => d.date === yesterday && (d.revenue > 0 || d.orders > 0));
  const prior = days.filter((d) => d.date < yesterday && d.revenue > 0).slice(-7);
  const avg = prior.length ? derive(sum(prior), s, prior.length).contribution / prior.length : 0;
  if (!y) {
    return { hasDay: false, profit: 0, sales: 0, orders: 0, adSpend: 0, costPerSale: 0, avgProfit: avg, tone: "empty",
      meaning: "Add yesterday's sales, orders and ad spend below. It takes a minute, and then you will see if yesterday made money." };
  }
  const x = derive(y, s);
  const p = x.contribution;
  const avgOrders = prior.length ? sum(prior).orders / prior.length : 0;
  const avgAds = prior.length ? (sum(prior).adMeta + sum(prior).adGoogle + sum(prior).adTiktok + sum(prior).adOther) / prior.length : 0;
  let meaning: string;
  let tone: TodaySummary["tone"];
  if (p < 0) {
    tone = "bad";
    meaning = x.adSpend > 0 && x.merPct > s.targetMerPct
      ? `Yesterday lost money. Ads cost ${money(x.adSpend)} for ${money(x.netRevenue)} of sales, which is too much. Today, open Your ads and pause the ones marked Stop.`
      : `Yesterday lost money. Costs were bigger than what you kept from ${y.orders} orders. Today, check your product costs and shipping on the Scorecard.`;
  } else if (!prior.length) {
    tone = "ok";
    meaning = `Yesterday made ${money(p)} profit. Keep adding your numbers each morning so Helix can compare days.`;
  } else if (p >= avg * 1.1) {
    tone = "good";
    meaning = `Better than your 7-day average of ${money(avg)}. Keep doing what worked and do today's lesson below.`;
  } else if (p >= avg * 0.9) {
    tone = "ok";
    meaning = `About the same as your 7-day average of ${money(avg)}. Steady is good. Do today's lesson to push it up.`;
  } else {
    tone = "bad";
    const why = y.orders < avgOrders * 0.9 ? `You had ${y.orders} orders, fewer than your usual ${Math.round(avgOrders)}.` : x.adSpend > avgAds * 1.1 ? `Ad spend was ${money(x.adSpend)}, more than your usual ${money(avgAds)}, without extra sales.` : "Costs took a bigger bite than usual.";
    meaning = `Lower than your 7-day average of ${money(avg)}. ${why}`;
  }
  return { hasDay: true, profit: p, sales: x.netRevenue, orders: y.orders, adSpend: x.adSpend, costPerSale: x.aCpa, avgProfit: avg, meaning, tone };
}
