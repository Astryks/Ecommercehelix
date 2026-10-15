import Link from "next/link";
import { BookOpen, Calculator, Gauge, Link2, PencilLine, PlugZap, Target } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getDays, getSettings } from "@/lib/repo";
import { getConnection, getSnapshot } from "@/lib/meta/store";
import { metricsFor } from "@/lib/analytics";
import { addDays, isoDay } from "@/lib/dates";
import { keyMetrics, splitBySource, type KeyMetric, type Tone } from "@/lib/key-metrics";
import { taxLabel } from "@/lib/tax";
import { lessonLink } from "@/lib/lesson-links";
import { marketingBandProps } from "@/lib/marketing-read";
import { MarketingBand } from "@/components/profit/MarketingBand";

export const metadata = { title: "Key metrics" };

const TONE: Record<Tone, { ring: string; dot: string; label: string }> = {
  green: { ring: "ring-emerald-200", dot: "bg-emerald-500", label: "Good" },
  amber: { ring: "ring-amber-200", dot: "bg-amber-500", label: "Watch" },
  red: { ring: "ring-rose-200", dot: "bg-rose-500", label: "Fix" },
  none: { ring: "ring-slate-200", dot: "bg-slate-300", label: "No data yet" },
};

function SourceBadge({ k }: { k: KeyMetric }) {
  const s = k.source;
  if (s.kind === "manual") return <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-800 ring-1 ring-cyan-200"><PencilLine className="h-3 w-3" aria-hidden /> You fill this in</span>;
  if (s.kind === "auto") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200"><Calculator className="h-3 w-3" aria-hidden /> Helix fills this automatically</span>;
  return s.connected
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200"><PlugZap className="h-3 w-3" aria-hidden /> Automatic from {s.tool}</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-800 ring-1 ring-violet-200"><Link2 className="h-3 w-3" aria-hidden /> Automatic once you connect {s.tool}</span>;
}

function MetricTile({ k }: { k: KeyMetric }) {
  const t = TONE[k.tone];
  const s = k.source;
  return (
    <article className={`card flex flex-col p-5 ring-1 ${t.ring}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{k.name}</h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} aria-hidden />{t.label}</span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{k.plain}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-900 tabular">{k.value}</p>
      <p className="mt-2 text-xs"><span className="font-semibold text-slate-700">Good number: </span><span className="text-slate-600">{k.good}</span></p>
      <div className="mt-auto space-y-2 border-t border-slate-100 pt-3 mt-4">
        <SourceBadge k={k} />
        <p className="text-xs leading-5 text-slate-600">{s.kind === "manual" ? s.where : s.kind === "auto" ? s.how : s.until}</p>
        <div className="flex flex-wrap gap-2">
          {s.kind === "connect" && !s.connected && <Link href={s.href} className="btn-dark !px-3 !py-1.5 !text-xs"><PlugZap className="h-3.5 w-3.5" aria-hidden /> Connect {s.tool}</Link>}
          {s.kind === "manual" && <Link href="/dashboard/scorecard#entry" className="btn-ghost !px-3 !py-1.5 !text-xs"><PencilLine className="h-3.5 w-3.5" aria-hidden /> Fill it in</Link>}
          <Link href={k.learn} className="btn-ghost !px-3 !py-1.5 !text-xs"><BookOpen className="h-3.5 w-3.5 text-cyan-700" aria-hidden /> How to improve it</Link>
        </div>
      </div>
    </article>
  );
}

export default async function Metrics() {
  const u = await requireUser("/dashboard/metrics");
  const [acct, days, settings, conn, snap] = await Promise.all([getAccount(u.id), getDays(u.id), getSettings(u.id), getConnection(u.id), getSnapshot(u.id)]);
  const latest = days.at(-1)?.date ?? addDays(isoDay(), -1);
  const cur = { from: addDays(latest, -6), to: latest };
  const prev = { from: addDays(latest, -13), to: addDays(latest, -7) };
  const m = metricsFor(days, cur, settings);
  const pm = metricsFor(days, prev, settings);
  const list = keyMetrics(m, pm.dataDays ? pm : null, { settings, metaConnected: Boolean(conn), metaSynced: Boolean(snap), metaCtr: snap ? snap.now.ctr : null, shopifyConnected: false });
  const split = splitBySource(list);
  const taxNote = taxLabel(acct.salesTaxMode, acct.country);
  const counts = { green: list.filter((k) => k.tone === "green").length, fix: list.filter((k) => k.tone === "red").length };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 page-title"><Gauge className="h-7 w-7 text-cyan-600" aria-hidden /> Key metrics</h1>
          <p className="page-lead">The 14 numbers that run your store, for the last 7 days, each with a good number to aim for. Every card says whether you fill it in, Helix works it out, or it fills itself once you connect a tool.{taxNote && <> Sales are shown without {taxNote}.</>}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/scorecard#entry" className="btn-dark"><PencilLine className="h-4 w-4" aria-hidden /> Fill in today</Link>
          <Link href="/dashboard/growth" className="btn-ghost">Growth</Link>
          <Link href="/dashboard/goals" className="btn-ghost"><Target className="h-4 w-4" aria-hidden /> Monthly goals</Link>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600"><strong>{counts.green}</strong> of {list.length} look good{counts.fix ? <>, <strong className="text-rose-700">{counts.fix}</strong> need fixing</> : null}. Compared with the 7 days before where it helps.</p>

      <p className="mt-2 text-sm text-slate-600">New to these words? Start with <Link href={lessonLink("1.7")?.href ?? "/learn"} className="font-medium text-cyan-700 underline">Sales, costs and profit in plain English</Link>, then set up <Link href="/dashboard/profit" className="font-medium text-cyan-700 underline">your profit dashboard</Link>.</p>

      <div className="mt-4"><MarketingBand {...marketingBandProps(days, settings, latest)} /></div>

      <section aria-label="Who fills in what" className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5">
          <p className="flex items-center gap-2 font-semibold text-slate-900"><PencilLine className="h-4 w-4 text-cyan-700" aria-hidden /> You fill this in ({split.manual.length})</p>
          <p className="mt-1 text-xs text-slate-600">About 2 minutes a day, from your Shopify reports. Costs can be left blank and Helix estimates them.</p>
          <ul className="mt-3 flex flex-wrap gap-1.5 text-xs">{split.manual.map((k) => <li key={k.id} className="rounded-full bg-white px-2 py-0.5 ring-1 ring-cyan-200">{k.name.split(" (")[0]}</li>)}</ul>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
          <p className="flex items-center gap-2 font-semibold text-slate-900"><Calculator className="h-4 w-4 text-emerald-700" aria-hidden /> Helix fills this automatically ({split.auto.length})</p>
          <p className="mt-1 text-xs text-slate-600">Worked out from your numbers the moment you save. Nothing to type.</p>
          <ul className="mt-3 flex flex-wrap gap-1.5 text-xs">{split.auto.map((k) => <li key={k.id} className="rounded-full bg-white px-2 py-0.5 ring-1 ring-emerald-200">{k.name.split(" (")[0]}</li>)}</ul>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
          <p className="flex items-center gap-2 font-semibold text-slate-900"><Link2 className="h-4 w-4 text-violet-700" aria-hidden /> Automatic once you connect ({split.connect.length})</p>
          <p className="mt-1 text-xs text-slate-600">{conn ? "Meta is connected: spend, ROAS and CTR fill in each day." : "Connect Meta and Helix fills in ad spend, Meta ROAS and CTR every day."} Shopify sync for sessions, sales and add to carts is coming.</p>
          <ul className="mt-3 flex flex-wrap gap-1.5 text-xs">{split.connect.map((k) => <li key={k.id} className="rounded-full bg-white px-2 py-0.5 ring-1 ring-violet-200">{k.name.split(" (")[0]}</li>)}</ul>
          {!conn && <Link href="/dashboard/integrations" className="btn-dark mt-3 !px-3 !py-1.5 !text-xs"><PlugZap className="h-3.5 w-3.5" aria-hidden /> Connect Meta</Link>}
        </div>
      </section>

      {m.exampleDays > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Example data.</strong> These numbers come from example days so you can see how the panel works. <Link href="/dashboard/scorecard#entry" className="underline">Add your own day</Link>.
        </div>
      )}

      <section aria-label="Metric cards" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((k) => <MetricTile key={k.id} k={k} />)}
      </section>
    </div>
  );
}
