import { metricsFor } from "./analytics";
import { addDays } from "./dates";
import type { DayInput, Settings } from "./scorecard";

/** Last 30 days: marketing as a % of sales, monthly sales and break-even MER, for the marketing band. */
export function marketingBandProps(days: DayInput[], settings: Settings, latest: string) {
  const m = metricsFor(days, { from: addDays(latest, -29), to: latest }, settings);
  const spend = m.adSpend + m.otherMarketing;
  return {
    marketingPct: m.netRevenue ? (spend / m.netRevenue) * 100 : 0,
    monthlySales: m.dataDays ? (m.netRevenue / m.dataDays) * 30 : 0,
    breakEvenMerPct: m.breakEvenMerPct,
    example: m.exampleDays > 0,
  };
}
