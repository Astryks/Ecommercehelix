import type { PlanId } from "./plans";
import { PLAN_RANK } from "./plans";

/** Statuses that keep the paid plan. past_due keeps it while Stripe retries the card (grace period). */
const KEEP = new Set(["active", "trialing", "past_due"]);
/** Statuses that count as a live subscription for "no double subscriptions". */
export const LIVE_STATUSES = ["active", "trialing", "past_due", "incomplete"] as const;

/** The plan a Stripe subscription grants. Anything ended or unpaid drops to Free. */
export function planForStatus(status: string, pricePlan: PlanId): PlanId {
  return KEEP.has(status) ? pricePlan : "free";
}

/** Prices are shown in US dollars. */
export const CURRENCY_LABEL = "US$";
export const CANCEL_LINE = "Cancel anytime, in one click. No lock-in.";

/** The bits of a Stripe subscription Helix stores. Period end lives on the subscription item in current Stripe API versions. */
export type SubLike = { id: string; status: string; cancel_at_period_end?: boolean | null; current_period_end?: number | null; items: { data: { current_period_end?: number | null; price?: { id: string; lookup_key?: string | null; metadata?: Record<string, string> | null } | null }[] } };
export function subFields(sub: SubLike, planFor: (priceId?: string | null, price?: { lookup_key?: string | null; metadata?: Record<string, string> | null } | null) => PlanId) {
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  const end = item?.current_period_end ?? sub.current_period_end ?? null;
  return { plan: planForStatus(sub.status, planFor(priceId, item?.price)), status: sub.status, cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end), currentPeriodEnd: end ? new Date(end * 1000) : null, priceId };
}

/** Ignore an event older than the newest one already applied (Stripe can deliver out of order). */
export function isStale(eventCreatedSec: number, lastEventAt: Date | null | undefined): boolean {
  return Boolean(lastEventAt && eventCreatedSec * 1000 < lastEventAt.getTime());
}

/** Proration for a plan change: upgrades are charged the difference now; downgrades are credited on the next bill. */
export function prorationFor(from: PlanId, to: PlanId): "always_invoice" | "create_prorations" {
  return PLAN_RANK[to] > PLAN_RANK[from] ? "always_invoice" : "create_prorations";
}

/** What Settings > Billing should show. */
export type BillingView = "free" | "active" | "canceling" | "past_due" | "ended";
export function billingView(b: { plan: PlanId; status: string; cancelAtPeriodEnd: boolean; subscriptionId: string | null }): BillingView {
  if (b.status === "canceled") return b.subscriptionId ? "ended" : "free";
  if (b.plan === "free" && !b.subscriptionId) return "free";
  if (b.status === "past_due") return "past_due";
  if (b.cancelAtPeriodEnd) return "canceling";
  return b.plan === "free" ? "ended" : "active";
}

export const prettyDate = (d: Date | string | null | undefined) => (d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "the end of your billing period");
