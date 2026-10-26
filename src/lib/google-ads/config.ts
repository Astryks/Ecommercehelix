/** Google Ads API settings. REST, version v25 (July 2026). */
export const GOOGLE_ADS_VERSION = process.env.GOOGLE_ADS_API_VERSION || "v25";
export const GOOGLE_ADS_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_VERSION}`;
export const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
/** GA4 sessions sync is off unless GA4_SESSIONS=1. Read-only Analytics is asked for only in the optional "Connect GA4" step, never in the normal Google sign-in. */
export const ga4On = (env: Record<string, string | undefined> = process.env) => env.GA4_SESSIONS === "1" || env.GA4_SESSIONS === "true";
export const GOOGLE_ADS_SCOPES = ["https://www.googleapis.com/auth/adwords", "openid", "email"];
/** Scopes for the Google connect: Ads only, plus read-only Analytics when the user picked "Connect GA4" (and GA4 is on). */
export const googleScopes = (wantGa4: boolean, env: Record<string, string | undefined> = process.env) => [...GOOGLE_ADS_SCOPES, ...(wantGa4 && ga4On(env) ? [GA4_SCOPE] : [])];

type Ga4Report = { rows?: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[] };
/** GA4 runReport (dimension date YYYYMMDD, metric sessions) -> daily rows. */
export function ga4Sessions(r: Ga4Report): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  for (const row of r.rows ?? []) {
    const d = row.dimensionValues?.[0]?.value ?? "";
    if (!/^\d{8}$/.test(d)) continue;
    out.push({ date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, value: Math.max(0, Math.round(Number(row.metricValues?.[0]?.value ?? 0) || 0)) });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
export const cleanPropertyId = (s: string) => s.replace(/^properties\//, "").replace(/[^0-9]/g, "");

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

export type AdDraftInput = { keywords: string[]; headlines: string[]; descriptions: string[]; finalUrl: string | null; cpcBid?: number };

/** Keywords and RSA copy from product names and the store name. Pure, so it can be tested. */
export function draftAdInput(productNames: string[], storeName: string | null, finalUrl: string | null): AdDraftInput {
  const clean = (s: string) => s.replace(/[^\p{L}\p{N} &'-]/gu, " ").replace(/\s+/g, " ").trim();
  const names = [...new Set(productNames.map(clean).filter(Boolean))].slice(0, 5);
  const keywords = [...new Set(names.flatMap((n) => [n.toLowerCase(), `buy ${n.toLowerCase()}`]))].filter((k) => k.length <= 80).slice(0, 10);
  const cut = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, ""));
  const brand = storeName ? clean(storeName) : "";
  const headlines = [...new Set([...names.map((n) => cut(n, 30)), brand && cut(`Shop ${brand}`, 30), "Fast Shipping", "Shop Online Today", "Quality You Can Trust"].filter(Boolean) as string[])].slice(0, 15);
  const descriptions = [cut(`${names[0] ?? "Our range"}${brand ? ` from ${brand}` : ""}. Order online today.`, 90), "Easy returns and friendly support. Shop the range now."];
  const safeUrl = finalUrl && /^https:\/\//.test(finalUrl) ? finalUrl : null;
  return { keywords, headlines, descriptions, finalUrl: safeUrl };
}

/**
 * Ad group, keywords and a responsive search ad, all PAUSED, for a campaign Helix just created.
 * The ad is only built when there is a final URL and at least 3 headlines (Google's minimum).
 */
export function pausedAdGroupOps(customerId: string, campaignResourceName: string, name: string, input: AdDraftInput) {
  const adGroupRes = `customers/${customerId}/adGroups/-2`;
  const ops: { adGroupOperation?: unknown; adGroupCriterionOperation?: unknown; adGroupAdOperation?: unknown }[] = [
    { adGroupOperation: { create: { resourceName: adGroupRes, name: `${name} ad group`, campaign: campaignResourceName, status: "PAUSED", type: "SEARCH_STANDARD", cpcBidMicros: String(Math.round((input.cpcBid ?? 1) * 1_000_000)) } } },
    ...input.keywords.map((text) => ({ adGroupCriterionOperation: { create: { adGroup: adGroupRes, status: "PAUSED", keyword: { text, matchType: "PHRASE" } } } })),
  ];
  if (input.finalUrl && input.headlines.length >= 3 && input.descriptions.length >= 2)
    ops.push({ adGroupAdOperation: { create: { adGroup: adGroupRes, status: "PAUSED", ad: { finalUrls: [input.finalUrl], responsiveSearchAd: { headlines: input.headlines.map((text) => ({ text })), descriptions: input.descriptions.map((text) => ({ text })) } } } } });
  return { mutateOperations: ops };
}

/** Guardrail for googleAds:mutate bodies: every created thing must be PAUSED. */
export function assertAllPaused(body: { mutateOperations: Record<string, unknown>[] }) {
  for (const op of body.mutateOperations)
    for (const v of Object.values(op)) {
      const c = (v as { create?: { status?: string } }).create;
      if (c && c.status !== "PAUSED") throw new Error("Blocked: Helix only creates paused ad groups, keywords and ads.");
    }
}
