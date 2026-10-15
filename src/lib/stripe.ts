import Stripe from "stripe";
import type { PlanId } from "./plans";

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

type Env = Record<string, string | undefined>;
const list = (v?: string) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

/** The price new checkouts use (should be the USD monthly price). */
export function priceFor(plan: PlanId, env: Env = process.env): string | undefined {
  if (plan === "starter") return env.STRIPE_PRICE_STARTER || undefined;
  if (plan === "growth") return env.STRIPE_PRICE_GROWTH || undefined;
}

/**
 * Which plan a price grants. Also accepts older prices (STRIPE_PRICE_*_LEGACY, comma-separated), so members
 * who joined on an earlier price (for example the first AUD prices) keep their plan after the switch to USD.
 * An unknown price grants nothing.
 */
export function planForPrice(priceId?: string | null, env: Env = process.env, price?: { lookup_key?: string | null; metadata?: Record<string, string> | null } | null): PlanId {
  if (!priceId) return "free";
  if (priceId === env.STRIPE_PRICE_GROWTH || list(env.STRIPE_PRICE_GROWTH_LEGACY).includes(priceId)) return "growth";
  if (priceId === env.STRIPE_PRICE_STARTER || list(env.STRIPE_PRICE_STARTER_LEGACY).includes(priceId)) return "starter";
  // Prices tagged by scripts/stripe-setup.mjs (new USD prices and older ones) carry their plan, so old members keep access.
  const tag = price?.metadata?.helix_plan ?? price?.lookup_key?.match(/^helix_(starter|growth)_/)?.[1];
  return tag === "growth" || tag === "starter" ? tag : "free";
}
