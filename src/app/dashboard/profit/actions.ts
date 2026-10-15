"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getProfitSetup, getSettings, logEvent, saveProfitSetup, saveSettings } from "@/lib/repo";
import type { ProfitInputs } from "@/lib/profit-setup";
import { readAmount } from "@/lib/amount";

const KEYS: (keyof ProfitInputs)[] = ["price", "productCost", "freightDuty", "packaging", "shipToCustomer", "feePct", "feeFixed", "marketingPerOrder", "subscriptions", "otherFixed", "ordersPerMonth"];

export async function saveProfit(form: FormData) {
  const u = await requireUser("/dashboard/profit");
  const p = Object.fromEntries(KEYS.map((k) => {
    const n = Math.max(0, Math.min(10_000_000, readAmount(form.get(k)) ?? 0));
    return [k, k === "ordersPerMonth" ? Math.round(n) : n];
  })) as ProfitInputs;
  const first = !(await getProfitSetup(u.id));
  await saveProfitSetup(u.id, p);
  if (first) await logEvent(u.id, "profit_setup");
  if (form.get("useFixed")) {
    const s = await getSettings(u.id);
    await saveSettings(u.id, { ...s, fixedCostsMonthly: p.subscriptions + p.otherFixed });
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath("/course", "layout");
  redirect("/dashboard/profit?saved=1");
}
