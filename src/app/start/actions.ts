"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureUser, saveProfile, setStore } from "@/lib/repo";
import { toTrack } from "@/lib/tracks";
import { toCountry } from "@/lib/seasons";

export async function finishOnboarding(form: FormData) {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=/start");
  const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const raw = String(form.get("url") ?? "").trim().slice(0, 200);
  if (raw) await setStore(id, /^https?:\/\//.test(raw) ? raw : "https://" + raw);
  await saveProfile(id, { track: toTrack(form.get("track")), country: toCountry(form.get("country")), onboarded: true });
  redirect("/dashboard?welcome=1");
}
