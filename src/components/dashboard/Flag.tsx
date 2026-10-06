import type { Flag as F } from "@/lib/scorecard";

const STYLE: Record<F, { dot: string; text: string; label: string }> = {
  green: { dot: "bg-emerald-500", text: "text-emerald-700", label: "On track" },
  amber: { dot: "bg-amber-400", text: "text-amber-700", label: "Watch" },
  red: { dot: "bg-rose-500", text: "text-rose-700", label: "Act" },
};

export function Flag({ flag, showLabel = false }: { flag: F; showLabel?: boolean }) {
  const s = STYLE[flag];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.text}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} aria-hidden />
      <span className={showLabel ? "" : "sr-only"}>{s.label}</span>
    </span>
  );
}
