import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import { MILESTONES } from "@/lib/journey";

/** Small "Your road to $100M" game strip for Today: current level, XP and the next level. */
export function RoadGameStrip({ level, xp, progress }: { level: number; xp: number; progress: number | null }) {
  const here = level ? MILESTONES[level - 1] : null;
  const next = MILESTONES[level] ?? null;
  const pct = progress == null ? null : Math.round(progress * 100);
  return (
    <section aria-labelledby="road-strip-h" className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4" data-testid="road-strip">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="road-strip-h" className="flex items-center gap-2 font-semibold text-violet-900"><MapIcon className="h-4 w-4" aria-hidden /> Your road to $100M</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-violet-800 ring-1 ring-violet-200" data-testid="road-xp">{xp} XP</span>
      </div>
      <p className="mt-1 text-sm text-slate-700">
        {here ? <>Level {level} of {MILESTONES.length}: <strong>{here.title}</strong>.</> : <>Level 0: you are about to start.</>}
        {next ? <> Next level: <strong>{next.title}</strong>.</> : <> You reached the top!</>}
      </p>
      <div className="mt-2 flex gap-1" aria-hidden>
        {MILESTONES.map((m) => <span key={m.level} className={`h-2 flex-1 rounded-full ${m.level <= level ? "bg-[#5A50D6]" : "bg-white ring-1 ring-violet-200"}`} />)}
      </div>
      {pct != null && next && <p className="mt-1 text-xs text-slate-600">{pct}% of the way to {next.title}.</p>}
      <Link href="/dashboard/progress#road" className="mt-2 inline-block text-sm font-semibold text-violet-800 hover:underline">See the whole road</Link>
    </section>
  );
}
