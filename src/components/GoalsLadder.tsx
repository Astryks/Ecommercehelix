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
  if (variant === "teaser") return <LadderStepper />;
  return (
    <ol className={compact ? "grid gap-2 lg:grid-cols-2" : "space-y-2"} aria-label="Goals ladder, from visits to net profit">
      {steps.map((s, i) => {
        const st = STAGE_INFO[s.stage];
        const last = s.key === "netProfit";
        const target = goals ? targetOf(s, goals, merPct) : null;
        const actual = actuals ? actuals[s.key] ?? null : null;
        const rating = target !== null ? rateGoal(s, actual, target) : null;
        // Funnel shape: each rung a little narrower, net profit the narrowest and boldest.
        const inset = 0;
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
                {variant !== "full" && !compact && <p className={`text-xs text-slate-500`}>Good: {s.bench}</p>}
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
    <p className={`rounded-xl border-l-4 border-[#5A50D6] bg-paper-2 px-4 py-3 text-sm leading-6 text-slate-700 ${className}`}>
      <strong className="font-semibold text-slate-900">Revenue is the vanity number. Profit is the goal.</strong> A store can double its sales and still lose money if ads, discounts and product costs grow faster. Each rung of the ladder feeds the next, and every one of them is there to grow the last one: net profit.
    </p>
  );
}

/** Stage colours for the home page stepper: purple, coral, mint (all AA on white). */
const STAGE_TONE: Record<string, { dot: string; chip: string }> = {
  attract: { dot: "bg-[#5A50D6] text-white", chip: "bg-[#E8E6FB] text-[#453CBF]" },
  convert: { dot: "bg-[#C2410C] text-white", chip: "bg-[#FFE8DC] text-[#9A3412]" },
  grow: { dot: "bg-[#2F7359] text-white", chip: "bg-[#DDF1E7] text-[#255C48]" },
};

/** Home page version: a clean vertical stepper, one connected line, net profit as the final rung. */
function LadderStepper() {
  return (
    <ol className="relative min-w-0" aria-label="Goals ladder, from visits to net profit">
      <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-0.5 rounded bg-gradient-to-b from-[#5A50D6] via-[#FF8A5B] to-[#2F7359] opacity-40" />
      {LADDER.map((s, i) => {
        const last = s.key === "netProfit";
        const tone = STAGE_TONE[s.stage] ?? STAGE_TONE.grow;
        return (
          <li key={s.key} className="relative flex min-w-0 items-center gap-4 py-1.5">
            <span className={`relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold ring-4 ring-white ${last ? "bg-[#2F7359] text-white" : tone.dot}`}>
              {last ? <Trophy className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <div className={`flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-1 rounded-xl border px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${last ? "border-[#2F7359] bg-[#EFF6F2] shadow-sm" : "border-slate-200 bg-white"}`}>
              <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className={`min-w-0 break-words font-semibold ${last ? "text-[#1F4D3B]" : "text-slate-900"}`}>{s.label}</span>
                <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone.chip}`}>{STAGE_INFO[s.stage].name}</span>
              </p>
              <span className={`min-w-0 text-sm sm:max-w-[45%] sm:text-right ${last ? "font-semibold text-[#1F4D3B]" : "text-slate-600"}`}>{s.bench}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
