"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Rollup } from "@/lib/scoreboard/core";

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
type By = "week" | "month" | "year";

export function HistoryView({ data, locked }: { data: Partial<Record<By, Rollup[]>>; locked: By[] }) {
  const [by, setBy] = useState<By>(data.month ? "month" : "week");
  const [view, setView] = useState<"chart" | "table">("chart");
  const rows = data[by] ?? [];
  const shown = by === "week" ? rows.slice(-26) : rows.slice(-24);
  void BarChart;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="inline-flex rounded-lg bg-slate-100 p-1">
          {(["week", "month", "year"] as By[]).map((b) => (
            <button key={b} role="tab" aria-selected={by === b} disabled={locked.includes(b)} onClick={() => setBy(b)} className={`rounded-md px-3 py-1 text-sm font-semibold ${by === b ? "bg-white shadow text-slate-900" : "text-slate-600"} disabled:opacity-50`}>
              {b === "week" ? "Week by week" : b === "month" ? "Month by month" : "Year by year"}{locked.includes(b) ? " 🔒" : ""}
            </button>
          ))}
        </div>
        <div className="ml-auto inline-flex rounded-lg bg-slate-100 p-1">
          {(["chart", "table"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-md px-3 py-1 text-sm ${view === v ? "bg-white shadow font-semibold" : "text-slate-600"}`}>{v === "chart" ? "Chart" : "Table"}</button>)}
        </div>
      </div>
      {!shown.length ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">No numbers for this view yet. Connect Shopify, add yesterday on Today, or add last year below.</p>
      ) : view === "chart" ? (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer>
            <ComposedChart data={shown} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={16} />
              <YAxis tickFormatter={(v) => (Math.abs(v) >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)} tick={{ fontSize: 11 }} width={48} />
              <Tooltip formatter={(v) => money(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="sales" name="Sales" fill="#5A50D6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="costs" name="Costs" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
              <Line dataKey="profit" name="Profit" stroke="#448b6f" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm tabular-nums">
            <thead><tr className="text-left text-xs text-slate-500">{["Period", "Sales", "Costs", "Profit", "Margin", "Orders", "Ad spend", "ROAS"].map((h) => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
            <tbody>
              {[...shown].reverse().map((r) => (
                <tr key={r.key} className="border-t border-slate-100">
                  <td className="px-2 py-1.5 font-medium">{r.label}{r.days === 0 ? <span className="ml-1 text-xs text-slate-400">(entered)</span> : ""}</td>
                  <td className="px-2">{money(r.sales)}</td><td className="px-2">{money(r.costs)}</td>
                  <td className={`px-2 ${r.profit < 0 ? "text-rose-700" : ""}`}>{money(r.profit)}</td>
                  <td className="px-2">{r.marginPct === null ? "—" : `${r.marginPct}%`}</td><td className="px-2">{Math.round(r.orders)}</td>
                  <td className="px-2">{r.adSpend ? money(r.adSpend) : "—"}</td><td className="px-2">{r.roas ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
