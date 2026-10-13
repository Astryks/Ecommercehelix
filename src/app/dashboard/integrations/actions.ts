"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { AssetPickError, disconnectMeta, selectAssets, syncUser } from "@/lib/meta/service";
import { GraphError } from "@/lib/meta/graph";

const ID = /^(act_)?\d{1,25}$/;

export async function pickMetaAssets(form: FormData) {
  const u = await requireUser("/dashboard/integrations");
  const adAccountId = String(form.get("adAccountId") ?? "");
  const pageId = String(form.get("pageId") ?? "");
  const pixelId = String(form.get("pixelId") ?? "");
  if (!adAccountId) redirect("/dashboard/integrations?error=pick_account");
  if (!ID.test(adAccountId) || (pageId && !ID.test(pageId)) || (pixelId && !ID.test(pixelId))) redirect("/dashboard/integrations?error=pick_invalid");
  let to: string;
  try {
    const r = await selectAssets(u.id, { adAccountId, pageId, pixelId });
    const q = new URLSearchParams({ saved: "1" });
    if (r.pageMissing) q.set("page_missing", "1");
    else if (!r.pageSaved) q.set("no_page", "1");
    if (r.pixelMissing) q.set("pixel_missing", "1");
    to = `/dashboard/integrations?${q}`;
  } catch (e) {
    console.error("[meta] pickMetaAssets failed", (e as Error).message);
    const code = e instanceof AssetPickError ? (/not shared/.test(e.message) ? "pick_account_missing" : "pick_no_accounts")
      : e instanceof GraphError && e.code === 190 ? "revoked" : "pick_failed";
    to = `/dashboard/integrations?error=${code}`;
  }
  revalidatePath("/dashboard", "layout");
  redirect(to);
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
