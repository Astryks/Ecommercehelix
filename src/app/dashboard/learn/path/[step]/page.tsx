import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, CircleDot, ListChecks, PlayCircle, Video } from "lucide-react";
import { lessonStateFn } from "@/lib/lesson-done";
import { requireUser } from "@/lib/session";
import { getCompletions, getLessonSteps } from "@/lib/repo";
import { listModules } from "@/lib/learn";
import { STAGE_INFO } from "@/lib/stages";
import { FIRST_AD_BEFORE, FIRST_AD_ORDER, PATH, pathStepById } from "@/lib/learn-path";

export function generateStaticParams() {
  return PATH.map((p) => ({ step: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ step: string }> }) {
  const p = pathStepById((await params).step);
  return { title: p ? `Step ${p.n}: ${p.title}` : "Learn" };
}

export default async function PathStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const p = pathStepById(step);
  if (!p) notFound();
  const u = await requireUser(`/dashboard/learn/path/${step}`);
  const [comps, steps] = await Promise.all([getCompletions(u.id), getLessonSteps(u.id)]);
  const done = new Set(comps.map((c) => c.taskId));
  const byRef = new Map(listModules().flatMap((m) => m.lessons.filter((l) => l.ref).map((l) => [l.ref!, { ...l, module: m }] as const)));
  const lessons = p.refs.map((r) => byRef.get(r)).filter((l) => l !== undefined);
  const lessonState = lessonStateFn(done, steps);
  const state = (ref: string) => lessonState(ref, byRef.get(ref)?.stepNs);
  const d = lessons.filter((l) => state(l.ref!) === "done").length;
  const next = lessons.find((l) => state(l.ref!) !== "done");
  const prev = PATH.find((x) => x.n === p.n - 1);
  const after = PATH.find((x) => x.n === p.n + 1);
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/learn" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to your path</Link>
      <p className="mt-3 font-display text-lg text-[#5A50D6]">Step {p.n} of {PATH.length}</p>
      <h1 className="font-serif text-4xl uppercase tracking-wide text-slate-900">{p.title}</h1>
      <p className="mt-1 max-w-2xl text-slate-700">{p.blurb}</p>
      <p className="mt-1 text-sm tabular-nums text-slate-600">{d} of {lessons.length} lessons done</p>

      {p.id === "first-ad" && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section aria-labelledby="before-h" className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4" data-testid="before-you-start">
            <h2 id="before-h" className="font-display text-lg text-[#5A50D6]">Before you start</h2>
            <p className="text-sm text-slate-700">Have all of these ready first:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
              {FIRST_AD_BEFORE.map((t) => <li key={t} className="flex gap-2"><ListChecks className="mt-0.5 h-4 w-4 flex-none text-amber-700" aria-hidden />{t}</li>)}
            </ul>
          </section>
          <section aria-labelledby="order-h" className="rounded-2xl border border-slate-200 bg-white p-4" data-testid="setup-order">
            <h2 id="order-h" className="font-display text-lg text-[#5A50D6]">Do it in this order</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-800">
              {FIRST_AD_ORDER.map((t, i) => <li key={t}>{i === 0 ? <strong>Do this first: {t}</strong> : t}</li>)}
            </ol>
          </section>
        </div>
      )}

      {next && (
        <p className="mt-6"><Link href={`/learn/${next.module.slug}#${next.id}`} className="btn-primary"><PlayCircle className="h-4 w-4" aria-hidden /> {d === 0 ? "Start with lesson 1" : "Next lesson"}: {next.title.replace(/^Lesson [\d.]+:\s*/, "")}</Link></p>
      )}

      <ol className="mt-6 space-y-2" data-testid="step-lessons">
        {lessons.map((l, i) => {
          const st = state(l.ref!);
          const Icon = st === "done" ? CheckCircle2 : st === "started" ? CircleDot : Circle;
          return (
            <li key={l.ref}>
              <Link href={`/learn/${l.module.slug}#${l.id}`} className={`flex items-start gap-3 rounded-xl border bg-white p-3 hover:ring-2 hover:ring-[#5A50D6]/30 ${l === next ? "border-[#5A50D6]" : "border-slate-200"}`}>
                <span className="w-7 flex-none text-right font-semibold tabular-nums text-slate-500">{i + 1}.</span>
                <Icon className={`mt-0.5 h-5 w-5 flex-none ${st === "done" ? "text-emerald-600" : st === "started" ? "text-[#5A50D6]" : "text-slate-300"}`} aria-label={st === "done" ? "Done" : st === "started" ? "Started" : "Not started"} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-900">{l.title.replace(/^Lesson [\d.]+:\s*/, "")}</span>
                  <span className="text-xs text-slate-500">From: {l.module.title}</span>
                </span>
                <span className={`flex-none rounded-full px-1.5 text-[10px] font-semibold ring-1 ${STAGE_INFO[l.stage].chip}`}>{STAGE_INFO[l.stage].name}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {p.videos.length > 0 && (
        <section aria-labelledby="vid-h" className="mt-8 rounded-2xl border border-slate-200 bg-white p-4" data-testid="step-videos">
          <h2 id="vid-h" className="font-display text-lg text-[#5A50D6]">Helpful video (free, YouTube)</h2>
          <p className="text-sm text-slate-600">Made by other people. Watch if you like seeing it done. Opens YouTube.</p>
          <ul className="mt-2 space-y-2">
            {p.videos.map((v) => (
              <li key={v.url}><a href={v.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-sm hover:underline"><Video className="mt-0.5 h-4 w-4 flex-none text-red-600" aria-hidden /><span><span className="font-semibold text-slate-900">{v.title}</span> <span className="text-slate-500">· {v.channel}</span></span></a></li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 flex justify-between gap-2 text-sm">
        {prev ? <Link href={`/dashboard/learn/path/${prev.id}`} className="btn-ghost">← Step {prev.n}: {prev.title}</Link> : <span />}
        {after && <Link href={`/dashboard/learn/path/${after.id}`} className="btn-ghost">Step {after.n}: {after.title} →</Link>}
      </p>
    </div>
  );
}
