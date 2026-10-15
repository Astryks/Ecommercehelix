import Link from "next/link";
import { Download, Link2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getDays, getProfitSetup, getSettings } from "@/lib/repo";
import { TABLE_COLUMNS, tableRows, type TableRow } from "@/lib/numbers";

export const metadata = { title: "Daily table" };

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const MONEY = new Set<keyof TableRow>(["revenue", "aov", "adMeta", "adGoogle", "adTiktok", "adSpend", "cogs", "shipFees", "profit"]);
const fmt = (k: keyof TableRow, v: string | number) => (typeof v === "string" ? v : MONEY.has(k) ? money(v) : k === "roas" ? `${v.toFixed(2)}x` : k.endsWith("Pct") ? `${v.toFixed(1)}%` : v.toLocaleString("en-US"));

export default async function NumbersTable() {
  const u = await requireUser("/dashboard/numbers/table");
  const [days, settings, setup] = await Promise.all([getDays(u.id), getSettings(u.id), getProfitSetup(u.id)]);
  const unitCost = setup ? setup.productCost + setup.freightDuty + setup.packaging : 0;
  const rows = tableRows(days, settings, unitCost).slice(0, 90);
  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <p className="text-sm"><Link href="/dashboard/numbers" className="text-cyan-700 hover:underline">Numbers</Link> / Daily table</p>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily table</h1>
          <p className="mt-1 text-slate-700">One row per day, newest first. Connected tools fill it in every morning. Prices in USD.</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/numbers/export" className="btn-primary text-sm"><Download className="h-4 w-4" aria-hidden /> Download CSV</a>
          <Link href="/dashboard/connect" className="btn-ghost text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect your tools</Link>
        </div>
      </header>
      <div className="card overflow-x-auto p-0" data-testid="numbers-table">
        <table className="min-w-full text-right text-sm tabular-nums">
          <thead className="sticky top-0 bg-slate-100 text-xs text-slate-600">
            <tr>{TABLE_COLUMNS.map(([k, h]) => <th key={k} scope="col" className={`whitespace-nowrap px-3 py-2 font-semibold ${k === "date" ? "sticky left-0 bg-slate-100 text-left" : ""}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={TABLE_COLUMNS.length} className="p-6 text-center text-slate-600">No days yet. Connect a tool or type a day in.</td></tr> : rows.map((r) => (
              <tr key={r.date} className="border-t border-slate-100 odd:bg-white even:bg-slate-50/60">
                {TABLE_COLUMNS.map(([k]) => <td key={k} className={`whitespace-nowrap px-3 py-1.5 ${k === "date" ? "sticky left-0 bg-inherit text-left font-medium text-slate-900" : k === "profit" ? (r.profit < 0 ? "font-semibold text-rose-700" : "font-semibold text-emerald-700") : "text-slate-800"}`}>{fmt(k, r[k])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
