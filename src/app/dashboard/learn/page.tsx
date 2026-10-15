import Link from "next/link";
import { CheckCircle2, ChevronDown, Circle, CircleDot, Clock, FileText, Lock, MapPin, PlayCircle, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getCompletions, getLessonSteps } from "@/lib/repo";
import { listModules } from "@/lib/learn";
import { lessonTaskId } from "@/lib/lesson-actions";
import { STAGE_INFO, STAGE_ORDER } from "@/lib/stages";
import { siteContent } from "@/lib/site-content";
import { isoDay } from "@/lib/dates";
import { LostLink } from "@/components/dashboard/LostLink";

export const metadata = { title: "Learn" };

/** Videos are not recorded yet: every card shows a clean placeholder until a video URL is added here (ref to URL). */
const VIDEOS: Record<string, string> = {};

export default async function DashboardLearn() {
  const u = await requireUser("/dashboard/learn");
  const [comps, steps, acct] = await Promise.all([getCompletions(u.id), getLessonSteps(u.id), getAccount(u.id)]);
  const done = new Set(comps.map((c) => c.taskId));
  const started = new Set(steps.map((k) => k.split("#")[0]));
  const featured = siteContent(isoDay(), acct.country).featuredLesson;
  const modules = listModules().filter((m) => m.lessons.some((l) => l.ref));
  const state = (ref: string) => (done.has(lessonTaskId(ref)) ? "done" : started.has(ref) ? "started" : "new");
  const mins = (m: (typeof modules)[number]) => Math.max(3, Math.round((m.steps / Math.max(1, m.lessons.filter((l) => l.ref).length)) * 2));
  const all = modules.flatMap((m) => m.lessons.filter((l) => l.ref).map((l) => ({ ...l, ref: l.ref!, module: m })));
  const doneCount = all.filter((l) => state(l.ref) === "done").length;
  // Timeline order: Attract, then Convert, then Grow; modules by number inside each stage.
  const ordered = STAGE_ORDER.flatMap((s) => modules.filter((m) => all.some((l) => l.module.slug === m.slug && l.stage === s)).map((m) => ({ s, m, lessons: all.filter((l) => l.module.slug === m.slug && l.stage === s) })));
  const current = all.find((l) => state(l.ref) !== "done");
  const curIdx = ordered.findIndex((g) => g.lessons.some((l) => l.ref === current?.ref));
  const num = new Map(ordered.flatMap((g) => g.lessons).map((l, i) => [l.ref, i + 1]));
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
      <p className="mt-1 max-w-2xl text-slate-700">Three steps to a bigger store: Attract buyers, Convert them into sales, then Grow. {doneCount} of {all.length} lessons done.</p>
      <p className="mt-3 flex flex-wrap gap-2">
        <Link href={featured.href} className="btn-primary text-sm"><Sparkles className="h-4 w-4" aria-hidden /> This week: {featured.label}</Link>
        <Link href="/dashboard/learn/templates" className="btn-ghost text-sm"><FileText className="h-4 w-4" aria-hidden /> Template library</Link>
        <Link href="/learn/words" className="btn-ghost text-sm">Words to know</Link>
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3" data-testid="learn-columns">
        {STAGE_ORDER.map((s) => {
          const key = modules.filter((m) => m.stage === s).map((m) => ({ m, l: all.find((l) => l.module.slug === m.slug && l.stage === s) })).filter((x) => x.l).slice(0, 5);
          return (
            <section key={s} aria-labelledby={`${s}-h`} className={`rounded-2xl border p-4 ${STAGE_INFO[s].panel}`}>
              <div className="flex items-baseline justify-between gap-2">
                <h2 id={`${s}-h`} className="text-2xl font-semibold text-slate-900">{STAGE_INFO[s].step}. {STAGE_INFO[s].name}</h2>
                <LostLink about={`Where to start in ${STAGE_INFO[s].name}`} />
              </div>
              <p className="mt-1 text-sm text-slate-700">{STAGE_INFO[s].tagline}</p>
              <ul className="mt-3 space-y-3">
                {key.map(({ m, l }) => {
                  const st = state(l!.ref);
                  return (
                    <li key={l!.ref}>
                      <Link href={`/learn/${m.slug}#${l!.id}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white hover:ring-2 hover:ring-cyan-200">
                        <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-[#5A50D6]/15 via-white to-cyan-100">
                          {VIDEOS[l!.ref] ? null : <span className="absolute left-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Video coming soon</span>}
                          <PlayCircle className="h-10 w-10 text-[#5A50D6] transition group-hover:scale-110" aria-hidden />
                          {st === "done" && <CheckCircle2 className="absolute right-2 top-2 h-6 w-6 rounded-full bg-white text-emerald-600" aria-label="Done" />}
                        </div>
                        <div className="p-3">
                          <p className="font-hand text-base leading-tight text-cyan-700">{m.title}</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-900">{l!.title.replace(/^Lesson [\d.]+:\s*/, "")}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" aria-hidden /> {mins(m)} min{st === "started" ? " · started" : st === "done" ? " · done" : ""}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <details className="group mt-8" data-testid="course-timeline">
        <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
          See entire course ({all.length} lessons) <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <ol className="relative mt-6 border-l-2 border-slate-200 pl-6">
          {ordered.map((g, gi) => {
            const d = g.lessons.filter((l) => state(l.ref) === "done").length;
            const locked = curIdx >= 0 && gi > curIdx + 1;
            return (
              <li key={`${g.s}-${g.m.slug}`} className="mb-6">
                <span className={`absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full ring-4 ring-white ${d === g.lessons.length ? "bg-emerald-500" : gi === curIdx ? "bg-[#5A50D6]" : locked ? "bg-slate-300" : STAGE_INFO[g.s].dot}`} aria-hidden />
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${STAGE_INFO[g.s].chip}`}>{STAGE_INFO[g.s].name}</span>
                  <h3 className="font-hand text-lg text-cyan-700">Module {g.m.number}: {g.m.title}</h3>
                  {locked && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" aria-hidden /> Opens after the modules before it (you can peek)</span>}
                  <span className="ml-auto text-xs tabular-nums text-slate-600">{d} of {g.lessons.length} done</span>
                </div>
                <div className="mt-1 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-200" aria-hidden><div className="h-full bg-emerald-500" style={{ width: `${(d / g.lessons.length) * 100}%` }} /></div>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {g.lessons.map((l) => {
                    const st = state(l.ref);
                    const here = l.ref === current?.ref;
                    const Icon = st === "done" ? CheckCircle2 : st === "started" ? CircleDot : locked ? Lock : Circle;
                    return (
                      <li key={l.ref}>
                        <Link href={`/learn/${g.m.slug}#${l.id}`} className={`flex items-start gap-2 rounded-lg px-2 py-1 text-sm hover:underline ${here ? "bg-[#5A50D6]/10 font-semibold text-slate-900" : locked ? "text-slate-500" : "text-slate-800"}`} aria-current={here ? "step" : undefined}>
                          <span className="w-7 flex-none text-right tabular-nums text-slate-400">{num.get(l.ref)}.</span>
                          <Icon className={`mt-0.5 h-4 w-4 flex-none ${st === "done" ? "text-emerald-600" : st === "started" ? "text-[#5A50D6]" : "text-slate-300"}`} aria-label={st === "done" ? "Done" : st === "started" ? "Started" : locked ? "Locked" : "Not started"} />
                          <span>{l.title.replace(/^Lesson /, "")}</span>
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
