import type { ManualPeriod } from "./core";

/** Template: one row per month (YYYY-MM) or week (Monday YYYY-MM-DD). Totals only, no customer details. */
export const LAST_YEAR_TEMPLATE = "period,sales,costs,ad_spend,orders\n2025-01,12000,8400,2100,140\n2025-02,11000,7900,1900,128\n";

export function parseLastYearCsv(text: string): ManualPeriod[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const head = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/[^a-z_]/g, ""));
  const col = (names: string[]) => head.findIndex((h) => names.includes(h));
  const ip = col(["period", "month", "week", "date"]), is = col(["sales", "revenue"]), ic = col(["costs", "cost", "total_costs"]), ia = col(["ad_spend", "adspend", "ads"]), io = col(["orders"]);
  if (ip < 0 || is < 0) return [];
  const n = (v?: string) => Math.max(0, Number((v ?? "").replace(/[$,"\s]/g, "")) || 0);
  const out: ManualPeriod[] = [];
  for (const l of lines.slice(1, 400)) {
    const c = splitRow(l);
    const p = (c[ip] ?? "").trim();
    const kind = /^\d{4}-\d{2}$/.test(p) ? "month" : /^\d{4}-\d{2}-\d{2}$/.test(p) ? "week" : null;
    if (!kind) continue;
    out.push({ kind, start: kind === "month" ? p + "-01" : p, sales: n(c[is]), costs: ic >= 0 ? n(c[ic]) : 0, adSpend: ia >= 0 ? n(c[ia]) : 0, orders: io >= 0 ? Math.round(n(c[io])) : 0 });
  }
  return out;
}

function splitRow(l: string): string[] {
  const out: string[] = []; let cur = "", q = false;
  for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; }
  out.push(cur);
  return out;
}
