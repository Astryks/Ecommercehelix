import Link from "next/link";
import { Check, Lock, Route } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCourse } from "@/lib/course";
import { COURSE_TRACKS, PHASES, type Phase } from "@/lib/course-plan";
import { setCourseTrack } from "./actions";
import { planName } from "@/lib/plans";
import { Celebration, GoalCard } from "@/components/course/GoalCard";

export const metadata = { title: "Your course" };

export default async function CoursePage() {
  const u = await requireUser("/course");
  const view = await getCourse(u.id);
  const phases = Object.keys(PHASES) as Phase[];
  const doneCount = view.path.filter((p) => p.status === "done").length;
  const totalDays = view.path.reduce((a, p) => a + p.days, 0);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><Route className="h-7 w-7 text-cyan-600" aria-hidden /> The Helix Course</h1>
      <p className="mt-1 max-w-2xl text-slate-600">One clear goal at a time. Each goal has a finish line you can measure and a few short tasks a day. Finish the day, the next one opens. Hit the finish line, the next goal opens. {doneCount} of {view.path.length} goals done, about {totalDays} days in total.</p>

      <form action={setCourseTrack} className="mt-4 flex flex-wrap items-center gap-2 text-sm" aria-label="Your track">
        <span className="font-medium text-slate-700">Your track:</span>
        {COURSE_TRACKS.map((t) => (
          <button key={t.id} name="track" value={t.id} aria-pressed={view.track === t.id} className={`rounded-full px-3 py-1.5 ring-1 ${view.track === t.id ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`} title={t.who}>
            {t.name} <span className="opacity-70">({t.band})</span>
          </button>
        ))}
      </form>

      <Celebration view={view} />

      <ol className="mt-6 space-y-6" aria-label="Goals in order">
        {phases.map((ph) => {
          const items = view.path.filter((p) => p.goal.phase === ph);
          if (!items.length) return null;
          return (
            <li key={ph}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{PHASES[ph].name} · <span className="normal-case tracking-normal">{PHASES[ph].blurb}</span></p>
              <ol className="mt-2 border-l-2 border-slate-200 pl-5">
                {items.map((p) => (
                  <li key={p.goal.id} className="relative py-2">
                    <span className={`absolute -left-[31px] top-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-mist ${p.status === "done" ? "bg-emerald-600 text-white" : p.status === "current" ? "bg-accent text-white" : "bg-slate-200 text-slate-500"}`} aria-hidden>
                      {p.status === "done" ? <Check className="h-3.5 w-3.5" /> : p.status === "locked" ? <Lock className="h-3 w-3" /> : <span className="text-[11px] font-bold">{p.n}</span>}
                    </span>
                    <div className={`rounded-xl border px-4 py-3 ${p.status === "current" ? "border-cyan-300 bg-white shadow-sm" : p.status === "done" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white/60"}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Link href={`/course/goal/${p.goal.id}`} className={`font-semibold ${p.status === "locked" ? "text-slate-500" : "text-slate-900 hover:text-cyan-700"}`}>Goal {p.n}: {p.goal.title}</Link>
                        <span className="text-xs text-slate-500">{p.days} days · {p.status === "done" ? "Done" : p.status === "current" ? "You are here" : "Locked"}{p.needs ? <span className="ml-1.5 rounded-full bg-[#D9772B]/10 px-2 py-0.5 font-semibold text-[#B85F1C]">{planName(p.needs)}</span> : p.goal.phase === "numbers" ? <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">Free</span> : null}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">Finish line: {p.goal.finishLine}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          );
        })}
      </ol>

      <h2 className="mt-10 text-xl font-semibold">Where you are now</h2>
      <GoalCard view={view} />
    </div>
  );
}
