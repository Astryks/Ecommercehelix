import "server-only";
import { hasDb, prisma } from "../db";
import { addDays, isoDay } from "../dates";
import { mergeFacts, type CoachTask, type MemoryFact, type MemoryKind } from "./memory";

/** Coach persistence: Postgres when DATABASE_URL is set, otherwise an in-memory store for local dev and demos. */
type Msg = { id: string; day: string; role: "user" | "coach"; text: string; meta: unknown; at: number };
type Task = CoachTask & { id: string; day: string; done: boolean };
type Mem = { facts: Map<string, MemoryFact[]>; msgs: Map<string, Msg[]>; tasks: Map<string, Task[]> };
const g = globalThis as unknown as { __helixCoach?: Mem };
const mem: Mem = (g.__helixCoach ??= { facts: new Map(), msgs: new Map(), tasks: new Map() });
const rid = () => Math.random().toString(36).slice(2, 12);

export const today = () => isoDay();
export const yesterday = () => addDays(isoDay(), -1);

export async function getFacts(userId: string): Promise<MemoryFact[]> {
  if (!hasDb) return mem.facts.get(userId) ?? [];
  const rows = await prisma.coachMemory.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 60 });
  return rows.map((r) => ({ id: r.id, kind: r.kind as MemoryKind, key: r.key, fact: r.fact, updatedAt: r.updatedAt.toISOString() }));
}

export async function saveFacts(userId: string, add: MemoryFact[], forget: string[] = [], source: "chat" | "user" = "chat") {
  if (!hasDb) {
    mem.facts.set(userId, mergeFacts(mem.facts.get(userId) ?? [], add.map((f) => ({ ...f, id: f.id ?? rid() })), forget));
    return;
  }
  if (forget.length) await prisma.coachMemory.deleteMany({ where: { userId, key: { in: forget } } });
  for (const f of add) await prisma.coachMemory.upsert({ where: { userId_kind_key: { userId, kind: f.kind, key: f.key } }, create: { userId, kind: f.kind, key: f.key, fact: f.fact, source }, update: { fact: f.fact, source } });
  const extra = await prisma.coachMemory.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, skip: 60, select: { id: true } });
  if (extra.length) await prisma.coachMemory.deleteMany({ where: { id: { in: extra.map((e) => e.id) } } });
}

export async function editFact(userId: string, id: string, fact: string) {
  if (!hasDb) return void mem.facts.set(userId, (mem.facts.get(userId) ?? []).map((f) => (f.id === id ? { ...f, fact, updatedAt: new Date().toISOString() } : f)));
  await prisma.coachMemory.updateMany({ where: { id, userId }, data: { fact, source: "user" } });
}

export async function deleteFact(userId: string, id: string | "all") {
  if (!hasDb) return void mem.facts.set(userId, id === "all" ? [] : (mem.facts.get(userId) ?? []).filter((f) => f.id !== id));
  await prisma.coachMemory.deleteMany({ where: id === "all" ? { userId } : { id, userId } });
}

export async function getMessages(userId: string, day: string) {
  if (!hasDb) return (mem.msgs.get(userId) ?? []).filter((m) => m.day === day);
  const rows = await prisma.coachMessage.findMany({ where: { userId, day }, orderBy: { createdAt: "asc" }, take: 100 });
  return rows.map((r) => ({ id: r.id, day: r.day, role: r.role as "user" | "coach", text: r.text, meta: r.meta, at: r.createdAt.getTime() }));
}

export async function addMessage(userId: string, day: string, role: "user" | "coach", text: string, meta?: object) {
  if (!hasDb) return void mem.msgs.set(userId, [...(mem.msgs.get(userId) ?? []), { id: rid(), day, role, text, meta: meta ?? null, at: Date.now() }]);
  await prisma.coachMessage.create({ data: { userId, day, role, text, meta: meta ?? undefined } });
}

export async function getTasks(userId: string, day: string): Promise<Task[]> {
  if (!hasDb) return (mem.tasks.get(userId) ?? []).filter((t) => t.day === day);
  const rows = await prisma.coachTask.findMany({ where: { userId, day }, orderBy: { id: "asc" } });
  return rows.map((r) => ({ id: r.id, day: r.day, key: r.key, title: r.title, href: r.href, why: r.why, done: Boolean(r.doneAt) }));
}

export async function setTasks(userId: string, day: string, tasks: CoachTask[]) {
  if (!hasDb) return void mem.tasks.set(userId, [...(mem.tasks.get(userId) ?? []).filter((t) => t.day !== day), ...tasks.map((t) => ({ ...t, id: rid(), day, done: false }))]);
  for (const t of tasks) await prisma.coachTask.upsert({ where: { userId_day_key: { userId, day, key: t.key } }, create: { userId, day, ...t }, update: {} });
}

export async function tickTask(userId: string, id: string, done: boolean) {
  if (!hasDb) return void mem.tasks.set(userId, (mem.tasks.get(userId) ?? []).map((t) => (t.id === id ? { ...t, done } : t)));
  await prisma.coachTask.updateMany({ where: { id, userId }, data: { doneAt: done ? new Date() : null } });
}
