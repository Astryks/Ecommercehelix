import { CalendarClock, RefreshCw } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getCompletions, listApprovals } from "@/lib/repo";
import { SITE_CHECKLIST_EXAMPLE, SOCIAL_CHECKLIST_EXAMPLE } from "@/lib/audit";
import { insightsFor } from "@/lib/signals";
import Link from "next/link";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Flag } from "@/components/dashboard/Flag";

const SCHEDULE = [
  ["Site crawl + checklist", "Weekly (Mon 4:00)"],
  ["PageSpeed mobile + desktop", "Weekly"],
  ["Shopify sales and funnel", "Daily 5:00"],
  ["Meta ad insights", "Daily 5:30"],
  ["Google Ads + search terms", "Daily 5:30"],
  ["Email flows and revenue", "Daily 6:00"],
  ["Instagram, TikTok, Facebook profiles", "Weekly"],
];

export default async function Insights() {
  const u = await requireUser("/dashboard/insights");
  const [acct, completions, approvals, live] = await Promise.all([getAccount(u.id), getCompletions(u.id), listApprovals(u.id), insightsFor(u.id)]);
  const done = new Set(completions.map((c) => c.taskId));
  const pending = new Set(approvals.filter((a) => a.status === "pending").map((a) => a.taskId));
  const all = live.insights;
  const open = all.filter((i) => !done.has(`insight-${i.id}`));
  const resolved = all.length - open.length;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">What to fix</h1>
            {live.metaLive ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Meta: live data</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Example data</span>
            )}
          </div>
          <p className="mt-1 max-w-3xl text-slate-600">Helix checks your store and your ads and tells you, in plain words, what is holding sales back: the ad, the page, the offer or the checkout. Fix the top one first. {open.length} open, {resolved} resolved. {live.signals.period}.{!live.metaLive && <> <Link className="text-cyan-700 underline" href="/dashboard/integrations">Connect Meta</Link> to use your own ad data.</>}</p>
        </div>
        <button disabled title="Live audits are coming soon" className="btn-ghost text-xs"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> Run audit now</button>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {open.map((ins) => <InsightCard key={ins.id} ins={ins} plan={acct.plan} pending={pending.has(`insight-${ins.id}`)} />)}
          {open.length === 0 && <div className="card p-8 text-center text-slate-600">All clear. Helix will raise new insights after the next audit.</div>}
        </div>
        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Site audit checklist</h2>
            <ul className="mt-3 space-y-2.5">
              {SITE_CHECKLIST_EXAMPLE.map((c) => (
                <li key={c.check} className="flex items-start gap-2 text-sm">
                  <span className="mt-1"><Flag flag={c.status} /></span>
                  <span><span className="font-medium text-slate-800">{c.check}</span><br /><span className="text-xs text-slate-500">{c.result}</span></span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="font-semibold">Social presence checklist</h2>
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
            <h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-cyan-700" aria-hidden /> Audit schedule</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {SCHEDULE.map(([k, v]) => <li key={k} className="flex justify-between gap-3"><span className="text-slate-700">{k}</span><span className="text-right text-slate-500">{v}</span></li>)}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Times are your store&apos;s local time. Connections to Shopify, Meta, Google, Klaviyo and social profiles are stubbed in this version.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
