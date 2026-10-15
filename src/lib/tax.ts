import type { Country } from "./seasons";
import type { DayInput, ProductLine } from "./scorecard";

/**
 * "My prices include GST/VAT". When on, Helix takes the tax out of every sales number before
 * any profit maths, because GST and VAT you collect belong to the tax office, not to you.
 * Costs are left alone: type them without GST if you are registered (you claim it back).
 */
export type SalesTaxMode = "auto" | "AU" | "NZ" | "UK" | "none";

export const TAX_OPTIONS: { id: SalesTaxMode; label: string; hint: string }[] = [
  { id: "auto", label: "Use my country's default", hint: "For example 10% GST in some countries, New Zealand 15%, UK 20% VAT, Germany 19%. US and Canada: sales are entered before tax." },
  { id: "AU", label: "Yes, GST (10%)", hint: "Helix divides sales by 1.10." },
  { id: "NZ", label: "Yes, New Zealand GST (15%)", hint: "Helix divides sales by 1.15." },
  { id: "UK", label: "Yes, UK VAT (20%)", hint: "Helix divides sales by 1.20." },
  { id: "none", label: "No, my sales numbers are before tax", hint: "Pick this if you are not registered, or you copy Gross or Net sales from Shopify reports." },
];

const RATES: Record<Exclude<SalesTaxMode, "auto" | "none">, number> = { AU: 0.1, NZ: 0.15, UK: 0.2 };

export const toTaxMode = (v: unknown): SalesTaxMode => (v === "AU" || v === "NZ" || v === "UK" || v === "none" ? v : "auto");

/**
 * Standard GST/VAT rate where shop prices normally include it. Countries not listed
 * (the US, Canada and anywhere we do not know) default to "before tax", and the
 * settings page asks the owner to choose.
 */
export const DEFAULT_TAX: Record<string, { rate: number; name: "GST" | "VAT" }> = {
  AU: { rate: 0.1, name: "GST" }, NZ: { rate: 0.15, name: "GST" }, SG: { rate: 0.09, name: "GST" }, IN: { rate: 0.18, name: "GST" }, MY: { rate: 0.1, name: "VAT" },
  GB: { rate: 0.2, name: "VAT" }, IE: { rate: 0.23, name: "VAT" }, DE: { rate: 0.19, name: "VAT" }, FR: { rate: 0.2, name: "VAT" }, IT: { rate: 0.22, name: "VAT" },
  ES: { rate: 0.21, name: "VAT" }, PT: { rate: 0.23, name: "VAT" }, NL: { rate: 0.21, name: "VAT" }, BE: { rate: 0.21, name: "VAT" }, LU: { rate: 0.17, name: "VAT" },
  AT: { rate: 0.2, name: "VAT" }, CH: { rate: 0.081, name: "VAT" }, SE: { rate: 0.25, name: "VAT" }, DK: { rate: 0.25, name: "VAT" }, NO: { rate: 0.25, name: "VAT" },
  FI: { rate: 0.255, name: "VAT" }, PL: { rate: 0.23, name: "VAT" }, CZ: { rate: 0.21, name: "VAT" }, GR: { rate: 0.24, name: "VAT" }, HU: { rate: 0.27, name: "VAT" },
  RO: { rate: 0.21, name: "VAT" }, HR: { rate: 0.25, name: "VAT" }, SK: { rate: 0.23, name: "VAT" }, SI: { rate: 0.22, name: "VAT" }, EE: { rate: 0.24, name: "VAT" },
  LV: { rate: 0.21, name: "VAT" }, LT: { rate: 0.21, name: "VAT" }, CY: { rate: 0.19, name: "VAT" }, MT: { rate: 0.18, name: "VAT" }, BG: { rate: 0.2, name: "VAT" },
  IS: { rate: 0.24, name: "VAT" }, ZA: { rate: 0.15, name: "VAT" }, AE: { rate: 0.05, name: "VAT" }, SA: { rate: 0.15, name: "VAT" }, MX: { rate: 0.16, name: "VAT" },
  JP: { rate: 0.1, name: "GST" },
};
const BEFORE_TAX_COUNTRIES = new Set(["US", "CA"]);

/** True when we have no default for this country, so the owner should pick in Settings. */
export const taxNeedsChoice = (mode: SalesTaxMode, country: Country) => mode === "auto" && !DEFAULT_TAX[country] && !BEFORE_TAX_COUNTRIES.has(country);

/** The mode that actually applies: "auto" follows the country's default; unknown countries count as before tax. */
export function effectiveTaxMode(mode: SalesTaxMode, country: Country): Exclude<SalesTaxMode, "auto"> | "country" {
  if (mode !== "auto") return mode;
  if (country === "AU") return "AU";
  return DEFAULT_TAX[country] ? "country" : "none";
}

/** Tax rate as a fraction, e.g. 0.1 for GST. 0 when prices are before tax. */
export function taxRate(mode: SalesTaxMode, country: Country): number {
  const m = effectiveTaxMode(mode, country);
  if (m === "none") return 0;
  return m === "country" ? DEFAULT_TAX[country].rate : RATES[m];
}

/** Short label for notes, e.g. "GST (10%)" or "VAT (20%)". Empty when no tax is stripped. */
export function taxLabel(mode: SalesTaxMode, country: Country): string {
  const m = effectiveTaxMode(mode, country);
  if (m === "none") return "";
  const name = m === "country" ? DEFAULT_TAX[country].name : m === "UK" ? "VAT" : "GST";
  const pct = Math.round(taxRate(mode, country) * 1000) / 10;
  return `${name} (${pct}%)`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Amount without tax. $110 with 10% GST is $100. */
export const exTax = (amount: number, rate: number) => (rate > 0 ? round2(amount / (1 + rate)) : amount);

/** Every sales-type field (sales, discounts, refunds, attributed sales) without tax. Orders, sessions and costs are unchanged. */
export const SALES_FIELDS = ["revenue", "newCustomerRevenue", "discounts", "refunds", "metaRevenue", "googleRevenue", "tiktokRevenue"] as const;

export function dayExTax(d: DayInput, rate: number): DayInput {
  if (rate <= 0) return d;
  const out = { ...d };
  for (const f of SALES_FIELDS) out[f] = exTax(Number(d[f]) || 0, rate);
  return out;
}

export function productExTax(p: ProductLine, rate: number): ProductLine {
  return rate > 0 ? { ...p, price: exTax(p.price, rate) } : p;
}
