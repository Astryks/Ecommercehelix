import { PlanDetails } from "@/components/plans/PlanDetails";
import { PLANS } from "@/lib/plans";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-10 border-t border-slate-200 bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Pricing</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Less than one day of agency fees. Every month.</h2>
        <p className="mt-3 max-w-2xl text-slate-600">Start free with a real profit dashboard and the first course goals. Upgrade when you want a full growth plan, your ad accounts connected and campaigns set up for you as paused drafts.</p>
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
                <span className="font-display text-5xl font-semibold tracking-tight">{p.price === 0 ? "$0" : `US$${p.price}`}</span>
                <span className={p.highlight ? "text-slate-400" : "text-slate-500"}>/month</span>
              </p>
              <PlanDetails p={p} dark={!!p.highlight} />
              <Link href="/dashboard/billing" className={`mt-8 ${p.highlight ? "btn-primary" : "btn-ghost"}`}>
                {p.price === 0 ? "Start free" : `Choose ${p.name}`}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">Prices in US dollars (USD). Paid plans are monthly subscriptions that renew automatically until you cancel. Cancel any time in Plan &amp; billing; you keep paid features to the end of the month you paid for. See our <Link href="/terms" className="underline">Terms</Link>.</p>
        <p className="mt-6 rounded-xl bg-slate-50 px-5 py-4 text-sm text-slate-700"><strong>Plain and honest.</strong> Helix is self-serve software. It guides you step by step, and the only things it builds in your accounts are ad campaigns as paused drafts (Meta today, Google Ads coming soon), and only after you press Approve in Helix. Nothing spends until you turn it on in the ad platform.</p>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
          <p className="rounded-xl border border-slate-200 px-4 py-3"><strong className="text-slate-900">Official sign-in.</strong> You connect Meta, Shopify or Google on their own screens. Helix never sees your passwords.</p>
          <p className="rounded-xl border border-slate-200 px-4 py-3"><strong className="text-slate-900">Encrypted tokens.</strong> Access tokens are encrypted before they are stored. Shopify access is read-only.</p>
          <p className="rounded-xl border border-slate-200 px-4 py-3"><strong className="text-slate-900">Disconnect any time.</strong> One click removes Helix&apos;s access and deletes the token and synced data.</p>
          <p className="rounded-xl border border-slate-200 px-4 py-3"><strong className="text-slate-900">AI with limits.</strong> Optional AI write-ups have a monthly allowance per plan. When it runs out you still get Helix&apos;s standard advice.</p>
        </div>
      </div>
    </section>
  );
}
