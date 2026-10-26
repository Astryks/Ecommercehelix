"use client";
import { useState } from "react";
import { PlayCircle } from "lucide-react";

type V = { id: string; title: string; n: number; src: string | null; poster?: string };

/** "Course video" slot on Learn: one player plus a chapter list. Plays nothing until the files are hosted. */
export function CourseVideos({ videos }: { videos: V[] }) {
  const ready = videos.filter((v) => v.src);
  const [cur, setCur] = useState<V | undefined>(ready[0]);
  const label = (v: V) => (v.n === 0 ? "Intro" : `Chapter ${v.n}`);
  return (
    <section aria-labelledby="videos-h" className="mt-8" data-testid="course-videos">
      <h2 id="videos-h" className="font-serif text-2xl uppercase tracking-wide text-slate-900">Course videos</h2>
      {ready.length === 0 ? (
        <p className="mt-1 max-w-2xl text-sm text-slate-600">The {videos.length} short course videos are coming soon. The written lessons below cover the same ground.</p>
      ) : (
        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            {cur?.src && (
              <video key={cur.id} src={cur.src} poster={cur.poster} controls preload="metadata" playsInline className="aspect-video w-full rounded-2xl bg-slate-900">
                <track kind="captions" />
              </video>
            )}
            {cur && <p className="mt-2 font-semibold text-slate-900">{label(cur)}: {cur.title}</p>}
          </div>
          <ol className="max-h-96 min-w-0 space-y-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2">
            {videos.map((v) => (
              <li key={v.id}>
                <button type="button" disabled={!v.src} onClick={() => setCur(v)} aria-current={cur?.id === v.id ? "true" : undefined}
                  className={`flex w-full min-w-0 items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${cur?.id === v.id ? "bg-[#5A50D6]/10 font-semibold" : "hover:bg-slate-50"} disabled:cursor-not-allowed disabled:opacity-50`}>
                  <PlayCircle className="mt-0.5 h-4 w-4 flex-none text-[#5A50D6]" aria-hidden />
                  <span className="min-w-0">{label(v)}: {v.title}{!v.src && " (soon)"}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
