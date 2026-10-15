import Link from "next/link";
import { LifeBuoy } from "lucide-react";

/** "I'm lost" on a card: opens Help with the card's topic filled in. */
export function LostLink({ about, className = "" }: { about: string; className?: string }) {
  return (
    <Link href={`/dashboard/help?about=${encodeURIComponent(about.slice(0, 120))}`} className={`inline-flex items-center gap-1 text-xs font-semibold text-slate-600 underline-offset-2 hover:underline ${className}`}>
      <LifeBuoy className="h-3.5 w-3.5 text-[#5A50D6]" aria-hidden /> I&apos;m lost
    </Link>
  );
}
