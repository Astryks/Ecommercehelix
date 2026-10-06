import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, Check, CheckCircle2, ListPlus, Mail } from "lucide-react";
import { addDays, prettyDay } from "@/lib/dates";
import type { SeasonAlert } from "@/lib/seasons";
import { BfcmTimeline, bfcmStageIndex } from "@/components/BfcmPlan";

const countdown = (a: SeasonAlert) =>
  a.reviewing ? `${a.name} review` : a.daysTo > 1 ? `${a.daysTo} days to ${a.name}` : a.daysTo === 1 ? `${a.name} is tomorrow` : a.daysTo === 0 ? `${a.name} is today` : `${a.name} is on now`;

/** Public home page version: real date, links to the free prep plan. */
export function SeasonalStrip({ alert }: { alert: SeasonAlert }) {
  return (
    <div className="relative border-b border-cyan-200 bg-cyan-100 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
        <CalendarClock className="h-5 w-5 flex-none" aria-hidden />
        <p className="flex-1 text-sm font-semibold sm:text-base">
          {alert.headline}
          <span className="ml-2 whitespace-nowrap rounded-full bg-white/40 px-2 py-0.5 text-xs font-bold">{countdown(alert)}</span>
        </p>
        <Link href="/start" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Get the free prep plan <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

type Props = {
  alert: SeasonAlert;
  others: SeasonAlert[];
  planAdded: boolean;
  done: Set<string>;
  addAction: (f: FormData) => Promise<void>;
  doneAction: (f: FormData) => Promise<void>;
};

/** Today page version: prominent alert, one-click prep plan, then the plan itself. */
export function SeasonalAlertCard({ alert, others, planAdded, done, addAction, doneAction }: Props) {
  const total = alert.tasks.length;
  const finished = alert.tasks.filter((t) => done.has(t.taskId)).length;
  const sorted = [...alert.tasks].sort((a, b) => a.due.localeCompare(b.due));
  const open = sorted.filter((t) => !done.has(t.taskId));
  const show = open.slice(0, 3);
  const rest = sorted.filter((t) => !show.includes(t));
  const bfcm = alert.eventKey === "black-friday" && !alert.reviewing;
  return (
    <section id="season" aria-labelledby="season-h" className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
      <div className="bg-cyan-100 px-6 py-5 text-slate-950">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/45 px-2.5 py-1"><CalendarClock className="h-3.5 w-3.5" aria-hidden /> Seasonal alert</span>
          <span className="rounded-full bg-slate-950/10 px-2.5 py-1">{countdown(alert)} ({prettyDay(alert.date)})</span>
          {bfcm && <span className="rounded-full bg-slate-950 px-2.5 py-1 text-white">Critical: the biggest sales window of the year for many stores</span>}
        </div>
        <h2 id="season-h" className="mt-3 text-xl font-bold leading-snug tracking-tight sm:text-2xl">{alert.headline}</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-900/80">{alert.why}</p>
        {bfcm && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-900/70">The plan, month by month</p>
            <BfcmTimeline current={bfcmStageIndex(addDays(alert.date, -alert.daysTo))} showTasks={false} />
          </div>
        )}
        {!planAdded && (
          <form action={addAction} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="planKey" value={alert.key} />
            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800">
              <ListPlus className="h-4 w-4" aria-hidden /> Add the prep plan ({total} steps)
            </button>
            <span className="text-xs font-medium text-slate-900/75">Adds each step to Today with a due date. You can tick them off as you go.</span>
          </form>
        )}
      </div>

      {planAdded ? (
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Your {alert.name} prep plan</h3>
            <span className="text-sm text-slate-500">{finished} of {total} steps done</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(finished / total) * 100}%` }} />
          </div>
          {show.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden /> Every step is done. Nice work.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {show.map((t) => (
                <li key={t.taskId} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{t.title}</p>
                      <p className={`mt-0.5 text-xs font-semibold ${t.overdue || t.due <= addDays(addDays(alert.date, -alert.daysTo), 7) ? "text-rose-600" : "text-slate-500"}`}>
                        {t.overdue ? "Due now" : `Due ${prettyDay(t.due)}`}
                      </p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                        {t.steps.map((s) => <li key={s}>{s}</li>)}
                      </ol>
                      {t.learn && (
                        <Link href={`/learn/${t.learn.slug}#${t.learn.anchor}`} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:underline">
                          <BookOpen className="h-3.5 w-3.5" aria-hidden /> Learn how: {t.learn.label}
                        </Link>
                      )}
                    </div>
                    <form action={doneAction}>
                      <input type="hidden" name="taskId" value={t.taskId} />
                      <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
                        <Check className="h-4 w-4" aria-hidden /> Mark done
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {rest.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-medium text-slate-600">See the whole plan ({total} steps)</summary>
              <ul className="mt-2 divide-y divide-slate-100">
                {rest.map((t) => (
                  <li key={t.taskId} className="flex items-center justify-between gap-3 py-2">
                    <span className={done.has(t.taskId) ? "text-slate-400 line-through" : "text-slate-700"}>{t.title}</span>
                    <span className="flex-none text-xs text-slate-500">{done.has(t.taskId) ? "Done" : prettyDay(t.due)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 bg-slate-50 px-6 py-3 text-xs text-slate-600">
        {others.length > 0 && (
          <span><strong className="text-slate-800">Also coming up:</strong> {others.map((o) => `${o.name} (${prettyDay(o.date)})`).join(", ")}</span>
        )}
        <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" aria-hidden /> Helix also sends this in your weekly report and as a Monday email and push reminder.</span>
      </div>
    </section>
  );
}
