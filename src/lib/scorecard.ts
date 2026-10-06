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

/** Day after the 4th Thursday of November. Kept here so scorecard stays dependency-free. */
function bfDate(y: number): string {
  const first = new Date(Date.UTC(y, 10, 1)).getUTCDay();
  const thu = 1 + ((4 - first + 7) % 7) + 21;
  return `${y}-11-${String(thu + 1).padStart(2, "0")}`;
}

/** Seasonal demand for the older example history (Australian retail calendar). */
function seasonFor(date: string): { demand: number; discount: number; roas: number; refunds: number } {
  const y = Number(date.slice(0, 4));
  const md = date.slice(5);
  const bf = bfDate(y);
  const dayDiff = Math.round((Date.parse(date) - Date.parse(bf)) / 86_400_000);
  if (dayDiff >= -2 && dayDiff <= 3) return { demand: 2.7, discount: 0.2, roas: 1.45, refunds: 0.03 };
  if (md >= "11-01" && dayDiff < -2) return { demand: 0.88, discount: 0.06, roas: 0.9, refunds: 0.02 };
  if (md >= "12-01" && md <= "12-18") return { demand: 1.35, discount: 0.07, roas: 1.15, refunds: 0.02 };
  if (md >= "12-19" && md <= "12-25") return { demand: 0.75, discount: 0.06, roas: 0.95, refunds: 0.02 };
  if (md >= "12-26" || md <= "01-05") return { demand: 1.4, discount: 0.15, roas: 1.25, refunds: 0.03 };
  if (md <= "01-31") return { demand: 0.85, discount: 0.06, roas: 0.95, refunds: 0.045 };
  if (md >= "02-07" && md <= "02-13") return { demand: 1.15, discount: 0.06, roas: 1.05, refunds: 0.02 };
  if (md >= "02-20" && md <= "03-20") return { demand: 0.95, discount: 0.06, roas: 0.72, refunds: 0.02 }; // tired ads: a red patch to learn from
  if (md >= "05-01" && md <= "05-10") return { demand: 1.3, discount: 0.06, roas: 1.15, refunds: 0.02 };
  if (md >= "06-15" && md <= "06-30") return { demand: 1.35, discount: 0.12, roas: 1.2, refunds: 0.025 };
  if (md >= "08-25" && md <= "09-06") return { demand: 1.15, discount: 0.06, roas: 1.05, refunds: 0.02 };
  return { demand: 1, discount: 0.06, roas: 1, refunds: 0.02 };
}

/**
 * Deterministic EXAMPLE data for demo mode: two years of daily numbers (so year views can compare
 * with the year before). The most recent 21 days use the original example pattern. Older days add
 * growth (the store is about half the size two years ago), seasonality, sale peaks and one patch of
 * tired ads. Every row is marked example: true and is cleared with "Clear example data".
 */
export function exampleDays(today: string, total = 730): DayInput[] {
  const out: DayInput[] = [];
  for (let i = total; i >= 1; i--) {
    const d = new Date(today + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    if (i <= 21) {
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
      continue;
    }
    const age = (i - 21) / (total - 21); // 0 = recent, 1 = two years ago
    const g = 1 - 0.5 * age;
    const s = seasonFor(date);
    const dow = d.getUTCDay();
    const weekly = [0.9, 1.06, 1.04, 1.02, 1.0, 0.98, 0.92][dow];
    const noise = 1 + Math.sin(i * 1.7) * 0.08 + Math.cos(i * 0.31) * 0.05;
    const orders = Math.max(1, Math.round(22 * g * s.demand * weekly * noise));
    const revenue = Math.round(orders * (86 + Math.cos(i) * 6 + (s.discount > 0.1 ? 14 : 0)));
    const adScale = g * Math.pow(s.demand, 0.8);
    const adMeta = Math.round(330 * adScale * (1 + Math.sin(i * 0.23) * 0.07));
    const adGoogle = Math.round(95 * g * Math.pow(s.demand, 0.6) + Math.sin(i) * 10);
    const adTiktok = i < 240 ? (i % 3 === 0 ? 40 : 30) : 0;
    const newShare = 0.62 + 0.14 * age;
    out.push({
      date, orders, newCustomerOrders: Math.round(orders * newShare), units: Math.round(orders * 1.45), sessions: Math.round(orders / (0.021 + 0.004 * (s.demand - 1))),
      revenue, newCustomerRevenue: Math.round(revenue * (newShare - 0.04)), discounts: Math.round(revenue * s.discount), refunds: Math.round(revenue * s.refunds),
      cogs: Math.round(revenue * (0.3 + 0.02 * age)), shipping: orders * 9, paymentFees: Math.round(revenue * 0.026),
      adMeta, adGoogle: Math.max(0, adGoogle), adTiktok, adOther: 0, otherMarketing: 25,
      metaRevenue: Math.round(adMeta * 2.6 * s.roas * (1 + Math.sin(i * 0.37) * 0.1)), googleRevenue: Math.round(Math.max(0, adGoogle) * 3.3 * Math.sqrt(s.roas)), tiktokRevenue: Math.round(adTiktok * 1.6),
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
