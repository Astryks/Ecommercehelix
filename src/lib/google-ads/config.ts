/** Google Ads API settings. REST, version v25 (July 2026). */
export const GOOGLE_ADS_VERSION = process.env.GOOGLE_ADS_API_VERSION || "v25";
export const GOOGLE_ADS_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_VERSION}`;
export const GOOGLE_ADS_SCOPES = ["https://www.googleapis.com/auth/adwords", "openid", "email"];

/** live: client id, secret and developer token are all set. off: the card shows "coming soon". */
export function googleAdsMode(env: Record<string, string | undefined> = process.env): "live" | "off" {
  return env.GOOGLE_ADS_CLIENT_ID && env.GOOGLE_ADS_CLIENT_SECRET && env.GOOGLE_ADS_DEVELOPER_TOKEN ? "live" : "off";
}

export const cleanCustomerId = (s: string) => s.replace(/[^0-9]/g, "");

export type GaRow = { campaign: { id: string; name: string; status: string }; segments: { date: string }; metrics: { costMicros?: string; conversions?: number; conversionsValue?: number; clicks?: string; impressions?: string } };
export type GaCampaign = { id: string; name: string; status: string; spend: number; conversions: number; value: number; clicks: number; impressions: number; roas: number | null };
export type GaSnapshot = { currency: string | null; from: string; to: string; campaigns: GaCampaign[]; daily: { date: string; spend: number; revenue: number }[]; totals: { spend: number; value: number; conversions: number; roas: number | null } };

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Rows from a GAQL campaign-by-day report into campaign totals and daily spend. */
export function summarise(rows: GaRow[], currency: string | null): GaSnapshot {
  const camps = new Map<string, GaCampaign>();
  const days = new Map<string, { date: string; spend: number; revenue: number }>();
  for (const r of rows) {
    const spend = Number(r.metrics.costMicros ?? 0) / 1e6;
    const value = Number(r.metrics.conversionsValue ?? 0);
    const c = camps.get(r.campaign.id) ?? { id: r.campaign.id, name: r.campaign.name, status: r.campaign.status, spend: 0, conversions: 0, value: 0, clicks: 0, impressions: 0, roas: null };
    c.spend += spend;
    c.value += value;
    c.conversions += Number(r.metrics.conversions ?? 0);
    c.clicks += Number(r.metrics.clicks ?? 0);
    c.impressions += Number(r.metrics.impressions ?? 0);
    camps.set(c.id, c);
    const d = days.get(r.segments.date) ?? { date: r.segments.date, spend: 0, revenue: 0 };
    d.spend += spend;
    d.revenue += value;
    days.set(d.date, d);
  }
  const campaigns = [...camps.values()].map((c) => ({ ...c, spend: r2(c.spend), value: r2(c.value), conversions: r2(c.conversions), roas: c.spend > 0 ? r2(c.value / c.spend) : null })).sort((a, b) => b.spend - a.spend);
  const daily = [...days.values()].map((d) => ({ date: d.date, spend: r2(d.spend), revenue: r2(d.revenue) })).sort((a, b) => a.date.localeCompare(b.date));
  const spend = campaigns.reduce((a, c) => a + c.spend, 0), value = campaigns.reduce((a, c) => a + c.value, 0);
  return { currency, from: daily[0]?.date ?? "", to: daily.at(-1)?.date ?? "", campaigns, daily, totals: { spend: r2(spend), value: r2(value), conversions: r2(campaigns.reduce((a, c) => a + c.conversions, 0)), roas: spend > 0 ? r2(value / spend) : null } };
}

/**
 * Mutate operations for a paused Search campaign. Guardrail: every campaign Helix creates is PAUSED,
 * so nothing spends until the owner turns it on in Google Ads.
 */
export function pausedCampaignOps(customerId: string, name: string, dailyBudget: number) {
  const budgetRes = `customers/${customerId}/campaignBudgets/-1`;
  const amountMicros = String(Math.max(1, Math.round(dailyBudget)) * 1_000_000);
  return {
    budget: { operations: [{ create: { resourceName: budgetRes, name: `${name} budget`, amountMicros, deliveryMethod: "STANDARD", explicitlyShared: false } }] },
    campaign: (budgetResourceName: string) => ({
      operations: [{
        create: {
          name,
          status: "PAUSED",
          advertisingChannelType: "SEARCH",
          campaignBudget: budgetResourceName,
          maximizeConversions: {},
          networkSettings: { targetGoogleSearch: true, targetSearchNetwork: false, targetContentNetwork: false, targetPartnerSearchNetwork: false },
          containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        },
      }],
    }),
  };
}

export function assertPaused(body: { operations: { create?: { status?: string } }[] }) {
  for (const op of body.operations) if (op.create && op.create.status !== "PAUSED") throw new Error("Blocked: Helix only creates paused campaigns.");
}
