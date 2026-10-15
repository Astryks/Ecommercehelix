import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarStrip } from "@/components/SeasonalBanner";
import { previewDate, siteContent } from "@/lib/site-content";
import { TEMPLATES } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Season preview", robots: { index: false } };

/** Preview and dev only: see what the whole site features on any date, e.g. /preview/season?asOf=2026-11-20. 404 in production. */
export default async function SeasonPreview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const date = previewDate((await searchParams).asOf);
  if (!date) notFound();
  const c = siteContent(date, "US");
  return (
    <div className="min-h-screen bg-paper">
      <CalendarStrip banner={c.banner} />
      <main className="mx-auto max-w-3xl space-y-4 px-5 py-10">
        <p className="text-sm text-slate-500">Preview for {date} ({c.mode === "event" ? `event: ${c.eventKey}` : "evergreen tip"})</p>
        <h1 className="hero-h1 text-5xl leading-[1.04] text-slate-900">Grow your e-commerce business <span className="grad-text">a little every day</span></h1>
        <p className="lead text-xl leading-8 text-slate-700">{c.heroLine}</p>
        {c.heroExtra && <p className="text-base font-semibold text-[#5A50D6]">{c.heroExtra}</p>}
        <div className="card p-4 text-sm text-slate-800">
          <p><strong>Featured lesson:</strong> <Link className="text-cyan-700 underline" href={c.featuredLesson.href}>{c.featuredLesson.label}</Link></p>
          <p className="mt-1"><strong>Template highlights:</strong> {c.templates.map((id) => TEMPLATES.find((t) => t.id === id)?.title).join(", ")}</p>
          <p className="mt-1"><strong>Tip of the week:</strong> {c.tip.text}</p>
        </div>
      </main>
    </div>
  );
}
