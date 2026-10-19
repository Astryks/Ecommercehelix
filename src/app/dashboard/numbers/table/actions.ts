"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { clearExampleData, getRawDays, setDayField, upsertDays } from "@/lib/repo";
import { NUM_FIELDS, sum, type DayInput } from "@/lib/scorecard";
import type { ImportDay } from "@/lib/csv-import";
import { SALES_FIELDS, TAX_INCLUSIVE_SOURCES } from "@/lib/tax";

const YMD = /^\d{4}-\d{2}-\d{2}$/;
type Field = (typeof NUM_FIELDS)[number];
const isField = (k: string): k is Field => (NUM_FIELDS as readonly string[]).includes(k);
const blank = (date: string): DayInput => ({ ...sum([]), date, source: "manual" }) as DayInput;
const clamp = (f: Field, v: number) => { const n = Math.max(0, Math.min(1e9, Number.isFinite(v) ? v : 0)); return ["orders", "units", "sessions", "newCustomerOrders", "addToCarts"].includes(f) ? Math.round(n) : Math.round(n * 100) / 100; };

/** Add an empty day (no-op if it exists). */
export async function addDay(date: string): Promise<{ ok: boolean; error?: string }> {
  const u = await requireUser("/dashboard/numbers/table");
  if (!YMD.test(date)) return { ok: false, error: "Pick a date." };
  const days = await getRawDays(u.id);
  if (!days.some((d) => d.date === date)) await upsertDays(u.id, [blank(date)]);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Save one edited cell (raw inputs only). */
export async function saveCell(date: string, field: string, value: number): Promise<{ ok: boolean }> {
  const u = await requireUser("/dashboard/numbers/table");
  if (!YMD.test(date) || !isField(field)) return { ok: false };
  const days = await getRawDays(u.id);
  const cur = days.find((d) => d.date === date) ?? blank(date);
  // Imported days stay imported. A day synced from order prices keeps its source unless you retype a sales number.
  const keep = cur.source === "csv" || (TAX_INCLUSIVE_SOURCES.has(cur.source ?? "") && !(SALES_FIELDS as readonly string[]).includes(field));
  await setDayField(u.id, { ...cur, source: keep ? cur.source : "manual" }, field, clamp(field, value));
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Merge imported days by date: only the mapped columns change, so nothing is duplicated or wiped. */
export async function importDays(rows: ImportDay[], opts?: { taxIncluded?: boolean }): Promise<{ ok: boolean; added: number; updated: number; clearedExamples?: boolean; error?: string }> {
  const u = await requireUser("/dashboard/numbers/table");
  const list = Array.isArray(rows) ? rows.filter((r) => r && YMD.test(r.date)).slice(0, 3000) : [];
  if (!list.length) return { ok: false, added: 0, updated: 0, error: "No rows with a date to import." };
  // Your first real import replaces the example numbers, so real and example data never mix.
  const before = await getRawDays(u.id);
  const clearedExamples = before.some((d) => d.example);
  if (clearedExamples) await clearExampleData(u.id);
  const existing = new Map(before.filter((d) => !d.example).map((d) => [d.date, d]));
  let added = 0, updated = 0;
  const out = list.map((r) => {
    const cur = existing.get(r.date);
    cur ? updated++ : added++;
    const d = { ...(cur ?? blank(r.date)), source: opts?.taxIncluded ? "csv-orders" : "csv" } as DayInput;
    for (const [k, v] of Object.entries(r)) if (isField(k) && typeof v === "number") d[k] = clamp(k, v);
    return d;
  });
  await upsertDays(u.id, out);
  revalidatePath("/dashboard", "layout");
  return { ok: true, added, updated, clearedExamples };
}
