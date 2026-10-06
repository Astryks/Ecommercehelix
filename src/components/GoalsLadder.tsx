import { ArrowDown, Trophy } from "lucide-react";
import { STAGE_INFO } from "@/lib/stages";
import { LADDER, fmtGoal, rateGoal, targetOf, type Actuals, type Goals } from "@/lib/goals";

const RATING: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
};
const RATING_WORD: Record<string, string> = { green: "On track", amber: "Close", red: "Off track" };

/**
 * The goals ladder in funnel order. `variant`:
 *  - "teaser": short version for the home page (benchmarks only)
 *  - "full": with plain words and what good looks like (Learn)
 *  - "track": your monthly targets against the last 30 days (Today, Dashboard, Goals)
 */
export function GoalsLadder({ variant = "full", goals, merPct = 30, actuals, compact = false }: {
  variant?: "teaser" | "full" | "track";
  goals?: Goals;
  merPct?: number;
  actuals?: Actuals;
  compact?: boolean;
}) {
  const steps = LADDER;
  return (
    <ol className={compact ? "grid gap-2 lg:grid-cols-2" : "space-y-2"} aria-label="Goals ladder, from visits to net profit">
      {steps.map((s, i) => {
        const st = STAGE_INFO[s.stage];
        const last = s.key === "netProfit";
        const target = goals ? targetOf(s, goals, merPct) : null;
        const actual = actuals ? actuals[s.key] ?? null : null;
        const rating = target !== null ? rateGoal(s, actual, target) : null;
        // Funnel shape: each rung a little narrower, net profit the narrowest and boldest.
        const inset = compact ? 0 : Math.min(i, 8) * 1.4;
        return (
          <li key={s.key} className={compact && last ? "lg:col-span-2" : ""} style={{ marginLeft: `${inset}%`, marginRight: `${inset}%` }}>
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-4 ${compact ? "py-2" : "py-3"} ${last ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}>
              <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${last ? "bg-emerald-600 text-white" : "bg-paper-2 text-slate-700"}`}>
                {last ? <Trophy className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className={`font-semibold ${last ? "text-emerald-900" : "text-slate-900"}`}>{s.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${st.chip}`}>{st.name}</span>
                  {last && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">The goal</span>}
                </p>
                {variant === "full" && <p className="mt-1 text-sm leading-6 text-slate-600">{s.plain}</p>}
                {variant === "full" && <p className="mt-1 text-sm leading-6 text-slate-700"><strong className="font-semibold text-slate-900">What good looks like:</strong> {s.good}</p>}
                {variant !== "full" && !compact && <p className={`text-xs text-slate-500 ${variant === "teaser" ? "sm:hidden" : ""}`}>Good: {s.bench}</p>}
              </div>
              {variant === "track" && target !== null && (
                <div className="flex flex-none items-center gap-4 text-right text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Target</p>
                    <p className="font-semibold tabular-nums text-slate-900">{s.key === "netProfit" && target === 0 ? "$0+" : fmtGoal(s.unit, target)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Last 30 days</p>
                    <p className="font-semibold tabular-nums text-slate-900">{actual === null ? "Not tracked" : fmtGoal(s.unit, actual)}</p>
                  </div>
                  <span className={`w-20 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ring-1 ${rating ? RATING[rating] : "bg-slate-50 text-slate-500 ring-slate-200"}`}>{rating ? RATING_WORD[rating] : "No data"}</span>
                </div>
              )}
              {variant === "teaser" && <span className="hidden flex-none text-xs font-medium text-slate-500 sm:block">{s.bench}</span>}
            </div>
            {!last && !compact && <ArrowDown className="mx-auto my-0.5 h-3.5 w-3.5 text-slate-300" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

/** "Revenue is vanity, profit is the goal" note. */
export function VanityNote({ className = "" }: { className?: string }) {
  return (
    <p className={`rounded-xl bg-paper-2 px-4 py-3 text-sm leading-6 text-slate-700 ${className}`}>
      <strong className="font-semibold text-slate-900">Revenue is the vanity number. Profit is the goal.</strong> A store can double its sales and still lose money if ads, discounts and product costs grow faster. Each rung of the ladder feeds the next, and every one of them is there to grow the last one: net profit.
    </p>
  );
}
