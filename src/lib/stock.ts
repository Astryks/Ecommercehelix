import { addDays } from "./dates";
import { blackFriday, daysBetween } from "./seasons";

/**
 * Suppliers and stock: landed cost, reorder points and stock-out countdowns.
 * Pure functions (no I/O) so they are easy to test. Sales speed comes from what the
 * user types today; a Shopify inventory and sales sync will fill it in later.
 */

export type SupplierKind = "factory" | "trading" | "unknown";
export type Supplier = {
  id: string;
  name: string;
  contact: string;
  country: string;
  kind: SupplierKind;
  moq: number;
  leadTimeDays: number;
  paymentTerms: string;
  notes: string;
  example?: boolean;
};
export type StockItem = {
  id: string;
  sku: string;
  name: string;
  supplierId: string | null;
  unitCost: number; // what you pay the supplier per unit
  freightPerUnit: number; // shipping to your warehouse, per unit
  dutyPct: number; // import duty as % of unit cost
  otherPerUnit: number; // packaging, inspection, fees per unit
  onHand: number;
  onOrder: number;
  dailySales: number; // average units sold per day
  leadTimeDays: number | null; // overrides the supplier's lead time
  safetyDays: number;
  example?: boolean;
};

export type StockStatus = "out" | "order-now" | "order-soon" | "ok" | "no-sales";
export type StockRow = StockItem & {
  supplier: Supplier | null;
  landedCost: number;
  leadTime: number;
  reorderPoint: number;
  daysLeft: number | null;
  stockOutDate: string | null;
  orderBy: string | null;
  daysUntilOrder: number | null;
  suggestedQty: number;
  status: StockStatus;
};

export const DEFAULT_LEAD_TIME = 45;
export const COVER_DAYS = 60; // how many days of sales each new order should cover, after it lands
export const SOON_DAYS = 14;

export const landedCost = (i: Pick<StockItem, "unitCost" | "freightPerUnit" | "dutyPct" | "otherPerUnit">) =>
  Math.round((i.unitCost + i.freightPerUnit + (i.unitCost * i.dutyPct) / 100 + i.otherPerUnit) * 100) / 100;

export function stockRow(item: StockItem, suppliers: Supplier[], today: string): StockRow {
  const supplier = suppliers.find((s) => s.id === item.supplierId) ?? null;
  const leadTime = item.leadTimeDays ?? supplier?.leadTimeDays ?? DEFAULT_LEAD_TIME;
  const v = Math.max(0, item.dailySales);
  const reorderPoint = Math.ceil(v * (leadTime + item.safetyDays));
  const position = item.onHand + item.onOrder;
  const daysLeft = v > 0 ? Math.floor(item.onHand / v) : null;
  const stockOutDate = daysLeft === null ? null : addDays(today, daysLeft);
  // The day your stock (including what is already on order) falls to the reorder point.
  const daysUntilOrder = v > 0 ? Math.floor((position - reorderPoint) / v) : null;
  const orderBy = daysUntilOrder === null ? null : addDays(today, Math.max(0, daysUntilOrder));
  const need = Math.ceil(v * (leadTime + item.safetyDays + COVER_DAYS) - position);
  const suggestedQty = v > 0 && need > 0 ? Math.max(supplier?.moq ?? 0, need) : 0;
  let status: StockStatus;
  if (v === 0) status = item.onHand === 0 ? "out" : "no-sales";
  else if (item.onHand === 0) status = "out";
  else if (position <= reorderPoint) status = "order-now";
  else if ((daysUntilOrder ?? 99) <= SOON_DAYS) status = "order-soon";
  else status = "ok";
  return { ...item, supplier, landedCost: landedCost(item), leadTime, reorderPoint, daysLeft, stockOutDate, orderBy, daysUntilOrder, suggestedQty, status };
}

export const STATUS_ORDER: StockStatus[] = ["out", "order-now", "order-soon", "ok", "no-sales"];
export function stockRows(items: StockItem[], suppliers: Supplier[], today: string): StockRow[] {
  return items
    .map((i) => stockRow(i, suppliers, today))
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || (a.daysUntilOrder ?? 9999) - (b.daysUntilOrder ?? 9999));
}

/** Items that need action now or within two weeks, for the Today screen. */
export const stockAlerts = (rows: StockRow[]) => rows.filter((r) => r.status === "out" || r.status === "order-now" || r.status === "order-soon");

/**
 * Black Friday stock check. The last safe order date is Black Friday minus the lead time
 * minus a week to receive, check and list the stock. Peak weeks often sell 2 to 4 times
 * a normal week, so we size the extra stock at 3 times a normal week for the BF/CM week.
 */
export const BF_UPLIFT = 3;
export function nextBlackFriday(today: string) {
  const y = Number(today.slice(0, 4));
  let date = blackFriday(y);
  if (daysBetween(today, date) < -4) date = blackFriday(y + 1);
  return { date, daysTo: daysBetween(today, date), year: Number(date.slice(0, 4)) };
}
export function bfPlan(row: StockRow, today: string) {
  const bf = nextBlackFriday(today);
  const lastOrder = addDays(bf.date, -(row.leadTime + 7));
  const daysToLastOrder = daysBetween(today, lastOrder);
  const extraUnits = Math.ceil(row.dailySales * 7 * (BF_UPLIFT - 1));
  return { ...bf, lastOrder, daysToLastOrder, extraUnits, taskId: `season-black-friday-${bf.year}-stock` };
}

// ---------- labelled example data (until Shopify inventory sync is connected) ----------
export function exampleSuppliers(): Supplier[] {
  return [
    { id: "ex-sup-1", name: "Example: Linen mill (factory)", contact: "sales@example-mill.test", country: "China", kind: "factory", moq: 300, leadTimeDays: 50, paymentTerms: "30% deposit, 70% before shipping", notes: "Sample approved. Ask for a pre-shipment inspection.", example: true },
    { id: "ex-sup-2", name: "Example: Cotton tees (trading company)", contact: "hello@example-trade.test", country: "China", kind: "trading", moq: 200, leadTimeDays: 35, paymentTerms: "50% deposit, 50% on shipping", notes: "Check who the real factory is before a big order.", example: true },
    { id: "ex-sup-3", name: "Example: Local cap maker", contact: "orders@example-caps.test", country: "Australia", kind: "factory", moq: 100, leadTimeDays: 21, paymentTerms: "Net 14 after delivery", notes: "", example: true },
  ];
}
export function exampleStock(): StockItem[] {
  const base = { freightPerUnit: 0, dutyPct: 0, otherPerUnit: 0, onOrder: 0, leadTimeDays: null, safetyDays: 14, example: true };
  return [
    { ...base, id: "ex-st-1", sku: "LIN-SH-01", name: "Linen Shirt", supplierId: "ex-sup-1", unitCost: 18.5, freightPerUnit: 3.2, dutyPct: 5, otherPerUnit: 1.4, onHand: 140, dailySales: 2.1 },
    { ...base, id: "ex-st-2", sku: "LIN-PT-02", name: "Linen Pants", supplierId: "ex-sup-1", unitCost: 22, freightPerUnit: 3.6, dutyPct: 5, otherPerUnit: 1.4, onHand: 260, onOrder: 0, dailySales: 1.4 },
    { ...base, id: "ex-st-3", sku: "TEE-ORG-03", name: "Organic Tee", supplierId: "ex-sup-2", unitCost: 7.5, freightPerUnit: 1.6, dutyPct: 5, otherPerUnit: 0.9, onHand: 110, onOrder: 300, dailySales: 2.9 },
    { ...base, id: "ex-st-4", sku: "CAP-04", name: "Canvas Cap", supplierId: "ex-sup-3", unitCost: 7, freightPerUnit: 0.8, otherPerUnit: 0.6, onHand: 420, dailySales: 1.2 },
    { ...base, id: "ex-st-5", sku: "BUN-05", name: "Weekend Bundle", supplierId: null, unitCost: 38, freightPerUnit: 5, dutyPct: 5, otherPerUnit: 3, onHand: 0, dailySales: 0.6, leadTimeDays: 10 },
  ];
}
