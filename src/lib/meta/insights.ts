import type { Campaign, Layer } from "../campaigns";

/** Pure mapping from Marketing API insights to Helix's tracker and audit shapes. */

export type ActionStat = { action_type: string; value: string };
export type InsightRow = {
  campaign_id?: string;
  campaign_name?: string;
  date_start?: string;
  date_stop?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  cpm?: string;
  inline_link_clicks?: string;
  outbound_clicks?: ActionStat[];
  actions?: ActionStat[];
  action_values?: ActionStat[];
  video_thruplay_watched_actions?: ActionStat[];
};
export type MetaCampaign = { id: string; name: string; objective?: string; status?: string; effective_status?: string; daily_budget?: string; lifetime_budget?: string; updated_time?: string };
export type MetaAdSet = { id: string; campaign_id: string; daily_budget?: string; effective_status?: string; learning_stage_info?: { status?: string } };

export const INSIGHT_FIELDS = [
  "campaign_id", "campaign_name", "spend", "impressions", "reach", "frequency", "cpm", "inline_link_clicks",
  "outbound_clicks", "actions", "action_values", "video_thruplay_watched_actions",
].join(",");

/** Purchase action types in priority order. Only the first one present is used, so nothing is double counted. */
export const PURCHASE_TYPES = ["omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase"];

export function pick(list: ActionStat[] | undefined, types: string[]): number {
  if (!list) return 0;
  for (const t of types) {
    const hit = list.find((a) => a.action_type === t);
    if (hit) return Number(hit.value) || 0;
  }
  return 0;
}

export type Norm = {
  spend: number; impressions: number; reach: number; frequency: number; cpm: number; ctr: number;
  outboundClicks: number; purchases: number; purchaseValue: number; cpa: number | null; roas: number;
  threeSec: number; hookRate: number | null; thruplays: number; lpViews: number;
};

export function normalise(r: InsightRow | undefined): Norm {
  const n = (v?: string) => Number(v) || 0;
  const spend = n(r?.spend);
  const impressions = n(r?.impressions);
  const outboundClicks = pick(r?.outbound_clicks, ["outbound_click"]) || n(r?.inline_link_clicks);
  const purchases = pick(r?.actions, PURCHASE_TYPES);
  const purchaseValue = pick(r?.action_values, PURCHASE_TYPES);
  // "video_view" in actions is Meta's 3-second video view. Hook rate = 3-second views / impressions.
  const threeSec = pick(r?.actions, ["video_view"]);
  return {
    spend, impressions, reach: n(r?.reach), frequency: n(r?.frequency),
    cpm: n(r?.cpm) || (impressions ? (spend / impressions) * 1000 : 0),
    ctr: impressions ? (outboundClicks / impressions) * 100 : 0,
    outboundClicks, purchases, purchaseValue,
    cpa: purchases ? spend / purchases : null,
    roas: spend ? purchaseValue / spend : 0,
    threeSec, hookRate: impressions && threeSec ? (threeSec / impressions) * 100 : null,
    thruplays: pick(r?.video_thruplay_watched_actions, ["video_view"]),
    lpViews: pick(r?.actions, ["landing_page_view", "omni_landing_page_view"]),
  };
}

/** Currencies with no minor unit: Meta budgets are in the smallest unit of the account currency. */
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP", "ISK", "PYG", "TWD", "HUF", "IDR", "COP", "CRC"]);
export const minorToMajor = (v: string | number | undefined, currency: string) => (Number(v) || 0) / (ZERO_DECIMAL.has(currency.toUpperCase()) ? 1 : 100);
export const majorToMinor = (v: number, currency: string) => Math.round(v * (ZERO_DECIMAL.has(currency.toUpperCase()) ? 1 : 100));

export function inferLayer(name: string): Layer {
  const n = name.toLowerCase();
  if (/(hot|cart|checkout|atc|retarget)/.test(n)) return "Hot";
  if (/(warm|visitor|engag|viewers|follower)/.test(n)) return "Warm";
  if (/mixed/.test(n)) return "Mixed";
  return "Cold";
}

export function inferStage(name: string): Campaign["testStage"] {
  const n = name.toLowerCase();
  if (/test/.test(n)) return "Testing";
  if (/(sale|bfcm|black friday|promo|eofy)/.test(n)) return "Sale";
  if (/scal/.test(n)) return "Scaling";
  return "Evergreen";
}

const OBJECTIVE: Record<string, string> = {
  OUTCOME_SALES: "Sales · Purchase", OUTCOME_TRAFFIC: "Traffic", OUTCOME_ENGAGEMENT: "Engagement",
  OUTCOME_LEADS: "Leads", OUTCOME_AWARENESS: "Awareness", OUTCOME_APP_PROMOTION: "App promotion",
};

export function toTrackerCampaign(c: MetaCampaign, adsets: MetaAdSet[], insight: InsightRow | undefined, currency: string, now = new Date()): Campaign {
  const m = normalise(insight);
  const mine = adsets.filter((a) => a.campaign_id === c.id);
  const budget = c.daily_budget ? minorToMajor(c.daily_budget, currency) : mine.reduce((s, a) => s + minorToMajor(a.daily_budget, currency), 0);
  const learning = mine.some((a) => a.learning_stage_info?.status === "LEARNING");
  const eff = c.effective_status ?? c.status ?? "PAUSED";
  const days = c.updated_time ? Math.max(0, Math.floor((now.getTime() - new Date(c.updated_time).getTime()) / 86_400_000)) : 30;
  return {
    id: `meta-${c.id}`, externalId: c.id, source: "live", channel: "Meta", name: c.name,
    objective: OBJECTIVE[c.objective ?? ""] ?? c.objective ?? "Unknown", layer: inferLayer(c.name),
    budget, spend: m.spend, purchases: m.purchases, revenue: m.purchaseValue, impressions: m.impressions,
    clicks: m.outboundClicks, threeSecViews: m.threeSec, frequency: m.frequency, daysSinceEdit: days,
    status: eff === "ACTIVE" ? (learning ? "Learning" : "Active") : "Paused",
    testStage: inferStage(c.name),
  };
}

export type DailySpend = { date: string; spend: number; revenue: number };
export function dailySpend(rows: InsightRow[]): DailySpend[] {
  return rows
    .filter((r) => r.date_start)
    .map((r) => {
      const m = normalise(r);
      return { date: r.date_start!, spend: Math.round(m.spend * 100) / 100, revenue: Math.round(m.purchaseValue * 100) / 100 };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export type MetaSnapshot = {
  syncedAt: string;
  currency: string;
  window: { since: string; until: string };
  campaigns: Campaign[];
  now: Norm;
  prev: Norm;
  daily: DailySpend[];
};
