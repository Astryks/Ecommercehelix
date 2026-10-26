import Link from "next/link";
import { Clock, Lock, Sparkles } from "lucide-react";
import type { Teaser } from "@/lib/paywall/teaser-core";
import { UNLOCK_LABEL } from "@/lib/paywall/access";

/** A locked lesson: what it covers and how to unlock it. The lesson body is never sent. */
export function LockedLesson({ t, id, unlockHref }: { t: Teaser; id?: string; unlockHref: string }) {
  return (
    <section id={id} className="my-8 scroll-mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6" data-testid="locked-lesson" data-ref={t.ref}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Lock className="h-4 w-4" aria-hidden /> Starter lesson · Lesson {t.ref}</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t.title}</h2>
      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><Clock className="h-4 w-4" aria-hidden /> About {t.minutes} min</p>
      <h3 className="mt-4 text-sm font-semibold text-slate-700">What you&apos;ll learn</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">{t.summary.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <p className="mt-5 flex flex-wrap items-center gap-3">
        <Link href={unlockHref} className="btn-primary text-sm" data-testid="unlock-cta"><Sparkles className="h-4 w-4" aria-hidden /> {UNLOCK_LABEL}</Link>
        <span className="text-sm text-slate-600">Starter opens every lesson straight away. Cancel anytime.</span>
      </p>
    </section>
  );
}
