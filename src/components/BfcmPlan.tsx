import { AlertTriangle, FlaskConical } from "lucide-react";
import { BFCM_CRITICAL, BFCM_STAGES, bfcmTask, type BfcmTip } from "@/lib/seasons";

/** Which stage of the Black Friday runway a date is in (0 = August ... 4 = December and January), or null. */
export function bfcmStageIndex(today: string): number | null {
  const m = Number(today.slice(5, 7));
  return m === 8 ? 0 : m === 9 ? 1 : m === 10 ? 2 : m === 11 ? 3 : m === 12 || m === 1 ? 4 : null;
}

/** The five-stage runway, August to January. `current` highlights where you are now. */
export function BfcmTimeline({ current = null, showTasks = true, dark = false }: { current?: number | null; showTasks?: boolean; dark?: boolean }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Black Friday plan, month by month">
      {BFCM_STAGES.map((s, i) => {
        const on = current === i;
        const base = dark ? (on ? "border-cyan-300 bg-white/10" : "border-white/15 bg-white/5") : on ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white";
        return (
          <li key={s.months} className={`relative rounded-xl border p-4 ${base}`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-cyan-300" : "text-cyan-700"}`}>{s.months}</span>
              {on && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${dark ? "bg-cyan-300 text-slate-950" : "bg-cyan-500 text-white"}`}>Now</span>}
            </div>
            <p className={`mt-1.5 font-display text-base font-semibold leading-snug ${dark ? "text-white" : "text-slate-900"}`}>{s.title}</p>
            {showTasks && (
              <ul className={`mt-2 space-y-1 text-xs leading-5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                {s.taskIds.map((id) => bfcmTask(id)).filter(Boolean).map((t) => (
                  <li key={t!.id} className="flex gap-1.5"><span className={`mt-1.5 h-1 w-1 flex-none rounded-full ${dark ? "bg-cyan-300" : "bg-cyan-500"}`} aria-hidden />{t!.title}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** "Why Black Friday is critical" callout, for Today and the calendar. */
export function BfcmCritical({ today, compact = false }: { today: string; compact?: boolean }) {
  return (
    <section aria-labelledby="bfcm-critical-h" className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-5">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-800"><AlertTriangle className="h-4 w-4" aria-hidden /> Critical for many stores</p>
      <h2 id="bfcm-critical-h" className="mt-2 font-display text-xl font-semibold text-slate-900 sm:text-2xl">{BFCM_CRITICAL.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700"><strong className="font-semibold text-slate-900">{BFCM_CRITICAL.lead}</strong> {BFCM_CRITICAL.body}</p>
      <div className="mt-4"><BfcmTimeline current={bfcmStageIndex(today)} showTasks={!compact} /></div>
    </section>
  );
}

/** The light year-round nudge on Today, outside the August to January plan. */
export function BfcmTipStrip({ tip }: { tip: BfcmTip }) {
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <FlaskConical className="mt-0.5 h-4 w-4 flex-none text-cyan-600" aria-hidden />
      <p className="min-w-0 flex-1 text-slate-700"><strong className="font-semibold text-slate-900">{tip.title}.</strong> {tip.text}</p>
      <span className="flex-none rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Planning starts in {tip.daysToPlanning} days</span>
    </div>
  );
}
