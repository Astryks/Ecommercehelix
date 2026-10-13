import "server-only";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Lock } from "lucide-react";
import { BOTTLENECKS } from "@/lib/diagnosis";
import { topFixes } from "@/lib/site-audit/checks";
import { blockHref, type PlanState } from "@/lib/plan-state";
import { PLAN_RANK, planName, type PlanId } from "@/lib/plans";
import { FindingRow } from "@/components/store-check/StoreCheck";

/** The big "Step N today" button. */
export function StepToday({ s }: { s: PlanState }) {
  const n = s.plan.indexOf(s.current) + 1;
  return (
    <Link href={blockHref(s.current)} className="btn-primary w-full justify-center px-6 py-4 text-base sm:w-auto">
      Step {n} today: {s.current.step1.charAt(0).toLowerCase() + s.current.step1.slice(1)} ({s.current.minutes} min) <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export function Timeline({ s, plan: userPlan }: { s: PlanState; plan: PlanId }) {
  const idx = s.plan.indexOf(s.current);
  return (
    <ol className="mt-4 space-y-3">
      {s.plan.map((b, i) => {
        const done = i < idx;
        const now = i === idx;
        const locked = PLAN_RANK[userPlan] < PLAN_RANK[b.tier];
        return (
          <li key={b.id} className={`flex gap-3 rounded-xl p-3 ${now ? "bg-cyan-50 ring-1 ring-cyan-200" : ""}`}>
            <span className="mt-0.5">{done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden /> : <Circle className={`h-5 w-5 ${now ? "text-cyan-600" : "text-slate-300"}`} aria-hidden />}</span>
            <div className="text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Week {b.weeks[0]}{b.weeks[1] > b.weeks[0] ? ` to ${b.weeks[1]}` : ""}{now ? " · you are here" : ""}</p>
              <p className="font-semibold text-slate-900">{b.title}</p>
              <p className="text-slate-600">{b.what}</p>
              {locked && <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500"><Lock className="h-3 w-3" aria-hidden /> Full steps on {planName(b.tier)}. The lessons are free to read.</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The diagnosis, top store fixes, the 12-week timeline and Step 1. Used at the end of onboarding and on /dashboard/plan. */
export function PersonalPlan({ s, storeUrl, plan }: { s: PlanState; storeUrl: string | null; plan: PlanId }) {
  const d = s.diag.diagnosis;
  const b = BOTTLENECKS[d.bottleneck];
  const fixes = s.run?.ok ? topFixes(s.run.findings, 3) : [];
  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">What&apos;s holding you back</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{b.name}</h1>
        <p className="mt-2 text-slate-700">{d.sentence}</p>
        <p className="mt-3 text-sm text-slate-600"><strong>Your starting goal:</strong> {b.goalLabel}. First, one week on your profit numbers, so every step after that makes money.</p>
        <div className="mt-5"><StepToday s={s} /></div>
      </section>
      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Top fixes on your store</h2>
        {fixes.length > 0 ? (
          <ol className="divide-y divide-slate-100">{fixes.map((f) => <FindingRow key={f.id} f={f} />)}</ol>
        ) : (
          <p className="mt-1 text-sm text-slate-600">{!storeUrl ? "Add your store link in Settings and Helix will check it." : s.run && !s.run.ok ? `We couldn't check ${storeUrl}: ${s.run.error}` : "Your store check will show here."}</p>
        )}
        {s.run?.ok && <Link href="/dashboard/insights" className="mt-2 inline-block text-sm font-semibold text-cyan-700 hover:underline">See the full store check</Link>}
      </section>
      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Your {s.total}-week plan</h2>
        <p className="text-sm text-slate-600">Week {s.week} of {s.total}.{s.total > 12 ? " Stretched to fit 1 to 2 hours a week." : ""} One step at a time. You can redo the questions any time.</p>
        <Timeline s={s} plan={plan} />
        <Link href="/start?step=2&restart=1" className="mt-3 inline-block text-xs text-slate-500 underline">Answer the questions again</Link>
      </section>
    </div>
  );
}
