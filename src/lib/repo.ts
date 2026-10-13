import "server-only";
import { canonicalStepKeys } from "./lesson-alias";
import { toCourseTrack, type CourseState } from "./course-plan";
import type { ProfitInputs } from "./profit-setup";
import { hasDb, prisma } from "./db";
import type { PlanId } from "./plans";
import { exampleDays, exampleProducts, type DayInput, type ProductLine, type Settings, NUM_FIELDS } from "./scorecard";
import { isoDay, addDays } from "./dates";
import { toTrack, type TrackId } from "./tracks";
import { toCountry, type Country } from "./seasons";
import type { Goals } from "./goals";
import { dayExTax, productExTax, taxRate, toTaxMode, type SalesTaxMode } from "./tax";
import { isDemoUserId, mayLinkByEmail } from "./demo-auth";
import { exampleStock, exampleSuppliers, type StockItem, type Supplier } from "./stock";

/**
 * Data access with two backends:
 *  - Postgres via Prisma when DATABASE_URL is set
 *  - an in-memory store (demo mode) otherwise, so the app runs with zero keys.
 */

export type Account = { userId: string; email: string; name: string; plan: PlanId; storeUrl: string | null; walletCents: number; track: TrackId; country: Country; salesTaxMode: SalesTaxMode; onboarded: boolean };
export type Completion = { taskId: string; completedOn: string };
export type SeasonPlanRow = { planKey: string; addedOn: string };
export type ApprovalRow = { id: string; taskId: string; title: string; detail: string; estAiCost: number; status: string; createdAt: string; decidedAt: string | null };

type Mem = {
  users: Map<string, Account>;
  completions: Map<string, Completion[]>;
  approvals: Map<string, ApprovalRow[]>;
  days: Map<string, DayInput[]>;
  products: Map<string, ProductLine[]>;
  settings: Map<string, Settings>;
  seasonPlans: Map<string, SeasonPlanRow[]>;
  suppliers: Map<string, Supplier[]>;
  stock: Map<string, StockItem[]>;
  goals: Map<string, Goals>;
  lessonSteps: Map<string, Set<string>>;
  course: Map<string, CourseState>;
  profit: Map<string, ProfitInputs>;
  events: Map<string, ProgressEventRow[]>;
};
const g = globalThis as unknown as { __helixMem?: Mem };
if (g.__helixMem && !g.__helixMem.profit) g.__helixMem.profit = new Map();
if (g.__helixMem && !g.__helixMem.events) g.__helixMem.events = new Map();
const mem: Mem =
  g.__helixMem ??
  (g.__helixMem = { users: new Map(), completions: new Map(), approvals: new Map(), days: new Map(), products: new Map(), settings: new Map(), seasonPlans: new Map(), suppliers: new Map(), stock: new Map(), goals: new Map(), lessonSteps: new Map(), course: new Map(), profit: new Map(), events: new Map() });
mem.seasonPlans ??= new Map(); // older hot-reloaded stores
mem.suppliers ??= new Map();
mem.stock ??= new Map();
mem.goals ??= new Map();
mem.lessonSteps ??= new Map();
mem.course ??= new Map();

export const DEFAULT_SETTINGS: Settings = { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 9000 };

const toPlan = (p: string): PlanId => (p.toLowerCase() as PlanId) ?? "free";
const toEnum = (p: PlanId) => p.toUpperCase() as "FREE" | "STARTER" | "GROWTH";

/** Ensure the user exists (and has example scorecard data). Returns the canonical user id. */
export async function ensureUser(id: string, email: string, name: string): Promise<string> {
  if (!hasDb) {
    if (!mem.users.has(id)) {
      mem.users.set(id, { userId: id, email, name, plan: "free", storeUrl: null, walletCents: 0, track: "growing", country: "AU", salesTaxMode: "auto", onboarded: false });
      mem.days.set(id, exampleDays(isoDay()));
      mem.products.set(id, exampleProducts(isoDay()));
    }
    return id;
  }
  let user = await prisma.user.findUnique({ where: { id } });
  // Never link a demo session to an existing user by email (see src/lib/demo-auth.ts).
  if (!user && mayLinkByEmail(id, email)) user = await prisma.user.findUnique({ where: { email } });
  if (!user) user = await prisma.user.create({ data: { id, email: email || null, name, isDemo: isDemoUserId(id) } });
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!sub) {
    await prisma.subscription.create({ data: { userId: user.id } });
    await prisma.scorecardDay.createMany({ data: exampleDays(isoDay()).map((d) => ({ ...d, userId: user!.id })), skipDuplicates: true });
    await prisma.productSale.createMany({ data: exampleProducts(isoDay()).map((p) => ({ ...p, userId: user!.id })) });
  }
  return user.id;
}

export async function getAccount(userId: string): Promise<Account> {
  if (!hasDb) return mem.users.get(userId) ?? { userId, email: "", name: "", plan: "free", storeUrl: null, walletCents: 0, track: "growing", country: "AU", salesTaxMode: "auto", onboarded: false };
  const u = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true, stores: { orderBy: { createdAt: "desc" }, take: 1 } } });
  return {
    userId,
    email: u?.email ?? "",
    name: u?.name ?? "",
    plan: toPlan(u?.subscription?.plan ?? "FREE"),
    storeUrl: u?.stores[0]?.url ?? null,
    walletCents: u?.subscription?.walletBalanceCents ?? 0,
    track: toTrack(u?.track),
    country: toCountry(u?.country),
    salesTaxMode: toTaxMode(u?.salesTaxMode),
    onboarded: Boolean(u?.onboardedAt),
  };
}

/** Track and country, chosen at onboarding and changeable in Settings. */
export async function saveProfile(userId: string, p: { track?: TrackId; country?: Country; salesTaxMode?: SalesTaxMode; onboarded?: boolean }) {
  if (!hasDb) {
    const a = mem.users.get(userId);
    if (!a) return;
    if (p.track) a.track = p.track;
    if (p.country) a.country = p.country;
    if (p.salesTaxMode) a.salesTaxMode = p.salesTaxMode;
    if (p.onboarded) a.onboarded = true;
    return;
  }
  await prisma.user.update({ where: { id: userId }, data: { track: p.track, country: p.country, salesTaxMode: p.salesTaxMode, ...(p.onboarded ? { onboardedAt: new Date() } : {}) } });
}

export async function setPlan(userId: string, plan: PlanId, stripe?: { customerId?: string; subscriptionId?: string; status?: string }) {
  if (!hasDb) {
    const a = mem.users.get(userId);
    if (a) a.plan = plan;
    return;
  }
  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan: toEnum(plan), stripeCustomerId: stripe?.customerId, stripeSubscriptionId: stripe?.subscriptionId, status: stripe?.status ?? "active" },
    update: { plan: toEnum(plan), stripeCustomerId: stripe?.customerId, stripeSubscriptionId: stripe?.subscriptionId, status: stripe?.status ?? "active" },
  });
}

/** Update by Stripe subscription id; falls back to the user id from metadata when the id is not stored yet. Only plan and status change, so a downgrade keeps the Meta connection, prep plans and all other data. */
export async function setPlanBySubscription(subscriptionId: string, plan: PlanId, status: string, fallback?: { userId?: string; customerId?: string }) {
  if (!hasDb) return;
  const r = await prisma.subscription.updateMany({ where: { stripeSubscriptionId: subscriptionId }, data: { plan: toEnum(plan), status } });
  if (r.count === 0 && fallback?.userId && (await prisma.user.findUnique({ where: { id: fallback.userId } })))
    await setPlan(fallback.userId, plan, { customerId: fallback.customerId, subscriptionId, status });
}

/** Status only (for invoice.payment_failed). */
export async function setBillingStatusByCustomer(customerId: string, status: string) {
  if (!hasDb) return;
  await prisma.subscription.updateMany({ where: { stripeCustomerId: customerId }, data: { status } });
}

export type BillingInfo = { status: string; customerId: string | null; subscriptionId: string | null };
export async function getBilling(userId: string): Promise<BillingInfo> {
  if (!hasDb) return { status: "active", customerId: null, subscriptionId: null };
  const s = await prisma.subscription.findUnique({ where: { userId } });
  return { status: s?.status ?? "active", customerId: s?.stripeCustomerId ?? null, subscriptionId: s?.stripeSubscriptionId ?? null };
}

export async function setStore(userId: string, url: string) {
  if (!hasDb) {
    const a = mem.users.get(userId);
    if (a) a.storeUrl = url;
    return;
  }
  await prisma.store.create({ data: { userId, url } });
}

// ---------- tasks ----------
export async function getCompletions(userId: string): Promise<Completion[]> {
  if (!hasDb) return mem.completions.get(userId) ?? [];
  const rows = await prisma.taskCompletion.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return rows.map((r) => ({ taskId: r.taskId, completedOn: r.completedOn }));
}

export async function completeTask(userId: string, taskId: string) {
  const completedOn = isoDay();
  if (!hasDb) {
    const list = mem.completions.get(userId) ?? [];
    if (!list.some((c) => c.taskId === taskId)) list.push({ taskId, completedOn });
    mem.completions.set(userId, list);
    return;
  }
  await prisma.taskCompletion.upsert({ where: { userId_taskId: { userId, taskId } }, create: { userId, taskId, completedOn }, update: {} });
}

export function streakFrom(completions: Completion[], today = isoDay()): number {
  const days = new Set(completions.map((c) => c.completedOn));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(cursor)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

// ---------- lesson step progress ----------
export async function getLessonSteps(userId: string): Promise<string[]> {
  if (!hasDb) return canonicalStepKeys([...(mem.lessonSteps.get(userId) ?? [])]);
  const rows = await prisma.lessonProgress.findMany({ where: { userId }, select: { stepKey: true } });
  return canonicalStepKeys(rows.map((r) => r.stepKey));
}

export async function setLessonStep(userId: string, stepKey: string, done: boolean) {
  if (!hasDb) {
    const set = mem.lessonSteps.get(userId) ?? new Set<string>();
    if (done) set.add(stepKey);
    else set.delete(stepKey);
    mem.lessonSteps.set(userId, set);
    return;
  }
  if (done) await prisma.lessonProgress.upsert({ where: { userId_stepKey: { userId, stepKey } }, create: { userId, stepKey }, update: {} });
  else await prisma.lessonProgress.deleteMany({ where: { userId, stepKey } });
}

// ---------- approvals ----------
export async function listApprovals(userId: string): Promise<ApprovalRow[]> {
  if (!hasDb) return [...(mem.approvals.get(userId) ?? [])].reverse();
  const rows = await prisma.approval.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), decidedAt: r.decidedAt?.toISOString() ?? null }));
}

export async function createApproval(userId: string, a: { taskId: string; title: string; detail: string; estAiCost: number }) {
  if (!hasDb) {
    const list = mem.approvals.get(userId) ?? [];
    if (list.some((x) => x.taskId === a.taskId && x.status === "pending")) return;
    list.push({ ...a, id: crypto.randomUUID(), status: "pending", createdAt: new Date().toISOString(), decidedAt: null });
    mem.approvals.set(userId, list);
    return;
  }
  const exists = await prisma.approval.findFirst({ where: { userId, taskId: a.taskId, status: "pending" } });
  if (!exists) await prisma.approval.create({ data: { userId, ...a } });
}

export async function decideApproval(userId: string, id: string, status: "approved" | "rejected") {
  if (!hasDb) {
    const row = (mem.approvals.get(userId) ?? []).find((x) => x.id === id);
    if (row && row.status === "pending") {
      row.status = status;
      row.decidedAt = new Date().toISOString();
    }
    return row?.taskId;
  }
  const row = await prisma.approval.findFirst({ where: { id, userId } });
  if (!row || row.status !== "pending") return;
  await prisma.approval.update({ where: { id }, data: { status, decidedAt: new Date() } });
  return row.taskId;
}

// ---------- monthly goals ladder ----------
/** The user's monthly goals, or null when they have not set any (callers fall back to track defaults). */
export async function getGoals(userId: string): Promise<Goals | null> {
  if (!hasDb) return mem.goals.get(userId) ?? null;
  const r = await prisma.monthlyGoals.findUnique({ where: { userId } });
  return r ? { sessions: r.sessions, ctrPct: r.ctrPct, atcPct: r.atcPct, crPct: r.crPct, aov: r.aov, cpa: r.cpa, contributionPct: r.contributionPct, netProfit: r.netProfit } : null;
}

export async function saveGoals(userId: string, goals: Goals) {
  if (!hasDb) return void mem.goals.set(userId, goals);
  await prisma.monthlyGoals.upsert({ where: { userId }, create: { userId, ...goals }, update: goals });
}

// ---------- scorecard ----------
export async function getSettings(userId: string): Promise<Settings> {
  if (!hasDb) return mem.settings.get(userId) ?? DEFAULT_SETTINGS;
  const s = await prisma.scorecardSettings.findUnique({ where: { userId } });
  return s ? { monthlyRevenueTarget: s.monthlyRevenueTarget, targetMerPct: s.targetMerPct, fixedCostsMonthly: s.fixedCostsMonthly } : DEFAULT_SETTINGS;
}

export async function saveSettings(userId: string, s: Settings) {
  if (!hasDb) return void mem.settings.set(userId, s);
  await prisma.scorecardSettings.upsert({ where: { userId }, create: { userId, ...s }, update: s });
}

/** GST/VAT rate to strip from this user's sales (0 when their numbers are before tax). */
export async function salesTaxRate(userId: string): Promise<number> {
  if (!hasDb) {
    const a = mem.users.get(userId);
    return a ? taxRate(a.salesTaxMode, a.country) : 0;
  }
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { salesTaxMode: true, country: true } });
  return u ? taxRate(toTaxMode(u.salesTaxMode), toCountry(u.country)) : 0;
}

/** Days as used by every report: sales have GST/VAT taken out when "My prices include GST/VAT" applies. */
export async function getDays(userId: string): Promise<DayInput[]> {
  const [days, rate] = await Promise.all([getRawDays(userId), salesTaxRate(userId)]);
  return rate > 0 ? days.map((d) => dayExTax(d, rate)) : days;
}

/** Days exactly as typed or imported. Use this when editing and saving, so tax is never taken out twice. */
export async function getRawDays(userId: string): Promise<DayInput[]> {
  if (!hasDb) return [...(mem.days.get(userId) ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const rows = await prisma.scorecardDay.findMany({ where: { userId }, orderBy: { date: "asc" } });
  return rows.map((r) => {
    const d = { date: r.date, source: r.source, example: r.example } as DayInput;
    for (const f of NUM_FIELDS) d[f] = r[f];
    return d;
  });
}

export async function upsertDays(userId: string, days: DayInput[]) {
  if (!hasDb) {
    const list = (mem.days.get(userId) ?? []).filter((d) => !days.some((n) => n.date === d.date));
    mem.days.set(userId, [...list, ...days.map((d) => ({ ...d, example: false }))]);
    return;
  }
  for (const d of days) {
    const data = { ...d, example: false, source: d.source ?? "manual" };
    await prisma.scorecardDay.upsert({ where: { userId_date: { userId, date: d.date } }, create: { userId, ...data }, update: data });
  }
}

export async function clearExampleData(userId: string) {
  if (!hasDb) {
    mem.days.set(userId, (mem.days.get(userId) ?? []).filter((d) => !d.example));
    mem.products.set(userId, (mem.products.get(userId) ?? []).filter((p) => !p.example));
    return;
  }
  await prisma.scorecardDay.deleteMany({ where: { userId, example: true } });
  await prisma.productSale.deleteMany({ where: { userId, example: true } });
}

export async function getProducts(userId: string): Promise<ProductLine[]> {
  const rate = await salesTaxRate(userId);
  if (!hasDb) return (mem.products.get(userId) ?? []).map((p) => productExTax(p, rate));
  const rows = await prisma.productSale.findMany({ where: { userId }, orderBy: { units: "desc" } });
  return rows.map((r) => productExTax({ date: r.date, sku: r.sku, name: r.name, units: r.units, price: r.price, unitCost: r.unitCost, example: r.example }, rate));
}

export async function addProductLine(userId: string, p: ProductLine) {
  if (!hasDb) {
    const list = mem.products.get(userId) ?? [];
    list.push({ ...p, example: false });
    mem.products.set(userId, list);
    return;
  }
  await prisma.productSale.create({ data: { userId, ...p, example: false } });
}

/** Write synced Meta spend and attributed revenue into the scorecard without touching other fields. */
export async function setMetaSpend(userId: string, rows: { date: string; spend: number; revenue: number }[]) {
  if (!hasDb) {
    const list = mem.days.get(userId) ?? [];
    for (const r of rows) {
      const d = list.find((x) => x.date === r.date);
      if (d) {
        d.adMeta = r.spend;
        d.metaRevenue = r.revenue;
      } else {
        const blank = { date: r.date, source: "meta", example: false } as DayInput;
        for (const f of NUM_FIELDS) blank[f] = 0;
        list.push({ ...blank, adMeta: r.spend, metaRevenue: r.revenue });
      }
    }
    mem.days.set(userId, list);
    return;
  }
  for (const r of rows) {
    await prisma.scorecardDay.upsert({
      where: { userId_date: { userId, date: r.date } },
      create: { userId, date: r.date, source: "meta", adMeta: r.spend, metaRevenue: r.revenue },
      update: { adMeta: r.spend, metaRevenue: r.revenue },
    });
  }
}

// ---------- seasonal prep plans ----------
export async function getSeasonPlans(userId: string): Promise<SeasonPlanRow[]> {
  if (!hasDb) return mem.seasonPlans.get(userId) ?? [];
  const rows = await prisma.seasonPlan.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return rows.map((r) => ({ planKey: r.planKey, addedOn: r.addedOn }));
}

export async function addSeasonPlan(userId: string, planKey: string) {
  const addedOn = isoDay();
  if (!hasDb) {
    const list = mem.seasonPlans.get(userId) ?? [];
    if (!list.some((p) => p.planKey === planKey)) list.push({ planKey, addedOn });
    mem.seasonPlans.set(userId, list);
    return;
  }
  await prisma.seasonPlan.upsert({ where: { userId_planKey: { userId, planKey } }, create: { userId, planKey, addedOn }, update: {} });
}

/** Everyone to consider for a nudge, with their email. */
export async function listNudgeRecipients(): Promise<{ userId: string; email: string; name: string }[]> {
  if (!hasDb) return [...mem.users.values()].map((u) => ({ userId: u.userId, email: u.email, name: u.name }));
  const rows = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  return rows.map((r) => ({ userId: r.id, email: r.email ?? "", name: r.name ?? "" }));
}

// ---------- suppliers and stock ----------
const supplierOut = (r: { id: string; name: string; contact: string; country: string; kind: string; moq: number; leadTimeDays: number; paymentTerms: string; notes: string; example: boolean }): Supplier =>
  ({ ...r, kind: (["factory", "trading"].includes(r.kind) ? r.kind : "unknown") as Supplier["kind"] });

/** Example suppliers and stock are added once, so a new account can see how the page works. */
async function seedStock(userId: string) {
  if (!hasDb) {
    if (!mem.suppliers.has(userId)) {
      mem.suppliers.set(userId, exampleSuppliers());
      mem.stock.set(userId, exampleStock());
    }
    return;
  }
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { stockSeeded: true } });
  if (!u || u.stockSeeded) return;
  const sup = exampleSuppliers();
  const ids = new Map<string, string>();
  for (const s of sup) {
    const { id, ...data } = s;
    const row = await prisma.supplier.create({ data: { ...data, example: true, userId } });
    ids.set(id, row.id);
  }
  for (const i of exampleStock()) {
    const { id: _id, supplierId, ...data } = i;
    void _id;
    await prisma.stockItem.create({ data: { ...data, example: true, userId, supplierId: supplierId ? ids.get(supplierId) ?? null : null } });
  }
  await prisma.user.update({ where: { id: userId }, data: { stockSeeded: true } });
}

export async function getSuppliers(userId: string): Promise<Supplier[]> {
  await seedStock(userId);
  if (!hasDb) return mem.suppliers.get(userId) ?? [];
  return (await prisma.supplier.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })).map(supplierOut);
}

export async function getStock(userId: string): Promise<StockItem[]> {
  await seedStock(userId);
  if (!hasDb) return mem.stock.get(userId) ?? [];
  const rows = await prisma.stockItem.findMany({ where: { userId }, orderBy: { sku: "asc" } });
  return rows.map(({ userId: _u, updatedAt: _t, ...r }) => { void _u; void _t; return r; });
}

export async function addSupplier(userId: string, s: Omit<Supplier, "id" | "example">) {
  await seedStock(userId);
  if (!hasDb) {
    const list = mem.suppliers.get(userId) ?? [];
    list.push({ ...s, id: `sup-${Date.now().toString(36)}-${list.length}`, example: false });
    mem.suppliers.set(userId, list);
    return;
  }
  await prisma.supplier.create({ data: { ...s, userId } });
}

/** Add a product or update the one with the same SKU. */
export async function upsertStockItem(userId: string, i: Omit<StockItem, "id" | "example">) {
  await seedStock(userId);
  if (!hasDb) {
    const list = mem.stock.get(userId) ?? [];
    const at = list.findIndex((x) => x.sku.toLowerCase() === i.sku.toLowerCase());
    if (at >= 0) list[at] = { ...list[at], ...i, example: false };
    else list.push({ ...i, id: `st-${Date.now().toString(36)}-${list.length}`, example: false });
    mem.stock.set(userId, list);
    return;
  }
  await prisma.stockItem.upsert({ where: { userId_sku: { userId, sku: i.sku } }, create: { ...i, userId }, update: { ...i, example: false } });
}

/** Quick update from the stock table: new counts and sales speed. */
export async function updateStockCounts(userId: string, id: string, c: { onHand: number; onOrder: number; dailySales: number }) {
  if (!hasDb) {
    const it = (mem.stock.get(userId) ?? []).find((x) => x.id === id);
    if (it) Object.assign(it, c, { example: false });
    return;
  }
  await prisma.stockItem.updateMany({ where: { id, userId }, data: { ...c, example: false } });
}

export async function clearExampleStock(userId: string) {
  await seedStock(userId);
  if (!hasDb) {
    mem.stock.set(userId, (mem.stock.get(userId) ?? []).filter((x) => !x.example));
    mem.suppliers.set(userId, (mem.suppliers.get(userId) ?? []).filter((x) => !x.example));
    return;
  }
  await prisma.stockItem.deleteMany({ where: { userId, example: true } });
  await prisma.supplier.deleteMany({ where: { userId, example: true } });
}

export async function uncompleteTask(userId: string, taskId: string) {
  if (!hasDb) {
    mem.completions.set(userId, (mem.completions.get(userId) ?? []).filter((c) => c.taskId !== taskId));
    return;
  }
  await prisma.taskCompletion.deleteMany({ where: { userId, taskId } });
}

// ---------- the Helix Course ----------
const split = (s: string) => s.split(",").filter(Boolean);

/** The user's course state. Null until they first open the course. */
export async function getCourseState(userId: string): Promise<CourseState | null> {
  if (!hasDb) return mem.course.get(userId) ?? null;
  const r = await prisma.courseState.findUnique({ where: { userId } });
  return r ? { track: toCourseTrack(r.track), goalId: r.goalId, doneGoals: split(r.doneGoals), confirmed: split(r.confirmed), baselineAov: r.baselineAov, celebrate: r.celebrate } : null;
}

export async function saveCourseState(userId: string, s: CourseState) {
  if (!hasDb) {
    mem.course.set(userId, { ...s });
    return;
  }
  const data = { track: s.track, goalId: s.goalId, doneGoals: s.doneGoals.join(","), confirmed: s.confirmed.join(","), baselineAov: s.baselineAov, celebrate: s.celebrate };
  await prisma.courseState.upsert({ where: { userId }, create: { userId, ...data }, update: data });
}

// ---------- profit setup ----------
export async function getProfitSetup(userId: string): Promise<ProfitInputs | null> {
  if (!hasDb) return mem.profit.get(userId) ?? null;
  const r = await prisma.profitSetup.findUnique({ where: { userId } });
  if (!r) return null;
  const { userId: _u, updatedAt: _t, ...rest } = r;
  void _u; void _t;
  return rest;
}

export async function saveProfitSetup(userId: string, p: ProfitInputs) {
  if (!hasDb) return void mem.profit.set(userId, { ...p });
  await prisma.profitSetup.upsert({ where: { userId }, create: { userId, ...p }, update: p });
}

// ---------- progress history ----------
export type ProgressEventRow = { kind: string; ref: string; at: string };

/** Record one compact event (a finished goal, a saved profit setup). */
export async function logEvent(userId: string, kind: string, ref = "") {
  if (!hasDb) {
    const l = mem.events.get(userId) ?? [];
    l.push({ kind, ref, at: new Date().toISOString() });
    mem.events.set(userId, l);
    return;
  }
  await prisma.progressEvent.create({ data: { userId, kind, ref } });
}

/** History for the progress page. `since` limits rows (free plans see the last 30 days). Indexed by user. */
export async function getHistory(userId: string, since: string | null) {
  const sinceDate = since ? new Date(since + "T00:00:00Z") : undefined;
  if (!hasDb) {
    const ev = (mem.events.get(userId) ?? []).filter((e) => !since || e.at >= since);
    const comps = (mem.completions.get(userId) ?? []).filter((c) => !since || c.completedOn >= since);
    const steps = [...(mem.lessonSteps.get(userId) ?? [])].map((k) => ({ stepKey: k, at: new Date().toISOString() }));
    return { joined: null as string | null, events: ev, completions: comps, steps };
  }
  const [u, ev, comps, steps] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    prisma.progressEvent.findMany({ where: { userId, ...(sinceDate ? { at: { gte: sinceDate } } : {}) }, orderBy: { at: "asc" }, take: 2000 }),
    prisma.taskCompletion.findMany({ where: { userId, ...(since ? { completedOn: { gte: since } } : {}) }, select: { taskId: true, completedOn: true }, orderBy: { completedOn: "asc" }, take: 5000 }),
    prisma.lessonProgress.findMany({ where: { userId, ...(sinceDate ? { doneAt: { gte: sinceDate } } : {}) }, select: { stepKey: true, doneAt: true }, take: 5000 }),
  ]);
  return {
    joined: u?.createdAt.toISOString() ?? null,
    events: ev.map((e) => ({ kind: e.kind, ref: e.ref, at: e.at.toISOString() })),
    completions: comps,
    steps: steps.map((s) => ({ stepKey: s.stepKey, at: s.doneAt.toISOString() })),
  };
}

/** Everything Helix stores about a user, for "Download my data". Tokens are never included. */
export async function exportAccount(userId: string) {
  if (!hasDb) return { account: mem.users.get(userId) ?? null, days: mem.days.get(userId) ?? [], completions: mem.completions.get(userId) ?? [], course: mem.course.get(userId) ?? null, profit: mem.profit.get(userId) ?? null };
  const [user, days, completions, lessons, course, profit, goals, settings, products, suppliers, events] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, createdAt: true, track: true, country: true, salesTaxMode: true } }),
    prisma.scorecardDay.findMany({ where: { userId } }),
    prisma.taskCompletion.findMany({ where: { userId }, select: { taskId: true, completedOn: true } }),
    prisma.lessonProgress.findMany({ where: { userId }, select: { stepKey: true, doneAt: true } }),
    prisma.courseState.findUnique({ where: { userId } }),
    prisma.profitSetup.findUnique({ where: { userId } }),
    prisma.monthlyGoals.findUnique({ where: { userId } }),
    prisma.scorecardSettings.findUnique({ where: { userId } }),
    prisma.productSale.findMany({ where: { userId } }),
    prisma.supplier.findMany({ where: { userId } }),
    prisma.progressEvent.findMany({ where: { userId } }),
  ]);
  return { exportedAt: new Date().toISOString(), user, days, completions, lessons, course, profit, goals, settings, products, suppliers, events };
}

/** Permanently delete the user and everything linked to them (all tables cascade from User). */
export async function deleteAccount(userId: string) {
  if (!hasDb) {
    for (const m of Object.values(mem)) (m as Map<string, unknown>).delete(userId);
    return;
  }
  await prisma.user.delete({ where: { id: userId } });
}

// ---------- diagnosis and personal plan ----------
const memDiag = ((globalThis as unknown as { __helixDiag?: Map<string, { d: import("./diagnosis").Diagnosis; at: string; planStart: string | null }> }).__helixDiag ??= new Map());

export type DiagnosisRow = { diagnosis: import("./diagnosis").Diagnosis; diagnosedAt: string; planStartedAt: string | null };

export async function getDiagnosis(userId: string): Promise<DiagnosisRow | null> {
  if (!hasDb) {
    const m = memDiag.get(userId);
    return m ? { diagnosis: m.d, diagnosedAt: m.at, planStartedAt: m.planStart } : null;
  }
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { diagnosis: true, diagnosedAt: true, planStartedAt: true } });
  if (!u?.diagnosis || !u.diagnosedAt) return null;
  return { diagnosis: u.diagnosis as unknown as import("./diagnosis").Diagnosis, diagnosedAt: u.diagnosedAt.toISOString(), planStartedAt: u.planStartedAt?.toISOString() ?? null };
}

/** Save the answers and result. Starts the 12-week plan the first time (or when restarted). */
export async function saveDiagnosis(userId: string, d: import("./diagnosis").Diagnosis, restartPlan = false) {
  const now = new Date();
  if (!hasDb) {
    const prev = memDiag.get(userId);
    memDiag.set(userId, { d, at: now.toISOString(), planStart: !prev?.planStart || restartPlan ? now.toISOString() : prev.planStart });
    return;
  }
  const prev = await prisma.user.findUnique({ where: { id: userId }, select: { planStartedAt: true } });
  await prisma.user.update({ where: { id: userId }, data: { diagnosis: d as object, diagnosedAt: now, ...(!prev?.planStartedAt || restartPlan ? { planStartedAt: now } : {}) } });
}
