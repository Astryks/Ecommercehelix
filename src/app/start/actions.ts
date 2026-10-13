"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureUser, getAccount, getGoals, getSettings, saveDiagnosis, saveGoals, saveProfile, saveSettings, setStore } from "@/lib/repo";
import { toCountry } from "@/lib/seasons";
import { auditRuns, runAndSave } from "@/lib/site-audit/run";
import { normaliseStoreUrl } from "@/lib/site-audit/guard";
import { DEFAULT_GOALS, DEFAULT_MER, impliedMonth } from "@/lib/goals";
import { diagnose, goalsFromDiagnosis, toAnswers } from "@/lib/diagnosis";

async function me(next: string) {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=" + encodeURIComponent(next));
  return ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
}

/** Screen 1: store link and country. */
export async function saveStoreStep(form: FormData) {
  const id = await me("/start");
  const raw = String(form.get("url") ?? "").trim().slice(0, 200);
  const acct = await getAccount(id);
  if (raw) {
    const u = normaliseStoreUrl(raw);
    if (!u) redirect("/start?bad=url&url=" + encodeURIComponent(raw));
    const url = u.toString().replace(/\/$/, "");
    if (url !== acct.storeUrl) await setStore(id, url);
  }
  await saveProfile(id, { country: toCountry(form.get("country")) });
  redirect("/start?step=2");
}

/** Screen 2: the questions. Saves the diagnosis, prefills goals, runs the first store check, then shows the plan. */
export async function saveQuestions(form: FormData) {
  const id = await me("/start?step=2");
  const d = diagnose(toAnswers(form));
  const acct = await getAccount(id);
  // Existing accounts keep their track and course progress; new accounts get the track the answers suggest.
  await saveProfile(id, { ...(acct.onboarded ? {} : { track: d.track }), onboarded: true });
  await saveDiagnosis(id, d, form.get("restart") === "1");
  const existing = await getGoals(id);
  if (!existing) {
    const goals = goalsFromDiagnosis(d.answers, DEFAULT_GOALS[d.track]);
    const settings = await getSettings(id);
    const implied = impliedMonth(goals, DEFAULT_MER[d.track], settings.fixedCostsMonthly);
    await saveGoals(id, goals);
    await saveSettings(id, { ...settings, targetMerPct: DEFAULT_MER[d.track], monthlyRevenueTarget: Math.max(1000, Math.round(implied.revenue / 100) * 100) });
  }
  const [last] = await auditRuns(id, 1);
  const fresh = last?.ok && last.url.includes(new URL(acct.storeUrl ?? "https://x").hostname) && Date.now() - Date.parse(last.startedAt) < 6 * 3_600_000;
  if (acct.storeUrl && !fresh) await runAndSave(id, acct.storeUrl).catch(() => null);
  redirect("/start/plan");
}
