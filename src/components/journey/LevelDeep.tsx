import type { Deep, SpendRow, Src } from "@/lib/journey-content";
import { SPEND_NOTE } from "@/lib/journey-content";

const money = (n: number) => (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-AU");
const pct = (n: number) => Math.round(n * 100) + "%";
const rng = (a: number, b: number) => (a === b ? money(a) : `${money(a)} to ${money(b)}`);
const per = (p: SpendRow["period"]) => (p === "year" ? " a year" : p === "month" ? " a month" : " in total");

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-slate-900">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </div>
  );
}

export function SpendCard({ s }: { s: SpendRow }) {
  const rows: [string, string][] = [
    [s.period === "total" ? "Stock to start" : "Stock held (2 to 3 months at cost)", rng(s.stock[0], s.stock[1])],
    ["Ad spend" + per(s.period), rng(s.ads[0], s.ads[1])],
    ["Ads as a share of sales (MER)", `${pct(s.adPct[0])} to ${pct(s.adPct[1])}`],
    ["of which creators and partners", rng(s.partners[0], s.partners[1])],
    ["Team, tools and running costs" + per(s.period), rng(s.overhead[0], s.overhead[1])],
    ["Profit" + per(s.period), `${rng(s.profit[0], s.profit[1])} (${pct(s.profitPct[0])} to ${pct(s.profitPct[1])})`],
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3" data-testid="road-spend">
      <h4 className="font-semibold text-slate-900">What you spend to reach {s.goal}</h4>
      <table className="mt-2 w-full text-left text-sm">
        <tbody>{rows.map(([k, v]) => <tr key={k} className="border-t border-slate-200"><th scope="row" className="py-1 pr-3 font-normal text-slate-600">{k}</th><td className="py-1 font-medium tabular-nums">{v}</td></tr>)}</tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500">{SPEND_NOTE} The formula is under &ldquo;How these numbers are worked out&rdquo; below.</p>
    </div>
  );
}

export function SourceLinks({ sources }: { sources: Src[] }) {
  if (!sources.length) return null;
  return <p className="text-xs text-slate-500">Sources: {sources.map((s, i) => <span key={s.url}>{i ? "; " : ""}<a href={s.url} className="underline" target="_blank" rel="noreferrer">{s.label}</a></span>)}.</p>;
}

export function LevelDeep({ d, s }: { d: Deep; s: SpendRow }) {
  return (
    <div className="space-y-4 text-sm text-slate-800" data-testid="road-deep">
      <p className="rounded-lg bg-amber-50 p-2 text-amber-900"><strong>Timeline:</strong> {d.timeline}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <SpendCard s={s} />
        <List title="What it really takes" items={d.takes} />
        <List title="The money maths (worked example)" items={d.economics} />
        <List title="Cash, stock and funding it yourself" items={d.cash} />
        <List title="Who to hire, in order" items={d.hiring} />
        <List title="Channels to add" items={d.channels} />
        <List title="Your ecosystem: content, creators and partners" items={d.ecosystem} />
        <List title="Biggest mistakes here" items={d.mistakes} />
      </div>
      <p><strong>Ads getting saturated:</strong> {d.adWall}</p>
      <SourceLinks sources={d.sources} />
    </div>
  );
}
