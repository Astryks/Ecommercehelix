/** Step-by-step drawings in public/guides (made by scripts/build_guides.py). */
export type Guide = { file: string; title: string; help?: { label: string; url: string } };

const META_HELP = { label: "Meta: create a campaign", url: "https://www.facebook.com/business/help/1658289035439772" };

export const GUIDES: Record<string, Guide> = {
  "meta-1": { file: "meta-1-create-sales-campaign", title: "Start a Sales campaign", help: META_HELP },
  "meta-2": { file: "meta-2-budget-pixel-audience", title: "Set budget, sales tracking and audience" },
  "meta-3": { file: "meta-3-write-the-ad", title: "Write the ad and add tracking" },
  "meta-4": { file: "meta-4-review-helix-draft", title: "Review a Helix draft and launch it" },
  "google-1": { file: "google-1-performance-max", title: "Start a Performance Max campaign", help: { label: "Google: about Performance Max", url: "https://support.google.com/google-ads/answer/10724817" } },
  "google-2": { file: "google-2-block-wasted-searches", title: "Block searches that waste money", help: { label: "Google: negative keywords", url: "https://support.google.com/google-ads/answer/2453972" } },
  "shopify-1": { file: "shopify-1-yesterdays-numbers", title: "Find yesterday's numbers in Shopify", help: { label: "Shopify: reports and analytics", url: "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports" } },
  "shopify-2": { file: "shopify-2-free-shipping", title: "Set a free shipping amount", help: { label: "Shopify: shipping rates", url: "https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates" } },
  "helix-1": { file: "helix-1-daily-update", title: "Update yesterday in Helix" },
};

/** Which drawings help on which curriculum day. */
const BY_DAY: Record<number, string[]> = {
  2: ["shopify-1", "helix-1"],
  11: ["shopify-2"],
  41: ["meta-1", "meta-2", "meta-3", "meta-4"],
  48: ["google-1"],
  49: ["google-2"],
};

export function guidesForDay(day: number): Guide[] {
  return (BY_DAY[day] ?? []).map((k) => GUIDES[k]);
}
