import Link from "next/link";
import { LifeBuoy } from "lucide-react";

/** Small helper on every dashboard screen: reopens the current card in even simpler steps. */
export function LostButton() {
  return (
    <Link href="/dashboard/cards?lost=1" className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#1A1718] bg-[#F2F1EC] px-4 py-2.5 text-sm font-semibold text-[#1A1718] shadow-md hover:bg-white" aria-label="I'm lost: show my current card in simpler steps">
      <LifeBuoy className="h-4 w-4 text-[#5A50D6]" aria-hidden /> I&apos;m lost
    </Link>
  );
}
