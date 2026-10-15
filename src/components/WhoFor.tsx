import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BANDS, MILESTONES } from "@/lib/audience";

/** Who Helix is for: three revenue bands (Growing is the best fit) and the milestones between them. */
export function WhoFor() {
  return (
    <div>
      <ol className="grid gap-6 md:grid-cols-3 md:items-stretch">
        {BANDS.map((b, i) => {
          const hi = b.id === "growing";
          return (
            <li key={b.id} className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white p-8 ${hi ? "border-[#5A50D6] shadow-[0_12px_32px_-16px_rgba(90,80,214,0.45)]" : "border-slate-200"}`}>
              {hi && <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#5A50D6] to-[#FF7EB6]" />}
              <div className="flex items-start justify-between gap-3">
                <span className={`font-serif text-3xl leading-none ${hi ? "text-[#5A50D6]" : "text-slate-400"}`} aria-hidden>0{i + 1}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${hi ? "bg-[#5A50D6] text-white" : "bg-paper-2 text-slate-700"}`}>{b.fit}</span>
              </div>
              <h3 className="mt-6 font-hand text-2xl leading-tight text-slate-900">{b.name}</h3>
              <p className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-900">{b.monthly}</p>
              <p className={`mt-1 text-sm font-semibold ${hi ? "text-[#453CBF]" : "text-slate-500"}`}>{b.range}</p>
              <p className="mt-5 flex-1 text-[15px] leading-6 text-slate-600">{b.focus}</p>
              <Link href="/start" className={`mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm font-semibold ${hi ? "text-[#453CBF]" : "text-slate-700"} hover:underline`}>
                {b.track} <ArrowRight className="h-4 w-4 flex-none" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-12" aria-label="Milestones">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Milestones to aim for</p>
        <ol className="relative mt-5 grid gap-5 sm:grid-cols-4 sm:gap-0">
          <span aria-hidden className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#5A50D6] to-[#FF7EB6] opacity-50 sm:bottom-auto sm:left-[10px] sm:right-[calc(25%-10px)] sm:top-[9px] sm:h-0.5 sm:w-auto sm:bg-gradient-to-r" />
          {MILESTONES.map((m, i) => (
            <li key={m} className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3">
              <span className={`relative z-10 h-5 w-5 flex-none rounded-full border-4 border-white ring-2 ${i === 2 ? "bg-[#FF7EB6] ring-[#FF7EB6]" : "bg-[#5A50D6] ring-[#5A50D6]"}`} aria-hidden />
              <span className="text-sm font-semibold text-slate-900">{m}{i === 2 && <span className="ml-2 rounded-full bg-[#FFE3EF] px-2 py-0.5 text-[11px] font-bold text-[#A3255C]">Your goal</span>}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
