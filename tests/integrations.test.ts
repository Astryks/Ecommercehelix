import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { aggregateOrders, normaliseShop, shopifyMode, verifyQueryHmac, verifyWebhookHmac } from "../src/lib/shopify/config";
import { assertPaused, googleAdsMode, pausedCampaignOps, summarise } from "../src/lib/google-ads/config";
import { AI_MONTHLY_CAP, aiAvailable, costUsd, gate, gatewayOptions, monthlyBudgetUsd } from "../src/lib/ai/config";
import { auditFallback, helpFallback } from "../src/lib/ai/fallbacks";

describe("shopify", () => {
  it("is off without credentials", () => {
    expect(shopifyMode({})).toBe("off");
    expect(shopifyMode({ SHOPIFY_API_KEY: "k" })).toBe("off");
    expect(shopifyMode({ SHOPIFY_API_KEY: "k", SHOPIFY_API_SECRET: "s" })).toBe("live");
  });
  it("normalises shop domains and rejects others", () => {
    expect(normaliseShop("MyStore")).toBe("mystore.myshopify.com");
    expect(normaliseShop("https://my-store.myshopify.com/admin")).toBe("my-store.myshopify.com");
    expect(normaliseShop("evil.com")).toBeNull();
    expect(normaliseShop("a.myshopify.com.evil.com")).toBeNull();
    expect(normaliseShop("")).toBeNull();
  });
  it("verifies query and webhook hmacs", () => {
    const p = new URLSearchParams({ shop: "a.myshopify.com", code: "c", timestamp: "1" });
    const msg = "code=c&shop=a.myshopify.com&timestamp=1";
    p.set("hmac", createHmac("sha256", "sec").update(msg).digest("hex"));
    expect(verifyQueryHmac(p, "sec")).toBe(true);
    expect(verifyQueryHmac(p, "other")).toBe(false);
    const body = '{"shop_domain":"a.myshopify.com"}';
    const h = createHmac("sha256", "sec").update(body).digest("base64");
    expect(verifyWebhookHmac(body, h, "sec")).toBe(true);
    expect(verifyWebhookHmac(body + " ", h, "sec")).toBe(false);
    expect(verifyWebhookHmac(body, null, "sec")).toBe(false);
  });
  it("aggregates orders by store-local day, skipping test and cancelled orders", () => {
    const line = { sku: "A", name: "Shirt", quantity: 2, price: 50, unitCost: 20 };
    const r = aggregateOrders([
      { createdAt: "2026-10-01T14:30:00Z", totalLineItems: 100, totalDiscounts: 10, totalRefunded: 0, lines: [line] }, // 2 Oct in Sydney
      { createdAt: "2026-10-01T15:00:00Z", totalLineItems: 50, totalDiscounts: 0, totalRefunded: 50, lines: [{ ...line, quantity: 1 }] },
      { createdAt: "2026-10-01T15:00:00Z", test: true, totalLineItems: 999, totalDiscounts: 0, totalRefunded: 0, lines: [line] },
      { createdAt: "2026-10-01T15:00:00Z", cancelledAt: "x", totalLineItems: 999, totalDiscounts: 0, totalRefunded: 0, lines: [line] },
    ], "Australia/Sydney");
    expect(r.days).toEqual([{ date: "2026-10-02", orders: 2, units: 3, revenue: 150, discounts: 10, refunds: 50, cogs: 60 }]);
    expect(r.products).toEqual([{ date: "2026-10-02", sku: "A", name: "Shirt", units: 3, price: 50, unitCost: 20 }]);
  });
});

describe("google ads", () => {
  it("is live with the OAuth client alone (developer tokens sunset 9 Sep 2026)", () => {
    expect(googleAdsMode({ GOOGLE_ADS_CLIENT_ID: "a" })).toBe("off");
    expect(googleAdsMode({ GOOGLE_ADS_CLIENT_ID: "a", GOOGLE_ADS_CLIENT_SECRET: "b", GOOGLE_ADS_DEVELOPER_TOKEN: "c" })).toBe("live");
    expect(googleAdsMode({ GOOGLE_ADS_CLIENT_ID: "a", GOOGLE_ADS_CLIENT_SECRET: "b" })).toBe("live");
  });
  it("summarises spend and ROAS", () => {
    const s = summarise([
      { campaign: { id: "1", name: "S", status: "ENABLED" }, segments: { date: "2026-10-01" }, metrics: { costMicros: "10000000", conversions: 1, conversionsValue: 40 } },
      { campaign: { id: "1", name: "S", status: "ENABLED" }, segments: { date: "2026-10-02" }, metrics: { costMicros: "10000000", conversions: 0, conversionsValue: 0 } },
    ], "AUD");
    expect(s.totals).toEqual({ spend: 20, value: 40, conversions: 1, roas: 2 });
    expect(s.daily).toEqual([{ date: "2026-10-01", spend: 10, revenue: 40 }, { date: "2026-10-02", spend: 10, revenue: 0 }]);
  });
  it("only ever builds PAUSED campaigns", () => {
    const ops = pausedCampaignOps("123", "x", 20);
    const body = ops.campaign("customers/123/campaignBudgets/9");
    expect(body.operations[0].create.status).toBe("PAUSED");
    expect(() => assertPaused(body)).not.toThrow();
    expect(() => assertPaused({ operations: [{ create: { status: "ENABLED" } }] })).toThrow(/paused/);
    expect(ops.budget.operations[0].create.amountMicros).toBe("20000000");
  });
});

describe("ai layer", () => {
  it("asks the gateway for providers that do not train on prompts (privacy, terms and FAQ rely on it)", () => {
    expect(gatewayOptions("u1", "help")).toEqual({ user: "u1", tags: ["feature:help"], disallowPromptTraining: true });
  });
  it("is off without gateway auth or with the kill switch", () => {
    expect(aiAvailable({})).toBe(false);
    expect(aiAvailable({ AI_GATEWAY_API_KEY: "x" })).toBe(true);
    expect(aiAvailable({ AI_GATEWAY_API_KEY: "x", AI_DISABLED: "1" })).toBe(false);
  });
  it("enforces caps and the global budget", () => {
    const base = { available: true, plan: "starter" as const, usedThisMonth: 0, spentThisMonthUsd: 0, budgetUsd: 25 };
    expect(gate(base)).toEqual({ ok: true });
    expect(gate({ ...base, usedThisMonth: AI_MONTHLY_CAP.starter })).toEqual({ ok: false, reason: "cap" });
    expect(gate({ ...base, spentThisMonthUsd: 25 })).toEqual({ ok: false, reason: "budget" });
    expect(gate({ ...base, available: false })).toEqual({ ok: false, reason: "off" });
    expect(AI_MONTHLY_CAP.free).toBeLessThan(AI_MONTHLY_CAP.starter);
    expect(monthlyBudgetUsd({})).toBe(25);
    expect(monthlyBudgetUsd({ AI_MONTHLY_BUDGET_USD: "0" })).toBe(0);
  });
  it("costs a fraction of a cent per call", () => {
    expect(costUsd(1500, 400)).toBeLessThan(0.001);
  });
  it("falls back to rule-based text", () => {
    expect(helpFallback("my profit is confusing")).toMatch(/Profit/);
    expect(auditFallback([{ id: "a", severity: "high", title: "No reviews", quote: "", fix: "Add reviews." }])).toMatch(/1\. No reviews: Add reviews\./);
  });
});
