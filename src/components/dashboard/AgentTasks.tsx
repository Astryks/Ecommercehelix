import Link from "next/link";
import { BookOpen, Check, CheckCircle2, Wand2 } from "lucide-react";
import type { TodayTask } from "@/lib/today-tasks";

type Action = (form: FormData) => Promise<void>;

/** The agent's Today list: at most 3 tasks, each with a reason, a guide, and a Do-it-for-me route into the approvals queue. */
export function AgentTasks({ tasks, done, doneAction, doAction, pending }: { tasks: TodayTask[]; done: Set<string>; doneAction: Action; doAction: Action; pending: Set<string> }) {
  const remaining = tasks.filter((t) => !done.has(t.taskId));
  return (
    <section aria-labelledby="todo-h" className="card p-5 sm:p-6" data-testid="agent-tasks">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="todo-h" className="text-xl font-semibold text-slate-900">Here&apos;s what to do today</h2>
        <p className="text-sm tabular-nums text-slate-600">{tasks.length - remaining.length} of {tasks.length} done</p>
      </div>
      {tasks.length === 0 && <p className="mt-3 text-slate-700">Nothing flagged today. Add yesterday&apos;s numbers and the coach will have something for you tomorrow.</p>}
      <ol className="mt-4 space-y-2">
        {tasks.map((t) => {
          const isDone = done.has(t.taskId);
          return (
            <li key={t.id} className={`rounded-xl border p-3 sm:p-4 ${isDone ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start gap-3">
                {isDone ? (
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-none text-emerald-600" aria-label="Done" />
                ) : (
                  <form action={doneAction}><input type="hidden" name="taskId" value={t.taskId} /><button aria-label={`Mark "${t.title}" done`} className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full border-2 border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500"><Check className="h-4 w-4" /></button></form>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}>
                    {t.title}
                    <span className="ml-2 text-xs font-normal text-slate-500">{t.minutes} min</span>
                  </p>
                  <p className="mt-0.5 text-sm text-slate-700"><span className="font-medium">Why:</span> {t.why}</p>
                  {!isDone && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Link href={t.guideHref} className="btn-ghost text-xs"><BookOpen className="h-3.5 w-3.5" aria-hidden /> Show me how</Link>
                      {(t.kind === "day" || t.kind === "insight" || t.kind === "season") && (
                        pending.has(t.taskId) ? (
                          <Link href="/dashboard/approvals" className="btn-ghost text-xs"><Wand2 className="h-3.5 w-3.5" aria-hidden /> Waiting for your approval</Link>
                        ) : (
                          <form action={doAction}><input type="hidden" name="taskId" value={t.taskId} /><button className="btn-ghost text-xs"><Wand2 className="h-3.5 w-3.5" aria-hidden /> Do it for me</button></form>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-slate-500">Do it for me never spends money or changes a live budget. It prepares a paused draft (or a checklist) and waits in <Link href="/dashboard/approvals" className="text-cyan-700 underline">Waiting for your OK</Link> until you approve.</p>
    </section>
  );
}
