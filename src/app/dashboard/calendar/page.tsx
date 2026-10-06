import Link from "next/link";
import { BellRing, CalendarDays, Download, ExternalLink, ListPlus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getSeasonPlans } from "@/lib/repo";
import { COUNTRIES, countdownText, seasonalAlerts, toCountry, type Kind } from "@/lib/seasons";
import { calendarWithAdmin } from "@/lib/business";
import { lessonLink } from "@/lib/lesson-links";
import { isoDay, prettyDay } from "@/lib/dates";
import { appUrl } from "@/lib/meta/config";
import { BfcmCritical } from "@/components/BfcmPlan";

const KIND: Record<Kind, { label: string; chip: string }> = {
  sale: { label: "Sale", chip: "bg-rose-50 text-rose-700 ring-rose-200" },
  gifting: { label: "Gifting", chip: "bg-violet-50 text-violet-700 ring-violet-200" },
  seasonal: { label: "Seasonal", chip: "bg-sky-50 text-sky-700 ring-sky-200" },
  admin: { label: "Business admin", chip: "bg-slate-100 text-slate-700 ring-slate-300" },
  prep: { label: "Black Friday prep", chip: "bg-orange-50 text-orange-800 ring-orange-200" },
};
const monthName = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" });

export default async function CalendarPage({ searchParams }: PageProps<"/dashboard/calendar">) {
  const sp = await searchParams;
  const u = await requireUser();
  const [acct, plans] = await Promise.all([getAccount(u.id), getSeasonPlans(u.id)]);
  const country = sp.country ? toCountry(sp.country) : acct.country;
  const today = isoDay();
  const events = calendarWithAdmin(today, country, 365);
  const active = new Set(seasonalAlerts(today, country).map((a) => a.key));
  const added = new Set(plans.map((p) => p.planKey));
  const base = appUrl();
  const feed = `${base}/api/calendar?country=${country}`;
  const webcal = feed.replace(/^https?:\/\//, "webcal://");
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  const months = [...new Set(events.map((e) => e.date.slice(0, 7)))];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><CalendarDays className="h-7 w-7 text-cyan-600" aria-hidden /> Calendar</h1>
          <p className="mt-1 max-w-2xl text-slate-600">Every key sale and gifting date for the next 12 months, plus business admin dates like BAS, tax returns and security checks. Big dates come with a prep plan, and Helix warns you on Today before each one. Black Friday prep starts on 1 August, and each step is on its own date below.</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold" role="tablist" aria-label="Country">
          {COUNTRIES.map((c) => (
            <Link key={c.id} href={`/dashboard/calendar?country=${c.id}`} role="tab" aria-selected={country === c.id}
              className={`rounded-lg px-3 py-1.5 ${country === c.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{c.name}</Link>
          ))}
        </div>
      </div>

      <div className="mt-6"><BfcmCritical today={today} /></div>

      <div className="card mt-6 flex flex-wrap items-center gap-3 p-4 text-sm">
        <span className="font-semibold text-slate-800">Add these dates to your own calendar:</span>
        <a href={`/api/calendar?country=${country}&download=1`} className="btn-ghost"><Download className="h-4 w-4" aria-hidden /> Download .ics</a>
        <a href={google} target="_blank" rel="noreferrer" className="btn-ghost"><ExternalLink className="h-4 w-4" aria-hidden /> Subscribe in Google Calendar</a>
        <a href={webcal} className="btn-ghost"><BellRing className="h-4 w-4" aria-hidden /> Subscribe (Apple or Outlook)</a>
        <p className="w-full text-xs text-slate-500">The .ics file works in any calendar app. Subscribing keeps dates up to date automatically, and needs Helix running on a public web address (it will not work from a local test copy). Each big date also gets a &quot;Start prep&quot; reminder.</p>
      </div>

      <div className="mt-8 space-y-8">
        {months.map((m) => (
          <section key={m} aria-labelledby={`m-${m}`}>
            <h2 id={`m-${m}`} className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{monthName(m + "-01")}</h2>
            <ol className="mt-3 space-y-3">
              {events.filter((e) => e.date.startsWith(m)).map((e) => (
                <li key={e.key} className={`card flex gap-4 p-4 ${e.kind === "prep" ? "border-l-4 border-l-orange-400" : ""}`}>
                  <div className={`flex w-16 flex-none flex-col items-center justify-center rounded-xl py-2 text-white ${e.kind === "prep" ? "bg-cyan-700" : "bg-slate-900"}`}>
                    <span className="text-[11px] font-semibold uppercase">{new Date(e.date + "T12:00:00Z").toLocaleDateString("en-AU", { month: "short", timeZone: "UTC" })}</span>
                    <span className="text-2xl font-bold leading-none">{Number(e.date.slice(8))}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{e.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${KIND[e.kind].chip}`}>{KIND[e.kind].label}</span>
                      {e.approx && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">Approx. date</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{e.note}{e.approx ? ` ${e.approx}.` : ""}</p>
                    {e.planSteps ? (
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <ListPlus className="h-3.5 w-3.5 text-orange-600" aria-hidden />
                        {added.has(e.key) ? <Link href="/dashboard#season" className="font-semibold text-emerald-700 underline">Prep plan added. Open it on Today</Link>
                          : active.has(e.key) ? <Link href="/dashboard#season" className="font-semibold text-orange-700 underline">Prep plan ready ({e.planSteps} steps). Add it on Today</Link>
                          : <span className="text-slate-600">{e.planSteps}-step prep plan. Helix alerts you on Today from {prettyDay(e.prepFrom!)}.</span>}
                      </p>
                    ) : null}
                    {e.kind === "prep" && e.planKey && (
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <ListPlus className="h-3.5 w-3.5 text-orange-600" aria-hidden />
                        {added.has(e.planKey) ? <Link href="/dashboard#season" className="font-semibold text-emerald-700 underline">In your Black Friday prep plan on Today</Link>
                          : active.has(e.planKey) ? <Link href="/dashboard#season" className="font-semibold text-orange-700 underline">Part of the Black Friday prep plan. Add it on Today in one click</Link>
                          : <span className="text-slate-600">Part of the Black Friday prep plan. Helix adds it to Today from 1 August.</span>}
                      </p>
                    )}
                    {e.kind === "admin" && e.lesson && (() => {
                      const l = lessonLink(e.lesson);
                      return l ? <p className="mt-2 text-xs"><Link href={l.href} className="font-semibold text-cyan-700 underline">Lesson {e.lesson}: {l.title}</Link> <span className="text-slate-500">· General information, not tax or legal advice.</span></p> : null;
                    })()}
                  </div>
                  <div className="flex-none text-right">
                    <p className={`text-sm font-bold ${e.daysTo <= 14 ? "text-rose-600" : e.daysTo <= 60 ? "text-orange-600" : "text-slate-700"}`}>{countdownText(e.daysTo)}</p>
                    <p className="text-xs text-slate-500">{prettyDay(e.date)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <p className="mt-8 text-xs text-slate-500">Showing {COUNTRIES.find((c) => c.id === country)?.name} dates. Change your default country in <Link href="/dashboard/settings" className="underline">Settings</Link>.</p>
    </div>
  );
}
