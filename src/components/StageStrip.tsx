import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Quest } from "@/lib/quest";
import { CONVERT_BEFORE_ADS, PATH, PATH_STAGE_NAME } from "@/lib/learn-path";
import { STAGE_INFO } from "@/lib/stages";

/** "You are here" strip: the stage of the user's next lesson in the guided path, plus that lesson.
 * Links to the Attract, Convert, Grow page. `compact` is the one-line version used in the nav. */
export function StageStrip({ quest, compact = false, dark = false }: { quest: Quest; compact?: boolean; dark?: boolean }) {
  const next = quest.next;
  const step = next ? PATH.find((p) => p.id === next.stepId) : undefined;
  const stage = step?.stage ?? (next ? "grow" : "grow");
  const name = next ? PATH_STAGE_NAME[stage] : "All done";
  const chip = stage === "start" ? "bg-violet-50 text-violet-800 ring-violet-200" : STAGE_INFO[stage].chip;
  if (compact) {
    return (
      <Link href="/dashboard/learn/framework" data-testid="stage-strip-nav" className={`block rounded-xl px-3 py-2 text-xs ${dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}>
        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 flex-none" aria-hidden /> You are here: <span className={`rounded-full px-1.5 font-semibold ring-1 ${chip}`}>{name}</span></span>
        {next && <span className={`mt-1 block truncate ${dark ? "text-slate-400" : "text-slate-500"}`} title={next.title}>Next: {next.title}</span>}
      </Link>
    );
  }
  const order: ("start" | "attract" | "convert" | "grow")[] = ["start", "attract", "convert", "grow"];
  const at = order.indexOf(stage);
  return (
    <section aria-label="Where you are" data-testid="stage-strip" className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900"><MapPin className="h-4 w-4 text-[#5A50D6]" aria-hidden /> You are here:</span>
        <ol className="flex flex-wrap items-center gap-1 text-xs font-semibold" aria-label="Stages">
          {order.map((s, i) => (
            <li key={s} aria-current={i === at && next ? "step" : undefined} className={`rounded-full px-2 py-0.5 ring-1 ${i === at && next ? (s === "start" ? "bg-[#5A50D6] text-white ring-[#5A50D6]" : `${STAGE_INFO[s].dot} text-white ring-transparent`) : i < at || !next ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>{PATH_STAGE_NAME[s]}</li>
          ))}
        </ol>
        <Link href="/dashboard/learn/framework" className="ml-auto text-xs font-semibold text-[#5A50D6] hover:underline">How Attract, Convert, Grow works</Link>
      </div>
      {next && step ? (
        <p className="mt-2 text-sm text-slate-700">
          Step {step.n}: {step.title}{step.label ? <> <span className="rounded-full bg-orange-50 px-1.5 text-[11px] font-semibold text-orange-800 ring-1 ring-orange-200">{step.label}</span></> : null}
          {" · "}Next: <Link href={next.href} className="font-semibold text-slate-900 underline">{next.title}</Link>
        </p>
      ) : <p className="mt-2 text-sm text-slate-700">Every lesson is done. Keep your daily habits going.</p>}
      {(stage === "start" || stage === "attract") && <p className="mt-2 text-xs text-slate-500" data-testid="convert-before-ads">{CONVERT_BEFORE_ADS}</p>}
    </section>
  );
}
