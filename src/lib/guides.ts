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
  "shopify-3": { file: "shopify-3-theme-editor", title: "Set up your theme safely", help: { label: "Shopify: themes", url: "https://help.shopify.com/en/manual/online-store/themes" } },
  "shopify-4": { file: "shopify-4-add-product", title: "Add a product the right way", help: { label: "Shopify: adding products", url: "https://help.shopify.com/en/manual/products/add-update-products" } },
  "shopify-5": { file: "shopify-5-menus", title: "Build a short main menu", help: { label: "Shopify: menus and links", url: "https://help.shopify.com/en/manual/online-store/menus-and-links" } },
  "shopify-6": { file: "shopify-6-taxes", title: "Turn on tax settings", help: { label: "Shopify: taxes", url: "https://help.shopify.com/en/manual/taxes" } },
  "shopify-7": { file: "shopify-7-payments", title: "Turn on payments", help: { label: "Shopify Payments", url: "https://help.shopify.com/en/manual/payments/shopify-payments" } },
  "shopify-8": { file: "shopify-8-meta-tracking", title: "Connect Meta tracking from Shopify", help: { label: "Shopify: Facebook and Instagram", url: "https://help.shopify.com/en/manual/online-sales-channels/facebook-instagram-by-meta" } },
  "shopify-9": { file: "shopify-9-test-order", title: "Place a test order", help: { label: "Shopify: test orders", url: "https://help.shopify.com/en/manual/checkout-settings/test-orders" } },
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

/** Same for the Just starting track (its days are numbered separately). */
const START_BY_DAY: Record<number, string[]> = {
  10: ["shopify-3"],
  12: ["shopify-4"],
  14: ["shopify-5"],
  15: ["shopify-2"],
  16: ["shopify-6", "shopify-7"],
  19: ["shopify-8"],
  20: ["shopify-9"],
  21: ["helix-1"],
  25: ["meta-1", "meta-2", "meta-3", "meta-4"],
};

export function guidesForDay(day: number, track: "starting" | "growing" = "growing"): Guide[] {
  return ((track === "starting" ? START_BY_DAY : BY_DAY)[day] ?? []).map((k) => GUIDES[k]);
}
