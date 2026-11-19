import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listApprovals } from "@/lib/repo";
import { decide, editApproval } from "../actions";
import { getAccount } from "@/lib/repo";
import { ensureWeeklyGrant, getPricingState, quoteApprovalCost } from "@/lib/pricing/store";

/** An approval is a paused draft (or a checklist) — never a live spend change. */
const isDraft = (taskId: string) => taskId === "build-meta-campaign" || taskId === "build-google-campaign";

export default async function Approvals({ searchParams }: { searchParams: Promise<{ unpaid?: string }> }) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/approvals");
  const rows = await listApprovals(u.id);
  const pending = rows.filter((r) => r.status === "pending");
  const history = rows.filter((r) => r.status !== "pending");
  // Step 4: quote each card's AI cost against the unified pool, so the owner
  // sees the credits and which bucket pays — not just a dollar figure.
  const acct = await getAccount(u.id);
  const pricing = ensureWeeklyGrant(await getPricingState(u.id), acct.plan);
  const quoteFor = (estAiCost: number) => quoteApprovalCost(pricing, acct.plan, estAiCost);
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="page-title">Waiting for your OK</h1>
      <p className="page-lead">What Helix has prepared for you. Nothing here changes a live budget or spends a dollar until you approve it — and ad campaigns are created paused, in your own account. You launch them yourself.</p>
      {sp.unpaid === "1" && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" data-testid="unpaid-banner">
          That approval could not run: its AI cost is not covered by your credits or wallet. Top up the wallet or wait for Monday&apos;s fresh weekly credits, then try again. The approval is still waiting — nothing was changed.
        </p>
      )}
      <section className="mt-8 space-y-4">
        {pending.length === 0 && (
          <div className="card p-8 text-center text-slate-600">
            Nothing waiting. Tap <strong>Do it for me</strong> on a task in <Link className="text-cyan-700 underline" href="/dashboard">Today</Link> and Helix will prepare it here.
          </div>
        )}
        {pending.map((a) => (
          <article key={a.id} className="card p-6" data-testid="approval-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{a.title}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${isDraft(a.taskId) ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-700"}`}>
                {isDraft(a.taskId) ? "Paused draft" : "Checklist"}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-700">What changes</h3>
            <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{a.detail}</pre>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">Why — with the numbers</dt><dd className="font-medium">See the detail above: it is built from your own sales, ad spend and break-even numbers. Ask the coach if a number looks wrong.</dd></div>
              <div className="rounded-xl bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">Expected money effect</dt><dd className="font-medium">Live ad spend change: $0. {isDraft(a.taskId) ? "The draft stays paused until you launch it in Ads Manager, so no money moves on approval." : "Approving marks the checklist done; nothing is bought or changed in any account."}</dd></div>
              <div className="rounded-xl bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">AI cost</dt><dd className="font-medium">{(() => { const q = quoteFor(a.estAiCost); return q.credits === 0 ? "No AI cost — prepared from your numbers by rules." : `About ${q.credits} credits ($${a.estAiCost.toFixed(2)} of AI), paid from ${q.paysFrom}. ${q.covered ? "" : `Not covered — topping up $${q.walletCostUsd.toFixed(2)} would cover it.`} See Billing.`; })()}</dd></div>
            </dl>
            <details className="mt-4 rounded-xl border border-slate-200 p-3 text-sm">
              <summary className="cursor-pointer font-semibold text-slate-700">Edit the plan before approving</summary>
              <form action={editApproval} className="mt-3">
                <input type="hidden" name="id" value={a.id} />
                <label className="text-slate-600">What Helix should do<textarea name="detail" defaultValue={a.detail} rows={6} maxLength={4000} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
                <button className="btn-ghost mt-2 text-sm">Save edit</button>
              </form>
            </details>
            <form action={decide} className="mt-4 flex flex-wrap gap-3">
              <input type="hidden" name="id" value={a.id} />
              <button name="decision" value="approve" className="btn-primary">Approve</button>
              <button name="decision" value="reject" className="btn-ghost">Skip</button>
            </form>
          </article>
        ))}
      </section>
      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">History</h2>
          <ul className="card mt-3 divide-y divide-slate-100">
            {history.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{a.title}</span>
                <span className={a.status === "approved" ? "text-emerald-700" : "text-slate-500"}>{a.status === "rejected" ? "skipped" : a.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
