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
    blurb: "Know your real profit, every day.",
    aiAllowance: "Light AI usage, capped",
    features: [
      "Profit dashboard: profit per order and per month, cost by cost",
      "Daily numbers by hand or CSV, with the 2-minute morning check",
      "Key metrics panel and marketing % guide",
      "Growth chart by day and week",
      "Your course: the first goals (profit dashboard, daily numbers, key numbers) with their lessons",
      "Every lesson in the Learn library to read",
      "Monthly site audit and Ad Trends feed",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    blurb: "Your growth plan, step by step.",
    aiAllowance: "About $3 of AI usage included each month",
    highlight: true,
    features: [
      "Everything in Free",
      "Course goals for Attract and Convert: traffic, email list, add to cart, conversion, AOV",
      "\"Do it for me\" with your approval",
      "Meta connected: daily ad sync and campaigns built as paused drafts. You press Launch",
      "Black Friday and seasonal prep plans with due dates on Today",
      "Daily Insights with cross-diagnosis and AI help",
      "Full dashboard history: month, year to date and 12 months",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 59,
    blurb: "Grow, keep more, and build the team.",
    aiAllowance: "About $8 of AI usage included each month",
    features: [
      "Everything in Starter",
      "The full course: Grow and Run goals (margin, returning customers, $100k months, scaling)",
      "90-day plans, weekly meeting, playbooks and handing work to a team",
      "Google Ads guided setup: Performance Max and Search, step by step (Google connection coming soon)",
      "Email and SMS flows drafted and set up after approval",
      "Weekly agency-style report",
      "Site edit drafts with preview (beta)",
    ],
  },
];

export function planName(id: PlanId) {
  return PLANS.find((p) => p.id === id)?.name ?? "Free";
}
