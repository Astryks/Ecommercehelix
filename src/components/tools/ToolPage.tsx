import Link from "next/link";
import { LostLink } from "@/components/dashboard/LostLink";

/** Shared frame for the planning tools under Numbers. */
export function ToolPage({ title, intro, lesson, auto, example, children }: { title: string; intro: string; lesson?: { label: string; href: string }; auto: string; example?: boolean; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <p className="text-sm"><Link href="/dashboard/numbers" className="text-cyan-700 hover:underline">Numbers</Link> / {title}</p>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-slate-700">{intro}</p>
        <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">Updates by itself: {auto}</span>
          {example && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-900">Using example numbers until you add your own</span>}
          {lesson && <Link href={lesson.href} className="text-cyan-700 underline">Lesson: {lesson.label}</Link>}
          <LostLink about={title} />
        </p>
      </header>
      {children}
    </div>
  );
}
export const usd = (n: number | null | undefined) => (n === null || n === undefined ? "–" : (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US"));
export function Stat({ k, v, note }: { k: string; v: string; note?: string }) {
  return <div className="card p-4"><p className="text-xs text-slate-600">{k}</p><p className="text-2xl font-bold tabular-nums text-slate-900">{v}</p>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}</div>;
}
export function Table({ head, rows, highlight }: { head: string[]; rows: (string | number)[][]; highlight?: (i: number) => string }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="min-w-full text-right text-sm tabular-nums">
        <thead className="bg-slate-100 text-xs text-slate-600"><tr>{head.map((h, i) => <th key={h} className={`whitespace-nowrap px-3 py-2 font-semibold ${i === 0 ? "text-left" : ""}`}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className={`border-t border-slate-100 ${highlight?.(i) ?? ""}`}>{r.map((c, j) => <td key={j} className={`whitespace-nowrap px-3 py-1.5 ${j === 0 ? "text-left font-medium text-slate-900" : "text-slate-800"}`}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
