import { STAGE_INFO } from "@/lib/stages";
import { DEFAULT_GOALS, DEFAULT_MER, LADDER, type Goals } from "@/lib/goals";

const SUFFIX: Record<string, string> = { pct: "%", money: "$", count: "" };

/**
 * Inputs for the monthly goals ladder. Put inside a <form>; submits each goal key plus "merPct".
 * With `values`, fields are prefilled. Without, they are blank with both tracks' suggestions as
 * placeholders, and blank fields fall back to the suggestion for the chosen track.
 */
export function GoalsFields({ values, merPct }: { values?: Goals; merPct?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {LADDER.map((s) => {
        const name = s.key === "mer" ? "merPct" : s.key;
        const v = s.key === "mer" ? merPct : values?.[s.key];
        const sGrow = s.key === "mer" ? DEFAULT_MER.growing : DEFAULT_GOALS.growing[s.key];
        const sStart = s.key === "mer" ? DEFAULT_MER.starting : DEFAULT_GOALS.starting[s.key];
        const st = STAGE_INFO[s.stage];
        return (
          <label key={s.key} className={`block rounded-xl border p-3 ${s.key === "netProfit" ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white"}`}>
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">{s.key === "mer" ? "MER target (ad spend ÷ sales)" : s.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ring-1 ${st.chip}`}>{st.name}</span>
            </span>
            <span className="mt-2 flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-cyan-500">
              {s.unit === "money" && <span className="pl-3 text-sm text-slate-500">$</span>}
              <input name={name} inputMode="decimal" defaultValue={v ?? ""} placeholder={`${sGrow.toLocaleString("en-AU")} growing · ${sStart.toLocaleString("en-AU")} starting`}
                className="w-full rounded-lg bg-transparent px-3 py-2 text-sm tabular-nums focus:outline-none" aria-describedby={`${name}-hint`} />
              {s.unit === "pct" && <span className="pr-3 text-sm text-slate-500">{SUFFIX.pct}</span>}
            </span>
            <span id={`${name}-hint`} className="mt-1 block text-xs text-slate-500">{s.key === "sessions" ? "Visits a month" : s.key === "netProfit" ? "A month, after every cost" : `Good: ${s.bench}`}</span>
          </label>
        );
      })}
    </div>
  );
}
