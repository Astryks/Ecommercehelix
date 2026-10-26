/**
 * Customers: how often people buy again and what one customer is worth over 12 months.
 * From daily totals (new vs returning orders), so it is an estimate until order-level data is synced.
 */
import type { DayInput, Settings } from "../scorecard";
import { real, stats, marginBeforeAds } from "./common";

export type CohortRow = { month: string; newCustomers: number; newRevenue: number; returningOrders: number; returningRevenue: number; repeatShare: number };
export type Verdict = "good" | "okay" | "needs-work" | "none";
export type CustomerValue = { winCost: number | null; paybackMonths: number | null; paybackVerdict: Verdict; valueForCost: number | null; valueVerdict: Verdict; ordersPerCustomer: number; aov: number; value12m: number; profit12m: number; repeatShare: number; cohorts: CohortRow[]; enoughData: boolean };

export function customerValue(days: DayInput[], s: Settings, today: string): CustomerValue {
  const yr = real(days).filter((d) => d.date > String(Number(today.slice(0, 4)) - 1) + today.slice(4));
  const st = stats(yr, s);
  const newO = yr.reduce((a, d) => a + d.newCustomerOrders, 0);
  const allO = st.t.orders;
  const aov = allO ? st.x.netRevenue / allO : 0;
  // Each new customer brings their first order, plus a share of the returning orders.
  const ordersPerCustomer = newO ? Math.max(1, allO / newO) : 1;
  const margin = marginBeforeAds(yr, s);
  const by = new Map<string, CohortRow>();
  for (const d of yr) {
    const m = d.date.slice(0, 7);
    const r = by.get(m) ?? { month: m, newCustomers: 0, newRevenue: 0, returningOrders: 0, returningRevenue: 0, repeatShare: 0 };
    r.newCustomers += d.newCustomerOrders; r.newRevenue += d.newCustomerRevenue;
    r.returningOrders += Math.max(0, d.orders - d.newCustomerOrders); r.returningRevenue += Math.max(0, d.revenue - d.newCustomerRevenue);
    by.set(m, r);
  }
  const cohorts = [...by.values()].sort((a, b) => a.month.localeCompare(b.month)).map((r) => ({ ...r, repeatShare: r.newCustomers + r.returningOrders ? Math.round((r.returningOrders / (r.newCustomers + r.returningOrders)) * 1000) / 10 : 0 }));
  // Cost to win one new customer: all ad spend ÷ first-time buyers (blended CAC).
  const ad = yr.reduce((a, d) => a + d.adMeta + d.adGoogle + d.adTiktok + d.adOther, 0);
  const winCost = newO ? ad / newO : null;
  // What one customer leaves you before ads over 12 months, and per month.
  const profit12 = aov * ordersPerCustomer * margin;
  const firstOrder = aov * margin;
  // Payback: months until a customer's profit (before ads) covers what it cost to win them.
  // First order counts at month 0; repeat orders are spread evenly over the 12 months.
  let paybackMonths: number | null = null;
  if (winCost !== null) {
    const monthly = ((ordersPerCustomer - 1) * aov * margin) / 12;
    paybackMonths = winCost <= firstOrder ? 0 : monthly > 0 ? Math.round(((winCost - firstOrder) / monthly) * 10) / 10 : null;
  }
  const valueForCost = winCost ? Math.round((profit12 / winCost) * 10) / 10 : null;
  const paybackVerdict: Verdict = winCost === null ? "none" : paybackMonths === null ? "needs-work" : paybackMonths <= 3 ? "good" : paybackMonths <= 6 ? "okay" : "needs-work";
  const valueVerdict: Verdict = valueForCost === null ? "none" : valueForCost >= 3 ? "good" : valueForCost >= 2 ? "okay" : "needs-work";
  return { winCost: winCost === null ? null : Math.round(winCost * 100) / 100, paybackMonths, paybackVerdict, valueForCost, valueVerdict, ordersPerCustomer: Math.round(ordersPerCustomer * 100) / 100, aov, value12m: Math.round(aov * ordersPerCustomer), profit12m: Math.round(aov * ordersPerCustomer * margin), repeatShare: allO ? Math.round(((allO - newO) / allO) * 1000) / 10 : 0, cohorts, enoughData: newO >= 20 };
}
