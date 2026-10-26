import Link from "next/link";
import { Flag, Flame, History, ListChecks, Trophy } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getHistory, getRawDays, getSettings, streakFrom } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { addDays, isoDay } from "@/lib/dates";
import { metricsFor } from "@/lib/analytics";
import { bestStreak, monthly, timeline } from "@/lib/history";
import { GOALS } from "@/lib/course-plan";
import { lessonLink } from "@/lib/lesson-links";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { achievementsForUser } from "@/lib/achievements-server";
import { LostLink } from "@/components/dashboard/LostLink";
import { RoadSection } from "@/components/journey/RoadSection";
import { journeyForUser } from "@/lib/journey-server";
import { journeyView } from "@/lib/journey-view";
import { MILESTONES } from "@/lib/journey";
import { setRoadLevel } from "./actions";

export const metadata = { title: "Your progress" };

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-AU");
const monthName = (m: string) => new Date(m + "-15T00:00:00Z").toLocaleDateString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" });
const dayName = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const goalTitle = (id: string) => GOALS.find((g) => g.id === id)?.title ?? id;

export default async function ProgressPage() {
  const u = await requireUser("/dashboard/progress");
  const acct = await getAccount(u.id);
  const paid = PLAN_RANK[acct.plan] >= PLAN_RANK.starter;
  const today = isoDay();
  const since = paid ? null : addDays(today, -30);
  const [h, raw, settings, earned] = await Promise.all([getHistory(u.id, since), getRawDays(u.id), getSettings(u.id), achievementsForUser(u.id)]);
  const road = await journeyForUser(u.id);
  const roadBadges = [
    ...(road.pos.source === "numbers" ? MILESTONES.filter((m) => m.level <= road.pos.level).map((m) => ({ key: `road-${m.id}`, title: `Reached: ${m.title}`, note: m.when })) : []),
    ...road.quest.badges.filter((b) => b.earned),
  ];
  const days = timeline(h);
  const months = monthly(h);
  const dates = h.completions.map((c) => c.completedOn);
  const goalsDone = h.events.filter((e) => e.kind === "goal_done");
  const real = raw.filter((d) => !d.example && (!since || d.date >= since));
  // Profit by month (paid) or by week (free, last 30 days), from real daily numbers only.
  const buckets: { label: string; from: string; to: string }[] = [];
  if (paid && real.length) {
    let m = real[0].date.slice(0, 7);
    const last = today.slice(0, 7);
    while (m <= last) {
      const [y, mo] = m.split("-").map(Number);
      const end = new Date(Date.UTC(y, mo, 0)).toISOString().slice(0, 10);
      buckets.push({ label: new Date(m + "-15T00:00:00Z").toLocaleDateString("en-AU", { month: "short", year: "2-digit", timeZone: "UTC" }), from: m + "-01", to: end });
      m = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
    }
  } else {
    for (let k = 3; k >= 0; k--) { const to = addDays(today, -1 - 7 * k); buckets.push({ label: `Week to ${to.slice(5)}`, from: addDays(to, -6), to }); }
  }
  const trend = buckets.slice(-24).map((b) => { const m = metricsFor(real, b, settings); return { ...b, profit: m.netProfit, sales: m.netRevenue, n: m.dataDays }; });
  const maxAbs = Math.max(1, ...trend.map((t) => Math.abs(t.profit)));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="flex items-center gap-2 page-title"><History className="h-7 w-7 text-[#5A50D6]" aria-hidden /> Your progress</h1>
      <p className="page-lead">Everything you have done in Helix: goals finished, tasks and lessons ticked, your streak and your profit over time. {paid ? "Your full history since you joined." : "Showing the last 30 days."}{h.joined && <> Member since {dayName(h.joined.slice(0, 10))}.</>}</p>

      {!paid && <div className="mt-4"><UpgradePrompt need="starter" forKey="history" compact title="See your whole journey" body="Free shows the last 30 days. Starter keeps your full history: every goal with its date, every month's recap and your profit trend since you joined." /></div>}

      <RoadSection views={journeyView(acct.plan, paid)} level={road.pos.level} source={road.pos.source} progress={road.progress} last30={road.facts.last30Sales} xp={road.xp} streak={road.streak} badges={roadBadges} selfLevel={road.selfLevel} paid={paid} pick={setRoadLevel} />

      <section className="mt-5 grid gap-4 sm:grid-cols-4" aria-label="Summary">
        {[
          [Trophy, "Goals finished", String(goalsDone.length)],
          [ListChecks, "Tasks done", String(h.completions.length)],
          [Flame, "Current streak", `${streakFrom(h.completions, today)} days`],
          [Flag, "Best streak", `${bestStreak(dates)} days`],
        ].map(([Icon, t, v]) => {
          const I = Icon as typeof Trophy;
          return <div key={t as string} className="card p-4"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><I className="h-3.5 w-3.5" aria-hidden /> {t as string}</p><p className="mt-1 font-display text-3xl font-semibold text-[#1A1718]">{v as string}</p></div>;
        })}
      </section>

      <section className="card mt-5 p-5" aria-label="Achievements">
        <div className="flex items-baseline justify-between gap-2"><h2 className="font-hand text-xl text-cyan-700">Achievements</h2><LostLink about="How achievements work" /></div>
        {earned.length === 0 ? <p className="mt-2 text-sm text-slate-700">Your first one comes with your first task. Open Today and do one small step.</p> : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{earned.map((a) => <li key={a.key} className="flex items-start gap-2 rounded-lg bg-white p-3 text-sm"><Trophy className="mt-0.5 h-4 w-4 flex-none text-amber-500" aria-hidden /><span><span className="block font-semibold text-slate-900">{a.title}</span><span className="text-slate-600">{a.note}</span></span></li>)}</ul>
        )}
      </section>

      <section className="card mt-5 p-5" aria-label="Profit trend">
        <h2 className="font-hand text-xl font-semibold text-[#1A1718]">Profit {paid ? "by month since you started" : "by week, last 30 days"}</h2>
        {real.length === 0 ? <p className="mt-2 text-sm text-slate-600">Add your real daily numbers and your profit trend appears here. <Link href="/dashboard/scorecard#entry" className="text-cyan-700 underline">Add today&apos;s numbers</Link></p> : (
          <ol className="mt-4 flex h-44 items-end gap-2">
            {trend.map((t) => (
              <li key={t.label} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${t.label}: profit ${money(t.profit)}, sales ${money(t.sales)}`}>
                <span className="text-[10px] tabular text-slate-600">{t.n ? money(t.profit) : ""}</span>
                <span className={`w-full rounded-t ${t.profit >= 0 ? "bg-[#8FA98B]" : "bg-rose-400"}`} style={{ height: `${t.n ? Math.max(2, (Math.abs(t.profit) / maxAbs) * 120) : 0}px` }} />
                <span className="text-[10px] text-slate-500">{t.label}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card p-5" aria-label="Monthly recap">
          <h2 className="font-hand text-xl font-semibold text-[#1A1718]">Monthly recap</h2>
          {months.length === 0 ? <p className="mt-2 text-sm text-slate-600">Tick your first task and your recap starts here.</p> : (
            <table className="mt-3 w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-500"><th className="py-1">Month</th><th>Active days</th><th>Tasks</th><th>Lesson steps</th><th>Goals</th></tr></thead>
              <tbody>{months.map((m) => <tr key={m.month} className="border-t border-slate-100"><td className="py-1.5">{monthName(m.month)}</td><td>{m.activeDays}</td><td>{m.tasks}</td><td>{m.steps}</td><td>{m.goals}</td></tr>)}</tbody>
            </table>
          )}
        </section>
        <section className="card p-5" aria-label="Goals finished">
          <h2 className="font-hand text-xl font-semibold text-[#1A1718]">Goals finished</h2>
          {goalsDone.length === 0 ? <p className="mt-2 text-sm text-slate-600">Your first finished goal will show here with its date. <Link href="/course" className="text-cyan-700 underline">Open your course</Link></p> : (
            <ul className="mt-3 space-y-2 text-sm">{[...goalsDone].reverse().map((g) => <li key={g.ref + g.at} className="flex justify-between gap-3"><span className="font-medium">{goalTitle(g.ref)}</span><span className="text-slate-500">{dayName(g.at.slice(0, 10))}</span></li>)}</ul>
          )}
        </section>
      </div>

      <section className="card mt-5 p-5" aria-label="Timeline">
        <h2 className="font-hand text-xl font-semibold text-[#1A1718]">Timeline</h2>
        {days.length === 0 ? <p className="mt-2 text-sm text-slate-600">Nothing yet. Every task and lesson step you tick appears here, day by day.</p> : (
          <ol className="mt-3 space-y-3 border-l-2 border-slate-200 pl-4">
            {days.slice(0, 60).map((d) => (
              <li key={d.date} className="text-sm">
                <p className="font-semibold text-slate-900">{dayName(d.date)}</p>
                <p className="text-slate-600">
                  {[d.goals.length ? `Finished: ${d.goals.map(goalTitle).join(", ")}` : "", d.profitSetup ? "Set up your profit dashboard" : "", d.tasks ? `${d.tasks} task${d.tasks === 1 ? "" : "s"} done` : "", ...[...d.lessons].map(([ref, n]) => `${lessonLink(ref)?.title ?? "Lesson " + ref}: ${n} step${n === 1 ? "" : "s"}`)].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
