import "server-only";
import { decrypt, encrypt, loadKey } from "../crypto";
import { hasDb, prisma } from "../db";
import { setShopifyProducts, setShopifySales, setShopifyStock } from "../repo";
import { logAudit } from "../meta/store";
import { aggregateOrders, ensureUninstallWebhookWith, SHOPIFY_API_VERSION, SHOPIFY_SCOPES, shopifyMode, type ShopifyOrder } from "./config";

type Actor = "user" | "cron" | "shopify";
const aad = (userId: string) => `shopify:${userId}`;
/** Tokens as stored (encrypted): Shopify issues expiring offline tokens with a refresh token. */
type Tokens = { access: string; refresh?: string; expiresAt?: number; refreshExpiresAt?: number };

export type ShopifyConn = { userId: string; shop: string; shopName: string; currency: string | null; scopes: string[]; status: string; productCount: number; lastSyncAt: string | null; lastSyncError: string | null };

const mem = ((globalThis as unknown as { __helixShopify?: Map<string, ShopifyConn & { tokenEnc: string }> }).__helixShopify ??= new Map());

export async function getShopify(userId: string): Promise<ShopifyConn | null> {
  if (!hasDb) {
    const r = mem.get(userId);
    return r ? { ...r } : null;
  }
  const r = await prisma.shopifyConnection.findUnique({ where: { userId } });
  if (!r) return null;
  return { userId, shop: r.shop, shopName: r.shopName, currency: r.currency, scopes: r.scopes ? r.scopes.split(",") : [], status: r.status, productCount: r.productCount, lastSyncAt: r.lastSyncAt?.toISOString() ?? null, lastSyncError: r.lastSyncError };
}

async function getTokenEnc(userId: string) {
  if (!hasDb) return mem.get(userId)?.tokenEnc ?? null;
  return (await prisma.shopifyConnection.findUnique({ where: { userId }, select: { tokenEnc: true } }))?.tokenEnc ?? null;
}

async function patch(userId: string, data: Partial<{ tokenEnc: string; status: string; lastSyncAt: Date; lastSyncError: string | null; shopName: string; currency: string | null; productCount: number }>) {
  if (!hasDb) {
    const r = mem.get(userId);
    if (r) mem.set(userId, { ...r, ...data, lastSyncAt: data.lastSyncAt ? data.lastSyncAt.toISOString() : r.lastSyncAt } as never);
    return;
  }
  await prisma.shopifyConnection.update({ where: { userId }, data });
}

function tokensFrom(j: { access_token: string; refresh_token?: string; expires_in?: number; refresh_token_expires_in?: number }): Tokens {
  const now = Date.now();
  return { access: j.access_token, refresh: j.refresh_token, expiresAt: j.expires_in ? now + j.expires_in * 1000 : undefined, refreshExpiresAt: j.refresh_token_expires_in ? now + j.refresh_token_expires_in * 1000 : undefined };
}

async function tokenPost(shop: string, body: Record<string, string>) {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const j = (await res.json().catch(() => ({}))) as { access_token?: string; scope?: string; refresh_token?: string; expires_in?: number; refresh_token_expires_in?: number; error?: string };
  if (!res.ok || !j.access_token) throw new Error(`Shopify token request failed (${res.status}${j.error ? ` ${j.error}` : ""}).`);
  return j as { access_token: string; scope?: string; refresh_token?: string; expires_in?: number; refresh_token_expires_in?: number };
}

/** OAuth callback: swap the code for an expiring offline token (expiring=1) and store it encrypted. */
export async function connectShopify(userId: string, shop: string, code: string) {
  if (shopifyMode() !== "live") throw new Error("Shopify app is not configured.");
  const j = await tokenPost(shop, { client_id: process.env.SHOPIFY_API_KEY!, client_secret: process.env.SHOPIFY_API_SECRET!, code, expiring: "1" });
  const granted = (j.scope ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const extra = granted.filter((s) => !SHOPIFY_SCOPES.includes(s) && !SHOPIFY_SCOPES.includes(s.replace(/^write_/, "read_")));
  if (extra.length) await logAudit(userId, { actor: "user", action: "shopify.connect", target: shop, outcome: "ok", detail: { note: "extra scopes granted", extra } });
  const tokenEnc = encrypt(JSON.stringify(tokensFrom(j)), loadKey(), aad(userId));
  const row = { shop, tokenEnc, scopes: granted.join(","), status: "active", lastSyncError: null };
  if (!hasDb) mem.set(userId, { userId, ...row, scopes: granted, shopName: shop, currency: null, productCount: 0, lastSyncAt: null });
  else await prisma.shopifyConnection.upsert({ where: { userId }, create: { userId, ...row }, update: row });
  await logAudit(userId, { actor: "user", action: "shopify.connect", target: shop, outcome: "ok", detail: { scopes: granted } });
}

/** A valid access token, refreshing it (and rotating the refresh token) when it is within 5 minutes of expiry. */
async function accessToken(userId: string, shop: string): Promise<string> {
  const enc = await getTokenEnc(userId);
  if (!enc) throw new Error("Shopify is not connected.");
  const key = loadKey();
  const t = JSON.parse(decrypt(enc, key, aad(userId))) as Tokens;
  if (!t.expiresAt || t.expiresAt - Date.now() > 300_000) return t.access;
  if (!t.refresh) throw new Error("Shopify login expired. Please reconnect.");
  const j = await tokenPost(shop, { client_id: process.env.SHOPIFY_API_KEY!, client_secret: process.env.SHOPIFY_API_SECRET!, grant_type: "refresh_token", refresh_token: t.refresh });
  const next = tokensFrom(j);
  await patch(userId, { tokenEnc: encrypt(JSON.stringify(next), key, aad(userId)) });
  return next.access;
}

async function gql<T>(userId: string, shop: string, token: string, actor: Actor, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const t0 = Date.now();
  const res = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, { method: "POST", headers: { "content-type": "application/json", "x-shopify-access-token": token }, body: JSON.stringify({ query, variables }), cache: "no-store" });
  const j = (await res.json().catch(() => ({}))) as { data?: T; errors?: unknown };
  const ok = res.ok && j.data && !j.errors;
  await logAudit(userId, { actor, action: "shopify.api", target: `POST graphql ${query.match(/^\s*(query|mutation)?\s*(\w+)?/)?.[2] ?? ""}`.trim(), outcome: ok ? "ok" : "error", httpStatus: res.status, detail: { ms: Date.now() - t0 } });
  if (!ok) throw new Error(`Shopify API error ${res.status}${j.errors ? `: ${JSON.stringify(j.errors).slice(0, 200)}` : ""}`);
  return j.data as T;
}

/** Registers APP_UNINSTALLED for the user's shop (idempotent). Non-fatal: errors are logged and returned. */
export async function ensureUninstallWebhook(userId: string, actor: Actor = "user") {
  const conn = await getShopify(userId);
  if (!conn || shopifyMode() !== "live") return { ok: false, created: false, error: "not connected" };
  try {
    const token = await accessToken(userId, conn.shop);
    const r = await ensureUninstallWebhookWith(<T,>(q: string, v?: Record<string, unknown>) => gql<T>(userId, conn.shop, token, actor, q, v));
    if (r.created || !r.ok) await logAudit(userId, { actor, action: "shopify.webhook", target: conn.shop, outcome: r.ok ? "ok" : "error", detail: r.ok ? { topic: "APP_UNINSTALLED" } : { message: r.error } });
    return r;
  } catch (e) {
    const message = (e as Error).message.slice(0, 300);
    await logAudit(userId, { actor, action: "shopify.webhook", target: conn.shop, outcome: "error", detail: { message } }).catch(() => {});
    return { ok: false, created: false, error: message };
  }
}

const SHOP_Q = `query HelixShop { shop { name currencyCode ianaTimezone } productsCount { count } }`;
// Aggregates only: no customer, email or address fields are requested.
const ORDERS_Q = `query HelixOrders($q: String!, $after: String) {
  orders(first: 100, after: $after, query: $q, sortKey: CREATED_AT) {
    pageInfo { hasNextPage endCursor }
    nodes {
      createdAt test cancelledAt
      totalLineItemsPriceSet { shopMoney { amount } }
      totalDiscountsSet { shopMoney { amount } }
      totalRefundedSet { shopMoney { amount } }
      lineItems(first: 50) { nodes { sku name quantity originalUnitPriceSet { shopMoney { amount } } variant { inventoryItem { unitCost { amount } } } } }
    }
  }
}`;
const VARIANTS_Q = `query HelixVariants($after: String) {
  productVariants(first: 250, after: $after) { pageInfo { hasNextPage endCursor } nodes { sku inventoryQuantity inventoryItem { unitCost { amount } } } }
}`;

type Money = { shopMoney: { amount: string } } | null;
const amt = (m: Money | undefined) => Number(m?.shopMoney?.amount ?? 0) || 0;

/** Pull orders for the last `days` days (Shopify allows 60 without read_all_orders) and write them into the scorecard, product lines and stock. */
export async function syncShopify(userId: string, actor: Actor = "user", days = 60): Promise<{ ok: boolean; error?: string; orders?: number }> {
  const conn = await getShopify(userId);
  if (!conn) return { ok: false, error: "not connected" };
  if (shopifyMode() !== "live") return { ok: false, error: "not configured" };
  try {
    const token = await accessToken(userId, conn.shop);
    const info = await gql<{ shop: { name: string; currencyCode: string; ianaTimezone: string }; productsCount: { count: number } }>(userId, conn.shop, token, actor, SHOP_Q);
    const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
    const orders: ShopifyOrder[] = [];
    let after: string | null = null;
    for (let page = 0; page < 50; page++) {
      type OrdersPage = { orders: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: { createdAt: string; test: boolean; cancelledAt: string | null; totalLineItemsPriceSet: Money; totalDiscountsSet: Money; totalRefundedSet: Money; lineItems: { nodes: { sku: string | null; name: string; quantity: number; originalUnitPriceSet: Money; variant: { inventoryItem: { unitCost: { amount: string } | null } | null } | null }[] } }[] } };
      const d: OrdersPage = await gql<OrdersPage>(userId, conn.shop, token, actor, ORDERS_Q, { q: `created_at:>=${since}`, after });
      for (const n of d.orders.nodes)
        orders.push({
          createdAt: n.createdAt, test: n.test, cancelledAt: n.cancelledAt,
          totalLineItems: amt(n.totalLineItemsPriceSet), totalDiscounts: amt(n.totalDiscountsSet), totalRefunded: amt(n.totalRefundedSet),
          lines: n.lineItems.nodes.map((l) => ({ sku: l.sku ?? "", name: l.name, quantity: l.quantity, price: amt(l.originalUnitPriceSet), unitCost: Number(l.variant?.inventoryItem?.unitCost?.amount ?? 0) || 0 })),
        });
      if (!d.orders.pageInfo.hasNextPage) break;
      after = d.orders.pageInfo.endCursor;
    }
    const agg = aggregateOrders(orders, info.shop.ianaTimezone || "Australia/Sydney");
    await setShopifySales(userId, agg.days);
    await setShopifyProducts(userId, agg.days.map((x) => x.date), agg.products);

    // Stock: on-hand per SKU for items the user already tracks in Helix.
    const stock: { sku: string; onHand: number; unitCost: number; dailySales: number }[] = [];
    let vAfter: string | null = null;
    for (let page = 0; page < 8; page++) {
      type VarPage = { productVariants: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: { sku: string | null; inventoryQuantity: number | null; inventoryItem: { unitCost: { amount: string } | null } | null }[] } };
      const v: VarPage = await gql<VarPage>(userId, conn.shop, token, actor, VARIANTS_Q, { after: vAfter });
      for (const n of v.productVariants.nodes) if (n.sku) stock.push({ sku: n.sku, onHand: Math.max(0, n.inventoryQuantity ?? 0), unitCost: Number(n.inventoryItem?.unitCost?.amount ?? 0) || 0, dailySales: 0 });
      if (!v.productVariants.pageInfo.hasNextPage) break;
      vAfter = v.productVariants.pageInfo.endCursor;
    }
    const last30 = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    for (const s of stock) s.dailySales = Math.round((agg.products.filter((p) => p.sku === s.sku && p.date >= last30).reduce((a, p) => a + p.units, 0) / 30) * 100) / 100;
    await setShopifyStock(userId, stock);

    await patch(userId, { status: "active", lastSyncAt: new Date(), lastSyncError: null, shopName: info.shop.name, currency: info.shop.currencyCode, productCount: info.productsCount?.count ?? 0 });
    return { ok: true, orders: orders.length };
  } catch (e) {
    const msg = (e as Error).message.slice(0, 300);
    await patch(userId, { status: /expired|invalid_request|401/.test(msg) ? "expired" : "error", lastSyncError: msg });
    await logAudit(userId, { actor, action: "shopify.sync", target: conn.shop, outcome: "error", detail: { message: msg } });
    return { ok: false, error: msg };
  }
}

export async function syncAllShopify(deadlineMs = 240_000) {
  if (!hasDb || shopifyMode() !== "live") return [];
  const start = Date.now();
  const rows = await prisma.shopifyConnection.findMany({ where: { status: { in: ["active", "error"] } }, select: { userId: true } });
  const out: { userId: string; ok: boolean }[] = [];
  for (const r of rows) {
    if (Date.now() - start > deadlineMs) break;
    await ensureUninstallWebhook(r.userId, "cron");
    out.push({ userId: r.userId, ...(await syncShopify(r.userId, "cron", 7)) });
  }
  return out;
}

/** Disconnect: ask Shopify to uninstall (revoke) the app, then delete the token and Shopify-synced product lines. */
export async function disconnectShopify(userId: string) {
  const conn = await getShopify(userId);
  if (!conn) return;
  if (shopifyMode() === "live") {
    try {
      const token = await accessToken(userId, conn.shop);
      const res = await fetch(`https://${conn.shop}/admin/api_permissions/current.json`, { method: "DELETE", headers: { "x-shopify-access-token": token } });
      await logAudit(userId, { actor: "user", action: "shopify.api", target: "DELETE api_permissions/current", outcome: res.ok ? "ok" : "error", httpStatus: res.status });
    } catch {
      /* token already gone: still delete locally */
    }
  }
  await deleteShopifyData(userId, "user", "disconnect");
}

/** Remove the connection and the product lines that came from Shopify. Scorecard totals stay unless alsoScorecard (shop/redact). */
export async function deleteShopifyData(userId: string, actor: Actor, reason: string, alsoScorecard = false) {
  if (!hasDb) mem.delete(userId);
  else {
    await prisma.productSale.deleteMany({ where: { userId, source: "shopify" } });
    if (alsoScorecard) await prisma.scorecardDay.deleteMany({ where: { userId, source: "shopify" } });
    await prisma.shopifyConnection.deleteMany({ where: { userId } });
  }
  await logAudit(userId, { actor, action: "shopify.deleted", target: "shopify", outcome: "ok", detail: { reason } });
}

export async function usersForShop(shop: string): Promise<string[]> {
  if (!hasDb) return [...mem.values()].filter((c) => c.shop === shop).map((c) => c.userId);
  return (await prisma.shopifyConnection.findMany({ where: { shop }, select: { userId: true } })).map((r) => r.userId);
}
