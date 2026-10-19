export type PlanId = "free" | "starter" | "growth";

export const PLAN_RANK: Record<PlanId, number> = { free: 0, starter: 1, growth: 2 };

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  /** One-line promise, shown under the plan name. */
  blurb: string;
  /** Who the plan suits. */
  suits: string;
  /** What you get. Only things that work today. */
  features: string[];
  /** What "Do it for me" really does on this plan. Empty on Free. */
  doItForMe: string[];
  /** Your first week, day by day. */
  week1: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    blurb: "Know your real profit.",
    suits: "Anyone starting out, or anyone who does not know their true margin yet.",
    features: [
      "Profit dashboard: profit per order and per month, cost by cost",
      "The 2-minute daily numbers check, by hand or CSV",
      "Key metrics panel and marketing % guide",
      "Growth chart by day and week",
      "Your first course goals: profit dashboard, daily numbers, key numbers",
      "A one-off store check of your home page and a product page, with fixes that quote your pages",
      "Every lesson in the Learn library to read",
      "Ad Trends feed",
      "3 AI answers a month: store-check summary, ad copy drafts and \"I'm lost\" help (standard advice after that)",
    ],
    doItForMe: [],
    week1: [
      "Day 1: set up your profit dashboard (about 10 minutes)",
      "Day 2: add yesterday's numbers and see your real profit per order",
      "Day 3 to 7: the 2-minute numbers check each morning and the next lesson",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    blurb: "Your growth plan, and Helix does the setup work it can.",
    suits: "Stores from their first sales to about US$30k a month that want a clear weekly plan and run or plan to run Meta ads.",
    highlight: true,
    features: [
      "Everything in Free",
      "Course goals for Attract and Convert: traffic, email list, add to cart, conversion, order value",
      "A monthly re-check of your store with a fix list that quotes your pages",
      "Meta connected: daily ad spend and results synced into your profit (open to early testers now, all stores after Meta's approval)",
      "Meta campaigns built as paused drafts in your own account. You press Launch",
      "Shopify connected: daily orders, sales, refunds, product costs and stock synced into your profit (read-only, new)",
      "Google Ads connected: daily spend and conversion value for ROAS by channel, and paused Search campaigns after you approve (coming soon)",
      "50 AI write-ups a month: store-check summaries, ad copy drafts and \"I'm lost\" help",
      "Black Friday and seasonal prep plans with due dates on Today",
      "Full history: month, year to date and 12 months",
    ],
    doItForMe: [
      "Builds your Meta campaign, ad set and 3 ads as a paused draft in your own account. You add images and press Launch. Helix never spends or changes live budgets.",
      "Pulls your Meta spend and results into your profit dashboard every day.",
      "Pulls your Shopify orders, sales and stock in every day once you connect it. Coming soon: your Google Ads spend, and a paused Google Search campaign after you approve.",
      "Builds your sale prep plan with due dates and calendar invites.",
      "Re-checks your store every month and lists exactly what changed.",
      "Everything else is a step-by-step checklist with the exact settings to use. Helix guides you, and you click.",
    ],
    week1: [
      "Day 1: connect Meta (5 minutes) and finish profit setup",
      "Day 2: your store re-check and top-5 fix list",
      "Day 3 to 5: fix #1, then build your first paused Meta test campaign",
      "Day 7: your first weekly check-in on Today",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 59,
    blurb: "Grow, keep more customers, and run it like a business.",
    suits: "Stores at about US$30k a month or more, or with a team or VA, focused on margin and repeat customers.",
    features: [
      "Everything in Starter",
      "The full course: Grow and Run goals (margin, returning customers, a $1M-a-year pace, scaling)",
      "90-day plans, a weekly meeting agenda and handover playbooks for a team",
      "Email flow blueprints: all 9 flows with full draft copy to paste into your email tool (for example Shopify Email)",
      "Google Ads guided setup: Performance Max and Search, step by step",
      "150 AI write-ups a month",
      "Weekly report page: what is coming up and your next prep steps (a full personal weekly report is coming)",
    ],
    doItForMe: [
      "Everything Starter does for you.",
      "Writes all 9 email flows (timing, discount rules and every message) ready for you to paste into your email platform. Helix does not connect to email tools yet.",
    ],
    week1: [
      "Day 1: margin and repeat-rate review",
      "Day 2 to 3: your 90-day plan",
      "Day 4 to 7: your first 3 flows (welcome, abandoned checkout, post-purchase) as ready-to-paste copy",
    ],
  },
];

export function planName(id: PlanId) {
  return PLANS.find((p) => p.id === id)?.name ?? "Free";
}
