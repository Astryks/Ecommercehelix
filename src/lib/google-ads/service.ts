import "server-only";
import { decrypt, encrypt, loadKey } from "../crypto";
import { hasDb, prisma } from "../db";
import { setChannelDays, getDays, getProductName, getProducts, getSettings, setGoogleSpend } from "../repo";
import { getShopify } from "../shopify/service";
import { targetsFrom } from "../targets";
import { logAudit } from "../meta/store";
import { cleanPropertyId, ga4On, ga4Sessions, GA4_SCOPE, assertAllPaused, assertPaused, cleanCustomerId, draftAdInput, pausedAdGroupOps, GOOGLE_ADS_BASE, googleAdsMode, pausedCampaignOps, summarise, type GaRow, type GaSnapshot } from "./config";

type Actor = "user" | "cron";
const aad = (userId: string) => `google-ads:${userId}`;

export type GaConn = { userId: string; googleEmail: string; customerId: string | null; customerName: string | null; loginCustomerId: string | null; currency: string | null; status: string; lastSyncAt: string | null; lastSyncError: string | null };

type MemRow = GaConn & { tokenEnc: string; snapshot?: GaSnapshot; drafts: GaDraft[] };
export type GaDraft = { id: string; status: string; campaignId: string | null; error: string | null; createdAt: string };
const mem = ((globalThis as unknown as { __helixGa?: Map<string, MemRow> }).__helixGa ??= new Map());

export async function getGoogleAds(userId: string): Promise<GaConn | null> {
  if (!hasDb) return mem.get(userId) ?? null;
  const r = await prisma.googleAdsConnection.findUnique({ where: { userId } });
  if (!r) return null;
  return { userId, googleEmail: r.googleEmail, customerId: r.customerId, customerName: r.customerName, loginCustomerId: r.loginCustomerId, currency: r.currency, status: r.status, lastSyncAt: r.lastSyncAt?.toISOString() ?? null, lastSyncError: r.lastSyncError };
}

async function patch(userId: string, data: Partial<{ customerId: string | null; customerName: string | null; loginCustomerId: string | null; currency: string | null; status: string; lastSyncAt: Date; lastSyncError: string | null }>) {
  if (!hasDb) {
    const r = mem.get(userId);
    if (r) mem.set(userId, { ...r, ...data, lastSyncAt: data.lastSyncAt ? data.lastSyncAt.toISOString() : r.lastSyncAt });
    return;
  }
  await prisma.googleAdsConnection.update({ where: { userId }, data });
}

/** OAuth callback: code -> refresh token (offline), stored encrypted. */
export async function connectGoogleAds(userId: string, code: string, redirectUri: string) {
  if (googleAdsMode() !== "live") throw new Error("Google Ads is not configured.");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_ADS_CLIENT_ID!, client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    cache: "no-store",
  });
  const j = (await res.json().catch(() => ({}))) as { refresh_token?: string; scope?: string; id_token?: string; error?: string };
  if (!res.ok || !j.refresh_token) throw new Error(`Google token exchange failed (${res.status}${j.error ? ` ${j.error}` : ""}).`);
  if (!(j.scope ?? "").includes("auth/adwords")) throw new Error("The Google Ads permission was not granted.");
  let email = "";
  try {
    // The id_token comes straight from Google's token endpoint over TLS, so reading the payload is enough here.
    email = JSON.parse(Buffer.from((j.id_token ?? "").split(".")[1] ?? "", "base64url").toString("utf8")).email ?? "";
  } catch {
    /* email is display-only */
  }
  const tokenEnc = encrypt(j.refresh_token, loadKey(), aad(userId));
  const row = { googleEmail: email, tokenEnc, scopes: j.scope ?? "", status: "active", lastSyncError: null };
  if (!hasDb) mem.set(userId, { userId, ...row, customerId: null, customerName: null, loginCustomerId: null, currency: null, lastSyncAt: null, drafts: [] });
  else await prisma.googleAdsConnection.upsert({ where: { userId }, create: { userId, ...row }, update: { ...row, customerId: null, customerName: null } });
  await logAudit(userId, { actor: "user", action: "google.connect", target: "oauth", outcome: "ok" });
}

async function accessToken(userId: string): Promise<string> {
  const enc = hasDb ? (await prisma.googleAdsConnection.findUnique({ where: { userId }, select: { tokenEnc: true } }))?.tokenEnc : mem.get(userId)?.tokenEnc;
  if (!enc) throw new Error("Google Ads is not connected.");
  const refresh = decrypt(enc, loadKey(), aad(userId));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_ADS_CLIENT_ID!, client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!, refresh_token: refresh, grant_type: "refresh_token" }),
    cache: "no-store",
  });
  const j = (await res.json().catch(() => ({}))) as { access_token?: string; error?: string };
  if (!res.ok || !j.access_token) {
    if (j.error === "invalid_grant") await patch(userId, { status: "expired", lastSyncError: "Google access was removed or expired. Please reconnect." });
    throw new Error(`Google sign-in refresh failed (${j.error ?? res.status}).`);
  }
  return j.access_token;
}

async function ads<T>(userId: string, actor: Actor, token: string, method: "GET" | "POST", path: string, body?: unknown, loginCustomerId?: string | null): Promise<T> {
  const t0 = Date.now();
  const headers: Record<string, string> = { authorization: `Bearer ${token}`, "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!, "content-type": "application/json" };
  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;
  const res = await fetch(`${GOOGLE_ADS_BASE}/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  const j = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  await logAudit(userId, { actor, action: "google.api", target: `${method} ${path.replace(/\d{6,}/g, "{id}")}`, outcome: res.ok ? "ok" : "error", httpStatus: res.status, detail: { ms: Date.now() - t0 } });
  if (!res.ok) throw new Error(`Google Ads API ${res.status}: ${(j.error?.message ?? "").slice(0, 200)}`);
  return j;
}

/** Ad accounts the signed-in Google user can reach, with names and currency. */
export async function listCustomers(userId: string) {
  const token = await accessToken(userId);
  const r = await ads<{ resourceNames?: string[] }>(userId, "user", token, "GET", "customers:listAccessibleCustomers");
  const ids = (r.resourceNames ?? []).map((n) => n.split("/")[1]).slice(0, 20);
  const out: { id: string; name: string; currency: string; manager: boolean }[] = [];
  for (const id of ids) {
    try {
      const q = await ads<{ results?: { customer: { descriptiveName?: string; currencyCode?: string; manager?: boolean } }[] }>(userId, "user", token, "POST", `customers/${id}/googleAds:search`, { query: "SELECT customer.descriptive_name, customer.currency_code, customer.manager FROM customer LIMIT 1" });
      const c = q.results?.[0]?.customer;
      out.push({ id, name: c?.descriptiveName || id, currency: c?.currencyCode ?? "", manager: Boolean(c?.manager) });
    } catch {
      out.push({ id, name: id, currency: "", manager: false });
    }
  }
  return out;
}

export async function pickCustomer(userId: string, customerId: string, loginCustomerId?: string) {
  const id = cleanCustomerId(customerId);
  const list = await listCustomers(userId);
  const c = list.find((x) => x.id === id);
  if (!c) throw new Error("That Google Ads account is not available to this Google login.");
  await patch(userId, { customerId: id, customerName: c.name, currency: c.currency || null, loginCustomerId: loginCustomerId ? cleanCustomerId(loginCustomerId) : null });
}

/** Read the last 30 days of campaign results into the snapshot and the scorecard (Google spend and conversion value). */
export async function syncGoogleAds(userId: string, actor: Actor = "user"): Promise<{ ok: boolean; error?: string }> {
  const conn = await getGoogleAds(userId);
  if (!conn?.customerId) return { ok: false, error: "no account picked" };
  if (googleAdsMode() !== "live") return { ok: false, error: "not configured" };
  try {
    const token = await accessToken(userId);
    const query = "SELECT campaign.id, campaign.name, campaign.status, segments.date, metrics.cost_micros, metrics.conversions, metrics.conversions_value, metrics.clicks, metrics.impressions FROM campaign WHERE segments.date DURING LAST_30_DAYS";
    const rows: GaRow[] = [];
    let pageToken: string | undefined;
    for (let i = 0; i < 20; i++) {
      const r: { results?: GaRow[]; nextPageToken?: string } = await ads<{ results?: GaRow[]; nextPageToken?: string }>(userId, actor, token, "POST", `customers/${conn.customerId}/googleAds:search`, { query, ...(pageToken ? { pageToken } : {}) }, conn.loginCustomerId);
      rows.push(...(r.results ?? []));
      if (!r.nextPageToken) break;
      pageToken = r.nextPageToken;
    }
    const snap = summarise(rows, conn.currency);
    await setGoogleSpend(userId, snap.daily);
    if (!hasDb) {
      const m = mem.get(userId);
      if (m) m.snapshot = snap;
    } else {
      const data = JSON.stringify(snap);
      await prisma.googleAdsSnapshot.upsert({ where: { userId }, create: { userId, data }, update: { data, syncedAt: new Date() } });
    }
    await patch(userId, { status: "active", lastSyncAt: new Date(), lastSyncError: null });
    return { ok: true };
  } catch (e) {
    const msg = (e as Error).message.slice(0, 300);
    const cur = await getGoogleAds(userId);
    await patch(userId, { status: cur?.status === "expired" ? "expired" : "error", lastSyncError: msg });
    return { ok: false, error: msg };
  }
}

export async function getGoogleSnapshot(userId: string): Promise<GaSnapshot | null> {
  if (!hasDb) return mem.get(userId)?.snapshot ?? null;
  const r = await prisma.googleAdsSnapshot.findUnique({ where: { userId } });
  return r ? (JSON.parse(r.data) as GaSnapshot) : null;
}

/** Save the GA4 property id to pull sessions from (GA4_SESSIONS=1 only). */
export async function setGa4Property(userId: string, property: string) {
  if (!ga4On()) throw new Error("GA4 sessions sync is off (GA4_SESSIONS).");
  if (!hasDb) throw new Error("GA4 needs the database (not available in demo mode).");
  const propertyId = cleanPropertyId(property);
  if (!propertyId) throw new Error("Enter the numeric GA4 property id (Admin > Property details).");
  await prisma.ga4Property.upsert({ where: { userId }, create: { userId, propertyId }, update: { propertyId, lastSyncError: null } });
}

/** Daily GA4 sessions (last 30 days) into ScorecardDay.sessions, using the Google connection's token. */
export async function syncGa4Sessions(userId: string, actor: Actor = "user"): Promise<{ ok: boolean; error?: string }> {
  if (!ga4On() || googleAdsMode() !== "live") return { ok: false, error: "not configured" };
  if (!hasDb) return { ok: false, error: "no database" };
  const p = await prisma.ga4Property.findUnique({ where: { userId } });
  if (!p) return { ok: false, error: "No GA4 property set." };
  const conn = await prisma.googleAdsConnection.findUnique({ where: { userId }, select: { scopes: true } });
  const fail = async (msg: string) => {
    await prisma.ga4Property.update({ where: { userId }, data: { lastSyncError: msg.slice(0, 300) } });
    await logAudit(userId, { actor, action: "ga4.sync", target: p.propertyId, outcome: "error", detail: { message: msg.slice(0, 300) } });
    return { ok: false, error: msg };
  };
  if (!conn) return fail("Google is not connected.");
  if (!conn.scopes.includes(GA4_SCOPE)) return fail("Reconnect Google to allow read-only Analytics access.");
  try {
    const token = await accessToken(userId);
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${p.propertyId}:runReport`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }], limit: 100 }),
      cache: "no-store",
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return fail(`GA4 error ${res.status}: ${JSON.stringify((j as { error?: unknown }).error ?? "").slice(0, 200)}`);
    await setChannelDays(userId, "sessions", "ga4", ga4Sessions(j));
    await prisma.ga4Property.update({ where: { userId }, data: { lastSyncAt: new Date(), lastSyncError: null } });
    return { ok: true };
  } catch (e) {
    return fail((e as Error).message);
  }
}

export async function syncAllGoogleAds(deadlineMs = 240_000) {
  if (!hasDb || googleAdsMode() !== "live") return [];
  if (ga4On()) for (const g of await prisma.ga4Property.findMany({ select: { userId: true } })) await syncGa4Sessions(g.userId, "cron").catch(() => {});
  const start = Date.now();
  const rows = await prisma.googleAdsConnection.findMany({ where: { status: { not: "expired" }, customerId: { not: null } }, select: { userId: true } });
  const out: { userId: string; ok: boolean }[] = [];
  for (const r of rows) {
    if (Date.now() - start > deadlineMs) break;
    out.push({ userId: r.userId, ...(await syncGoogleAds(r.userId, "cron")) });
  }
  return out;
}

/** After the owner approves in Helix: create a budget and a PAUSED Search campaign. Then a PAUSED ad group, phrase keywords and a responsive search ad from the user's product names. */
export async function createPausedGoogleCampaign(userId: string, approvalId: string) {
  const conn = await getGoogleAds(userId);
  const save = async (d: { status: string; campaignId?: string | null; budgetId?: string | null; error?: string | null }) => {
    if (!hasDb) mem.get(userId)?.drafts.unshift({ id: crypto.randomUUID(), status: d.status, campaignId: d.campaignId ?? null, error: d.error ?? null, createdAt: new Date().toISOString() });
    else await prisma.googleAdsDraft.create({ data: { userId, approvalId, status: d.status, campaignId: d.campaignId ?? null, budgetId: d.budgetId ?? null, error: d.error ?? null } });
  };
  if (!conn?.customerId || googleAdsMode() !== "live") return save({ status: "failed", error: "Google Ads is not connected or no account is picked." });
  try {
    const token = await accessToken(userId);
    const t = targetsFrom(await getDays(userId), await getSettings(userId));
    const budget = Math.min(100, Math.max(10, Math.round(t.aov * (t.targetMerPct / 100) * 2)));
    const name = `Helix-Search-TEST-${new Date().toISOString().slice(0, 10)}`;
    const ops = pausedCampaignOps(conn.customerId, name, budget);
    const b = await ads<{ results: { resourceName: string }[] }>(userId, "user", token, "POST", `customers/${conn.customerId}/campaignBudgets:mutate`, ops.budget, conn.loginCustomerId);
    const body = ops.campaign(b.results[0].resourceName);
    assertPaused(body);
    const c = await ads<{ results: { resourceName: string }[] }>(userId, "user", token, "POST", `customers/${conn.customerId}/campaigns:mutate`, body, conn.loginCustomerId);
    // Ad group, keywords and a responsive search ad, all PAUSED. A failure here keeps the paused campaign and reports the error.
    let adErr: string | null = null;
    try {
      const shop = await getShopify(userId).catch(() => null);
      const products = [...new Set((await getProducts(userId)).map((p) => p.name))];
      const input = draftAdInput(products.length ? products : [await getProductName(userId)].filter(Boolean), shop?.shopName ?? null, shop ? `https://${shop.shop}` : null);
      if (input.keywords.length) {
        const g = pausedAdGroupOps(conn.customerId, c.results[0].resourceName, name, input);
        assertAllPaused(g);
        await ads(userId, "user", token, "POST", `customers/${conn.customerId}/googleAds:mutate`, g, conn.loginCustomerId);
      } else adErr = "No product names yet, so no keywords were added. Add them in Google Ads.";
    } catch (e) {
      adErr = `Campaign created, but ad group/keywords/ad failed: ${(e as Error).message.slice(0, 250)}`;
    }
    await save({ status: "created", campaignId: c.results[0].resourceName.split("/").pop(), budgetId: b.results[0].resourceName.split("/").pop(), error: adErr });
  } catch (e) {
    await save({ status: "failed", error: (e as Error).message.slice(0, 300) });
  }
}

export async function listGoogleDrafts(userId: string): Promise<GaDraft[]> {
  if (!hasDb) return mem.get(userId)?.drafts ?? [];
  const rows = await prisma.googleAdsDraft.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 });
  return rows.map((r) => ({ id: r.id, status: r.status, campaignId: r.campaignId, error: r.error, createdAt: r.createdAt.toISOString() }));
}

/** Disconnect: revoke the Google grant, then delete the token, snapshot and drafts list. */
export async function disconnectGoogleAds(userId: string) {
  try {
    const enc = hasDb ? (await prisma.googleAdsConnection.findUnique({ where: { userId }, select: { tokenEnc: true } }))?.tokenEnc : mem.get(userId)?.tokenEnc;
    if (enc) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(decrypt(enc, loadKey(), aad(userId)))}`, { method: "POST" });
  } catch {
    /* still delete locally */
  }
  if (!hasDb) mem.delete(userId);
  else {
    await prisma.googleAdsSnapshot.deleteMany({ where: { userId } });
    await prisma.googleAdsConnection.deleteMany({ where: { userId } });
  }
  await logAudit(userId, { actor: "user", action: "google.disconnect", target: "google", outcome: "ok" });
}
