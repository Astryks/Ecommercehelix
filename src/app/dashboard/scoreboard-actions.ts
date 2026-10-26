"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { completeTask, getRawDays, upsertDays } from "@/lib/repo";
import { getScoreboardInput, loadScoreboard, saveScoreboardInput } from "@/lib/scoreboard/server";
import { parseLastYearCsv } from "@/lib/scoreboard/csv";
import type { DayInput } from "@/lib/scorecard";

const num = (f: FormData, k: string) => Math.max(0, Math.min(1e9, Number(String(f.get(k) ?? "").replace(/[$,\s]/g, "")) || 0));
const ZERO: Omit<DayInput, "date"> = { orders: 0, newCustomerOrders: 0, units: 0, sessions: 0, revenue: 0, newCustomerRevenue: 0, discounts: 0, refunds: 0, cogs: 0, shipping: 0, paymentFees: 0, adMeta: 0, adGoogle: 0, adTiktok: 0, adOther: 0, otherMarketing: 0, metaRevenue: 0, googleRevenue: 0, tiktokRevenue: 0 };

/** One-tap yesterday entry: sales, ad spend, product cost, other costs, orders. Keeps any synced fields already on the row. */
export async function saveYesterday(form: FormData) {
  const u = await requireUser();
  const s = await loadScoreboard(u.id);
  const date = String(form.get("date") ?? s.yesterday);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > s.yesterday) return;
  const prev = (await getRawDays(u.id)).find((d) => d.date === date && !d.example);
  const synced = prev?.source === "shopify";
  const row: DayInput = {
    ...ZERO, ...(prev ?? {}), date,
    // A Shopify-synced row keeps its sales and orders; the user only adds the costs Shopify can't see.
    revenue: synced ? prev!.revenue : num(form, "sales"),
    orders: synced ? prev!.orders : Math.round(num(form, "orders")),
    discounts: synced ? prev!.discounts : 0, refunds: synced ? prev!.refunds : 0,
    adOther: num(form, "adSpend") - ((prev?.adMeta ?? 0) + (prev?.adGoogle ?? 0) + (prev?.adTiktok ?? 0)) > 0 ? num(form, "adSpend") - ((prev?.adMeta ?? 0) + (prev?.adGoogle ?? 0) + (prev?.adTiktok ?? 0)) : 0,
    cogs: num(form, "productCost"), otherMarketing: num(form, "otherCosts"), shipping: prev?.shipping ?? 0, paymentFees: prev?.paymentFees ?? 0,
    source: synced ? "shopify" : "quick", example: false,
  };
  await upsertDays(u.id, [row]);
  await completeTask(u.id, `numbers-${s.today}`);
  revalidatePath("/dashboard", "layout");
}

export async function setDailyTarget(form: FormData) {
  const u = await requireUser();
  const cur = await getScoreboardInput(u.id);
  const v = form.get("reset") ? 0 : num(form, "target");
  await saveScoreboardInput(u.id, { ...cur, dailyTarget: v || null });
  revalidatePath("/dashboard", "layout");
}

/** Last year's numbers by month or week (paid). Server-side plan check. */
export async function addLastYearPeriod(form: FormData) {
  const u = await requireUser();
  const s = await loadScoreboard(u.id);
  if (!s.paid) return;
  const kind = form.get("kind") === "week" ? "week" : "month";
  const start = String(form.get("start") ?? "");
  const startIso = /^\d{4}-\d{2}$/.test(start) ? start + "-01" : start;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startIso)) return;
  const cur = await getScoreboardInput(u.id);
  const entry = { kind, start: startIso, sales: num(form, "sales"), costs: num(form, "costs"), adSpend: num(form, "adSpend"), orders: Math.round(num(form, "orders")) } as const;
  await saveScoreboardInput(u.id, { ...cur, manual: [...cur.manual.filter((m) => !(m.kind === kind && m.start === startIso)), entry] });
  revalidatePath("/dashboard/numbers/history");
}

export async function importLastYearCsv(form: FormData) {
  const u = await requireUser();
  const s = await loadScoreboard(u.id);
  if (!s.paid) return;
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 500_000) return;
  const rows = parseLastYearCsv(await file.text());
  if (!rows.length) return;
  const cur = await getScoreboardInput(u.id);
  const key = (m: { kind: string; start: string }) => m.kind + m.start;
  const keys = new Set(rows.map(key));
  await saveScoreboardInput(u.id, { ...cur, manual: [...cur.manual.filter((m) => !keys.has(key(m))), ...rows] });
  revalidatePath("/dashboard/numbers/history");
}
