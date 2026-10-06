"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { disconnectMeta, selectAssets, syncUser } from "@/lib/meta/service";

const ID = /^(act_)?\d{1,25}$/;

export async function pickMetaAssets(form: FormData) {
  const u = await requireUser("/dashboard/integrations");
  const adAccountId = String(form.get("adAccountId") ?? "");
  const pageId = String(form.get("pageId") ?? "");
  const pixelId = String(form.get("pixelId") ?? "");
  if (!ID.test(adAccountId) || (pageId && !ID.test(pageId)) || (pixelId && !ID.test(pixelId))) return;
  await selectAssets(u.id, { adAccountId, pageId, pixelId });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/integrations?saved=1");
}

export async function syncMetaNow() {
  const u = await requireUser("/dashboard/integrations");
  const r = await syncUser(u.id, "user");
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/integrations?${r.ok ? "synced=1" : "error=sync"}`);
}

export async function disconnectMetaAction() {
  const u = await requireUser("/dashboard/integrations");
  await disconnectMeta(u.id);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/integrations?disconnected=1");
}
