import "server-only";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Lock } from "lucide-react";
import { BOTTLENECKS } from "@/lib/diagnosis";
import { topFixes } from "@/lib/site-audit/checks";
import { blockHref, type PlanState } from "@/lib/plan-state";
import { PLAN_RANK, planName, type PlanId } from "@/lib/plans";
import { FindingRow } from "@/components/store-check/StoreCheck";
import { UpgradePrompt } from "@/components/UpgradePrompt";

/** The big "do this today" button. No step number: earlier steps may already be done. */
export function StepToday({ s }: { s: PlanState }) {
  return (
    <Link href={blockHref(s.current)} className="btn-primary w-full justify-center px-6 py-4 text-base sm:w-auto">
      Today: {s.current.step1.charAt(0).toLowerCase() + s.current.step1.slice(1)} ({s.current.minutes} min) <ArrowRight className="h-4 w-4" aria-hidden />
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
            <span className="mt-0.5 shrink-0">{done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden /> : <Circle className={`h-5 w-5 ${now ? "text-cyan-600" : "text-slate-300"}`} aria-hidden />}</span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Week {b.weeks[0]}{b.weeks[1] > b.weeks[0] ? ` to ${b.weeks[1]}` : ""}{now ? " · you are here" : ""}</p>
              <p className="font-semibold text-slate-900">{b.title}</p>
              <p className="text-slate-600">{b.what}</p>
              {locked && <p className="mt-1 flex items-start gap-1 text-xs text-slate-500"><Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden /> <span className="min-w-0">Full steps on {planName(b.tier)}. The lessons are free to read.</span></p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The week you are on: the calendar week, or later if you finished steps early. Matches "you are here". */
export const shownWeek = (s: PlanState) => Math.min(s.total, Math.max(s.week, s.current.weeks[0]));

/** At most one upgrade prompt, at the moment it helps. */
function PlanPrompt({ s, plan }: { s: PlanState; plan: PlanId }) {
  if (s.diag.diagnosis.bottleneck === "leaky-bucket" && PLAN_RANK[plan] < PLAN_RANK.growth)
    return <div className="mt-4"><UpgradePrompt compact need="growth" forKey="flows" title="Your biggest leak is repeat customers" body="Growth has all 9 email flows written and ready to paste into your email tool (for example Shopify Email)." /></div>;
  if (PLAN_RANK[plan] < PLAN_RANK.starter && s.plan.some((b) => b.tier !== "free"))
    return <div className="mt-4"><UpgradePrompt compact need="starter" forKey="plan" title={`Weeks ${s.plan[3].weeks[0]} to ${s.total} of your plan are on Starter`} body="Weeks 1 to 4 are free: profit, your numbers and your top store fixes. Starter adds the step-by-step sprints, a monthly store re-check and Meta drafts." /></div>;
  return null;
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
        <p className="text-sm text-slate-600">Week {shownWeek(s)} of {s.total}.{s.total > 12 ? " Stretched to fit 1 to 2 hours a week." : ""} One step at a time. You can redo the questions any time.</p>
        <Timeline s={s} plan={plan} />
        <PlanPrompt s={s} plan={plan} />
        <Link href="/start?step=2&restart=1" className="mt-3 inline-block text-xs text-slate-500 underline">Answer the questions again</Link>
      </section>
    </div>
  );
}
