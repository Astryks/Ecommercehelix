import { ExternalLink } from "lucide-react";
import { TRENDS } from "@/lib/seed/trends";
import { prettyDay } from "@/lib/dates";

const TONE: Record<string, string> = {
  Meta: "bg-blue-50 text-blue-700 ring-blue-200",
  TikTok: "bg-pink-50 text-pink-700 ring-pink-200",
  Google: "bg-amber-50 text-amber-800 ring-amber-200",
  "AI search": "bg-violet-50 text-violet-700 ring-violet-200",
};

export default function Trends() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">Ad Trends</h1>
      <p className="mt-1 text-slate-600">Week of {prettyDay(TRENDS[0].week)}. Curated platform changes, each with one thing to try. Seeded content; the weekly agent pipeline is stubbed.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {TRENDS.map((t) => (
          <article key={t.id} className="card flex flex-col p-6">
            <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${TONE[t.channel]}`}>{t.channel}</span>
            <h2 className="mt-3 text-lg font-semibold leading-snug">{t.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.summary}</p>
            <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900"><strong>Try it this week:</strong> {t.tryIt}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>Best for: {t.suits}</span>
              <a href={t.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-cyan-700 hover:underline">
                {t.sourceLabel} <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
