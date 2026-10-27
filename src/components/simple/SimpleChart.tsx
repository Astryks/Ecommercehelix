"use client";
import { useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lock } from "lucide-react";
import { chartSentence, type ChartMode, type ChartPoint } from "@/lib/simple/chart-series";

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const MODES: { id: ChartMode; label: string }[] = [{ id: "day", label: "Days" }, { id: "week", label: "Weeks" }, { id: "month", label: "Months" }];

/** Big, simple chart: sales or profit, by day / week / month. Locked modes come from the server (no data sent). */
export function SimpleChart({ series, locked = [], unlockHref = "/dashboard/billing" }: { series: Partial<Record<ChartMode, ChartPoint[]>>; locked?: ChartMode[]; unlockHref?: string }) {
  const [mode, setMode] = useState<ChartMode>("day");
  const [what, setWhat] = useState<"sales" | "profit">("sales");
  const pts = series[mode] ?? [];
  const isLocked = locked.includes(mode);
  const line = chartSentence(pts, mode, what);
  const btn = (on: boolean) => `rounded-full px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5A50D6] ${on ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"}`;
  return (
    <div data-testid="simple-chart">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Show sales or profit" className="flex gap-1.5">
          <button type="button" aria-pressed={what === "sales"} className={btn(what === "sales")} onClick={() => setWhat("sales")}>Sales</button>
          <button type="button" aria-pressed={what === "profit"} className={btn(what === "profit")} onClick={() => setWhat("profit")}>Profit</button>
        </div>
        <div role="group" aria-label="Group by" className="flex gap-1.5">
          {MODES.map((m) => <button key={m.id} type="button" aria-pressed={mode === m.id} className={btn(mode === m.id)} onClick={() => setMode(m.id)}>{m.label}{locked.includes(m.id) && <Lock className="ml-1 inline h-3 w-3" aria-label="Locked" />}</button>)}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{what === "sales" ? "Sales = what customers paid you." : "Profit = what you kept after costs."}</p>
      {isLocked ? (
        <div className="mt-3 grid h-56 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center" data-testid="chart-locked">
          <p className="text-sm text-slate-700">Weeks and months are part of Starter. You can see your days for free.<br /><Link href={unlockHref} className="mt-2 inline-block font-semibold text-cyan-700 underline">Unlock with Starter</Link></p>
        </div>
      ) : pts.length === 0 ? (
        <div className="mt-3 grid h-56 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600" data-testid="chart-empty">Add your first numbers and your chart will appear here.</div>
      ) : (
        <>
          <div className="mt-3 h-56 w-full" aria-label={`${what === "sales" ? "Sales" : "Profit"} by ${mode}`} role="img">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pts} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} width={56} tickFormatter={(v) => money(Number(v))} />
                <Tooltip formatter={(v) => [money(Number(v)), what === "sales" ? "Sales" : "Profit"]} />
                <Bar dataKey={what} fill={what === "sales" ? "#5A50D6" : "#059669"} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {line && <p className="mt-2 text-sm text-slate-700">{line}</p>}
        </>
      )}
    </div>
  );
}
