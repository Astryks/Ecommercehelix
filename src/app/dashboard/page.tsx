import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getAccount, getCompletions, getDays, getProfitSetup, getRawDays, getSettings, listApprovals } from "@/lib/repo";
import { track } from "@/lib/tracks";
import { dayProgress } from "@/lib/progress";
import { costRatios, summarise, stanceFor } from "@/lib/today";
import { PLAN_RANK } from "@/lib/plans";
import { addDays, isoDay, prettyDay } from "@/lib/dates";
import { seasonTasksFor } from "@/lib/season-tasks";
import { waterfall } from "@/lib/profit-setup";
import { pickTodayTasks, type TodayTask } from "@/lib/today-tasks";
import { insightsFor } from "@/lib/signals";
import { topicFor } from "@/lib/daily-topic";
import { openCoach } from "@/lib/coach/server";
import { AgentScorecard } from "@/components/dashboard/AgentScorecard";
import { AgentTasks } from "@/components/dashboard/AgentTasks";
import { StoreBrainPanel } from "@/components/dashboard/StoreBrainPanel";
import { ProfitToday } from "@/components/dashboard/ProfitToday";
import { getShopify } from "@/lib/shopify/service";
import { markDone, doItForMe, quickUpdate } from "./actions";

/**
 * Today, agent-led (pivot Step 1): one scorecard strip with stance, at most 3
 * rule-based tasks, one learning card, the coach's greeting + tasks, and the
 * Store Brain. The other "what do I do today?" systems (curriculum roadmap,
 * quests, weekly plan, Monday review, seasonal alerts) live on their own
 * routes — linked under "More" below — and no longer compete on this screen.
 * Tasks come from the existing rule-based pickTodayTasks / diagnosis, never a
 * new LLM call. Do-it-for-me routes into /dashboard/approvals as a paused
 * draft or checklist; nothing here changes a live budget.
 */
export default async function Today({ searchParams }: PageProps<"/dashboard">) {
  const sp = await searchParams;
  const u = await requireUser();
  const [acct, completions, approvals, live, days, settings, rawDays, setupRow] = await Promise.all([
    getAccount(u.id), getCompletions(u.id), listApprovals(u.id), insightsFor(u.id), getDays(u.id), getSettings(u.id), getRawDays(u.id), getProfitSetup(u.id),
  ]);
  const today = isoDay();
  const yesterday = addDays(today, -1);
  const done = new Set(completions.map((c) => c.taskId));
  const pending = new Set(approvals.filter((a) => a.status === "pending").map((a) => a.taskId));
  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  const summary = summarise(days, yesterday, settings);
  const stance = stanceFor(days, today, settings.targetMerPct);
  const yRow = rawDays.find((d) => d.date === yesterday);
  const r = costRatios(rawDays);
  const estimatePct = Math.round((r.cogs + r.fees + r.discounts + r.refunds) * 100);

  const T = track(acct.track);
  const { days: DAYS, stageTier: STAGE_TIER, taskId: dayTaskId } = T;
  const unlocked = (stage: number) => PLAN_RANK[acct.plan] >= PLAN_RANK[STAGE_TIER[stage]];
  const prog = dayProgress({
    days: DAYS,
    doneIds: done,
    completedToday: completions.filter((c) => c.completedOn === today).map((c) => c.taskId),
    ahead: sp.ahead === "1",
    unlocked,
    taskId: dayTaskId,
  });
  const current = prog.current ?? null;
  const currentLocked = current ? !unlocked(current.stage) : false;
  const insights = live.insights.filter((i) => !done.has(`insight-${i.id}`)).slice(0, 2);
  const dayTask: TodayTask | null = current && !currentLocked
    ? { id: "day", title: current.title, why: current.steps[0] ?? current.topic, minutes: current.minutes, guideHref: `/learn/${current.learn.slug}#${current.learn.anchor}`, taskId: dayTaskId(current.day), kind: "day" }
    : null;
  const ins0 = insights[0];
  const insightTask: TodayTask | null = ins0
    ? { id: "insight", title: ins0.title, why: ins0.why, minutes: 10, guideHref: `/learn/${ins0.learn.slug}${ins0.learn.anchor ? `#${ins0.learn.anchor}` : ""}`, taskId: `insight-${ins0.id}`, kind: "insight" }
    : null;
  const wf = setupRow ? waterfall(setupRow) : null;
  const recent = rawDays.filter((d) => !d.example && d.date >= addDays(today, -28));
  const dailyUnits = recent.length ? recent.reduce((a, d) => a + d.units, 0) / 28 : 0;
  const seasonTasks: TodayTask[] = seasonTasksFor(today, acct.country, done, { profitPerOrder: wf?.beforeMarketing, price: setupRow?.price, dailyUnits, storeUrl: acct.storeUrl })
    .map((t) => ({ id: t.taskId, title: (t.catchUp ? "Catch up: " : "") + t.title, why: `${t.why} ${t.steps[0]}`, minutes: 15, guideHref: t.guideHref, taskId: t.taskId, kind: "season" as const }));
  const tasks = pickTodayTasks({ today, numbersMissingYesterday: !yRow, season: seasonTasks, day: dayTask, insight: insightTask, done });

  // Coach greeting + daily tasks + memory, rule-based (no model call). If the
  // coach store is unavailable, Today still renders — the widget stays usable.
  const coach = await openCoach(u.id).catch(() => null);
  const topic = topicFor(today);
  const learning = current && !currentLocked
    ? { title: current.title, why: current.lesson, minutes: current.minutes, href: `/learn/${current.learn.slug}#${current.learn.anchor}`, label: "Read the lesson" }
    : { title: topic.title, why: topic.why, minutes: 5, href: topic.href, label: "Read the lesson" };

  const shopConn = await getShopify(u.id);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <p className="text-sm text-slate-500">{prettyDay(today)}</p>
        <h1 className="page-title">Today</h1>
        <p className="page-lead">Your coach has checked the store. Here is the one number, the next steps, and what is waiting for your OK.</p>
      </header>

      {pendingCount > 0 && (
        <p className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
          <strong>{pendingCount} thing{pendingCount === 1 ? "" : "s"} waiting for your OK.</strong>{" "}
          <Link href="/dashboard/approvals" className="font-semibold underline">Review and approve</Link> — nothing goes live until you do.
        </p>
      )}

      {!shopConn && (
        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[#5A50D6]/30 bg-[#5A50D6]/5 p-4" data-testid="connect-prompt">
          <p className="flex-1 text-sm text-slate-800"><span className="font-hand text-lg text-[#5A50D6]">Save time every day.</span> Connect Shopify and your ad accounts, and your daily numbers fill in by themselves.</p>
          <Link href="/dashboard/connect" className="btn-primary text-sm">Connect your tools</Link>
        </section>
      )}

      <AgentScorecard s={summary} date={yesterday} stance={stance} />

      <section aria-label="Update yesterday">
        <ProfitToday s={summary} date={yesterday} metaSynced={false} estimatePct={estimatePct} action={quickUpdate}
          prefill={{ revenue: yRow?.revenue ?? 0, orders: yRow?.orders ?? 0, adMeta: yRow?.adMeta ?? 0, adGoogle: yRow?.adGoogle ?? 0 }} />
      </section>

      {coach && (
        <section aria-labelledby="coach-h" className="card p-5 sm:p-6" data-testid="coach-greeting">
          <h2 id="coach-h" className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your coach</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{coach.greeting}</p>
          {coach.tasks.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {coach.tasks.map((t) => (
                <li key={t.id}>
                  <Link href={t.href} className={`font-medium underline-offset-2 hover:underline ${t.done ? "text-slate-400 line-through" : "text-slate-900"}`}>{t.title}</Link>
                  <span className="block text-xs text-slate-500">{t.why}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <AgentTasks tasks={tasks} done={done} doneAction={markDone} doAction={doItForMe} pending={pending} />

      <section aria-labelledby="learn-h" className="card p-5 sm:p-6" data-testid="learning-card">
        <h2 id="learn-h" className="text-sm font-semibold uppercase tracking-wide text-slate-500">One thing to learn · {learning.minutes} min</h2>
        <p className="mt-2 text-lg font-semibold text-slate-900">{learning.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{learning.why}</p>
        <Link href={learning.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:underline">{learning.label} →</Link>
      </section>

      <StoreBrainPanel initialFacts={coach?.facts ?? []} />

      <nav aria-label="More" className="card p-4 text-sm">
        <p className="font-semibold text-slate-700">More, when you want it</p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/dashboard/learn" className="text-cyan-700 underline">Full course</Link>
          <Link href="/dashboard/insights" className="text-cyan-700 underline">Insights</Link>
          <Link href="/dashboard/goals" className="text-cyan-700 underline">Goals</Link>
          <Link href="/dashboard/plan" className="text-cyan-700 underline">Your plan</Link>
          <Link href="/dashboard/stock" className="text-cyan-700 underline">Stock</Link>
          <Link href="/dashboard/calendar" className="text-cyan-700 underline">Calendar</Link>
          <Link href="/dashboard/approvals" className="text-cyan-700 underline">Waiting for your OK</Link>
        </p>
      </nav>
    </div>
  );
}
