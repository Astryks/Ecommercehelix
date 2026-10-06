import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listModules } from "@/lib/learn";
import { StageTrio } from "@/components/StageTrio";
import { STAGE_INFO, STAGE_ORDER, type StageId } from "@/lib/stages";

export const metadata: Metadata = { title: "Learn" };

export default function Learn() {
  const modules = listModules();
  const lessonsOf = (m: (typeof modules)[number]) => m.lessons.filter((l) => l.ref);
  const counts = Object.fromEntries(STAGE_ORDER.map((id) => [id, {
    modules: modules.filter((m) => m.stage === id).length,
    lessons: modules.reduce((a, m) => a + lessonsOf(m).filter((l) => l.stage === id).length, 0),
  }])) as Record<StageId, { modules: number; lessons: number }>;
  return (
    <>
      <SiteHeader dark={false} />
      <main className="mx-auto w-full max-w-6xl px-5 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Learn</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">The Helix Playbook</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {modules.length} modules and {modules.reduce((a, m) => a + m.lessons.filter((l) => l.title.startsWith("Lesson")).length, 0)} lessons on running a profitable online store. Every daily task links to the lesson that explains it. Each module starts with a short &ldquo;In plain words&rdquo; box, and the drawings show where to click. Free for everyone.
        </p>
        <p className="mt-4">
          <Link href="/learn/words" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-cyan-800 hover:border-cyan-300">
            New to this? Start with the words to know (one line each)
          </Link>
          <Link href="/learn/goals" className="ml-2 mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:border-emerald-300">
            The goals ladder: the 9 numbers to aim at, from visits to net profit
          </Link>
        </p>
        <section aria-labelledby="framework-h" className="mt-10">
          <h2 id="framework-h" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Three stages: Attract, Convert, Grow</h2>
          <p className="mt-2 max-w-2xl text-slate-600">Every module and lesson sits in one stage. Bring the right people in, turn them into buyers, then keep more of every sale and scale it. Your daily plan moves between all three in the order your store needs.</p>
          <div className="mt-5"><StageTrio counts={counts} hrefFor={(id) => `#${id}`} /></div>
        </section>
        {STAGE_ORDER.map((id) => {
          const st = STAGE_INFO[id];
          return (
            <section key={id} id={id} aria-labelledby={`${id}-h`} className="mt-14 scroll-mt-6">
              <div className="flex flex-wrap items-baseline gap-3 border-b border-slate-200 pb-3">
                <span className={`font-display text-3xl italic ${st.ink} opacity-40`} aria-hidden>{st.step}</span>
                <h2 id={`${id}-h`} className="text-3xl text-slate-900">{st.name}</h2>
                <p className={`font-semibold ${st.ink}`}>{st.tagline}</p>
              </div>
              <ol className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {modules.filter((m) => m.stage === id).map((m) => {
                  const others = STAGE_ORDER.filter((o) => o !== id).map((o) => [o, lessonsOf(m).filter((l) => l.stage === o).length] as const).filter(([, n]) => n > 0);
                  return (
                    <li key={m.slug}>
                      <Link href={`/learn/${m.slug}`} className="card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                        <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                          <span className="text-cyan-700">Module {m.number}</span>
                          <span className={`rounded-full px-2 py-0.5 ring-1 ${st.chip}`}>{st.name}</span>
                        </span>
                        <h3 className="mt-2 text-lg font-semibold">{m.title}</h3>
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{m.plain}</p>
                        <p className="mt-4 text-xs text-slate-500">{lessonsOf(m).length} lessons{others.map(([o, n]) => ` · ${n} in ${STAGE_INFO[o].name}`).join("")}</p>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </>
  );
}
