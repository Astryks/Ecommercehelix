import Stripe from "stripe";
import type { PlanId } from "./plans";

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export function priceFor(plan: PlanId): string | undefined {
  if (plan === "starter") return process.env.STRIPE_PRICE_STARTER;
  if (plan === "growth") return process.env.STRIPE_PRICE_GROWTH;
}

export function planForPrice(priceId?: string | null): PlanId {
  if (priceId && priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  if (priceId && priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  return "free";
}
