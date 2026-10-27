/**
 * Road to $100M, deep content: how to BOOTSTRAP (grow on your own profit, no
 * outside investors) from first sale to $100M a year.
 *
 * Honesty rules: every range is a typical range or Helix estimate under the
 * stated assumptions, not a promise. Public facts link their source. Brand
 * examples use only facts from company pages, filings or major press.
 * Pure: no server imports.
 */

export type Src = { label: string; url: string };

export const SRC = {
  shopifyReturning: { label: "Shopify Help: customer reports (returning customer rate)", url: "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/customers-reports" },
  baymard: { label: "Baymard Institute: cart abandonment rate", url: "https://baymard.com/lists/cart-abandonment-rate" },
  ltvCac: { label: "Shopify: what is a good LTV to CAC ratio", url: "https://www.shopify.com/blog/what-is-a-good-ltv-to-cac-ratio" },
  ccc: { label: "Shopify: cash conversion cycle", url: "https://www.shopify.com/blog/cash-conversion-cycle" },
  cashGov: { label: "business.gov.au: improve your cash flow", url: "https://business.gov.au/finance/cash-flow/improve-your-cash-flow" },
  influencer: { label: "Shopify: influencer marketing guide", url: "https://www.shopify.com/blog/influencer-marketing" },
  ftc: { label: "US FTC: disclosures 101 for social media influencers", url: "https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers" },
} satisfies Record<string, Src>;

/* ------------------------------------------------------------------ */
/* What you spend: a transparent model                                 */
/* ------------------------------------------------------------------ */

/** The worked-example product used across Helix lessons. Change these and every figure follows. */
export const ASSUMPTIONS = {
  price: 60,
  productCost: 13.5,
  shipping: 4,
  /** Payment fees as a share of the price (estimate; check your own plan). */
  feeRate: 0.03,
  /** Discounts, returns and refunds as a share of sales (estimate). */
  leakRate: 0.1,
} as const;

/** Contribution before ads, per $1 of sales: price minus product, shipping, fees and returns, divided by price. */
export function contributionBeforeAds(a = ASSUMPTIONS): number {
  const perOrder = a.price - a.productCost - a.shipping - a.price * a.feeRate - a.price * a.leakRate;
  return perOrder / a.price;
}

type Range = [number, number];
export type SpendInputs = {
  level: number;
  /** What "reaching" the level means in sales, and over what period. */
  goal: string;
  sales: number;
  period: "total" | "month" | "year";
  /** MER: ad spend as a share of sales. Best (lowest) first. */
  mer: Range;
  /** Team, tools and other running costs as a share of sales (estimate). */
  overheadPct: Range;
  /** Share of the marketing budget going to creators, affiliates and partners (estimate). */
  partnerPct: Range;
  /** Stock: either a fixed first batch in units, or months of sales held. */
  stock: { units: Range } | { months: Range };
};

export const SPEND_INPUTS: SpendInputs[] = [
  { level: 1, goal: "Your first sale", sales: 60, period: "total", mer: [0.5, 2], overheadPct: [0, 0], partnerPct: [0, 0], stock: { units: [20, 50] } },
  { level: 2, goal: "$1,000 in sales", sales: 1_000, period: "total", mer: [0.4, 0.67], overheadPct: [0, 0], partnerPct: [0, 0.1], stock: { units: [50, 100] } },
  { level: 3, goal: "$10,000 a month (about $120k a year)", sales: 10_000, period: "month", mer: [0.33, 0.5], overheadPct: [0.05, 0.1], partnerPct: [0.05, 0.15], stock: { months: [2, 3] } },
  { level: 4, goal: "$1M a year", sales: 1_000_000, period: "year", mer: [0.25, 0.4], overheadPct: [0.08, 0.12], partnerPct: [0.1, 0.2], stock: { months: [2, 3] } },
  { level: 5, goal: "$10M a year", sales: 10_000_000, period: "year", mer: [0.25, 0.4], overheadPct: [0.1, 0.15], partnerPct: [0.15, 0.25], stock: { months: [2, 3] } },
  { level: 6, goal: "$50M a year", sales: 50_000_000, period: "year", mer: [0.25, 0.4], overheadPct: [0.12, 0.18], partnerPct: [0.15, 0.25], stock: { months: [2, 3] } },
  { level: 7, goal: "$100M a year", sales: 100_000_000, period: "year", mer: [0.25, 0.4], overheadPct: [0.12, 0.18], partnerPct: [0.15, 0.25], stock: { months: [2, 3] } },
];

export type SpendRow = {
  level: number; goal: string; period: SpendInputs["period"]; sales: number;
  stock: Range; ads: Range; adPct: Range; partners: Range; overhead: Range; profit: Range; profitPct: Range;
};

const r = (n: number) => Math.round(n);

/** Works out the spend card for a level. Low/high pair worst and best cases. */
export function spendFor(level: number, a = ASSUMPTIONS): SpendRow {
  const i = SPEND_INPUTS.find((x) => x.level === level);
  if (!i) throw new Error("no level " + level);
  const unitCostShare = a.productCost / a.price; // 22.5% with the defaults
  const monthly = i.period === "year" ? i.sales / 12 : i.sales;
  const stock: Range = "units" in i.stock
    ? [i.stock.units[0] * a.productCost, i.stock.units[1] * a.productCost]
    : [monthly * unitCostShare * i.stock.months[0], monthly * unitCostShare * i.stock.months[1]];
  const adPct: Range = [i.mer[0], i.mer[1]];
  const ads: Range = [i.sales * adPct[0], i.sales * adPct[1]];
  const cm = contributionBeforeAds(a);
  const profitPct: Range = [cm - adPct[1] - i.overheadPct[1], cm - adPct[0] - i.overheadPct[0]];
  return {
    level, goal: i.goal, period: i.period, sales: i.sales,
    stock: [r(stock[0]), r(stock[1])], ads: [r(ads[0]), r(ads[1])], adPct,
    partners: [r(ads[0] * i.partnerPct[0]), r(ads[1] * i.partnerPct[1])],
    overhead: [r(i.sales * i.overheadPct[0]), r(i.sales * i.overheadPct[1])],
    profit: [r(i.sales * profitPct[0]), r(i.sales * profitPct[1])], profitPct,
  };
}

export const SPEND_FORMULA = [
  "Worked example product: sells for $60, costs $13.50 to make, $4 to ship. Payment fees about 3% ($1.80) and discounts, returns and refunds about 10% ($6) are Helix estimates.",
  "Contribution before ads = $60 − $13.50 − $4 − $1.80 − $6 = $34.70 per order, about 58% of sales.",
  "Ad spend = sales × MER. MER is marketing as a share of sales: 25% means $4 of sales for every $1 of ads; 40% means $2.50 of sales per $1. From $1M a year the table uses 25% to 40%; earlier levels use higher shares because you are still learning.",
  "Stock = a first batch of units at $13.50 each (levels 1 and 2), then 2 to 3 months of sales held at cost (supplier lead time plus a buffer). With this product, cost is 22.5% of the price, so 2 months of stock is about 45% of one month's sales.",
  "Running costs (team, tools, software, partners' fees outside ad budgets) are a share of sales: Helix estimates that grow with the team.",
  "Profit = sales × (58% − ad share − running-cost share). The low end pairs the highest MER with the highest running costs.",
  "Creators and partners are shown as part of the ad budget, not on top of it.",
];

export const CHANGE_ASSUMPTIONS = "Change the assumptions: put your own price, product cost, shipping and MER into the Profit page in your dashboard and use your numbers instead of these. If your product costs more than about 35% of the price, or your MER is above the high end, the profit column shrinks fast and can go negative.";

export const SPEND_NOTE = "Typical ranges and Helix estimates under the stated assumptions, not a promise. Ads get more expensive as you scale (see below), so the ad share is a starting range, not a guarantee.";

/* ------------------------------------------------------------------ */
/* Ads get saturated                                                   */
/* ------------------------------------------------------------------ */

export const SATURATION = {
  what: "Ads get saturated. The first dollars reach the people most likely to buy; each extra dollar reaches people a bit less interested. The same people see your ads again and again, your creative gets stale, the cost to reach 1,000 people and to win a customer rises, and MER (ads as a share of sales) climbs. This is normal, not a sign you did something wrong.",
  spot: [
    "Frequency (how many times the same person sees your ad) climbing week after week.",
    "Click-through rate (CTR) on the same ads falling.",
    "Cost per purchase rising and blended MER rising for 2 to 3 weeks in a row, even with fresh budget.",
    "A smaller share of orders coming from new customers.",
  ],
  fix: [
    "Feed in fresh creative on a steady rhythm (new hooks, new people on camera, new angles) every week or two.",
    "Reach new audiences: new customer types, a second ad channel, new countries.",
    "Lean on customers you already have: email, SMS, bundles, refills, loyalty.",
    "Add channels that are not ads: creators, wholesale and retail, marketplaces, PR, community.",
    "Scale in steps (around 20% at a time, a Helix rule of thumb), check MER, then step again.",
    "Put some money into brand: content, partners and a product people talk about. It makes every ad work harder.",
  ],
};

/* ------------------------------------------------------------------ */
/* Real brands, sourced                                                */
/* ------------------------------------------------------------------ */

export type BrandLesson = { brand: string; did: string; happened: string; lesson: string; sources: Src[] };

export const BRAND_LESSONS: BrandLesson[] = [
  {
    brand: "Gymshark",
    did: "Started in 2012 with no financial backing. Its own story says the first site drop-shipped supplements because it couldn't afford stock, and the first order took about two months. The founder then sewed and screen-printed clothing himself and gave it to gym lifters with their own followings, who became the first Gymshark athletes.",
    happened: "Aston University reports the founder kept studying and delivering pizzas until sales reached about £250,000 a year, and that sales passed £100m in 2021. In 2020 the BBC reported a private equity firm took a 21% stake valuing the business at over £1bn, eight years after it began.",
    lesson: "You can start tiny and fund growth from sales. Creators who genuinely like the product can be a growth engine. Outside money came late, as a choice, not to survive.",
    sources: [
      { label: "Gymshark: the official Gymshark story", url: "https://www.gymshark.com/blog/article/the-official-gymshark-story" },
      { label: "Aston University news", url: "https://www.aston.ac.uk/latest-news/gymshark-founder-return-aston-university-receive-honorary-degree" },
      { label: "BBC News", url: "https://www.bbc.co.uk/news/business-53781515" },
    ],
  },
  {
    brand: "Casper",
    did: "Grew a mattress brand with heavy marketing online, then added its own stores and retail partners.",
    happened: "Its results for 2019 (filed with the US SEC) show $439.3M revenue, $154.6M of sales and marketing (35.2% of revenue) and a net loss of $93.0M. Sales to retail partners grew 86% that year.",
    lesson: "Big sales are not the same as profit. If marketing eats a third of every dollar and costs stay high, you need outside money to keep going. A bootstrapped store has to protect margin first.",
    sources: [{ label: "Casper results filed with the SEC (2020)", url: "https://www.sec.gov/Archives/edgar/data/1598674/000110465920035569/0001104659-20-035569.txt" }],
  },
  {
    brand: "Allbirds",
    did: "Sold mostly online (89% of sales in 2020 per its IPO filing) and opened stores it describes as a profitable source of new customers.",
    happened: "Its filing lists rising advertising costs as a risk: if they increase, it may be unable to grow profitably. It expected better marketing efficiency from less reliance on winning new customers.",
    lesson: "Even large brands see ad costs as a ceiling. Plan for repeat buyers and channels beyond paid ads before you need them.",
    sources: [{ label: "Allbirds IPO filing (S-1) with the SEC", url: "https://www.sec.gov/Archives/edgar/data/1653909/000162828021017824/allbirdss-1.htm" }],
  },
];

/* ------------------------------------------------------------------ */
/* Bootstrapping note (free)                                           */
/* ------------------------------------------------------------------ */

export const BOOTSTRAP_NOTE = {
  title: "Is bootstrapping right for you?",
  body: [
    "Bootstrapping means growth is paid for by your own profit, not investors or big loans. You keep control and ownership, and you are forced to stay profitable. The cost is speed: you can only grow as fast as cash allows.",
    "It fits best when your product earns a healthy margin on the first order, stock can be bought in small batches and customers come back.",
    "Outside funding can make sense when the product needs big money before the first sale (factories, hardware, regulated products), when a competitor can copy you faster than profit lets you grow, or when you are offered fair terms and have a clear use for the money. Read every offer carefully and get independent advice.",
    "Most stores never reach the top levels of this road, with or without funding. The road is a map, not a promise.",
  ],
};

/* ------------------------------------------------------------------ */
/* Per-level deep content                                              */
/* ------------------------------------------------------------------ */

export type Deep = {
  takes: string[];
  /** Rough range; never a promise. */
  timeline: string;
  economics: string[];
  cash: string[];
  hiring: string[];
  channels: string[];
  /** Content, creators, partners, PR, community, suppliers. */
  ecosystem: string[];
  adWall: string;
  mistakes: string[];
  sources: Src[];
};

/** Gifting guidance for the early levels (first sale, $1k, $10k a month). */
export const GIFTING =
  "Gift your product: message the creators you like on Instagram (or TikTok, YouTube, wherever they are) and offer to send it free. Think of it as an investment to win your first customers, or at least get the word out. You can't build a big brand on your own. There's a whole ecosystem of people who help each other grow, so be open to everything.";
export const DISCLOSE =
  "Reminder: gifted or paid posts should be labelled, for example #ad or the paid partnership tag (general info, not legal advice).";

export const DEEP: Record<number, Deep> = {
  1: {
    takes: [
      "One product you can explain in a sentence, a price that leaves profit after costs, and a simple store that works on a phone.",
      "Getting it in front of strangers: posts, a friend-of-a-friend, or a small ad test.",
    ],
    timeline: "Rough range: a few weeks to a few months from opening the store. Some take longer; that is normal.",
    economics: [
      "Worked example: $60 price − $13.50 product − $4 shipping − about $1.80 fees = $40.70 kept before ads and returns.",
      "If you spend $30 on ads for that sale you still keep about $10. If you spend $50, you lose $9. Know this before you spend.",
    ],
    cash: [
      "Buy the smallest first batch your supplier allows, or test with samples, pre-orders or made-to-order before buying lots of stock.",
      "Use money you can afford to lose. Do not borrow on a credit card to buy stock you have not sold yet.",
    ],
    hiring: ["Nobody yet. You do everything so you learn every job."],
    channels: ["One channel only: organic social, or one small paid test (Meta is the usual first choice). Collect email sign-ups from day one."],
    ecosystem: [
      "Content: post on Instagram (and short video on Reels or TikTok) 3 to 5 times a week: how it's made, the product in use, you explaining why it exists.",
      "Creators: gift product to 5 to 10 small creators whose followers match your buyer. No payment, no pressure to post.",
      GIFTING,
      DISCLOSE,
      "Suppliers: ask for samples, the minimum order and the lead time in writing. A good supplier is your first partner.",
    ],
    adWall: "Not yet. At this stage the problem is usually the offer, not the ads.",
    mistakes: ["Building for months before showing anyone.", "Buying a big batch of stock before a single sale.", "Spending more on ads than an order earns."],
    sources: [],
  },
  2: {
    takes: [
      "About 17 orders at $60. Enough to spot which product, message and channel works.",
      "A daily habit of logging sales, ad spend and orders.",
    ],
    timeline: "Rough range: one to six months after the first sale.",
    economics: [
      "Break-even MER: with $34.70 kept per $60 order (after an estimated 10% for discounts and returns), ads can be up to about 58% of sales before you lose money. That 58% is your break-even MER; it means at least about $1.73 of sales per $1 of ads.",
      "Early ads are often near break-even while you learn. Aim to bring MER under 50% (more than $2 of sales per $1 of ads) as you find a winning ad.",
    ],
    cash: [
      "Put profit back into stock and the next ad test. Pay yourself later.",
      "Watch stock levels weekly so a winning product doesn't sell out while you wait for a reorder.",
    ],
    hiring: ["Still you. Maybe a friend helps pack orders on busy days."],
    channels: ["Stay on one main channel. Start a welcome email and an abandoned cart email."],
    ecosystem: [
      "Content: daily stories, 3 to 5 posts a week. Reshare every customer photo (with permission).",
      "Creators: keep gifting. Give anyone who posts a personal discount code so you can track sales.",
      GIFTING,
      DISCLOSE,
      "Community: reply to every comment and DM. Ask buyers what nearly stopped them buying.",
    ],
    adWall: "Rare at this level. If an ad stops working, try a new hook before raising budget.",
    mistakes: ["Changing everything at once so you don't know what worked.", "Discounting to get sales and training buyers to wait for a sale.", "Not tracking ad spend against profit."],
    sources: [],
  },
  3: {
    takes: [
      "A product people come back for or recommend, ads you refresh every week and email flows that sell without you.",
      "About 167 orders a month at $60, roughly 5 or 6 a day.",
    ],
    timeline: "Rough range: 6 to 24 months from the first sale. Many stores stop here or below, and that can still be a good side income.",
    economics: [
      "At a MER of 33% ($3 of sales per $1 of ads), $10,000 in sales needs about $3,333 of ads. Contribution after ads ≈ 58% − 33% = 25%, about $2,500, before team and tools.",
      "Repeat buyers: Shopify's customer reports let you see your returning customer rate; track it monthly.",
      "LTV:CAC: if a customer's profit over a year (LTV) is $60 and it cost $20 to win them (CAC), the ratio is 3:1, the level Shopify's guide calls healthy.",
    ],
    cash: [
      "Stock now ties up real money: 2 to 3 months of sales at cost is about $4,500 to $6,750 with the example product.",
      "Ask suppliers for a deposit and balance terms (for example part up front, rest on shipping), and pre-sell new colours or products before ordering.",
      "Start a cash buffer of one month of costs once profit is steady.",
    ],
    hiring: ["First help, part-time: a virtual assistant or freelancer for customer emails, or a freelance editor for ad videos."],
    channels: ["Main paid channel plus email flows (welcome, abandoned cart, after purchase). Test a second channel only once the first is profitable."],
    ecosystem: [
      "Content: post daily (one short video a day is a strong habit), batch-filmed once a week.",
      "Creators: pay a few UGC (user-generated content) creators for videos you can use as ads. Prices vary widely; a Helix estimate for small creators is $100 to $500 per video.",
      "Affiliates: give your best customers and creators a code and a commission on each sale (commonly 10% to 20% of sales, an estimate). Track every code.",
      GIFTING,
      "Disclosure: paid or gifted posts must be clearly labelled as ads. See the FTC guide and your local rules.",
    ],
    adWall: "The first wall often shows here: one winning ad fades after a few weeks. A steady flow of new creative is the fix.",
    mistakes: ["Scaling ad spend faster than stock can keep up.", "Relying on one ad or one creator.", "Ignoring email, which is the cheapest repeat sale you have."],
    sources: [SRC.shopifyReturning, SRC.ltvCac, SRC.ftc, SRC.influencer],
  },
  4: {
    takes: [
      "About 1,390 orders a month. Systems for ads, stock, customer service and books, and at least one person besides you.",
      "Profit you can count on month to month, not just good weeks.",
    ],
    timeline: "Rough range: 2 to 5 years from the first sale for stores that get here. Most stores do not.",
    economics: [
      "At a MER of 33%, $1M a year needs about $333k of ads. Contribution after ads ≈ 25% = $250k, before team and tools.",
      "Cash conversion cycle: days stock sits + days to get paid − days you take to pay suppliers. Example: 60 days of stock + 2 days to get paid − 30 days supplier terms = 32 days your cash is stuck.",
      "Contribution margin is the profit from each order after product, shipping, fees, returns and ads. Keep it positive on the first order if you are bootstrapping.",
    ],
    cash: [
      "Build a 13-week cash forecast. Profit on paper can still mean an empty bank account when a big stock order lands.",
      "Negotiate supplier terms (30 days or more) once you have a track record. Each extra day of terms frees cash.",
      "Avoid debt traps: revenue-based finance and merchant cash advances can cost far more than they look. Compare the total cost in dollars before signing.",
      "Keep a cash buffer of at least one to two months of running costs (Helix estimate).",
    ],
    hiring: ["In order (typical): customer service, then a creative or content person, then an operations/stock helper, with a bookkeeper on contract."],
    channels: ["Meta plus Google (search and shopping for people already looking). Email and SMS. Maybe a test of TikTok."],
    ecosystem: [
      "Content: daily posting with a simple calendar; one person owns it.",
      "Creators: an always-on programme of 10 to 30 creators a month (seeding plus a few paid), tracked by code and link.",
      "Brand collaborations: a limited product or giveaway with a non-competing brand that has the same buyer.",
      "PR and podcasts: pitch your founder story to niche podcasts and newsletters.",
      "3PL: hand packing to a warehouse partner when packing eats your week.",
    ],
    adWall: "Expect MER to rise (ads take a bigger share of sales) as spend rises. Use the warning signs below and step spend up gradually.",
    mistakes: ["Confusing sales with profit.", "Taking expensive finance to buy stock in a rush.", "Hiring friends without clear outcomes.", "Founder still doing every ad and every email."],
    sources: [SRC.ltvCac, SRC.ccc, SRC.cashGov],
  },
  5: {
    takes: [
      "A team that runs the day to day, owners for each key number, and a brand people search for by name.",
      "More than one way to win customers, so one channel getting expensive doesn't stall you.",
    ],
    timeline: "Rough range: often 4 to 10 years from the first sale. Only a small share of stores reach this level.",
    economics: [
      "At a MER of 33%, $10M a year needs about $3.3M of ads. One point of MER can swing profit by hundreds of thousands of dollars.",
      "Returning customers: track their share of sales monthly; growth here makes every ad dollar stretch further.",
      "LTV:CAC by channel: work it out per channel and per country, not just overall.",
    ],
    cash: [
      "Stock at 2 to 3 months is roughly $375k to $560k with the example product. A late shipment can cost a month of sales.",
      "A bank credit line arranged while things are good is cheaper and safer than emergency finance.",
      "Plan stock for the year with a monthly reforecast.",
    ],
    hiring: ["In order (typical): head of growth/marketing, operations and stock lead, finance lead (part-time CFO), creative team, retention (email/SMS) owner, customer experience lead."],
    channels: ["Meta, Google, TikTok, email and SMS. Add one at a time: a marketplace (such as Amazon), wholesale to selected shops, or one new country."],
    ecosystem: [
      "Content: a small in-house content team posting daily across platforms.",
      "Creators: micro to mid-size creators plus a few bigger names for launches; an ambassador or affiliate programme with tiers.",
      "Wholesale and retail partners: a few stores that fit the brand, with clear minimums and payment terms.",
      "Agencies: specialist agencies or freelancers for paid ads or email if you can't hire in-house; pay for outcomes you can measure.",
      "Community: events, a members' group or a loyalty programme.",
    ],
    adWall: "Paid ads alone rarely carry a brand from here. New channels, repeat buyers and brand demand do more of the work.",
    mistakes: ["Adding three channels at once.", "No owner for cash and stock.", "Letting discounts creep up to hit sales targets.", "Growing the team faster than profit."],
    sources: [SRC.shopifyReturning, SRC.ltvCac, SRC.ccc],
  },
  6: {
    takes: [
      "Several channels and countries, each with an owner, and leaders who run teams without you.",
      "Strong supplier relationships and terms, because stock and currency move profit as much as marketing.",
    ],
    timeline: "Rough range: often 7 to 15 years from the first sale, and very few stores get here. Some reach it faster with investors; bootstrapped brands usually take longer.",
    economics: [
      "At a MER of 33% across all channels, $50M needs about $16.7M of marketing. Retail and wholesale sales have lower margins but cost little in ads.",
      "Work out contribution per channel: a wholesale sale might keep less per unit but bring customers you could not reach online.",
    ],
    cash: [
      "Stock at 2 to 3 months is about $1.9M to $2.8M with the example product. Cutting a week of stock frees roughly $215k.",
      "Wholesale buyers often pay 30 to 60 days after delivery (estimate), so growing wholesale needs cash to bridge the gap.",
      "Currency hedging and stock finance become normal tools; get specialist advice.",
    ],
    hiring: ["Department heads for marketing, operations, finance, product and people; later a COO or general manager so the founder can focus on direction."],
    channels: ["Your store in several countries, retail partners, one or more marketplaces, and paid ads across Meta, Google and TikTok."],
    ecosystem: [
      "Distribution partners: distributors or retailers in new countries can grow faster than opening alone.",
      "Brand collaborations and limited drops with larger brands.",
      "PR team or agency; founder and leaders speak on podcasts and at events.",
      "Large creator and athlete or ambassador rosters with contracts and clear disclosure.",
    ],
    adWall: "The wall is real at this size: growth comes from new markets, new products and partners more than more ad budget.",
    mistakes: ["Entering several countries at once.", "Over-ordering stock on a hopeful forecast.", "Leaders without clear goals."],
    sources: [SRC.ccc],
  },
  7: {
    takes: [
      "A brand people seek out by name, in many channels and countries, run by a leadership team.",
      "Small gains compounding: a point of margin or repeat rate is worth about $1M a year here.",
    ],
    timeline: "Rough range: often 10 years or more from the first sale. Very few stores ever reach $100M a year; treat this as a direction, not a target date.",
    economics: [
      "At a MER of 33% across all channels, $100M needs about $33M of marketing. Paid ads at that size usually depend on strong brand demand and repeat buyers.",
      "Baymard's average documented cart abandonment rate is around 70%, so checkout fixes still matter at any size.",
    ],
    cash: [
      "Stock at 2 to 3 months is about $3.75M to $5.6M with the example product.",
      "At this size many brands use credit lines and supplier finance as normal tools; the bootstrap rule is that profit, not borrowing, pays for growth.",
    ],
    hiring: ["A full leadership team (CEO, CFO, COO, CMO and others) and specialists in each country and channel."],
    channels: ["Direct, retail, marketplaces and international, each with its own team and profit target."],
    ecosystem: [
      "Major retail and distribution partners in several countries.",
      "Brand partnerships, licensing and big creator or athlete deals.",
      "In-house content studio and community programmes.",
      "Long-term suppliers who grow with you, often with shared planning.",
    ],
    adWall: "Ads alone do not get here. Every brand above has had to find growth beyond paid ads.",
    mistakes: ["Losing the founder-level focus on the customer.", "Chasing growth that lowers margin every year.", "Not owning your customer data and ad accounts."],
    sources: [SRC.baymard],
  },
};
