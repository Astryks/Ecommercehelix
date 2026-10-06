import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Boxes, CalendarDays, Check, CheckCircle2, Clock, Flame, GraduationCap, Lock, Sparkles, Wand2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getCompletions, getDays, getRawDays, getSeasonPlans, getSettings, getStock, getSuppliers, listApprovals, streakFrom } from "@/lib/repo";
import { stockAlerts, stockRows } from "@/lib/stock";
import { countdownText, seasonalAlerts, upcomingEvents } from "@/lib/seasons";
import { SeasonalAlertCard } from "@/components/SeasonalBanner";
import { costRatios, money, summarise } from "@/lib/today";
import { taxLabel } from "@/lib/tax";
import { termsIn } from "@/lib/glossary";
import { guidesForDay } from "@/lib/guides";
import { ProfitToday } from "@/components/dashboard/ProfitToday";
import { getSnapshot } from "@/lib/meta/store";
import { AREA_STYLE } from "@/lib/seed/curriculum";
import { track } from "@/lib/tracks";
import { metricsFor, periodRanges } from "@/lib/analytics";
import { insightsFor } from "@/lib/signals";
import { dayProgress } from "@/lib/progress";
import { PLAN_RANK, planName } from "@/lib/plans";
import { addDays, isoDay, prettyDay } from "@/lib/dates";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { markDone, doItForMe, quickUpdate, addPrepPlan } from "./actions";

export default async function Today({ searchParams }: PageProps<"/dashboard">) {
  const sp = await searchParams;
  const u = await requireUser();
  const [acct, completions, approvals, live, days, settings, snap, plans, stockItems, suppliers] = await Promise.all([getAccount(u.id), getCompletions(u.id), listApprovals(u.id), insightsFor(u.id), getDays(u.id), getSettings(u.id), getSnapshot(u.id), getSeasonPlans(u.id), getStock(u.id), getSuppliers(u.id)]);
  const rawDays = await getRawDays(u.id);
  const today = isoDay();
  const stockAlertRows = stockAlerts(stockRows(stockItems, suppliers, today));
  const yesterday = addDays(today, -1);
  const summary = summarise(days, yesterday, settings);
  const yRow = rawDays.find((d) => d.date === yesterday);
  const r = costRatios(rawDays);
  const estimatePct = Math.round((r.cogs + r.fees + r.discounts + r.refunds) * 100);
  const done = new Set(completions.map((c) => c.taskId));
  const pending = new Set(approvals.filter((a) => a.status === "pending").map((a) => a.taskId));
  const T = track(acct.track);
  const { days: DAYS, stages: STAGES, stageTier: STAGE_TIER, taskId: dayTaskId } = T;
  const unlocked = (stage: number) => PLAN_RANK[acct.plan] >= PLAN_RANK[STAGE_TIER[stage]];

  const prog = dayProgress({
    days: DAYS,
    doneIds: done,
    completedToday: completions.filter((c) => c.completedOn === today).map((c) => c.taskId),
    ahead: sp.ahead === "1",
    unlocked,
    taskId: dayTaskId,
  });
  const nextDay = prog.nextDay;
  const current = prog.current ?? null;
  const currentLocked = current ? !unlocked(current.stage) : false;
  const insights = live.insights.filter((i) => !done.has(`insight-${i.id}`)).slice(0, 2);

  const streak = streakFrom(completions);
  const daysDone = DAYS.filter((d) => done.has(dayTaskId(d.day))).length;
  const score = Math.min(100, 40 + 3 * completions.length + 2 * streak);
  const totalMinutes = (current?.minutes ?? 0) + insights.length * 10;

  const status = prog.status;
  // Seasonal alerts from the real date: the most urgent one, plus any other active plan the user added.
  const alerts = seasonalAlerts(today, acct.country);
  const upcoming = upcomingEvents(today, acct.country, 200).slice(0, 6);
  const wk = periodRanges("week", days.at(-1)?.date ?? yesterday);
  const w = metricsFor(days, wk.cur, settings);
  const wPrev = metricsFor(days, wk.prev, settings);
  const wChange = wPrev.contribution ? Math.round(((w.contribution - wPrev.contribution) / Math.abs(wPrev.contribution)) * 100) : null;
  const planKeys = new Set(plans.map((p) => p.planKey));
  const shownAlerts = alerts.filter((a, i) => i === 0 || planKeys.has(a.key));
  const otherAlerts = alerts.filter((a) => !shownAlerts.includes(a));
  const currentStage = nextDay?.stage ?? STAGES.length;

  return (
    <div className="mx-auto max-w-7xl">
      {sp.welcome && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Welcome to Helix{acct.storeUrl ? ` for ${acct.storeUrl}` : ""}. Your first audit is queued (live crawling is coming soon; Insights show example findings for now). Start with Day 1 below.
        </div>
      )}
      {!acct.onboarded && !sp.welcome && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
          <span><strong>New here?</strong> Tell Helix if you are just starting or already growing, and where your customers live. It takes a minute and picks the right lessons and sale dates for you.</span>
          <Link href="/start" className="btn-primary px-4 py-2 text-sm">Pick your track <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      )}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">{prettyDay(today)}
            <Link href="/dashboard/settings" className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${T.id === "starting" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-violet-50 text-violet-700 ring-violet-200"}`}>Track: {T.name} · change</Link>
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Good to see you{u.name ? `, ${u.name}` : ""}</h1>
          <p className="mt-1 text-slate-600">Update yesterday, see your profit, then do one small thing to grow it. About {totalMinutes + 1} minutes.</p>
        </div>
        <div className="flex gap-3">
          <div className="card flex items-center gap-3 px-4 py-3">
            <Flame className="h-6 w-6 text-orange-500" aria-hidden />
            <div><p className="text-xs text-slate-500">Streak</p><p className="text-xl font-bold">{streak} day{streak === 1 ? "" : "s"}</p></div>
          </div>
          <div className="card flex items-center gap-3 px-4 py-3">
            <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e6dfd3" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#cs)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(score / 100) * 97.4} 97.4`} />
              <defs><linearGradient id="cs"><stop offset="0" stopColor="#448b6f" /><stop offset="1" stopColor="#d9772b" /></linearGradient></defs>
            </svg>
            <div><p className="text-xs text-slate-500">Compound score</p><p className="text-xl font-bold">{score}<span className="text-sm font-medium text-slate-400">/100</span></p></div>
          </div>
        </div>
      </header>

      {shownAlerts.map((a, i) => (
        <div key={a.key} className="mt-6">
          <SeasonalAlertCard alert={a} others={i === shownAlerts.length - 1 ? otherAlerts : []} planAdded={planKeys.has(a.key)} done={done} addAction={addPrepPlan} doneAction={markDone} />
        </div>
      ))}

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-h" className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 id="upcoming-h" className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarDays className="h-4 w-4" aria-hidden /> Upcoming key dates ({acct.country === "US" ? "United States" : "Australia"})</h2>
            <Link href="/dashboard/calendar" className="text-sm font-medium text-cyan-700 hover:underline">Full calendar</Link>
          </div>
          <ol className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {upcoming.map((e) => (
              <li key={e.key} className="card px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-slate-900" title={e.name}>{e.name}</p>
                <p className="text-xs text-slate-500">{prettyDay(e.date)}{e.approx ? " (approx.)" : ""}</p>
                <p className={`mt-1 text-xs font-bold ${e.daysTo <= 14 ? "text-rose-600" : e.daysTo <= 60 ? "text-orange-600" : "text-slate-600"}`}>{countdownText(e.daysTo)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-6">
        <ProfitToday s={summary} date={yesterday} metaSynced={Boolean(snap && yRow && yRow.adMeta > 0)} estimatePct={estimatePct} taxNote={taxLabel(acct.salesTaxMode, acct.country)} action={quickUpdate}
          prefill={{ revenue: yRow?.revenue ?? 0, orders: yRow?.orders ?? 0, adMeta: yRow?.adMeta ?? 0, adGoogle: yRow?.adGoogle ?? 0 }} />
      </div>

      <Link href="/dashboard/analytics" className="card mt-4 flex flex-wrap items-center justify-between gap-4 p-4 transition hover:ring-2 hover:ring-cyan-200">
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><BarChart3 className="h-5 w-5" aria-hidden /></span>
          <span>
            <span className="block font-semibold text-slate-900">Your Dashboard: last 7 days</span>
            <span className="block text-sm text-slate-600">
              Revenue {money(w.netRevenue)} · profit {money(w.contribution)}{wChange !== null ? ` (${wChange >= 0 ? "up" : "down"} ${Math.abs(wChange)}% on the week before)` : ""} · MER {w.merPct.toFixed(1)}%
            </span>
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">See weekly, monthly and yearly charts <ArrowRight className="h-4 w-4" aria-hidden /></span>
      </Link>


      {stockAlertRows.length > 0 && (
        <Link href="/dashboard/stock" className="card mt-4 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-rose-500 p-4 transition hover:ring-2 hover:ring-cyan-200">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><Boxes className="h-5 w-5" aria-hidden /></span>
            <span>
              <span className="block font-semibold text-slate-900">Stock: {stockAlertRows.length} product{stockAlertRows.length === 1 ? "" : "s"} to reorder{stockItems.some((i) => i.example) ? " (example data)" : ""}</span>
              <span className="block text-sm text-slate-600">
                {stockAlertRows.slice(0, 2).map((r) => r.status === "out" ? `${r.name} is out of stock` : r.daysUntilOrder !== null && r.daysUntilOrder <= 0 ? `${r.name}: order today (${r.daysLeft} days of stock left)` : `${r.name}: order within ${r.daysUntilOrder} days`).join(" · ")}
              </span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">See reorder dates <ArrowRight className="h-4 w-4" aria-hidden /></span>
        </Link>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section aria-labelledby="today-h" className="space-y-5">
          <h2 id="today-h" className="sr-only">Today</h2>

          {current ? (
            <article className="card overflow-hidden">
              <div className="helix-glow px-6 py-5 text-white">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 font-bold">Day {current.day} of {DAYS.length}</span>
                  <span className="text-slate-300">Stage {current.stage}: {current.stageName}</span>
                  <span className="flex items-center gap-1 text-slate-300"><Clock className="h-3.5 w-3.5" aria-hidden /> {current.minutes} min</span>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Today&apos;s topic: {current.topic}</p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight">{current.title}</h3>
              </div>
              <div className="p-6">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><GraduationCap className="h-4 w-4" aria-hidden /> Why it matters</p>
                <p className="mt-2 text-base leading-7 text-slate-700">{current.lesson}</p>
                <p className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  How to do it <span className={`rounded-full px-2 py-0.5 normal-case ring-1 ${AREA_STYLE[current.area].chip}`}>{AREA_STYLE[current.area].label}</span>
                </p>
                <ol className="mt-2 space-y-2.5">
                  {current.steps.map((s, i) => (
                    <li key={s} className="flex gap-3 text-[15px] leading-6 text-slate-800">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{i + 1}</span>{s}
                    </li>
                  ))}
                </ol>
                {guidesForDay(current.day, T.id).length > 0 && (
                  <details className="mt-5 rounded-xl border border-slate-200 p-4 text-sm" open={guidesForDay(current.day, T.id).length === 1}>
                    <summary className="cursor-pointer font-semibold text-slate-700">Show me where to click ({guidesForDay(current.day, T.id).length} drawing{guidesForDay(current.day, T.id).length === 1 ? "" : "s"})</summary>
                    <div className="mt-3 space-y-5">
                      {guidesForDay(current.day, T.id).map((g, i) => (
                        <figure key={g.file}>
                          <a href={`/guides/${g.file}.svg`} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/guides/${g.file}.svg`} alt={g.title} width={1200} height={700} loading="lazy" className="w-full rounded-lg border border-slate-200" />
                          </a>
                          <figcaption className="mt-1.5 text-xs text-slate-500">
                            Step {i + 1}: {g.title}. A drawing, not a real screenshot; your screen may look a little different.
                            {g.help && <> Official help: <a href={g.help.url} target="_blank" rel="noreferrer" className="text-cyan-700 underline">{g.help.label}</a></>}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </details>
                )}
                {current.watch && (
                  <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <strong>See the effect:</strong> keep updating yesterday&apos;s numbers each morning. Over the next 7 days, watch <strong>{current.watch}</strong>.
                  </p>
                )}
                {(() => {
                  const words = termsIn(`${current.title} ${current.lesson} ${current.steps.join(" ")}`, 4);
                  return words.length ? (
                    <details className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                      <summary className="cursor-pointer font-semibold text-slate-700">Words to know ({words.map((w) => w.term).join(", ")})</summary>
                      <dl className="mt-2 space-y-1.5">{words.map((w) => <div key={w.term}><dt className="inline font-semibold">{w.term}: </dt><dd className="inline text-slate-600">{w.means}</dd></div>)}</dl>
                    </details>
                  ) : null;
                })()}
                <Link href={`/learn/${current.learn.slug}#${current.learn.anchor}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:underline">
                  <BookOpen className="h-4 w-4" aria-hidden /> Want more detail? Read the lesson: {current.learn.label}
                </Link>
                {currentLocked ? (
                  <div className="mt-5 rounded-xl bg-violet-50 p-4 text-sm text-violet-900">
                    Stage {current.stage} of the guided programme is part of the {planName(STAGE_TIER[current.stage])} plan. The lesson stays free in Learn.
                    <Link href="/dashboard/billing" className="btn-primary mt-3 w-full sm:w-auto">Unlock Stage {current.stage}</Link>
                  </div>
                ) : (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    {current.doIt && <p className="mb-3 text-sm text-slate-700"><strong>Want me to do it for you?</strong> {current.doIt.label}. Nothing changes until you approve it.</p>}
                    <div className="flex flex-wrap items-center gap-3">
                    {current.doIt ? (
                      pending.has(dayTaskId(current.day)) ? (
                        <Link href="/dashboard/approvals" className="btn-ghost"><Sparkles className="h-4 w-4 text-violet-600" aria-hidden /> Waiting for your approval</Link>
                      ) : (
                        <form action={doItForMe}>
                          <input type="hidden" name="taskId" value={dayTaskId(current.day)} />
                          <button className="btn-dark">
                            {PLAN_RANK[acct.plan] >= PLAN_RANK[current.doIt.tier] ? <Wand2 className="h-4 w-4" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
                            Yes, do it for me{PLAN_RANK[acct.plan] >= PLAN_RANK[current.doIt.tier] ? "" : ` · ${planName(current.doIt.tier)}`}
                          </button>
                        </form>
                      )
                    ) : (
                      <span className="text-xs text-slate-500">This one is quick to do yourself. You learn the most by doing it.</span>
                    )}
                    <form action={markDone}>
                      <input type="hidden" name="taskId" value={dayTaskId(current.day)} />
                      <button className="btn-ghost"><Check className="h-4 w-4 text-emerald-600" aria-hidden /> {current.doIt ? "I did it myself" : "Mark done"}</button>
                    </form>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ) : (
            <article className="card p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" aria-hidden /> {nextDay ? "Today's lesson is done. Small steps, compounding." : `You finished the ${T.name} track.`}</p>
              {!nextDay && T.id === "starting" && (
                <p className="mt-2 text-sm text-slate-600">Getting regular sales now? Switch to the <strong>Growing</strong> track for profit tracking, scaling, retention and Black Friday. <Link className="text-cyan-700 underline" href="/dashboard/settings">Switch in Settings</Link></p>
              )}
              {nextDay && (
                <p className="mt-2 text-sm text-slate-600">
                  Tomorrow: <strong>Day {nextDay.day}: {nextDay.title}</strong>. <Link className="text-cyan-700 underline" href="/dashboard?ahead=1">Start it now instead</Link>
                </p>
              )}
            </article>
          )}

          {insights.map((ins) => (
            <InsightCard key={ins.id} ins={ins} plan={acct.plan} pending={pending.has(`insight-${ins.id}`)} compact />
          ))}
          <Link href="/dashboard/insights" className="block text-center text-sm font-medium text-cyan-700 hover:underline">See all insights from your latest audit</Link>
        </section>

        <aside aria-labelledby="road-h" className="xl:sticky xl:top-8 xl:self-start">
          <div className="card p-5">
            <div className="flex items-baseline justify-between">
              <h2 id="road-h" className="font-semibold">{T.id === "starting" ? "Just starting roadmap" : "Your growth roadmap"}</h2>
              <span className="text-xs text-slate-500">{daysDone}/{DAYS.length} days</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-cyan-500" style={{ width: `${(daysDone / DAYS.length) * 100}%` }} /></div>
            <ol className="mt-5 space-y-5">
              {STAGES.map((st) => {
                const days = DAYS.filter((d) => d.stage === st.id);
                const stDone = days.every((d) => done.has(dayTaskId(d.day)));
                const locked = !unlocked(st.id);
                const expanded = st.id === currentStage;
                return (
                  <li key={st.id}>
                    <p className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      <span>Stage {st.id} · {st.range}</span>
                      <span className={stDone ? "text-emerald-600" : locked ? "" : expanded ? "text-cyan-600" : ""}>{stDone ? "done" : locked ? `${planName(STAGE_TIER[st.id])} plan` : expanded ? "in progress" : "next"}</span>
                    </p>
                    <p className={`text-sm font-semibold ${locked ? "text-slate-400" : "text-slate-900"}`}>{locked && <Lock className="mr-1 inline h-3 w-3" aria-hidden />}{st.name}</p>
                    {expanded && (
                      <ol className="relative mt-3 space-y-3 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-slate-200">
                        {days.map((d) => {
                          const s = status(d);
                          return (
                            <li key={d.day} className="relative flex gap-3">
                              <span className={`relative z-10 flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold ring-4 ring-white ${
                                s === "done" ? "bg-emerald-500 text-white" : s === "today" || s === "tomorrow" ? "bg-cyan-500 text-white" : s === "locked" ? "bg-slate-200 text-slate-500" : "border border-slate-300 bg-white text-slate-500"}`}>
                                {s === "done" ? <Check className="h-3.5 w-3.5" aria-hidden /> : s === "locked" ? <Lock className="h-3 w-3" aria-hidden /> : d.day}
                              </span>
                              <div className={s === "locked" ? "opacity-60" : ""}>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Day {d.day} · <span className={s === "today" || s === "tomorrow" ? "text-cyan-600" : s === "done" ? "text-emerald-600" : ""}>{s === "today" ? "today" : s === "tomorrow" ? "up next (tomorrow)" : s}</span></p>
                                <p className="text-sm leading-5 text-slate-800">{d.title}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ol>
            {STAGES.some((st) => !unlocked(st.id)) && <Link href="/dashboard/billing" className="btn-primary mt-5 w-full">Unlock the full roadmap</Link>}
          </div>
        </aside>
      </div>
    </div>
  );
}
