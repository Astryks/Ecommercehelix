import { createHmac, timingSafeEqual } from "node:crypto";

/** Shopify app settings. Only read scopes: Helix never writes to a store. */
export const SHOPIFY_SCOPES = ["read_orders", "read_products", "read_inventory"];
export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-10";

/** live: SHOPIFY_API_KEY and SHOPIFY_API_SECRET are set. off: anything else, and the UI shows "coming soon". */
export function shopifyMode(env: Record<string, string | undefined> = process.env): "live" | "off" {
  return env.SHOPIFY_API_KEY && env.SHOPIFY_API_SECRET ? "live" : "off";
}

const SHOP_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

/** Accepts "mystore", "mystore.myshopify.com" or "https://mystore.myshopify.com/admin". Returns null when it is not a myshopify domain. */
export function normaliseShop(input: string | null | undefined): string | null {
  if (!input) return null;
  let s = input.trim().toLowerCase().replace(/^https?:\/\//, "").split(/[/?#]/)[0];
  if (/^[a-z0-9][a-z0-9-]*$/.test(s)) s = `${s}.myshopify.com`;
  return SHOP_RE.test(s) && s.length <= 100 ? s : null;
}

function safeEq(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Verifies the hmac Shopify adds to OAuth redirects (hex SHA-256 over the sorted query, hmac removed). */
export function verifyQueryHmac(params: URLSearchParams, secret: string): boolean {
  const hmac = params.get("hmac");
  if (!hmac) return false;
  const msg = [...params.entries()].filter(([k]) => k !== "hmac" && k !== "signature").sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("&");
  return safeEq(createHmac("sha256", secret).update(msg).digest("hex"), hmac);
}

/** Verifies X-Shopify-Hmac-Sha256 (base64 SHA-256 over the raw body). */
export function verifyWebhookHmac(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  return safeEq(createHmac("sha256", secret).update(rawBody, "utf8").digest("base64"), header);
}

export type ShopifyOrder = {
  createdAt: string;
  test?: boolean;
  cancelledAt?: string | null;
  totalLineItems: number; // gross, before discounts
  totalDiscounts: number;
  totalRefunded: number;
  lines: { sku: string; name: string; quantity: number; price: number; unitCost: number }[];
};

/** Calendar day of an ISO timestamp in a given IANA time zone. */
export function dayIn(iso: string, tz: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

/** Daily totals and product lines from orders. Test and cancelled orders are skipped. No customer data is used. */
export function aggregateOrders(orders: ShopifyOrder[], tz: string) {
  const days = new Map<string, { date: string; orders: number; units: number; revenue: number; discounts: number; refunds: number; cogs: number }>();
  const prods = new Map<string, { date: string; sku: string; name: string; units: number; sales: number; cost: number }>();
  const r2 = (n: number) => Math.round(n * 100) / 100;
  for (const o of orders) {
    if (o.test || o.cancelledAt) continue;
    const date = dayIn(o.createdAt, tz);
    const d = days.get(date) ?? { date, orders: 0, units: 0, revenue: 0, discounts: 0, refunds: 0, cogs: 0 };
    d.orders += 1;
    d.revenue += o.totalLineItems;
    d.discounts += o.totalDiscounts;
    d.refunds += o.totalRefunded;
    for (const l of o.lines) {
      d.units += l.quantity;
      d.cogs += l.unitCost * l.quantity;
      const sku = l.sku || l.name;
      const k = `${date}|${sku}`;
      const p = prods.get(k) ?? { date, sku, name: l.name, units: 0, sales: 0, cost: 0 };
      p.units += l.quantity;
      p.sales += l.price * l.quantity;
      p.cost += l.unitCost * l.quantity;
      prods.set(k, p);
    }
    days.set(date, d);
  }
  return {
    days: [...days.values()].map((d) => ({ ...d, revenue: r2(d.revenue), discounts: r2(d.discounts), refunds: r2(d.refunds), cogs: r2(d.cogs) })).sort((a, b) => a.date.localeCompare(b.date)),
    products: [...prods.values()].filter((p) => p.units > 0).map((p) => ({ date: p.date, sku: p.sku.slice(0, 120), name: p.name.slice(0, 200), units: p.units, price: r2(p.sales / p.units), unitCost: r2(p.cost / p.units) })),
  };
}

export const UNINSTALL_WEBHOOK_URI = "https://ecommercehelix.com/api/shopify/webhooks";
export const WEBHOOKS_Q = `query HelixWebhooks { webhookSubscriptions(first: 25, topics: [APP_UNINSTALLED]) { nodes { id uri } } }`;
export const WEBHOOK_CREATE_M = `mutation HelixWebhookCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
  webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) { webhookSubscription { id } userErrors { field message } }
}`;
type Gql = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>;

/** Idempotent: creates the APP_UNINSTALLED subscription only when none points at our endpoint. Never throws. */
export async function ensureUninstallWebhookWith(gql: Gql, uri = UNINSTALL_WEBHOOK_URI): Promise<{ ok: boolean; created: boolean; error?: string }> {
  try {
    const list = await gql<{ webhookSubscriptions: { nodes: { id: string; uri: string }[] } }>(WEBHOOKS_Q);
    if (list.webhookSubscriptions.nodes.some((n) => n.uri === uri)) return { ok: true, created: false };
    const r = await gql<{ webhookSubscriptionCreate: { webhookSubscription: { id: string } | null; userErrors: { field?: string[]; message: string }[] } }>(WEBHOOK_CREATE_M, { topic: "APP_UNINSTALLED", webhookSubscription: { uri } });
    const errs = r.webhookSubscriptionCreate.userErrors;
    if (errs.length) {
      // A race or an existing subscription is not a failure.
      if (errs.every((e) => /already been taken|already exists/i.test(e.message))) return { ok: true, created: false };
      return { ok: false, created: false, error: errs.map((e) => e.message).join("; ").slice(0, 300) };
    }
    return { ok: true, created: true };
  } catch (e) {
    return { ok: false, created: false, error: (e as Error).message.slice(0, 300) };
  }
}

/** Same as ensureUninstallWebhookWith for any topic (used for order webhooks behind SHOPIFY_ORDER_WEBHOOKS). */
export async function ensureWebhookTopicWith(gql: Gql, topic: string, uri = UNINSTALL_WEBHOOK_URI): Promise<{ ok: boolean; created: boolean; error?: string }> {
  try {
    const q = `query HelixWebhooksT { webhookSubscriptions(first: 25, topics: [${topic.replace(/[^A-Z_]/g, "")}]) { nodes { id uri } } }`;
    const list = await gql<{ webhookSubscriptions: { nodes: { id: string; uri: string }[] } }>(q);
    if (list.webhookSubscriptions.nodes.some((n) => n.uri === uri)) return { ok: true, created: false };
    const r = await gql<{ webhookSubscriptionCreate: { webhookSubscription: { id: string } | null; userErrors: { message: string }[] } }>(WEBHOOK_CREATE_M, { topic, webhookSubscription: { uri } });
    const errs = r.webhookSubscriptionCreate.userErrors;
    if (errs.length && !errs.every((e) => /already been taken|already exists/i.test(e.message))) return { ok: false, created: false, error: errs.map((e) => e.message).join("; ").slice(0, 300) };
    return { ok: true, created: !errs.length };
  } catch (e) {
    return { ok: false, created: false, error: (e as Error).message.slice(0, 300) };
  }
}
