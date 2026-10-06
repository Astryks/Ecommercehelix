export type DayInput = {
  date: string;
  orders: number;
  newCustomerOrders: number;
  units: number;
  sessions: number;
  revenue: number;
  newCustomerRevenue: number;
  discounts: number;
  refunds: number;
  cogs: number;
  shipping: number;
  paymentFees: number;
  adMeta: number;
  adGoogle: number;
  adTiktok: number;
  adOther: number;
  otherMarketing: number;
  metaRevenue: number;
  googleRevenue: number;
  tiktokRevenue: number;
  source?: string;
  example?: boolean;
};

export type Settings = { monthlyRevenueTarget: number; targetMerPct: number; fixedCostsMonthly: number };

export type ProductLine = { date: string; sku: string; name: string; units: number; price: number; unitCost: number; example?: boolean };

export const NUM_FIELDS = [
  "orders", "newCustomerOrders", "units", "sessions", "revenue", "newCustomerRevenue", "discounts", "refunds",
  "cogs", "shipping", "paymentFees", "adMeta", "adGoogle", "adTiktok", "adOther", "otherMarketing",
  "metaRevenue", "googleRevenue", "tiktokRevenue",
] as const;

export const FIELD_LABELS: Record<(typeof NUM_FIELDS)[number], string> = {
  orders: "Orders", newCustomerOrders: "New-customer orders", units: "Units sold", sessions: "Sessions",
  revenue: "Gross sales ($)", newCustomerRevenue: "New-customer sales ($)", discounts: "Discounts ($)", refunds: "Refunds ($)",
  cogs: "Product cost / COGS ($)", shipping: "Shipping and fulfilment ($)", paymentFees: "Payment fees ($)",
  adMeta: "Meta ad spend ($)", adGoogle: "Google ad spend ($)", adTiktok: "TikTok ad spend ($)", adOther: "Other ad spend ($)",
  otherMarketing: "Other marketing ($)", metaRevenue: "Meta-attributed sales ($)", googleRevenue: "Google-attributed sales ($)", tiktokRevenue: "TikTok-attributed sales ($)",
};

export type Derived = ReturnType<typeof derive>;

const div = (a: number, b: number) => (b ? a / b : 0);

export function sum(days: DayInput[]): DayInput {
  const z = { date: "", orders: 0, newCustomerOrders: 0, units: 0, sessions: 0, revenue: 0, newCustomerRevenue: 0, discounts: 0, refunds: 0, cogs: 0, shipping: 0, paymentFees: 0, adMeta: 0, adGoogle: 0, adTiktok: 0, adOther: 0, otherMarketing: 0, metaRevenue: 0, googleRevenue: 0, tiktokRevenue: 0 } as DayInput;
  for (const d of days) for (const f of NUM_FIELDS) z[f] += Number(d[f]) || 0;
  return z;
}

export function derive(d: DayInput, s: Settings, dayCount = 1) {
  const netRevenue = d.revenue - d.discounts - d.refunds;
  const adSpend = d.adMeta + d.adGoogle + d.adTiktok + d.adOther;
  const grossProfit = netRevenue - d.cogs;
  const variable = d.cogs + d.shipping + d.paymentFees;
  const contribution = netRevenue - variable - adSpend - d.otherMarketing;
  const fixedAllowance = (s.fixedCostsMonthly / 30.4) * dayCount;
  const netProfit = contribution - fixedAllowance;
  const vcr = div(variable, netRevenue);
  const aov = div(netRevenue, d.orders);
  return {
    netRevenue,
    adSpend,
    grossProfit,
    grossMarginPct: div(grossProfit, netRevenue) * 100,
    contribution,
    contributionPct: div(contribution, netRevenue) * 100,
    netProfit,
    merPct: div(adSpend, netRevenue) * 100,
    blendedCac: div(adSpend, d.newCustomerOrders),
    aCpa: div(adSpend, d.orders),
    aov,
    rpv: div(netRevenue, d.sessions),
    cr: div(d.orders, d.sessions) * 100,
    roasMeta: div(d.metaRevenue, d.adMeta),
    roasGoogle: div(d.googleRevenue, d.adGoogle),
    roasTiktok: div(d.tiktokRevenue, d.adTiktok),
    vcrPct: vcr * 100,
    breakEvenRoas: vcr < 1 ? 1 / (1 - vcr) : 0,
    breakEvenCpa: aov * (1 - vcr),
    newRevenue: d.newCustomerRevenue,
    returningRevenue: Math.max(0, netRevenue - d.newCustomerRevenue),
    revenueTarget: (s.monthlyRevenueTarget / 30.4) * dayCount,
  };
}

export type Flag = "green" | "amber" | "red";

export function flags(x: Derived, s: Settings): Record<"mer" | "contribution" | "vcr" | "target", Flag> {
  return {
    mer: x.merPct <= s.targetMerPct ? "green" : x.merPct <= s.targetMerPct * 1.15 ? "amber" : "red",
    contribution: x.contributionPct >= 15 ? "green" : x.contributionPct >= 5 ? "amber" : "red",
    vcr: x.vcrPct <= 45 ? "green" : x.vcrPct <= 55 ? "amber" : "red",
    target: x.netRevenue >= x.revenueTarget ? "green" : x.netRevenue >= x.revenueTarget * 0.85 ? "amber" : "red",
  };
}

/** CSV with a header row. Accepts our field names (case-insensitive) plus a `date` column. */
export function parseCsv(text: string): DayInput[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const head = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const out: DayInput[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((c) => c.trim());
    const row = { ...sum([]) } as DayInput;
    head.forEach((h, i) => {
      if (h === "date") row.date = cells[i];
      const f = NUM_FIELDS.find((n) => n.toLowerCase() === h);
      if (f) row[f] = Number(cells[i]) || 0;
    });
    if (/^\d{4}-\d{2}-\d{2}$/.test(row.date)) out.push({ ...row, source: "csv" });
  }
  return out;
}

/** Deterministic example data: last 21 days. */
export function exampleDays(today: string): DayInput[] {
  const out: DayInput[] = [];
  for (let i = 21; i >= 1; i--) {
    const d = new Date(today + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    const wave = Math.sin(i * 0.9) * 0.18 + (21 - i) * 0.012;
    const orders = Math.round(22 * (1 + wave));
    const revenue = Math.round(orders * (88 + Math.cos(i) * 6));
    const adMeta = Math.round(330 * (1 + wave * 0.6));
    const adGoogle = Math.round(95 + Math.sin(i) * 12);
    const adTiktok = i % 3 === 0 ? 40 : 30;
    out.push({
      date, orders, newCustomerOrders: Math.round(orders * 0.62), units: Math.round(orders * 1.45), sessions: Math.round(orders / 0.022),
      revenue, newCustomerRevenue: Math.round(revenue * 0.58), discounts: Math.round(revenue * 0.06), refunds: Math.round(revenue * 0.02),
      cogs: Math.round(revenue * 0.29), shipping: orders * 9, paymentFees: Math.round(revenue * 0.026),
      adMeta, adGoogle, adTiktok, adOther: 0, otherMarketing: 25,
      metaRevenue: Math.round(adMeta * 2.6), googleRevenue: Math.round(adGoogle * 3.4), tiktokRevenue: Math.round(adTiktok * 1.6),
      source: "example", example: true,
    });
  }
  return out;
}

export function exampleProducts(today: string): ProductLine[] {
  const items = [
    { sku: "LIN-SH-01", name: "Linen Shirt", price: 89, unitCost: 24, units: 64 },
    { sku: "LIN-PT-02", name: "Linen Pants", price: 99, unitCost: 29, units: 41 },
    { sku: "TEE-ORG-03", name: "Organic Tee", price: 45, unitCost: 11, units: 88 },
    { sku: "CAP-04", name: "Canvas Cap", price: 35, unitCost: 9, units: 37 },
    { sku: "BUN-05", name: "Weekend Bundle", price: 159, unitCost: 46, units: 19 },
  ];
  return items.map((p) => ({ ...p, date: today, example: true }));
}
