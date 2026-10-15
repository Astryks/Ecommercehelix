import Link from "next/link";
import { CheckCircle2, Circle, CircleDot, FileText } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCompletions, getLessonSteps } from "@/lib/repo";
import { listModules } from "@/lib/learn";
import { lessonTaskId } from "@/lib/lesson-actions";
import { STAGE_INFO, STAGE_ORDER } from "@/lib/stages";
import { LostLink } from "@/components/dashboard/LostLink";

export const metadata = { title: "Learn" };

export default async function DashboardLearn() {
  const u = await requireUser("/dashboard/learn");
  const [comps, steps] = await Promise.all([getCompletions(u.id), getLessonSteps(u.id)]);
  const done = new Set(comps.map((c) => c.taskId));
  const started = new Set(steps.map((k) => k.split("#")[0]));
  const modules = listModules();
  const all = modules.flatMap((m) => m.lessons.filter((l) => l.ref).map((l) => ({ ...l, ref: l.ref!, module: m })));
  const state = (ref: string) => (done.has(lessonTaskId(ref)) ? "done" : started.has(ref) ? "started" : "new");
  const doneCount = all.filter((l) => state(l.ref) === "done").length;
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
      <p className="mt-1 max-w-2xl text-slate-700">Every lesson sits in one of three places: Attract, Convert or Grow. Start anywhere. Ticks show what you have done. {doneCount} of {all.length} lessons done.</p>
      <p className="mt-3 flex flex-wrap gap-2">
        <Link href="/dashboard/learn/templates" className="btn-ghost text-sm"><FileText className="h-4 w-4" aria-hidden /> Template library</Link>
        <Link href="/learn/words" className="btn-ghost text-sm">Words to know</Link>
        <Link href="/course" className="btn-ghost text-sm">Your course</Link>
      </p>
      <nav aria-label="Stages" className="mt-5 flex gap-2">{STAGE_ORDER.map((s) => <a key={s} href={`#${s}`} className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${STAGE_INFO[s].chip}`}>{STAGE_INFO[s].name}</a>)}</nav>
      {STAGE_ORDER.map((s) => {
        const lessons = all.filter((l) => l.stage === s);
        const groups = [...new Map(lessons.map((l) => [l.module.slug, l.module])).values()];
        return (
          <section key={s} id={s} aria-labelledby={`${s}-h`} className="card mt-6 scroll-mt-6 p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 id={`${s}-h`} className="text-2xl font-semibold text-slate-900">{STAGE_INFO[s].step}. {STAGE_INFO[s].name}</h2>
              <LostLink about={`Where to start in ${STAGE_INFO[s].name}`} />
            </div>
            <p className="mt-1 text-sm text-slate-700">{STAGE_INFO[s].tagline}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {groups.map((m) => (
                <div key={m.slug}>
                  <h3 className="font-hand text-lg text-cyan-700"><Link href={`/learn/${m.slug}`} className="hover:underline">{m.title}</Link></h3>
                  <ul className="mt-1 space-y-1">
                    {lessons.filter((l) => l.module.slug === m.slug).map((l) => {
                      const st = state(l.ref);
                      const Icon = st === "done" ? CheckCircle2 : st === "started" ? CircleDot : Circle;
                      return (
                        <li key={l.ref}>
                          <Link href={`/learn/${m.slug}#${l.id}`} className="flex items-start gap-2 text-sm text-slate-800 hover:underline">
                            <Icon className={`mt-0.5 h-4 w-4 flex-none ${st === "done" ? "text-emerald-600" : st === "started" ? "text-[#5A50D6]" : "text-slate-300"}`} aria-label={st === "done" ? "Done" : st === "started" ? "Started" : "Not started"} />
                            <span>{l.title.replace(/^Lesson /, "")}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
