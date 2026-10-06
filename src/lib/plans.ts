export type PlanId = "free" | "starter" | "growth";

export const PLAN_RANK: Record<PlanId, number> = { free: 0, starter: 1, growth: 2 };

export const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  blurb: string;
  aiAllowance: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    blurb: "See what Helix finds in your store.",
    aiAllowance: "Light AI usage, capped",
    features: [
      "Daily programme: Days 1 to 17",
      "Monthly site audit with Insights",
      "Guide me: ad structures, example ads, build checklists",
      "Manual daily scorecard and CSV import",
      "Ad Trends feed and full Learn library",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    blurb: "Your daily growth plan, every day.",
    aiAllowance: "About $3 of AI usage included each month",
    highlight: true,
    features: [
      "Everything in Free",
      "Daily programme: Days 1 to 52",
      "\"I'll do it for you\" with your approval",
      "Daily ad and site Insights with cross-diagnosis",
      "Campaigns built in your account as paused drafts. You press Launch",
      "One ad platform: Meta or Google",
      "Your ads, with a plain call on each: spend more, wait, new ads or stop",
      "Auto scorecard from Shopify + one ad platform",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 59,
    blurb: "Your head of growth, across channels.",
    aiAllowance: "About $8 of AI usage included each month",
    features: [
      "Everything in Starter",
      "All 64 days plus ongoing Insights tasks",
      "Meta and Google together",
      "Email and SMS flows drafted and set up after approval",
      "Weekly agency-style report",
      "Site edit drafts with preview (beta)",
    ],
  },
];

export function planName(id: PlanId) {
  return PLANS.find((p) => p.id === id)?.name ?? "Free";
}
