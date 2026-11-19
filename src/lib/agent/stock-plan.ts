/**
 * Step 3 — Stock, cash and operations (Job 4 of the pivot, §11).
 *
 * Maths is the code already in lib/stock.ts (reorder point, stock-out
 * countdown, suggested qty) plus lib/tools/inventory.ts (buy plan with
 * sale-season uplift) and lib/tools/cash.ts (13-week cash forecast).
 * This module is the agent layer on top: the reorder list with quantities
 * and dates for approval, the scale-blocking stock check, and the
 * margin check that gates every offer.
 *
 * Never auto: ordering stock, contacting a supplier, changing a price.
 * The agent prepares; the owner orders.
 */
import { stockRows, type StockItem, type Supplier } from "../stock";
import { buyPlan, type BuyLine } from "../tools/inventory";
import { cashPlan, type CashPlan } from "../tools/cash";
import type { Forecast } from "../tools/forecast";

export const MIN_CONTRIBUTION_PCT = 15; // offers must keep contribution ≥15%
export const SCALE_MIN_STOCK_DAYS = 14; // scale card blocked below this

export type ReorderLine = BuyLine & {
  reorderPoint: number;
  stockOutDate: string | null;
  orderBy: string | null;
  /** Velocity based on <7 days of data or a sale spike: quantity is a range, labelled low confidence. */
  lowConfidence: boolean;
  lowConfidenceReason: string | null;
};

export function reorderList(
  items: StockItem[],
  suppliers: Supplier[],
  today: string,
  country = "US",
  daysOfHistory = 30,
): ReorderLine[] {
  const rows = stockRows(items, suppliers, today);
  const buys = buyPlan(items, suppliers, today, country);
  const bySku = new Map(buys.map((b) => [b.sku, b]));
  return rows
    .filter((r) => r.status !== "ok" && r.status !== "no-sales")
    .map((r) => {
      const b = bySku.get(r.sku);
      const lowConfidence = daysOfHistory < 7;
      return {
        ...(b ?? {
          sku: r.sku, name: r.name, onHand: r.onHand, dailySales: r.dailySales, weeksCover: null, daysCover: r.daysLeft === null ? null : r.daysLeft / 7,
          orderBy: r.orderBy, status: r.status, uplift: 1, upliftReason: null, orderQty: r.suggestedQty, cash: Math.round(r.suggestedQty * r.landedCost), landed: r.landedCost,
        }),
        reorderPoint: r.reorderPoint,
        stockOutDate: r.stockOutDate,
        orderBy: r.orderBy,
        lowConfidence,
        lowConfidenceReason: lowConfidence ? "Low confidence — fewer than 7 days of sales history, so the quantity is a range. Check it against last month before ordering." : null,
      } satisfies ReorderLine;
    })
    .sort((a, b) => (a.orderBy ?? "9").localeCompare(b.orderBy ?? "9"));
}

/** Scale-blocking check: before any scale card, a winner under 14 days of stock gets a "reorder first" card instead. */
export function scaleBlockedByStock(sku: string, items: StockItem[], suppliers: Supplier[], today: string): { blocked: boolean; daysLeft: number | null; reason: string | null } {
  const row = stockRows(items, suppliers, today).find((r) => r.sku === sku);
  if (!row) return { blocked: false, daysLeft: null, reason: null };
  if (row.dailySales <= 0 || row.daysLeft === null) return { blocked: false, daysLeft: row.daysLeft, reason: null };
  if (row.daysLeft < SCALE_MIN_STOCK_DAYS)
    return { blocked: true, daysLeft: row.daysLeft, reason: `${row.name} has ${row.daysLeft} days of stock left (under ${SCALE_MIN_STOCK_DAYS}). Reorder first — scaling an ad for a product about to sell out wastes the spend.` };
  return { blocked: false, daysLeft: row.daysLeft, reason: null };
}

/** Margin-checked offers: contribution must stay ≥15%, or the card shows red and cannot be approved without a logged owner override. */
export function marginCheck(args: { contributionPctBefore: number; contributionPctAfter: number }): { ok: boolean; reason: string } {
  if (args.contributionPctAfter >= MIN_CONTRIBUTION_PCT)
    return { ok: true, reason: `Contribution stays ${args.contributionPctAfter.toFixed(1)}% after this offer (≥${MIN_CONTRIBUTION_PCT}%).` };
  return {
    ok: false,
    reason: `Contribution would fall to ${args.contributionPctAfter.toFixed(1)}% (from ${args.contributionPctBefore.toFixed(1)}%) — below the ${MIN_CONTRIBUTION_PCT}% floor. This offer cannot be approved without an owner override, logged in Decisions. Prefer a bundle or gift over a discount.`,
  };
}

/** 13-week cash forecast with its assumptions listed, so the owner can edit them. Draft only. */
export function cashForecast(
  f: Forecast,
  buys: BuyLine[],
  today: string,
  o: { startBalance: number; floor: number; fixedMonthly: number; taxDue?: { date: string; amount: number }[] },
): { plan: CashPlan; assumptions: string[] } {
  const plan = cashPlan(f, buys, today, o);
  const assumptions = [
    `Opening balance $${Math.round(o.startBalance).toLocaleString("en-AU")}; floor $${Math.round(o.floor).toLocaleString("en-AU")} — alert when a week ends below the floor.`,
    `Sales from the ${f.source === "history" ? "store's own run rate" : f.source === "goal" ? "yearly goal" : "monthly target"}; ad spend at ${Math.round(f.mer * 100)}% of sales; product costs at ${(100 - f.margin * 100).toFixed(0)}% of sales.`,
    `Stock orders: $${buys.reduce((a, b) => a + b.cash, 0).toLocaleString("en-AU")} across ${buys.filter((b) => b.cash > 0).length} orders in the next 13 weeks.`,
    `Fixed costs $${Math.round(o.fixedMonthly).toLocaleString("en-AU")}/month. Tax due: ${(o.taxDue ?? []).length ? (o.taxDue ?? []).map((t) => `$${t.amount} on ${t.date}`).join(", ") : "none entered"}.`,
  ];
  return { plan, assumptions };
}
