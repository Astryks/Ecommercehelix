import type { Goals } from "./goals";
import type { TrackId } from "./tracks";

/**
 * The onboarding questions. All multiple choice, about 2 minutes. Answers map to one
 * bottleneck and a starting goal (first match wins). Profit setup always comes first.
 * Pure, so it is tested.
 */
export type QId = "revenue" | "margin" | "source" | "visitors" | "cr" | "aov" | "repeat" | "adSpend" | "offer" | "hours";
export type Question = { id: QId; q: string; help?: string; options: { v: string; label: string }[] };

export const QUESTIONS: Question[] = [
  { id: "revenue", q: "About how much do you sell in a month?", help: "In your own currency. A rough guess is fine.", options: [{ v: "none", label: "Nothing yet" }, { v: "lt5k", label: "Under 5k" }, { v: "5-20k", label: "5k to 20k" }, { v: "20-80k", label: "20k to 80k" }, { v: "80k+", label: "Over 80k" }] },
  { id: "margin", q: "After paying for the product and shipping, how much of each sale do you keep?", help: "This is your gross margin. Not sure is a fine answer.", options: [{ v: "lt40", label: "Under 40%" }, { v: "40-60", label: "40 to 60%" }, { v: "60+", label: "Over 60%" }, { v: "dk", label: "Not sure" }] },
  { id: "source", q: "Where do most of your visitors come from?", options: [{ v: "ads", label: "Paid ads" }, { v: "social", label: "Free social posts" }, { v: "google", label: "Google search" }, { v: "email", label: "Email" }, { v: "wom", label: "Word of mouth" }, { v: "dk", label: "Not sure" }] },
  { id: "visitors", q: "About how many visits does your store get in a month?", help: "Shopify shows this as Sessions in Analytics.", options: [{ v: "lt1k", label: "Under 1,000" }, { v: "1-5k", label: "1,000 to 5,000" }, { v: "5-20k", label: "5,000 to 20,000" }, { v: "20k+", label: "Over 20,000" }, { v: "dk", label: "Not sure" }] },
  { id: "cr", q: "Out of every 100 visits, how many buy?", help: "This is your conversion rate. Shopify shows it in Analytics.", options: [{ v: "lt1", label: "Less than 1" }, { v: "1-2", label: "1 to 2" }, { v: "2-3", label: "2 to 3" }, { v: "3+", label: "More than 3" }, { v: "dk", label: "Not sure" }] },
  { id: "aov", q: "How much does a customer spend in one order, on average?", help: "Your average order value.", options: [{ v: "lt40", label: "Under 40" }, { v: "40-80", label: "40 to 80" }, { v: "80-150", label: "80 to 150" }, { v: "150+", label: "Over 150" }] },
  { id: "repeat", q: "How many of your orders come from people who bought before?", options: [{ v: "lt10", label: "Under 10%" }, { v: "10-25", label: "10 to 25%" }, { v: "25+", label: "Over 25%" }, { v: "dk", label: "Not sure" }] },
  { id: "adSpend", q: "How much do you spend on ads in a month?", options: [{ v: "0", label: "Nothing" }, { v: "lt1k", label: "Under 1k" }, { v: "1-5k", label: "1k to 5k" }, { v: "5k+", label: "Over 5k" }] },
  { id: "offer", q: "What do you sell?", options: [{ v: "single", label: "One main product" }, { v: "range", label: "A range of products" }, { v: "sub", label: "A subscription" }] },
  { id: "hours", q: "How many hours a week can you give this?", help: "We set the pace of your plan to fit.", options: [{ v: "1-2", label: "1 to 2 hours" }, { v: "3-5", label: "3 to 5 hours" }, { v: "6+", label: "6 or more" }] },
];

export type Answers = Partial<Record<QId, string>>;
export type BottleneckId = "profit-leak" | "no-traffic" | "not-converting" | "costly-ads" | "small-orders" | "leaky-bucket" | "ready-to-scale";
export type Diagnosis = {
  answers: Answers;
  bottleneck: BottleneckId;
  /** Plain one-liner, quoting their answers. */
  sentence: string;
  /** Course goal id to start with after the profit dashboard. */
  startGoal: string;
  stage: "numbers" | "attract" | "convert" | "grow";
  /** Weeks the 12-week plan stretches to, from hours per week. */
  weeks: number;
  track: TrackId;
};

export const BOTTLENECKS: Record<BottleneckId, { name: string; goalLabel: string }> = {
  "profit-leak": { name: "Profit leak", goalLabel: "Know and fix your margin" },
  "no-traffic": { name: "Not enough visitors", goalLabel: "Attract: your first steady traffic and an email list" },
  "not-converting": { name: "Your site isn't turning visits into sales", goalLabel: "Convert: product page, trust and shipping clarity" },
  "costly-ads": { name: "Paying too much for each customer", goalLabel: "Key numbers: your cost-per-sale limits, then better ads" },
  "small-orders": { name: "Orders are too small", goalLabel: "Convert: bigger orders with bundles and a free shipping amount" },
  "leaky-bucket": { name: "Customers don't come back", goalLabel: "Grow: email flows and repeat customers" },
  "ready-to-scale": { name: "Ready to scale", goalLabel: "Attract: grow your best channel" },
};

const label = (id: QId, v?: string) => QUESTIONS.find((q) => q.id === id)?.options.find((o) => o.v === v)?.label.toLowerCase() ?? "not sure";

export const toAnswers = (f: FormData | Record<string, unknown>): Answers => {
  const get = (k: string) => (f instanceof FormData ? f.get(k) : f[k]);
  const out: Answers = {};
  for (const q of QUESTIONS) {
    const v = String(get(q.id) ?? "");
    if (q.options.some((o) => o.v === v)) out[q.id] = v;
  }
  return out;
};

export function diagnose(a: Answers): Diagnosis {
  const crLow = a.cr === "lt1" || a.cr === "1-2";
  const crOk = a.cr === "2-3" || a.cr === "3+";
  const thinMargin = a.margin === "lt40" || a.margin === "40-60";
  const bigVisits = a.visitors === "5-20k" || a.visitors === "20k+";
  const smallRev = a.revenue === "none" || a.revenue === "lt5k";
  const bigRev = a.revenue === "20-80k" || a.revenue === "80k+";
  const spend = a.adSpend === "1-5k" || a.adSpend === "5k+";
  let b: BottleneckId;
  let sentence: string;
  if (a.margin === "dk" || a.margin === "lt40" || !a.margin) {
    b = "profit-leak";
    sentence = a.margin === "lt40" ? "You keep under 40% of each sale after product and shipping, so ads and growth can easily lose money. We fix that first." : "You're not sure how much of each sale you keep, so we can't yet tell if growth makes or loses money. We work that out first.";
  } else if (smallRev && (a.visitors === "lt1k" || a.visitors === "dk" || !a.visitors)) {
    b = "no-traffic";
    sentence = `You sell ${label("revenue", a.revenue)} a month with ${label("visitors", a.visitors)} visits. You need more of the right people seeing your store.`;
  } else if (bigVisits && (a.cr === "lt1" || (a.cr === "1-2" && a.visitors === "20k+"))) {
    b = "not-converting";
    sentence = `You get ${label("visitors", a.visitors)} visits a month but ${label("cr", a.cr)} in 100 buy. Fixing the site turns visits you already have into sales.`;
  } else if (spend && crOk && thinMargin) {
    b = "costly-ads";
    sentence = `You spend ${label("adSpend", a.adSpend)} a month on ads and your margin is ${label("margin", a.margin)}, so each customer may cost more than they leave you.`;
  } else if (a.aov === "lt40" && thinMargin) {
    b = "small-orders";
    sentence = `Orders average ${label("aov", a.aov)} and you keep ${label("margin", a.margin)}, so there's little left to pay for ads. Bigger orders fix that.`;
  } else if (a.repeat === "lt10" && bigRev) {
    b = "leaky-bucket";
    sentence = `You sell ${label("revenue", a.revenue)} a month but under 10% of orders are repeat customers. Bringing buyers back is your cheapest growth.`;
  } else {
    b = "ready-to-scale";
    sentence = "Your numbers look healthy. The next step is to grow your best channel without losing profit.";
  }
  if (crLow && b === "ready-to-scale") b = "not-converting";
  const start: Record<BottleneckId, [string, Diagnosis["stage"]]> = {
    "profit-leak": ["key-numbers", "numbers"], "no-traffic": [smallRev && a.revenue === "none" ? "first-100-visits" : "1000-visits", "attract"],
    "not-converting": ["conversion-2-5", "convert"], "costly-ads": ["key-numbers", "numbers"], "small-orders": ["aov-plus-10", "convert"],
    "leaky-bucket": ["email-flows", "grow"], "ready-to-scale": ["1000-visits", "attract"],
  };
  const track: TrackId = smallRev ? "starting" : "growing";
  const [firstGoal, stage] = start[b];
  let startGoal = firstGoal;
  if (track === "starting" && startGoal === "1000-visits") startGoal = "first-100-visits";
  if (track === "starting" && startGoal === "aov-plus-10") startGoal = "add-to-cart-8";
  return { answers: a, bottleneck: b, sentence, startGoal, stage, weeks: a.hours === "1-2" ? 24 : 12, track };
}

const MID: Record<string, number> = { lt1k: 600, "1-5k": 3000, "5-20k": 12000, "20k+": 30000, lt1: 0.8, "1-2": 1.5, "2-3": 2.5, "3+": 3.5, lt40: 30, "40-80": 60, "80-150": 110, "150+": 180 };

/** Goals prefilled from the answers: a modest step up from where they are. */
export function goalsFromDiagnosis(a: Answers, base: Goals): Goals {
  const g = { ...base };
  if (a.visitors && MID[a.visitors]) g.sessions = Math.round(MID[a.visitors] * 1.2);
  if (a.cr && MID[a.cr]) g.crPct = Math.round(Math.min(4, MID[a.cr] + 0.4) * 10) / 10;
  if (a.aov && MID[a.aov]) g.aov = Math.round(MID[a.aov] * 1.1);
  return g;
}
