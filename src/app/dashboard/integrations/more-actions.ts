"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { connectKlaviyo, disconnectKlaviyo, syncKlaviyo } from "@/lib/klaviyo/service";
import { disconnectTikTok, pickTikTokAdvertiser, syncTikTok } from "@/lib/tiktok/service";
import { setGa4Property, syncGa4Sessions } from "@/lib/google-ads/service";

const BACK = "/dashboard/integrations";
const done = (q: string): never => { revalidatePath("/dashboard", "layout"); redirect(`${BACK}?${q}`); };
async function paidUser() {
  const u = await requireUser(BACK);
  if (PLAN_RANK[(await getAccount(u.id)).plan] < PLAN_RANK.starter) redirect("/dashboard/billing?need=starter&for=integrations");
  return u;
}

export async function connectKlaviyoAction(form: FormData) {
  const u = await paidUser();
  let q = "klaviyo_connected=1";
  try {
    const r = await connectKlaviyo(u.id, String(form.get("key") ?? ""));
    if (!r.ok) q = `klaviyo_err=${encodeURIComponent((r.error ?? "").slice(0, 160))}`;
  } catch (e) { q = `klaviyo_err=${encodeURIComponent((e as Error).message.slice(0, 160))}`; }
  done(q);
}
export async function syncKlaviyoAction() {
  const u = await paidUser();
  const r = await syncKlaviyo(u.id, "user");
  done(r.ok ? "klaviyo_synced=1" : `klaviyo_err=${encodeURIComponent((r.error ?? "").slice(0, 160))}`);
}
export async function disconnectKlaviyoAction() {
  const u = await requireUser(BACK);
  await disconnectKlaviyo(u.id);
  done("klaviyo_disconnected=1");
}

export async function pickTikTokAction(form: FormData) {
  const u = await paidUser();
  const id = String(form.get("advertiserId") ?? "");
  let q = "tiktok_saved=1";
  try { await pickTikTokAdvertiser(u.id, id); await syncTikTok(u.id, "user"); } catch (e) { q = `tiktok_err=${encodeURIComponent((e as Error).message.slice(0, 160))}`; }
  done(q);
}
export async function syncTikTokAction() {
  const u = await paidUser();
  const r = await syncTikTok(u.id, "user");
  done(r.ok ? "tiktok_synced=1" : `tiktok_err=${encodeURIComponent((r.error ?? "").slice(0, 160))}`);
}
export async function disconnectTikTokAction() {
  const u = await requireUser(BACK);
  await disconnectTikTok(u.id);
  done("tiktok_disconnected=1");
}

export async function saveGa4Action(form: FormData) {
  const u = await paidUser();
  let q = "ga4_saved=1";
  try {
    await setGa4Property(u.id, String(form.get("property") ?? ""));
    const r = await syncGa4Sessions(u.id, "user");
    if (!r.ok) q = `ga4_err=${encodeURIComponent((r.error ?? "").slice(0, 160))}`;
  } catch (e) { q = `ga4_err=${encodeURIComponent((e as Error).message.slice(0, 160))}`; }
  done(q);
}
