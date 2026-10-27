import type { ReactNode } from "react";
import Link from "next/link";
import { Flame, Target, Trophy, Lock, Check } from "lucide-react";
import { loadScoreboard } from "@/lib/scoreboard/server";
import { growPlan } from "@/lib/scoreboard/grow-plan";
import { money } from "@/lib/scoreboard/core";
import { lessonLink } from "@/lib/lesson-links";
import { canReadLesson } from "@/lib/paywall/access";
import { STAGE_INFO } from "@/lib/stages";
import { prettyDay } from "@/lib/dates";
import { getCompletions, getDays } from "@/lib/repo";
import { markDone } from "@/app/dashboard/actions";
import { saveYesterday, setDailyTarget } from "@/app/dashboard/scoreboard-actions";
import { WinGlow } from "./WinGlow";
import { MoreInfo } from "@/components/simple/TextAlert";
import { SimpleChart } from "@/components/simple/SimpleChart";
import { daySeries, rollupSeries } from "@/lib/simple/chart-series";

const TONE = {
  yes: { pill: "bg-emerald-600 text-white", ring: "border-emerald-200 bg-emerald-50/60", word: "YES" },
  "not-yet": { pill: "bg-amber-500 text-white", ring: "border-amber-200 bg-amber-50/60", word: "NOT YET" },
  no: { pill: "bg-slate-700 text-white", ring: "border-slate-200 bg-white", word: "NO" },
  "no-data": { pill: "bg-slate-200 text-slate-700", ring: "border-dashed border-slate-300 bg-white", word: "?" },
} as const;

function Step({ n, title, children, id }: { n: number; title: string; children: ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 id={id} className="flex items-center gap-3 text-xl font-bold text-slate-900"><span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#5A50D6] text-base text-white" aria-hidden>{n}</span><span><span className="sr-only">Step {n}: </span>{title}</span></h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

/** Top of Today: "Did I grow yesterday?", yesterday's sales/costs/profit, today's target, streak and "My plan to grow today". */
export async function ScoreboardHero({ userId }: { userId: string }) {
  const [s, completions, rawDays] = await Promise.all([loadScoreboard(userId), getCompletions(userId), getDays(userId)]);
  const g = s.grow;
  const tone = TONE[g.verdict];
  const doneIds = completions.map((c) => c.taskId);
  const done = new Set(doneIds);
  // Today's plan is fixed for the day: tasks already ticked today stay on the list (shown done).
  const tasks = growPlan({ today: s.today, days: rawDays, verdict: g.verdict, completedIds: doneIds.filter((id) => !id.endsWith(s.today)) });
  const y = s.yRow;
  const next = g.verdict === "no-data"
    ? (s.shopify ? "Shopify hasn't synced yesterday yet. Add it by hand or check back soon." : "Connect Shopify or add yesterday's numbers below.")
    : g.hitTarget ? "Nice. Keep the streak going: do one task below today." : g.verdict === "yes" ? "You grew. One task below could get you over the target today." : "Pick one task below. Small fixes add up.";
  // Chart data: free users only get the current week of days (paywall rule); weeks/months are sent only when paid.
  const series = s.paid
    ? { day: daySeries(s.days, 30), week: rollupSeries(s.history?.week, 12), month: rollupSeries(s.history?.month, 12) }
    : { day: daySeries(s.week, 7) };
  return (
    <div className="space-y-5" data-testid="scoreboard">
      <Step n={1} id="step-numbers" title="Where do you stand?">
        <p className="text-slate-700">Updating a few numbers each day shows where you stand, whether your sales are growing, and it&apos;s a fun way to keep yourself motivated.</p>
        {s.example && <p className="mt-2"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800" data-testid="demo-flag">Example numbers (demo)</span></p>}
        {y ? (
          <p className="mt-3 text-sm text-slate-700" data-testid="numbers-saved"><Check className="mr-1 inline h-4 w-4 text-emerald-600" aria-hidden />Yesterday ({prettyDay(s.yesterday)}) is in: <strong>{money(y.sales)}</strong> in sales from {y.orders} {y.orders === 1 ? "order" : "orders"}. Want to change it? Open the box below.</p>
        ) : (
          <p className="mt-3 text-sm font-medium text-slate-800">Let&apos;s add yesterday ({prettyDay(s.yesterday)}). Just 4 numbers.</p>
        )}
        <details className="group mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200" open={g.verdict === "no-data"}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">{y ? "Fix yesterday's numbers" : "Add yesterday's numbers"}{s.shopify ? " · sales fill in from Shopify" : ""}</summary>
          <form action={saveYesterday} className="mt-3 grid grid-cols-2 gap-3" data-testid="quick-entry">
            <input type="hidden" name="date" value={s.yesterday} />
            {([["sales", "Sales $", "What customers paid", y?.sales], ["orders", "Orders", "How many orders", y?.orders], ["adSpend", "Ad spend $", "What you paid for ads", y?.adSpend], ["productCost", "Product costs $", "What the products cost you", s.rawYesterday?.cogs]] as [string, string, string, number | undefined][]).map(([n, l, h, v]) => (
              <label key={n} className="text-sm font-medium text-slate-700">{l}
                <span className="block text-xs font-normal text-slate-500">{h}</span>
                <input name={n} inputMode="decimal" defaultValue={v ? Math.round(v) : ""} disabled={s.shopify && s.rawYesterday?.source === "shopify" && (n === "sales" || n === "orders")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base" />
              </label>
            ))}
            <details className="col-span-2 text-sm">
              <summary className="cursor-pointer text-xs font-semibold text-slate-600">Other costs (optional)</summary>
              <label className="mt-2 block text-xs text-slate-600">Other costs $<input name="otherCosts" inputMode="decimal" defaultValue={s.rawYesterday?.otherMarketing ? Math.round(s.rawYesterday.otherMarketing) : ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base" /></label>
            </details>
            <button className="btn-primary col-span-2">Save yesterday</button>
          </form>
          {!s.shopify && <p className="mt-2 text-xs text-slate-500">Or <Link href="/dashboard/connect" className="font-semibold underline">connect Shopify</Link> and we fill it in for you.</p>}
        </details>
      </Step>

      <Step n={2} id="step-grow" title="Did you grow?">
        <div className={`rounded-xl border p-4 ${tone.ring}`}>
          <p className="text-sm text-slate-600">Yesterday compared with a usual {new Date(s.yesterday + "T12:00:00Z").toLocaleDateString("en-AU", { weekday: "long", timeZone: "UTC" })}:</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <WinGlow win={g.hitTarget}><span className={`rounded-xl px-3 py-1.5 text-2xl font-extrabold tracking-wide sm:text-3xl ${tone.pill}`} data-testid="verdict">{tone.word}</span></WinGlow>
            <p className="text-xl font-bold text-slate-900 sm:text-2xl">{g.headline}</p>
          </div>
          <p className="mt-2 text-sm text-slate-700">{g.detail}</p>
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm ring-1 ring-slate-200" data-testid="target-streak"><Flame className="h-4 w-4 text-orange-500" aria-hidden />{s.streak.current}-day target streak</p>
        </div>
        <div className="mt-4"><SimpleChart series={series} locked={s.paid ? [] : ["week", "month"]} /></div>
        <MoreInfo label="Show details" className="mt-4">
          {y && (
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[["Sales", y.sales, "What customers paid"], ["Costs", y.costs, "Products, shipping, fees, ads"], ["Profit", y.profit, "What you kept"]].map(([k, v, h]) => (
                <div key={k as string} className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className={`text-lg font-bold tabular-nums ${k === "Profit" && (v as number) < 0 ? "text-rose-700" : "text-slate-900"}`}>{money(v as number)}</dd>
                  <p className="text-[11px] text-slate-500">{h}</p>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200"><Target className="h-4 w-4 text-[#5A50D6]" aria-hidden />Target {g.target.amount ? money(g.target.amount) : "not set"}{g.target.amount ? (g.hitTarget ? " · hit ✓" : ` · ${money(Math.max(0, g.target.amount - (g.sales ?? 0)))} short`) : ""}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200"><Trophy className="h-4 w-4 text-amber-500" aria-hidden />{s.streak.hits} target hits · best run {s.streak.best}</span>
          </div>
          <div className="mt-4" data-testid="today-target">
            <p className="text-sm font-medium text-slate-600">Today&apos;s target</p>
            <p className="text-2xl font-extrabold tabular-nums text-slate-900">{s.todayTarget.amount ? money(s.todayTarget.amount) : "—"}<span className="ml-1 text-base font-medium text-slate-500">in sales</span></p>
            <p className="mt-1 text-xs text-slate-500">{s.todayTarget.how}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-semibold text-cyan-700">Set my own goal</summary>
              <form action={setDailyTarget} className="mt-2 flex gap-2">
                <input name="target" inputMode="decimal" placeholder={s.todayTarget.amount ? String(s.todayTarget.amount) : "e.g. 1500"} defaultValue={s.input.dailyTarget ?? ""} className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
                <button className="btn-primary text-xs">Save</button>
                {s.input.dailyTarget && <button name="reset" value="1" className="btn-ghost text-xs">Use Helix&apos;s</button>}
              </form>
            </details>
          </div>
          <Link href="/dashboard/numbers/history" className="mt-4 inline-block text-sm font-semibold text-cyan-700 hover:underline">See week, month and year history →</Link>
        </MoreInfo>
      </Step>

      <Step n={3} id="step-plan" title="What's your plan today?">
        <p className="text-slate-700">{next}</p>
        <ul className="mt-3 space-y-3" data-testid="grow-plan">
          {tasks.map((t) => {
            const l = lessonLink(t.lesson);
            const open = canReadLesson(s.plan, t.lesson);
            const isDone = done.has(t.taskId);
            return (
              <li key={t.taskId} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                <form action={markDone}><input type="hidden" name="taskId" value={t.taskId} />
                  <button disabled={isDone} aria-label={`Mark "${t.title}" done`} className={`mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full border-2 ${isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-transparent hover:border-emerald-500 hover:text-emerald-500"}`}><Check className="h-4 w-4" /></button>
                </form>
                <div className="min-w-0">
                  <p className={`font-semibold ${isDone ? "text-slate-400 line-through" : "text-slate-900"}`}>{t.title} <span className="ml-1 whitespace-nowrap text-xs font-medium text-slate-500">{t.minutes} min</span></p>
                  <p className="text-sm text-slate-600">{t.why}</p>
                  {t.rule === "numbers" ? null : l && (
                    <Link href={l.href} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline">{open ? "" : <Lock className="h-3 w-3" aria-hidden />}{open ? `How to do it: ${l.title}` : `Preview: ${l.title} (full lesson on Starter)`}</Link>
                  )}
                  <span className="sr-only">Stage: {STAGE_INFO[t.stage].name}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-slate-500">Tick a task when it&apos;s done. That keeps your streak going.</p>
      </Step>
    </div>
  );
}
