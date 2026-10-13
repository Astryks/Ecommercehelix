import { Check } from "lucide-react";
import type { Plan } from "@/lib/plans";

/** Shared plan body: who it suits, what you get, what "Do it for me" does, first week. */
export function PlanDetails({ p, dark = false }: { p: Plan; dark?: boolean }) {
  const muted = dark ? "text-slate-300" : "text-slate-600";
  const head = `mt-5 text-xs font-bold uppercase tracking-wide ${dark ? "text-cyan-300" : "text-cyan-700"}`;
  return (
    <div className="flex-1 text-sm">
      <p className={`mt-4 ${muted}`}><strong>Suits:</strong> {p.suits}</p>
      <p className={head}>What you get</p>
      <ul className="mt-2 space-y-2">
        {p.features.map((f) => (
          <li key={f} className="flex gap-2.5"><Check className={`mt-0.5 h-4 w-4 flex-none ${dark ? "text-emerald-300" : "text-emerald-600"}`} aria-hidden /><span>{f}</span></li>
        ))}
      </ul>
      {p.doItForMe.length > 0 && (
        <>
          <p className={head}>What &ldquo;Do it for me&rdquo; really does</p>
          <ul className={`mt-2 list-disc space-y-1.5 pl-5 ${muted}`}>{p.doItForMe.map((f) => <li key={f}>{f}</li>)}</ul>
        </>
      )}
      <p className={head}>Your first week</p>
      <ul className={`mt-2 space-y-1 ${muted}`}>{p.week1.map((f) => <li key={f}>{f}</li>)}</ul>
    </div>
  );
}
