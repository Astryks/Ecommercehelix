import Link from "next/link";
import { Award, Check, Lock, MapPin, PlayCircle, Sparkles } from "lucide-react";
import type { Timeline } from "@/lib/simple/path-timeline";
import { TextAlert } from "./TextAlert";

const RING: Record<string, string> = { done: "bg-emerald-500 text-white", here: "bg-[#5A50D6] text-white ring-4 ring-[#5A50D6]/25", ahead: "border-2 border-slate-300 bg-white text-slate-500", locked: "bg-slate-100 text-slate-400" };

/** Gamified "Your Path" timeline, shared by Learn and the all-lessons page. */
export function PathTimeline({ t, full, signedIn = true, unlockHref, streak }: { t: Timeline; full: boolean; signedIn?: boolean; unlockHref: string; streak?: number }) {
  const allDone = t.total > 0 && t.done === t.total;
  return (
    <section aria-labelledby="your-path-h" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" data-testid="path-timeline">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="your-path-h" className="font-display text-2xl text-slate-900">Your Path</h2>
        <p className="text-sm font-semibold tabular-nums text-slate-700" data-testid="path-pct">{t.pct}% done · {t.done} of {t.total} lessons</p>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Course progress" aria-valuenow={t.pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-to-r from-[#5A50D6] to-emerald-500 motion-safe:transition-all" style={{ width: `${Math.max(2, t.pct)}%` }} />
      </div>
      <p className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-violet-50 px-2 py-0.5 font-semibold text-violet-800">Level {t.level} · {t.xp} XP</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.xpToNext} XP to level {t.level + 1}</span>
        {streak != null && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800" data-testid="path-streak">{streak}-day streak</span>}
        {t.toNextBadge != null && t.nextBadge && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800" data-testid="badge-nudge">{t.toNextBadge} {t.toNextBadge === 1 ? "lesson" : "lessons"} to your &ldquo;{t.nextBadge}&rdquo; badge</span>}
      </p>

      {allDone ? (
        <div className="celebrate mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-900 motion-safe:animate-[helix-pop_.5s_ease-out]" data-testid="path-complete">
          <p className="flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5" aria-hidden /> You finished the whole path. Amazing work!</p>
          <p className="mt-1 text-sm">Keep updating your numbers each day to see the lessons pay off.</p>
        </div>
      ) : t.next && (
        <p className="mt-4">
          <Link href={t.next.state === "locked" ? unlockHref : t.next.href} className="btn-primary text-base" data-testid="path-next">
            <PlayCircle className="h-5 w-5" aria-hidden /> {t.next.state === "locked" ? (signedIn ? "Next step: unlock with Starter" : "Next step: sign up to unlock") : t.done === 0 ? `Start here: ${t.next.title}` : `Next step: ${t.next.title}`}
          </Link>
        </p>
      )}

      {!full && t.lockedCount > 0 && (
        <p className="mt-3 text-sm text-slate-600" data-testid="path-free-note"><Lock className="mr-1 inline h-3.5 w-3.5" aria-hidden />You can open {t.freeOpen} lessons for free. The {t.lockedCount} with a lock open with Starter{signedIn ? "" : " (sign up first)"}.</p>
      )}

      <ol className="mt-5 space-y-6">
        {t.stages.map((s) => (
          <li key={s.id} data-testid={`path-stage-${s.id}`}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">{s.name}</h3>
              {s.here && <span className="inline-flex items-center gap-1 rounded-full bg-[#5A50D6] px-2 py-0.5 text-xs font-semibold text-white" data-testid="path-you-are-here"><MapPin className="h-3 w-3" aria-hidden /> You are here</span>}
              <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.complete ? "bg-amber-100 text-amber-800 motion-safe:animate-[helix-pop_.5s_ease-out]" : "bg-slate-100 text-slate-500"}`} data-testid={s.complete ? "badge-earned" : "badge-locked"}>
                <Award className="h-3.5 w-3.5" aria-hidden /> {s.badge}{s.complete ? " earned" : ""}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden><div className="h-full bg-emerald-500" style={{ width: `${s.pct}%` }} /></div>
              <span className="text-xs tabular-nums text-slate-600">{s.done}/{s.total}</span>
            </div>
            <ol className="mt-3 flex flex-wrap gap-2" aria-label={`${s.name} lessons`}>
              {s.nodes.map((n) => (
                <li key={n.ref}>
                  <Link href={n.href} title={n.title} aria-label={`Lesson ${n.n}: ${n.title}, ${n.state === "here" ? "you are here" : n.state === "locked" ? "locked, opens with Starter" : n.state === "ahead" ? "not started" : "done"}`} aria-current={n.state === "here" ? "step" : undefined}
                    className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A50D6] ${RING[n.state]}`} data-state={n.state}>
                    {n.state === "done" ? <Check className="h-4 w-4" aria-hidden /> : n.state === "locked" ? <Lock className="h-3.5 w-3.5" aria-hidden /> : n.n}
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
      <TextAlert className="mt-5" seed="path-how" summary="green circles are done, the purple one is your next lesson, and locks open with Starter.">
        <p>Each circle is one lesson. They go in order: Start here, then Attract (bring people to your store), Convert (turn visitors into buyers) and Grow (keep more profit and sell more).</p>
        <p className="mt-2">Every lesson you finish gives you 10 XP. Finishing a whole stage gives you a badge and 200 bonus XP. Tap any circle to open it.</p>
      </TextAlert>
    </section>
  );
}
