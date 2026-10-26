import Link from "next/link";
import { Star } from "lucide-react";
import type { Quest } from "@/lib/quest";
import { sectionName } from "@/lib/quest";

/** Today: the next topic on the Attract / Convert / Grow checklist, with stage bars and XP. */
export function QuestNextUp({ q, streak }: { q: Quest; streak: number }) {
  return (
    <section className="card p-5" aria-labelledby="quest-h" data-testid="today-next-up">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="quest-h" className="font-hand text-xl text-cyan-700">Next up on your checklist</h2>
        <span className="flex items-center gap-1 text-xs text-slate-600"><Star className="h-3.5 w-3.5 text-amber-500" aria-hidden /> {q.xp} XP · level {q.level} · {streak}-day streak</span>
      </div>
      {q.next && q.nextSection ? (
        <p className="mt-2"><span className="text-sm text-slate-600">{sectionName(q.nextSection.id)} · topic {q.next.n} of {q.total}: </span><Link href={q.next.href} className="font-semibold text-slate-900 underline">{q.next.title}</Link></p>
      ) : <p className="mt-2 text-sm">Every topic is ticked. Brilliant work.</p>}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {q.sections.map((s) => (
          <div key={s.id}><p className="text-[11px] font-semibold text-slate-600">{sectionName(s.id)} {s.pct}%</p><div className="mt-1 h-1.5 rounded-full bg-slate-100" aria-hidden><div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${s.pct}%` }} /></div></div>
        ))}
      </div>
      <p className="mt-3"><Link href="/dashboard/learn/framework" className="text-sm text-cyan-700 hover:underline">Open the Attract, Convert, Grow checklist</Link></p>
    </section>
  );
}
