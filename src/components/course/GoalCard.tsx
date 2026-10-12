import Link from "next/link";
import { ArrowRight, Flag, PartyPopper, Route, Sparkles } from "lucide-react";
import { confirmGoal, dismissCelebration } from "@/app/course/actions";
import { fmtFinish, PHASES, dayDone } from "@/lib/course-plan";
import type { CourseView } from "@/lib/course";
import { CourseTaskRow, DatedTaskRow } from "./CourseTasks";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { goalDays } from "@/lib/course";

export function Celebration({ view }: { view: CourseView }) {
  if (!view.celebrate) return null;
  const next = view.current?.goal;
  return (
    <section className="celebrate relative mt-4 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-3 font-display text-xl font-semibold text-slate-900">
          <PartyPopper className="h-7 w-7 text-accent" aria-hidden /> Goal done: {view.celebrate.title}.
        </p>
        <form action={dismissCelebration}><button className="btn-ghost !px-3 !py-1.5 !text-xs">Nice, thanks</button></form>
      </div>
      <p className="mt-1 text-sm text-slate-700">{next ? <>Next up: <strong>{next.title}</strong>. It is unlocked now.</> : "You have finished every goal on this track. Pick the next track on the course page."}</p>
      <span className="confetti" aria-hidden />
    </section>
  );
}

/** Your goal, today's tasks and why it matters. Used on Today and on the course pages. */
export function GoalCard({ view, compact = false }: { view: CourseView; compact?: boolean }) {
  const c = view.current;
  if (!c) {
    return (
      <section className="card mt-4 p-5">
        <p className="font-semibold">Every goal on this track is done.</p>
        <Link href="/course" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">Choose your next track <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </section>
    );
  }
  const day = c.days[c.day - 1];
  const total = view.path.length;
  const f = c.finish;
  const todayDone = day ? dayDone(day, view.done) : true;
  return (
    <section aria-labelledby="goal-h" className="card mt-4 overflow-hidden">
      <div className="border-b border-slate-100 bg-ink px-5 py-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
          <span className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" aria-hidden /> Your goal · {c.n} of {total} · {PHASES[c.goal.phase].name}</span>
          <Link href="/course" className="flex items-center gap-1 normal-case tracking-normal text-white/80 hover:text-white"><Route className="h-3.5 w-3.5" aria-hidden /> See the whole path</Link>
        </div>
        <h2 id="goal-h" className="mt-2 font-display text-2xl font-semibold leading-tight">Goal {c.n}: {c.goal.title}</h2>
        <p className="mt-1 text-sm text-white/80"><strong className="text-white">Finish line:</strong> {c.goal.finishLine}</p>
        <div className="mt-3">
          <div className="flex items-baseline justify-between text-xs text-white/80">
            <span>{f.label}: <strong className="text-white">{f.unit === "days" && c.goal.finish.kind === "self" ? `${f.value} of ${f.target} days done` : `${fmtFinish(f.unit, f.value)} of ${fmtFinish(f.unit, f.target)}`}</strong></span>
            <span>{f.pct}%</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={f.pct} aria-label="Progress to the finish line">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${f.pct}%` }} />
          </div>
          {c.goal.id === "profit-dashboard" && !f.met && <p className="mt-1.5 text-xs text-white/70"><Link href="/dashboard/profit" className="underline">Open Profit setup</Link> and save your costs to reach the finish line.</p>}
          {c.goal.finish.kind === "metric" && !f.enoughData && c.goal.id !== "profit-dashboard" && <p className="mt-1.5 text-xs text-white/70">Helix checks this from your real daily numbers. <Link href="/dashboard/scorecard#entry" className="underline">Add your numbers</Link> so it can tell when you hit it.</p>}
        </div>
      </div>

      {c.needs ? (
        <div className="space-y-3 p-5">
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-slate-800"><strong>Why this matters:</strong> {c.goal.why}</p>
          <UpgradePrompt need={c.needs} forKey="course" title={`You finished the free goals. Goal ${c.n} is next.`}
            body={`${c.goal.title} is part of the ${PHASES[c.goal.phase].name} goals: ${goalDays(c.goal).length} days of short tasks with a finish line Helix checks from your numbers. Upgrade to keep going. You can still read every lesson in Learn for free.`} />
        </div>
      ) : (
      <div className="p-5">
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-slate-800"><Sparkles className="mr-1.5 inline h-4 w-4 text-positive" aria-hidden /><strong>Why this matters:</strong> {c.goal.why}</p>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-semibold text-slate-900">Today&apos;s tasks <span className="font-normal text-slate-500">· Day {c.day} of {c.days.length}{day ? ` · about ${day.tasks.reduce((a, t) => a + t.minutes, 0) + c.dated.reduce((a, t) => a + t.minutes, 0)} min` : ""}</span></h3>
          {!compact && <Link href={`/course/goal/${c.goal.id}`} className="text-sm font-medium text-cyan-700 underline">All {c.days.length} days</Link>}
        </div>
        <ul className="mt-3 space-y-3">
          {day?.tasks.map((t) => <CourseTaskRow key={t.id} t={t} done={view.done.has(t.id)} />)}
          {c.dated.map((t) => <DatedTaskRow key={t.id} t={t} done={view.done.has(t.id)} />)}
        </ul>
        {todayDone && !c.allDaysDone && <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">Day {c.day - 1 || c.day} is done. Day {c.day} is unlocked whenever you are ready.</p>}
        {c.allDaysDone && !f.met && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p><strong>All {c.days.length} days are done.</strong> {c.goal.finish.kind === "metric" ? <>The next goal unlocks when your numbers reach the finish line ({fmtFinish(f.unit, f.target)}). Keep the habits going and add your numbers each day.</> : <>Have you hit the finish line? Confirm it and the next goal unlocks.</>}</p>
            {f.canSelfConfirm && (
              <form action={confirmGoal} className="mt-3">
                <input type="hidden" name="goalId" value={c.goal.id} />
                <button className="btn-dark !px-3 !py-1.5 !text-xs">Yes, I&apos;ve hit it: {f.label.toLowerCase()}</button>
              </form>
            )}
          </div>
        )}
      </div>
      )}
    </section>
  );
}
