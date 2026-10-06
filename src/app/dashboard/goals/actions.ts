"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getAccount, getGoals, getSettings, saveGoals, saveSettings } from "@/lib/repo";
import { DEFAULT_GOALS, goalsFromForm, merFromForm } from "@/lib/goals";
import { logAudit } from "@/lib/meta/store";

/** Save the monthly goals ladder (and the MER target, which lives with Your numbers). */
export async function saveGoalsAction(form: FormData) {
  const u = await requireUser();
  const [acct, saved, settings] = await Promise.all([getAccount(u.id), getGoals(u.id), getSettings(u.id)]);
  const goals = goalsFromForm(form, saved ?? DEFAULT_GOALS[acct.track]);
  await saveGoals(u.id, goals);
  await saveSettings(u.id, { ...settings, targetMerPct: merFromForm(form, settings.targetMerPct) });
  await logAudit(u.id, { actor: "user", action: "goals.saved", target: "monthly-goals", outcome: "ok" });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/goals?saved=1");
}
