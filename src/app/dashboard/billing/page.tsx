import Link from "next/link";
import { PlanDetails } from "@/components/plans/PlanDetails";
import { requireUser } from "@/lib/session";
import { getAccount, getBilling } from "@/lib/repo";
import { CANCEL_LINE, CURRENCY_LABEL, billingView, prettyDate } from "@/lib/billing";
import { cancelAtPeriodEnd, resumeSubscription, buyPaygAction, setAutoTopUpAction, topUpWalletAction } from "./actions";
import { getPricingView } from "@/lib/pricing/server";
import { UNIFIED_ALLOWANCE } from "@/lib/pricing/allowance";
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
  const pricing = await getPricingView(u.id, acct.plan);
  const allowance = UNIFIED_ALLOWANCE[acct.plan];
  const pctUsed = Math.min(100, Math.round((pricing.creditsSpentThisMonth / Math.max(1, pricing.monthlyCap)) * 100));
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
      {sp.uncovered === "1" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">That approval could not be prepared: your credits are used up and the wallet could not cover it. Top up below, buy a PAYG pack, or wait for Monday&apos;s fresh weekly credits.</p>}
      {sp.topup === "demo" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Demo credit added — no real charge. Stripe is not connected in demo mode.</p>}
      {sp.topup === "1" && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Payment received. Your wallet is topped up.</p>}
      {sp.payg === "demo" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Demo PAYG pack added — no real charge. Stripe is not connected in demo mode.</p>}
      {sp.payg === "1" && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">PAYG pack added: 500 credits, expiring in 7 days.</p>}
      {sp.payg === "nofunds" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">The wallet does not have $10 for a PAYG pack. Top up first, or pay by card.</p>}
      {sp.payg === "nostripe" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Card payments are not set up yet (Stripe is not connected). Top up the wallet instead.</p>}
      {sp.autotopup === "1" && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Auto top-up preference saved.</p>}
      {/* Step 4: one unified allowance for coach messages + AI write-ups, a prepaid wallet, and weekly-expiring credits. */}
      <section className="card mt-5 p-5" data-testid="ai-allowance">
        <h2 className="font-hand text-xl text-cyan-700">AI usage included</h2>
        <p className="mt-1 text-sm text-slate-700">{pricing.unificationNote}</p>
        <div className="mt-4">
          <div className="flex justify-between text-sm"><span>Used this month</span><span><strong>{pricing.creditsSpentThisMonth}</strong> of {pricing.monthlyCap} credits</span></div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pctUsed} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full ${pctUsed >= 90 ? "bg-rose-500" : pctUsed >= 80 ? "bg-amber-500" : "bg-cyan-500"}`} style={{ width: `${pctUsed}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {acct.plan === "free"
              ? "Free: 60 credits a month, then AI pauses until the 1st. The scorecard, guides and rules-based checks keep working."
              : `${pricing.weeklyGrant} credits every Monday, expiring Sunday night${allowance.graceWeeks ? ", with one extra week of grace on anything left over" : ""}. ${pricing.creditsLeftThisWeek} credits left this week.`}
          </p>
        </div>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">AI write-ups left</dt><dd className="font-medium">{pricing.countsLeft.writeUps} of {allowance.writeUpCap} this month</dd></div>
          <div className="rounded-xl bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">Coach messages left</dt><dd className="font-medium">{pricing.countsLeft.coachTotal} of {allowance.coachTotalCap} this month ({pricing.countsLeft.coachDeep} deep left)</dd></div>
          <div className="rounded-xl bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">Wallet balance</dt><dd className="font-medium">${pricing.walletBalanceUsd.toFixed(2)}</dd></div>
        </dl>
        {pricing.marginAlert && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" data-testid="margin-alert">Heads up: you have used over 80% of this month&apos;s AI allowance and it is still the first half of the month. Extra AI will come from your wallet at 2x provider cost.</p>
        )}
        {pricing.buckets.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Your credit buckets</h3>
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              {pricing.buckets.map((b) => (
                <li key={b.id}>{b.kind === "weekly" ? "Weekly grant" : b.kind === "payg" ? "PAYG pack" : "Add-on"}: {b.remaining} of {b.credits} credits left, expires {new Date(b.expiresAt).toLocaleDateString("en-AU")}{b.grace ? " (grace week)" : ""}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Top up the wallet</h3>
            <p className="mt-1 text-xs text-slate-500">Prepaid only. Extra AI is billed at 2x provider cost. When the wallet hits $0, AI extras stop — the scorecard, guides and approvals already made keep working.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 25, 50].map((amount) => (
                <form key={amount} action={topUpWalletAction}>
                  <input type="hidden" name="amount" value={amount} />
                  <button className="btn-primary text-sm">Top up ${amount}</button>
                </form>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700">PAYG credits — $10 for 500 credits</h3>
            <p className="mt-1 text-xs text-slate-500">Expiring 7 days after purchase. Unspent credits lapse. Same 500 credits as a $10 wallet top-up — the difference is expiry: PAYG is for a busy week, the wallet never expires.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={buyPaygAction}>
                <input type="hidden" name="payFrom" value="wallet" />
                <button className="btn-primary text-sm">Buy from wallet ($10)</button>
              </form>
              <form action={buyPaygAction}>
                <input type="hidden" name="payFrom" value="card" />
                <button className="btn-ghost text-sm">Pay by card ($10)</button>
              </form>
            </div>
          </div>
        </div>
        <form action={setAutoTopUpAction} className="mt-4 rounded-xl border border-slate-200 p-4 text-sm">
          <h3 className="font-semibold text-slate-700">Auto top-up (optional, off by default)</h3>
          <p className="mt-1 text-xs text-slate-500">Only with your say-so, and never above the monthly ceiling you set. No auto top-up runs unless you turn it on here.</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2"><input type="checkbox" name="enabled" value="1" defaultChecked={pricing.autoTopUp?.enabled ?? false} /> Turn on auto top-up</label>
            <label>Amount <select name="amount" defaultValue={pricing.autoTopUp?.amount ?? 10} className="rounded-lg border border-slate-300 px-2 py-1"><option value={10}>$10</option><option value={25}>$25</option><option value={50}>$50</option></select></label>
            <label>Monthly ceiling $ <input name="ceiling" type="number" min={10} defaultValue={pricing.autoTopUp?.ceilingUsd ?? 50} className="w-20 rounded-lg border border-slate-300 px-2 py-1" /></label>
            <button className="btn-ghost text-sm">Save</button>
          </div>
        </form>
        {pricing.usageHistory.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-700">Recent AI use</h3>
            <ul className="mt-1 divide-y divide-slate-100 text-sm">
              {pricing.usageHistory.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 py-1.5"><span>{e.feature} — {e.action}</span><span className="text-slate-500">{e.credits} credits · {e.billedUsd > 0 ? `$${e.billedUsd.toFixed(2)} from wallet` : "from allowance"} · {new Date(e.at).toLocaleDateString("en-AU")}</span></li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <p className="mt-3 text-sm"><Link className="text-cyan-700 underline" href="/dashboard/billing/margin">Margin dashboard</Link> — what AI costs, by plan, feature and store.</p>
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
