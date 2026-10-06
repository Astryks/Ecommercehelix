import Link from "next/link";
import { ArrowRight, BookOpen, Book, Boxes, Briefcase, CalendarClock, Check, CreditCard, Globe, Landmark, Lock, Megaphone, Receipt, Send, ShieldAlert, Truck, Undo2, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getCompletions } from "@/lib/repo";
import { isoDay, prettyDay } from "@/lib/dates";
import { countdownText } from "@/lib/seasons";
import { THRESHOLDS, THRESHOLDS_CHECKED, TOPICS, adminDates, type Topic } from "@/lib/business";
import { lessonLink } from "@/lib/lesson-links";
import { markDone } from "../actions";

export const metadata = { title: "Run your business" };

const ICONS: Record<Topic["icon"], typeof Truck> = {
  truck: Truck, send: Send, undo: Undo2, boxes: Boxes, card: CreditCard, "shield-alert": ShieldAlert, lock: Lock,
  megaphone: Megaphone, receipt: Receipt, landmark: Landmark, globe: Globe, book: Book, users: Users,
};

export default async function RunYourBusiness() {
  const u = await requireUser();
  const [acct, comps] = await Promise.all([getAccount(u.id), getCompletions(u.id)]);
  const done = new Set(comps.map((c) => c.taskId));
  const today = isoDay();
  const coming = adminDates(today, acct.country, 120).slice(0, 6);
  const countryName = acct.country === "US" ? "United States" : "Australia";

  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow">Operations, money and admin</p>
      <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight"><Briefcase className="h-7 w-7 text-cyan-600" aria-hidden /> Run your business</h1>
      <p className="mt-1 max-w-3xl text-slate-600">The 13 things store owners ask about most once orders start coming in: shipping, returns, payments, chargebacks, account safety, tax and books, team and money. Each card links to short lessons with plain steps for Australia and the US.</p>
      <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>General information, not tax or legal advice.</strong> Check with a registered tax agent or accountant before you act. Rules change; every number below links to the official source.
      </p>

      <section aria-labelledby="coming-h" className="card mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="coming-h" className="flex items-center gap-2 text-lg font-semibold"><CalendarClock className="h-5 w-5 text-orange-600" aria-hidden /> Coming up ({countryName})</h2>
          <Link href="/dashboard/calendar" className="text-sm font-semibold text-cyan-700 hover:underline">Full calendar <ArrowRight className="inline h-4 w-4" aria-hidden /></Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {coming.map((a) => {
            const l = lessonLink(a.lesson);
            const isDone = done.has(a.taskId);
            return (
              <li key={a.key} className="flex flex-wrap items-center gap-3 py-3">
                <div className="flex w-14 flex-none flex-col items-center rounded-lg bg-slate-900 py-1.5 text-white">
                  <span className="text-[10px] font-semibold uppercase">{new Date(a.date + "T12:00:00Z").toLocaleDateString("en-AU", { month: "short", timeZone: "UTC" })}</span>
                  <span className="text-lg font-bold leading-none">{Number(a.date.slice(8))}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${isDone ? "text-slate-400 line-through" : "text-slate-900"}`}>{a.name}</p>
                  <p className="text-sm text-slate-600">{a.note}</p>
                  {l && <Link href={l.href} className="text-xs font-semibold text-cyan-700 underline">Lesson {a.lesson}: {l.title}</Link>}
                </div>
                <div className="flex flex-none items-center gap-3">
                  <span className={`text-sm font-bold ${a.daysTo <= 14 ? "text-rose-600" : a.daysTo <= 30 ? "text-orange-600" : "text-slate-700"}`}>{countdownText(a.daysTo)}</span>
                  {isDone ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><Check className="h-4 w-4" aria-hidden /> Done</span> : (
                    <form action={markDone}><input type="hidden" name="taskId" value={a.taskId} /><button className="btn-ghost text-xs">Mark done</button></form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-slate-500">Helix shows each of these on Today when it is close (for example, BAS from 4 weeks before). Change country in <Link href="/dashboard/settings" className="underline">Settings</Link>.</p>
      </section>

      <h2 className="mt-10 text-xl font-semibold">The 13 topics</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TOPICS.map((t, i) => {
          const Icon = ICONS[t.icon];
          return (
            <article key={t.id} id={t.id} className="card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><Icon className="h-5 w-5" aria-hidden /></span>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{String(i + 1).padStart(2, "0")}{t.tax && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 ring-1 ring-amber-200">Not advice</span>}</p>
                  <h3 className="font-semibold text-slate-900">{t.title}</h3>
                </div>
              </div>
              <p className="mt-2 flex-1 text-sm text-slate-600">{t.summary}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {t.lessons.map((ref) => {
                  const l = lessonLink(ref);
                  return l ? <li key={ref}><Link href={l.href} className="flex gap-1.5 text-cyan-700 hover:underline"><BookOpen className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden /><span><strong>{ref}</strong> {l.title}</span></Link></li> : null;
                })}
              </ul>
              {t.tool && <Link href={t.tool.href} className="btn-accent mt-4 self-start text-sm">{t.tool.label}</Link>}
            </article>
          );
        })}
      </div>

      <section aria-labelledby="numbers-h" className="card mt-10 overflow-hidden">
        <div className="p-5">
          <h2 id="numbers-h" className="text-lg font-semibold">Key thresholds and dates</h2>
          <p className="text-sm text-slate-600">Checked against the official sources on {prettyDay(THRESHOLDS_CHECKED)}. Confirm the current rule before you act.</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-2">Where</th><th className="px-5 py-2">Rule</th><th className="px-5 py-2">Source</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {THRESHOLDS.map((r) => (
              <tr key={r.rule}><td className="whitespace-nowrap px-5 py-2.5 font-semibold text-slate-800">{r.where}</td><td className="px-5 py-2.5 text-slate-700">{r.rule}</td>
                <td className="px-5 py-2.5"><a href={r.source.url} target="_blank" rel="noreferrer" className="text-cyan-700 underline">{r.source.label}</a></td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
