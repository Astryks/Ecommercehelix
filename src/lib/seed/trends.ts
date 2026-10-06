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
    summary: "Meta reports lower acquisition costs and higher click-through when partnership ads sit alongside regular ads in sales campaigns.",
    tryIt: "Ask your 3 best creators for ad permission and add their posts to your cold campaign as a batch.",
    suits: "Apparel, beauty, home · Stage 1+",
    sourceLabel: "Storyboard18 on Meta's shopping updates",
    sourceUrl: "https://www.storyboard18.com/digital/meta-launches-new-era-of-shopping-experiences-powered-by-ai-reels-creators-ws-l-94638.htm",
    week: "2026-10-05",
  },
  {
    id: "catalog-video",
    channel: "Meta",
    title: "Catalog product video on Reels",
    summary: "Turn existing videos into templates so every product in your catalog gets a video ad automatically.",
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
    summary: "Music, text overlays, filters and generated backgrounds may be altering your ads. Review them per ad.",
    tryIt: "Open one live ad, review creative enhancements, and turn off any that hurt your brand.",
    suits: "Everyone on Meta",
    sourceLabel: "Leapbuzz",
    sourceUrl: "https://leapbuzz.com/blog/meta-advantage-plus-creative-ai/",
    week: "2026-10-05",
  },
  {
    id: "q4-creators",
    channel: "Meta",
    title: "Brief creators now for Q4",
    summary: "Holiday guidance favours automated sales campaigns fed with several creator variants. Brief before costs peak.",
    tryIt: "Send 5 creator briefs this week with a gift-guide angle.",
    suits: "Gifting categories",
    sourceLabel: "Common Thread Collective",
    sourceUrl: "https://commonthreadco.com/blogs/coachs-corner/meta-holiday-insights-center-2026-q4-ecommerce",
    week: "2026-10-05",
  },
  {
    id: "gmv-max",
    channel: "TikTok",
    title: "TikTok Shop ads now run on automated GMV campaigns",
    summary: "Shop ads pull in paid, organic and affiliate videos. Judge in-platform return as its own score, not like Meta ROAS.",
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
    summary: "Google writes query-matched text and can expand landing pages. Many search campaigns were auto-upgraded in September.",
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
    sourceLabel: "Roar Digital",
    sourceUrl: "https://roardigital.co.uk/insights/how-to-choose-between-ai-max-and-performance-max-in-2026/",
    week: "2026-10-05",
  },
  {
    id: "chatgpt-ads",
    channel: "AI search",
    title: "Product-feed and visual ads in ChatGPT",
    summary: "Ads are opening to more sellers with product feeds and conversion measurement.",
    tryIt: "Make sure titles, prices, availability and return policy in your product feed are clean.",
    suits: "Stage 2+ stores in eligible markets",
    sourceLabel: "OpenAI",
    sourceUrl: "https://openai.com/index/new-chatgpt-ads-format-and-measurement/",
    week: "2026-10-05",
  },
  {
    id: "agentic-storefront",
    channel: "AI search",
    title: "Your products may already appear in AI shopping assistants",
    summary: "Shopify's agentic storefronts make eligible products discoverable in assistants, with checkout on your store.",
    tryIt: "Check eligibility in your Shopify admin and fill missing product attributes.",
    suits: "Shopify stores",
    sourceLabel: "Catalog.ai guide",
    sourceUrl: "https://www.getcatalog.ai/blog/shopify-chatgpt-product-visibility",
    week: "2026-10-05",
  },
];
