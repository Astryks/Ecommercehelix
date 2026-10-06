import "server-only";
import { hasDb, prisma } from "../db";
import type { MetaSnapshot } from "./insights";

/** Persistence for the Meta integration and the audit log: Postgres via Prisma, or in memory in demo mode. */

export type MetaConnectionRow = {
  userId: string;
  mode: "live" | "mock";
  fbUserId: string;
  fbUserName: string;
  tokenEnc: string;
  tokenExpiresAt: string | null;
  scopes: string[];
  adAccountId: string | null;
  adAccountName: string | null;
  currency: string | null;
  timezone: string | null;
  pageId: string | null;
  pageName: string | null;
  instagramId: string | null;
  instagramUsername: string | null;
  pixelId: string | null;
  pixelName: string | null;
  status: string;
  lastSyncAt: string | null;
  lastSyncError: string | null;
};
export type AuditRow = { id: string; actor: string; action: string; target: string; outcome: string; httpStatus: number | null; detail: string; createdAt: string };
export type DraftRow = { id: string; approvalId: string | null; status: string; campaignId: string | null; adsetId: string | null; adIds: string[]; creativeIds: string[]; error: string | null; createdAt: string };

type Mem = { conns: Map<string, MetaConnectionRow>; snaps: Map<string, MetaSnapshot>; audit: Map<string, AuditRow[]>; drafts: Map<string, DraftRow[]> };
const g = globalThis as unknown as { __helixMeta?: Mem };
const mem: Mem = g.__helixMeta ?? (g.__helixMeta = { conns: new Map(), snaps: new Map(), audit: new Map(), drafts: new Map() });

type DbConn = NonNullable<Awaited<ReturnType<typeof prisma.metaConnection.findUnique>>>;
const fromDb = (r: DbConn): MetaConnectionRow => ({
  ...r,
  mode: r.mode === "mock" ? "mock" : "live",
  scopes: r.scopes ? r.scopes.split(",") : [],
  tokenExpiresAt: r.tokenExpiresAt?.toISOString() ?? null,
  lastSyncAt: r.lastSyncAt?.toISOString() ?? null,
});
const toDb = (p: Partial<MetaConnectionRow>) => {
  const { scopes, tokenExpiresAt, lastSyncAt, ...rest } = p;
  return {
    ...rest,
    ...(scopes !== undefined ? { scopes: scopes.join(",") } : {}),
    ...(tokenExpiresAt !== undefined ? { tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null } : {}),
    ...(lastSyncAt !== undefined ? { lastSyncAt: lastSyncAt ? new Date(lastSyncAt) : null } : {}),
  };
};

export async function getConnection(userId: string): Promise<MetaConnectionRow | null> {
  if (!hasDb) return mem.conns.get(userId) ?? null;
  const r = await prisma.metaConnection.findUnique({ where: { userId } });
  return r ? fromDb(r) : null;
}

export async function listConnections(): Promise<MetaConnectionRow[]> {
  if (!hasDb) return [...mem.conns.values()];
  return (await prisma.metaConnection.findMany({ where: { status: { not: "expired" } } })).map(fromDb);
}

export async function saveConnection(row: MetaConnectionRow) {
  if (!hasDb) return void mem.conns.set(row.userId, row);
  const { userId, ...rest } = toDb(row);
  await prisma.metaConnection.upsert({ where: { userId: row.userId }, create: { userId: userId!, ...rest } as never, update: rest as never });
}

export async function updateConnection(userId: string, patch: Partial<MetaConnectionRow>) {
  if (!hasDb) {
    const r = mem.conns.get(userId);
    if (r) mem.conns.set(userId, { ...r, ...patch });
    return;
  }
  await prisma.metaConnection.update({ where: { userId }, data: toDb(patch) as never });
}

export async function deleteMetaData(userId: string) {
  if (!hasDb) {
    mem.conns.delete(userId);
    mem.snaps.delete(userId);
    return;
  }
  await prisma.metaSnapshot.deleteMany({ where: { userId } });
  await prisma.metaConnection.deleteMany({ where: { userId } });
}

export async function saveSnapshot(userId: string, snap: MetaSnapshot) {
  if (!hasDb) return void mem.snaps.set(userId, snap);
  const data = JSON.stringify(snap);
  await prisma.metaSnapshot.upsert({ where: { userId }, create: { userId, data }, update: { data, syncedAt: new Date() } });
}

export async function getSnapshot(userId: string): Promise<MetaSnapshot | null> {
  if (!hasDb) return mem.snaps.get(userId) ?? null;
  const r = await prisma.metaSnapshot.findUnique({ where: { userId } });
  return r ? (JSON.parse(r.data) as MetaSnapshot) : null;
}

export async function logAudit(userId: string, e: { actor: string; action: string; target: string; outcome: string; httpStatus?: number; detail?: Record<string, unknown> }) {
  const row: AuditRow = { id: crypto.randomUUID(), actor: e.actor, action: e.action, target: e.target, outcome: e.outcome, httpStatus: e.httpStatus ?? null, detail: JSON.stringify(e.detail ?? {}), createdAt: new Date().toISOString() };
  if (!hasDb) {
    const list = mem.audit.get(userId) ?? [];
    list.push(row);
    if (list.length > 500) list.splice(0, list.length - 500);
    mem.audit.set(userId, list);
    return;
  }
  await prisma.auditLog.create({ data: { userId, actor: row.actor, action: row.action, target: row.target, outcome: row.outcome, httpStatus: row.httpStatus, detail: row.detail } });
}

export async function listAudit(userId: string, limit = 40): Promise<AuditRow[]> {
  if (!hasDb) return [...(mem.audit.get(userId) ?? [])].reverse().slice(0, limit);
  const rows = await prisma.auditLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit });
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export async function saveDraft(userId: string, d: Omit<DraftRow, "id" | "createdAt">) {
  if (!hasDb) {
    const list = mem.drafts.get(userId) ?? [];
    list.push({ ...d, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    mem.drafts.set(userId, list);
    return;
  }
  await prisma.metaDraft.create({ data: { userId, ...d, adIds: d.adIds.join(","), creativeIds: d.creativeIds.join(",") } });
}

export async function listDrafts(userId: string): Promise<DraftRow[]> {
  if (!hasDb) return [...(mem.drafts.get(userId) ?? [])].reverse();
  const rows = await prisma.metaDraft.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
  return rows.map((r) => ({ ...r, adIds: r.adIds ? r.adIds.split(",") : [], creativeIds: r.creativeIds ? r.creativeIds.split(",") : [], createdAt: r.createdAt.toISOString() }));
}
