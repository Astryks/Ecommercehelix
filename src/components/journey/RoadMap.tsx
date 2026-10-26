import { Check, MapPin } from "lucide-react";
import { MILESTONES } from "@/lib/journey";

/** The track: horizontal from sm up, vertical on phones. `level` 0 = not started. */
export function RoadMap({ level, progress, compact = false }: { level: number; progress: number | null; compact?: boolean }) {
  return (
    <ol className={compact ? "relative flex flex-row items-start" : "relative flex flex-col gap-3 py-2 sm:flex-row sm:items-start sm:gap-0"} aria-label="Road to $100M levels" data-testid="road-map">
      {MILESTONES.map((m, i) => {
        const reached = m.level <= level;
        const here = m.level === level;
        const nextStop = m.level === level + 1;
        return (
          <li key={m.id} className={compact ? "relative flex flex-1 flex-col items-center gap-1 text-center" : "relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-center sm:gap-1 sm:text-center"} aria-current={here ? "step" : undefined}>
            {i > 0 && (
              <span aria-hidden className={`absolute ${compact ? "left-[-50%] top-[15px] h-1 w-full rounded" : "-top-3 left-[15px] h-3 w-0.5 sm:left-[-50%] sm:top-[15px] sm:h-1 sm:w-full sm:rounded"} ${reached ? "bg-[#5A50D6]" : "bg-slate-200"}`}>
                {nextStop && progress != null && <span className="absolute inset-y-0 left-0 hidden rounded bg-[#5A50D6]/50 sm:block" style={{ width: `${Math.round(progress * 100)}%` }} />}
              </span>
            )}
            <a href={`/dashboard/progress#road-${m.id}`} className={`relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 text-xs font-bold ${here ? "border-[#5A50D6] bg-[#5A50D6] text-white ring-4 ring-[#5A50D6]/20" : reached ? "border-[#5A50D6] bg-[#EEEDFB] text-[#5A50D6]" : "border-slate-300 bg-white text-slate-500"}`} aria-label={`Level ${m.level}: ${m.title}${here ? " (you are here)" : reached ? " (reached)" : ""}`}>
              {reached && !here ? <Check className="h-4 w-4" aria-hidden /> : m.level}
            </a>
            <span className={compact ? "min-w-0 px-0.5" : "min-w-0 sm:px-1"}>
              <span className={`${compact && !here ? "hidden sm:block" : "block"} ${compact ? "text-[11px] leading-tight" : "text-sm"} font-semibold ${here ? "text-[#5A50D6]" : "text-slate-900"}`}>{m.title}</span>
              {!compact && <span className="block text-xs text-slate-500">{m.short}</span>}
              {here && !compact && <span className="mt-0.5 inline-flex whitespace-nowrap items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900"><MapPin className="h-3 w-3" aria-hidden /> You are here</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
