"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { completeTask } from "@/lib/repo";
import { COSTS_TASK } from "@/lib/seed/curriculum";
import { getCardState, getProfitSetup, logEvent, saveCardState, saveProductName, saveProfitSetup } from "@/lib/repo";
import { getDeck } from "@/lib/cards";
import { isoDay } from "@/lib/dates";
import type { ProfitInputs } from "@/lib/profit-setup";
import { readAmount } from "@/lib/amount";

/** Remember where the user is, and count today's cards when they move forward. */
export async function saveCardPos(deck: string, index: number, forward: boolean) {
  const u = await requireUser("/dashboard/cards");
  const d = getDeck(deck);
  if (!d) return;
  const i = Math.max(0, Math.min(d.cards.length - 1, Math.round(index)));
  const s = await getCardState(u.id);
  const today = isoDay();
  const count = s.day === today ? s.today : 0;
  await saveCardState(u.id, { deck, index: i, day: today, today: forward ? count + 1 : count });
  revalidatePath("/dashboard");
}

const NUM: (keyof ProfitInputs)[] = ["price", "productCost", "shipToCustomer", "feePct", "feeFixed", "marketingPerOrder", "ordersPerMonth"];
const BLANK: ProfitInputs = { price: 0, productCost: 0, freightDuty: 0, packaging: 0, shipToCustomer: 0, feePct: 1.75, feeFixed: 0.3, marketingPerOrder: 0, subscriptions: 0, otherFixed: 0, ordersPerMonth: 0 };

/** Save the setup deck answers into the user's real profit setup, so dashboards fill in. */
export async function saveSetupAnswers(values: Record<string, string>) {
  const u = await requireUser("/dashboard/cards");
  const name = String(values.productName ?? "").trim().slice(0, 120);
  const price = readAmount(values.price) ?? 0;
  const existing = await getProfitSetup(u.id);
  if (!existing && price <= 0) return; // nothing worth saving yet; avoids an empty setup
  const p: ProfitInputs = { ...BLANK, ...(existing ?? {}) };
  for (const k of NUM) {
    const raw = readAmount(values[k]);
    if (raw === null) continue; // blank or not a number: keep what was saved before
    const n = Math.max(0, Math.min(10_000_000, raw));
    p[k] = k === "ordersPerMonth" ? Math.round(n) : n;
  }
  const clean = Object.fromEntries((Object.keys(BLANK) as (keyof ProfitInputs)[]).map((k) => [k, p[k]])) as ProfitInputs;
  await saveProfitSetup(u.id, clean);
  // Saving your costs finishes the Today task "Tell Helix your costs".
  await completeTask(u.id, COSTS_TASK).catch(() => null);
  if (name) await saveProductName(u.id, name);
  if (!existing) await logEvent(u.id, "profit_setup");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/course", "layout");
}
