import { PageGuide } from "@/components/simple/PageGuide";
import { MoreInfo } from "@/components/simple/TextAlert";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDays, getProfitSetup, getSettings } from "@/lib/repo";
import { getShopify } from "@/lib/shopify/service";
import { getGoogleAds } from "@/lib/google-ads/service";
import { getConnection } from "@/lib/meta/store";
import { numbersDays, totals } from "@/lib/numbers";
import { addDays, isoDay } from "@/lib/dates";
import { NumbersChart } from "@/components/dashboard/NumbersChart";
import { LostLink } from "@/components/dashboard/LostLink";
import { ToolsGrid } from "@/components/tools/ToolsGrid";
import { computeTools } from "@/lib/tools/server";

export const metadata = { title: "Numbers" };

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

export default async function NumbersPage({ searchParams }: PageProps<"/dashboard/numbers">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/numbers");
  const [days, settings, setup, shop, ga, meta] = await Promise.all([getDays(u.id), getSettings(u.id), getProfitSetup(u.id), getShopify(u.id), getGoogleAds(u.id), getConnection(u.id)]);
  const today = isoDay();
  const yesterday = addDays(today, -1);
  const unitCost = setup ? setup.productCost + setup.freightDuty + setup.packaging : 0;
  const rows = numbersDays(days, settings, yesterday, 56, unitCost);
  const wk = totals(rows.slice(-7));
  const example = days.some((d) => d.example);
  const tools = await computeTools(u.id);
  const day = typeof sp.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.day) ? sp.day : undefined;
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <PageGuide page="numbers"><MoreInfo label="Want to know more?" className="mt-2"><p className="text-sm text-slate-600">Your sales each day, and what you kept after costs.{example ? " These are example numbers until you add your own." : ""}</p></MoreInfo></PageGuide>
      </header>
      <section aria-label="Auto-fill" className="card flex flex-wrap items-center gap-2 p-4" data-testid="sync-bar">
        <span className="text-sm font-semibold text-slate-900">Fills in by itself:</span>
        {([["Shopify", Boolean(shop)], ["Meta", Boolean(meta)], ["Google", Boolean(ga?.customerId)], ["TikTok", false]] as [string, boolean][]).map(([n, on]) => (
          <span key={n} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${on ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500"}`}>{on ? "✓ " : ""}{n}</span>
        ))}
        {shop?.lastSyncAt && <span className="text-xs text-slate-500">Last sync {new Date(shop.lastSyncAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Australia/Sydney" })}</span>}
        <span className="ml-auto flex gap-2">
          <Link href="/dashboard/numbers/table" className="btn-ghost text-sm">Daily table</Link>
          <Link href="/dashboard/connect" className="btn-primary text-sm">{shop && meta ? "Manage tools" : "Connect your tools"}</Link>
        </span>
      </section>
      <section aria-label="Last 7 days" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Sales, last 7 days", money(wk.revenue)], ["Profit, last 7 days", money(wk.profit)], ["Orders", String(wk.orders)], ["Margin", `${wk.marginPct.toFixed(1)}%`]].map(([k, v]) => (
          <div key={k} className="card p-4"><p className="text-xs text-slate-600">{k}</p><p className="text-2xl font-bold tabular-nums text-slate-900">{v}</p></div>
        ))}
      </section>
      <section className="card p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-hand text-xl text-cyan-700">Daily sales</h2>
          <LostLink about="Reading my daily numbers" />
        </div>
        <div className="mt-3"><NumbersChart days={rows} initialDay={day} shopify={Boolean(shop)} meta={Boolean(meta)} google={Boolean(ga?.customerId)} /></div>
      </section>
      <ToolsGrid t={tools} />
      {!unitCost && (
        <section className="card p-5">
          <h2 className="font-hand text-xl text-cyan-700">Set your unit cost once</h2>
          <p className="mt-1 text-sm text-slate-700">Tell Helix what one item costs you. Then cost of goods works itself out every day: unit cost x items sold.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3"><Link href="/dashboard/profit" className="btn-primary text-sm">Set my unit cost</Link><LostLink about="Setting my unit cost" /></div>
        </section>
      )}
      <section className="card p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-hand text-xl text-cyan-700">Add or fix a day by hand</h2>
          <LostLink about="Typing in my numbers by hand" />
        </div>
        <p className="mt-1 text-sm text-slate-700">No connection yet? Type a day in, or upload a CSV. It takes about two minutes.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/dashboard/scorecard" className="btn-ghost text-sm">Type in a day</Link>
          <Link href="/dashboard/connect" className="btn-ghost text-sm">Connect your tools</Link>
        </div>
      </section>
      <section className="card p-5">
        <h2 className="font-hand text-xl text-cyan-700">More about your numbers</h2>
        <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <li><Link className="text-cyan-700 underline" href="/dashboard/profit">Profit setup and waterfall</Link>: where each sale goes.</li>
          <li><Link className="text-cyan-700 underline" href="/dashboard/analytics">Charts by week, month and year</Link></li>
          <li><Link className="text-cyan-700 underline" href="/dashboard/growth">Growth over time</Link></li>
          <li><Link className="text-cyan-700 underline" href="/dashboard/metrics">Key metrics explained</Link></li>
          <li><Link className="text-cyan-700 underline" href="/dashboard/goals">Monthly goals</Link></li>
          <li><Link className="text-cyan-700 underline" href="/dashboard/report">Weekly report</Link></li>
        </ul>
      </section>
    </div>
  );
}
