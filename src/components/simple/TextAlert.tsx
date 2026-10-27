import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { alertWords } from "@/lib/simple/text-alert";

/**
 * Friendly wrapper for long copy: a one-line plain summary, with the full text in a native
 * <details> (keyboard and screen-reader friendly, collapsed by default). Motion only when allowed.
 */
export function TextAlert({ summary, children, seed, label = "Read the full text", className = "" }: { summary: string; children: ReactNode; seed?: string; label?: string; className?: string }) {
  const w = alertWords(seed ?? summary);
  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50/70 p-4 ${className}`} data-testid="text-alert">
      <p className="text-sm text-amber-950"><strong className="font-semibold">{w.lead}</strong> {w.bridge} <span data-testid="text-alert-summary">{summary}</span></p>
      <details className="group mt-2">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-lg text-sm font-semibold text-amber-900 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 [&::-webkit-details-marker]:hidden">
          {label} <ChevronDown className="h-4 w-4 motion-safe:transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
      </details>
    </div>
  );
}

/** Plain "Want to know more?" dropdown for extra detail. */
export function MoreInfo({ label = "Want to know more?", children, open, className = "", testId }: { label?: string; children: ReactNode; open?: boolean; className?: string; testId?: string }) {
  return (
    <details className={`group rounded-xl border border-slate-200 bg-white ${className}`} open={open} data-testid={testId}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5A50D6] [&::-webkit-details-marker]:hidden">
        {label} <ChevronDown className="h-4 w-4 flex-none motion-safe:transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
