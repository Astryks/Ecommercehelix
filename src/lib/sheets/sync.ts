import "server-only";
import { hasDb, prisma } from "../db";
import { upsertDays } from "../repo";
import { parseCsv } from "../scorecard";
import { logAudit } from "../meta/store";
import { getInput, saveInput } from "../tools/server";
import { normaliseHeaders, sheetCsvUrl } from "./import";

/** The linked sheet, kept in ToolInput (kind "sheet") so no schema change is needed. */
export type SheetLink = { url: string | null; lastSyncAt: string | null; lastError: string | null; days: number };
const KIND = "sheet";
const empty: SheetLink = { url: null, lastSyncAt: null, lastError: null, days: 0 };

export const getSheetLink = (userId: string) => getInput<SheetLink>(userId, KIND, empty);

export type SheetResult = { ok: true; days: number } | { ok: false; error: "sheet_url" | "sheet_access" | "sheet_empty" };

/** Fetch the sheet as CSV and upsert its days. Saves the link so the daily cron can refresh it. */
export async function importSheetUrl(userId: string, input: string, actor: "user" | "cron" = "user"): Promise<SheetResult> {
  const url = sheetCsvUrl(input);
  if (!url) return { ok: false, error: "sheet_url" };
  const res = await fetch(url, { cache: "no-store", redirect: "follow" }).catch(() => null);
  const text = res?.ok ? await res.text() : "";
  let r: SheetResult;
  if (!text || text.length > 2_000_000 || /^\s*</.test(text)) r = { ok: false, error: "sheet_access" };
  else {
    const days = parseCsv(normaliseHeaders(text)).map((d) => ({ ...d, source: "csv" }));
    if (!days.length) r = { ok: false, error: "sheet_empty" };
    else {
      await upsertDays(userId, days);
      r = { ok: true, days: days.length };
    }
  }
  // A user import saves the link only when it worked; a cron failure keeps the link and records the error.
  if (r.ok) await saveInput(userId, KIND, { url: input.trim(), lastSyncAt: new Date().toISOString(), lastError: null, days: r.days } satisfies SheetLink);
  else if (actor === "cron") await saveInput(userId, KIND, { ...(await getSheetLink(userId)), lastError: r.error } satisfies SheetLink);
  await logAudit(userId, { actor, action: "sheet.sync", target: "google-sheet", outcome: r.ok ? "ok" : "error", detail: r.ok ? { days: r.days } : { error: r.error } }).catch(() => {});
  return r;
}

export async function unlinkSheet(userId: string) {
  if (hasDb) await prisma.toolInput.deleteMany({ where: { userId, kind: KIND } });
}

/** Daily cron: re-import every linked sheet. */
export async function syncAllSheets() {
  if (!hasDb) return [];
  const rows = await prisma.toolInput.findMany({ where: { kind: KIND }, select: { userId: true, data: true } });
  const out: { userId: string; ok: boolean }[] = [];
  for (const row of rows) {
    const url = (row.data as SheetLink | null)?.url;
    if (!url) continue;
    const r = await importSheetUrl(row.userId, url, "cron").catch(() => ({ ok: false }) as const);
    out.push({ userId: row.userId, ok: r.ok });
  }
  return out;
}
