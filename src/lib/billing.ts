import type { PlanId } from "./plans";

/** Statuses that keep the paid plan. past_due keeps it while Stripe retries the card (grace period). */
const KEEP = new Set(["active", "trialing", "past_due"]);

/** The plan a Stripe subscription grants. Anything ended or unpaid drops to Free. */
export function planForStatus(status: string, pricePlan: PlanId): PlanId {
  return KEEP.has(status) ? pricePlan : "free";
}

/** Prices are shown in US dollars. */
export const CURRENCY_LABEL = "US$";
