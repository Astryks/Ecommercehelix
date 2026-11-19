import Link from "next/link";
import { money, type StanceResult, type TodaySummary } from "@/lib/today";
import { prettyDay } from "@/lib/dates";

const STANCE_STYLE: Record<string, string> = {
  Push: "bg-emerald-100 text-emerald-800",
  "Careful push": "bg-amber-100 text-amber-900",
  Hold: "bg-amber-100 text-amber-900",
  Defend: "bg-rose-100 text-rose-800",
  "Not enough data": "bg-slate-100 text-slate-600",
};

/** One scorecard strip: yesterday's numbers, MER 3-day + month-to-date vs target, and the agent's stance. */
export function AgentScorecard({ s, date, stance }: { s: TodaySummary; date: string; stance: StanceResult }) {
  const fmt = (v: number | null) => (v === null ? "n/a" : `${v.toFixed(1)}%`);
  return (
    <section aria-labelledby="scorecard-h" className="card p-5 sm:p-6" data-testid="agent-scorecard">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="scorecard-h" className="text-sm font-semibold uppercase tracking-wide text-slate-500">Yesterday · {prettyDay(date)}</h2>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${STANCE_STYLE[stance.stance]}`}>Stance: {stance.stance}</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Profit (est.)", s.hasDay ? money(s.profit) : "$ ?"],
          ["Sales", s.hasDay ? money(s.sales) : "—"],
          ["Orders", s.hasDay ? String(s.orders) : "—"],
          ["Ad spend", s.hasDay ? money(s.adSpend) : "—"],
          ["MER, last 3 days", `${fmt(stance.mer3)} (target ≤ ${stance.targetMerPct}%)`],
          ["MER, this month", `${fmt(stance.merMtd)} (target ≤ ${stance.targetMerPct}%)`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-slate-700">{s.meaning}</p>
      <p className="mt-2 text-xs text-slate-500">
        Push: scale winners up to 20%. Careful push: scale the best only. Hold: no budget increases. Defend: cut spend and diagnose first.{" "}
        <Link href="/dashboard/scorecard" className="text-cyan-700 underline">See all your numbers</Link>
      </p>
    </section>
  );
}
