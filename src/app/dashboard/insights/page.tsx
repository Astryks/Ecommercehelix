import { CalendarClock } from "lucide-react";
import { AiBox } from "@/components/AiBox";
import { aiAuditWriteup } from "../ai-actions";
import { StoreCheck } from "@/components/store-check/StoreCheck";
import { auditRuns } from "@/lib/site-audit/run";
import { isDemoUserId } from "@/lib/demo-auth";
import { requireUser } from "@/lib/session";
import { PLAN_RANK } from "@/lib/plans";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { getAccount, getCompletions, listApprovals } from "@/lib/repo";
import { SITE_CHECKLIST_EXAMPLE, SOCIAL_CHECKLIST_EXAMPLE } from "@/lib/audit";
import { insightsFor } from "@/lib/signals";
import Link from "next/link";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Flag } from "@/components/dashboard/Flag";
import { klaviyoFixes, klaviyoOn } from "@/lib/klaviyo/config";
import { klaviyoSummary } from "@/lib/klaviyo/service";

const SCHEDULE = [
  ["Store check", "Once on Free, monthly on Starter and Growth"],
  ["Meta ad results", "Daily, when Meta is connected"],
  ["Shopify, Google Ads, email, social", "Not connected yet"],
];

export default async function Insights() {
  const u = await requireUser("/dashboard/insights");
  const [acct, completions, approvals, live, runs] = await Promise.all([getAccount(u.id), getCompletions(u.id), listApprovals(u.id), insightsFor(u.id), auditRuns(u.id, 2)]);
  const demo = isDemoUserId(u.id);
  const done = new Set(completions.map((c) => c.taskId));
  const pending = new Set(approvals.filter((a) => a.status === "pending").map((a) => a.taskId));
  const all = live.insights;
  const paid = PLAN_RANK[acct.plan] >= PLAN_RANK.starter;
  const open = all.filter((i) => !done.has(`insight-${i.id}`));
  const resolved = all.length - open.length;
  const kSum = klaviyoOn() && !demo ? await klaviyoSummary(u.id).catch(() => null) : null;
  const kFixes = kSum ? klaviyoFixes(kSum) : [];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">What to fix</h1>
            {live.metaLive ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Meta: live data</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Example data</span>
            )}
          </div>
          <p className="mt-1 max-w-3xl text-slate-600">Helix checks your store and your ads and tells you, in plain words, what is holding sales back: the ad, the page, the offer or the checkout. Fix the top one first. {open.length} open, {resolved} resolved. {live.signals.period}.{!live.metaLive && <> <Link className="text-cyan-700 underline" href="/dashboard/integrations">Connect Meta</Link> to use your own ad data.</>}</p>
        </div>
      </header>
      {kFixes.length > 0 && (
        <section className="card mt-6 p-6">
          <h2 className="text-lg font-semibold">Email fixes from Klaviyo</h2>
          <ul className="mt-3 space-y-3">
            {kFixes.map((f) => (
              <li key={f.id} className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">{f.title}</p>
                <p className="mt-1 text-slate-600">{f.why}</p>
                <Link href={f.href} className="mt-1 inline-block text-cyan-700 underline">How to do it</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {!demo && <StoreCheck runs={runs} storeUrl={acct.storeUrl} canRecheck={paid} />}
          {!demo && runs.length > 0 && (
            <section className="card p-5">
              <h2 className="font-semibold">Plain-English summary</h2>
              <p className="mt-1 text-sm text-slate-600">A short write-up of your latest store check and the 3 fixes to do first.</p>
              <div className="mt-3"><AiBox action={aiAuditWriteup} label="Write my summary" /></div>
            </section>
          )}
          {!demo && <h2 className="pt-2 text-lg font-semibold">Ads and funnel {live.metaLive ? "" : "(example data until Meta is connected)"}</h2>}
          {(paid ? open : open.slice(0, 3)).map((ins) => <InsightCard key={ins.id} ins={ins} plan={acct.plan} pending={pending.has(`insight-${ins.id}`)} />)}
          {!paid && demo && open.length > 3 && <UpgradePrompt need="starter" forKey="dfm" title={`${open.length - 3} more fixes found`} body="Free shows your top 3 fixes. Starter shows every fix, with a step-by-step checklist for each." />}
          {open.length === 0 && <div className="card p-8 text-center text-slate-600">All clear. Helix will raise new insights after the next audit.</div>}
        </div>
        <aside className="space-y-6">
          {demo && <section className="card p-5">
            <h2 className="font-semibold">Site audit checklist (example)</h2>
            <ul className="mt-3 space-y-2.5">
              {SITE_CHECKLIST_EXAMPLE.map((c) => (
                <li key={c.check} className="flex items-start gap-2 text-sm">
                  <span className="mt-1"><Flag flag={c.status} /></span>
                  <span><span className="font-medium text-slate-800">{c.check}</span><br /><span className="text-xs text-slate-500">{c.result}</span></span>
                </li>
              ))}
            </ul>
          </section>}
          <section className="card p-5">
            <h2 className="font-semibold">Social presence checklist (example)</h2>
            <ul className="mt-3 space-y-2.5">
              {SOCIAL_CHECKLIST_EXAMPLE.map((c) => (
                <li key={c.check} className="flex items-start gap-2 text-sm">
                  <span className="mt-1"><Flag flag={c.status} /></span>
                  <span><span className="font-medium text-slate-800">{c.check}</span><br /><span className="text-xs text-slate-500">{c.result}</span></span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-cyan-700" aria-hidden /> What Helix checks, and when</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {SCHEDULE.map(([k, v]) => <li key={k} className="flex justify-between gap-3"><span className="text-slate-700">{k}</span><span className="text-right text-slate-500">{v}</span></li>)}
            </ul>
            <p className="mt-3 text-xs text-slate-500">The store check reads your public pages only. It never logs in or changes anything.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
