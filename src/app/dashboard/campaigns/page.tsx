import Link from "next/link";
import { BookOpen, FileText, RefreshCw } from "lucide-react";
import { EXAMPLE_CAMPAIGNS, metrics, recommend, type Recommendation } from "@/lib/campaigns";
import { requireUser } from "@/lib/session";
import { getDays, getSettings } from "@/lib/repo";
import { targetsFrom } from "@/lib/targets";
import { getConnection, getSnapshot } from "@/lib/meta/store";

const REC: Record<Recommendation, string> = {
  Scale: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Hold: "bg-slate-100 text-slate-700 ring-slate-200",
  Kill: "bg-rose-50 text-rose-700 ring-rose-200",
  "Refresh creative": "bg-amber-50 text-amber-800 ring-amber-200",
};
const CH: Record<string, string> = { Meta: "bg-blue-600", Google: "bg-amber-500", TikTok: "bg-pink-500" };
const $ = (n: number, dp = 0) => "$" + n.toLocaleString("en-AU", { minimumFractionDigits: dp, maximumFractionDigits: dp });

export default async function Campaigns({ searchParams }: PageProps<"/dashboard/campaigns">) {
  const sp = await searchParams;
  const channel = typeof sp.channel === "string" ? sp.channel : "All";
  const u = await requireUser("/dashboard/campaigns");
  const [days, settings, snap, conn] = await Promise.all([getDays(u.id), getSettings(u.id), getSnapshot(u.id), getConnection(u.id)]);
  const t = targetsFrom(days, settings);
  const live = Boolean(snap);
  // Meta rows come from the connected account when synced; Google and TikTok stay example rows for now.
  const source = live ? [...snap!.campaigns, ...EXAMPLE_CAMPAIGNS.filter((c) => c.channel !== "Meta").map((c) => ({ ...c, source: "example" as const }))] : EXAMPLE_CAMPAIGNS;
  const rows = source.filter((c) => channel === "All" || c.channel === channel).map((c) => ({ c, m: metrics(c), r: recommend(c, t) }));
  const totals = rows.reduce((a, { c }) => ({ spend: a.spend + c.spend, purchases: a.purchases + c.purchases, revenue: a.revenue + c.revenue, budget: a.budget + c.budget }), { spend: 0, purchases: 0, revenue: 0, budget: 0 });
  const counts = (["Scale", "Hold", "Refresh creative", "Kill"] as Recommendation[]).map((k) => [k, rows.filter((x) => x.r.rec === k).length] as const);
  const goodCold = t.aov * (t.targetMerPct / 100) * 2;

  return (
    <div className="mx-auto max-w-[96rem]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Campaign tracker</h1>
            {live ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Meta: live{conn?.mode === "mock" ? " (mock)" : ""}</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Example data</span>
            )}
          </div>
          <p className="mt-1 max-w-3xl text-slate-600">
            Every campaign, last 7 days, with a Helix call based on your targets: AOV {$(t.aov)}, target MER {t.targetMerPct}%, variable costs {t.vcrPct}%. Good cold CPA is {$(goodCold)}; bad is double that.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/integrations" className="btn-ghost text-xs"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> {conn ? "Meta connected" : "Connect Meta"}</Link>
          {["Google", "TikTok"].map((s) => (
            <button key={s} disabled title="Coming soon" className="btn-ghost text-xs">Connect {s}</button>
          ))}
          <Link href="/dashboard/campaigns/new" className="btn-dark text-xs"><FileText className="h-3.5 w-3.5" aria-hidden /> New campaign</Link>
        </div>
      </header>

      <p className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm text-cyan-900">
        <strong>Helix drafts, you launch.</strong> Helix builds campaigns in your account as paused drafts and can pause losing ads after you approve. Launching and every budget change on live campaigns stay with you.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Spend (7d)", $(totals.spend)],
          ["Daily budget", $(totals.budget)],
          ["Purchases", totals.purchases.toString()],
          ["Blended CPA · ROAS", `${$(totals.purchases ? totals.spend / totals.purchases : 0, 2)} · ${(totals.revenue / (totals.spend || 1)).toFixed(2)}x`],
        ].map(([k, v]) => (
          <div key={k} className="card p-5"><p className="text-sm text-slate-500">{k}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {["All", "Meta", "Google", "TikTok"].map((c) => (
          <Link key={c} href={c === "All" ? "/dashboard/campaigns" : `/dashboard/campaigns?channel=${c}`} aria-current={c === channel ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${c === channel ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{c}</Link>
        ))}
        <span className="mx-2 h-5 w-px bg-slate-300" aria-hidden />
        {counts.map(([k, n]) => (
          <span key={k} className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${REC[k]}`}>{k}: {n}</span>
        ))}
      </div>

      <section className="card mt-4 overflow-x-auto">
        <table className="tbl w-full">
          <thead>
            <tr><th>Channel</th><th>Campaign · objective</th><th>Budget /day</th><th>Spend 7d</th><th>Purch.</th><th>CPA</th><th>ROAS</th><th>CTR</th><th>CPM</th><th>Hook rate</th><th>Freq.</th><th>Status · stage</th><th>Helix recommendation</th></tr>
          </thead>
          <tbody>
            {rows.map(({ c, m, r }) => (
              <tr key={c.id} className="align-top">
                <td><span className="inline-flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${CH[c.channel]}`} aria-hidden />{c.channel}</span>{live && <div className={`text-[10px] font-semibold uppercase ${c.source === "live" ? "text-emerald-700" : "text-amber-700"}`}>{c.source === "live" ? "Live" : "Example"}</div>}</td>
                <td className="min-w-[13rem] max-w-[15rem] whitespace-normal! break-words font-mono text-xs">{c.name}<div className="break-normal font-sans text-[11px] text-slate-500">{c.objective} · {c.layer} audience</div></td>
                <td>{$(c.budget)}</td>
                <td>{$(c.spend)}</td>
                <td>{c.purchases}</td>
                <td className="font-semibold">{m.cpa ? $(m.cpa, 2) : "n/a"}</td>
                <td>{m.roas.toFixed(2)}x</td>
                <td>{m.ctr.toFixed(2)}%</td>
                <td>{$(m.cpm, 2)}</td>
                <td>{m.hookRate !== null ? m.hookRate.toFixed(0) + "%" : "n/a"}</td>
                <td>{c.channel === "Google" ? "n/a" : c.frequency.toFixed(1)}</td>
                <td><span className={`text-xs font-medium ${c.status === "Learning" ? "text-cyan-700" : c.status === "Paused" ? "text-slate-400" : "text-slate-700"}`}>{c.status}</span><div className="text-[11px] text-slate-500">{c.testStage}</div></td>
                <td className="min-w-[15rem] max-w-[19rem] whitespace-normal!">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${REC[r.rec]}`}>{r.rec}</span>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{r.reason}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          {live
            ? `Meta rows: your account, last 7 days, synced ${new Date(snap!.syncedAt).toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short" })} Sydney. Google and TikTok rows are still example data.`
            : "EXAMPLE DATA: these campaigns are made up to show how the tracker works. Connect Meta to see your own."}
        </p>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold">How Helix makes the call</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
            <li><strong>Hold</strong> if edited in the last 3 days, still learning, or spend is under one target CPA.</li>
            <li><strong>Kill</strong> if CPA is at or above double the good line, or spend passes that line with no purchases.</li>
            <li><strong>Refresh creative</strong> if frequency is high for the audience, outbound CTR is under 0.5%, or hook rate is under 20%.</li>
            <li><strong>Scale</strong> if CPA is at or under the good line and frequency is healthy. You raise the budget by up to 20% a day; Helix gives you the exact number.</li>
            <li><strong>Google</strong>: scale above 1.5x break-even ROAS, kill below break-even, otherwise optimise.</li>
            <li>Good CPA = AOV × target MER × audience factor (cold 2, mixed 1.25, warm 1, hot 0.75).</li>
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="font-semibold">Plan your next campaign</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Before you launch, define the job, audience, budget, creative concepts and kill rules. The Learn module walks you through it and ends with a fill-in brief.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/learn/06-defining-campaigns" className="btn-primary"><BookOpen className="h-4 w-4" aria-hidden /> Learn: Defining campaigns</Link>
            <Link href="/dashboard/campaigns/new" className="btn-ghost">Open the campaign builder</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
