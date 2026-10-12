import Link from "next/link";
import { redirect } from "next/navigation";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { planName } from "@/lib/plans";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCourse, goalDays } from "@/lib/course";
import { canonicalGoalId, dayDone, GOALS, PHASES } from "@/lib/course-plan";
import { CourseTaskRow } from "@/components/course/CourseTasks";
import { GoalCard } from "@/components/course/GoalCard";

export const metadata = { title: "Goal" };

export default async function GoalPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ day?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (canonicalGoalId(id) !== id) redirect(`/course/goal/${canonicalGoalId(id)}`);
  const u = await requireUser(`/course/goal/${id}`);
  const view = await getCourse(u.id);
  const item = view.path.find((p) => p.goal.id === id);
  if (!item || !GOALS.some((g) => g.id === id)) notFound();
  const { goal } = item;
  const days = goalDays(goal);
  const isCurrent = item.status === "current";
  const currentDay = isCurrent ? view.current!.day : item.status === "done" ? days.length : 0;
  const shown = Math.min(days.length, Math.max(1, Number(sp.day) || currentDay || 1));
  const day = days[shown - 1];
  const dayLocked = Boolean(item.needs) || item.status === "locked" || (isCurrent && shown > currentDay);
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/course" className="inline-flex items-center gap-1 text-sm text-cyan-700"><ArrowLeft className="h-4 w-4" aria-hidden /> The course path</Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{PHASES[goal.phase].name} · Goal {item.n} of {view.path.length} · {days.length} days</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{goal.title}</h1>
      <p className="mt-2 text-slate-700"><strong>Finish line:</strong> {goal.finishLine}</p>
      <p className="mt-1 text-slate-600"><strong>Why this matters:</strong> {goal.why}</p>

      {isCurrent && <GoalCard view={view} compact />}

      <nav aria-label="Days" className="mt-6 flex flex-wrap gap-1.5">
        {days.map((d) => {
          const done = dayDone(d, view.done);
          const locked = item.status === "locked" || (isCurrent && d.n > currentDay);
          return (
            <Link key={d.n} href={`/course/goal/${goal.id}?day=${d.n}`} aria-current={d.n === shown ? "page" : undefined} className={`flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg px-2 text-sm font-semibold ring-1 ${d.n === shown ? "bg-slate-900 text-white ring-slate-900" : done ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : locked ? "bg-white text-slate-400 ring-slate-200" : "bg-white text-slate-800 ring-cyan-300"}`}>
              {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : locked ? <Lock className="h-3 w-3" aria-hidden /> : null}
              {d.n}
            </Link>
          );
        })}
      </nav>

      <section className="card mt-4 p-5">
        <h2 className="font-semibold">Day {shown}: {day.tasks.length === 1 ? "a light day, one task" : `${day.tasks.length} tasks`} <span className="font-normal text-slate-500">· about {day.tasks.reduce((a, t) => a + t.minutes, 0)} min</span></h2>
        {item.needs && <div className="mt-3"><UpgradePrompt compact need={item.needs} forKey="course" title={`This goal is on the ${planName(item.needs)} plan`} body="You can read the tasks here and every lesson in Learn. Ticking tasks and tracking the finish line opens when you upgrade." /></div>}
        {dayLocked && !item.needs && <p className="mt-1 text-sm text-slate-500">This day opens when the one before it is done. You can read ahead.</p>}
        <ul className="mt-3 space-y-3">
          {day.tasks.map((t) => <CourseTaskRow key={t.id} t={t} done={view.done.has(t.id)} locked={dayLocked} />)}
        </ul>
      </section>
    </div>
  );
}
