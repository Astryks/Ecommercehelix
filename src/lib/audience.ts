/**
 * Who Helix is for, by store size. Bands follow the milestones owners care about
 * (first sale, first $10k month, first $100k month, first $1M year) and match the
 * stages in docs/compound-daily-plan.md. Figures are yearly sales, in the store's currency.
 */
export type Band = { id: "starting" | "growing" | "scaling"; name: string; range: string; monthly: string; fit: string; focus: string; track: string };

export const BANDS: Band[] = [
  { id: "starting", name: "Just starting", range: "$0 to your first sales", monthly: "No sales yet, or your first orders",
    fit: "Best fit",
    focus: "Pick a product people want, build a store that converts, and run a first small test campaign without wasting money.",
    track: "Just starting track (28 days)" },
  { id: "growing", name: "Growing", range: "Up to about $1M a year", monthly: "Up to about $100k a month",
    fit: "Best fit",
    focus: "Find ads that pay for themselves, lift conversion and order value, grow your list and keep more of every sale. Most owners here still make every call themselves.",
    track: "Growing track (64 days)" },
  { id: "scaling", name: "Scaling", range: "About $1M to $10M a year", monthly: "About $100k a month and up",
    fit: "Good fit",
    focus: "Protect margin as spend grows, plan stock and Black Friday a year ahead, and hand work to a small team with clear numbers to hit.",
    track: "Growing track, plus the business and stock tools" },
];

export const MILESTONES = ["First sale", "First $10k month", "First $100k month", "First $1M year", "First $10M year"];
