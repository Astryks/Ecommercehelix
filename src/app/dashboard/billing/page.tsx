import { PlanDetails } from "@/components/plans/PlanDetails";
import { requireUser } from "@/lib/session";
import { getAccount, getBilling } from "@/lib/repo";
import { CANCEL_LINE, CURRENCY_LABEL, billingView, prettyDate } from "@/lib/billing";
import { cancelAtPeriodEnd, resumeSubscription } from "./actions";
import { PLANS, planName } from "@/lib/plans";
import { communityAccess } from "@/lib/fb-group/state";
import { groupUrl } from "@/lib/fb-group/links";
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
  const community = communityAccess({ plan: acct.plan, status: billing.status }, groupUrl());
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="page-title">Plan &amp; billing</h1>
      <p className="page-lead">You are on <strong>{planName(acct.plan)}</strong>.</p>
      {community.kind === "member" && (
        <p className="mt-lead rounded-xl bg-[#5A50D6]/10 p-4 text-sm text-slate-800" data-testid="group-link">
          <strong>Members group:</strong> join our private Facebook group for members. <a href={community.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-700 underline">Join the group</a>
        </p>
      )}
      {(() => {
        const view = billingView({ plan: acct.plan, status: billing.status, cancelAtPeriodEnd: billing.cancelAtPeriodEnd, subscriptionId: billing.subscriptionId });
        const until = prettyDate(billing.currentPeriodEnd);
        return (
          <section className="card mt-5 p-5" data-testid="billing-status">
            <h2 className="font-hand text-xl text-cyan-700">Your subscription</h2>
            {sp.cancelled && <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Done. Your plan is cancelled. You keep everything until {until}. Thank you for being a member.</p>}
            {sp.resumed && <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Welcome back. Your plan carries on as normal.</p>}
            {sp.changed && <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Plan changed. Any difference is worked out to the day (prorated).</p>}
            {sp.already && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">You are already on that plan.</p>}
            {view === "free" && <p className="mt-1 text-sm text-slate-700">You are on Free. Upgrade in one click below. {CANCEL_LINE}</p>}
            {view === "active" && (
              <>
                <p className="mt-1 text-sm text-slate-700">{planName(acct.plan)} is active. It renews on {until}. {CANCEL_LINE}</p>
                {sp.cancel ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4" data-testid="cancel-confirm">
                    <p className="font-semibold text-slate-900">Cancel your plan?</p>
                    <p className="mt-1 text-sm text-slate-700">You keep all paid features until {until}. After that you move to Free. Your numbers and lessons stay. You can come back any time.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={cancelAtPeriodEnd}><button className="btn-dark text-sm">Yes, cancel at the end of my period</button></form>
                      <a href="/dashboard/billing" className="btn-ghost text-sm">Keep my plan</a>
                    </div>
                  </div>
                ) : (
                  <a href="/dashboard/billing?cancel=1" className="btn-ghost mt-3 text-sm" data-testid="cancel-anytime">Cancel anytime</a>
                )}
              </>
            )}
            {view === "canceling" && (
              <>
                <p className="mt-1 text-sm text-slate-700">Your plan is cancelled. You keep {planName(acct.plan)} until <strong>{until}</strong>, then move to Free.</p>
                <form action={resumeSubscription} className="mt-3"><button className="btn-primary text-sm">Resume my plan (one click)</button></form>
              </>
            )}
            {view === "past_due" && (
              <>
                <p className="mt-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">Your last payment did not go through. You keep your plan while Stripe tries again over the next few days. Update your card to keep it.</p>
                <form action="/api/billing/portal" method="post" className="mt-3"><input type="hidden" name="update" value="1" /><button className="btn-primary text-sm">Update my card</button></form>
              </>
            )}
            {view === "ended" && <p className="mt-1 text-sm text-slate-700">Your paid plan has ended. Thank you for being a member. Resubscribe any time in one click below.</p>}
            {sp.noportal && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">There is no paid subscription to manage yet.</p>}
            {stripe && billing.customerId && (
              <form action="/api/billing/portal" method="post" className="mt-3">
                <button className="text-sm text-cyan-700 underline">Card and invoices</button>
              </form>
            )}
          </section>
        );
      })()}
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
              <p className="mt-1 text-3xl font-bold">{`${CURRENCY_LABEL}${p.price}`}<span className="text-sm font-medium text-slate-500">/mo</span></p>
              <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
              <PlanDetails p={p} />
              <button disabled={current} className={`mt-6 ${current ? "btn-ghost" : "btn-primary"}`}>{current ? "Current plan" : p.price === 0 ? "Switch to Free" : billing.subscriptionId && billing.status !== "canceled" ? `Switch to ${p.name}` : `Upgrade to ${p.name}`}</button>
            </form>
          );
        })}
      </div>
      <p className="mt-8 text-xs text-slate-500">All prices in US dollars (USD). Moving to Free keeps your Meta connection and prep plans. Checkout: {stripe ? "Stripe" : "not configured (demo)"}. Paid plans renew automatically every month and your card is charged until you cancel. Cancel anytime, in one click, right here; you keep paid features to the end of the month you paid for. See our <a className="underline" href="/terms">Terms</a> and <a className="underline" href="/privacy">Privacy policy</a>.</p>
    </div>
  );
}
