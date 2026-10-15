import "server-only";
/**
 * Members Facebook group lists, kept as events in the existing audit log (no schema change).
 * Without a database (local demo) the events live in memory.
 */
import { hasDb, prisma } from "../db";
import { statusFrom, type GroupEvent, type GroupEventKind, type GroupStatus } from "./state";

const PREFIX = "fbgroup.";
const mem: GroupEvent[] = [];
const memDigested = new Set<string>();
const memPeople = new Map<string, { name: string; email: string }>();

export async function addGroupEvent(userId: string, kind: GroupEventKind, actor = "helix") {
  const at = new Date().toISOString();
  if (!hasDb) { mem.push({ userId, kind, at }); return; }
  await prisma.auditLog.create({ data: { userId, actor, action: PREFIX + kind, target: "facebook-group", outcome: "ok" } });
}

async function allEvents(): Promise<GroupEvent[]> {
  if (!hasDb) return [...mem];
  const kinds: GroupEventKind[] = ["activated", "approved", "deactivated", "removed", "done"];
  const rows = await prisma.auditLog.findMany({ where: { action: { in: kinds.map((k) => PREFIX + k) } }, select: { userId: true, action: true, createdAt: true }, orderBy: { createdAt: "asc" }, take: 20_000 });
  return rows.map((r) => ({ userId: r.userId, kind: r.action.slice(PREFIX.length) as GroupEventKind, at: r.createdAt.toISOString() }));
}

export type GroupPerson = { userId: string; name: string; email: string; status: GroupStatus; since: string; key: string };

/** Everyone with a group state, with name and email. */
export async function groupPeople(): Promise<GroupPerson[]> {
  const st = statusFrom(await allEvents());
  const ids = [...st.keys()];
  const people = new Map<string, { name: string; email: string }>();
  if (hasDb && ids.length) for (const u of await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true } })) people.set(u.id, { name: u.name ?? "", email: u.email ?? "" });
  return ids.map((userId) => {
    const s = st.get(userId)!;
    const p = people.get(userId) ?? memPeople.get(userId) ?? { name: "", email: "" };
    return { userId, name: p.name || p.email.split("@")[0] || "Member", email: p.email, status: s.status, since: s.since, key: `${userId}:${s.status}:${s.since}` };
  }).sort((a, b) => b.since.localeCompare(a.since));
}

/** Entries the owner has not been emailed about yet. */
export async function undigested(list: GroupPerson[]): Promise<GroupPerson[]> {
  const todo = list.filter((p) => p.status === "approve" || p.status === "remove");
  if (!hasDb) return todo.filter((p) => !memDigested.has(p.key));
  const seen = new Set((await prisma.auditLog.findMany({ where: { action: PREFIX + "digested", target: { in: todo.map((p) => p.key) } }, select: { target: true } })).map((r) => r.target));
  return todo.filter((p) => !seen.has(p.key));
}
export async function markDigested(list: GroupPerson[]) {
  if (!hasDb) { list.forEach((p) => memDigested.add(p.key)); return; }
  if (list.length) await prisma.auditLog.createMany({ data: list.map((p) => ({ userId: p.userId, actor: "cron", action: PREFIX + "digested", target: p.key, outcome: "ok" })) });
}

/** Local demo only: sample rows for screenshots. */
export function seedDemoGroup() {
  if (hasDb || mem.length) return;
  const day = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
  const rows: [string, string, string, GroupEventKind[]][] = [
    ["d1", "Maya Chen", "maya@petalandpine.com", ["activated"]],
    ["d2", "Jordan Okafor", "jordan@okaforgoods.com", ["activated"]],
    ["d3", "Priya Nair", "priya@saltandsage.co", ["activated"]],
    ["d4", "Tom Becker", "tom@trailcoffee.com", ["activated", "approved", "deactivated"]],
    ["d5", "Lena Ruiz", "lena@ruizceramics.com", ["activated", "approved", "deactivated"]],
    ["d6", "Sam Patel", "sam@patelprints.com", ["activated", "approved"]],
  ];
  rows.forEach(([id, name, email, kinds], i) => { memPeople.set(id, { name, email }); kinds.forEach((k, j) => mem.push({ userId: id, kind: k, at: day(10 - i - j * 0.1) })); });
}
