/**
 * Profit setup: what one order really leaves you, cost layer by cost layer,
 * and a plain guide for marketing as a share of sales. Pure and client-safe.
 */
export type ProfitInputs = {
  price: number; // what the customer pays, before GST/VAT
  productCost: number; // making or buying one unit (COGS)
  freightDuty: number; // getting it to your warehouse: freight, duty, customs, per unit
  packaging: number; // box, mailer, tissue, inserts per order
  shipToCustomer: number; // postage per order you pay (after any shipping the customer pays)
  feePct: number; // payment fee %, e.g. 1.75
  feeFixed: number; // payment fee per order, e.g. 0.30
  marketingPerOrder: number; // ad and marketing spend per order (or monthly marketing / orders)
  subscriptions: number; // Shopify or website, apps and tools, per month
  otherFixed: number; // other monthly fixed costs: wages, rent, software, accounting
  ordersPerMonth: number;
};

export const EXAMPLE_INPUTS: ProfitInputs = {
  price: 60, productCost: 12, freightDuty: 3, packaging: 1.5, shipToCustomer: 9, feePct: 1.75, feeFixed: 0.3,
  marketingPerOrder: 15, subscriptions: 180, otherFixed: 400, ordersPerMonth: 200,
};

export type Layer = { key: string; label: string; cost: number; left: number; plain: string };

const r2 = (n: number) => Math.round(n * 100) / 100;

export function waterfall(i: ProfitInputs) {
  const fees = r2((i.price * i.feePct) / 100 + i.feeFixed);
  const fixedPerOrder = i.ordersPerMonth > 0 ? r2((i.subscriptions + i.otherFixed) / i.ordersPerMonth) : 0;
  const steps: Omit<Layer, "left">[] = [
    { key: "product", label: "Product cost (COGS)", cost: i.productCost, plain: "What it costs to make or buy one." },
    { key: "landed", label: "Freight and duty to your warehouse", cost: i.freightDuty, plain: "Shipping it from the factory, plus duty and customs. Product cost plus this is your landed cost." },
    { key: "fees", label: "Payment fees", cost: fees, plain: "What Shopify Payments, other payment providers or buy now pay later keep." },
    { key: "packaging", label: "Packaging", cost: i.packaging, plain: "Mailer, box, tissue and inserts." },
    { key: "shipping", label: "Shipping to the customer", cost: i.shipToCustomer, plain: "Postage you pay to send the order." },
    { key: "marketing", label: "Marketing", cost: i.marketingPerOrder, plain: "Ads and other marketing, per order." },
    { key: "fixed", label: "Your share of fixed costs", cost: fixedPerOrder, plain: "Shopify, apps, wages and other monthly bills, spread over your orders." },
  ];
  let left = i.price;
  const layers: Layer[] = steps.map((s) => {
    left = r2(left - s.cost);
    return { ...s, left };
  });
  const landed = r2(i.productCost + i.freightDuty);
  const beforeMarketing = r2(i.price - landed - fees - i.packaging - i.shipToCustomer);
  const contribution = r2(beforeMarketing - i.marketingPerOrder);
  const netPerOrder = left;
  const pct = (n: number) => (i.price ? (n / i.price) * 100 : 0);
  const breakEvenMerPct = pct(beforeMarketing);
  return {
    sales: i.price,
    layers,
    landed,
    fees,
    grossProfit: r2(i.price - landed),
    grossMarginPct: pct(i.price - landed),
    beforeMarketing,
    contribution,
    netPerOrder,
    netMarginPct: pct(netPerOrder),
    breakEvenMerPct,
    breakEvenRoas: breakEvenMerPct > 0 ? 100 / breakEvenMerPct : 0,
    breakEvenCpa: Math.max(0, beforeMarketing),
    month: {
      orders: i.ordersPerMonth,
      sales: r2(i.price * i.ordersPerMonth),
      marketing: r2(i.marketingPerOrder * i.ordersPerMonth),
      fixed: r2(i.subscriptions + i.otherFixed),
      net: r2(contribution * i.ordersPerMonth - (i.subscriptions + i.otherFixed)),
    },
  };
}

// ---------- marketing as a share of sales ----------

export type MarketingBand = { stage: "pre" | "growing" | "scaling"; low: number | null; high: number | null; title: string; guide: string };

/** A guide, not a rule: what total marketing commonly runs at, by monthly sales. */
export function marketingGuide(monthlySales: number): MarketingBand {
  if (monthlySales < 5000)
    return { stage: "pre", low: null, high: null, title: "No percentage target yet", guide: "Before your first sales, or under about $5,000 a month, a percentage of sales means little. Set a small fixed test budget you can afford to lose (for example $20 to $50 a day for two weeks) and judge each test by its cost per purchase against your break-even cost per purchase." };
  if (monthlySales < 80_000)
    return { stage: "growing", low: 10, high: 30, title: "Guide: 10% to 30% of sales", guide: "Growing stores commonly spend about 10% to 30% of sales on all marketing, depending on margin and stage. Newer brands buying growth sit near the top. Stay below your break-even MER, and leave room for profit." };
  return { stage: "scaling", low: 15, high: 25, title: "Guide: 15% to 25% of sales", guide: "Many scaling brands sit around 15% to 25% of sales on all marketing. Spending more is fine while contribution margin stays positive and more customers come back to buy again." };
}

export type MarketingRead = { tone: "green" | "amber" | "red" | "none"; text: string };

/** Compare actual marketing % of sales with the guide band and the store's own break-even. */
export function readMarketing(marketingPct: number, monthlySales: number, breakEvenMerPct: number): MarketingRead {
  const g = marketingGuide(monthlySales);
  if (g.stage === "pre") return { tone: "none", text: g.title + ". Track cost per purchase instead." };
  if (breakEvenMerPct > 0 && marketingPct >= breakEvenMerPct) return { tone: "red", text: `Marketing is ${marketingPct.toFixed(1)}% of sales, at or above your break-even of ${breakEvenMerPct.toFixed(0)}%. Each sale loses money after marketing.` };
  if (g.high !== null && marketingPct > g.high) return { tone: "amber", text: `Marketing is ${marketingPct.toFixed(1)}% of sales, above the usual ${g.low}% to ${g.high}%. Fine while you are profitable, but watch it.` };
  if (g.low !== null && marketingPct < g.low) return { tone: "green", text: `Marketing is ${marketingPct.toFixed(1)}% of sales, below the usual ${g.low}% to ${g.high}%. Lean and profitable; you may have room to spend more to grow.` };
  return { tone: "green", text: `Marketing is ${marketingPct.toFixed(1)}% of sales, inside the usual ${g.low}% to ${g.high}%.` };
}
