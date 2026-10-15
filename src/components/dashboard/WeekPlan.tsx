import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { LostLink } from "./LostLink";

export type WeekItem = { label: string; href: string; done: boolean };

/** "Your plan this week": a short list, one small thing a day. */
export function WeekPlan({ items, weekOf }: { items: WeekItem[]; weekOf: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="week-h" className="card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="week-h" className="font-hand text-xl text-cyan-700">Your plan this week</h2>
        <LostLink about="My plan this week" />
      </div>
      <p className="text-xs text-slate-500">Week of {weekOf}. One small thing a day.</p>
      <ol className="mt-3 space-y-1.5">
        {items.map((i, n) => (
          <li key={n}>
            <Link href={i.href} className="flex items-start gap-2 text-sm text-slate-800 hover:underline">
              {i.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" aria-label="Done" /> : <Circle className="mt-0.5 h-4 w-4 flex-none text-slate-300" aria-label="To do" />}
              <span>{i.label}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
