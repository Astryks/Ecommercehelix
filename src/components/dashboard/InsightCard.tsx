import Link from "next/link";
import { BookOpen, Check, Lock, Sparkles, Wand2 } from "lucide-react";
import type { Insight } from "@/lib/audit";
import { PLAN_RANK, planName, type PlanId } from "@/lib/plans";
import { doItForMe, markDone } from "@/app/dashboard/actions";

const SEV: Record<Insight["severity"], string> = {
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  medium: "bg-amber-50 text-amber-800 ring-amber-200",
  low: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function InsightCard({ ins, plan, pending, compact = false }: { ins: Insight; plan: PlanId; pending: boolean; compact?: boolean }) {
  const canDo = ins.doIt ? PLAN_RANK[plan] >= PLAN_RANK[ins.doIt.tier] : false;
  const id = `insight-${ins.id}`;
  return (
    <article className="card p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-0.5 font-semibold text-white"><Sparkles className="h-3 w-3" aria-hidden /> Helix noticed</span>
        <span className={`rounded-full px-2.5 py-0.5 font-medium capitalize ring-1 ${SEV[ins.severity]}`}>{ins.severity} impact</span>
        <span className="rounded-full bg-slate-50 px-2.5 py-0.5 font-medium capitalize text-slate-600 ring-1 ring-slate-200">{ins.area}</span>
        {ins.example ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Example</span> : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">Live data</span>}
        <span className="text-slate-400">Sources: {ins.source.join(", ")}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">{ins.title}</h3>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {ins.evidence.slice(0, compact ? 2 : 6).map((e) => (
          <div key={e.label} className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{e.label}</dt>
            <dd className="text-sm font-semibold text-slate-900">{e.value}{e.benchmark && <span className="ml-1.5 text-xs font-normal text-slate-500">({e.benchmark})</span>}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-800">Why it matters: </span>{ins.why}</p>
      {!compact && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-slate-800">Suggested fix</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">{ins.fix.map((f) => <li key={f}>{f}</li>)}</ol>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        {ins.doIt && (pending ? (
          <Link href="/dashboard/approvals" className="btn-ghost"><Sparkles className="h-4 w-4 text-violet-600" aria-hidden /> Waiting for your approval</Link>
        ) : (
          <form action={doItForMe}>
            <input type="hidden" name="taskId" value={id} />
            <button className="btn-dark">{canDo ? <Wand2 className="h-4 w-4" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}{canDo ? `Do it for me: ${ins.doIt.label}` : `Do it for me · ${planName(ins.doIt.tier)}`}</button>
          </form>
        ))}
        <Link href={`/learn/${ins.learn.slug}${ins.learn.anchor ? "#" + ins.learn.anchor : ""}`} className="btn-ghost"><BookOpen className="h-4 w-4 text-cyan-700" aria-hidden /> Show me how</Link>
        <form action={markDone} className="ml-auto">
          <input type="hidden" name="taskId" value={id} />
          <button className="text-sm font-medium text-slate-500 hover:text-slate-900"><Check className="mr-1 inline h-4 w-4" aria-hidden />Resolved</button>
        </form>
      </div>
    </article>
  );
}
