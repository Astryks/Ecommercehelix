import "server-only";
import { hasDb, prisma } from "../db";
import { getDays, getSettings, getProfitSetup, getStock, getSuppliers, getProducts, getAccount } from "../repo";
import { getConnection, getSnapshot } from "../meta/store";
import { getGoogleAds, getGoogleSnapshot } from "../google-ads/service";
import { waterfall } from "../profit-setup";
import { addDays, isoDay } from "../dates";
import { mondayOf } from "../community";
import { forecast } from "./forecast";
import { buyPlan } from "./inventory";
import { cashPlan } from "./cash";
import { customerValue } from "./customers";
import { newCustomerCost } from "./new-customer-cost";
import { productProfit } from "./product-profit";
import { targets } from "./targets";
import { mondayReview } from "./weekly-review";
import { adCheck, type AdSignals } from "./ad-check";
import { guidesFor, sizeFor, type Category } from "./benchmarks";
import { metricValues } from "./targets";
import { lastNDays, real } from "./common";

export type CashInputs = { startBalance: number | null; floor: number };
export type StoreInputs = { category: Category };
export type ForecastInputs = { yearGoal: number | null };

export async function getInput<T>(userId: string, kind: string, fallback: T): Promise<T> {
  if (!hasDb) return fallback;
  const r = await prisma.toolInput.findUnique({ where: { userId_kind: { userId, kind } } });
  return r ? ({ ...fallback, ...(r.data as object) } as T) : fallback;
}
export async function saveInput(userId: string, kind: string, data: object) {
  if (!hasDb) return;
  await prisma.toolInput.upsert({ where: { userId_kind: { userId, kind } }, create: { userId, kind, data }, update: { data } });
}

/** Everything the planning tools show, computed fresh from synced data plus the few manual inputs. */
export async function computeTools(userId: string, today = isoDay()) {
  const [allDays, s, setup, stock, suppliers, products, acct, cashIn, storeIn, fcIn, meta, metaSnap, ga, gaSnap] = await Promise.all([
    getDays(userId), getSettings(userId), getProfitSetup(userId), getStock(userId), getSuppliers(userId), getProducts(userId), getAccount(userId),
    getInput<CashInputs>(userId, "cash", { startBalance: null, floor: 2000 }), getInput<StoreInputs>(userId, "store", { category: "other" }), getInput<ForecastInputs>(userId, "forecast", { yearGoal: null }),
    getConnection(userId), getSnapshot(userId), getGoogleAds(userId), getGoogleSnapshot(userId),
  ]);
  // Until a store has its own numbers, the tools run on the example numbers (and say so), like the rest of Numbers.
  const hasReal = allDays.some((d) => !d.example);
  const days = hasReal ? allDays.filter((d) => !d.example) : allDays.map((d) => ({ ...d, example: false }));
  const fc = forecast(days, s, today, { yearGoal: fcIn.yearGoal });
  const buys = buyPlan(stock, suppliers, today, acct.country);
  const cash = cashIn.startBalance === null ? null : cashPlan(fc, buys, today, { startBalance: cashIn.startBalance, floor: cashIn.floor, fixedMonthly: s.fixedCostsMonthly });
  const customers = customerValue(days, s, today);
  const ncc = newCustomerCost(days, s, today);
  const last30 = lastNDays(real(days), today, 30);
  const ad30 = last30.reduce((a, d) => a + d.adMeta + d.adGoogle + d.adTiktok + d.adOther, 0);
  const prod = productProfit(products, setup, ad30, addDays(today, -30));
  const tg = targets(days, s, today, storeIn.category);
  const mv = metricValues(days, s, today);
  const bench = { ...guidesFor(sizeFor(mv.monthlySales), storeIn.category), size: sizeFor(mv.monthlySales), values: mv, category: storeIn.category };
  const review = mondayReview(days, s, mondayOf(today));
  const wf = setup ? waterfall(setup) : null;
  const sig: AdSignals = {
    metaConnected: Boolean(meta), googleConnected: Boolean(ga?.customerId), pixel: Boolean(meta?.pixelId),
    frequency: metaSnap?.now.frequency ?? null, ctr: metaSnap?.now.ctr ?? null, cpa: metaSnap?.now.cpa ?? (gaSnap?.totals.conversions ? gaSnap.totals.spend / gaSnap.totals.conversions : null),
    campaigns: (metaSnap?.campaigns.length ?? 0) + (gaSnap?.campaigns.length ?? 0), activeAds: null, spend30: ad30,
  };
  const breakEvenCpa = wf ? wf.beforeMarketing : null;
  const check = adCheck(days, s, today, sig, breakEvenCpa);
  return { today, settings: s, forecast: fc, buys, cash, cashIn, customers, ncc, products: prod, targets: tg, bench, review, adCheck: check, example: !hasReal && allDays.length > 0, fcIn, storeIn };
}
export type Tools = Awaited<ReturnType<typeof computeTools>>;

export type AlertDraft = { key: string; kind: string; title: string; why: string; href: string };
/** Alerts from the numbers: low cash weeks, stock to reorder, products under break-even, monthly ad check fixes. */
export function alertsFrom(t: Tools): AlertDraft[] {
  const out: AlertDraft[] = [];
  if (t.cash?.firstLow) out.push({ key: `cash-${t.cash.firstLow.start}`, kind: "cash", title: `Cash gets tight the week of ${t.cash.firstLow.start}`, why: `Your bank balance may drop under your $${t.cash.floor.toLocaleString("en-US")} floor. Plan now: move a stock order or trim ads.`, href: "/dashboard/numbers/cash" });
  for (const b of t.buys.filter((x) => x.status === "order-now" || x.status === "out").slice(0, 3))
    out.push({ key: `reorder-${b.sku}-${b.orderBy ?? t.today}`, kind: "reorder", title: `Reorder ${b.name}`, why: `${b.status === "out" ? "It is out of stock." : `Order by ${b.orderBy}.`} Suggested: ${b.orderQty} units (about $${b.cash.toLocaleString("en-US")}).${b.upliftReason ? ` ${b.upliftReason}.` : ""}`, href: "/dashboard/numbers/stock-plan" });
  for (const p of t.products.filter((x) => x.flag === "loss" && x.units >= 3).slice(0, 2))
    out.push({ key: `product-${p.sku}-${t.today.slice(0, 7)}`, kind: "product", title: `${p.name} loses money on each sale`, why: `About $${Math.abs(p.profitPerUnit).toFixed(2)} lost per unit after costs and ads. Raise the price, cut costs or stop ads on it.`, href: "/dashboard/numbers/products" });
  for (const f of t.adCheck.fixes) out.push({ key: `adcheck-${t.adCheck.month}-${f.id}`, kind: "adcheck", title: f.title, why: "From this month's ad account check.", href: f.href });
  return out;
}

/** Save the day's snapshot and sync alerts: new ones open, ones that no longer apply close. Returns newly opened alerts. */
export async function refreshUser(userId: string, today = isoDay()): Promise<AlertDraft[]> {
  if (!hasDb) return [];
  const t = await computeTools(userId, today);
  const snap = { forecast: t.forecast, cash: t.cash, customers: t.customers, ncc: t.ncc, targets: t.targets, adCheck: t.adCheck };
  await Promise.all(Object.entries(snap).map(([kind, data]) => prisma.toolSnapshot.upsert({ where: { userId_kind: { userId, kind } }, create: { userId, kind, data: JSON.parse(JSON.stringify(data ?? null)) }, update: { data: JSON.parse(JSON.stringify(data ?? null)), computedAt: new Date() } })));
  const drafts = t.example ? alertsFrom(t).filter((a) => a.kind === "adcheck") : alertsFrom(t);
  const keys = drafts.map((d) => d.key);
  await prisma.toolAlert.updateMany({ where: { userId, resolvedAt: null, key: { notIn: keys }, kind: { in: ["cash", "reorder", "product"] } }, data: { resolvedAt: new Date() } });
  const existing = new Set((await prisma.toolAlert.findMany({ where: { userId, key: { in: keys } }, select: { key: true } })).map((r) => r.key));
  const fresh = drafts.filter((d) => !existing.has(d.key));
  if (fresh.length) await prisma.toolAlert.createMany({ data: fresh.map((d) => ({ userId, ...d, createdOn: today })), skipDuplicates: true });
  return fresh;
}

export async function openAlerts(userId: string) {
  if (!hasDb) return [];
  return prisma.toolAlert.findMany({ where: { userId, resolvedAt: null }, orderBy: { createdOn: "asc" }, take: 6 });
}
export async function resolveAlert(userId: string, key: string) {
  if (hasDb) await prisma.toolAlert.updateMany({ where: { userId, key }, data: { resolvedAt: new Date() } });
}

export async function getReview(userId: string, week: string) {
  if (!hasDb) return null;
  return prisma.weeklyReview.findUnique({ where: { userId_week: { userId, week } } });
}
export async function saveReview(userId: string, week: string, data: object, flagged: string | null, fixId: string, fixText: string) {
  if (!hasDb) return;
  await prisma.weeklyReview.upsert({ where: { userId_week: { userId, week } }, create: { userId, week, data, flagged, fixId, fixText }, update: { data, flagged, fixId, fixText } });
}
export async function lastReview(userId: string, before: string) {
  if (!hasDb) return null;
  return prisma.weeklyReview.findFirst({ where: { userId, week: { lt: before } }, orderBy: { week: "desc" } });
}
