import Link from "next/link";
import { BookOpen, Megaphone } from "lucide-react";
import { lessonLink } from "@/lib/lesson-links";
import { marketingGuide, readMarketing } from "@/lib/profit-setup";

const TONE = { green: "border-emerald-200 bg-emerald-50/60", amber: "border-amber-200 bg-amber-50", red: "border-rose-200 bg-rose-50", none: "border-slate-200 bg-white" } as const;

/** Your marketing as a share of sales, against the guide band for your size and your own break-even. */
export function MarketingBand({ marketingPct, monthlySales, breakEvenMerPct, example }: { marketingPct: number; monthlySales: number; breakEvenMerPct: number; example?: boolean }) {
  const g = marketingGuide(monthlySales);
  const r = readMarketing(marketingPct, monthlySales, breakEvenMerPct);
  const max = Math.max(40, Math.ceil((Math.max(marketingPct, breakEvenMerPct) + 5) / 10) * 10);
  const x = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  return (
    <section aria-label="Marketing as a share of sales" className={`rounded-2xl border p-5 ${TONE[r.tone]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-slate-900"><Megaphone className="h-4 w-4 text-[#6258DF]" aria-hidden /> Marketing as a share of sales</h2>
          <p className="mt-0.5 text-xs text-slate-600">{g.title}. A guide, not a rule.{example ? " Shown with example data." : ""}</p>
        </div>
        <Link href={lessonLink("1.9")?.href ?? "/learn"} className="btn-ghost !px-3 !py-1.5 !text-xs"><BookOpen className="h-3.5 w-3.5" aria-hidden /> How much to spend</Link>
      </div>
      {g.stage !== "pre" && (
        <div className="relative mt-4 h-8 rounded-full bg-slate-100" role="img" aria-label={`Your marketing ${marketingPct.toFixed(1)}%, guide ${g.low}% to ${g.high}%, break-even ${breakEvenMerPct.toFixed(0)}%`}>
          <div className="absolute inset-y-0 rounded-full bg-[#8FA98B]/40" style={{ left: x(g.low ?? 0), width: `calc(${x(g.high ?? 0)} - ${x(g.low ?? 0)})` }} />
          {breakEvenMerPct > 0 && <div className="absolute inset-y-0 w-0.5 bg-rose-500" style={{ left: x(breakEvenMerPct) }} title="Break-even" />}
          <div className="absolute -top-1 h-10 w-1.5 rounded bg-[#1A1718]" style={{ left: x(marketingPct) }} />
        </div>
      )}
      {g.stage !== "pre" && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#1A1718]" />You: <strong>{marketingPct.toFixed(1)}%</strong></span>
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#8FA98B]/60" />Usual range {g.low}% to {g.high}%</span>
          {breakEvenMerPct > 0 && <span><span className="mr-1 inline-block h-2.5 w-0.5 bg-rose-500" />Your break-even {breakEvenMerPct.toFixed(0)}%</span>}
        </div>
      )}
      <p className="mt-3 text-sm text-slate-800">{r.text}</p>
      <p className="mt-1 text-xs text-slate-600">{g.guide}</p>
    </section>
  );
}
