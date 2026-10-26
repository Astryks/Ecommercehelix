/** Inventory buy planner: weeks of cover, order size from forecast and lead time, sale-season uplift and cash needed. */
import { stockRow, landedCost, type StockItem } from "../stock";
import type { Supplier } from "../stock";
import { activeEvents } from "../season-calendar";
import { addDays } from "../dates";

export type BuyLine = { sku: string; name: string; onHand: number; dailySales: number; weeksCover: number | null; daysCover: number | null; orderBy: string | null; status: string; uplift: number; upliftReason: string | null; orderQty: number; cash: number; landed: number; example?: boolean };

/** Big sale dates that land inside the lead time + cover window raise the order. */
export function upliftFor(today: string, leadTime: number, country = "US"): { uplift: number; reason: string | null } {
  const until = addDays(today, leadTime + 60);
  let best = { uplift: 1, reason: null as string | null };
  for (const d of [today, addDays(today, 30), addDays(today, 60), addDays(today, 90)]) {
    if (d > until) break;
    for (const h of activeEvents(d, country)) {
      const u = h.event.key === "bfcm" ? 2.5 : h.event.weight >= 8 ? 1.6 : h.event.weight >= 5 ? 1.25 : 1;
      if (u > best.uplift) best = { uplift: u, reason: `${h.event.name} needs about ${u}x normal stock` };
    }
  }
  return best;
}

export function buyPlan(items: StockItem[], suppliers: Supplier[], today: string, country = "US"): BuyLine[] {
  return items.map((it) => {
    const row = stockRow(it, suppliers, today);
    const { uplift, reason } = upliftFor(today, row.leadTime, country);
    const qty = row.dailySales > 0 ? Math.max(row.supplier?.moq ?? 0, Math.ceil(row.suggestedQty * uplift)) : 0;
    const landed = landedCost(it);
    return { sku: it.sku, name: it.name, onHand: it.onHand, dailySales: it.dailySales, daysCover: it.dailySales > 0 ? Math.floor(it.onHand / it.dailySales) : null, weeksCover: it.dailySales > 0 ? Math.round((it.onHand / it.dailySales / 7) * 10) / 10 : null, orderBy: row.orderBy, status: row.status, uplift, upliftReason: reason, orderQty: row.status === "ok" || row.status === "no-sales" ? 0 : qty, cash: Math.round((row.status === "ok" || row.status === "no-sales" ? 0 : qty) * landed), landed, example: Boolean(it.example) };
  }).sort((a, b) => (a.orderBy ?? "9").localeCompare(b.orderBy ?? "9"));
}
