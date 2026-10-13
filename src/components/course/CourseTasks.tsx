import Link from "next/link";
import { CalendarClock, Check, Clock, Compass, Wand2 } from "lucide-react";
import { doItForMe } from "@/app/dashboard/actions";
import { toggleCourseTask } from "@/app/course/actions";
import { lessonAction, lessonTaskId } from "@/lib/lesson-actions";
import type { CourseTask, DatedTask } from "@/lib/course-plan";
import { prettyDay } from "@/lib/dates";

function Tick({ id, done, refId, step, label }: { id: string; done: boolean; refId?: string; step?: number; label: string }) {
  return (
    <form action={toggleCourseTask}>
      <input type="hidden" name="taskId" value={id} />
      <input type="hidden" name="done" value={done ? "0" : "1"} />
      {refId && <input type="hidden" name="ref" value={refId} />}
      {step && <input type="hidden" name="step" value={step} />}
      <button
        aria-label={done ? `Mark not done: ${label}` : `Mark done: ${label}`}
        aria-pressed={done}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${done ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white hover:border-emerald-500"}`}
      >
        {done && <Check className="h-4 w-4" aria-hidden />}
      </button>
    </form>
  );
}

export function CourseTaskRow({ t, done, locked = false }: { t: CourseTask; done: boolean; locked?: boolean }) {
  const a = lessonAction(t.action);
  return (
    <li className={`rounded-xl border p-4 ${done ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"}`}>
      <div className="flex gap-3">
        {locked ? <span className="mt-0.5 h-6 w-6 shrink-0 rounded-md border-2 border-dashed border-slate-300" aria-hidden /> : <Tick id={t.id} done={done} refId={t.lessonRef} step={t.step} label={t.title} />}
        <div className="min-w-0 flex-1">
          <p className={`font-medium leading-6 ${done ? "text-slate-500 line-through decoration-emerald-600/40" : "text-slate-900"}`}>{t.title}</p>
          <p className="mt-1 text-sm text-slate-600"><span className="font-semibold text-emerald-800">You will have: </span>{t.expected}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden /> About {t.minutes} min</span>
            <span aria-hidden>·</span>
            <Link href={t.href} className="text-cyan-700 underline">Lesson {t.lessonRef}, step {t.step}: {t.lessonTitle}</Link>
          </div>
          {!locked && !done && (
            <div className="mt-3 flex flex-wrap gap-2">
              {a.kind === "link" ? (
                <Link href={a.href} className="btn-dark !px-3 !py-1.5 !text-xs"><Wand2 className="h-3.5 w-3.5" aria-hidden /> Do it for me</Link>
              ) : (
                <form action={doItForMe}>
                  <input type="hidden" name="taskId" value={lessonTaskId(t.lessonRef, t.step)} />
                  <button className="btn-dark !px-3 !py-1.5 !text-xs" title="Helix gives you a checklist, or builds Meta drafts for your OK"><Wand2 className="h-3.5 w-3.5" aria-hidden /> Help me do it</button>
                </form>
              )}
              <details className="group">
                <summary className="btn-ghost !px-3 !py-1.5 !text-xs cursor-pointer list-none"><Compass className="h-3.5 w-3.5 text-violet-600" aria-hidden /> Guide me</summary>
                <ol className="mt-2 list-decimal space-y-1 rounded-xl border border-violet-200 bg-violet-50/60 p-3 pl-7 text-sm text-slate-700">
                  <li>Open <Link href={t.href} className="font-medium text-cyan-700 underline">the lesson</Link> and find step {t.step}.</li>
                  <li>Do only that one thing. It takes about {t.minutes} minutes.</li>
                  <li>Check you have: {t.expected}</li>
                  <li>Tick the box here. Stuck? Press Help me do it.</li>
                </ol>
              </details>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function DatedTaskRow({ t, done }: { t: DatedTask; done: boolean }) {
  return (
    <li className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex gap-3">
        <Tick id={t.id} done={done} label={t.title} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800"><CalendarClock className="mr-1 inline h-3.5 w-3.5" aria-hidden />{t.why} · due {prettyDay(t.due)}</p>
          <p className="mt-1 font-medium text-slate-900">{t.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden /> About {t.minutes} min</span>
            <span aria-hidden>·</span>
            <Link href={t.href} className="text-cyan-700 underline">{t.kind === "season" ? "Open the sale plan" : "How to do it"}</Link>
          </div>
        </div>
      </div>
    </li>
  );
}
