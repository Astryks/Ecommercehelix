import Link from "next/link";
import { BookOpen, Download, RefreshCw, Upload } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getDays, getProducts, getSettings } from "@/lib/repo";
import { derive, flags, sum, FIELD_LABELS, type NUM_FIELDS } from "@/lib/scorecard";
import { isoDay, prettyDay, weekStart, monthStart, addDays } from "@/lib/dates";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Flag } from "@/components/dashboard/Flag";
import { saveDay, importCsv, clearExamples, saveScorecardSettings, addProduct } from "../actions";

const $ = (n: number, dp = 0) => (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const pct = (n: number) => n.toFixed(1) + "%";
const x = (n: number) => (n ? n.toFixed(2) + "x" : "n/a");

type Field = (typeof NUM_FIELDS)[number];
const GROUPS: { title: string; fields: Field[] }[] = [
  { title: "Sales", fields: ["orders", "newCustomerOrders", "units", "sessions", "revenue", "newCustomerRevenue", "discounts", "refunds"] },
  { title: "Variable costs", fields: ["cogs", "shipping", "paymentFees"] },
  { title: "Marketing spend", fields: ["adMeta", "adGoogle", "adTiktok", "adOther", "otherMarketing"] },
  { title: "Platform-attributed sales (for channel ROAS)", fields: ["metaRevenue", "googleRevenue", "tiktokRevenue"] },
];

export default async function Scorecard() {
  const u = await requireUser("/dashboard/scorecard");
  const [days, settings, products] = await Promise.all([getDays(u.id), getSettings(u.id), getProducts(u.id)]);
  const hasExample = days.some((d) => d.example) || products.some((p) => p.example);
  const latest = days.at(-1)?.date ?? isoDay();
  const byDate = new Map(days.map((d) => [d.date, d]));
  const range = (from: string, to: string) => days.filter((d) => d.date >= from && d.date <= to);

  const day = byDate.get(latest) ?? sum([]);
  const dDay = derive(day, settings, 1);
  const prev = byDate.get(addDays(latest, -1));
  const dPrev = prev ? derive(prev, settings, 1) : null;
  const wtdDays = range(weekStart(latest), latest);
  const mtdDays = range(monthStart(latest), latest);
  const l7 = range(addDays(latest, -6), latest);
  const dW = derive(sum(wtdDays), settings, wtdDays.length || 1);
  const dM = derive(sum(mtdDays), settings, mtdDays.length || 1);
  const d7 = derive(sum(l7), settings, l7.length || 1);
  const fDay = flags(dDay, settings);
  const last14 = days.slice(-14);
  const series = last14.map((d) => derive(d, settings, 1));

  const tiles = [
    { label: "Net revenue", value: $(dDay.netRevenue), sub: `Target ${$(dDay.revenueTarget)}`, flag: fDay.target, spark: series.map((s) => s.netRevenue), color: "#1d2f4a", delta: dPrev ? dDay.netRevenue - dPrev.netRevenue : null },
    { label: "Contribution profit", value: $(dDay.contribution), sub: `${pct(dDay.contributionPct)} of net revenue`, flag: fDay.contribution, spark: series.map((s) => s.contribution), color: "#2f7359", delta: dPrev ? dDay.contribution - dPrev.contribution : null },
    { label: "MER (ad spend / revenue)", value: pct(dDay.merPct), sub: `Target ${pct(settings.targetMerPct)}`, flag: fDay.mer, spark: series.map((s) => s.merPct), color: "#566a94", delta: null },
    { label: "Blended CAC", value: $(dDay.blendedCac, 2), sub: `aCPA ${$(dDay.aCpa, 2)} · break-even CPA ${$(dDay.breakEvenCpa, 2)}`, flag: dDay.blendedCac <= dDay.breakEvenCpa ? "green" as const : dDay.blendedCac <= dDay.breakEvenCpa * 1.3 ? "amber" as const : "red" as const, spark: series.map((s) => s.blendedCac), color: "#9a4d16", delta: null },
    { label: "Orders · AOV", value: `${day.orders} · ${$(dDay.aov, 2)}`, sub: `CR ${pct(dDay.cr)} · RPV ${$(dDay.rpv, 2)}`, flag: null, spark: series.map((_, i) => last14[i].orders), color: "#0b1f3a", delta: null },
    { label: "Variable cost ratio", value: pct(dDay.vcrPct), sub: `Break-even ROAS ${x(dDay.breakEvenRoas)}`, flag: fDay.vcr, spark: series.map((s) => s.vcrPct), color: "#d9772b", delta: null },
  ];

  const rollRows: { label: string; get: (d: ReturnType<typeof derive>) => string; flag?: (d: ReturnType<typeof derive>) => "green" | "amber" | "red" }[] = [
    { label: "Net revenue", get: (d) => $(d.netRevenue) },
    { label: "Revenue target", get: (d) => $(d.revenueTarget) },
    { label: "Target vs actual", get: (d) => pct(d.revenueTarget ? (d.netRevenue / d.revenueTarget) * 100 : 0), flag: (d) => flags(d, settings).target },
    { label: "Gross profit", get: (d) => `${$(d.grossProfit)} (${pct(d.grossMarginPct)})` },
    { label: "Ad spend", get: (d) => $(d.adSpend) },
    { label: "Contribution profit", get: (d) => $(d.contribution) },
    { label: "Contribution %", get: (d) => pct(d.contributionPct), flag: (d) => flags(d, settings).contribution },
    { label: "MER", get: (d) => pct(d.merPct), flag: (d) => flags(d, settings).mer },
    { label: "Blended CAC (new customers)", get: (d) => $(d.blendedCac, 2) },
    { label: "aCPA (all orders)", get: (d) => $(d.aCpa, 2) },
    { label: "AOV", get: (d) => $(d.aov, 2) },
    { label: "New vs returning revenue", get: (d) => `${$(d.newRevenue)} / ${$(d.returningRevenue)}` },
    { label: "Net profit after fixed costs", get: (d) => $(d.netProfit) },
  ];

  const channels = [
    { name: "Meta", spend: sum(l7).adMeta, rev: sum(l7).metaRevenue, roas: d7.roasMeta },
    { name: "Google", spend: sum(l7).adGoogle, rev: sum(l7).googleRevenue, roas: d7.roasGoogle },
    { name: "TikTok", spend: sum(l7).adTiktok, rev: sum(l7).tiktokRevenue, roas: d7.roasTiktok },
    { name: "Other", spend: sum(l7).adOther, rev: 0, roas: 0 },
  ];
  const newShare = dM.netRevenue ? (dM.newRevenue / dM.netRevenue) * 100 : 0;
  const productRows = products.map((p) => {
    const revenue = p.units * p.price;
    const cogs = p.units * p.unitCost;
    return { ...p, revenue, cogs, margin: revenue - cogs, marginPct: revenue ? ((revenue - cogs) / revenue) * 100 : 0 };
  });

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Your numbers</h1>
            {hasExample && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Example data</span>}
          </div>
          <p className="mt-1 text-slate-600">All your numbers in one place, with this week and this month added up. For the quick version, use the profit box on Today. Showing <strong>{prettyDay(latest)}</strong>.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Shopify", "Meta", "Google"].map((s) => (
            <button key={s} disabled title="Coming soon" className="btn-ghost text-xs"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> Sync {s}</button>
          ))}
          <Link href="/learn/01-daily-profit-foundations" className="btn-ghost text-xs"><BookOpen className="h-3.5 w-3.5" aria-hidden /> How to read this</Link>
        </div>
      </header>

      <section aria-label="Key numbers" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{t.label}</p>
              {t.flag && <Flag flag={t.flag} showLabel />}
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-bold tracking-tight">{t.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t.sub}{t.delta !== null && <span className={t.delta >= 0 ? " text-emerald-600" : " text-rose-600"}> · {t.delta >= 0 ? "+" : ""}{$(t.delta)} vs prior day</span>}</p>
              </div>
              <Sparkline values={t.spark} color={t.color} label={t.label} />
            </div>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="card overflow-x-auto">
          <h2 className="px-5 pt-5 font-semibold">Rollups</h2>
          <table className="tbl mt-2 w-full">
            <thead><tr><th>Metric</th><th>Day</th><th>Week to date</th><th>Month to date</th></tr></thead>
            <tbody>
              {rollRows.map((r) => (
                <tr key={r.label}>
                  <td className="font-medium">{r.label}</td>
                  {[dDay, dW, dM].map((d, i) => (
                    <td key={i}><span className="inline-flex items-center gap-2">{r.flag && <Flag flag={r.flag(d)} />}{r.get(d)}</span></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="space-y-6">
          <section className="card overflow-x-auto">
            <h2 className="px-5 pt-5 font-semibold">Channels · last 7 days</h2>
            <table className="tbl mt-2 w-full">
              <thead><tr><th>Channel</th><th>Spend</th><th>Attributed sales</th><th>ROAS</th></tr></thead>
              <tbody>
                {channels.map((c) => (
                  <tr key={c.name}>
                    <td className="font-medium">{c.name}</td>
                    <td>{$(c.spend)}</td>
                    <td>{c.rev ? $(c.rev) : "n/a"}</td>
                    <td><span className="inline-flex items-center gap-2">{c.roas > 0 && <Flag flag={c.roas >= d7.breakEvenRoas * 1.3 ? "green" : c.roas >= d7.breakEvenRoas ? "amber" : "red"} />}{x(c.roas)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-5 pb-4 pt-2 text-xs text-slate-500">Break-even ROAS {x(d7.breakEvenRoas)} · break-even CPA {$(d7.breakEvenCpa, 2)} · blended MER {pct(d7.merPct)}. Platform ROAS over-counts; trust MER first.</p>
          </section>
          <section className="card p-5">
            <h2 className="font-semibold">New vs returning revenue · month to date</h2>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`New ${newShare.toFixed(0)} percent, returning ${(100 - newShare).toFixed(0)} percent`}>
              <div className="bg-cyan-500" style={{ width: `${newShare}%` }} />
              <div className="bg-violet-400" style={{ width: `${100 - newShare}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-600">
              <span>New {$(dM.newRevenue)} ({newShare.toFixed(0)}%)</span>
              <span>Returning {$(dM.returningRevenue)} ({(100 - newShare).toFixed(0)}%)</span>
            </div>
          </section>
        </div>
      </div>

      <section className="card mt-6 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
          <h2 className="font-semibold">Daily grid · last 14 days</h2>
          <p className="text-xs text-slate-500">Flag = worst of MER, contribution % and target for the day</p>
        </div>
        <table className="tbl mt-2 w-full">
          <thead>
            <tr><th>Day</th><th>Orders</th><th>Net sales</th><th>vs target</th><th>COGS</th><th>Ship + fees</th><th>Ad + mktg</th><th>Gross profit</th><th>Contribution</th><th>Contr. %</th><th>MER</th><th>aCPA</th><th>Flag</th></tr>
          </thead>
          <tbody>
            {[...last14].reverse().map((d) => {
              const r = derive(d, settings, 1);
              const f = flags(r, settings);
              const worst = [f.mer, f.contribution, f.target].includes("red") ? "red" : [f.mer, f.contribution, f.target].includes("amber") ? "amber" : "green";
              return (
                <tr key={d.date}>
                  <td className="font-medium">{prettyDay(d.date)}{d.example && <span className="ml-1.5 text-[10px] font-bold text-amber-700">EX</span>}</td>
                  <td>{d.orders}</td><td>{$(r.netRevenue)}</td><td>{pct((r.netRevenue / (r.revenueTarget || 1)) * 100)}</td>
                  <td>{$(d.cogs)}</td><td>{$(d.shipping + d.paymentFees)}</td><td>{$(r.adSpend + d.otherMarketing)}</td>
                  <td>{$(r.grossProfit)}</td><td className="font-semibold">{$(r.contribution)}</td><td>{pct(r.contributionPct)}</td><td>{pct(r.merPct)}</td><td>{$(r.aCpa, 2)}</td>
                  <td><Flag flag={worst as "green"} showLabel /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="card p-5" id="entry">
          <h2 className="font-semibold">Enter a day</h2>
          <p className="text-sm text-slate-500">Manual entry. Saving a date that exists overwrites it. Sync from Shopify, Meta and Google is coming.</p>
          <form action={saveDay} className="mt-4 space-y-5">
            <div className="max-w-xs">
              <label htmlFor="date" className="text-sm font-medium">Date</label>
              <input id="date" name="date" type="date" required defaultValue={isoDay()} className="input mt-1" />
            </div>
            {GROUPS.map((g) => (
              <fieldset key={g.title}>
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">{g.title}</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {g.fields.map((f) => (
                    <div key={f}>
                      <label htmlFor={f} className="text-xs font-medium text-slate-700">{FIELD_LABELS[f]}</label>
                      <input id={f} name={f} type="number" min="0" step="any" inputMode="decimal" className="input mt-1" placeholder="0" />
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
            <button className="btn-primary">Save day</button>
          </form>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Import CSV</h2>
            <p className="text-sm text-slate-500">One row per day. Columns match the field names in the template.</p>
            <form action={importCsv} className="mt-3 space-y-3">
              <label htmlFor="file" className="sr-only">CSV file</label>
              <input id="file" name="file" type="file" accept=".csv,text/csv" required className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-white" />
              <div className="flex flex-wrap gap-2">
                <button className="btn-dark"><Upload className="h-4 w-4" aria-hidden /> Import</button>
                <a href="/scorecard-template.csv" download className="btn-ghost"><Download className="h-4 w-4" aria-hidden /> Template</a>
              </div>
            </form>
          </section>
          <section className="card p-5">
            <h2 className="font-semibold">Targets and fixed costs</h2>
            <form action={saveScorecardSettings} className="mt-3 space-y-3">
              {([
                ["monthlyRevenueTarget", "Monthly revenue target ($)", settings.monthlyRevenueTarget],
                ["targetMerPct", "Target MER (%)", settings.targetMerPct],
                ["fixedCostsMonthly", "Fixed costs per month ($)", settings.fixedCostsMonthly],
              ] as const).map(([k, l, v]) => (
                <div key={k}>
                  <label htmlFor={k} className="text-xs font-medium text-slate-700">{l}</label>
                  <input id={k} name={k} type="number" step="any" min="0" defaultValue={v} className="input mt-1" />
                </div>
              ))}
              <button className="btn-dark">Save targets</button>
            </form>
            <p className="mt-3 text-xs text-slate-500">Daily target = monthly target ÷ 30.4. Not sure about MER? Start from 100% minus variable cost % minus fixed cost % minus the profit you want.</p>
          </section>
          {hasExample && (
            <form action={clearExamples} className="card p-5">
              <p className="text-sm text-slate-600">The numbers above are <strong>example data</strong> so you can see how the sheet works.</p>
              <button className="btn-ghost mt-3">Clear example data</button>
            </form>
          )}
        </div>
      </div>

      <section className="card mt-6 overflow-x-auto">
        <h2 className="px-5 pt-5 font-semibold">Products · month to date</h2>
        <table className="tbl mt-2 w-full">
          <thead><tr><th>SKU</th><th>Product</th><th>Units</th><th>Avg price</th><th>Revenue</th><th>Unit cost</th><th>COGS</th><th>Margin</th><th>Margin %</th></tr></thead>
          <tbody>
            {productRows.map((p, i) => (
              <tr key={p.sku + i}>
                <td className="font-mono text-xs">{p.sku}</td>
                <td className="font-medium">{p.name}{p.example && <span className="ml-1.5 text-[10px] font-bold text-amber-700">EX</span>}</td>
                <td>{p.units}</td><td>{$(p.price, 2)}</td><td>{$(p.revenue)}</td><td>{$(p.unitCost, 2)}</td><td>{$(p.cogs)}</td>
                <td className="font-semibold">{$(p.margin)}</td>
                <td><span className="inline-flex items-center gap-2"><Flag flag={p.marginPct >= 65 ? "green" : p.marginPct >= 55 ? "amber" : "red"} />{pct(p.marginPct)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <form action={addProduct} className="grid gap-2 border-t border-slate-100 p-5 sm:grid-cols-7">
          <input type="hidden" name="date" value={latest} />
          <label className="sr-only" htmlFor="p-sku">SKU</label><input id="p-sku" name="sku" placeholder="SKU" className="input" required />
          <label className="sr-only" htmlFor="p-name">Product</label><input id="p-name" name="name" placeholder="Product" className="input sm:col-span-2" required />
          <label className="sr-only" htmlFor="p-units">Units</label><input id="p-units" name="units" type="number" min="0" placeholder="Units" className="input" />
          <label className="sr-only" htmlFor="p-price">Price</label><input id="p-price" name="price" type="number" min="0" step="any" placeholder="Avg price" className="input" />
          <label className="sr-only" htmlFor="p-cost">Unit cost</label><input id="p-cost" name="unitCost" type="number" min="0" step="any" placeholder="Unit cost" className="input" />
          <button className="btn-dark">Add product</button>
        </form>
      </section>
    </div>
  );
}

