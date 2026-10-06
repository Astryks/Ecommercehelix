import type { Country } from "./seasons";
import type { DayInput, ProductLine } from "./scorecard";

/**
 * "My prices include GST/VAT". When on, Helix takes the tax out of every sales number before
 * any profit maths, because GST and VAT you collect belong to the tax office, not to you.
 * Costs are left alone: type them without GST if you are registered (you claim it back).
 */
export type SalesTaxMode = "auto" | "AU" | "NZ" | "UK" | "none";

export const TAX_OPTIONS: { id: SalesTaxMode; label: string; hint: string }[] = [
  { id: "auto", label: "Use my country's default", hint: "Australia: prices include 10% GST. US: sales are entered before tax." },
  { id: "AU", label: "Yes, Australian GST (10%)", hint: "Helix divides sales by 1.10." },
  { id: "NZ", label: "Yes, New Zealand GST (15%)", hint: "Helix divides sales by 1.15." },
  { id: "UK", label: "Yes, UK VAT (20%)", hint: "Helix divides sales by 1.20." },
  { id: "none", label: "No, my sales numbers are before tax", hint: "Pick this if you are not registered, or you copy Gross or Net sales from Shopify reports." },
];

const RATES: Record<Exclude<SalesTaxMode, "auto" | "none">, number> = { AU: 0.1, NZ: 0.15, UK: 0.2 };

export const toTaxMode = (v: unknown): SalesTaxMode => (v === "AU" || v === "NZ" || v === "UK" || v === "none" ? v : "auto");

/** The mode that actually applies: "auto" follows the country (AU stores show GST-inclusive prices; US prices are before sales tax). */
export function effectiveTaxMode(mode: SalesTaxMode, country: Country): Exclude<SalesTaxMode, "auto"> {
  if (mode !== "auto") return mode;
  return country === "AU" ? "AU" : "none";
}

/** Tax rate as a fraction, e.g. 0.1 for Australian GST. 0 when prices are before tax. */
export function taxRate(mode: SalesTaxMode, country: Country): number {
  const m = effectiveTaxMode(mode, country);
  return m === "none" ? 0 : RATES[m];
}

/** Short label for notes, e.g. "GST (10%)" or "VAT (20%)". Empty when no tax is stripped. */
export function taxLabel(mode: SalesTaxMode, country: Country): string {
  const m = effectiveTaxMode(mode, country);
  if (m === "none") return "";
  return `${m === "UK" ? "VAT" : "GST"} (${Math.round(RATES[m] * 100)}%)`;
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
