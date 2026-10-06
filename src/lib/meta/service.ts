import "server-only";
import { decrypt, encrypt, loadKey } from "../crypto";
import { getAccount, getDays, getSettings, setMetaSpend } from "../repo";
import { addDays, isoDay } from "../dates";
import { suggestedTestBudget, targetsFrom } from "../targets";
import { metaMode, redirectUri, type MetaMode } from "./config";
import { createGraph, fetchTransport, GraphError, type CallLog } from "./graph";
import { mockTransport } from "./mock";
import { adParams, adsetParams, campaignParams, creativeParams, starterCopy, type DraftInput } from "./drafts";
import { dailySpend, INSIGHT_FIELDS, normalise, toTrackerCampaign, type InsightRow, type MetaAdSet, type MetaCampaign, type MetaSnapshot } from "./insights";
import { deleteMetaData, getConnection, listConnections, logAudit, saveConnection, saveDraft, saveSnapshot, updateConnection, type MetaConnectionRow } from "./store";

type Actor = "user" | "helix" | "cron";
const aad = (userId: string) => `meta:${userId}`;
const keyFor = (mode: MetaMode) => loadKey(process.env.TOKEN_ENCRYPTION_KEY, mode === "mock");

function graphFor(userId: string, mode: MetaMode, actor: Actor, token?: string) {
  return createGraph({
    token,
    appSecret: mode === "live" ? process.env.META_APP_SECRET : undefined,
    transport: mode === "mock" ? mockTransport : fetchTransport,
    log: (l: CallLog) =>
      logAudit(userId, {
        actor, action: "meta.api", target: `${l.method} ${l.path}`, outcome: l.outcome, httpStatus: l.httpStatus,
        detail: { attempt: l.attempt, ms: l.durationMs, code: l.errorCode, message: l.message, params: l.paramKeys, mode },
      }),
  });
}

async function graphForUser(userId: string, actor: Actor) {
  const conn = await getConnection(userId);
  if (!conn) throw new Error("Meta is not connected.");
  const token = decrypt(conn.tokenEnc, keyFor(conn.mode), aad(userId));
  return { conn, g: graphFor(userId, conn.mode, actor, token) };
}

/** OAuth callback: code -> short-lived token -> long-lived token (about 60 days), stored encrypted. */
export async function connectFromCode(userId: string, code: string, origin?: string) {
  const mode = metaMode();
  if (mode === "off") throw new Error("Meta app is not configured.");
  const g = graphFor(userId, mode, "user");
  const app = { client_id: process.env.META_APP_ID ?? "mock", client_secret: process.env.META_APP_SECRET ?? "mock" };
  const short = await g.get<{ access_token: string }>("oauth/access_token", { ...app, redirect_uri: redirectUri(origin), code });
  const long = await g.get<{ access_token: string; expires_in?: number }>("oauth/access_token", { ...app, grant_type: "fb_exchange_token", fb_exchange_token: short.access_token });
  const token = long.access_token || short.access_token;
  const gt = graphFor(userId, mode, "user", token);
  const me = await gt.get<{ id: string; name?: string }>("me", { fields: "id,name" });
  const perms = await gt.get<{ data: { permission: string; status: string }[] }>("me/permissions");
  const prev = await getConnection(userId);
  await saveConnection({
    userId, mode: mode === "mock" ? "mock" : "live", fbUserId: me.id, fbUserName: me.name ?? "",
    tokenEnc: encrypt(token, keyFor(mode), aad(userId)),
    tokenExpiresAt: long.expires_in ? new Date(Date.now() + long.expires_in * 1000).toISOString() : null,
    scopes: perms.data.filter((p) => p.status === "granted").map((p) => p.permission),
    adAccountId: prev?.adAccountId ?? null, adAccountName: prev?.adAccountName ?? null, currency: prev?.currency ?? null, timezone: prev?.timezone ?? null,
    pageId: prev?.pageId ?? null, pageName: prev?.pageName ?? null, instagramId: prev?.instagramId ?? null, instagramUsername: prev?.instagramUsername ?? null,
    pixelId: prev?.pixelId ?? null, pixelName: prev?.pixelName ?? null,
    status: "active", lastSyncAt: prev?.lastSyncAt ?? null, lastSyncError: null,
  });
  await logAudit(userId, { actor: "user", action: "meta.connect", target: `facebook user ${me.id}`, outcome: "ok", detail: { mode } });
}

export type AdAccount = { id: string; name: string; currency: string; timezone_name: string; account_status: number };
export type Page = { id: string; name: string; instagram_business_account?: { id: string; username?: string } };
export type Pixel = { id: string; name: string; last_fired_time?: string };

export async function listAssets(userId: string, adAccountId?: string | null) {
  const { g } = await graphForUser(userId, "user");
  const [accounts, pages] = await Promise.all([
    g.getAll<AdAccount>("me/adaccounts", { fields: "id,account_id,name,currency,timezone_name,account_status" }, 3),
    g.getAll<Page>("me/accounts", { fields: "id,name,instagram_business_account{id,username}" }, 3),
  ]);
  const act = adAccountId && accounts.some((a) => a.id === adAccountId) ? adAccountId : null;
  const pixels = act ? await g.getAll<Pixel>(`${act}/adspixels`, { fields: "id,name,last_fired_time" }, 2) : [];
  return { accounts, pages, pixels };
}

/** Save the picked ad account, page and pixel. IDs are checked against what the token can actually see. */
export async function selectAssets(userId: string, pick: { adAccountId: string; pageId: string; pixelId: string }) {
  const { accounts, pages, pixels } = await listAssets(userId, pick.adAccountId);
  const acct = accounts.find((a) => a.id === pick.adAccountId);
  const page = pages.find((p) => p.id === pick.pageId) ?? null;
  const pixel = pixels.find((p) => p.id === pick.pixelId) ?? null;
  if (!acct) throw new Error("That ad account is not available to this login.");
  await updateConnection(userId, {
    adAccountId: acct.id, adAccountName: acct.name, currency: acct.currency, timezone: acct.timezone_name,
    pageId: page?.id ?? null, pageName: page?.name ?? null,
    instagramId: page?.instagram_business_account?.id ?? null, instagramUsername: page?.instagram_business_account?.username ?? null,
    pixelId: pixel?.id ?? null, pixelName: pixel?.name ?? null,
  });
  await logAudit(userId, { actor: "user", action: "meta.select_assets", target: acct.id, outcome: "ok", detail: { page: page?.id, pixel: pixel?.id } });
}

/** Pull last-7-day campaign insights, account trends and 14 days of daily spend. Read only. */
export async function syncUser(userId: string, actor: Actor = "user"): Promise<{ ok: boolean; error?: string; campaigns?: number }> {
  let conn: MetaConnectionRow | null = null;
  try {
    const r = await graphForUser(userId, actor);
    conn = r.conn;
    const g = r.g;
    if (!conn.adAccountId) return { ok: false, error: "Pick an ad account first." };
    const act = conn.adAccountId;
    const currency = conn.currency ?? "AUD";
    const today = isoDay();
    const [campaigns, adsets, rows, nowRows, prevRows, dailyRows] = await Promise.all([
      g.getAll<MetaCampaign>(`${act}/campaigns`, { fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,updated_time" }, 5),
      g.getAll<MetaAdSet>(`${act}/adsets`, { fields: "id,campaign_id,daily_budget,effective_status,learning_stage_info" }, 5),
      g.getAll<InsightRow>(`${act}/insights`, { level: "campaign", date_preset: "last_7d", fields: INSIGHT_FIELDS }, 5),
      g.get<{ data: InsightRow[] }>(`${act}/insights`, { level: "account", date_preset: "last_7d", fields: INSIGHT_FIELDS }),
      g.get<{ data: InsightRow[] }>(`${act}/insights`, { level: "account", time_range: { since: addDays(today, -14), until: addDays(today, -8) }, fields: INSIGHT_FIELDS }),
      g.getAll<InsightRow>(`${act}/insights`, { level: "account", date_preset: "last_14d", time_increment: 1, fields: "spend,actions,action_values" }, 2),
    ]);
    const byId = new Map(rows.map((x) => [x.campaign_id, x]));
    const tracker = campaigns
      .filter((c) => byId.has(c.id) || c.effective_status === "ACTIVE")
      .map((c) => toTrackerCampaign(c, adsets, byId.get(c.id), currency));
    const daily = dailySpend(dailyRows);
    const snap: MetaSnapshot = {
      syncedAt: new Date().toISOString(), currency, window: { since: addDays(today, -7), until: addDays(today, -1) },
      campaigns: tracker, now: normalise(nowRows.data?.[0]), prev: normalise(prevRows.data?.[0]), daily,
    };
    await saveSnapshot(userId, snap);
    await setMetaSpend(userId, daily);
    await updateConnection(userId, { lastSyncAt: snap.syncedAt, lastSyncError: null, status: "active" });
    await logAudit(userId, { actor, action: "meta.sync", target: act, outcome: "ok", detail: { campaigns: tracker.length, days: daily.length } });
    return { ok: true, campaigns: tracker.length };
  } catch (e) {
    const msg = (e as Error).message;
    const expired = e instanceof GraphError && e.code === 190;
    if (conn) await updateConnection(userId, { lastSyncError: msg, status: expired ? "expired" : "error" });
    await logAudit(userId, { actor, action: "meta.sync", target: conn?.adAccountId ?? "meta", outcome: "error", detail: { message: msg } });
    return { ok: false, error: expired ? "Your Meta login has expired. Please reconnect." : msg };
  }
}

/** Daily cron: sync every connected account, one at a time, isolating failures. */
export async function syncAll(deadlineMs = 240_000) {
  const start = Date.now();
  const results: { userId: string; ok: boolean; error?: string }[] = [];
  for (const c of await listConnections()) {
    if (Date.now() - start > deadlineMs) break; // the rest catch up on the next run
    if (!c.adAccountId) continue;
    results.push({ userId: c.userId, ...(await syncUser(c.userId, "cron")) });
  }
  return results;
}

export async function draftInputFor(userId: string): Promise<{ input: DraftInput | null; missing: string[] }> {
  const conn = await getConnection(userId);
  const missing: string[] = [];
  if (!conn) return { input: null, missing: ["Connect Meta"] };
  if (!conn.adAccountId) missing.push("ad account");
  if (!conn.pageId) missing.push("Facebook Page");
  if (!conn.pixelId) missing.push("pixel");
  const acct = await getAccount(userId);
  const storeUrl = acct.storeUrl ? (acct.storeUrl.startsWith("http") ? acct.storeUrl : `https://${acct.storeUrl}`) : "https://example.com";
  const [days, settings] = await Promise.all([getDays(userId), getSettings(userId)]);
  const country = conn.timezone?.startsWith("Australia") ? "AU" : conn.timezone?.startsWith("Pacific/Auckland") ? "NZ" : conn.timezone?.startsWith("Europe/London") ? "GB" : conn.timezone?.startsWith("America") ? "US" : "AU";
  if (missing.length) return { input: null, missing };
  return {
    missing,
    input: {
      adAccountId: conn.adAccountId!, pageId: conn.pageId!, instagramId: conn.instagramId, pixelId: conn.pixelId!,
      currency: conn.currency ?? "AUD", country, storeUrl, dailyBudget: suggestedTestBudget(targetsFrom(days, settings)),
      dateTag: isoDay().replace(/-/g, ""),
    },
  };
}

/** After approval: create the campaign, ad set, creatives and ads, all PAUSED. Never launches. */
export async function createPausedDraft(userId: string, approvalId: string) {
  const { input, missing } = await draftInputFor(userId);
  if (!input) {
    await logAudit(userId, { actor: "helix", action: "meta.draft", target: "meta", outcome: "blocked", detail: { missing } });
    return { ok: false, error: `Missing: ${missing.join(", ")}` };
  }
  const { g } = await graphForUser(userId, "helix");
  const ctx = { approved: true, purpose: "draft" as const };
  const ids = { campaignId: null as string | null, adsetId: null as string | null, creativeIds: [] as string[], adIds: [] as string[] };
  try {
    ids.campaignId = (await g.post(`${input.adAccountId}/campaigns`, campaignParams(input), ctx)).id ?? null;
    ids.adsetId = (await g.post(`${input.adAccountId}/adsets`, adsetParams(input, ids.campaignId!), ctx)).id ?? null;
    const copy = starterCopy(input.storeUrl);
    for (let i = 0; i < copy.length; i++) {
      const cr = (await g.post(`${input.adAccountId}/adcreatives`, creativeParams(input, copy[i], i + 1), ctx)).id!;
      ids.creativeIds.push(cr);
      ids.adIds.push((await g.post(`${input.adAccountId}/ads`, adParams(input, ids.adsetId!, cr, i + 1), ctx)).id!);
    }
    await saveDraft(userId, { approvalId, status: "created", ...ids, error: null });
    await logAudit(userId, { actor: "helix", action: "meta.draft", target: input.adAccountId, outcome: "ok", detail: { ...ids, status: "PAUSED" } });
    return { ok: true, ...ids };
  } catch (e) {
    const msg = (e as Error).message;
    await saveDraft(userId, { approvalId, status: ids.campaignId ? "partial" : "failed", ...ids, error: msg });
    await logAudit(userId, { actor: "helix", action: "meta.draft", target: input.adAccountId, outcome: "error", detail: { ...ids, message: msg } });
    return { ok: false, error: msg };
  }
}

/** Revoke our permissions at Meta (best effort) and delete the token and synced data. */
export async function disconnectMeta(userId: string) {
  try {
    const { g } = await graphForUser(userId, "user");
    await g.del("me/permissions", { approved: true, purpose: "disconnect" });
  } catch {
    /* token may already be invalid; local data is removed regardless */
  }
  await deleteMetaData(userId);
  await logAudit(userId, { actor: "user", action: "meta.disconnect", target: "meta", outcome: "ok" });
}
