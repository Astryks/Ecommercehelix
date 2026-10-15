/** 13-week cash plan: money in from sales, money out for stock, ads, product costs and bills; warns on low weeks. */
import type { Forecast } from "./forecast";
import type { BuyLine } from "./inventory";
import { addDays } from "../dates";

export type CashWeek = { start: string; cashIn: number; ads: number; costs: number; stock: number; bills: number; tax: number; end: number; low: boolean };
export type CashPlan = { weeks: CashWeek[]; lowest: CashWeek; firstLow: CashWeek | null; floor: number; start: number };

export function cashPlan(f: Forecast, buys: BuyLine[], today: string, o: { startBalance: number; floor: number; fixedMonthly: number; taxDue?: { date: string; amount: number }[] }): CashPlan {
  let bal = o.startBalance;
  const weeks: CashWeek[] = [];
  for (let w = 0; w < 13; w++) {
    const start = addDays(today, w * 7), end = addDays(start, 6);
    const m = f.months.find((x) => x.month === start.slice(0, 7)) ?? f.months[0];
    const cashIn = Math.round(m.sales / 4.345);
    const ads = Math.round(m.adBudget / 4.345);
    const costs = Math.round(cashIn * (1 - f.margin));
    const stock = buys.filter((b) => {
      if (b.cash <= 0) return false;
      const due = b.orderBy ?? today;
      return (due >= start && due <= end) || (w === 0 && due < start); // overdue orders are paid this week
    }).reduce((a, b) => a + b.cash, 0);
    const bills = Math.round(o.fixedMonthly / 4.345);
    const tax = (o.taxDue ?? []).filter((t) => t.date >= start && t.date <= end).reduce((a, t) => a + t.amount, 0);
    bal = Math.round(bal + cashIn - ads - costs - stock - bills - tax);
    weeks.push({ start, cashIn, ads, costs, stock, bills, tax, end: bal, low: bal < o.floor });
  }
  const lowest = weeks.reduce((a, b) => (b.end < a.end ? b : a), weeks[0]);
  return { weeks, lowest, firstLow: weeks.find((w) => w.low) ?? null, floor: o.floor, start: o.startBalance };
}
