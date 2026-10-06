import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import type { Card } from "@/lib/metric-info";

const FLAG = {
  green: { dot: "bg-emerald-500", ring: "ring-emerald-200", text: "On track" },
  amber: { dot: "bg-amber-400", ring: "ring-amber-200", text: "Watch" },
  red: { dot: "bg-rose-500", ring: "ring-rose-200", text: "Act" },
} as const;

/** One metric with its rating, change vs the previous period, and an "i" panel in plain words. */
export function MetricCard({ c }: { c: Card }) {
  const flat = c.delta !== null && Math.abs(c.delta) < 0.5;
  const good = c.delta === null || c.better === null || flat ? null : c.better === "up" ? c.delta >= 0 : c.delta <= 0;
  return (
    <div className={`card relative p-4 ${c.flag ? `ring-1 ${FLAG[c.flag].ring}` : ""}`} data-metric={c.key}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">{c.label}</p>
        <details className="group">
          <summary className="flex h-6 w-6 cursor-pointer list-none items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`What ${c.label} means`}>
            <Info className="h-4 w-4" aria-hidden />
          </summary>
          <div className="absolute -left-1 -right-1 top-10 z-30 rounded-xl border border-slate-200 bg-white p-4 text-left text-[13px] leading-5 text-slate-700 shadow-xl">
            <p className="font-semibold text-slate-900">{c.label}</p>
            <p className="mt-2"><strong>What it means.</strong> {c.info.what}</p>
            <p className="mt-2"><strong>How it is worked out.</strong> {c.info.how}</p>
            <p className="mt-2"><strong>What good looks like.</strong> {c.info.good}</p>
          </div>
        </details>
      </div>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{c.value}</p>
      {c.sub && <p className="mt-0.5 truncate text-xs text-slate-500" title={c.sub}>{c.sub}</p>}
      <div className="mt-2 flex items-center justify-between text-xs">
        {c.delta !== null ? (
          <span className={`inline-flex items-center gap-0.5 font-semibold ${good === null ? "text-slate-500" : good ? "text-emerald-600" : "text-rose-600"}`}>
            {flat ? "About the same as previous" : <>
              {c.delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
              {Math.abs(c.delta).toFixed(Math.abs(c.delta) < 10 ? 1 : 0)}% vs previous</>}
          </span>
        ) : <span className="text-slate-400">No earlier period</span>}
        {c.flag && (
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${FLAG[c.flag].dot}`} aria-hidden /> {FLAG[c.flag].text}
          </span>
        )}
      </div>
    </div>
  );
}
