import "server-only";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, RefreshCw } from "lucide-react";
import { lessonLink } from "@/lib/lesson-links";
import { topFixes, changesSince, type Finding } from "@/lib/site-audit/checks";
import type { AuditRunRow } from "@/lib/site-audit/run";
import { checkNow } from "@/app/dashboard/store-check/actions";

const ICON = {
  high: <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden />,
  medium: <CircleAlert className="h-4 w-4 text-orange-500" aria-hidden />,
  low: <Info className="h-4 w-4 text-slate-400" aria-hidden />,
  good: <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />,
};
const when = (iso: string) => new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Sydney" });

export function FindingRow({ f }: { f: Finding }) {
  const l = f.lesson ? lessonLink(f.lesson) : null;
  return (
    <li className="flex gap-3 py-3">
      <span className="mt-0.5">{ICON[f.severity]}</span>
      <div className="text-sm">
        <p className="font-semibold text-slate-900">{f.title}</p>
        <p className="mt-0.5 text-slate-700">{f.quote}</p>
        {f.fix && <p className="mt-1 text-slate-600"><strong>Fix:</strong> {f.fix}</p>}
        {l && <Link href={l.href} className="mt-1 inline-block text-xs font-semibold text-cyan-700 hover:underline">Lesson: {l.title}</Link>}
      </div>
    </li>
  );
}

/** The store check: top fixes, what you do well, and what changed since the last check. */
export function StoreCheck({ runs, storeUrl, limit = 5, back = "/dashboard/insights", canRecheck }: { runs: AuditRunRow[]; storeUrl: string | null; limit?: number; back?: string; canRecheck: boolean }) {
  const [last, prev] = runs;
  if (!storeUrl)
    return (
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Your store check</h2>
        <p className="mt-1 text-sm text-slate-600">Add your store address in <Link href="/dashboard/settings" className="text-cyan-700 underline">Settings</Link> and Helix will read your home page and a product page and list the fixes, quoting your own pages.</p>
      </section>
    );
  const button = (label: string) => (
    <form action={checkNow}>
      <input type="hidden" name="back" value={back} />
      <button className="btn-ghost text-xs"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> {label}</button>
    </form>
  );
  if (!last)
    return (
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Your store check</h2>
        <p className="mt-1 text-sm text-slate-600">Helix reads {storeUrl} (home page, one product page and the cart) and lists what to fix first. It takes about 10 seconds.</p>
        <div className="mt-3">{button("Check my store now")}</div>
      </section>
    );
  const fixes = topFixes(last.findings, limit);
  const good = last.findings.filter((f) => f.severity === "good");
  const diff = prev?.ok && last.ok ? changesSince(prev.findings, last.findings) : null;
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Your store check</h2>
          <p className="text-xs text-slate-500">{last.url} · checked {when(last.startedAt)} · plain page reads, no AI</p>
        </div>
        {(canRecheck || !last.ok) && button(last.ok ? "Check again" : "Try again")}
      </div>
      {!last.ok && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">We couldn&apos;t check your store: {last.error} Check the address in Settings, then try again.</p>}
      {diff && (diff.fixed.length > 0 || diff.added.length > 0) && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          Since {when(prev!.startedAt)}: {diff.fixed.length ? `fixed ${diff.fixed.map((f) => f.title.toLowerCase()).join("; ")}` : "nothing fixed yet"}
          {diff.added.length ? `. New: ${diff.added.map((f) => f.title.toLowerCase()).join("; ")}` : ""}.
        </p>
      )}
      {fixes.length > 0 && (
        <>
          <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Fix these first</h3>
          <ol className="divide-y divide-slate-100">{fixes.map((f) => <FindingRow key={f.id} f={f} />)}</ol>
        </>
      )}
      {good.length > 0 && (
        <>
          <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">What you do well</h3>
          <ul className="divide-y divide-slate-100">{good.map((f) => <FindingRow key={f.id} f={f} />)}</ul>
        </>
      )}
      {last.ok && <p className="mt-3 text-xs text-slate-500">Some apps load tracking and pop-ups later, so &quot;not seen&quot; means not seen in your page source.</p>}
    </section>
  );
}
