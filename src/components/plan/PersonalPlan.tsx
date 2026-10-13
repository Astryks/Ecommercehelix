import "server-only";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOTTLENECKS } from "@/lib/diagnosis";
import { topFixes } from "@/lib/site-audit/checks";
import type { AuditRunRow } from "@/lib/site-audit/run";
import type { DiagnosisRow } from "@/lib/repo";
import { FindingRow } from "@/components/store-check/StoreCheck";

/** The diagnosis, top store fixes and the plan. Used at the end of onboarding and on /dashboard/plan. */
export function PersonalPlan({ diag, run, storeUrl }: { diag: DiagnosisRow; run: AuditRunRow | null; storeUrl: string | null; userId: string }) {
  const d = diag.diagnosis;
  const b = BOTTLENECKS[d.bottleneck];
  const fixes = run?.ok ? topFixes(run.findings, 3) : [];
  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">What&apos;s holding you back</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{b.name}</h1>
        <p className="mt-2 text-slate-700">{d.sentence}</p>
        <p className="mt-3 text-sm text-slate-600"><strong>Your starting goal:</strong> {b.goalLabel}. First, one week on your profit numbers, so every step after that makes money.</p>
      </section>
      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Top fixes on your store</h2>
        {fixes.length > 0 ? (
          <ol className="divide-y divide-slate-100">{fixes.map((f) => <FindingRow key={f.id} f={f} />)}</ol>
        ) : (
          <p className="mt-1 text-sm text-slate-600">{!storeUrl ? "Add your store link in Settings and Helix will check it." : run && !run.ok ? `We couldn't check ${storeUrl}: ${run.error}` : "Your store check will show here."}</p>
        )}
      </section>
      <Link href="/dashboard" className="btn-primary px-6 py-3 text-base">Go to Today <ArrowRight className="h-4 w-4" aria-hidden /></Link>
    </div>
  );
}
