import Link from "next/link";
import { Award, CheckCircle2, Circle, Flame, MapPin, Star, Trophy } from "lucide-react";
import { requireUser } from "@/lib/session";
import { questForUser } from "@/lib/quest-server";
import { sectionName, XP_PER_LESSON, type QuestSection } from "@/lib/quest";
import { STAGE_INFO } from "@/lib/stages";
import { toggleTopic } from "./actions";

export const metadata = { title: "Attract, Convert, Grow checklist" };

const style = (id: QuestSection["id"]) => (id === "warmup" ? { dot: "bg-[#5A50D6]", chip: "bg-violet-50 text-violet-800 ring-violet-200", bar: "bg-[#5A50D6]", tagline: "Set up your numbers and accounts first." } : { dot: STAGE_INFO[id].dot, chip: STAGE_INFO[id].chip, bar: STAGE_INFO[id].dot, tagline: STAGE_INFO[id].tagline });

export default async function FrameworkPage() {
  const u = await requireUser("/dashboard/learn/framework");
  const { quest: q, streak } = await questForUser(u.id);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="page-title">Attract, Convert, Grow</h1>
      <p className="page-lead">Your whole course as one checklist. Tick a topic when you have done it. Each tick is {XP_PER_LESSON} XP; finishing a stage earns a badge and a bonus.</p>

      <section className="mt-5 grid gap-4 sm:grid-cols-4" aria-label="Your progress" data-testid="quest-summary">
        <div className="card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overall</p><p className="mt-1 font-display text-3xl font-semibold text-[#1A1718]">{q.pct}%</p>
          <div className="mt-2 h-2 rounded-full bg-slate-100" role="progressbar" aria-valuenow={q.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${q.pct}%` }} /></div>
          <p className="mt-1 text-xs text-slate-500">{q.done} of {q.total} topics</p></div>
        <div className="card p-4"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><Star className="h-3.5 w-3.5 text-amber-500" aria-hidden /> XP</p><p className="mt-1 font-display text-3xl font-semibold text-[#1A1718]">{q.xp}</p><p className="text-xs text-slate-500">Level {q.level} · {q.xpToNext} XP to level {q.level + 1}</p></div>
        <div className="card p-4"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden /> Streak</p><p className="mt-1 font-display text-3xl font-semibold text-[#1A1718]">{streak} day{streak === 1 ? "" : "s"}</p><p className="text-xs text-slate-500">Tick one thing a day to keep it.</p></div>
        <div className="card p-4"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><Trophy className="h-3.5 w-3.5 text-amber-500" aria-hidden /> Badges</p><p className="mt-1 font-display text-3xl font-semibold text-[#1A1718]">{q.badges.filter((b) => b.earned).length}<span className="text-sm font-medium text-slate-400">/{q.badges.length}</span></p></div>
      </section>

      {q.next && q.nextSection && (
        <section className="mt-5 rounded-2xl border-2 border-[#5A50D6] bg-[#5A50D6]/5 p-5" data-testid="quest-next">
          <p className="text-sm font-semibold text-[#5A50D6]">Next up · {sectionName(q.nextSection.id)} · topic {q.next.n} of {q.total}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{q.next.title}</p>
          <p className="mt-3"><Link href={q.next.href} className="btn-primary text-sm">Open this topic</Link></p>
        </section>
      )}

      <section className="mt-5 grid gap-3 sm:grid-cols-4" aria-label="Stages">
        {q.sections.map((s) => { const st = style(s.id); return (
          <a key={s.id} href={`#${s.id}`} className="card block p-4 hover:ring-2 hover:ring-[#5A50D6]/30">
            <span className="flex items-center justify-between"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${st.chip}`}>{sectionName(s.id)}</span>{s.complete && <Award className="h-5 w-5 text-amber-500" aria-label="Stage badge earned" />}</span>
            <span className="mt-2 block h-2 rounded-full bg-slate-100" role="progressbar" aria-valuenow={s.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${sectionName(s.id)} progress`}><span className={`block h-2 rounded-full ${st.bar}`} style={{ width: `${s.pct}%` }} /></span>
            <span className="mt-1 block text-xs tabular-nums text-slate-600">{s.done} of {s.total} · {s.pct}%</span>
          </a>); })}
      </section>

      <section className="card mt-5 p-5" aria-label="Badges">
        <h2 className="font-hand text-xl text-cyan-700">Badges</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{q.badges.map((b) => <li key={b.key} className={`flex items-start gap-2 rounded-lg p-3 text-sm ${b.earned ? "bg-amber-50" : "bg-slate-50 opacity-60"}`}><Trophy className={`mt-0.5 h-4 w-4 flex-none ${b.earned ? "text-amber-500" : "text-slate-300"}`} aria-hidden /><span><span className="block font-semibold text-slate-900">{b.title}</span><span className="text-slate-600">{b.earned ? b.note : "Not yet"}</span></span></li>)}</ul>
      </section>

      <ol className="relative mt-8 border-l-2 border-slate-200 pl-6" data-testid="quest-timeline">
        {q.sections.map((s) => { const st = style(s.id); return (
          <li key={s.id} id={s.id} className="mb-10 scroll-mt-20">
            <span className={`absolute -left-[11px] mt-1 h-5 w-5 rounded-full ring-4 ring-white ${s.complete ? "bg-emerald-500" : st.dot}`} aria-hidden />
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-serif text-2xl uppercase tracking-wide text-slate-900">{s.id === "warmup" ? "Start here" : `${STAGE_INFO[s.id].step}. ${sectionName(s.id)}`}</h2>
              <span className="text-sm text-slate-600">{st.tagline}</span>
              <span className="ml-auto text-xs tabular-nums text-slate-600">{s.done} of {s.total} done</span>
            </div>
            <div className="mt-1 h-2 w-full max-w-md rounded-full bg-slate-100" aria-hidden><div className={`h-2 rounded-full ${st.bar}`} style={{ width: `${s.pct}%` }} /></div>
            {s.groups.map((g) => (
              <div key={g.stepId} className="mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{g.stepTitle} <span className="font-normal normal-case">({g.items.filter((i) => i.done).length}/{g.items.length})</span></h3>
                <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                  {g.items.map((i) => { const here = i.ref === q.next?.ref; return (
                    <li key={i.ref} className={`flex items-start gap-2 rounded-lg px-2 py-1 text-sm ${here ? "bg-[#5A50D6]/10" : ""}`}>
                      <form action={toggleTopic}>
                        <input type="hidden" name="ref" value={i.ref} /><input type="hidden" name="done" value={i.done ? "0" : "1"} />
                        <button type="submit" aria-label={`${i.done ? "Untick" : "Tick"} ${i.title}`} className="mt-0.5" data-testid="quest-tick">{i.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden /> : <Circle className="h-5 w-5 text-slate-300 hover:text-[#5A50D6]" aria-hidden />}</button>
                      </form>
                      <Link href={i.href} className={`hover:underline ${i.done ? "text-slate-500 line-through" : "text-slate-800"} ${here ? "font-semibold" : ""}`}>{i.title}</Link>
                      {here && <span className="ml-auto inline-flex flex-none items-center gap-1 rounded-full bg-[#5A50D6] px-2 py-0.5 text-[10px] font-semibold text-white"><MapPin className="h-3 w-3" aria-hidden /> Next up</span>}
                    </li>); })}
                </ul>
              </div>
            ))}
          </li>); })}
      </ol>
    </div>
  );
}
