"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, ExternalLink, List, ListChecks, Square, CheckSquare, TriangleAlert, Wand2, Target } from "lucide-react";
import type { LessonView, StepView } from "@/lib/learn";
import type { LessonAction } from "@/lib/lesson-actions";
import { lessonTaskId, stepKey } from "@/lib/lesson-actions";
import { doItForMe } from "@/app/dashboard/actions";
import { toggleStep, useLessonProgress } from "./progress-store";

export const PROSE =
  "prose prose-slate max-w-none prose-a:text-cyan-700 prose-p:my-0 prose-table:text-sm prose-th:bg-slate-50 prose-th:px-3 prose-td:px-3 [&_details]:rounded-xl [&_details]:bg-slate-50 [&_details]:p-4 [&_summary]:cursor-pointer [&_summary]:font-medium [&_blockquote]:not-italic [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-400 [&_blockquote]:bg-emerald-50 [&_blockquote]:px-6 [&_blockquote]:py-2 [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_.guide]:block [&_.guide_img]:my-2 [&_.guide_img]:rounded-xl [&_.guide_img]:border [&_.guide_img]:border-slate-200";

function DoItButton({ action, taskId, small = false }: { action: LessonAction; taskId: string; small?: boolean }) {
  const cls = `${small ? "btn-ghost !px-3 !py-1.5 !text-xs" : "btn-dark"}`;
  if (action.kind === "link")
    return (
      <Link href={action.href} className={cls}>
        <Wand2 className="h-4 w-4" aria-hidden /> {action.label}
      </Link>
    );
  return (
    <form action={doItForMe}>
      <input type="hidden" name="taskId" value={taskId} />
      <button className={cls} title="Helix prepares it and asks for your OK before anything changes">
        <Wand2 className="h-4 w-4" aria-hidden /> {action.kind === "delegate" ? action.label : "Do it for me"}
      </button>
    </form>
  );
}

function GuidePanel({ step, lesson }: { step: StepView; lesson: LessonView }) {
  return (
    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4 text-sm text-slate-700">
      <p className="flex items-center gap-2 font-semibold text-slate-900"><Compass className="h-4 w-4 text-violet-600" aria-hidden /> Guide me through step {step.n}</p>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>Read the instruction above once, then do only that one thing.</li>
        {step.links.length > 0 && (
          <li>
            Open the right page:{" "}
            {step.links.map((l, i) => (
              <span key={l.href + i}>
                {i > 0 && ", "}
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="font-medium text-cyan-700 underline">
                  {l.label}
                  {l.href.startsWith("http") && <ExternalLink className="ml-0.5 inline h-3 w-3" aria-hidden />}
                </a>
              </span>
            ))}
          </li>
        )}
        {step.meta && (
          <li>
            Prefer to click along? The <Link href="/dashboard/campaigns/new?mode=guide" className="font-medium text-cyan-700 underline">campaign builder in Guide me mode</Link> walks you through Meta screen by screen.
          </li>
        )}
        {step.action?.kind === "link" && (
          <li>
            Helix shortcut: <Link href={step.action.href} className="font-medium text-cyan-700 underline">{step.action.label}</Link>.
          </li>
        )}
        <li>Check you got the expected result. If not, re-read the watch out line or ask Helix to do it.</li>
        {lesson.hasDrawing && (
          <li>
            There is a drawing for this lesson under <a href={`#${lesson.id}-more`} className="font-medium text-cyan-700 underline">Good to know</a>.
          </li>
        )}
      </ol>
      {step.terms.length > 0 && (
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          {step.terms.map((t) => (
            <div key={t.term} className="rounded-lg bg-white px-3 py-2 ring-1 ring-violet-100">
              <dt className="text-xs font-semibold text-slate-900">{t.term}</dt>
              <dd className="text-xs text-slate-600">{t.means}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function StepCard({ step, lesson, total, done, guide, onGuide }: { step: StepView; lesson: LessonView; total: number; done: boolean; guide: boolean; onGuide: () => void }) {
  const key = stepKey(lesson.ref, step.n);
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${done ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => toggleStep(key, !done)}
          aria-pressed={done}
          aria-label={done ? `Step ${step.n} done. Untick` : `Mark step ${step.n} done`}
          className="mt-0.5 shrink-0 rounded text-emerald-700 hover:text-emerald-800"
        >
          {done ? <CheckSquare className="h-6 w-6" aria-hidden /> : <Square className="h-6 w-6 text-slate-400" aria-hidden />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Step {step.n} of {total}</p>
          <div className={`${PROSE} mt-1 text-[17px] leading-7 text-slate-900`} dangerouslySetInnerHTML={{ __html: step.html }} />
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-800"><Target className="h-3.5 w-3.5" aria-hidden /> Expected result</p>
            <div className={`${PROSE} mt-1 text-sm text-slate-800`} dangerouslySetInnerHTML={{ __html: step.expectedHtml }} />
          </div>
          {step.watchOutHtml && (
            <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800"><TriangleAlert className="h-3.5 w-3.5" aria-hidden /> Watch out</p>
              <div className={`${PROSE} mt-1 text-sm text-slate-800`} dangerouslySetInnerHTML={{ __html: step.watchOutHtml }} />
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <DoItButton action={step.action ?? { kind: "request", key: "request", label: "Do it for me" }} taskId={lessonTaskId(lesson.ref, step.n)} small />
            <button type="button" onClick={onGuide} aria-expanded={guide} className="btn-ghost !px-3 !py-1.5 !text-xs">
              <Compass className="h-4 w-4 text-violet-600" aria-hidden /> {guide ? "Hide guide" : "Guide me"}
            </button>
            <button type="button" onClick={() => toggleStep(key, !done)} className="ml-auto text-xs font-medium text-slate-500 hover:text-slate-900">
              <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden />{done ? "Done. Untick" : "I've done this"}
            </button>
          </div>
          {guide && <GuidePanel step={step} lesson={lesson} />}
        </div>
      </div>
    </div>
  );
}

export function LessonSteps({ lesson }: { lesson: LessonView }) {
  const { done, loaded } = useLessonProgress();
  const [showAll, setShowAll] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [guides, setGuides] = useState<Record<number, boolean>>({});
  const ref = useRef<HTMLElement>(null);
  const total = lesson.steps.length;
  const isDone = (n: number) => done.has(stepKey(lesson.ref, n));
  const doneCount = lesson.steps.filter((s) => isDone(s.n)).length;
  // Until the reader picks a step, show the first unticked one (progress loads after the first render).
  const firstOpen = loaded ? Math.max(0, lesson.steps.findIndex((s) => !isDone(s.n))) : 0;
  const cur = chosen ?? firstOpen;
  const setCur = (i: number) => setChosen(i);

  const step = lesson.steps[Math.min(cur, total - 1)];
  const go = (i: number) => setCur(Math.max(0, Math.min(total - 1, i)));
  const guideMe = () => {
    setShowAll(false);
    const first = lesson.steps.findIndex((s) => !isDone(s.n));
    const i = first === -1 ? 0 : first;
    setCur(i);
    setGuides((g) => ({ ...g, [lesson.steps[i].n]: true }));
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const toggleGuide = (n: number) => setGuides((g) => ({ ...g, [n]: !g[n] }));

  return (
    <section ref={ref} aria-labelledby={lesson.id} className="mt-12 scroll-mt-6 border-t border-slate-200 pt-8">
      <h2 id={lesson.id} className="font-display text-2xl font-semibold tracking-tight text-slate-900">
        <a href={`#${lesson.id}`} className="no-underline">{lesson.heading}</a>
        <span className={`ml-2 inline-flex translate-y-[-3px] items-center rounded-full px-2.5 py-0.5 align-middle font-sans text-[11px] font-semibold uppercase tracking-wide ring-1 ${lesson.stage.chip}`}>{lesson.stage.name}</span>
      </h2>

      {lesson.noticeHtml && <div className={`${PROSE} mt-4 text-sm`} dangerouslySetInnerHTML={{ __html: lesson.noticeHtml }} />}

      <div className="mt-4 rounded-xl bg-slate-50 px-5 py-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Why this matters</p>
        <div className={`${PROSE} mt-1 text-[15px] leading-7 text-slate-800`} dangerouslySetInnerHTML={{ __html: lesson.whyHtml }} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DoItButton action={lesson.doIt} taskId={lessonTaskId(lesson.ref)} />
        <button type="button" onClick={guideMe} className="btn-ghost"><Compass className="h-4 w-4 text-violet-600" aria-hidden /> Guide me</button>
        <button type="button" onClick={() => setShowAll((v) => !v)} aria-pressed={showAll} className="btn-ghost">
          {showAll ? <ListChecks className="h-4 w-4" aria-hidden /> : <List className="h-4 w-4" aria-hidden />}
          {showAll ? "One step at a time" : "Show all steps"}
        </button>
        <div className="ml-auto flex min-w-[160px] items-center gap-2 text-xs text-slate-600" aria-live="polite">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200" aria-hidden>
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} />
          </div>
          <span>{doneCount} of {total} steps done</span>
        </div>
      </div>

      {total > 0 && !showAll && step && (
        <div className="mt-5">
          <StepCard step={step} lesson={lesson} total={total} done={isDone(step.n)} guide={Boolean(guides[step.n])} onGuide={() => toggleGuide(step.n)} />
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={() => go(cur - 1)} disabled={cur === 0} className="btn-ghost"><ArrowLeft className="h-4 w-4" aria-hidden /> Back</button>
            <div className="flex flex-1 flex-wrap justify-center gap-1.5" role="tablist" aria-label="Steps">
              {lesson.steps.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  role="tab"
                  aria-selected={i === cur}
                  aria-label={`Go to step ${s.n}${isDone(s.n) ? " (done)" : ""}`}
                  onClick={() => go(i)}
                  className={`h-2.5 rounded-full transition-all ${i === cur ? "w-6 bg-slate-900" : isDone(s.n) ? "w-2.5 bg-emerald-500" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
                />
              ))}
            </div>
            {cur < total - 1 ? (
              <button
                type="button"
                onClick={() => go(cur + 1)}
                className="btn-dark"
              >
                Next <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <span className="text-sm font-medium text-emerald-700">{doneCount === total ? "Lesson done" : "Last step"}</span>
            )}
          </div>
        </div>
      )}

      {total > 0 && showAll && (
        <ol className="mt-5 space-y-4">
          {lesson.steps.map((s) => (
            <li key={s.n}>
              <StepCard step={s} lesson={lesson} total={total} done={isDone(s.n)} guide={Boolean(guides[s.n])} onGuide={() => toggleGuide(s.n)} />
            </li>
          ))}
        </ol>
      )}

      {lesson.extraHtml && (
        <div id={`${lesson.id}-more`} className="mt-6 scroll-mt-6">
          <h3 className="font-display text-lg font-semibold text-slate-900">Good to know</h3>
          <div className={`${PROSE} mt-2 text-[15px] [&_p]:my-3`} dangerouslySetInnerHTML={{ __html: lesson.extraHtml }} />
        </div>
      )}
    </section>
  );
}
