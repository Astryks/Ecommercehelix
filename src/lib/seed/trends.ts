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
    summary: "Meta reports 19% lower cost per sale and 13% higher click-through, on average, when partnership ads sit alongside regular ads.",
    tryIt: "Ask your 3 best creators for ad permission and add their posts to your cold campaign as a batch.",
    suits: "Apparel, beauty, home · Growing stores and up",
    sourceLabel: "Storyboard18 on Meta's shopping updates",
    sourceUrl: "https://www.storyboard18.com/digital/meta-launches-new-era-of-shopping-experiences-powered-by-ai-reels-creators-ws-l-94638.htm",
    week: "2026-10-05",
  },
  {
    id: "catalog-video",
    channel: "Meta",
    title: "Catalog product video on Reels",
    summary: "Turn existing videos into templates in Commerce Manager, and Meta makes a product video for each item in your catalog.",
    tryIt: "Pick your best 15-second product video and test it as a catalog template on your top 20 products.",
    suits: "Stores with 20+ products",
    sourceLabel: "Adgully",
    sourceUrl: "https://www.adgully.com/post/14093/meta-launches-ai-powered-shopping-experiences-across-reels-and-creators",
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
    title: "Automated TikTok search ads",
    summary: "Search campaigns with keyword and creative automation are expanding, alongside in-app checkout.",
    tryIt: "Put your top 5 search phrases in captions and on-screen text before testing search ads.",
    suits: "Brands already active on TikTok",
    sourceLabel: "ChannelX",
    sourceUrl: "https://channelx.world/2026/10/tiktok-ai-powered-updates-for-advertisers-unveiled/",
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
