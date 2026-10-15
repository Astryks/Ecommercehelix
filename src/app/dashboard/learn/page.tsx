import Link from "next/link";
import { CheckCircle2, ChevronDown, Circle, CircleDot, Clock, FileText, Lock, MapPin, PlayCircle, Sparkles } from "lucide-react";
import { lessonStateFn } from "@/lib/lesson-done";
import { requireUser } from "@/lib/session";
import { getAccount, getCompletions, getLessonSteps } from "@/lib/repo";
import { listModules } from "@/lib/learn";
import { STAGE_INFO, STAGE_ORDER } from "@/lib/stages";
import { PATH } from "@/lib/learn-path";
import { siteContent } from "@/lib/site-content";
import { isoDay } from "@/lib/dates";

export const metadata = { title: "Learn" };

export default async function DashboardLearn() {
  const u = await requireUser("/dashboard/learn");
  const [comps, steps, acct] = await Promise.all([getCompletions(u.id), getLessonSteps(u.id), getAccount(u.id)]);
  const done = new Set(comps.map((c) => c.taskId));
  const featured = siteContent(isoDay(), acct.country).featuredLesson;
  const modules = listModules().filter((m) => m.lessons.some((l) => l.ref));
  const stepNsOf = new Map(modules.flatMap((m) => m.lessons.filter((l) => l.ref).map((l) => [l.ref!, l.stepNs] as const)));
  const lessonState = lessonStateFn(done, steps);
  const state = (ref: string) => lessonState(ref, stepNsOf.get(ref));
  const mins = (m: (typeof modules)[number]) => Math.max(3, Math.round((m.steps / Math.max(1, m.lessons.filter((l) => l.ref).length)) * 2));
  const all = modules.flatMap((m) => m.lessons.filter((l) => l.ref).map((l) => ({ ...l, ref: l.ref!, module: m })));
  const doneCount = all.filter((l) => state(l.ref) === "done").length;
  const byRef = new Map(all.map((l) => [l.ref, l]));
  // One guided path: every lesson in path order (refs unchanged, so saved progress carries over).
  const path = PATH.map((p) => ({ p, lessons: p.refs.map((r) => byRef.get(r)).filter((l): l is (typeof all)[number] => Boolean(l)) }));
  const flat = path.flatMap((g) => g.lessons);
  const num = new Map(flat.map((l, i) => [l.ref, i + 1]));
  const next = flat.find((l) => state(l.ref) !== "done");
  const nextStep = next ? path.find((g) => g.lessons.includes(next)) : undefined;
  const timeline = path.map((g) => ({ key: g.p.id, label: `Step ${g.p.n}: ${g.p.title}`, lessons: g.lessons }));
  const curIdx = timeline.findIndex((g) => g.lessons.some((l) => l.ref === next?.ref));
  const short = (t: string) => t.replace(/^Lesson [\d.]+:\s*/, "");
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-serif text-4xl uppercase tracking-wide text-slate-900">Learn</h1>
      <p className="mt-1 max-w-2xl text-slate-700">One path, step by step. Start at step 1 and go down. {doneCount} of {all.length} lessons done.</p>
      <p className="mt-3 flex flex-wrap gap-2">
        <Link href={featured.href} className="btn-ghost text-sm"><Sparkles className="h-4 w-4" aria-hidden /> This week: {featured.label}</Link>
        <Link href="/dashboard/learn/templates" className="btn-ghost text-sm"><FileText className="h-4 w-4" aria-hidden /> Template library</Link>
        <Link href="/learn/words" className="btn-ghost text-sm">Words to know</Link>
      </p>

      {next && nextStep && (
        <section aria-labelledby="next-h" className="mt-6 rounded-2xl border-2 border-[#5A50D6] bg-[#5A50D6]/5 p-5" data-testid="next-lesson">
          <h2 id="next-h" className="font-display text-xl text-[#5A50D6]">Your next lesson</h2>
          <p className="mt-1 text-sm text-slate-600">Step {nextStep.p.n}: {nextStep.p.title} · lesson {num.get(next.ref)} of {flat.length}</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{short(next.title)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" aria-hidden /> About {mins(next.module)} min{state(next.ref) === "started" ? " · started" : ""}</p>
          <p className="mt-3 flex flex-wrap gap-2">
            <Link href={`/learn/${next.module.slug}#${next.id}`} className="btn-primary text-sm"><PlayCircle className="h-4 w-4" aria-hidden /> {state(next.ref) === "started" ? "Keep going" : "Start lesson"}</Link>
            <Link href={`/dashboard/learn/path/${nextStep.p.id}`} className="btn-ghost text-sm">See step {nextStep.p.n}</Link>
          </p>
        </section>
      )}

      <h2 className="mt-8 font-serif text-2xl uppercase tracking-wide text-slate-900">Your path</h2>
      <ol className="mt-3 grid gap-3" data-testid="learn-path">
        {path.map((g) => {
          const d = g.lessons.filter((l) => state(l.ref) === "done").length;
          const here = g === nextStep;
          const tags = STAGE_ORDER.filter((s) => g.lessons.some((l) => l.stage === s));
          return (
            <li key={g.p.id}>
              <Link href={`/dashboard/learn/path/${g.p.id}`} className={`flex items-start gap-4 rounded-2xl border bg-white p-4 hover:ring-2 hover:ring-[#5A50D6]/30 ${here ? "border-[#5A50D6]" : "border-slate-200"}`}>
                <span className={`grid h-10 w-10 flex-none place-items-center rounded-full text-lg font-bold ${d === g.lessons.length ? "bg-emerald-500 text-white" : here ? "bg-[#5A50D6] text-white" : "bg-slate-100 text-slate-700"}`}>{d === g.lessons.length ? <CheckCircle2 className="h-5 w-5" aria-label="Done" /> : g.p.n}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="text-lg font-semibold text-slate-900">{g.p.title}</span>
                    {tags.map((s) => <span key={s} className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ring-1 ${STAGE_INFO[s].chip}`}>{STAGE_INFO[s].name}</span>)}
                    {here && <span className="inline-flex items-center gap-1 rounded-full bg-[#5A50D6] px-2 py-0.5 text-[10px] font-semibold text-white"><MapPin className="h-3 w-3" aria-hidden /> You are here</span>}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-600">{g.p.blurb}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200" aria-hidden><span className="block h-full bg-emerald-500" style={{ width: `${(d / Math.max(1, g.lessons.length)) * 100}%` }} /></span>
                    <span className="text-xs tabular-nums text-slate-600">{d} of {g.lessons.length} done</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <details className="group mt-8" data-testid="course-timeline">
        <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
          See entire course ({all.length} lessons) <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <ol className="relative mt-6 border-l-2 border-slate-200 pl-6">
          {timeline.map((g, gi) => {
            const d = g.lessons.filter((l) => state(l.ref) === "done").length;
            const locked = curIdx >= 0 && gi > curIdx + 1;
            return (
              <li key={g.key} className="mb-6">
                <span className={`absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full ring-4 ring-white ${d === g.lessons.length ? "bg-emerald-500" : gi === curIdx ? "bg-[#5A50D6]" : "bg-slate-300"}`} aria-hidden />
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-display text-lg text-[#5A50D6]">{g.label}</h3>
                  {locked && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" aria-hidden /> Opens after the modules before it (you can peek)</span>}
                  <span className="ml-auto text-xs tabular-nums text-slate-600">{d} of {g.lessons.length} done</span>
                </div>
                <div className="mt-1 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-200" aria-hidden><div className="h-full bg-emerald-500" style={{ width: `${(d / g.lessons.length) * 100}%` }} /></div>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {g.lessons.map((l) => {
                    const st = state(l.ref);
                    const here = l.ref === next?.ref;
                    const Icon = st === "done" ? CheckCircle2 : st === "started" ? CircleDot : locked ? Lock : Circle;
                    return (
                      <li key={l.ref}>
                        <Link href={`/learn/${l.module.slug}#${l.id}`} className={`flex items-start gap-2 rounded-lg px-2 py-1 text-sm hover:underline ${here ? "bg-[#5A50D6]/10 font-semibold text-slate-900" : locked ? "text-slate-500" : "text-slate-800"}`} aria-current={here ? "step" : undefined}>
                          <span className="w-7 flex-none text-right tabular-nums text-slate-400">{num.get(l.ref)}.</span>
                          <Icon className={`mt-0.5 h-4 w-4 flex-none ${st === "done" ? "text-emerald-600" : st === "started" ? "text-[#5A50D6]" : "text-slate-300"}`} aria-label={st === "done" ? "Done" : st === "started" ? "Started" : locked ? "Locked" : "Not started"} />
                          <span>{short(l.title)} <span className={`ml-1 rounded-full px-1.5 text-[10px] font-semibold ring-1 ${STAGE_INFO[l.stage].chip}`}>{STAGE_INFO[l.stage].name}</span></span>
                          {here && <span className="ml-auto inline-flex flex-none items-center gap-1 rounded-full bg-[#5A50D6] px-2 py-0.5 text-[10px] font-semibold text-white" data-testid="you-are-here"><MapPin className="h-3 w-3" aria-hidden /> You are here</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </details>
    </div>
  );
}
