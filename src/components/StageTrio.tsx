import Link from "next/link";
import { ArrowRight, Magnet, MousePointerClick, Sprout } from "lucide-react";
import { STAGE_INFO, STAGE_ORDER, type StageId } from "@/lib/stages";

const ICON: Record<StageId, typeof Magnet> = { attract: Magnet, convert: MousePointerClick, grow: Sprout };

/** The Attract, Convert, Grow trio. `counts` adds module and lesson totals; `hrefFor` links each card. */
export function StageTrio({ counts, hrefFor, compact = false }: {
  counts?: Record<StageId, { modules: number; lessons: number }>;
  hrefFor?: (id: StageId) => string;
  compact?: boolean;
}) {
  return (
    <ol className="relative grid gap-4 md:grid-cols-3" aria-label="Attract, Convert, Grow">
      {STAGE_ORDER.map((id, i) => {
        const s = STAGE_INFO[id];
        const Icon = ICON[id];
        const body = (
          <>
            <div className="flex items-center justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ${s.chip}`}><Icon className="h-5 w-5" aria-hidden /></span>
              <span className={`font-display text-4xl italic ${s.ink} opacity-30`} aria-hidden>{s.step}</span>
            </div>
            <h3 className="mt-4 font-display text-2xl text-slate-900">{s.name}</h3>
            <p className={`mt-1 font-semibold ${s.ink}`}>{s.tagline}</p>
            {!compact && <p className="mt-2 text-sm leading-6 text-slate-600">{s.blurb}</p>}
            {!compact && (
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {s.covers.map((c) => <li key={c} className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />{c}</li>)}
              </ul>
            )}
            {counts && <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{counts[id].modules} modules · {counts[id].lessons} lessons</p>}
            {hrefFor && <span className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${s.ink}`}>See the {s.name} lessons <ArrowRight className="h-4 w-4" aria-hidden /></span>}
          </>
        );
        return (
          <li key={id} className="relative">
            {hrefFor ? (
              <Link href={hrefFor(id)} className={`block h-full rounded-xl border p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${s.panel}`}>{body}</Link>
            ) : (
              <div className={`h-full rounded-xl border p-6 ${s.panel}`}>{body}</div>
            )}
            {i < 2 && <ArrowRight className="absolute -right-3.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-white text-slate-400 ring-1 ring-slate-200 md:block" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

/** Small inline chip, e.g. on Today. */
export function StageChip({ id, withTagline = false }: { id: StageId; withTagline?: boolean }) {
  const s = STAGE_INFO[id];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />{s.name}{withTagline && <span className="font-normal opacity-80">· {s.tagline}</span>}
    </span>
  );
}
