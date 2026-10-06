import Link from "next/link";
import { BarChart3, Database, Info } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getDays, getSettings } from "@/lib/repo";
import { taxLabel } from "@/lib/tax";
import { getConnection } from "@/lib/meta/store";
import { PERIODS, channels, costBreakdown, metricsFor, periodRanges, seriesFor, toPeriod } from "@/lib/analytics";
import { metricCards } from "@/lib/metric-info";
import { addDays, isoDay } from "@/lib/dates";
import { MetricCard } from "@/components/analytics/MetricCard";
import { GoalsLadder } from "@/components/GoalsLadder";
import { goalsFor } from "@/lib/goals-server";
import { ChannelBars, Donut, NewReturning, ProfitTrend, RevenueCostsProfit, RoasMer } from "@/components/analytics/Charts";

const GROUPS = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
] as const;

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function Analytics({ searchParams }: PageProps<"/dashboard/analytics">) {
  const sp = await searchParams;
  const u = await requireUser();
  const acct = await getAccount(u.id);
  const taxNote = taxLabel(acct.salesTaxMode, acct.country);
  const [days, settings, conn, goalData] = await Promise.all([getDays(u.id), getSettings(u.id), getConnection(u.id), goalsFor(u.id)]);
  const period = toPeriod(sp.period);
  const meta = PERIODS.find((p) => p.id === period)!;
  const latest = days.at(-1)?.date ?? addDays(isoDay(), -1);
  const { cur, prev, curLabel, prevLabel } = periodRanges(period, latest);
  const m = metricsFor(days, cur, settings);
  const pm = metricsFor(days, prev, settings);
  const cards = metricCards(m, pm.dataDays ? pm : null, settings);
  const series = seriesFor(days, period, latest, settings);
  const bucketWord = period === "week" || period === "month" ? "week" : "month";
  const prevWord = period === "week" || period === "month" ? "the weeks before" : "same months last year";
  const chans = channels(m);
  const metaRows = days.filter((d) => d.date >= cur.from && d.date <= cur.to && (d.source === "meta" || (!d.example && d.adMeta > 0))).length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><BarChart3 className="h-7 w-7 text-cyan-600" aria-hidden /> Dashboard</h1>
          <p className="mt-1 text-slate-600">Revenue, costs and profit, worked out for you from your daily numbers. Tap <Info className="inline h-4 w-4" aria-label="the i button" /> on any number for what it means and what good looks like.{taxNote && <> Sales are shown without {taxNote} (<Link href="/dashboard/settings" className="text-cyan-700 underline">change</Link>).</>}</p>
        </div>
        <nav aria-label="Period" className="flex flex-col items-end gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold">
            {GROUPS.map((g) => (
              <Link key={g.id} href={`/dashboard/analytics?period=${g.id === "year" ? (meta.group === "year" ? period : "ytd") : g.id}`} aria-current={meta.group === g.id ? "page" : undefined}
                className={`rounded-lg px-4 py-1.5 ${meta.group === g.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{g.label}</Link>
            ))}
          </div>
          {meta.group === "year" && (
            <div className="flex gap-1 text-xs font-semibold">
              {PERIODS.filter((p) => p.group === "year").map((p) => (
                <Link key={p.id} href={`/dashboard/analytics?period=${p.id}`} aria-current={period === p.id ? "page" : undefined}
                  className={`rounded-full px-3 py-1 ring-1 ${period === p.id ? "bg-cyan-50 text-cyan-800 ring-cyan-300" : "text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>{p.label}</Link>
              ))}
            </div>
          )}
        </nav>
      </div>

      <p className="mt-4 text-sm text-slate-600"><strong>{meta.label}</strong> ({meta.sub}): {curLabel}. Compared with {prevLabel}.</p>

      {m.exampleDays > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Example data.</strong> {m.exampleDays} of the {m.dataDays} days in this view are made-up example numbers, so you can see how the Dashboard works. Each day you add replaces the example for that day. <Link href="/dashboard/scorecard" className="underline">Clear the examples in Your numbers</Link>.
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <MetricCard key={c.key} c={c} />)}
      </div>
      <p className="mt-2 text-xs text-slate-500">Green, amber and red compare with your own break-even lines and the targets in Your numbers. Ranges in the explanations are general guides, not guarantees.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue vs costs vs profit" sub={`By ${bucketWord}. Costs are product, shipping, fees, ads and other marketing. The line is contribution profit.`}>
          <RevenueCostsProfit data={series} />
        </Panel>
        <Panel title="Profit trend" sub={`By ${bucketWord}, with the dashed line showing ${prevWord} for comparison. Net profit also takes off fixed costs.`}>
          <ProfitTrend data={series} prevLabel={prevWord} />
        </Panel>
        <Panel title="Where the money went" sub={`All costs for ${meta.sub.toLowerCase()}, including your share of fixed costs.`}>
          <Donut data={costBreakdown(m)} centre="Total costs" />
        </Panel>
        <Panel title="ROAS and MER" sub={`By ${bucketWord}. Lines are ROAS (left scale), bars are MER (right scale). Stay above the red break-even line.`}>
          <RoasMer data={series} breakEven={Math.round(m.breakEvenRoas * 100) / 100} targetMer={settings.targetMerPct} />
        </Panel>
        <Panel title="Channel comparison" sub="Ad spend next to the sales each platform reports. Hover a channel for its ROAS.">
          {chans.length ? (
            <>
              <ChannelBars data={chans} breakEven={m.breakEvenRoas} />
              <table className="mt-3 w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500"><th className="py-1">Channel</th><th>Spend</th><th>Reported sales</th><th>ROAS</th><th>Source</th></tr></thead>
                <tbody>
                  {chans.map((c) => (
                    <tr key={c.name} className="border-t border-slate-100">
                      <td className="py-1.5 font-medium">{c.name}</td>
                      <td>${c.spend.toLocaleString("en-AU")}</td>
                      <td>${c.revenue.toLocaleString("en-AU")}</td>
                      <td className={c.roas >= m.breakEvenRoas * 1.2 ? "font-semibold text-emerald-700" : c.roas >= m.breakEvenRoas ? "font-semibold text-amber-700" : "font-semibold text-rose-600"}>{c.roas.toFixed(2)}x</td>
                      <td className="text-xs text-slate-500">{c.name === "Meta" ? (conn ? "Meta sync" : "Daily numbers") : "Daily numbers (sync coming)"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : <p className="text-sm text-slate-500">No ad spend in this period.</p>}
        </Panel>
        <Panel title="New vs returning revenue" sub={`By ${bucketWord}. Returning customers cost little or nothing in ads.`}>
          <NewReturning data={series} />
        </Panel>
      </div>

      <section id="goals" aria-labelledby="goals-h" className="card mt-6 scroll-mt-6 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="goals-h" className="font-semibold">Monthly goals vs the last 30 days</h2>
          <span className="flex gap-4 text-sm"><Link href="/learn/goals" className="text-cyan-700 underline">What each number means</Link><Link href="/dashboard/goals" className="font-medium text-cyan-700 underline">{goalData.isDefault ? "Set your goals" : "Change your goals"}</Link></span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">The goals ladder in funnel order, from visits to net profit. Revenue is the vanity number; net profit is the goal. Always the last 30 days, whatever period is picked above.</p>
        <div className="mt-4"><GoalsLadder variant="track" goals={goalData.goals} merPct={goalData.merPct} actuals={goalData.actuals} /></div>
      </section>

      <section className="card mt-6 p-5 text-sm">
        <h2 className="flex items-center gap-2 font-semibold"><Database className="h-4 w-4" aria-hidden /> Where these numbers come from</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <li><strong>Daily numbers:</strong> your one-minute update on Today, Your numbers and CSV imports. Costs you do not type are estimated from your recent ratios. {m.dataDays} of {m.calendarDays} days in this view have numbers.</li>
          <li><strong>Meta:</strong> {conn ? `connected, ad spend and Meta-reported sales sync every morning${metaRows ? ` (${metaRows} synced days here)` : ""}.` : "not connected yet, so Meta spend comes from your daily numbers."} <Link href="/dashboard/integrations" className="text-cyan-700 underline">Connections</Link></li>
          <li><strong>Shopify:</strong> sync coming soon (orders, refunds, product cost, new vs returning). For now these come from your daily numbers.</li>
          <li><strong>Google and TikTok:</strong> sync coming soon. Add their spend in the daily update or Your numbers.</li>
        </ul>
      </section>
    </div>
  );
}
