import "server-only";
import { decrypt, encrypt, loadKey } from "../crypto";
import { hasDb, prisma } from "../db";
import { setChannelDays } from "../repo";
import { logAudit } from "../meta/store";
import { TIKTOK_BASE, tiktokCheck, tiktokDailySpend, tiktokMode, type TtReportRow } from "./config";

type Actor = "user" | "cron";
const aad = (userId: string) => `tiktok:${userId}`;
const NO_DB = "TikTok Ads needs the database (not available in demo mode).";

export async function getTikTok(userId: string) {
  if (!hasDb) return null;
  return prisma.tikTokConnection.findUnique({ where: { userId }, select: { advertiserId: true, advertiserIds: true, status: true, lastSyncAt: true, lastSyncError: true } });
}

/** OAuth callback: auth_code -> long-lived access token, stored encrypted. */
export async function connectTikTok(userId: string, authCode: string) {
  if (tiktokMode() !== "live") throw new Error("TikTok Ads is off. Set TIKTOK_ADS=1, TIKTOK_APP_ID and TIKTOK_APP_SECRET (needs an approved TikTok app).");
  if (!hasDb) throw new Error(NO_DB);
  const res = await fetch(`${TIKTOK_BASE}/oauth2/access_token/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ app_id: process.env.TIKTOK_APP_ID, secret: process.env.TIKTOK_APP_SECRET, auth_code: authCode }),
    cache: "no-store",
  });
  const d = tiktokCheck<{ access_token: string; advertiser_ids?: string[] }>(await res.json().catch(() => ({})));
  const ids = d.advertiser_ids ?? [];
  const row = { tokenEnc: encrypt(d.access_token, loadKey(), aad(userId)), advertiserIds: ids.join(","), advertiserId: ids.length === 1 ? ids[0] : null, status: "active", lastSyncError: null };
  await prisma.tikTokConnection.upsert({ where: { userId }, create: { userId, ...row }, update: row });
  await logAudit(userId, { actor: "user", action: "tiktok.connect", target: "oauth", outcome: "ok", detail: { advertisers: ids.length } });
}

export async function pickTikTokAdvertiser(userId: string, advertiserId: string) {
  const c = await getTikTok(userId);
  if (!c || !c.advertiserIds.split(",").includes(advertiserId)) throw new Error("That advertiser is not on this connection.");
  await prisma.tikTokConnection.update({ where: { userId }, data: { advertiserId } });
}

/** Daily spend for the last `days` days into ScorecardDay.adTiktok. */
export async function syncTikTok(userId: string, actor: Actor = "user", days = 30): Promise<{ ok: boolean; error?: string }> {
  if (tiktokMode() !== "live") return { ok: false, error: "not configured" };
  if (!hasDb) return { ok: false, error: NO_DB };
  const row = await prisma.tikTokConnection.findUnique({ where: { userId } });
  if (!row?.advertiserId) return { ok: false, error: "No TikTok advertiser picked." };
  try {
    const token = decrypt(row.tokenEnc, loadKey(), aad(userId));
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
    const all: TtReportRow[] = [];
    for (let page = 1; page <= 10; page++) {
      const u = new URL(`${TIKTOK_BASE}/report/integrated/get/`);
      const q = { advertiser_id: row.advertiserId, report_type: "BASIC", data_level: "AUCTION_ADVERTISER", dimensions: JSON.stringify(["stat_time_day"]), metrics: JSON.stringify(["spend"]), start_date: start, end_date: end, page: String(page), page_size: "100" };
      for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
      const res = await fetch(u, { headers: { "Access-Token": token }, cache: "no-store" });
      const d = tiktokCheck<{ list: TtReportRow[]; page_info?: { total_page?: number } }>(await res.json().catch(() => ({})));
      all.push(...(d.list ?? []));
      if (!d.page_info?.total_page || page >= d.page_info.total_page) break;
    }
    await setChannelDays(userId, "adTiktok", "tiktok", tiktokDailySpend(all));
    await prisma.tikTokConnection.update({ where: { userId }, data: { lastSyncAt: new Date(), lastSyncError: null, status: "active" } });
    return { ok: true };
  } catch (e) {
    const msg = (e as Error).message.slice(0, 300);
    await prisma.tikTokConnection.update({ where: { userId }, data: { lastSyncError: msg, status: /40105|40001|token/i.test(msg) ? "expired" : "error" } });
    await logAudit(userId, { actor, action: "tiktok.sync", target: row.advertiserId, outcome: "error", detail: { message: msg } });
    return { ok: false, error: msg };
  }
}

export async function syncAllTikTok(deadlineMs = 240_000) {
  if (!hasDb || tiktokMode() !== "live") return [];
  const t0 = Date.now();
  const rows = await prisma.tikTokConnection.findMany({ where: { status: { not: "expired" }, advertiserId: { not: null } }, select: { userId: true } });
  const out: { userId: string; ok: boolean }[] = [];
  for (const r of rows) {
    if (Date.now() - t0 > deadlineMs) break;
    out.push({ userId: r.userId, ...(await syncTikTok(r.userId, "cron")) });
  }
  return out;
}

export async function disconnectTikTok(userId: string) {
  if (hasDb) await prisma.tikTokConnection.deleteMany({ where: { userId } });
}
