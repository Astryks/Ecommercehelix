import type { Country } from "./seasons";
import type { DayInput, ProductLine } from "./scorecard";

/**
 * "My prices include GST/VAT". GST and VAT you collect belong to the tax office, not to you, so
 * Helix takes the tax out of sales that include it before any profit maths.
 * Costs are left alone: type them without GST if you are registered (you claim it back).
 *
 * Which sales include tax: Shopify's Gross sales (what Helix asks you to type or import) already
 * leaves tax out, but order prices (Shopify sync, the Subtotal column of an orders export) include
 * it in a tax-inclusive store. So "auto" (the country default) strips tax only from days whose
 * sales come from order prices. An explicit Yes strips every day; an explicit No strips none.
 */
export type SalesTaxMode = "auto" | "AU" | "NZ" | "UK" | "none";

export const TAX_OPTIONS: { id: SalesTaxMode; label: string; hint: string }[] = [
  { id: "auto", label: "Use my country's default", hint: "Where shop prices include tax (for example 10% GST, New Zealand 15%, UK 20% VAT, Germany 19%), Helix takes it out of sales synced from Shopify or imported from a Shopify orders export. Gross sales you type or import is used as entered, because it already leaves tax out. US and Canada: sales are before tax." },
  { id: "AU", label: "Yes, GST (10%)", hint: "Every sales number I type or import includes GST. Helix divides sales by 1.10." },
  { id: "NZ", label: "Yes, New Zealand GST (15%)", hint: "Every sales number I type or import includes GST. Helix divides sales by 1.15." },
  { id: "UK", label: "Yes, UK VAT (20%)", hint: "Every sales number I type or import includes VAT. Helix divides sales by 1.20." },
  { id: "none", label: "No, my sales numbers are before tax", hint: "Pick this if you are not registered for GST/VAT, or your prices do not include it." },
];

const RATES: Record<Exclude<SalesTaxMode, "auto" | "none">, number> = { AU: 0.1, NZ: 0.15, UK: 0.2 };

export const toTaxMode = (v: unknown): SalesTaxMode => (v === "AU" || v === "NZ" || v === "UK" || v === "none" ? v : "auto");

/**
 * Standard GST/VAT rate where shop prices normally include it. Countries not listed
 * (the US, Canada and anywhere we do not know) default to "before tax", and the
 * settings page asks the owner to choose.
 */
export const DEFAULT_TAX: Record<string, { rate: number; name: "GST" | "VAT" }> = {
  AU: { rate: 0.1, name: "GST" }, NZ: { rate: 0.15, name: "GST" }, SG: { rate: 0.09, name: "GST" }, IN: { rate: 0.18, name: "GST" },
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

/** Day sources whose sales come from order prices, so they include GST/VAT in a tax-inclusive store. */
export const TAX_INCLUSIVE_SOURCES: ReadonlySet<string> = new Set(["shopify", "csv-orders"]);

/** Rate taken out of numbers you type or import from a sales report (Shopify Gross sales): only on an explicit Yes. */
export function typedTaxRate(mode: SalesTaxMode, country: Country): number {
  return mode === "auto" ? 0 : taxRate(mode, country);
}

/** Rate taken out of one day's sales, by where its sales came from. */
export function dayTaxRate(mode: SalesTaxMode, country: Country, source?: string): number {
  return source && TAX_INCLUSIVE_SOURCES.has(source) ? taxRate(mode, country) : typedTaxRate(mode, country);
}

/** Short label for notes, e.g. "GST (10%)" or "VAT (20%)". Empty when no tax is stripped. */
export function taxLabel(mode: SalesTaxMode, country: Country): string {
  const m = effectiveTaxMode(mode, country);
  if (m === "none") return "";
  const name = m === "country" ? DEFAULT_TAX[country].name : m === "UK" ? "VAT" : "GST";
  const pct = Math.round(taxRate(mode, country) * 1000) / 10;
  return `${name} (${pct}%)`;
}

/** Label for the tax taken out of numbers you type (empty under "auto": typed Gross sales already leaves tax out). */
export function typedTaxLabel(mode: SalesTaxMode, country: Country): string {
  return mode === "auto" ? "" : taxLabel(mode, country);
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
