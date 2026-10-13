import { PlanDetails } from "@/components/plans/PlanDetails";
import { requireUser } from "@/lib/session";
import { getAccount, getBilling } from "@/lib/repo";
import { CURRENCY_LABEL } from "@/lib/billing";
import { PLANS, planName } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

const NEED_FOR: Record<string, string> = {
  season: "A tracked seasonal prep plan with due dates on Today",
  meta: "Connecting Meta for daily ad sync and paused drafts",
  course: "That part of your course",
  history: "Month, year and 12-month views",
  dfm: "\u201cDo it for me\u201d for that task",
  recheck: "A monthly re-check of your store",
  plan: "The rest of your 12-week plan",
  flows: "All 9 email flows, ready to paste",
  "meta-draft": "Helix building this as a paused draft in your Meta account",
};

export default async function Billing({ searchParams }: PageProps<"/dashboard/billing">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/billing");
  const acct = await getAccount(u.id);
  const billing = await getBilling(u.id);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Plan &amp; billing</h1>
      <p className="mt-1 text-slate-600">You are on <strong>{planName(acct.plan)}</strong>.</p>
      {billing.status === "past_due" && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">Your last payment did not go through. Stripe will try again over the next few days. Update your card in Manage billing to keep your plan.</p>}
      {sp.noportal && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">There is no paid subscription to manage yet.</p>}
      {stripe && billing.customerId && (
        <form action="/api/billing/portal" method="post" className="mt-4">
          <button className="btn-ghost">Manage billing (card, invoices, change or cancel)</button>
        </form>
      )}
      {sp.dev === "1" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Demo mode: Stripe keys are not set, so your plan changed instantly with no payment.</p>}
      {sp.success && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Payment received. Your plan updates as soon as Stripe confirms (usually seconds).</p>}
      {sp.need && <p className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-900">{NEED_FOR[String(sp.for ?? "")] ?? "\u201cDo it for me\u201d for that task"} needs the {planName(String(sp.need) === "growth" ? "growth" : "starter")} plan. Your profit dashboard, daily numbers and every lesson stay free.</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => {
          const current = p.id === acct.plan;
          return (
            <form key={p.id} action="/api/checkout" method="post" className={`card flex flex-col p-6 ${current ? "ring-2 ring-cyan-500" : ""}`}>
              <input type="hidden" name="plan" value={p.id} />
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="mt-1 text-3xl font-bold">{p.price === 0 ? "$0" : `${CURRENCY_LABEL}${p.price}`}<span className="text-sm font-medium text-slate-500">/mo</span></p>
              <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
              <PlanDetails p={p} />
              <button disabled={current} className={`mt-6 ${current ? "btn-ghost" : "btn-primary"}`}>{current ? "Current plan" : p.price === 0 ? "Switch to Free" : `Upgrade to ${p.name}`}</button>
            </form>
          );
        })}
      </div>
      <p className="mt-8 text-xs text-slate-500">Plan prices are in Australian dollars (AUD). Moving to Free keeps your Meta connection and prep plans. Checkout: {stripe ? "Stripe" : "not configured (demo)"}.</p>
    </div>
  );
}
