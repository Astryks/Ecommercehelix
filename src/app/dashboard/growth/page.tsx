import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus, PencilLine, Sparkles, Target, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getDays, getSettings } from "@/lib/repo";
import { getConnection } from "@/lib/meta/store";
import { taxLabel } from "@/lib/tax";
import { addDays, isoDay } from "@/lib/dates";
import { GRAINS, MARGIN_BANDS, changeOf, comparison, growthSeries, marginBand, plainLine, toGrain, totalsFor, yearToDate, type Change } from "@/lib/growth";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { GrowthChart, MarginChart } from "@/components/analytics/GrowthCharts";
import { PALETTE } from "@/lib/palette";
import { PLAN_RANK } from "@/lib/plans";
import { lessonLink } from "@/lib/lesson-links";
import { marketingBandProps } from "@/lib/marketing-read";
import { MarketingBand } from "@/components/profit/MarketingBand";
import { UpgradePrompt } from "@/components/UpgradePrompt";

export const metadata = { title: "Growth" };

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-AU");
const pct = (n: number) => `${n.toFixed(1)}%`;

function ChangeChip({ c, goodWhenUp = true, unit = "money" }: { c: Change; goodWhenUp?: boolean; unit?: "money" | "points" }) {
  const good = c.dir === "flat" ? null : (c.dir === "up") === goodWhenUp;
  const tone = good === null ? "bg-slate-100 text-slate-700 ring-slate-200" : good ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200";
  const Icon = c.dir === "up" ? ArrowUpRight : c.dir === "down" ? ArrowDownRight : Minus;
  const absTxt = unit === "points" ? `${c.abs > 0 ? "+" : ""}${c.abs.toFixed(1)} pts` : `${c.abs > 0 ? "+" : c.abs < 0 ? "-" : ""}${money(Math.abs(c.abs)).replace("-", "")}`;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${tone}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {unit === "money" && c.pct !== null ? `${c.pct > 0 ? "+" : ""}${Math.round(c.pct)}% · ` : ""}
      {absTxt}
    </span>
  );
}

function BigCard({ label, value, change, vs, spark, color, goodWhenUp = true, unit, note }: { label: string; value: string; change: Change | null; vs: string; spark: number[]; color: string; goodWhenUp?: boolean; unit?: "money" | "points"; note?: React.ReactNode }) {
  return (
    <div className="card flex flex-col p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-[34px] font-semibold leading-none tracking-tight text-slate-900 tabular">{value}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {change ? <ChangeChip c={change} goodWhenUp={goodWhenUp} unit={unit} /> : <span className="text-xs text-slate-500">No earlier data yet</span>}
        <span className="text-xs text-slate-500">vs {vs}</span>
      </div>
      <div className="mt-auto overflow-hidden pt-4"><Sparkline values={spark} color={color} width={180} height={40} label={label} /></div>
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

export default async function Growth({ searchParams }: PageProps<"/dashboard/growth">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/growth");
  const [acct, days, settings, conn] = await Promise.all([getAccount(u.id), getDays(u.id), getSettings(u.id), getConnection(u.id)]);
  const paid = PLAN_RANK[acct.plan] >= PLAN_RANK.starter;
  const asked = toGrain(sp.g);
  // Day and week are free; month and year history are paid.
  const blocked = !paid && (asked === "month" || asked === "year");
  const grain = blocked ? "week" : asked;
  const g = GRAINS.find((x) => x.id === grain)!;
  const latest = days.at(-1)?.date ?? addDays(isoDay(), -1);
  const series = growthSeries(days, grain, latest, settings);
  const cmp = comparison(grain, latest);
  const cur = totalsFor(days, cmp.cur, settings);
  const prev = totalsFor(days, cmp.prev, settings);
  const hasPrev = prev.dataDays > 0;
  const ytd = yearToDate(days, latest, settings);
  const profitC = changeOf(cur.profit, prev.profit);
  const revC = changeOf(cur.revenue, prev.revenue);
  const band = marginBand(cur.marginPct);
  const withData = series.filter((p) => p.dataDays);
  const taxNote = taxLabel(acct.salesTaxMode, acct.country);
  const exampleShare = series.reduce((a, p) => a + p.exampleDays, 0);
  const metaDays = series.reduce((a, p) => a + p.metaDays, 0);
  const totalDays = series.reduce((a, p) => a + p.dataDays, 0);
  const headTone = !hasPrev || profitC.dir === "flat" ? "border-slate-200 bg-white" : profitC.dir === "up" ? "border-emerald-200 bg-emerald-50/70" : "border-rose-200 bg-rose-50/70";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><TrendingUp className="h-7 w-7 text-cyan-600" aria-hidden /> Growth</h1>
          <p className="mt-1 max-w-2xl text-slate-600">Watch revenue, costs and profit grow by day, week, month and year. Built from your daily numbers{conn ? " and your synced Meta ad spend" : ""}.{taxNote && <> Sales are shown without {taxNote}.</>}</p>
        </div>
        <nav aria-label="Period" className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold">
          {GRAINS.map((x) => (
            <Link key={x.id} href={`/dashboard/growth?g=${x.id}`} aria-current={grain === x.id ? "page" : undefined} className={`rounded-lg px-4 py-1.5 ${grain === x.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{x.label}{!paid && (x.id === "month" || x.id === "year") ? <span className="ml-1 text-[10px] font-bold text-[#D9772B]">PRO</span> : null}</Link>
          ))}
        </nav>
      </div>

      {blocked && <div className="mt-4"><UpgradePrompt need="starter" forKey="history" compact title="Month and year views are on Starter" body="See your profit month by month and year on year, with the full history of every number you have entered. Here is your weekly view in the meantime." /></div>}
      <p className="mt-3 text-sm text-slate-600">New to these words? <Link href={lessonLink("1.7")?.href ?? "/learn"} className="font-medium text-cyan-700 underline">Sales, costs and profit in plain English</Link> · <Link href="/dashboard/profit" className="font-medium text-cyan-700 underline">Your profit setup</Link></p>

      <section className={`mt-5 rounded-2xl border px-5 py-4 ${headTone}`} aria-live="polite">
        <p className="font-display text-2xl font-semibold tracking-tight text-slate-900">
          {hasPrev ? plainLine("Profit", profitC, cmp.vsWord) : `Profit so far: ${money(cur.profit)}.`}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {hasPrev ? plainLine("Revenue", revC, cmp.vsWord) : "Add a few more days of numbers to see the change."} Margin is {pct(cur.marginPct)}, which is <strong>{band.label.split(":")[0].toLowerCase()}</strong>. Now: {cmp.curLabel}. Compared with {cmp.prevLabel}.
        </p>
      </section>

      <div className="mt-5"><MarketingBand {...marketingBandProps(days, settings, latest)} /></div>

      {exampleShare > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Example data.</strong> Some days here are made-up examples so you can see how this works. Each day you add replaces the example. <Link href="/dashboard/scorecard#entry" className="underline">Add today&apos;s numbers</Link>.
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <BigCard label={grain === "day" ? "Revenue that day" : grain === "year" ? "Revenue this year" : grain === "month" ? "Revenue this month" : "Revenue this week"} value={money(cur.revenue)} change={hasPrev ? revC : null} vs={cmp.vsWord} spark={withData.map((p) => p.revenue)} color={PALETTE.ink2} />
        <BigCard label="All costs" value={money(cur.costs)} change={hasPrev ? changeOf(cur.costs, prev.costs) : null} vs={cmp.vsWord} spark={withData.map((p) => p.costs)} color={PALETTE.greyDark} goodWhenUp={false} note="Product, shipping, fees, ads, marketing and your share of fixed costs." />
        <BigCard label="Net profit" value={money(cur.profit)} change={hasPrev ? profitC : null} vs={cmp.vsWord} spark={withData.map((p) => p.profit)} color={PALETTE.sage} />
        <BigCard label="Profit margin" value={pct(cur.marginPct)} change={hasPrev ? changeOf(cur.marginPct, prev.marginPct) : null} unit="points" vs={cmp.vsWord} spark={withData.map((p) => p.marginPct)} color={PALETTE.ink} note={<>Good: 10% to 20%. Yours: <span className={band.tone === "red" ? "font-semibold text-rose-700" : band.tone === "amber" ? "font-semibold text-amber-800" : "font-semibold text-emerald-800"}>{band.label.split(":")[0]}</span>.</>} />
        <BigCard label="Profit this year so far" value={money(ytd.cur.profit)} change={ytd.hasPrev ? ytd.change : null} vs="same dates last year" spark={growthSeries(days, "month", latest, settings).filter((p) => p.from.slice(0, 4) === latest.slice(0, 4) && p.dataDays).map((p) => p.profit)} color={PALETTE.accent} note={`Margin ${pct(ytd.cur.marginPct)} on ${money(ytd.cur.revenue)} revenue.`} />
      </div>

      <section className="card mt-5 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-semibold">Revenue, costs and net profit</h2>
            <p className="mt-0.5 text-xs text-slate-500">{g.label} view, {g.sub}{grain === "month" || grain === "year" ? ". The latest bar is so far, not a full period" : ""}. The dashed line is your profit trend.</p>
          </div>
          <p className="text-xs text-slate-500">{metaDays > 0 ? <><Sparkles className="mr-1 inline h-3.5 w-3.5 text-violet-600" aria-hidden />Meta ad spend synced on {metaDays} of {totalDays} days</> : conn ? "Meta connected. Spend appears after the next daily sync." : <>Ad spend is typed in. <Link href="/dashboard/integrations" className="text-cyan-700 underline">Connect Meta</Link> to fill it in automatically.</>}</p>
        </div>
        <div className="mt-4"><GrowthChart data={series} /></div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="card p-5">
          <h2 className="font-semibold">Profit margin against benchmarks</h2>
          <p className="mt-0.5 text-xs text-slate-500">Net profit as a share of revenue. Shaded bands show what is normal for online stores.</p>
          <div className="mt-4"><MarginChart data={series} /></div>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {MARGIN_BANDS.map((b) => (
              <li key={b.label} className={`rounded-full px-2.5 py-1 ring-1 ${b.tone === "red" ? "bg-rose-50 text-rose-700 ring-rose-200" : b.tone === "amber" ? "bg-amber-50 text-amber-800 ring-amber-200" : "bg-emerald-50 text-emerald-800 ring-emerald-200"}`}>{b.label}</li>
            ))}
          </ul>
        </section>
        <section className="card flex flex-col p-5">
          <h2 className="font-semibold">Keep it growing</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li><Link href="/dashboard/scorecard#entry" className="flex items-center gap-2 font-medium text-slate-900 hover:text-cyan-700"><PencilLine className="h-4 w-4 text-cyan-700" aria-hidden /> Add today&apos;s numbers (2 minutes)</Link></li>
            <li><Link href="/dashboard/metrics" className="flex items-center gap-2 font-medium text-slate-900 hover:text-cyan-700"><Target className="h-4 w-4 text-cyan-700" aria-hidden /> Key metrics and what good looks like</Link></li>
            <li><Link href="/dashboard/goals" className="flex items-center gap-2 font-medium text-slate-900 hover:text-cyan-700"><TrendingUp className="h-4 w-4 text-cyan-700" aria-hidden /> Your monthly goals</Link></li>
            <li><Link href="/dashboard/analytics" className="flex items-center gap-2 font-medium text-slate-900 hover:text-cyan-700"><ArrowRight className="h-4 w-4 text-cyan-700" aria-hidden /> Full dashboard: channels, ROAS and costs</Link></li>
          </ul>
          <p className="mt-auto pt-4 text-xs text-slate-500">Fixed costs are spread evenly at {money(settings.fixedCostsMonthly)} a month. <Link href="/dashboard/scorecard#targets" className="text-cyan-700 underline">Change</Link>.</p>
        </section>
      </div>

      <section className="card mt-5 overflow-x-auto p-5">
        <h2 className="font-semibold">Every {grain === "day" ? "day" : grain}</h2>
        <table className="tbl mt-3 w-full">
          <thead><tr><th>{g.label}</th><th className="!text-right">Revenue</th><th className="!text-right">Costs</th><th className="!text-right">Net profit</th><th className="!text-right">Margin</th><th className="!text-right">Orders</th></tr></thead>
          <tbody>
            {[...series].reverse().filter((p) => p.dataDays).map((p) => (
              <tr key={p.from}>
                <td>{p.label}{p.partial ? " (so far)" : ""}{p.metaDays > 0 ? <span className="ml-1.5 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">Meta</span> : null}</td>
                <td className="text-right">{money(p.revenue)}</td>
                <td className="text-right">{money(p.costs)}</td>
                <td className={`text-right font-semibold ${p.profit >= 0 ? "text-emerald-800" : "text-rose-700"}`}>{money(p.profit)}</td>
                <td className="text-right">{pct(p.marginPct)}</td>
                <td className="text-right">{p.orders.toLocaleString("en-AU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
