import { Check } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { PLANS, planName } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

export default async function Billing({ searchParams }: PageProps<"/dashboard/billing">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/billing");
  const acct = await getAccount(u.id);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Plan &amp; billing</h1>
      <p className="mt-1 text-slate-600">You are on <strong>{planName(acct.plan)}</strong>.</p>
      {sp.dev === "1" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Demo mode: Stripe keys are not set, so your plan changed instantly with no payment.</p>}
      {sp.success && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Payment received. Your plan updates as soon as Stripe confirms (usually seconds).</p>}
      {sp.need && <p className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-900">&quot;Do it for me&quot; for that task needs the {planName(String(sp.need) as "starter")} plan. Guides stay free.</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => {
          const current = p.id === acct.plan;
          return (
            <form key={p.id} action="/api/checkout" method="post" className={`card flex flex-col p-6 ${current ? "ring-2 ring-cyan-500" : ""}`}>
              <input type="hidden" name="plan" value={p.id} />
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="mt-1 text-3xl font-bold">${p.price}<span className="text-sm font-medium text-slate-500">/mo</span></p>
              <p className="mt-1 text-xs text-cyan-700">{p.aiAllowance}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-emerald-600" aria-hidden />{f}</li>)}
              </ul>
              <button disabled={current} className={`mt-6 ${current ? "btn-ghost" : "btn-primary"}`}>{current ? "Current plan" : p.price === 0 ? "Switch to Free" : `Upgrade to ${p.name}`}</button>
            </form>
          );
        })}
      </div>
      <section className="card mt-8 p-6">
        <h2 className="font-semibold">AI balance</h2>
        <p className="mt-1 text-3xl font-bold">${(acct.walletCents / 100).toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-600">AI usage from a prepaid balance, stops at $0. Your plan allowance is used first, then this balance. No overage billing.</p>
        <button disabled className="btn-ghost mt-4">Top up (coming soon)</button>
        <p className="mt-2 text-xs text-slate-500">Checkout: {stripe ? "Stripe test mode" : "not configured (demo)"}.</p>
      </section>
    </div>
  );
}
