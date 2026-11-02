import Link from "next/link";
import type { Seminar } from "@/lib/seminars/curriculum";

export function SeminarView({ s, owned, demo }: { s: Seminar; owned: boolean; demo?: boolean }) {
  return (
    <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">{s.stage} · {s.minutes} min seminar · {s.concepts.length} ideas</p>
      <h2 className="mt-2 text-2xl text-slate-900 sm:text-3xl">{s.title}</h2>
      <p className="mt-2 text-slate-600">{s.hook}</p>

      <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800 text-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          {owned ? (
            <>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">{demo ? "Unlocked (preview demo, no payment)" : "Yours to keep"}</span>
              <p className="text-lg font-semibold">Video coming soon</p>
              <p className="max-w-md text-sm text-white/80">This seminar is in production. Your purchase is saved, so it plays here as soon as it is ready.</p>
            </>
          ) : (
            <>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">Today&rsquo;s seminar</span>
              <p className="text-lg font-semibold">Watch the full {s.minutes}-minute seminar for US$1</p>
              <a href={`/api/seminars/checkout?id=${s.id}`} className="btn-primary mt-1 px-6">Unlock for US$1</a>
              <p className="text-xs text-white/70">One-off payment. Keep it forever. No subscription.</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_18rem]">
        <section aria-labelledby={`outline-${s.id}`}>
          <h3 id={`outline-${s.id}`} className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Outline</h3>
          <ol className="mt-3 space-y-4">
            {s.sections.map((sec, i) => (
              <li key={i} className="rounded-xl border border-slate-100 p-4">
                <p className="flex justify-between gap-3 font-medium text-slate-900"><span>{sec.title}</span><span className="shrink-0 text-sm text-slate-500">{sec.minutes} min</span></p>
                {(owned || i < 2) ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{sec.points.map((p, j) => <li key={j}>{p}</li>)}</ul>
                ) : <p className="mt-2 text-sm text-slate-400">Unlock to see the notes for this part.</p>}
              </li>
            ))}
          </ol>
        </section>
        <aside>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Key takeaways</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">{s.takeaways.map((t, i) => <li key={i} className="rounded-lg bg-emerald-50 px-3 py-2">{t}</li>)}</ul>
          <p className="mt-4 text-sm"><Link className="text-cyan-800 underline" href="/learn">Go deeper in the Helix Playbook</Link></p>
        </aside>
      </div>
    </article>
  );
}
