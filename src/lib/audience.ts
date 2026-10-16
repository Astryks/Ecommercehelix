/**
 * Who Helix is for, by store size. Bands follow the milestones owners care about
 * (first sale, first $10k month, first $1M year, first $10M year) and match the
 * stages in docs/compound-daily-plan.md. Figures are yearly sales, in the store's currency.
 */
export type Band = { id: "starting" | "growing" | "scaling"; name: string; range: string; monthly: string; fit: string; focus: string; track: string };

export const BANDS: Band[] = [
  { id: "starting", name: "Just starting", range: "$0 to your first sales", monthly: "Under about $10k a month",
    fit: "Great start",
    focus: "Pick a product people want, build a store that converts, and run a first small test campaign without wasting money.",
    track: "Just starting track (28 days)" },
  { id: "growing", name: "Growing", range: "Toward a $1M year, profitably", monthly: "$10k to $30k a month",
    fit: "Best fit",
    focus: "The best fit for Helix. Find ads that pay for themselves, lift conversion and order value, grow your list and keep more of every sale on the way to $1M.",
    track: "Growing track (66 days)" },
  { id: "scaling", name: "Scaling", range: "On the way to a $1M year and beyond", monthly: "$30k to $80k+ a month",
    fit: "Good fit",
    focus: "Protect margin as spend grows, plan stock and Black Friday a year ahead, and hand work to a small team with clear numbers to hit.",
    track: "Growing track, plus the business and stock tools" },
];

/** The one-line answer to "is Helix for me?". Used on the home page, About and onboarding. */
export const WHO_HEADLINE = {
  title: "Built for stores doing $10k to $30k a month, we help you reach $1M profitably",
  short: "Built for stores doing $10k to $30k a month, we help you reach $1M profitably.",
  body: "That is where Helix gets the most done for you: you have real sales and real numbers, the owner still makes the calls, and small daily gains add up fast. Just starting? The Just starting track begins at $0 and gets you to steady sales. Already past $1M a year? Helix keeps helping as you scale toward $10M.",
};

export const MILESTONES = ["First sale", "First $10k month", "First $1M year", "First $10M year"];
