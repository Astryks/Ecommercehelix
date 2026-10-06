import "server-only";
import { hasDb, prisma } from "./db";
import type { PlanId } from "./plans";
import { exampleDays, exampleProducts, type DayInput, type ProductLine, type Settings, NUM_FIELDS } from "./scorecard";
import { isoDay, addDays } from "./dates";

/**
 * Data access with two backends:
 *  - Postgres via Prisma when DATABASE_URL is set
 *  - an in-memory store (demo mode) otherwise, so the app runs with zero keys.
 */

export type Account = { userId: string; email: string; name: string; plan: PlanId; storeUrl: string | null; walletCents: number };
export type Completion = { taskId: string; completedOn: string };
export type ApprovalRow = { id: string; taskId: string; title: string; detail: string; estAiCost: number; status: string; createdAt: string; decidedAt: string | null };

type Mem = {
  users: Map<string, Account>;
  completions: Map<string, Completion[]>;
  approvals: Map<string, ApprovalRow[]>;
  days: Map<string, DayInput[]>;
  products: Map<string, ProductLine[]>;
  settings: Map<string, Settings>;
};
const g = globalThis as unknown as { __helixMem?: Mem };
const mem: Mem =
  g.__helixMem ??
  (g.__helixMem = { users: new Map(), completions: new Map(), approvals: new Map(), days: new Map(), products: new Map(), settings: new Map() });

export const DEFAULT_SETTINGS: Settings = { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 9000 };

const toPlan = (p: string): PlanId => (p.toLowerCase() as PlanId) ?? "free";
const toEnum = (p: PlanId) => p.toUpperCase() as "FREE" | "STARTER" | "GROWTH";

/** Ensure the user exists (and has example scorecard data). Returns the canonical user id. */
export async function ensureUser(id: string, email: string, name: string): Promise<string> {
  if (!hasDb) {
    if (!mem.users.has(id)) {
      mem.users.set(id, { userId: id, email, name, plan: "free", storeUrl: null, walletCents: 0 });
      mem.days.set(id, exampleDays(isoDay()));
      mem.products.set(id, exampleProducts(isoDay()));
    }
    return id;
  }
  let user = await prisma.user.findUnique({ where: { id } });
  if (!user && email) user = await prisma.user.findUnique({ where: { email } });
  if (!user) user = await prisma.user.create({ data: { id, email: email || null, name } });
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!sub) {
    await prisma.subscription.create({ data: { userId: user.id } });
    await prisma.scorecardDay.createMany({ data: exampleDays(isoDay()).map((d) => ({ ...d, userId: user!.id })), skipDuplicates: true });
    await prisma.productSale.createMany({ data: exampleProducts(isoDay()).map((p) => ({ ...p, userId: user!.id })) });
  }
  return user.id;
}

export async function getAccount(userId: string): Promise<Account> {
  if (!hasDb) return mem.users.get(userId) ?? { userId, email: "", name: "", plan: "free", storeUrl: null, walletCents: 0 };
  const u = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true, stores: { orderBy: { createdAt: "desc" }, take: 1 } } });
  return {
    userId,
    email: u?.email ?? "",
    name: u?.name ?? "",
    plan: toPlan(u?.subscription?.plan ?? "FREE"),
    storeUrl: u?.stores[0]?.url ?? null,
    walletCents: u?.subscription?.walletBalanceCents ?? 0,
  };
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

export async function setPlanBySubscription(subscriptionId: string, plan: PlanId, status: string) {
  if (!hasDb) return;
  await prisma.subscription.updateMany({ where: { stripeSubscriptionId: subscriptionId }, data: { plan: toEnum(plan), status } });
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

export async function getDays(userId: string): Promise<DayInput[]> {
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
  if (!hasDb) return mem.products.get(userId) ?? [];
  const rows = await prisma.productSale.findMany({ where: { userId }, orderBy: { units: "desc" } });
  return rows.map((r) => ({ date: r.date, sku: r.sku, name: r.name, units: r.units, price: r.price, unitCost: r.unitCost, example: r.example }));
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
