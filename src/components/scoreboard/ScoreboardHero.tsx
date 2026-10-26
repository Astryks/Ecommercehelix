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

const TONE = {
  yes: { pill: "bg-emerald-600 text-white", ring: "border-emerald-200 bg-emerald-50/60", word: "YES" },
  "not-yet": { pill: "bg-amber-500 text-white", ring: "border-amber-200 bg-amber-50/60", word: "NOT YET" },
  no: { pill: "bg-slate-700 text-white", ring: "border-slate-200 bg-white", word: "NO" },
  "no-data": { pill: "bg-slate-200 text-slate-700", ring: "border-dashed border-slate-300 bg-white", word: "?" },
} as const;

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
  return (
    <section aria-label="Did I grow yesterday?" className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]" data-testid="scoreboard">
      <div className={`rounded-2xl border p-5 sm:p-6 ${tone.ring}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-600">Did I grow yesterday? <span className="text-slate-400">({prettyDay(s.yesterday)})</span></p>
          {s.example && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800" data-testid="demo-flag">Example numbers (demo)</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <WinGlow win={g.hitTarget}><span className={`rounded-xl px-3 py-1.5 text-2xl font-extrabold tracking-wide sm:text-3xl ${tone.pill}`} data-testid="verdict">{tone.word}</span></WinGlow>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{g.headline}</h2>
        </div>
        <p className="mt-2 text-sm text-slate-700">{g.detail}</p>
        {y && (
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[["Sales", y.sales, "What customers paid"], ["Costs", y.costs, "Products, shipping, fees, ads"], ["Profit", y.profit, "What you kept"]].map(([k, v, h]) => (
              <div key={k as string} className="rounded-xl bg-white/80 p-2 ring-1 ring-slate-200">
                <dt className="text-xs text-slate-500">{k}</dt>
                <dd className={`text-lg font-bold tabular-nums sm:text-xl ${k === "Profit" && (v as number) < 0 ? "text-rose-700" : "text-slate-900"}`}>{money(v as number)}</dd>
                <p className="hidden text-[11px] text-slate-400 sm:block">{h}</p>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200"><Target className="h-4 w-4 text-[#5A50D6]" aria-hidden />Target {g.target.amount ? money(g.target.amount) : "not set"}{g.target.amount ? (g.hitTarget ? " · hit ✓" : ` · ${money(Math.max(0, g.target.amount - (g.sales ?? 0)))} short`) : ""}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200" data-testid="target-streak"><Flame className="h-4 w-4 text-orange-500" aria-hidden />{s.streak.current}-day target streak</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200"><Trophy className="h-4 w-4 text-amber-500" aria-hidden />{s.streak.hits} target hits · best run {s.streak.best}</span>
        </div>
        <p className="mt-3 text-sm font-medium text-slate-800">→ {next}</p>

        <details className="mt-4 rounded-xl bg-white/70 p-3 ring-1 ring-slate-200" open={g.verdict === "no-data"}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">{y ? "Fix yesterday's numbers" : "Add yesterday's numbers (1 tap)"}{s.shopify ? " · sales fill in from Shopify" : ""}</summary>
          <form action={saveYesterday} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5" data-testid="quick-entry">
            <input type="hidden" name="date" value={s.yesterday} />
            {([["sales", "Sales $", y?.sales], ["orders", "Orders", y?.orders], ["adSpend", "Ad spend $", y?.adSpend], ["productCost", "Product cost $", s.rawYesterday?.cogs], ["otherCosts", "Other costs $", s.rawYesterday?.otherMarketing]] as [string, string, number | undefined][]).map(([n, l, v]) => (
              <label key={n} className="text-xs text-slate-600">{l}
                <input name={n} inputMode="decimal" defaultValue={v ? Math.round(v) : ""} disabled={s.shopify && s.rawYesterday?.source === "shopify" && (n === "sales" || n === "orders")} className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
              </label>
            ))}
            <button className="btn-primary col-span-2 text-sm sm:col-span-5">Save yesterday</button>
          </form>
          {!s.shopify && <p className="mt-2 text-xs text-slate-500">Or <Link href="/dashboard/connect" className="underline">connect Shopify</Link> and this fills in by itself.</p>}
        </details>
      </div>

      <div className="space-y-4">
        <div className="card p-5" data-testid="today-target">
          <p className="text-sm font-medium text-slate-600">Today&apos;s target</p>
          <p className="text-3xl font-extrabold tabular-nums text-slate-900">{s.todayTarget.amount ? money(s.todayTarget.amount) : "—"}<span className="ml-1 text-base font-medium text-slate-500">in sales</span></p>
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
        <div className="card p-5" data-testid="grow-plan">
          <p className="font-hand text-xl text-[#5A50D6]">My plan to grow today</p>
          <ul className="mt-2 space-y-3">
            {tasks.map((t) => {
              const l = lessonLink(t.lesson);
              const open = canReadLesson(s.plan, t.lesson);
              const isDone = done.has(t.taskId);
              return (
                <li key={t.taskId} className="flex gap-3">
                  <form action={markDone}><input type="hidden" name="taskId" value={t.taskId} />
                    <button disabled={isDone} aria-label={`Mark "${t.title}" done`} className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full border-2 ${isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500"}`}><Check className="h-4 w-4" /></button>
                  </form>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${isDone ? "text-slate-400 line-through" : "text-slate-900"}`}>{t.title} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{STAGE_INFO[t.stage].name} · {t.minutes} min</span></p>
                    <p className="text-xs text-slate-600">{t.why}</p>
                    {t.rule === "numbers" ? null : l && (
                      <Link href={l.href} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline">{open ? "" : <Lock className="h-3 w-3" aria-hidden />}{open ? `Lesson: ${l.title}` : `Preview: ${l.title} (full lesson on Starter)`}</Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Ticking a task keeps your daily streak going.</p>
        </div>
        <Link href="/dashboard/numbers/history" className="block text-center text-sm font-semibold text-cyan-700 hover:underline">See week, month and year history →</Link>
      </div>
    </section>
  );
}
