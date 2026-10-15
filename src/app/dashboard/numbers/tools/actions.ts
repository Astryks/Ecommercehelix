"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { saveInput, refreshUser, saveReview, resolveAlert, computeTools } from "@/lib/tools/server";
import { completeTask } from "@/lib/repo";
import { isoDay } from "@/lib/dates";

const num = (v: FormDataEntryValue | null) => { const n = Number(String(v ?? "").replace(/[$,\s]/g, "")); return Number.isFinite(n) ? n : null; };

export async function saveCashInputs(form: FormData) {
  const u = await requireUser();
  await saveInput(u.id, "cash", { startBalance: num(form.get("startBalance")), floor: Math.max(0, num(form.get("floor")) ?? 2000) });
  await refreshUser(u.id);
  revalidatePath("/dashboard", "layout");
}
export async function saveForecastInputs(form: FormData) {
  const u = await requireUser();
  const g = num(form.get("yearGoal"));
  await saveInput(u.id, "forecast", { yearGoal: g && g > 0 ? g : null });
  revalidatePath("/dashboard", "layout");
}
export async function saveStoreInputs(form: FormData) {
  const u = await requireUser();
  const c = String(form.get("category") ?? "other");
  await saveInput(u.id, "store", { category: ["fashion", "beauty", "home", "food", "other"].includes(c) ? c : "other" });
  revalidatePath("/dashboard", "layout");
}
/** Monday review: save the pre-filled numbers, the flagged problem and the one fix the owner picked. */
export async function saveWeeklyReview(form: FormData) {
  const u = await requireUser();
  const t = await computeTools(u.id);
  const fixId = String(form.get("fix") ?? "").slice(0, 40);
  const fix = t.review.fixes.find((f) => f.id === fixId);
  const own = String(form.get("own") ?? "").trim().slice(0, 200);
  await saveReview(u.id, t.review.week, { numbers: t.review.numbers }, t.review.worst?.id ?? null, fix?.id ?? "own", fix?.label ?? own ?? "");
  await completeTask(u.id, `routine-review-${isoDay()}`);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard?review=saved");
}
export async function doneAlert(form: FormData) {
  const u = await requireUser();
  await resolveAlert(u.id, String(form.get("key") ?? ""));
  revalidatePath("/dashboard", "layout");
}
