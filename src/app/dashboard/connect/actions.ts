"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { upsertDays } from "@/lib/repo";
import { parseCsv } from "@/lib/scorecard";
import { connectShopifyToken, syncShopify } from "@/lib/shopify/service";
import { normaliseHeaders, sheetCsvUrl } from "@/lib/sheets/import";

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
  const url = sheetCsvUrl(String(form.get("url") ?? ""));
  if (!url) redirect("/dashboard/connect?err=sheet_url");
  const res = await fetch(url, { cache: "no-store", redirect: "follow" }).catch(() => null);
  const text = res?.ok ? await res.text() : "";
  if (!text || text.length > 2_000_000 || /^\s*</.test(text)) redirect("/dashboard/connect?err=sheet_access");
  const days = parseCsv(normaliseHeaders(text)).map((d) => ({ ...d, source: "csv" }));
  if (!days.length) redirect("/dashboard/connect?err=sheet_empty");
  await upsertDays(u.id, days);
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/connect?ok=sheet&n=${days.length}`);
}
