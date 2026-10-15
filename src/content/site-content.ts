/**
 * ONE place for date-driven site content. Add an item here and the homepage banner, hero line,
 * Today tip, featured Learn lesson and template highlights pick it up by themselves.
 * Event dates come from src/lib/season-calendar.ts (computed every year). Copy: short and simple.
 */
export type ContentLink = { label: string; href: string };

/** Extra words for a calendar event, keyed by its calendar key. */
export type EventContent = { hero: string; lesson: ContentLink; templates: string[] };

const SEASON = (anchor: string, label: string): ContentLink => ({ label, href: `/learn/30-seasonal-sales-step-by-step#${anchor}` });
const PROMO: ContentLink = { label: "Run a sale that still makes money", href: "/learn/13-promotions-and-sales" };

export const EVENT_CONTENT: Record<string, EventContent> = {
  bfcm: { hero: "Black Friday is the biggest week of the year. Helix gives you a simple plan, one step a day.", lesson: SEASON("", "Your Black Friday plan, step by step"), templates: ["creator-outreach", "sale-announcement", "last-chance"] },
  christmas: { hero: "Christmas is coming. Helix tells you when to order stock, when to stop shipping and what to post.", lesson: SEASON("", "Get ready for Christmas"), templates: ["sale-announcement", "announcement-bar", "thank-you"] },
  "boxing-day": { hero: "Boxing Day buyers want a deal. Plan one simple offer that still leaves you profit.", lesson: PROMO, templates: ["sale-announcement", "last-chance"] },
  "new-year": { hero: "New year, fresh start. Set three small goals for your store and Helix tracks them daily.", lesson: { label: "Set your monthly goals", href: "/dashboard/goals" }, templates: ["thank-you", "welcome-email"] },
  valentines: { hero: "Valentine's Day is a gift rush. Helix helps you pick a gift offer and the right cut-off date.", lesson: PROMO, templates: ["creator-outreach", "sale-announcement"] },
  "mothers-day": { hero: "Mother's Day is a big gift day. Start planning your offer and creator posts now.", lesson: PROMO, templates: ["creator-outreach", "gifting-note", "sale-announcement"] },
  "fathers-day": { hero: "Father's Day is coming. A simple gift guide and one email can bring in extra sales.", lesson: PROMO, templates: ["sale-announcement", "announcement-bar"] },
  eofy: { hero: "End of financial year: a good time for a clear-out sale and to tidy your numbers.", lesson: { label: "Get ready for tax time", href: "/learn/27-accounting-bookkeeping-tax-time" }, templates: ["sale-announcement", "last-chance"] },
  "summer-deal-days": { hero: "Big online deal days are coming in July. Run your own small offer at the same time.", lesson: PROMO, templates: ["announcement-bar", "sale-announcement"] },
  "back-to-school": { hero: "Back to school means busy parents shopping online. Make your store quick and clear.", lesson: { label: "Make your store easy to buy from", href: "/learn/09-website-and-cro" }, templates: ["announcement-bar", "welcome-email"] },
  halloween: { hero: "Halloween is close. A fun theme on your store and one post can lift sales.", lesson: SEASON("", "Dress your store for a season"), templates: ["announcement-bar"] },
  easter: { hero: "Easter long weekend: plan your shipping cut-off and a small treat offer.", lesson: PROMO, templates: ["announcement-bar", "sale-announcement"] },
};

/** Evergreen tips. One shows each week when no event is on (rotates by week number). */
export type Tip = { key: string; text: string; cta: ContentLink };
export const TIPS: Tip[] = [
  { key: "influencer", text: "Find the right creator to partner with your brand.", cta: { label: "How to pick a creator", href: "/learn/19-creators-ugc-and-video-ads" } },
  { key: "speed", text: "Check your store speed. Slow pages lose buyers.", cta: { label: "Free store check", href: "/start" } },
  { key: "scroll", text: "Write ads that stop the scroll.", cta: { label: "Ad ideas that work", href: "/learn/05-creative-strategy" } },
  { key: "profit", text: "Know your real profit on every order.", cta: { label: "Daily profit basics", href: "/learn/01-daily-profit-foundations" } },
  { key: "welcome", text: "Send a welcome email to every new subscriber.", cta: { label: "Set up a welcome email", href: "/learn/10-email-sms-whatsapp" } },
  { key: "abandoned", text: "Win back people who left items in their cart.", cta: { label: "Cart emails", href: "/learn/10-email-sms-whatsapp" } },
  { key: "reviews", text: "Ask happy buyers for a review. Reviews help new buyers trust you.", cta: { label: "Review request words", href: "/dashboard/learn/templates#review-request" } },
  { key: "offer", text: "Make your offer easy to say yes to.", cta: { label: "Build a better offer", href: "/learn/03-offer-and-product" } },
  { key: "product-page", text: "Fix your best product page first. Small changes, more sales.", cta: { label: "Product page checklist", href: "/learn/09-website-and-cro" } },
  { key: "list", text: "Grow your email list a little every week.", cta: { label: "List growth ideas", href: "/learn/11-list-and-audience-growth" } },
  { key: "tiktok", text: "Try TikTok or Pinterest with one simple post a day.", cta: { label: "New channels", href: "/learn/12-channels-tiktok-pinterest-seo" } },
  { key: "stock", text: "Never run out of your best seller. Set a reorder point.", cta: { label: "Stock planning", href: "/learn/14-inventory-cash-planning" } },
  { key: "shipping", text: "Make shipping clear and fair. Surprise fees scare buyers away.", cta: { label: "Shipping and returns", href: "/learn/23-fulfilment-shipping-returns" } },
  { key: "brand", text: "Tell your brand story in one sentence.", cta: { label: "Brand basics", href: "/learn/04-brand-and-content" } },
  { key: "meta", text: "Spend less to get each sale from your Meta ads.", cta: { label: "Meta ads, step by step", href: "/learn/07-meta-ads" } },
  { key: "google", text: "Show up when people search for what you sell.", cta: { label: "Google ads, step by step", href: "/learn/08-google-ads" } },
  { key: "fraud", text: "Stop fraud and chargebacks before they cost you.", cta: { label: "Payments and fraud", href: "/learn/24-payments-fraud-chargebacks" } },
  { key: "ugc", text: "Real customer videos often beat polished ads.", cta: { label: "Customer video ads", href: "/learn/19-creators-ugc-and-video-ads" } },
  { key: "diagnose", text: "Find the one number holding your store back.", cta: { label: "Diagnose and fix", href: "/learn/02-diagnose-and-fix" } },
  { key: "ai", text: "Save an hour a week with simple AI helpers.", cta: { label: "AI for store owners", href: "/learn/17-ai-for-operators" } },
  { key: "rhythm", text: "Check your numbers at the same time every day. Habits win.", cta: { label: "Your daily numbers", href: "/dashboard/numbers" } },
  { key: "international", text: "Thinking of selling overseas? Start with one country.", cta: { label: "Selling overseas", href: "/learn/15-international-expansion" } },
  { key: "account-safety", text: "Keep your ad accounts safe with two-step login.", cta: { label: "Account safety", href: "/learn/25-account-safety-agencies" } },
];

/** Template highlights when no event is on, by week. */
export const EVERGREEN_TEMPLATES = ["welcome-email", "review-request", "creator-outreach", "announcement-bar"];

export const DEFAULT_HERO = "Helix shows you your profit every day, gives you one simple task to grow it, explains it step by step, and can do the work for you when you approve. Small daily wins add up to a bigger, more profitable business.";
