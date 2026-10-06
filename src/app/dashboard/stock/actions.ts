"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { addSupplier, clearExampleStock, updateStockCounts, upsertStockItem } from "@/lib/repo";

const num = (f: FormData, k: string, min = 0, max = 1e7) => {
  const n = Number(String(f.get(k) ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};
const str = (f: FormData, k: string, max = 120) => String(f.get(k) ?? "").trim().slice(0, max);

export async function saveSupplier(form: FormData) {
  const u = await requireUser();
  const name = str(form, "name");
  if (!name) return;
  const kind = str(form, "kind");
  await addSupplier(u.id, {
    name,
    contact: str(form, "contact"),
    country: str(form, "country", 60),
    kind: kind === "factory" || kind === "trading" ? kind : "unknown",
    moq: Math.round(num(form, "moq")),
    leadTimeDays: Math.round(num(form, "leadTimeDays", 1, 365)) || 45,
    paymentTerms: str(form, "paymentTerms"),
    notes: str(form, "notes", 400),
  });
  revalidatePath("/dashboard/stock");
}

export async function saveStockItem(form: FormData) {
  const u = await requireUser();
  const sku = str(form, "sku", 40);
  const name = str(form, "name");
  if (!sku || !name) return;
  const lead = num(form, "leadTimeDays", 0, 365);
  await upsertStockItem(u.id, {
    sku,
    name,
    supplierId: str(form, "supplierId", 60) || null,
    unitCost: num(form, "unitCost"),
    freightPerUnit: num(form, "freightPerUnit"),
    dutyPct: num(form, "dutyPct", 0, 100),
    otherPerUnit: num(form, "otherPerUnit"),
    onHand: Math.round(num(form, "onHand")),
    onOrder: Math.round(num(form, "onOrder")),
    dailySales: num(form, "dailySales", 0, 100000),
    leadTimeDays: lead > 0 ? Math.round(lead) : null,
    safetyDays: Math.round(num(form, "safetyDays", 0, 120)) || 14,
  });
  revalidatePath("/dashboard", "layout");
}

export async function saveCounts(form: FormData) {
  const u = await requireUser();
  const id = str(form, "id", 60);
  if (!id) return;
  await updateStockCounts(u.id, id, { onHand: Math.round(num(form, "onHand")), onOrder: Math.round(num(form, "onOrder")), dailySales: num(form, "dailySales", 0, 100000) });
  revalidatePath("/dashboard", "layout");
}

export async function clearStockExamples() {
  const u = await requireUser();
  await clearExampleStock(u.id);
  revalidatePath("/dashboard", "layout");
}
