"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getSettings, saveProfitSetup, saveSettings } from "@/lib/repo";
import type { ProfitInputs } from "@/lib/profit-setup";

const KEYS: (keyof ProfitInputs)[] = ["price", "productCost", "freightDuty", "packaging", "shipToCustomer", "feePct", "feeFixed", "marketingPerOrder", "subscriptions", "otherFixed", "ordersPerMonth"];

export async function saveProfit(form: FormData) {
  const u = await requireUser("/dashboard/profit");
  const p = Object.fromEntries(KEYS.map((k) => {
    const n = Math.max(0, Math.min(10_000_000, Number(form.get(k)) || 0));
    return [k, k === "ordersPerMonth" ? Math.round(n) : n];
  })) as ProfitInputs;
  await saveProfitSetup(u.id, p);
  if (form.get("useFixed")) {
    const s = await getSettings(u.id);
    await saveSettings(u.id, { ...s, fixedCostsMonthly: p.subscriptions + p.otherFixed });
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath("/course", "layout");
  redirect("/dashboard/profit?saved=1");
}
