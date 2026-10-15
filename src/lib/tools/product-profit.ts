/** Profit per product: price, landed cost, shipping, fees and a share of ads per unit; flags products under break-even. */
import type { ProductLine } from "../scorecard";
import type { ProfitInputs } from "../profit-setup";

export type ProductProfit = { sku: string; name: string; units: number; price: number; landed: number; shipping: number; fees: number; ads: number; profitPerUnit: number; marginPct: number; totalProfit: number; flag: "loss" | "thin" | "ok" };

export function productProfit(lines: ProductLine[], setup: ProfitInputs | null, adSpend: number, from: string): ProductProfit[] {
  const recent = lines.filter((l) => l.date >= from);
  const by = new Map<string, { sku: string; name: string; units: number; rev: number; cost: number }>();
  for (const l of recent) {
    const r = by.get(l.sku) ?? { sku: l.sku, name: l.name, units: 0, rev: 0, cost: 0 };
    r.units += l.units; r.rev += l.units * l.price; r.cost += l.units * l.unitCost; by.set(l.sku, r);
  }
  const totalUnits = [...by.values()].reduce((a, r) => a + r.units, 0) || 1;
  const adPerUnit = adSpend / totalUnits;
  const ship = setup?.shipToCustomer ?? 0, pct = setup?.feePct ?? 1.75, fixed = setup?.feeFixed ?? 0.3, pack = setup?.packaging ?? 0;
  return [...by.values()].map((r) => {
    const price = r.units ? r.rev / r.units : 0, landed = r.units ? r.cost / r.units : 0;
    const fees = (price * pct) / 100 + fixed;
    const profitPerUnit = price - landed - ship - pack - fees - adPerUnit;
    const marginPct = price ? (profitPerUnit / price) * 100 : 0;
    const round = (n: number) => Math.round(n * 100) / 100;
    return { sku: r.sku, name: r.name, units: r.units, price: round(price), landed: round(landed), shipping: round(ship + pack), fees: round(fees), ads: round(adPerUnit), profitPerUnit: round(profitPerUnit), marginPct: Math.round(marginPct * 10) / 10, totalProfit: Math.round(profitPerUnit * r.units), flag: (profitPerUnit < 0 ? "loss" : marginPct < 10 ? "thin" : "ok") as ProductProfit["flag"] };
  }).sort((a, b) => a.profitPerUnit - b.profitPerUnit);
}
