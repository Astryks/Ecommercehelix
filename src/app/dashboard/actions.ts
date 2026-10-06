"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import {
  completeTask, createApproval, decideApproval, getAccount, saveSettings, upsertDays, clearExampleData, addProductLine,
} from "@/lib/repo";
import { findActionable } from "@/lib/actionable";
import { PLAN_RANK } from "@/lib/plans";
import { NUM_FIELDS, parseCsv, type DayInput } from "@/lib/scorecard";

const VALID_ID = /^(day-\d{1,3}|insight-[a-z-]+|flow-[a-z-]+|build-[a-z-]+)$/;

export async function markDone(form: FormData) {
  const u = await requireUser();
  const taskId = String(form.get("taskId"));
  if (VALID_ID.test(taskId)) await completeTask(u.id, taskId);
  revalidatePath("/dashboard", "layout");
}

export async function doItForMe(form: FormData) {
  const u = await requireUser();
  const item = findActionable(String(form.get("taskId")));
  if (!item) return;
  const acct = await getAccount(u.id);
  if (PLAN_RANK[acct.plan] < PLAN_RANK[item.tier]) redirect("/dashboard/billing?need=" + item.tier);
  await createApproval(u.id, { taskId: item.id, title: item.title, detail: item.detail, estAiCost: item.estAiCost });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/approvals");
}

export async function decide(form: FormData) {
  const u = await requireUser();
  const status = form.get("decision") === "approve" ? "approved" : "rejected";
  const taskId = await decideApproval(u.id, String(form.get("id")), status);
  if (status === "approved" && taskId) await completeTask(u.id, taskId);
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
  await completeTask(u.id, "day-2");
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
