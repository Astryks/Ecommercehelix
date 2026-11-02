import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SeminarView } from "@/components/seminars/SeminarView";
import { pageMeta } from "@/lib/seo";
import { seminarForDate, schedule, todayInSydney, EPOCH } from "@/lib/seminars/rotation";
import { seminarById, SEMINARS } from "@/lib/seminars/curriculum";
import { purchasedIds } from "@/lib/seminars/access";
import { addDays, prettyDay } from "@/lib/dates";
import { daysFrom } from "@/lib/season-calendar";

export const dynamic = "force-dynamic"; // "today" is worked out per request in Sydney time, so it switches at midnight by itself
export const metadata: Metadata = pageMeta({ title: "Daily Seminar: a new 15-20 minute e-commerce seminar every day", description: "A fresh Helix seminar every day: 3-4 related e-commerce ideas in 15-20 minutes. US$1 each, yours to keep.", path: "/seminars" });

export default async function DailySeminar() {
  const today = todayInSydney();
  const pick = seminarForDate(today);
  const owned = await purchasedIds();
  const next = schedule(addDays(today, 1), 3);
  const back = Math.min(60, Math.max(0, daysFrom(EPOCH, today)));
  const past = schedule(addDays(today, -back), back).reverse();
  const mine = [...owned].map(seminarById).filter((s): s is NonNullable<typeof s> => Boolean(s));
  return (
    <>
      <SiteHeader dark={false} />
      <main className="mx-auto w-full max-w-5xl px-5 pt-page pb-section">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Daily Seminar · {prettyDay(today)} (Sydney)</p>
        <h1 className="mt-stack text-4xl text-slate-900 sm:text-5xl">Today&rsquo;s <span className="grad-text">seminar</span></h1>
        <p className="mt-lead max-w-2xl text-slate-600">A new 15-20 minute seminar every day, clubbing a few related ideas from the Helix course. US$1 each, yours to rewatch any time. {SEMINARS.length} seminars in the library, shuffled so every day feels fresh.</p>
        {pick.event && <p className="mt-4 inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">Getting ready for {pick.event.name} ({prettyDay(pick.event.start)})</p>}
        <SeminarView s={pick.seminar} owned={owned.has(pick.seminar.id)} />

        <section className="mt-12" aria-labelledby="next-h">
          <h2 id="next-h" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Next up</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {next.map((p) => (
              <li key={p.date} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">{prettyDay(p.date)}{p.event ? ` · ${p.event.name}` : ""}</p>
                <p className="mt-1 font-medium text-slate-900">{p.seminar.title}</p>
                <p className="mt-1 text-xs text-slate-500">{p.seminar.concepts.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby="mine-h">
          <h2 id="mine-h" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Your seminars</h2>
          {mine.length ? (
            <ul className="mt-3 space-y-2">{mine.map((s) => <li key={s.id}><Link className="text-cyan-800 underline" href={`/seminars/${s.id}`}>{s.title}</Link> <span className="text-sm text-slate-500">· {s.minutes} min</span></li>)}</ul>
          ) : <p className="mt-3 text-sm text-slate-500">Seminars you buy appear here and stay yours, even after they leave the daily slot.</p>}
        </section>

        {past.length > 0 && (
          <section className="mt-12" aria-labelledby="past-h">
            <h2 id="past-h" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Past seminars</h2>
            <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {past.map((p) => (
                <li key={p.date} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span><span className="text-slate-500">{prettyDay(p.date)}</span> · {owned.has(p.seminar.id) ? <Link className="text-cyan-800 underline" href={`/seminars/${p.seminar.id}`}>{p.seminar.title}</Link> : p.seminar.title}</span>
                  <span className="shrink-0 text-slate-500">{owned.has(p.seminar.id) ? "Yours" : "Returns in a later rotation"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
