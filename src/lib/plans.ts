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
      "Every lesson in the Learn library to read",
      "Ad Trends feed",
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
    suits: "Stores from their first sales to about A$30k a month that want a clear weekly plan and run or plan to run Meta ads.",
    highlight: true,
    features: [
      "Everything in Free",
      "Course goals for Attract and Convert: traffic, email list, add to cart, conversion, order value",
      "Meta connected: daily ad spend and results synced into your profit",
      "Meta campaigns built as paused drafts in your own account. You press Launch",
      "Black Friday and seasonal prep plans with due dates on Today",
      "Full history: month, year to date and 12 months",
    ],
    doItForMe: [
      "Builds your Meta campaign, ad set and 3 ads as a paused draft in your own account. You add images and press Launch. Helix never spends or changes live budgets.",
      "Pulls your Meta spend and results into your profit dashboard every day.",
      "Builds your sale prep plan with due dates and calendar invites.",
      "Everything else is a step-by-step checklist with the exact settings to use. Helix guides you, and you click.",
    ],
    week1: [
      "Day 1: connect Meta (5 minutes) and finish profit setup",
      "Day 2: your key numbers baseline",
      "Day 3 to 5: build your first paused Meta test campaign",
      "Day 7: your first weekly check-in on Today",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 59,
    blurb: "Grow, keep more customers, and run it like a business.",
    suits: "Stores at about A$30k a month or more, or with a team or VA, focused on margin and repeat customers.",
    features: [
      "Everything in Starter",
      "The full course: Grow and Run goals (margin, returning customers, $100k months, scaling)",
      "90-day plans, a weekly meeting agenda and handover playbooks for a team",
      "Email flow blueprints: all 9 flows with full draft copy to paste into Klaviyo or Shopify Email",
      "Google Ads guided setup: Performance Max and Search, step by step. Guidance only, Helix does not connect to your Google account",
      "Weekly report",
    ],
    doItForMe: [
      "Everything Starter does for you.",
      "Writes all 9 email flows (timing, discount rules and every message) ready for you to paste into your email platform. Helix does not connect to Klaviyo or Shopify Email yet.",
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
