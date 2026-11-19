/** TikTok Ads (Marketing API v1.3). Off unless TIKTOK_ADS=1 and the app id and secret are set (needs TikTok app approval). */
export const TIKTOK_BASE = "https://business-api.tiktok.com/open_api/v1.3";

export function tiktokMode(env: Record<string, string | undefined> = process.env): "live" | "off" {
  return (env.TIKTOK_ADS === "1" || env.TIKTOK_ADS === "true") && env.TIKTOK_APP_ID && env.TIKTOK_APP_SECRET ? "live" : "off";
}

export function tiktokAuthUrl(appId: string, redirectUri: string, state: string) {
  const u = new URL("https://business-api.tiktok.com/portal/auth");
  u.searchParams.set("app_id", appId);
  u.searchParams.set("state", state);
  u.searchParams.set("redirect_uri", redirectUri);
  return u.toString();
}

export type TtReportRow = { dimensions?: { stat_time_day?: string; campaign_id?: string; campaign_name?: string }; metrics?: { spend?: string; impressions?: string; clicks?: string; conversion?: string } };

export type TtCampaign = { id: string; name: string; spend: number; impressions: number; clicks: number; conversions: number };

/** Rows from an AUCTION_CAMPAIGN report into campaign totals. Pure. */
export function tiktokCampaignRows(rows: TtReportRow[]): TtCampaign[] {
  const m = new Map<string, TtCampaign>();
  for (const r of rows) {
    const id = r.dimensions?.campaign_id ?? "";
    if (!id) continue;
    const c = m.get(id) ?? { id, name: r.dimensions?.campaign_name ?? id, spend: 0, impressions: 0, clicks: 0, conversions: 0 };
    c.spend += Number(r.metrics?.spend ?? 0) || 0;
    c.impressions += Number(r.metrics?.impressions ?? 0) || 0;
    c.clicks += Number(r.metrics?.clicks ?? 0) || 0;
    c.conversions += Number(r.metrics?.conversion ?? 0) || 0;
    m.set(id, c);
  }
  return [...m.values()].map((c) => ({ ...c, spend: Math.round(c.spend * 100) / 100 })).sort((a, b) => b.spend - a.spend);
}

/** Daily spend rows from a report/integrated/get response. */
export function tiktokDailySpend(rows: TtReportRow[]): { date: string; value: number }[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    const date = (r.dimensions?.stat_time_day ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    m.set(date, (m.get(date) ?? 0) + (Number(r.metrics?.spend ?? 0) || 0));
  }
  return [...m].map(([date, v]) => ({ date, value: Math.round(v * 100) / 100 })).sort((a, b) => a.date.localeCompare(b.date));
}

/** TikTok returns HTTP 200 with a non-zero code on errors. */
export function tiktokCheck<T>(j: { code?: number; message?: string; data?: T }): T {
  if (j.code !== 0) throw new Error(`TikTok API error ${j.code ?? "?"}: ${(j.message ?? "").slice(0, 200)}`);
  return j.data as T;
}
