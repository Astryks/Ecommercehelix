import type { BottleneckId, Diagnosis } from "./diagnosis";
import type { PlanId } from "./plans";

/**
 * The personal 12-week plan. Profit first (week 1), key numbers (week 2), the top store
 * fixes (weeks 3 to 4), then the sprints in the order the diagnosis says, and a review
 * in week 12. With 1 to 2 hours a week, every block takes twice as long (24 weeks).
 * Pure, so it is tested.
 */
export type Block = { id: string; weeks: [number, number]; title: string; what: string; href: string; tier: PlanId; step1: string; minutes: number };

const BLOCKS: Record<string, Omit<Block, "weeks">> = {
  profit: { id: "profit", title: "Set up your profit dashboard", what: "Your costs, your margin and your real profit per order.", href: "/dashboard/profit", tier: "free", step1: "Set up your profit dashboard", minutes: 10 },
  numbers: { id: "numbers", title: "Your key numbers baseline", what: "Conversion rate, order value, ad cost and repeat customers, so you can see progress.", href: "/dashboard/metrics", tier: "free", step1: "Write down your key numbers", minutes: 10 },
  fixes: { id: "fixes", title: "Fix the top store issues", what: "The top fixes from your store check, product page and cart first.", href: "/dashboard/insights", tier: "free", step1: "Do fix #1 from your store check", minutes: 20 },
  convert: { id: "convert", title: "Convert: turn more visits into sales", what: "Shipping clarity, reviews near the price, and answers to buyers' worries.", href: "lesson:14.10", tier: "starter", step1: "Put your shipping message under the price", minutes: 15 },
  attract: { id: "attract", title: "Attract: more of the right visitors", what: "Your first or a better traffic source, plus an email sign-up offer.", href: "lesson:8.1", tier: "starter", step1: "Pick one traffic source to focus on", minutes: 15 },
  aov: { id: "aov", title: "Bigger orders", what: "A bundle and a free shipping amount a little above your average order.", href: "lesson:14.9", tier: "starter", step1: "Make one bundle from your best sellers", minutes: 20 },
  grow: { id: "grow", title: "Grow: bring customers back", what: "Welcome, abandoned checkout and after-purchase emails.", href: "/dashboard/email", tier: "growth", step1: "Turn on your welcome emails", minutes: 20 },
  review: { id: "review", title: "Review and plan the next 12 weeks", what: "Compare your numbers with week 2 and pick the next bottleneck.", href: "/dashboard/progress", tier: "free", step1: "Compare this week with your week 2 numbers", minutes: 15 },
};

/** Order of the four 2-week sprints in weeks 5 to 11, by bottleneck. The last one is 1 week. */
const SPRINTS: Record<BottleneckId, string[]> = {
  "profit-leak": ["aov", "convert", "attract", "grow"],
  "no-traffic": ["attract", "convert", "aov", "grow"],
  "not-converting": ["convert", "aov", "attract", "grow"],
  "costly-ads": ["convert", "attract", "aov", "grow"],
  "small-orders": ["aov", "convert", "attract", "grow"],
  "leaky-bucket": ["grow", "convert", "aov", "attract"],
  "ready-to-scale": ["attract", "convert", "aov", "grow"],
};

export function buildPlan(d: Pick<Diagnosis, "bottleneck" | "weeks">): Block[] {
  const k = d.weeks >= 24 ? 2 : 1;
  const order = ["profit", "numbers", "fixes", ...SPRINTS[d.bottleneck], "review"];
  const lengths = [1, 1, 2, 2, 2, 2, 1, 1];
  let w = 1;
  return order.map((id, i) => {
    const len = lengths[i] * k;
    const b: Block = { ...BLOCKS[id], weeks: [w, w + len - 1] };
    w += len;
    return b;
  });
}

/** Week number of the plan for a date (1-based, capped at the plan length). */
export function weekOf(startIso: string, todayIso: string, total: number): number {
  const days = Math.floor((Date.parse(todayIso.slice(0, 10) + "T12:00:00Z") - Date.parse(startIso.slice(0, 10) + "T12:00:00Z")) / 86_400_000);
  return Math.min(total, Math.max(1, Math.floor(days / 7) + 1));
}

export type PlanProgress = { profitSaved: boolean; numbersSaved: boolean; fixesDone: boolean };

/**
 * The block you are on: the first unfinished of the early blocks (profit, numbers, fixes),
 * otherwise the block for this week. Profit always comes first.
 */
export function currentBlock(plan: Block[], week: number, p: PlanProgress): Block {
  if (!p.profitSaved) return plan[0];
  if (!p.numbersSaved) return plan[1];
  if (!p.fixesDone && week <= plan[2].weeks[1]) return plan[2];
  return plan.find((b) => week >= b.weeks[0] && week <= b.weeks[1]) ?? plan[plan.length - 1];
}

export const totalWeeks = (plan: Block[]) => plan[plan.length - 1].weeks[1];
