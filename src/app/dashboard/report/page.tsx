import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { WEEKLY_REPORT as R } from "@/lib/seed/report";
import { requireUser } from "@/lib/session";
import { getAccount, getCompletions, getSeasonPlans } from "@/lib/repo";
import { nextTasks, seasonalAlerts } from "@/lib/seasons";
import { buildNudge } from "@/lib/nudges";
import { appUrl } from "@/lib/meta/config";
import { isoDay, prettyDay } from "@/lib/dates";

export default async function Report() {
  const u = await requireUser();
  const [plans, comps, acct] = await Promise.all([getSeasonPlans(u.id), getCompletions(u.id), getAccount(u.id)]);
  const today = isoDay();
  const alerts = seasonalAlerts(today, acct.country);
  const done = new Set(comps.map((c) => c.taskId));
  const top = alerts[0];
  const planAdded = Boolean(top && plans.some((p) => p.planKey === top.key));
  const nudge = top ? buildNudge(top, { name: u.name ?? "", planAdded, done, baseUrl: appUrl() }) : null;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Weekly report</h1>

      {top && (
        <section aria-labelledby="coming-h" className="mt-6 overflow-hidden rounded-2xl border border-orange-200 bg-white">
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-6 py-4 text-slate-950">
            <h2 id="coming-h" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><CalendarClock className="h-4 w-4" aria-hidden /> Coming up (live, based on today&apos;s date)</h2>
            <p className="mt-2 text-lg font-bold leading-snug">{top.headline}</p>
          </div>
          <div className="p-6 text-sm text-slate-700">
            <p>{top.why}</p>
            <p className="mt-3 font-semibold text-slate-900">{planAdded ? "Your next prep steps" : "What the prep plan starts with"}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {nextTasks(top, done, 3).map((t) => <li key={t.taskId}>{t.title} <span className="text-slate-500">({t.overdue ? "due now" : "due " + prettyDay(t.due)})</span></li>)}
            </ul>
            {alerts.length > 1 && <p className="mt-3"><strong>Also coming up:</strong> {alerts.slice(1).map((a) => `${a.name} (${prettyDay(a.date)})`).join(", ")}</p>}
            <Link href="/dashboard#season" className="btn-primary mt-4 inline-flex px-4 py-2 text-sm">{planAdded ? "Open your prep plan" : "Add the prep plan on Today"}</Link>
            {nudge && (
              <details className="mt-4 rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer font-medium text-slate-700">Preview the Monday email and push reminder</summary>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Email subject</p>
                <p className="font-medium">{nudge.email.subject}</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-[13px] leading-6">{nudge.email.text}</pre>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Push notification</p>
                <p><strong>{nudge.push.title}</strong>: {nudge.push.body}</p>
                <p className="mt-2 text-xs text-slate-500">Sending is switched off in this preview. It turns on once email and push are connected.</p>
              </details>
            )}
          </div>
        </section>
      )}

      <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-amber-700">Example report</p>
      <p className="mt-1 text-slate-600">{R.week}</p>
      <p className="mt-6 rounded-2xl bg-ink p-6 text-lg font-medium leading-8 text-white">{R.headline}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {R.scorecard.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold">{s.value}</p>
            <p className={`text-xs font-medium ${s.change.startsWith("-") && s.label !== "MER" ? "text-rose-600" : "text-emerald-600"}`}>{s.change}</p>
          </div>
        ))}
      </div>
      {[
        ["What Helix did", R.did],
        ["What we learned", R.learned],
        ["Next week", R.next],
      ].map(([h, items]) => (
        <section key={h as string} className="card mt-6 p-6">
          <h2 className="font-semibold">{h as string}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {(items as string[]).map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>
      ))}
      <p className="mt-6 text-sm text-slate-600"><strong>One question for you:</strong> {R.question}</p>
    </div>
  );
}
