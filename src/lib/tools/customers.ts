/**
 * Customers: how often people buy again and what one customer is worth over 12 months.
 * From daily totals (new vs returning orders), so it is an estimate until order-level data is synced.
 */
import type { DayInput, Settings } from "../scorecard";
import { real, stats, marginBeforeAds } from "./common";

export type CohortRow = { month: string; newCustomers: number; newRevenue: number; returningOrders: number; returningRevenue: number; repeatShare: number };
export type CustomerValue = { ordersPerCustomer: number; aov: number; value12m: number; profit12m: number; repeatShare: number; cohorts: CohortRow[]; enoughData: boolean };

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
  return { ordersPerCustomer: Math.round(ordersPerCustomer * 100) / 100, aov, value12m: Math.round(aov * ordersPerCustomer), profit12m: Math.round(aov * ordersPerCustomer * margin), repeatShare: allO ? Math.round(((allO - newO) / allO) * 1000) / 10 : 0, cohorts, enoughData: newO >= 20 };
}
