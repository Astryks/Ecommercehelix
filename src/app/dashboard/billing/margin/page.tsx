import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { getPricingState } from "@/lib/pricing/store";
import { marginView } from "@/lib/pricing/server";
import { PLAN_ECONOMICS } from "@/lib/pricing/costs";

/**
 * Step 4 — Daily margin dashboard (guarantee 9 of docs/pricing.md §5).
 * Admin view for the account owner: revenue, provider cost and margin by
 * plan, by feature and by org, from the usage events the cost guard writes
 * on every settle. The all-orgs view needs an admin role, which does not
 * exist yet — this page shows this org's numbers and flags the 80% alert.
 * Shared hosting/support are NOT in these rows; the plan P&L in
 * docs/pricing.md §4 carries them. This is the early-warning view.
 */
export default async function MarginDashboard() {
  const u = await requireUser("/dashboard/billing/margin");
  const acct = await getAccount(u.id);
  const state = await getPricingState(u.id);
  const view = marginView(state.usageEvents, {
    free: PLAN_ECONOMICS.free.price,
    starter: PLAN_ECONOMICS.starter.price,
    growth: PLAN_ECONOMICS.growth.price,
  });
  const table = (title: string, rows: { key: string; revenueUsd: number; providerUsd: number; marginUsd: number; marginPct: number }[]) => (
    <section className="card mt-5 p-5">
      <h2 className="font-hand text-xl text-cyan-700">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No AI usage recorded yet. Costs appear here after the first settled AI action.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500"><th className="py-1">Group</th><th>Revenue</th><th>Provider cost</th><th>Margin</th><th>Margin %</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-slate-100">
                <td className="py-1.5 font-medium">{r.key}</td>
                <td>${r.revenueUsd.toFixed(2)}</td>
                <td>${r.providerUsd.toFixed(2)}</td>
                <td>${r.marginUsd.toFixed(2)}</td>
                <td>{r.marginPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="page-title">Margin dashboard</h1>
      <p className="page-lead">What AI costs, by plan, feature and store — from the usage log. You are on <strong>{acct.plan}</strong>.</p>
      {view.alertOrgs.length > 0 && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" data-testid="margin-alert">
          Alert: {view.alertOrgs.length} store{view.alertOrgs.length === 1 ? " has" : "s have"} passed 80% of this month&apos;s AI allowance in the first half of the month.
        </p>
      )}
      {table("By plan", view.byPlan)}
      {table("By feature", view.byFeature)}
      {table("By store", view.byOrg)}
      <p className="mt-6 text-sm text-slate-500">
        <Link className="text-cyan-700 underline" href="/dashboard/billing">Back to Plan &amp; billing</Link>
        {" · "}Revenue here is the plan price for the month; wallet top-ups and PAYG sales are not broken out yet. Hosting and support sit in the plan P&amp;L (docs/pricing.md §4), not in these rows.
      </p>
    </div>
  );
}
