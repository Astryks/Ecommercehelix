import "server-only";
import { decrypt, encrypt, loadKey } from "../crypto";
import { hasDb, prisma } from "../db";
import { logAudit } from "../meta/store";
import { addDays, isoDay } from "../dates";
import { checkKeyShape, flowStatus, FLOW_KINDS, KLAVIYO_BASE, KLAVIYO_REVISION, klaviyoOn, sumReport, type KlaviyoFlow, type KlaviyoSummary, type ReportRow } from "./config";

const aad = (userId: string) => `klaviyo:${userId}`;

async function kv<T>(key: string, path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${KLAVIYO_BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: { Authorization: `Klaviyo-API-Key ${key}`, revision: KLAVIYO_REVISION, accept: "application/vnd.api+json", ...(init?.body ? { "content-type": "application/vnd.api+json" } : {}) },
    body: init?.body ? JSON.stringify(init.body) : undefined, cache: "no-store", signal: AbortSignal.timeout(20_000),
  });
  const j = (await res.json().catch(() => ({}))) as { errors?: { detail?: string; code?: string }[] } & T;
  if (!res.ok) {
    const d = j.errors?.[0];
    if (res.status === 401) throw new Error("Klaviyo did not accept this key. Check you copied the whole private key.");
    if (res.status === 403) throw new Error(`This key is missing a read permission (${(d?.detail ?? "").slice(0, 120)}). Create a key with the read scopes listed below.`);
    throw new Error(`Klaviyo error ${res.status}: ${(d?.detail ?? "").slice(0, 160)}`);
  }
  return j;
}

export async function getKlaviyo(userId: string) {
  if (!hasDb) return null;
  return prisma.klaviyoConnection.findUnique({ where: { userId }, select: { keyHint: true, accountName: true, status: true, lastSyncAt: true, lastSyncError: true, summary: true } });
}

/** Check the key, store it encrypted, then pull the first totals. */
export async function connectKlaviyo(userId: string, rawKey: string) {
  if (!klaviyoOn()) throw new Error("Klaviyo is coming soon.");
  if (!hasDb) throw new Error("Klaviyo needs the database (not available in demo mode).");
  const bad = checkKeyShape(rawKey);
  if (bad) throw new Error(bad);
  const key = rawKey.trim();
  const acct = await kv<{ data?: { attributes?: { contact_information?: { organization_name?: string } } }[] }>(key, "/accounts/");
  const accountName = acct.data?.[0]?.attributes?.contact_information?.organization_name ?? "";
  const row = { keyEnc: encrypt(key, loadKey(), aad(userId)), keyHint: key.slice(-4), accountName, status: "active", lastSyncError: null, orderMetricId: null };
  await prisma.klaviyoConnection.upsert({ where: { userId }, create: { userId, ...row }, update: row });
  await logAudit(userId, { actor: "user", action: "klaviyo.connect", target: "api-key", outcome: "ok", detail: {} });
  return syncKlaviyo(userId, "user");
}

/** Revoke: delete the stored key and every Klaviyo total. */
export async function disconnectKlaviyo(userId: string) {
  if (!hasDb) return;
  await prisma.klaviyoDay.deleteMany({ where: { userId } });
  await prisma.klaviyoConnection.deleteMany({ where: { userId } });
  await logAudit(userId, { actor: "user", action: "klaviyo.disconnect", target: "api-key", outcome: "ok", detail: {} });
}

async function orderMetric(key: string): Promise<string | null> {
  const r = await kv<{ data?: { id: string; attributes?: { name?: string } }[] }>(key, "/metrics/?fields[metric]=name");
  return r.data?.find((m) => m.attributes?.name === "Placed Order")?.id ?? r.data?.find((m) => /placed order|order placed/i.test(m.attributes?.name ?? ""))?.id ?? null;
}

async function report(key: string, type: "flow" | "campaign", timeframe: string, metricId: string) {
  const r = await kv<{ data?: { attributes?: { results?: ReportRow[] } } }>(key, `/${type}-values-reports/`, {
    method: "POST",
    body: { data: { type: `${type}-values-report`, attributes: { statistics: ["recipients", "opens_unique", "clicks_unique", "conversions", "conversion_value"], timeframe: { key: timeframe }, conversion_metric_id: metricId } } },
  });
  return sumReport(r.data?.attributes?.results ?? []);
}

async function listSize(key: string): Promise<number> {
  const r = await kv<{ data?: { id: string }[] }>(key, "/lists/?fields[list]=name");
  let n = 0;
  for (const l of (r.data ?? []).slice(0, 10)) {
    const one = await kv<{ data?: { attributes?: { profile_count?: number } } }>(key, `/lists/${l.id}/?additional-fields[list]=profile_count&fields[list]=name,profile_count`).catch(() => null);
    n = Math.max(n, one?.data?.attributes?.profile_count ?? 0); // biggest list = main list (lists overlap, so not summed)
  }
  return n;
}

async function flows(key: string): Promise<KlaviyoFlow[]> {
  const r = await kv<{ data?: { id: string; attributes?: { name?: string; status?: string; trigger_type?: string } }[] }>(key, "/flows/?fields[flow]=name,status,trigger_type");
  return (r.data ?? []).map((f) => ({ id: f.id, name: f.attributes?.name ?? "", status: f.attributes?.status ?? "", trigger: f.attributes?.trigger_type ?? null }));
}

/** Daily totals for yesterday into KlaviyoDay, and the 30-day summary (totals only). */
export async function syncKlaviyo(userId: string, actor: "user" | "cron" = "cron"): Promise<{ ok: boolean; error?: string }> {
  if (!klaviyoOn()) return { ok: false, error: "coming soon" };
  if (!hasDb) return { ok: false, error: "no database" };
  const row = await prisma.klaviyoConnection.findUnique({ where: { userId } });
  if (!row) return { ok: false, error: "not connected" };
  try {
    const key = decrypt(row.keyEnc, loadKey(), aad(userId));
    const metricId = row.orderMetricId ?? (await orderMetric(key));
    const fl = await flows(key);
    const size = await listSize(key);
    const date = addDays(isoDay(), -1);
    const first = !row.lastSyncAt;
    let f30 = { revenue: 0, sends: 0, opens: 0, clicks: 0, conversions: 0 }, c30 = { ...f30 };
    let fy = { ...f30 }, cy = { ...f30 };
    if (metricId) {
      fy = await report(key, "flow", "yesterday", metricId);
      cy = await report(key, "campaign", "yesterday", metricId);
      if (first) { f30 = await report(key, "flow", "last_30_days", metricId); c30 = await report(key, "campaign", "last_30_days", metricId); }
    }
    const day = { emailRevenue: fy.revenue + cy.revenue, flowRevenue: fy.revenue, campaignRevenue: cy.revenue, flowSends: fy.sends, campaignSends: cy.sends, opens: fy.opens + cy.opens, clicks: fy.clicks + cy.clicks, conversions: fy.conversions + cy.conversions, listSize: size };
    await prisma.klaviyoDay.upsert({ where: { userId_date: { userId, date } }, create: { userId, date, ...day }, update: day });
    const days = await prisma.klaviyoDay.findMany({ where: { userId, date: { gte: addDays(isoDay(), -30) } }, orderBy: { date: "asc" } });
    const sum = (f: (d: (typeof days)[number]) => number) => days.reduce((a, d) => a + f(d), 0);
    const prev = (row.summary ?? null) as KlaviyoSummary | null;
    const useSeed = days.length < 7 && (first || prev);
    const fr = useSeed ? (first ? f30.revenue : prev!.flowRevenue30) : sum((d) => d.flowRevenue);
    const cr = useSeed ? (first ? c30.revenue : prev!.campaignRevenue30) : sum((d) => d.campaignRevenue);
    const sends = useSeed ? (first ? f30.sends + c30.sends : prev!.sends30) : sum((d) => d.flowSends + d.campaignSends);
    const opens = useSeed && first ? f30.opens + c30.opens : sum((d) => d.opens), clicks = useSeed && first ? f30.clicks + c30.clicks : sum((d) => d.clicks);
    const fs = flowStatus(fl);
    const oldest = days.find((d) => d.listSize > 0)?.listSize ?? size;
    const summary: KlaviyoSummary = {
      revenue30: Math.round((fr + cr) * 100) / 100, flowRevenue30: Math.round(fr * 100) / 100, campaignRevenue30: Math.round(cr * 100) / 100, sends30: sends,
      openRate: sends ? Math.round((opens / sends) * 1000) / 1000 : 0, clickRate: sends ? Math.round((clicks / sends) * 1000) / 1000 : 0,
      conversions30: useSeed && first ? f30.conversions + c30.conversions : sum((d) => d.conversions), listSize: size, listGrowth30: size - oldest,
      flows: fs, flowsOff: FLOW_KINDS.filter((k) => fs[k.kind] !== "live").map((k) => k.label),
    };
    await prisma.klaviyoConnection.update({ where: { userId }, data: { orderMetricId: metricId, summary, lastSyncAt: new Date(), lastSyncError: metricId ? null : "No Placed Order metric yet, so email revenue shows as 0.", status: "active" } });
    return { ok: true };
  } catch (e) {
    const msg = (e as Error).message.slice(0, 300);
    await prisma.klaviyoConnection.update({ where: { userId }, data: { lastSyncError: msg, status: /did not accept/i.test(msg) ? "revoked" : "error" } });
    await logAudit(userId, { actor, action: "klaviyo.sync", target: "api-key", outcome: "error", detail: { message: msg } });
    return { ok: false, error: msg };
  }
}

export async function syncAllKlaviyo(deadlineMs = 240_000) {
  if (!hasDb || !klaviyoOn()) return [];
  const t0 = Date.now();
  const rows = await prisma.klaviyoConnection.findMany({ where: { status: { not: "revoked" } }, select: { userId: true } });
  const out: { userId: string; ok: boolean }[] = [];
  for (const r of rows) {
    if (Date.now() - t0 > deadlineMs) break;
    out.push({ userId: r.userId, ...(await syncKlaviyo(r.userId, "cron")) });
  }
  return out;
}

/** Totals for the coach, memory and What to fix. Null when not connected. */
export async function klaviyoSummary(userId: string): Promise<KlaviyoSummary | null> {
  if (!hasDb || !klaviyoOn()) return null;
  const r = await prisma.klaviyoConnection.findUnique({ where: { userId }, select: { summary: true, status: true } });
  return r?.summary ? (r.summary as unknown as KlaviyoSummary) : null;
}
