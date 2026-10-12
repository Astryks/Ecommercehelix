import Link from "next/link";
import { ArrowRight, Gauge, TrendingUp } from "lucide-react";

/** Today: shortcuts to the growth dashboard and the key metrics panel. */
export function GrowthLinks({ profitLine }: { profitLine?: string }) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Link href="/dashboard/growth" className="card flex items-center justify-between gap-4 p-4 transition hover:ring-2 hover:ring-cyan-200">
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><TrendingUp className="h-5 w-5" aria-hidden /></span>
          <span>
            <span className="block font-semibold text-slate-900">Growth: revenue and profit</span>
            <span className="block text-sm text-slate-600">{profitLine ?? "Day, week, month and year, with the trend."}</span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-cyan-700" aria-hidden />
      </Link>
      <Link href="/dashboard/metrics" className="card flex items-center justify-between gap-4 p-4 transition hover:ring-2 hover:ring-cyan-200">
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><Gauge className="h-5 w-5" aria-hidden /></span>
          <span>
            <span className="block font-semibold text-slate-900">Key metrics</span>
            <span className="block text-sm text-slate-600">What you fill in, what Helix works out, and what good looks like.</span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-cyan-700" aria-hidden />
      </Link>
    </div>
  );
}
