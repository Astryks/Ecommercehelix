"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureUser, getSettings, saveGoals, saveProfile, saveSettings, setStore } from "@/lib/repo";
import { toTrack } from "@/lib/tracks";
import { toCountry } from "@/lib/seasons";
import { DEFAULT_GOALS, DEFAULT_MER, goalsFromForm, impliedMonth, merFromForm } from "@/lib/goals";

export async function finishOnboarding(form: FormData) {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=/start");
  const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const raw = String(form.get("url") ?? "").trim().slice(0, 200);
  if (raw) await setStore(id, /^https?:\/\//.test(raw) ? raw : "https://" + raw);
  const track = toTrack(form.get("track"));
  await saveProfile(id, { track, country: toCountry(form.get("country")), onboarded: true });
  // Monthly goals ladder: blank fields use the suggestions for the chosen track.
  const goals = goalsFromForm(form, DEFAULT_GOALS[track]);
  const settings = await getSettings(id);
  const merPct = merFromForm(form, DEFAULT_MER[track]);
  const implied = impliedMonth(goals, merPct, settings.fixedCostsMonthly);
  await saveGoals(id, goals);
  await saveSettings(id, { ...settings, targetMerPct: merPct, monthlyRevenueTarget: Math.max(1000, Math.round(implied.revenue / 100) * 100) });
  redirect("/dashboard?welcome=1");
}
