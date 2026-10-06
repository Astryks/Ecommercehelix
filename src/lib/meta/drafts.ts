import { PAUSED } from "./guardrail";
import { majorToMinor } from "./insights";

/**
 * Builds the Marketing API payloads for a paused cold test campaign.
 * Structure: one OUTCOME_SALES campaign with campaign-level budget (Advantage+ campaign budget),
 * one ad set with Advantage+ audience and automatic placements, and one ad per copy variant.
 * Every delivering object carries status PAUSED; the guardrail rejects anything else.
 */

export type DraftInput = {
  adAccountId: string; // act_123
  pageId: string;
  instagramId?: string | null;
  pixelId: string;
  currency: string;
  country: string; // ISO 3166 alpha-2
  storeUrl: string;
  dailyBudget: number; // in account currency, major units
  dateTag: string; // YYYYMMDD
};

export type DraftCopy = { primary: string; headline: string };

export function brandFrom(url: string) {
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
    return host.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "our store";
  }
}

/** Starter copy. Clearly placeholder: the user edits it in Ads Manager before pressing Launch. */
export function starterCopy(storeUrl: string): DraftCopy[] {
  const b = brandFrom(storeUrl);
  return [
    { primary: `Customers keep coming back to ${b}. See the bestsellers and find your favourite.`, headline: "Shop the bestsellers" },
    { primary: `Real reviews, easy returns and fast delivery. Find out why people choose ${b}.`, headline: "See what customers love" },
    { primary: `Made for everyday use, built to last. Try ${b} today.`, headline: "Find your favourite" },
  ];
}

export const URL_TAGS = "utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}";

export function draftNames(i: DraftInput) {
  const base = `Helix-Cold-Broad-TEST-${i.dateTag}`;
  return { campaign: base, adset: `${base}-AS1-${i.country}-Broad`, ad: (n: number) => `${base}-Ad${n}` };
}

export function campaignParams(i: DraftInput) {
  return {
    name: draftNames(i).campaign,
    objective: "OUTCOME_SALES",
    buying_type: "AUCTION",
    special_ad_categories: [],
    daily_budget: majorToMinor(i.dailyBudget, i.currency),
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: PAUSED,
  };
}

export function adsetParams(i: DraftInput, campaignId: string) {
  return {
    name: draftNames(i).adset,
    campaign_id: campaignId,
    billing_event: "IMPRESSIONS",
    optimization_goal: "OFFSITE_CONVERSIONS",
    promoted_object: { pixel_id: i.pixelId, custom_event_type: "PURCHASE" },
    targeting: { geo_locations: { countries: [i.country] }, age_min: 18, targeting_automation: { advantage_audience: 1 } },
    status: PAUSED,
  };
}

export function creativeParams(i: DraftInput, c: DraftCopy, n: number) {
  return {
    name: `${draftNames(i).ad(n)}-creative`,
    object_story_spec: {
      page_id: i.pageId,
      ...(i.instagramId ? { instagram_user_id: i.instagramId } : {}),
      link_data: { link: i.storeUrl, message: c.primary, name: c.headline, call_to_action: { type: "SHOP_NOW", value: { link: i.storeUrl } } },
    },
    url_tags: URL_TAGS,
  };
}

export function adParams(i: DraftInput, adsetId: string, creativeId: string, n: number) {
  return { name: draftNames(i).ad(n), adset_id: adsetId, creative: { creative_id: creativeId }, status: PAUSED };
}
