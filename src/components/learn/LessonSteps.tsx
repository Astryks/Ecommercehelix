"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Compass, ExternalLink, ListChecks, PartyPopper, TriangleAlert, Target } from "lucide-react";
import type { LessonView, StepView } from "@/lib/learn";
import { stepKey } from "@/lib/lesson-actions";
import { toggleStep, useLessonProgress } from "./progress-store";

/** Plain first sentence of some lesson HTML, for the "In short" and "Do this now" lines. */
export function firstSentence(html: string, max = 160) {
  const t = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  const m = t.match(/^(.{20,}?[.!?])(\s|$)/);
  const out = (m ? m[1] : t).trim();
  return out.length > max ? out.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : out;
}

export const PROSE =
  "prose prose-slate max-w-none prose-a:text-cyan-700 prose-p:my-0 prose-table:text-sm prose-th:bg-slate-50 prose-th:px-3 prose-td:px-3 [&_details]:rounded-xl [&_details]:bg-slate-50 [&_details]:p-4 [&_summary]:cursor-pointer [&_summary]:font-medium [&_blockquote]:not-italic [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-400 [&_blockquote]:bg-emerald-50 [&_blockquote]:px-6 [&_blockquote]:py-2 [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_.guide]:block [&_.guide_img]:my-2 [&_.guide_img]:rounded-xl [&_.guide_img]:border [&_.guide_img]:border-slate-200";

export type NextLesson = { heading: string; href: string } | null;

/** Short, plain checklist line for a step: its first sentence, kept small. */
export function checkLabel(html: string) {
  return firstSentence(html, 90);
}

function StepTips({ step, lesson }: { step: StepView; lesson: LessonView }) {
  const tips: React.ReactNode[] = [];
  if (step.links.length) tips.push(<>Open: {step.links.map((l, i) => (
    <span key={l.href + i}>{i > 0 && ", "}<a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="font-medium text-cyan-700 underline">{l.label}{l.href.startsWith("http") && <ExternalLink className="ml-0.5 inline h-3 w-3" aria-hidden />}</a></span>))}</>);
  if (step.meta) tips.push(<>Want to click along? Use the <Link href="/dashboard/campaigns/new?mode=guide" className="font-medium text-cyan-700 underline">campaign builder</Link>.</>);
  if (step.action?.kind === "link") tips.push(<>Shortcut: <Link href={step.action.href} className="font-medium text-cyan-700 underline">{step.action.label}</Link>.</>);
  if (lesson.hasDrawing) tips.push(<>There is a drawing under <a href={`#${lesson.id}-more`} className="font-medium text-cyan-700 underline">Good to know</a>.</>);
  if (!tips.length && !step.terms.length) return null;
  return (
    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><Compass className="h-3.5 w-3.5" aria-hidden /> Tips</p>
      {tips.length > 0 && <ul className="mt-1 list-disc space-y-1 pl-5">{tips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
      {step.terms.length > 0 && (
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {step.terms.map((t) => (
            <div key={t.term} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200"><dt className="text-xs font-semibold text-slate-900">{t.term}</dt><dd className="text-xs text-slate-600">{t.means}</dd></div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function LessonSteps({ lesson, next = null }: { lesson: LessonView; slug?: string; next?: NextLesson }) {
  const { done, loaded } = useLessonProgress();
  const [chosen, setChosen] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const total = lesson.steps.length;
  const isDone = (n: number) => done.has(stepKey(lesson.ref, n));
  const doneCount = lesson.steps.filter((s) => isDone(s.n)).length;
  const allDone = total > 0 && doneCount === total;
  const firstOpen = loaded ? Math.max(0, lesson.steps.findIndex((s) => !isDone(s.n))) : 0;
  const cur = Math.min(chosen ?? firstOpen, Math.max(0, total - 1));
  const step = lesson.steps[cur];
  const last = cur === total - 1;
  const doneNext = () => {
    if (!step) return;
    if (!isDone(step.n)) toggleStep(stepKey(lesson.ref, step.n), true);
    if (!last) setChosen(cur + 1);
    else setChosen(cur);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={ref} aria-labelledby={lesson.id} className="mt-12 scroll-mt-6 border-t border-slate-200 pt-8">
      <h2 id={lesson.id} className="font-hand text-2xl font-semibold tracking-tight text-slate-900">
        <a href={`#${lesson.id}`} className="no-underline">{lesson.heading}</a>
        <span className={`ml-2 inline-flex translate-y-[-3px] items-center rounded-full px-2.5 py-0.5 align-middle font-sans text-[11px] font-semibold uppercase tracking-wide ring-1 ${lesson.stage.chip}`}>{lesson.stage.name}</span>
      </h2>

      {lesson.noticeHtml && <div className={`${PROSE} mt-4 text-sm`} dangerouslySetInnerHTML={{ __html: lesson.noticeHtml }} />}

      <div className="mt-4 grid gap-3 sm:grid-cols-2" data-testid="lesson-summary">
        <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">In short</p>
          <p className="mt-1 text-[15px] leading-6 text-slate-900">{firstSentence(lesson.whyHtml)}</p>
        </div>
        {(() => { const next = lesson.steps.find((x) => !isDone(x.n)); return next ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Do this now</p>
            <p className="mt-1 text-[15px] leading-6 text-slate-900">Step {next.n}: {firstSentence(next.html)}</p>
          </div>) : (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Done</p><p className="mt-1 text-[15px] text-slate-900">All steps done. Nice work.</p></div>); })()}
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 px-5 py-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Why this matters</p>
        <div className={`${PROSE} mt-1 text-[15px] leading-7 text-slate-800`} dangerouslySetInnerHTML={{ __html: lesson.whyHtml }} />
      </div>

      {total > 0 && (
        <div className="mt-6" data-testid="lesson-stepper">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600" aria-live="polite">
            <span className="uppercase tracking-[0.14em] text-cyan-700">Step {cur + 1} of {total}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200" aria-hidden>
              <div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${(doneCount / total) * 100}%` }} />
            </div>
            <span>{doneCount} of {total} done</span>
          </div>
          {step && (
            <div className={`mt-3 rounded-2xl border p-5 sm:p-6 ${isDone(step.n) ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white"}`}>
              <div className={`${PROSE} text-[17px] leading-7 text-slate-900`} dangerouslySetInnerHTML={{ __html: step.html }} />
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
              <StepTips step={step} lesson={lesson} />
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button type="button" onClick={doneNext} className="btn-primary" data-testid="done-next">
                  <Check className="h-4 w-4" aria-hidden /> {last ? "Finish lesson" : "Done, next step"}
                </button>
                {cur > 0 && <button type="button" onClick={() => setChosen(cur - 1)} className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"><ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />Back</button>}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white" data-testid="lesson-checklist">
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 px-5 py-4 text-left">
              <ListChecks className="h-5 w-5 text-cyan-700" aria-hidden />
              <span className="flex-1 font-semibold text-slate-900">Checklist</span>
              <span className="text-sm text-slate-600">{doneCount} of {total} done</span>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {open && (
              <ul className="border-t border-slate-100 px-2 py-2">
                {lesson.steps.map((s, i) => {
                  const d = isDone(s.n);
                  return (
                    <li key={s.n}>
                      <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                        <input type="checkbox" checked={d} onChange={(e) => { toggleStep(stepKey(lesson.ref, s.n), e.target.checked); if (e.target.checked && i === cur && !last) setChosen(cur + 1); }}
                          className="mt-0.5 h-6 w-6 flex-none cursor-pointer accent-emerald-600" />
                        <span className={`text-base leading-6 ${d ? "text-slate-500 line-through" : "text-slate-900"}`}><span className="font-semibold">{i + 1}.</span> {checkLabel(s.html)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {allDone && (
            <div className="mt-4 space-y-3" role="status" data-testid="lesson-done">
              <div className="helix-celebrate flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 ring-1 ring-emerald-200">
                <PartyPopper className="h-6 w-6 flex-none text-emerald-700" aria-hidden />
                <p className="font-semibold text-emerald-900">All done! Great work.</p>
              </div>
              {next && (
                <Link href={next.href} className="card flex items-center gap-3 p-5 hover:border-cyan-400" data-testid="up-next">
                  <span className="flex-1"><span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Up next</span><span className="font-hand text-lg text-slate-900">{next.heading}</span></span>
                  <ArrowRight className="h-5 w-5 text-cyan-700" aria-hidden />
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {lesson.extraHtml && (
        <div id={`${lesson.id}-more`} className="mt-6 scroll-mt-6">
          <h3 className="font-hand text-lg font-semibold text-slate-900">Good to know</h3>
          <div className={`${PROSE} mt-2 text-[15px] [&_p]:my-3`} dangerouslySetInnerHTML={{ __html: lesson.extraHtml }} />
        </div>
      )}
    </section>
  );
}
