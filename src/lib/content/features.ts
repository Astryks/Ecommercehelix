/** Public landing pages for what Helix actually does today. Facts only: see STATUS.md before adding claims. */
export type Feature = {
  slug: string;
  name: string;
  serviceType: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { h2: string; body: string[]; list?: string[] }[];
  plan: string;
  guides: string[];
  faq: { q: string; a: string }[];
};

export const FEATURES: Feature[] = [
  {
    slug: "profit-dashboard",
    name: "E-commerce profit dashboard",
    serviceType: "E-commerce profit tracking",
    title: "E-commerce Profit Dashboard: Know Your Real Profit Daily",
    description: "See your online store's real profit every morning: profit per order and per month, cost by cost, with a break-even ad cost per sale. Free on E-commerce Helix.",
    h1: "An e-commerce profit dashboard that shows what you actually keep",
    intro: "Sales and followers look good on a screen. Profit is what pays you. The Helix profit dashboard turns your daily numbers into one clear figure each morning, so you can grow sales without quietly losing money.",
    sections: [
      { h2: "What the profit dashboard shows", body: ["You add yesterday's sales, orders and ad spend by hand or by CSV in about two minutes. If you connect Meta, your ad spend comes in automatically. Helix then works out profit per order and per month, cost by cost."], list: ["Profit yesterday, compared with your recent average", "Profit per order and per month, broken down by cost", "A key metrics panel and a marketing percentage guide", "A growth chart by day and week"] },
      { h2: "Your break-even cost per sale", body: ["From your own prices and costs, Helix works out the most you can pay in ads for one sale and still make money. That line tells you when an ad is profitable, when to give it more budget and when to stop.", "This is the number most store owners never calculate, and it is the one that decides whether scaling ads grows your profit or burns it."] },
      { h2: "Why a daily habit beats a monthly report", body: ["Small leaks become big ones when you only look once a month. A two-minute morning check catches a rising ad cost, a slow product or a missing shipping charge while it is still cheap to fix. Each morning also comes with one small task to improve the number."] },
    ],
    plan: "The profit dashboard is part of the Free plan.",
    guides: ["break-even-roas-explained", "how-to-scale-a-dtc-brand-profitably"],
    faq: [
      { q: "Do I need to connect my store to use the profit dashboard?", a: "No. You can add your daily numbers by hand or by CSV. Meta can be connected so ad spend is pulled in each morning. Shopify, Google Ads and Klaviyo connections are planned next." },
      { q: "Is the profit dashboard free?", a: "Yes. The profit dashboard, daily numbers, key metrics panel and growth chart are all on the Free plan." },
    ],
  },
  {
    slug: "meta-ads",
    name: "Meta ads for e-commerce",
    serviceType: "Facebook and Instagram advertising for online stores",
    title: "Meta Ads for E-commerce Stores, Built as Paused Drafts",
    description: "Run Facebook and Instagram ads for your online store with a break-even target. Helix syncs your Meta results daily and builds campaigns as paused drafts you launch.",
    h1: "Facebook and Instagram ads for your store, with a safe limit on every dollar",
    intro: "Meta (Facebook and Instagram) is still how most online stores find new customers. The winners do the basics well, every day. Helix helps you do exactly that, without handing over control of your ad account.",
    sections: [
      { h2: "How Helix works with your Meta ad account", body: ["Connect Meta and Helix reads your results each morning. When you ask, it builds new campaigns inside your own ad account as paused drafts. You review them and press Launch yourself, and every budget change on a live campaign stays yours to make."], list: ["Daily ad sync into your profit dashboard", "Campaigns built as paused drafts, never launched for you", "Ad openings and creator briefs written for testing", "Every test graded against your break-even cost per sale"] },
      { h2: "Why small ad tests fail", body: ["Meta needs enough sales to learn who buys from you. A tiny budget, or switching ads off after three days, means it never gets there. Helix tells you what a fair test costs at your prices before you spend a dollar."] },
      { h2: "Learn it as you go", body: ["Lessons such as \"Launch your first Meta ad in 30 minutes\" and \"Find your way around Ads Manager\" walk you through every click, with drawings of where to click and what to do if your screen looks different."] },
    ],
    plan: "Meta connection and paused-draft campaigns are on the Starter and Growth plans. The lessons are free to read.",
    guides: ["break-even-roas-explained", "how-to-scale-a-dtc-brand-profitably"],
    faq: [
      { q: "Will Helix spend money on my ad account?", a: "No. Campaigns are created as paused drafts. You review and launch them yourself, and budget changes on live campaigns are yours to make." },
      { q: "Does Helix run Google Ads too?", a: "Google Ads is guidance only for now: a step-by-step Performance Max and Search setup on the Growth plan. A Google Ads connection is coming." },
    ],
  },
  {
    slug: "email-automation",
    name: "E-commerce email and SMS flows",
    serviceType: "E-commerce email marketing and retention",
    title: "E-commerce Email Flows: Abandoned Cart, Welcome & Retention",
    description: "The email and SMS flows that bring shoppers back: welcome, abandoned checkout and cart, post-purchase, win-back and VIP. Full draft copy and timing, ready to paste into your email platform.",
    h1: "Email and SMS flows that bring shoppers back, written and ready to paste",
    intro: "Email is usually the cheapest sale you will ever make, because the customer already knows you. Helix lists the flows most stores need, with the timing, discount rules and every message written out, so you can paste them into Klaviyo or Shopify Email.",
    sections: [
      { h2: "The flows every store should have", body: ["Helix compares your setup against a core set of automated flows and suggests the ones you are missing, with the reason."], list: ["Welcome series for new subscribers", "Abandoned checkout and abandoned cart reminders", "Browse abandonment for undecided shoppers", "Post-purchase and review requests", "Replenishment for consumable products", "Win-back for lapsed customers", "VIP and loyalty for your best buyers"] },
      { h2: "Copy you paste, not a black box", body: ["Each flow comes with the trigger, the exit rule, the discount rule and every message. You copy it into your email platform and switch it on yourself. Helix does not connect to Klaviyo or Shopify Email yet."] },
      { h2: "Prefer to do it yourself?", body: ["Every flow can also be built by hand with the step-by-step email lessons in the Helix Playbook."] },
    ],
    plan: "Ready-to-paste copy for all 9 flows is on the Growth plan. The email lessons are free to read.",
    guides: ["email-flows-every-store-needs", "how-to-reduce-cart-abandonment"],
    faq: [
      { q: "Which email platforms does Helix work with?", a: "Any platform you can paste into, such as Klaviyo or Shopify Email. Helix does not connect to them yet, so you set up the flow yourself using the copy and steps it gives you." },
      { q: "Will Helix send emails to my customers without asking?", a: "No. Helix never sends emails. You switch flows on in your own email platform." },
    ],
  },
  {
    slug: "daily-growth-plan",
    name: "Daily e-commerce growth plan",
    serviceType: "E-commerce growth app",
    title: "E-commerce Growth Plan: One Clear Task a Day",
    description: "A daily e-commerce growth plan for store owners: one short lesson and one clear task a day, about 15 minutes, ordered for your stage from first sale to scaling.",
    h1: "A daily e-commerce growth plan, one 15-minute task at a time",
    intro: "Most store owners know they should be doing more. The hard part is knowing what to do next. Helix gives you one short lesson and one clear task each day, explained step by step, in the order your store needs.",
    sections: [
      { h2: "Built around three stages: Attract, Convert, Grow", body: ["Attract brings the right people to your store with ads, creative, content and social. Convert turns visits into sales with a strong offer, a store people trust, a smooth checkout and emails that bring them back. Grow helps you keep more of every sale and scale it."] },
      { h2: "A course that matches your stage", body: ["Pick Just starting or Growing when you sign up. Helix is built for stores doing about $10k to $100k a month that want to reach a $1M year profitably, and it also works from your very first sale. Goals start with your profit dashboard and your numbers, then move through traffic, email list, add to cart, conversion and order value, then margin, returning customers and scaling."] },
      { h2: "Do it yourself, or tap \"Do it for me\"", body: ["Every task has numbered steps and simple drawings. On paid plans, Helix builds Meta campaigns for you as paused drafts. Everything else is a clear checklist you follow."] },
    ],
    plan: "The first goals are free. Attract and Convert goals are on Starter, and the full course, including Grow and Run goals, 90-day plans and team playbooks, is on Growth.",
    guides: ["shopify-growth-checklist", "when-to-hire-an-ecommerce-consultant"],
    faq: [
      { q: "How long does the daily task take?", a: "About 15 minutes for the lesson and task, plus about two minutes to add yesterday's numbers." },
      { q: "Is this an agency, a consultant or a course?", a: "Neither. Helix is self-serve software that guides you to grow your store yourself: lessons, a daily plan and in-app tools, plus Meta campaigns built as paused drafts." },
    ],
  },
  {
    slug: "black-friday-plan",
    name: "Black Friday and seasonal plans",
    serviceType: "E-commerce seasonal promotion planning",
    title: "Black Friday Plan for E-commerce Stores (BFCM Checklist)",
    description: "A 12-week Black Friday and Cyber Monday plan for online stores: profit target, offer, list building, build-up, sale days and finish, with every step dated on your calendar.",
    h1: "A Black Friday plan that protects your profit",
    intro: "The biggest week of the year is won weeks before it starts, and a bad offer can wipe out your profit. Helix puts a 12-week Black Friday and Cyber Monday plan on your calendar and checks the profit on every offer.",
    sections: [
      { h2: "The 12-week plan", body: ["The plan starts on 1 August and puts every step on your Today list and calendar on the right date."], list: ["Set a profit target", "Pick an offer that keeps your margin", "Build your email and SMS list before the sale", "Warm up audiences and finalise ads in October", "Run the sale days, then finish calmly"] },
      { h2: "Christmas, Valentine's and Mother's Day too", body: ["Seasonal plans cover gift guides, bundles, gift cards and delivery cut-off dates, and favour a free gift with purchase over a store-wide discount so you keep more profit."] },
    ],
    plan: "The Black Friday plan is free to start. Seasonal prep plans with due dates on Today are on the Starter and Growth plans.",
    guides: ["how-to-increase-ecommerce-conversion-rate", "email-flows-every-store-needs"],
    faq: [
      { q: "When should I start planning for Black Friday?", a: "Helix starts the plan on 1 August. October is the build month: finalise ads, warm up audiences, build emails and load stock." },
    ],
  },
  {
    slug: "store-audit",
    name: "E-commerce store audit and conversion rate optimisation",
    serviceType: "Conversion rate optimisation",
    title: "E-commerce Store Audit & Conversion Rate Optimisation",
    description: "Paste your store link and Helix reads your home page and a product page, then lists the fixes most likely to make you money, quoting your own pages.",
    h1: "A store audit that turns into conversion fixes you can do today",
    intro: "Paste your store link. Helix reads your home page, a product page and your cart with plain page reads, no AI, and lists the top fixes, quoting what it saw.",
    sections: [
      { h2: "What the audit looks at", body: ["Page titles and descriptions, phone fit, page weight, product description length and photos, reviews near the price, shipping and returns messages, your free shipping amount against your typical price, express payments, email sign-up tools and tracking pixels seen in your page source."] },
      { h2: "From audit to action", body: ["Findings become tasks on your Today list, each with the reason and step-by-step instructions. A typical example: set a free-shipping amount a little above your average order."] },
    ],
    plan: "A one-off store check is on the Free plan. A monthly re-check that shows what changed is on Starter and Growth.",
    guides: ["how-to-increase-ecommerce-conversion-rate", "how-to-reduce-cart-abandonment", "ecommerce-seo-basics"],
    faq: [
      { q: "Does Helix change my store automatically?", a: "No. Helix never edits your store. It tells you what to fix and how." },
    ],
  },
];

export const featureBySlug = (slug: string) => FEATURES.find((f) => f.slug === slug);
