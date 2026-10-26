import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { isOrderTopic, orderWebhooksOn, SeenIds, shouldResync } from "../src/lib/shopify/order-webhooks";
import { ensureWebhookTopicWith, verifyWebhookHmac } from "../src/lib/shopify/config";

describe("shopify order webhooks", () => {
  it("is off unless the flag is set", () => {
    expect(orderWebhooksOn({})).toBe(false);
    expect(orderWebhooksOn({ SHOPIFY_ORDER_WEBHOOKS: "1" })).toBe(true);
  });
  it("knows order topics", () => {
    expect(isOrderTopic("orders/paid")).toBe(true);
    expect(isOrderTopic("refunds/create")).toBe(true);
    expect(isOrderTopic("app/uninstalled")).toBe(false);
  });
  it("dedupes webhook ids", () => {
    const s = new SeenIds(2);
    expect(s.first("a")).toBe(true);
    expect(s.first("a")).toBe(false);
    s.first("b"); s.first("c");
    expect(s.first("a")).toBe(true); // evicted
    expect(s.first(null)).toBe(true);
  });
  it("throttles resyncs", () => {
    const now = Date.parse("2026-10-27T00:10:00Z");
    expect(shouldResync(null, now)).toBe(true);
    expect(shouldResync("2026-10-27T00:09:30Z", now)).toBe(false);
    expect(shouldResync("2026-10-27T00:05:00Z", now)).toBe(true);
  });
  it("verifies HMAC over the raw body", () => {
    const body = '{"id":1}';
    const h = createHmac("sha256", "sek").update(body).digest("base64");
    expect(verifyWebhookHmac(body, h, "sek")).toBe(true);
    expect(verifyWebhookHmac(body + " ", h, "sek")).toBe(false);
    expect(verifyWebhookHmac(body, null, "sek")).toBe(false);
  });
  it("registers a topic once", async () => {
    const calls: string[] = [];
    const gql = async <T,>(q: string): Promise<T> => {
      calls.push(q);
      if (q.includes("webhookSubscriptions(")) return { webhookSubscriptions: { nodes: [] } } as T;
      return { webhookSubscriptionCreate: { webhookSubscription: { id: "1" }, userErrors: [] } } as T;
    };
    expect(await ensureWebhookTopicWith(gql, "ORDERS_PAID")).toEqual({ ok: true, created: true });
    expect(calls[0]).toContain("topics: [ORDERS_PAID]");
  });
});
