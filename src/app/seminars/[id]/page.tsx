import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SeminarView } from "@/components/seminars/SeminarView";
import { seminarById } from "@/lib/seminars/curriculum";
import { seminarForDate, todayInSydney } from "@/lib/seminars/rotation";
import { purchasedIds } from "@/lib/seminars/access";

export const dynamic = "force-dynamic";

/** One seminar. Buyable only while it is today's seminar; owners can always open it. */
export default async function SeminarPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const s = seminarById(id);
  if (!s) notFound();
  const owned = (await purchasedIds()).has(s.id);
  const isToday = seminarForDate(todayInSydney()).seminar.id === s.id;
  return (
    <>
      <SiteHeader dark={false} />
      <main className="mx-auto w-full max-w-5xl px-5 pt-page pb-section">
        <p className="text-sm"><Link href="/seminars" className="text-cyan-800 underline">Back to today&rsquo;s seminar</Link></p>
        {q.paid && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Payment received. This seminar is yours to keep.</p>}
        {q.canceled && <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Checkout cancelled. No charge was made.</p>}
        {owned || isToday ? <SeminarView s={s} owned={owned} demo={Boolean(q.demo)} /> : (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8">
            <h1 className="text-2xl text-slate-900">{s.title}</h1>
            <p className="mt-2 text-slate-600">This seminar is not in today&rsquo;s slot. It comes back in a later rotation; check today&rsquo;s seminar instead.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
