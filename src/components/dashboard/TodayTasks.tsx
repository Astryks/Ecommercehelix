import Link from "next/link";
import { BookOpen, Check, Wand2 } from "lucide-react";
import type { TodayTask } from "@/lib/today-tasks";
import { LostLink } from "./LostLink";

type Action = (form: FormData) => Promise<void>;

/** Today's 1 to 3 tasks, each with Guide me, Do it for me and Done. */
export function TodayTasks({ tasks, doneAction, doAction }: { tasks: TodayTask[]; doneAction: Action; doAction: Action }) {
  return (
    <section aria-labelledby="todo-h" className="card p-5 sm:p-6">
      <h2 id="todo-h" className="text-xl font-semibold text-slate-900">Here&apos;s what to do today</h2>
      {tasks.length === 0 ? (
        <p className="mt-2 text-slate-700">All done for today. Nice work. Come back tomorrow for the next small step.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {tasks.map((t, n) => (
            <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-hand text-lg text-cyan-700">Step {n + 1} · about {t.minutes} min</p>
              <p className="mt-1 font-semibold text-slate-900">{t.title}</p>
              <p className="mt-1 text-sm text-slate-700">{t.why}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link href={t.guideHref} className="btn-ghost text-sm"><BookOpen className="h-4 w-4" aria-hidden /> Guide me</Link>
                {t.kind === "numbers" ? (
                  <Link href="/dashboard/integrations" className="btn-ghost text-sm"><Wand2 className="h-4 w-4" aria-hidden /> Do it for me</Link>
                ) : (
                  <form action={doAction}><input type="hidden" name="taskId" value={t.taskId} /><button className="btn-ghost text-sm"><Wand2 className="h-4 w-4" aria-hidden /> Do it for me</button></form>
                )}
                <form action={doneAction}><input type="hidden" name="taskId" value={t.taskId} /><button className="btn-primary text-sm"><Check className="h-4 w-4" aria-hidden /> Done</button></form>
                <LostLink about={t.title} className="ml-auto" />
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-3 text-xs text-slate-500">Do it for me never spends money or changes your store on its own. It waits in Settings, Waiting for your OK, until you approve.</p>
    </section>
  );
}
