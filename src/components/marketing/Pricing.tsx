import { PlanDetails } from "@/components/plans/PlanDetails";
import { PLANS } from "@/lib/plans";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-10 border-t border-slate-200 bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Pricing</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Less than one day of agency fees. Every month.</h2>
        <p className="mt-3 max-w-2xl text-slate-600">Start free with a real profit dashboard and the first course goals. Upgrade when you want a full growth plan and Meta set up for you as paused drafts.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-xl border p-7 ${p.highlight ? "border-slate-900 bg-ink text-white" : "border-slate-200 bg-white"}`}
            >
              {p.highlight && <span className="absolute -top-3 left-7 rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950">Most popular</span>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlight ? "text-slate-300" : "text-slate-600"}`}>{p.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold tracking-tight">{p.price === 0 ? "$0" : `A$${p.price}`}</span>
                <span className={p.highlight ? "text-slate-400" : "text-slate-500"}>/month</span>
              </p>
              <PlanDetails p={p} dark={!!p.highlight} />
              <Link href="/dashboard/billing" className={`mt-8 ${p.highlight ? "btn-primary" : "btn-ghost"}`}>
                {p.price === 0 ? "Start free" : `Choose ${p.name}`}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 rounded-xl bg-slate-50 px-5 py-4 text-sm text-slate-700"><strong>Plain and honest.</strong> Helix is self-serve software. It guides you step by step, and the only things it builds in your accounts are Meta campaigns as paused drafts. Nothing goes live until you press Launch.</p>
      </div>
    </section>
  );
}
