import Link from "next/link";
import { Sparkles } from "lucide-react";
import { planName, type PlanId } from "@/lib/plans";

/** A friendly upgrade nudge, shown at the moment a paid feature would help. */
export function UpgradePrompt({ need, title, body, forKey, compact }: { need: Exclude<PlanId, "free">; title: string; body: string; forKey: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-[#5A50D6]/30 bg-[#F2F1EC] ${compact ? "p-4" : "p-5"}`}>
      <p className="flex items-center gap-2 font-semibold text-[#1A1718]"><Sparkles className="h-4 w-4 text-[#5A50D6]" aria-hidden /> {title}</p>
      <p className="mt-1 text-sm text-slate-700">{body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a href={`/api/checkout?plan=${need}`} className="btn-dark !px-3 !py-1.5 !text-sm">Upgrade to {planName(need)}</a>
        <Link href={`/dashboard/billing?need=${need}&for=${forKey}`} className="text-xs text-cyan-700 underline">Compare plans</Link>
        <span className="text-xs text-slate-500">Cancel anytime, in one click. Your profit dashboard and lessons stay free.</span>
      </div>
    </div>
  );
}
