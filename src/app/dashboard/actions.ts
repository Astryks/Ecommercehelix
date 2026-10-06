"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import {
  completeTask, createApproval, decideApproval, getAccount, getDays, saveSettings, upsertDays, clearExampleData, addProductLine, addSeasonPlan, saveProfile,
} from "@/lib/repo";
import { seasonalAlerts, SEASON_TASK_ID, toCountry } from "@/lib/seasons";
import { toTrack } from "@/lib/tracks";
import { isoDay } from "@/lib/dates";
import { findActionable } from "@/lib/actionable";
import { PLAN_RANK } from "@/lib/plans";
import { NUM_FIELDS, parseCsv, type DayInput } from "@/lib/scorecard";
import { signalsFor } from "@/lib/signals";
import { costRatios, quickMerge } from "@/lib/today";
import { createPausedDraft, draftInputFor } from "@/lib/meta/service";
import { campaignParams, draftNames, starterCopy } from "@/lib/meta/drafts";
import { logAudit } from "@/lib/meta/store";

const VALID_ID = /^(day-\d{1,3}|start-\d{1,3}|insight-[a-z-]+|flow-[a-z-]+|build-[a-z-]+)$/;

export async function markDone(form: FormData) {
  const u = await requireUser();
  const taskId = String(form.get("taskId"));
  if (VALID_ID.test(taskId) || SEASON_TASK_ID.test(taskId)) await completeTask(u.id, taskId);
  revalidatePath("/dashboard", "layout");
}

/** The "daily numbers" day in the user's track: Growing day 2, Just starting day 14. */
async function numbersHabitTask(userId: string) {
  return (await getAccount(userId)).track === "starting" ? "start-21" : "day-2";
}

/** One click: add a seasonal prep plan (its tasks then show on Today with due dates). */
export async function addPrepPlan(form: FormData) {
  const u = await requireUser();
  const key = String(form.get("planKey"));
  const acct = await getAccount(u.id);
  if (!seasonalAlerts(isoDay(), acct.country).some((a) => a.key === key)) return;
  await addSeasonPlan(u.id, key);
  await logAudit(u.id, { actor: "user", action: "season.plan_added", target: key, outcome: "ok" });
  revalidatePath("/dashboard", "layout");
}

export async function doItForMe(form: FormData) {
  const u = await requireUser();
  const { signals } = await signalsFor(u.id);
  const item = findActionable(String(form.get("taskId")), signals);
  if (!item) return;
  const acct = await getAccount(u.id);
  if (PLAN_RANK[acct.plan] < PLAN_RANK[item.tier]) redirect("/dashboard/billing?need=" + item.tier);
  let detail = item.detail;
  if (item.id === "build-meta-campaign") {
    const { input, missing } = await draftInputFor(u.id);
    if (!input) redirect("/dashboard/integrations?need=" + encodeURIComponent(missing.join(",")));
    const n = draftNames(input);
    const budget = campaignParams(input).daily_budget;
    detail =
      `Helix will create these in ${input.adAccountId}, all PAUSED:\n` +
      `1. Campaign "${n.campaign}": Sales objective, ${input.currency} ${input.dailyBudget}/day campaign budget (${budget} in Meta's smallest currency unit), lowest cost bidding.\n` +
      `2. Ad set "${n.adset}": ${input.country}, 18+, Advantage+ audience, automatic placements, optimising for purchases on your pixel.\n` +
      `3. Three ads linking to ${input.storeUrl} with tracking tags:\n` +
      starterCopy(input.storeUrl).map((c, i) => `   ${i + 1}. "${c.headline}": ${c.primary}`).join("\n") +
      `\n\nThe copy is a starting point. Edit it and add your images or videos in Ads Manager, then press Launch yourself. Helix never turns on spend or changes live budgets.`;
  }
  await createApproval(u.id, { taskId: item.id, title: item.title, detail, estAiCost: item.estAiCost });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/approvals");
}

export async function decide(form: FormData) {
  const u = await requireUser();
  const status = form.get("decision") === "approve" ? "approved" : "rejected";
  const id = String(form.get("id"));
  const taskId = await decideApproval(u.id, id, status);
  if (taskId) await logAudit(u.id, { actor: "user", action: `approval.${status}`, target: taskId, outcome: "ok" });
  if (status === "approved" && taskId) {
    if (taskId === "build-meta-campaign") await createPausedDraft(u.id, id);
    await completeTask(u.id, taskId);
  }
  revalidatePath("/dashboard", "layout");
}

export async function saveScorecardSettings(form: FormData) {
  const u = await requireUser();
  const n = (k: string, d: number) => Math.max(0, Number(form.get(k)) || d);
  await saveSettings(u.id, {
    monthlyRevenueTarget: n("monthlyRevenueTarget", 60000),
    targetMerPct: Math.min(100, n("targetMerPct", 30)),
    fixedCostsMonthly: n("fixedCostsMonthly", 0),
  });
  revalidatePath("/dashboard/scorecard");
}

export async function saveDay(form: FormData) {
  const u = await requireUser();
  const date = String(form.get("date"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const d = { date, source: "manual" } as DayInput;
  for (const f of NUM_FIELDS) d[f] = Math.max(0, Number(form.get(f)) || 0);
  await upsertDays(u.id, [d]);
  await completeTask(u.id, await numbersHabitTask(u.id));
  revalidatePath("/dashboard", "layout");
}

/** The one quick form on Today: yesterday's sales, orders and ad spend. Costs are estimated from recent history. */
export async function quickUpdate(form: FormData) {
  const u = await requireUser();
  const date = String(form.get("date"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const n = (k: string) => Math.max(0, Number(form.get(k)) || 0);
  const days = await getDays(u.id);
  const merged = quickMerge(days.find((d) => d.date === date), date, { revenue: n("revenue"), orders: Math.round(n("orders")), adMeta: n("adMeta"), adGoogle: n("adGoogle") }, costRatios(days));
  await upsertDays(u.id, [merged]);
  await completeTask(u.id, await numbersHabitTask(u.id));
  revalidatePath("/dashboard", "layout");
}

export async function importCsv(form: FormData) {
  const u = await requireUser();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 1_000_000) return;
  const days = parseCsv(await file.text());
  if (days.length) await upsertDays(u.id, days);
  revalidatePath("/dashboard/scorecard");
}

export async function clearExamples() {
  const u = await requireUser();
  await clearExampleData(u.id);
  revalidatePath("/dashboard/scorecard");
}

export async function addProduct(form: FormData) {
  const u = await requireUser();
  const sku = String(form.get("sku") ?? "").trim().slice(0, 40);
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  if (!sku || !name) return;
  await addProductLine(u.id, {
    date: String(form.get("date") ?? ""),
    sku, name,
    units: Math.max(0, Math.round(Number(form.get("units")) || 0)),
    price: Math.max(0, Number(form.get("price")) || 0),
    unitCost: Math.max(0, Number(form.get("unitCost")) || 0),
  });
  revalidatePath("/dashboard/scorecard");
}

/** Settings: switch track (Just starting / Growing) and country. Progress on each track is kept. */
export async function saveProfileSettings(form: FormData) {
  const u = await requireUser();
  await saveProfile(u.id, { track: toTrack(form.get("track")), country: toCountry(form.get("country")), onboarded: true });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/settings?saved=1");
}
