import { EXAMPLE_TARGETS, type Targets } from "./campaigns";
import type { DayInput, Settings } from "./scorecard";

/** Targets for the tracker and drafts from the user's own last 30 days, falling back to example targets. */
export function targetsFrom(days: DayInput[], settings: Settings): Targets {
  const last = days.slice(-30);
  const orders = last.reduce((s, d) => s + d.orders, 0);
  const revenue = last.reduce((s, d) => s + d.revenue, 0);
  const variable = last.reduce((s, d) => s + d.cogs + d.shipping + d.paymentFees, 0);
  if (orders < 5 || revenue <= 0) return { ...EXAMPLE_TARGETS, targetMerPct: settings.targetMerPct };
  return { aov: Math.round(revenue / orders), targetMerPct: settings.targetMerPct, vcrPct: Math.min(90, Math.round((variable / revenue) * 100)) };
}

export const goodColdCpa = (t: Targets) => t.aov * (t.targetMerPct / 100) * 2;
/** Suggested daily test budget: 2.5x the good cold CPA, written into the paused draft only. */
export const suggestedTestBudget = (t: Targets) => Math.round(goodColdCpa(t) * 2.5);
