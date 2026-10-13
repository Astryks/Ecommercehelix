import { describe, expect, it } from "vitest";
import { ensureUninstallWebhookWith, UNINSTALL_WEBHOOK_URI } from "../src/lib/shopify/config";

function fake(existing: string[], createRes: unknown = { webhookSubscriptionCreate: { webhookSubscription: { id: "gid://1" }, userErrors: [] } }) {
  const calls: { q: string; v?: Record<string, unknown> }[] = [];
  const gql = async <T,>(q: string, v?: Record<string, unknown>): Promise<T> => {
    calls.push({ q, v });
    if (q.includes("webhookSubscriptions(")) return { webhookSubscriptions: { nodes: existing.map((uri, i) => ({ id: `${i}`, uri })) } } as T;
    return createRes as T;
  };
  return { gql, calls };
}

describe("ensureUninstallWebhookWith", () => {
  it("creates APP_UNINSTALLED when missing", async () => {
    const f = fake([]);
    expect(await ensureUninstallWebhookWith(f.gql)).toEqual({ ok: true, created: true });
    expect(f.calls[1].v).toEqual({ topic: "APP_UNINSTALLED", webhookSubscription: { uri: UNINSTALL_WEBHOOK_URI } });
  });
  it("is idempotent when it already exists", async () => {
    const f = fake([UNINSTALL_WEBHOOK_URI]);
    expect(await ensureUninstallWebhookWith(f.gql)).toEqual({ ok: true, created: false });
    expect(f.calls).toHaveLength(1);
  });
  it("treats 'already taken' as ok", async () => {
    const f = fake([], { webhookSubscriptionCreate: { webhookSubscription: null, userErrors: [{ message: "Address for this topic has already been taken" }] } });
    expect((await ensureUninstallWebhookWith(f.gql)).ok).toBe(true);
  });
  it("returns userErrors without throwing", async () => {
    const f = fake([], { webhookSubscriptionCreate: { webhookSubscription: null, userErrors: [{ message: "bad" }] } });
    expect(await ensureUninstallWebhookWith(f.gql)).toEqual({ ok: false, created: false, error: "bad" });
  });
  it("is non-fatal on API errors", async () => {
    const r = await ensureUninstallWebhookWith(async () => { throw new Error("Shopify API error 500"); });
    expect(r).toMatchObject({ ok: false, created: false });
  });
});
