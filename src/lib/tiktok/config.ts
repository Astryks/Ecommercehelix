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

export type TtReportRow = { dimensions?: { stat_time_day?: string }; metrics?: { spend?: string } };

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
