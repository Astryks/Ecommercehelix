/**
 * The Road to $100M: seven levels from first sale to $100M a year.
 * Pure (no server imports) so it is easy to test and safe to show anywhere.
 *
 * Numbers here are TYPICAL RANGES and Helix rules of thumb, not guarantees.
 * Where a figure comes from a public source it says so in `source`; everything
 * else is labelled an estimate in the UI. No case studies, no quotes.
 */

export type JourneyNumber = { label: string; target: string; why: string };
export type Milestone = {
  level: number;
  id: string;
  title: string;
  /** Short line for the map (always free). */
  short: string;
  /** Plain-English "you are here when..." test. */
  when: string;
  /** One-sentence summary (always free). */
  summary: string;
  whatChanges: string[];
  numbers: JourneyNumber[];
  moves: { text: string; lesson?: string }[];
  /** Typical shape of the business at this level (estimates). */
  shape: { label: string; value: string }[];
  /** Public sources used for this level, if any. */
  sources?: { label: string; url: string }[];
};

/** Levels 1 and 2 are fully free; the rest show a teaser on Free. */
export const FREE_LEVELS = 2;

export const ESTIMATE_NOTE = "These are typical ranges and Helix rules of thumb, not guarantees. Every business is different: your own numbers always win.";

const SHOPIFY_RETURNING = { label: "Shopify Help: returning customer rate", url: "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/customers-reports" };
const BAYMARD = { label: "Baymard Institute: cart abandonment rate", url: "https://baymard.com/lists/cart-abandonment-rate" };
const LTV_CAC = { label: "Shopify: what is a good LTV to CAC ratio", url: "https://www.shopify.com/blog/what-is-a-good-ltv-to-cac-ratio" };

export const MILESTONES: Milestone[] = [
  {
    level: 1, id: "first-sale", title: "First sale", short: "Someone you don't know buys",
    when: "You have at least one real order.",
    summary: "Prove a stranger will pay for what you sell. Nothing else matters yet.",
    whatChanges: [
      "You stop guessing. One real order tells you the product, price and store can work together.",
      "Your job is to learn, not to scale: talk to every buyer and write down why they bought.",
      "Keep costs tiny. Free plans and one channel are enough.",
    ],
    numbers: [
      { label: "Profit per order", target: "Positive after product, shipping and fees", why: "If one order loses money, a thousand orders lose a thousand times more." },
      { label: "Orders", target: "1, then 10", why: "Ten orders from strangers is the first real signal." },
      { label: "Daily numbers logged", target: "Every day", why: "The habit matters more than the size of the numbers." },
    ],
    moves: [
      { text: "Learn sales, costs and profit in plain English", lesson: "1.7" },
      { text: "Set up your profit dashboard so you see profit per order", lesson: "1.8" },
      { text: "Plan your store before you build it", lesson: "13.1" },
      { text: "Pick one channel to start with", lesson: "8.18" },
      { text: "Run your first small ad (or post) and track what it cost", lesson: "8.17" },
    ],
    shape: [
      { label: "Team", value: "Just you" },
      { label: "Products", value: "1 to 3" },
      { label: "Channels", value: "One" },
    ],
  },
  {
    level: 2, id: "first-1k", title: "$1k in sales", short: "Your first $1,000",
    when: "You have made $1,000 in sales in total.",
    summary: "Turn one lucky sale into something you can repeat on purpose.",
    whatChanges: [
      "You have enough orders to see patterns: which product, which ad, which day.",
      "Start a simple daily routine: two minutes on your numbers each morning.",
      "Collect your buyers' own words. They become your best ads and product page copy.",
    ],
    numbers: [
      { label: "Marketing as a share of sales (MER)", target: "Know your break-even number", why: "It tells you how much you can spend on ads before you lose money." },
      { label: "Contribution margin", target: "Above 0%, aim for 10%+", why: "What you keep after product, shipping, fees and ads." },
      { label: "Repeat buyers", target: "Your first one", why: "Someone coming back is the strongest sign you have a real product." },
    ],
    moves: [
      { text: "Work out your target MER and break-even numbers", lesson: "1.5" },
      { text: "Start the 2-minute morning routine", lesson: "1.6" },
      { text: "Collect your customers' own words", lesson: "30.1" },
      { text: "Make your offer stronger in five ways", lesson: "15.1" },
      { text: "Follow up after every sale", lesson: "17.7" },
    ],
    shape: [
      { label: "Team", value: "You, maybe a friend helping" },
      { label: "Products", value: "1 to 5" },
      { label: "Channels", value: "One paid or organic, plus email sign-ups" },
    ],
  },
  {
    level: 3, id: "10k-month", title: "$10k a month", short: "A real side income",
    when: "Your last 30 days of sales are $10,000 or more.",
    summary: "Build the machine: steady ads, an email list that sells and profit you can count on.",
    whatChanges: [
      "Ads become a weekly system: new creative in, losers out, winners get more budget.",
      "Email flows (welcome, abandoned cart, after purchase) start earning while you sleep.",
      "You feel time pressure for the first time. Write down the tasks you repeat.",
    ],
    numbers: [
      { label: "MER (ads ÷ sales)", target: "Typically 20% to 35%", why: "The range the Helix playbook uses for healthy growing stores. Above your break-even, you are buying sales at a loss." },
      { label: "Contribution margin", target: "10%+ after ads", why: "Leaves room for tools, mistakes and slow weeks." },
      { label: "Returning-customer share of sales", target: "Typically 10% to 20%, rising", why: "Shopify notes most stores see roughly 20% to 40% returning-customer revenue once established." },
    ],
    moves: [
      { text: "Run the creative management cycle every week", lesson: "5.2" },
      { text: "Set up the five core email flows", lesson: "16.2" },
      { text: "Use simple decision rules: scale, hold, refresh, kill", lesson: "7.12" },
      { text: "Raise order value with bundles and thresholds", lesson: "14.9" },
      { text: "Write a playbook for a task you repeat", lesson: "30.11" },
    ],
    shape: [
      { label: "Team", value: "You plus a freelancer or VA a few hours a week (estimate)" },
      { label: "Products", value: "A hero product and a few add-ons" },
      { label: "Channels", value: "One main paid channel, email, organic social" },
      { label: "Email & SMS share of sales", value: "Often 10% to 25% once flows are live (estimate)" },
    ],
    sources: [SHOPIFY_RETURNING],
  },
  {
    level: 4, id: "1m-year", title: "$1M a year", short: "About $84k a month",
    when: "Your last 30 days of sales are about $84,000 or more (a $1M-a-year pace).",
    summary: "A real business. Profit, cash and your own time now limit growth more than ads do.",
    whatChanges: [
      "Cash gets tight even when profit looks fine: stock is paid for weeks before it sells.",
      "You cannot do everything. Your first proper hire (often creative or customer service) frees you to plan.",
      "Ad spend gets big enough that each extra dollar buys a bit less. Margin and repeat buyers carry you.",
    ],
    numbers: [
      { label: "Net margin", target: "10%+ (the Helix $1M goal)", why: "The finish line in your Helix course: $84,000 over 30 days with at least 10% profit." },
      { label: "LTV:CAC", target: "3:1 is good, 2:1 is okay", why: "Shopify's widely used guide: a customer should be worth about three times what they cost to win." },
      { label: "Days of stock cover", target: "Enough to cover supplier lead time plus a buffer", why: "Running out stops sales; too much stock traps cash." },
    ],
    moves: [
      { text: "Build a 13-week cash flow forecast", lesson: "19.4" },
      { text: "Set reorder points so you don't run out", lesson: "19.9" },
      { text: "Make your first hire for a clear result", lesson: "26.1" },
      { text: "Face the scaling challenge", lesson: "8.13" },
      { text: "Plan around how often customers come back", lesson: "16.17" },
    ],
    shape: [
      { label: "Team", value: "Roughly 1 to 5 people, many part-time or freelance (estimate)" },
      { label: "Products", value: "A core range with regular new drops" },
      { label: "Channels", value: "Two paid channels plus email and SMS" },
      { label: "Ad spend", value: "Roughly $15k to $30k a month at a 20% to 35% MER (worked from the range above)" },
    ],
    sources: [LTV_CAC],
  },
  {
    level: 5, id: "10m-year", title: "$10M a year", short: "About $830k a month",
    when: "Your last 30 days of sales are about $830,000 or more.",
    summary: "From founder-led to team-led. Systems, owners for every number and a brand people search for.",
    whatChanges: [
      "Every key number needs an owner who is not you: ads, email, stock, customer service, finance.",
      "Brand starts to matter as much as ads: people search your name, come back and tell friends.",
      "Cash, stock and suppliers become the biggest risk. A single late shipment can cost a month.",
      "You add channels on purpose (another country, wholesale or a marketplace), one at a time.",
    ],
    numbers: [
      { label: "MER (blended)", target: "Typically 20% to 30%, stable while growing", why: "At this size, a few points of MER is hundreds of thousands of dollars a year." },
      { label: "Returning-customer share of sales", target: "Typically 30%+", why: "Repeat buyers are cheaper than new ones. Shopify puts most established stores at 20% to 40%." },
      { label: "Contribution margin after ads", target: "Often 15% to 25% (estimate)", why: "Pays for the team, tools and the next stock order." },
    ],
    moves: [
      { text: "Give every job and number one owner", lesson: "30.12" },
      { text: "Check if there is demand in a new country", lesson: "25.1" },
      { text: "Decide if Amazon is right for you", lesson: "26.8" },
      { text: "Compare financing offers before you need them", lesson: "26.5" },
      { text: "Keep a clean monthly close in your books", lesson: "23.4" },
    ],
    shape: [
      { label: "Team", value: "Often around 10 to 25 people across marketing, operations, customer care and finance (estimate)" },
      { label: "Roles to add", value: "Head of growth, operations/stock lead, finance (part-time CFO or bookkeeper), creative team" },
      { label: "Products", value: "Several product lines, a launch calendar" },
      { label: "Channels", value: "Meta, Google, TikTok or others; email and SMS; maybe wholesale or a marketplace" },
      { label: "Ad spend", value: "Roughly $160k to $250k a month at a 20% to 30% MER (worked from the range above)" },
    ],
    sources: [SHOPIFY_RETURNING],
  },
  {
    level: 6, id: "50m-year", title: "$50M a year", short: "About $4.2M a month",
    when: "Your last 30 days of sales are about $4.2M or more.",
    summary: "A multi-channel brand. Growth comes from new markets, new products and retail as much as ads.",
    whatChanges: [
      "Your own store is now one channel among several: other countries, retail partners and marketplaces.",
      "Leaders run teams. Your job is direction, hiring leaders and the yearly plan.",
      "Stock, supplier terms and currency swings move profit as much as marketing does.",
      "Raising money becomes a real choice, not a necessity. Many brands still grow on profit.",
    ],
    numbers: [
      { label: "Contribution margin after ads", target: "Protect it while growing (estimate: 15%+)", why: "Growth that lowers margin every year eventually stalls." },
      { label: "Cash stuck in stock", target: "Count the days, push it down", why: "At this size, a week less stock frees up hundreds of thousands of dollars." },
      { label: "New-customer cost (CAC) vs first-order profit", target: "CAC at or under first-order margin, or a short payback", why: "Keeps growth from needing outside cash." },
    ],
    moves: [
      { text: "Count the days your cash is stuck", lesson: "19.12" },
      { text: "Plan your range for the year", lesson: "19.1" },
      { text: "Start selling to shops (wholesale)", lesson: "26.9" },
      { text: "Write a one-page direction for the business", lesson: "30.15" },
      { text: "Think through capital and exit options", lesson: "27.6" },
    ],
    shape: [
      { label: "Team", value: "Often dozens of people with department heads (estimate)" },
      { label: "Products", value: "A full range, many SKUs, regular launches" },
      { label: "Channels", value: "Your store in several countries, retail partners, one or more marketplaces" },
      { label: "Cash", value: "Supplier terms, stock finance or a credit line are common tools" },
    ],
  },
  {
    level: 7, id: "100m-year", title: "$100M a year", short: "About $8.3M a month",
    when: "Your last 30 days of sales are about $8.3M or more.",
    summary: "A household brand in its category. Very few stores get here; it takes years of compounding.",
    whatChanges: [
      "The brand does a lot of the selling: people find you through search, shops and word of mouth.",
      "The company has a leadership team; you set direction, culture and the big bets.",
      "Small percentage gains (a point of margin, a point of repeat rate) are worth millions.",
      "Risk management matters: suppliers, account safety, data you own, tax in many places.",
    ],
    numbers: [
      { label: "Repeat and brand demand", target: "A large, growing share of sales from people who already know you (estimate)", why: "Paid ads alone rarely scale this far profitably." },
      { label: "Net margin", target: "Positive and planned year by year", why: "Profit gives you the choice to fund growth yourself." },
      { label: "Conversion basics", target: "Keep fixing checkout leaks", why: "Baymard's average cart abandonment rate is about 70%, so even big stores lose most carts." },
    ],
    moves: [
      { text: "Run a quarterly reset with your leaders", lesson: "30.14" },
      { text: "Keep a 90-day plan on one page", lesson: "30.13" },
      { text: "Keep your ad accounts and data safe (and owned by you)", lesson: "24.5" },
      { text: "Recheck unit economics per country", lesson: "25.2" },
      { text: "Raise prices and lean less on discounts", lesson: "15.11" },
    ],
    shape: [
      { label: "Team", value: "Often 100+ people including outsourced partners (estimate, varies hugely)" },
      { label: "Products", value: "Broad range, often several categories" },
      { label: "Channels", value: "Direct, retail, marketplaces and international, each with its own team" },
    ],
    sources: [BAYMARD],
  },
];

/** Monthly sales needed to reach a level (levels 3+). */
const MONTHLY: Record<number, number> = { 3: 10_000, 4: 84_000, 5: 830_000, 6: 4_200_000, 7: 8_300_000 };

export type JourneyFacts = { lifetimeOrders: number; lifetimeSales: number; last30Sales: number };

/** The highest level the real numbers reach (0 = not started). */
export function levelFromNumbers(f: JourneyFacts): number {
  let lvl = 0;
  if (f.lifetimeOrders >= 1 || f.lifetimeSales > 0) lvl = 1;
  if (f.lifetimeSales >= 1000) lvl = 2;
  for (const l of [3, 4, 5, 6, 7]) if (f.last30Sales >= MONTHLY[l]) lvl = l;
  return lvl;
}

/** Progress (0..1) from the current level toward the next, from real numbers. */
export function progressToNext(f: JourneyFacts, level: number): number | null {
  if (level >= 7) return 1;
  if (level === 0) return 0;
  if (level === 1) return Math.min(1, f.lifetimeSales / 1000);
  return Math.min(1, f.last30Sales / MONTHLY[level + 1]);
}

export type Position = { level: number; source: "numbers" | "self" | "none" };

/** Real numbers win when there are any; otherwise the level the owner picked. */
export function positionFor(f: JourneyFacts | null, selfLevel: number | null): Position {
  if (f && (f.lifetimeOrders > 0 || f.lifetimeSales > 0)) return { level: levelFromNumbers(f), source: "numbers" };
  if (selfLevel && selfLevel >= 1 && selfLevel <= 7) return { level: selfLevel, source: "self" };
  return { level: 0, source: "none" };
}

export const canSeeLevel = (paid: boolean, level: number) => paid || level <= FREE_LEVELS;

/** What a Free viewer gets for a locked level: map summary only, no numbers or moves. */
export function teaserOf(m: Milestone) {
  return { level: m.level, id: m.id, title: m.title, short: m.short, when: m.when, summary: m.summary, firstChange: m.whatChanges[0], numberLabels: m.numbers.map((n) => n.label) };
}

/** Road XP: the lesson XP from the Attract / Convert / Grow checklist, plus points for real actions. Pure. */
export type XpInputs = { lessonXp: number; tasksDone: number; goalsDone: number; daysWithNumbers: number };
export const XP_RULES = { task: 5, goal: 50, numbersDay: 5 } as const;
export function xpFor(i: XpInputs): number {
  return i.lessonXp + i.tasksDone * XP_RULES.task + i.goalsDone * XP_RULES.goal + i.daysWithNumbers * XP_RULES.numbersDay;
}

/** One short line for the AI coach (no customer data). */
export function coachLine(p: Position): string | null {
  if (p.level === 0) return null;
  const m = MILESTONES[p.level - 1];
  const next = MILESTONES[p.level];
  return `Road to $100M: the owner is at level ${p.level} of 7, "${m.title}" (${p.source === "numbers" ? "from their real sales" : "they picked this themselves"}).${next ? ` Next milestone: "${next.title}" (${next.when})` : ""}`;
}

export const allJourneyLessonRefs = () => [...new Set(MILESTONES.flatMap((m) => m.moves.map((x) => x.lesson).filter(Boolean) as string[]))];
