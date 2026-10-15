/**
 * General guides by store size and type. These are Helix's rules of thumb (the same ranges used on Key metrics),
 * NOT survey data or averages from other stores. Labelled as such everywhere they show.
 */
export type Size = "starting" | "growing" | "scaling";
export type Category = "fashion" | "beauty" | "home" | "food" | "other";
export const SIZE_LABEL: Record<Size, string> = { starting: "Under $10k a month", growing: "$10k to $30k a month", scaling: "$30k to $80k+ a month" };
export const CATEGORY_LABEL: Record<Category, string> = { fashion: "Clothes and accessories", beauty: "Beauty and health", home: "Home and gifts", food: "Food and drink", other: "Something else" };

export type MetricId = "cr" | "aov" | "repeat" | "mer" | "contribution" | "net";
export type Guide = { id: MetricId; name: string; unit: "%" | "$"; low: number; good: number; great: number; higherIsBetter: boolean; note: string };

const BASE: Guide[] = [
  { id: "cr", name: "Conversion rate", unit: "%", low: 0.8, good: 1.4, great: 2.6, higherIsBetter: true, note: "Share of visits that buy." },
  { id: "aov", name: "Average order", unit: "$", low: 60, good: 100, great: 150, higherIsBetter: true, note: "Depends a lot on what you sell. Bundles lift it." },
  { id: "repeat", name: "Orders from returning buyers", unit: "%", low: 15, good: 25, great: 40, higherIsBetter: true, note: "Emails and a good product bring people back." },
  { id: "mer", name: "Ad spend as % of sales (MER)", unit: "%", low: 35, good: 25, great: 15, higherIsBetter: false, note: "Lower is better, as long as sales grow." },
  { id: "contribution", name: "Profit after ads, before bills", unit: "%", low: 10, good: 20, great: 30, higherIsBetter: true, note: "What each sale leaves to pay your bills and you." },
  { id: "net", name: "Net profit", unit: "%", low: 0, good: 10, great: 15, higherIsBetter: true, note: "What is left after every cost." },
];

/** Small-store and big-store adjustments are rules of thumb: newer stores usually spend more on ads per sale while they learn. */
export function guidesFor(size: Size, cat: Category): { guides: Guide[]; categoryNote: string } {
  const g = BASE.map((x) => ({ ...x }));
  if (size === "starting") { const m = g.find((x) => x.id === "mer")!; m.low = 45; m.good = 30; m.great = 20; }
  if (size === "scaling") { const r = g.find((x) => x.id === "repeat")!; r.good = 30; r.great = 45; }
  const notes: Record<Category, string> = {
    fashion: "Returns are often higher in clothes. Watch refunds and size guides.",
    beauty: "Buyers often reorder. Returning-buyer orders matter a lot here.",
    home: "Bigger items cost more to ship. Check shipping as a share of sales.",
    food: "Short shelf life means stock needs care. Repeat orders are key.",
    other: "Use the general guide and your own trend over time.",
  };
  return { guides: g, categoryNote: notes[cat] };
}
export const sizeFor = (monthlySales: number): Size => (monthlySales >= 30_000 ? "scaling" : monthlySales >= 10_000 ? "growing" : "starting");
export function band(v: number | null, g: Guide): "great" | "good" | "low" | "none" {
  if (v === null || !Number.isFinite(v)) return "none";
  return g.higherIsBetter ? (v >= g.great ? "great" : v >= g.good ? "good" : "low") : v <= g.great ? "great" : v <= g.good ? "good" : "low";
}
