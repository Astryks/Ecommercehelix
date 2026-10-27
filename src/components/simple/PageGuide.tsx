import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { GUIDES } from "@/lib/simple/page-guides";

/** Top of each main page: simple heading, a 1-2 sentence "What is this page?" and a quiet "what next" pointer. */
export function PageGuide({ page, title, children }: { page: keyof typeof GUIDES; title?: string; children?: ReactNode }) {
  const g = GUIDES[page];
  return (
    <header className="mb-6" data-testid="page-guide">
      <h1 className="page-title">{title ?? g.title}</h1>
      <p className="mt-2 max-w-2xl text-base text-slate-700"><span className="sr-only">What is this page? </span>{g.what}</p>
      {children}
      {g.next && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500" data-testid="what-next">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> You are on {g.title}. Next:
          <Link href={g.next.href} className="inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline">{g.next.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
        </p>
      )}
    </header>
  );
}
