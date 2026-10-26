/**
 * "My plan to grow today": 1 to 3 tasks picked from the user's own last 7 days.
 * Tasks use ids `grow-<rule>-<YYYY-MM-DD>` and are ticked off through the existing Done action (markDone ->
 * TaskCompletion), so they count toward the daily streak like every other Today task. A rule done in the
 * last 6 days is skipped, so the same advice is not repeated day after day.
 */
import type { DayInput } from "../scorecard";
import { addDays } from "../dates";
import type { StageId } from "../stages";
import type { Verdict } from "./core";

export type GrowRule = "numbers" | "conversion" | "weak-ads" | "scale" | "email" | "aov" | "review";
export type GrowTask = { rule: GrowRule; taskId: string; title: string; why: string; lesson: string; stage: StageId; minutes: number };

export const GROW_TASK_ID = /^grow-[a-z-]+-\d{4}-\d{2}-\d{2}$/;
const STAGE: Record<string, StageId> = { "13.5": "convert", "8.9": "attract", "8.13": "grow", "16.1": "convert", "17.1": "convert", "14.1": "convert" };

export function growPlan(i: { today: string; days: DayInput[]; verdict: Verdict; completedIds: string[]; max?: number }): GrowTask[] {
  const y = addDays(i.today, -1);
  const week = i.days.filter((d) => d.date > addDays(y, -7) && d.date <= y);
  const s = (f: (d: DayInput) => number) => week.reduce((a, d) => a + (f(d) || 0), 0);
  const sales = s((d) => d.revenue - d.discounts - d.refunds), orders = s((d) => d.orders), sessions = s((d) => d.sessions);
  const ads = s((d) => d.adMeta + d.adGoogle + d.adTiktok + d.adOther);
  const costs = s((d) => d.cogs + d.shipping + d.paymentFees + d.otherMarketing);
  const roas = ads ? sales / ads : null;
  const breakEven = sales > costs ? sales / (sales - costs) : null; // ROAS where profit is zero
  const cr = sessions ? (orders / sessions) * 100 : null;
  const recent = new Set(i.completedIds.filter((id) => id.startsWith("grow-") && id.slice(-10) > addDays(i.today, -7)).map((id) => id.slice(5, -11)));
  const out: GrowTask[] = [];
  const add = (rule: GrowRule, title: string, why: string, lesson: string, minutes = 15) => {
    if (out.length >= (i.max ?? 3) || recent.has(rule) || out.some((o) => o.rule === rule)) return;
    out.push({ rule, taskId: `grow-${rule}-${i.today}`, title, why, lesson, stage: STAGE[lesson] ?? "grow", minutes });
  };
  if (i.verdict === "no-data") add("numbers", "Add yesterday's numbers", "Helix can only tell you if you grew once it knows yesterday's sales.", "8.9", 2);
  if (roas !== null && breakEven !== null && roas < breakEven) add("weak-ads", "Pause your weakest ad and tighten spend", `Your ads brought back ${roas.toFixed(1)}x last week, under the ${breakEven.toFixed(1)}x you need to break even.`, "8.9");
  if (cr !== null && sessions >= 200 && cr < 1.5) add("conversion", "Fix your best seller's product page", `Only ${cr.toFixed(1)}% of visitors bought last week. Clearer photos, price and shipping info usually lift this.`, "13.5", 30);
  if (i.verdict === "yes" && roas !== null && breakEven !== null && roas >= breakEven * 1.3) add("scale", "Raise your best ad's budget by 10–20%", `You grew and ads returned ${roas.toFixed(1)}x. Scale gently so results stay steady.`, "8.13", 10);
  if (i.verdict === "no" || i.verdict === "not-yet") add("email", "Send one short email to your list", "A slower day is a good day to remind past customers you exist. It costs nothing.", "16.1", 20);
  if (orders >= 5 && sales / orders < 60) add("aov", "Add a simple bundle or 'add one more' offer", `Your average order is $${Math.round(sales / orders)}. A bundle lifts it without more ad spend.`, "14.1", 20);
  add("review", "Spend 10 minutes on yesterday's numbers", "Look at what sold and what each channel cost. Small daily checks add up.", "8.9", 10);
  return out;
}
