import "server-only";
import { hasDb, prisma } from "../db";
import { safeGet } from "./fetch";
import { normaliseStoreUrl, robotsDisallows } from "./guard";
import { collectFacts, findingsFrom, firstProductLink, type AuditInput, type Facts, type Finding, type ShopifyProduct } from "./checks";

export type AuditRunRow = { id: string; url: string; startedAt: string; finishedAt: string | null; ok: boolean; findings: Finding[]; facts: Facts | null; error: string | null };

const g = globalThis as unknown as { __helixAudits?: Map<string, AuditRunRow[]> };
const mem = (g.__helixAudits ??= new Map());

/**
 * Check one store with plain server fetches: robots.txt, the home page, /products.json,
 * one product page and /cart.js (when robots.txt allows). About 4 to 5 requests, no paid APIs.
 */
export async function checkStore(rawUrl: string): Promise<{ url: string; facts: Facts; findings: Finding[] }> {
  const u = normaliseStoreUrl(rawUrl);
  if (!u) throw new Error("That doesn't look like a public store address.");
  const base = `${u.protocol}//${u.host}`;
  const robots = await safeGet(`${base}/robots.txt`, { timeoutMs: 6000, maxBytes: 100_000 }).then((r) => (r.status < 400 ? r.body : ""), () => "");
  const allowed = (path: string) => !robotsDisallows(robots, path);
  const skipped: string[] = [];

  const homeRes = await safeGet(u.toString());
  if (homeRes.status >= 400) throw new Error(`Your store answered with error ${homeRes.status}.`);
  const origin = new URL(homeRes.url).origin;

  let products: ShopifyProduct[] | null = null;
  if (allowed("/products.json")) {
    const pj = await safeGet(`${origin}/products.json?limit=10`, { timeoutMs: 8000 }).catch(() => null);
    if (pj && pj.status === 200 && /json/i.test(pj.contentType)) {
      try { const arr = JSON.parse(pj.body).products; if (Array.isArray(arr) && arr.length) products = arr; } catch { /* not Shopify */ }
    }
  } else skipped.push("/products.json");

  const productUrl = products?.[0]?.handle ? `${origin}/products/${products[0].handle}` : firstProductLink(homeRes.body, origin);
  let product: AuditInput["product"] = null;
  if (productUrl) {
    const path = new URL(productUrl).pathname;
    if (allowed(path)) {
      const r = await safeGet(productUrl).catch(() => null);
      if (r) product = { url: r.url, status: r.status, body: r.body, bytes: r.bytes };
    } else skipped.push(path);
  }

  let cartStatus: number | null = null;
  if (allowed("/cart.js")) cartStatus = await safeGet(`${origin}/cart.js`, { timeoutMs: 6000, maxBytes: 50_000 }).then((r) => r.status, () => null);
  else skipped.push("/cart.js");

  const input: AuditInput = { url: homeRes.url, home: homeRes, products, product, cartStatus, skipped };
  const facts = collectFacts(input);
  return { url: homeRes.url, facts, findings: findingsFrom(facts, input) };
}

const toRow = (r: { id: string; url: string; startedAt: Date; finishedAt: Date | null; ok: boolean; findings: unknown; facts: unknown; error: string | null }): AuditRunRow => ({
  id: r.id, url: r.url, startedAt: r.startedAt.toISOString(), finishedAt: r.finishedAt?.toISOString() ?? null, ok: r.ok,
  findings: (r.findings as Finding[]) ?? [], facts: (r.facts as Facts) ?? null, error: r.error,
});

/** Runs in progress on this server, so a double tap does not start two checks. */
const running = new Map<string, number>();
export const isCheckRunning = (userId: string, now = Date.now()) => (running.get(userId) ?? 0) > now - 2 * 60_000;

/** Run a check and store it. Never throws: a failed check is saved with a plain error. */
export async function runAndSave(userId: string, url: string): Promise<AuditRunRow> {
  running.set(userId, Date.now());
  try { return await runAndSaveInner(userId, url); } finally { running.delete(userId); }
}

async function runAndSaveInner(userId: string, url: string): Promise<AuditRunRow> {
  const startedAt = new Date();
  let row: Omit<AuditRunRow, "id">;
  try {
    const r = await checkStore(url);
    row = { url: r.url, startedAt: startedAt.toISOString(), finishedAt: new Date().toISOString(), ok: true, findings: r.findings, facts: r.facts, error: null };
  } catch (e) {
    const msg = e instanceof Error && /abort|timeout/i.test(e.name + e.message) ? "Your store took too long to answer (15 seconds)." : e instanceof Error ? e.message.slice(0, 200) : "The check failed.";
    row = { url, startedAt: startedAt.toISOString(), finishedAt: new Date().toISOString(), ok: false, findings: [], facts: null, error: msg };
  }
  if (!hasDb) {
    const saved = { ...row, id: `mem-${Date.now()}` };
    mem.set(userId, [saved, ...(mem.get(userId) ?? [])].slice(0, 12));
    return saved;
  }
  const created = await prisma.auditRun.create({
    data: { userId, url: row.url, startedAt, finishedAt: new Date(), ok: row.ok, findings: row.findings as object[], facts: (row.facts ?? undefined) as object | undefined, error: row.error },
  });
  return toRow(created);
}

/** Latest runs, newest first. */
export async function auditRuns(userId: string, n = 2): Promise<AuditRunRow[]> {
  if (!hasDb) return (mem.get(userId) ?? []).slice(0, n);
  const rows = await prisma.auditRun.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, take: n });
  return rows.map(toRow);
}

/** Paid users with a store whose last check is older than `days`. Used by the monthly cron. */
export async function dueForRecheck(days = 30, limit = 25): Promise<{ userId: string; url: string }[]> {
  if (!hasDb) return [];
  const cutoff = new Date(Date.now() - days * 86_400_000);
  const users = await prisma.user.findMany({
    where: { isDemo: false, subscription: { plan: { in: ["STARTER", "GROWTH"] } }, stores: { some: {} } },
    select: { id: true, stores: { orderBy: { createdAt: "desc" }, take: 1, select: { url: true } }, auditRuns: { orderBy: { startedAt: "desc" }, take: 1, select: { startedAt: true } } },
    take: 500,
  });
  return users
    .filter((u) => u.stores[0]?.url && (!u.auditRuns[0] || u.auditRuns[0].startedAt < cutoff))
    .slice(0, limit)
    .map((u) => ({ userId: u.id, url: u.stores[0].url }));
}
