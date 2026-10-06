import { ChevronRight } from "lucide-react";
import { BANDS, MILESTONES } from "@/lib/audience";

/** Who Helix is for: three revenue bands and the milestones between them. */
export function WhoFor() {
  return (
    <div>
      <ol className="grid gap-4 md:grid-cols-3">
        {BANDS.map((b, i) => (
          <li key={b.id} className={`flex flex-col rounded-xl border p-6 ${i === 1 ? "border-cyan-300 bg-cyan-50/50" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between">
              <span className="font-display text-4xl italic text-slate-300" aria-hidden>{i + 1}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${b.fit === "Most value" ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-slate-50 text-slate-700 ring-slate-200"}`}>{b.fit}</span>
            </div>
            <h3 className="mt-3 font-display text-2xl text-slate-900">{b.name}</h3>
            <p className="mt-1 font-semibold text-cyan-800">{b.range}</p>
            <p className="text-sm text-slate-500">{b.monthly}</p>
            <p className="mt-3 flex-1 text-[15px] leading-7 text-slate-600">{b.focus}</p>
            <p className="mt-4 border-t border-slate-200 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{b.track}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm" aria-label="Milestones">
        <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Milestones to aim for</span>
        {MILESTONES.map((m, i) => (
          <span key={m} className="inline-flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 font-semibold ring-1 ${i < 4 ? "bg-white text-slate-800 ring-slate-200" : "bg-paper-2 text-slate-500 ring-slate-200"}`}>{m}</span>
            {i < MILESTONES.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden />}
          </span>
        ))}
      </div>
    </div>
  );
}
