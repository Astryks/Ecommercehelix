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

// ---------- Shopify and Google Ads ----------
import { disconnectShopify, syncShopify } from "@/lib/shopify/service";
import { disconnectGoogleAds, pickCustomer, syncGoogleAds } from "@/lib/google-ads/service";

export async function syncShopifyNow() {
  const u = await requireUser("/dashboard/integrations");
  const r = await syncShopify(u.id, "user", 60);
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/integrations?${r.ok ? "shopify_synced=1" : "error=shopify_sync"}`);
}

export async function disconnectShopifyAction() {
  const u = await requireUser("/dashboard/integrations");
  await disconnectShopify(u.id);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/integrations?shopify_disconnected=1");
}

export async function pickGoogleCustomer(form: FormData) {
  const u = await requireUser("/dashboard/integrations");
  const id = String(form.get("customerId") ?? "");
  const login = String(form.get("loginCustomerId") ?? "");
  if (!/^\d{6,12}$/.test(id.replace(/-/g, "")) || (login && !/^\d{6,12}$/.test(login.replace(/-/g, "")))) redirect("/dashboard/integrations?error=google_pick");
  let ok = true;
  try {
    await pickCustomer(u.id, id, login || undefined);
  } catch {
    ok = false;
  }
  if (ok) await syncGoogleAds(u.id, "user");
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/integrations?${ok ? "google_saved=1" : "error=google_pick"}`);
}

export async function syncGoogleNow() {
  const u = await requireUser("/dashboard/integrations");
  const r = await syncGoogleAds(u.id, "user");
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/integrations?${r.ok ? "google_synced=1" : "error=google_sync"}`);
}

export async function disconnectGoogleAction() {
  const u = await requireUser("/dashboard/integrations");
  await disconnectGoogleAds(u.id);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/integrations?google_disconnected=1");
}
