import Link from "next/link";
import { BookOpen, Check, CheckCircle2, Wand2 } from "lucide-react";
import type { TodayPlan } from "@/lib/today-tasks";
import { LostLink } from "./LostLink";

type Action = (form: FormData) => Promise<void>;

/** Today's list in three time blocks (Morning check, Main focus, Before you finish) with a progress bar. */
export function TodayTasks({ plan, doneAction, doAction }: { plan: TodayPlan; doneAction: Action; doAction: Action }) {
  const allDone = plan.total > 0 && plan.done === plan.total;
  return (
    <section aria-labelledby="todo-h" className="card p-5 sm:p-6" data-testid="today-tasks">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="todo-h" className="text-xl font-semibold text-slate-900">Here&apos;s what to do today</h2>
        <p className="text-sm tabular-nums text-slate-600">{plan.done} of {plan.total} done</p>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Today's progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={plan.pct}>
        <div className="h-full rounded-full bg-[#5A50D6] transition-all" style={{ width: `${plan.pct}%` }} />
      </div>
      {allDone && <p className="mt-3 text-slate-700">All done for today. Nice work. Come back tomorrow for the next small step.</p>}
      {plan.blocks.map((b) => (
        <div key={b.id} className="mt-5">
          <h3 className="font-hand text-lg text-cyan-700">{b.title} <span className="text-sm text-slate-500">({b.minutes} min)</span></h3>
          <ol className="mt-2 space-y-2">
            {b.tasks.map((t) => (
              <li key={t.id} className={`rounded-xl border p-3 sm:p-4 ${t.done ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start gap-3">
                  {t.done ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 flex-none text-emerald-600" aria-label="Done" />
                  ) : (
                    <form action={doneAction}><input type="hidden" name="taskId" value={t.taskId} /><button aria-label={`Mark "${t.title}" done`} className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full border-2 border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500"><Check className="h-4 w-4" /></button></form>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${t.done ? "text-slate-500 line-through" : "text-slate-900"}`}>
                      {t.title}
                      {t.tag && <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 align-middle text-[11px] font-semibold text-amber-900">{t.tag}</span>}
                      <span className="ml-2 text-xs font-normal text-slate-500">{t.minutes} min</span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700"><span className="font-medium">Why:</span> {t.why}</p>
                    {!t.done && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Link href={t.lessonHref} className="btn-ghost text-xs"><BookOpen className="h-3.5 w-3.5" aria-hidden /> {t.lessonLabel}</Link>
                        {(t.kind === "day" || t.kind === "insight" || t.kind === "season") && (
                          <form action={doAction}><input type="hidden" name="taskId" value={t.taskId} /><button className="btn-ghost text-xs"><Wand2 className="h-3.5 w-3.5" aria-hidden /> Do it for me</button></form>
                        )}
                        <LostLink about={t.title} className="ml-auto" />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <p className="mt-4 text-xs text-slate-500">Do it for me never spends money or changes your store on its own. It waits in Settings, Waiting for your OK, until you approve.</p>
    </section>
  );
}
