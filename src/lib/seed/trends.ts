export type Trend = {
  id: string;
  channel: "Meta" | "TikTok" | "Google" | "AI search";
  title: string;
  summary: string;
  tryIt: string;
  suits: string;
  sourceLabel: string;
  sourceUrl: string;
  week: string;
};

/** Seeded trend cards (week of 5 Oct 2026). Figures are the sources' own claims. */
export const TRENDS: Trend[] = [
  {
    id: "partnership-ads",
    channel: "Meta",
    title: "Creator posts as ads (partnership ads) inside normal campaigns",
    summary: "Partnership ads run a creator's post as an ad from their own handle. Run them next to your regular ads, not in a separate test.",
    tryIt: "Ask your 3 best creators for ad permission and add their posts to your cold campaign as a batch.",
    suits: "Apparel, beauty, home · Growing stores and up",
    sourceLabel: "Meta for Developers: partnership ads",
    sourceUrl: "https://developers.facebook.com/docs/marketing-api/ad-creative/partnership-ads",
    week: "2026-10-05",
  },
  {
    id: "catalog-video",
    channel: "Meta",
    title: "Catalog product video on Reels",
    summary: "Catalog ads can show a video for each product instead of a still photo. You add the videos to products in your catalog.",
    tryIt: "Add a short product video to your top 20 products in Commerce Manager, then check your catalog ads use them.",
    suits: "Stores with 20+ products",
    sourceLabel: "Meta for Developers: product videos in catalog ads",
    sourceUrl: "https://developers.facebook.com/documentation/ads-commerce/marketing-api/advantage-catalog-ads/allow-product-video",
    week: "2026-10-05",
  },
  {
    id: "advantage-enhancements",
    channel: "Meta",
    title: "Check the AI enhancements switched on by default",
    summary: "Some creative enhancements, like music, image filters and templates, are on by default. They may be changing your ads. Review them per ad.",
    tryIt: "Open one live ad, review creative enhancements, and turn off any that hurt your brand.",
    suits: "Everyone on Meta",
    sourceLabel: "Meta Business Help Centre",
    sourceUrl: "https://www.facebook.com/business/help/297506218282224",
    week: "2026-10-05",
  },
  {
    id: "gmv-max",
    channel: "TikTok",
    title: "TikTok Shop ads run on automated GMV Max campaigns",
    summary: "GMV Max optimises for your whole TikTok Shop return and counts organic and affiliate orders too. Do not compare it directly with Meta ROAS.",
    tryIt: "If you sell on TikTok Shop, recruit 10 affiliates and let their videos feed the campaign.",
    suits: "Impulse-friendly products under $60",
    sourceLabel: "TikTok Ads help centre",
    sourceUrl: "https://ads.tiktok.com/resources/help/article/about-product-gmv-max",
    week: "2026-10-05",
  },
  {
    id: "tiktok-search",
    channel: "TikTok",
    title: "Automated keywords in TikTok search ads",
    summary: "Search ads can add keywords for you, based on your videos and the keywords you chose. TikTok does not tell you when it adds one.",
    tryIt: "Put your top 5 search phrases in captions and on-screen text before testing search ads.",
    suits: "Brands already active on TikTok",
    sourceLabel: "TikTok Ads help centre",
    sourceUrl: "https://ads.tiktok.com/help/article/about-automated-keywords-for-search-ads-campaigns",
    week: "2026-10-05",
  },
  {
    id: "ai-max-shopping",
    channel: "Google",
    title: "AI Max for Shopping and Search",
    summary: "Google writes query-matched Shopping text and can send shoppers to other pages on your site. Some broad match Search campaigns also moved to AI Max in September.",
    tryIt: "Open your search terms report and the AI-written assets. Add negatives and pause off-brand copy.",
    suits: "Anyone on Google Ads",
    sourceLabel: "Google Ads blog",
    sourceUrl: "https://blog.google/products/ads-commerce/ai-max-for-shopping/",
    week: "2026-10-05",
  },
  {
    id: "pmax-vs-aimax",
    channel: "Google",
    title: "Keep brand exclusions on PMax",
    summary: "Brand exclusions keep branded demand in your cheap brand search campaign while PMax prospects.",
    tryIt: "Check your PMax campaign has your brand excluded.",
    suits: "Stores spending $50+/day on Google",
    sourceLabel: "Google Ads Help",
    sourceUrl: "https://support.google.com/google-ads/answer/14505308",
    week: "2026-10-05",
  },
  {
    id: "agentic-storefront",
    channel: "AI search",
    title: "Your products may already appear in AI shopping assistants",
    summary: "Shopify's agentic storefronts can show eligible products in AI chat apps and AI search. Eligibility rules apply.",
    tryIt: "Check eligibility in your Shopify admin and fill missing product attributes.",
    suits: "Shopify stores",
    sourceLabel: "Shopify Help Center",
    sourceUrl: "https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts",
    week: "2026-10-05",
  },
];
