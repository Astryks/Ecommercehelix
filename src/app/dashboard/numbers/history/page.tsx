import { PageGuide } from "@/components/simple/PageGuide";
import { MoreInfo, TextAlert } from "@/components/simple/TextAlert";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { loadScoreboard } from "@/lib/scoreboard/server";
import { money, rollup } from "@/lib/scoreboard/core";
import { HistoryView } from "@/components/scoreboard/HistoryView";
import { addLastYearPeriod, importLastYearCsv } from "@/app/dashboard/scoreboard-actions";
import { UNLOCK_LABEL } from "@/lib/paywall/access";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const u = await requireUser("/dashboard/numbers/history");
  const s = await loadScoreboard(u.id);
  // Free: the current week only (computed here on the server; nothing older is sent to the browser).
  const data = s.history ?? { week: rollup(s.week, "week").slice(-1) };
  const y = s.ytd;
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <PageGuide page="history"><MoreInfo label="Want to know more?" className="mt-2"><p className="text-sm text-slate-600">Week by week, month by month and year by year: sales, costs, profit, margin, orders, ad spend and ROAS.{s.example ? " These are example numbers (demo) until you add your own." : ""}</p></MoreInfo></PageGuide>
        <TextAlert summary="ROAS, CAC and MER are just three ways of asking: is my ad money coming back to me?" className="mb-6">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li><strong>ROAS</strong> (return on ad spend): sales from ads divided by what the ads cost. 3 means every $1 on ads brought back $3 of sales.</li>
            <li><strong>CAC</strong> (customer acquisition cost): what you spend to get one new customer.</li>
            <li><strong>MER</strong> (marketing efficiency ratio): all your sales divided by all your ad spend, from every channel together.</li>
            <li><strong>Margin</strong>: the part of each sale you keep after costs, shown as a percent.</li>
          </ul>
        </TextAlert>
      </header>

      <section className="card p-5" data-testid="ytd">
        <h2 className="font-hand text-xl text-cyan-700">This year so far vs last year</h2>
        {!y ? (
          <Locked what="Year to date vs last year" />
        ) : y.ly.days === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Year to date: <strong>{money(y.now.sales)}</strong> in sales, {money(y.now.profit)} profit. Add last year&apos;s numbers below to compare.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Sales this year", money(y.now.sales)], ["Same point last year", money(y.ly.sales)], ["Change", y.salesChangePct === null ? "—" : `${y.salesChangePct >= 0 ? "+" : ""}${y.salesChangePct}%`], ["Profit vs last year", `${y.profitChange >= 0 ? "+" : ""}${money(y.profitChange)}`]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{k}</p><p className="text-xl font-bold tabular-nums">{v}</p></div>
            ))}
            <p className="col-span-full text-xs text-slate-500">1 Jan to {y.to} vs 1 Jan to {y.lyTo}.{y.lyCoverage < 0.95 ? ` Last year covers ${Math.round(y.lyCoverage * 100)}% of those days, so the comparison is partial.` : ""}</p>
          </div>
        )}
      </section>

      <section className="card p-5" data-testid="history">
        <HistoryView data={data} locked={s.paid ? [] : ["month", "year"]} />
        {!s.paid && <div className="mt-4"><Locked what="Full history (every week, month and year) and CSV export" /></div>}
        {s.paid && <p className="mt-3 text-xs text-slate-500">Download: <a className="underline" href="/api/scoreboard/export?by=week">weeks</a> · <a className="underline" href="/api/scoreboard/export?by=month">months</a> · <a className="underline" href="/api/scoreboard/export?by=year">years</a> (CSV, totals only)</p>}
      </section>

      <section className="card p-5" data-testid="last-year">
        <h2 className="font-hand text-xl text-cyan-700">Add last year&apos;s numbers</h2>
        <p className="mt-1 text-sm text-slate-600">No daily data from last year? Type in each month (or week), or import a CSV. Totals only, never customer details. Days you already have always win over these totals.</p>
        {s.paid ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <form action={addLastYearPeriod} className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-600">Month<input type="month" name="start" required className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" /></label>
              <input type="hidden" name="kind" value="month" />
              {[["sales", "Sales $"], ["costs", "All costs $"], ["adSpend", "Ad spend $"], ["orders", "Orders"]].map(([n, l]) => <label key={n} className="text-xs text-slate-600">{l}<input name={n} inputMode="decimal" className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" /></label>)}
              <button className="btn-primary col-span-2 text-sm">Save month</button>
            </form>
            <form action={importLastYearCsv} className="space-y-2">
              <input type="file" name="file" accept=".csv,text/csv" className="block w-full text-sm" />
              <button className="btn-ghost text-sm">Import CSV</button>
              <p className="text-xs text-slate-500"><a className="underline" href="/api/scoreboard/export?template=1">Download the template</a>: period (YYYY-MM for a month, or a Monday YYYY-MM-DD for a week), sales, costs, ad_spend, orders.</p>
            </form>
            {s.input.manual.length > 0 && <p className="col-span-full text-xs text-slate-500">{s.input.manual.length} month/week totals saved.</p>}
          </div>
        ) : <div className="mt-3"><Locked what="Adding last year's numbers" /></div>}
        <p className="mt-3 text-xs text-slate-500">Shopify fills in the last 60 days automatically. Older orders need extra Shopify permission, which Helix doesn&apos;t ask for, so add older months here.</p>
      </section>
      <Link href="/dashboard" className="block text-center text-sm text-cyan-700 hover:underline">← Back to Today</Link>
    </div>
  );
}

function Locked({ what }: { what: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#5A50D6]/30 bg-[#5A50D6]/5 p-4" data-testid="locked">
      <p className="flex-1 text-sm text-slate-800">🔒 {what} is on Starter and Growth. Free shows yesterday, today&apos;s target and this week.</p>
      <Link href="/dashboard/billing" className="btn-primary text-sm">{UNLOCK_LABEL}</Link>
    </div>
  );
}
