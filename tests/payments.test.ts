import { describe, expect, it, vi, beforeEach } from "vitest";
// The Stripe client is created when @/lib/stripe is first imported, so the test keys must exist before any import runs.
vi.hoisted(() => { process.env.STRIPE_SECRET_KEY = "sk_test_dummy"; process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret"; });
import Stripe from "stripe";
import { billingView, isStale, planForStatus, prorationFor, subFields } from "@/lib/billing";
import { planForPrice, priceFor } from "@/lib/stripe";

const ENV = { STRIPE_PRICE_STARTER: "price_s_usd", STRIPE_PRICE_GROWTH: "price_g_usd", STRIPE_PRICE_STARTER_LEGACY: "price_s_aud", STRIPE_PRICE_GROWTH_LEGACY: "price_g_aud, price_g_old" };

describe("prices", () => {
  it("maps current USD and legacy prices to plans; unknown prices grant nothing", () => {
    expect(planForPrice("price_s_usd", ENV)).toBe("starter");
    expect(planForPrice("price_s_aud", ENV)).toBe("starter");
    expect(planForPrice("price_g_old", ENV)).toBe("growth");
    expect(planForPrice("price_unknown", ENV, { metadata: { helix_plan: "growth" } })).toBe("growth");
    expect(planForPrice("price_unknown", ENV, { lookup_key: "helix_starter_usd_monthly" })).toBe("starter");
    expect(planForPrice("price_unknown", ENV, { metadata: { helix_plan: "admin" } })).toBe("free");
    expect(planForPrice("price_hacker", ENV)).toBe("free");
    expect(planForPrice(null, ENV)).toBe("free");
    expect(priceFor("growth", ENV)).toBe("price_g_usd");
    expect(priceFor("free", ENV)).toBeUndefined();
  });
});

describe("gating by status", () => {
  it("keeps paid access for active, trialing and past_due (grace), drops it otherwise", () => {
    for (const s of ["active", "trialing", "past_due"]) expect(planForStatus(s, "growth")).toBe("growth");
    for (const s of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]) expect(planForStatus(s, "growth")).toBe("free");
  });
  it("cancel at period end keeps the plan until Stripe ends the subscription", () => {
    const f = subFields({ id: "sub_1", status: "active", cancel_at_period_end: true, items: { data: [{ current_period_end: 1800000000, price: { id: "price_s_usd" } }] } }, (p) => planForPrice(p, ENV));
    expect(f).toMatchObject({ plan: "starter", cancelAtPeriodEnd: true, priceId: "price_s_usd" });
    expect(f.currentPeriodEnd?.toISOString()).toBe(new Date(1800000000 * 1000).toISOString());
  });
  it("billing view states", () => {
    expect(billingView({ plan: "free", status: "active", cancelAtPeriodEnd: false, subscriptionId: null })).toBe("free");
    expect(billingView({ plan: "starter", status: "active", cancelAtPeriodEnd: false, subscriptionId: "s" })).toBe("active");
    expect(billingView({ plan: "starter", status: "active", cancelAtPeriodEnd: true, subscriptionId: "s" })).toBe("canceling");
    expect(billingView({ plan: "starter", status: "past_due", cancelAtPeriodEnd: false, subscriptionId: "s" })).toBe("past_due");
    expect(billingView({ plan: "free", status: "canceled", cancelAtPeriodEnd: false, subscriptionId: "s" })).toBe("ended");
  });
  it("ignores out-of-order events", () => {
    expect(isStale(100, new Date(200_000))).toBe(true);
    expect(isStale(300, new Date(200_000))).toBe(false);
    expect(isStale(300, null)).toBe(false);
  });
  it("prorates: upgrades invoiced now, downgrades credited", () => {
    expect(prorationFor("starter", "growth")).toBe("always_invoice");
    expect(prorationFor("growth", "starter")).toBe("create_prorations");
  });
});

// ---------- webhook route ----------
const store = vi.hoisted(() => ({ claimed: new Set<string>(), rows: new Map<string, Record<string, unknown>>(), writes: [] as unknown[], emails: [] as string[] }));
vi.mock("@/lib/billing-store", () => ({
  claimEvent: async (id: string) => (store.claimed.has(id) ? false : (store.claimed.add(id), true)),
  releaseEvent: async (id: string) => void store.claimed.delete(id),
  findSub: async (w: { subscriptionId?: string; customerId?: string; userId?: string }) => [...store.rows.values()].find((r) => (w.subscriptionId && r.subscriptionId === w.subscriptionId) || (w.customerId && r.customerId === w.customerId) || (w.userId && r.userId === w.userId)) ?? null,
  writeSub: async (userId: string, p: Record<string, unknown>) => { store.writes.push({ userId, ...p }); store.rows.set(userId, { ...(store.rows.get(userId) ?? { userId }), ...p }); },
}));
vi.mock("@/lib/email/notify", () => ({ notify: async (_u: unknown, kind: string) => { store.emails.push(kind); return "sent"; } }));

const SECRET = "whsec_test_secret";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = SECRET;
Object.assign(process.env, ENV);
const signer = new Stripe("sk_test_dummy");
function req(event: object, sig?: string) {
  const payload = JSON.stringify(event);
  return new Request("http://x/api/stripe/webhook", { method: "POST", body: payload, headers: { "stripe-signature": sig ?? signer.webhooks.generateTestHeaderString({ payload, secret: SECRET }) } });
}
const sub = (o: Record<string, unknown> = {}) => ({ id: "sub_1", object: "subscription", status: "active", cancel_at_period_end: false, customer: "cus_1", metadata: { userId: "u1" }, items: { data: [{ current_period_end: 1800000000, price: { id: "price_s_usd" } }] }, ...o });

describe("stripe webhook", () => {
  beforeEach(() => { store.claimed.clear(); store.rows.clear(); store.writes.length = 0; store.emails.length = 0; store.rows.set("u1", { userId: "u1", email: "a@b.co", name: "A", plan: "free", status: "active", cancelAtPeriodEnd: false, lastEventAt: null, customerId: "cus_1", subscriptionId: null }); });
  it("rejects a bad signature", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const r = await POST(req({ id: "evt_x", type: "customer.subscription.updated", created: 1, data: { object: sub() } }, "t=1,v1=bad"));
    expect(r.status).toBe(400);
  });
  it("processes an event once (idempotent) and sets the plan from the price", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const ev = { id: "evt_1", object: "event", type: "customer.subscription.created", created: 1000, data: { object: sub() } };
    expect((await (await POST(req(ev))).json()).result).toBe("ok");
    expect((await (await POST(req(ev))).json()).duplicate).toBe(true);
    expect(store.writes).toHaveLength(1);
    expect(store.rows.get("u1")).toMatchObject({ plan: "starter", subscriptionId: "sub_1" });
  });
  it("cancel at period end keeps access and sends one thank-you email", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    await POST(req({ id: "evt_a", object: "event", type: "customer.subscription.created", created: 1000, data: { object: sub() } }));
    await POST(req({ id: "evt_b", object: "event", type: "customer.subscription.updated", created: 2000, data: { object: sub({ cancel_at_period_end: true }) } }));
    expect(store.rows.get("u1")).toMatchObject({ plan: "starter", cancelAtPeriodEnd: true });
    expect(store.emails).toEqual(["cancel"]);
  });
  it("ignores an older event that arrives late", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    await POST(req({ id: "evt_new", object: "event", type: "customer.subscription.updated", created: 3000, data: { object: sub({ status: "canceled" }) } }));
    const r = await (await POST(req({ id: "evt_old", object: "event", type: "customer.subscription.updated", created: 1000, data: { object: sub() } }))).json();
    expect(r.result).toBe("stale");
    expect(store.rows.get("u1")).toMatchObject({ plan: "free", status: "canceled" });
  });
  it("payment failed sets past_due (plan kept) and emails; invoice paid restores active and sends a receipt", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    store.rows.set("u1", { ...store.rows.get("u1"), plan: "starter", subscriptionId: "sub_1" });
    await POST(req({ id: "evt_f", object: "event", type: "invoice.payment_failed", created: 5000, data: { object: { id: "in_1", object: "invoice", customer: "cus_1", amount_due: 2900, currency: "usd", hosted_invoice_url: "https://pay" } } }));
    expect(store.rows.get("u1")).toMatchObject({ status: "past_due", plan: "starter" });
    await POST(req({ id: "evt_p", object: "event", type: "invoice.paid", created: 6000, data: { object: { id: "in_1", object: "invoice", customer: "cus_1", amount_paid: 2900, currency: "usd" } } }));
    expect(store.rows.get("u1")).toMatchObject({ status: "active" });
    expect(store.emails).toEqual(["failed", "receipt"]);
  });
});
