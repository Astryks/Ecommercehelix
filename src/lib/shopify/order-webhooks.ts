/**
 * Shopify order webhooks (orders/create, orders/updated, orders/paid, orders/cancelled, refunds/create).
 * Off unless SHOPIFY_ORDER_WEBHOOKS=1. The daily cron stays the source of truth: a webhook only
 * triggers an early re-sync, and the sync is a full recompute, so replays are harmless.
 * Idempotency: each X-Shopify-Webhook-Id is handled once (per instance), and syncs per user are
 * throttled so a burst of order events produces one sync.
 */
export const ORDER_TOPICS = ["orders/create", "orders/updated", "orders/paid", "orders/cancelled", "refunds/create"] as const;
export const ORDER_TOPICS_GQL = ["ORDERS_CREATE", "ORDERS_UPDATED", "ORDERS_PAID", "ORDERS_CANCELLED", "REFUNDS_CREATE"] as const;

export function orderWebhooksOn(env: Record<string, string | undefined> = process.env) {
  return env.SHOPIFY_ORDER_WEBHOOKS === "1" || env.SHOPIFY_ORDER_WEBHOOKS === "true";
}
export function isOrderTopic(topic: string) {
  return (ORDER_TOPICS as readonly string[]).includes(topic);
}

/** Small bounded set of seen webhook ids. */
export class SeenIds {
  private ids = new Map<string, number>();
  constructor(private max = 5000) {}
  /** True the first time an id is seen. Empty ids are never deduped. */
  first(id: string | null | undefined) {
    if (!id) return true;
    if (this.ids.has(id)) return false;
    this.ids.set(id, Date.now());
    if (this.ids.size > this.max) this.ids.delete(this.ids.keys().next().value!);
    return true;
  }
}

/** Sync again only if the last sync is older than `minGapMs`. */
export function shouldResync(lastSyncAt: string | null, now = Date.now(), minGapMs = 120_000) {
  if (!lastSyncAt) return true;
  const t = Date.parse(lastSyncAt);
  return !Number.isFinite(t) || now - t >= minGapMs;
}
