"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { connectShopifyToken, syncShopify } from "@/lib/shopify/service";
import { importSheetUrl, unlinkSheet } from "@/lib/sheets/sync";

export async function connectShopifyCustomApp(form: FormData) {
  const u = await requireUser();
  const r = await connectShopifyToken(u.id, String(form.get("shop") ?? ""), String(form.get("token") ?? ""));
  if (!r.ok) redirect(`/dashboard/connect?err=shopify_${r.error}`);
  const s = await syncShopify(u.id, "user", 60);
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/connect?ok=${s.ok ? "shopify" : "shopify_nosync"}`);
}

export async function importSheet(form: FormData) {
  const u = await requireUser();
  const r = await importSheetUrl(u.id, String(form.get("url") ?? ""));
  if (!r.ok) redirect(`/dashboard/connect?err=${r.error}`);
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/connect?ok=sheet&n=${r.days}`);
}

export async function unlinkSheetAction() {
  const u = await requireUser();
  await unlinkSheet(u.id);
  revalidatePath("/dashboard/connect");
  redirect("/dashboard/connect?ok=sheet_unlinked");
}
