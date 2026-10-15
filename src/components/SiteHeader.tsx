import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "./Logo";

const LINKS: [string, string][] = [["/#how", "How it works"], ["/features", "Features"], ["/guides", "Guides"], ["/#pricing", "Pricing"], ["/learn", "Learn"], ["/about", "About"], ["/contact", "Contact"]];

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const link = dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900";
  return (
    <header className={dark ? "relative z-20" : "relative z-20 border-b border-slate-200 bg-paper/90 backdrop-blur"}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4" aria-label="Main">
        <Link href="/" aria-label="E-commerce Helix home">
          <Logo dark={dark} />
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          {LINKS.filter(([h]) => h !== "/contact").map(([h, l]) => <Link key={h} className={link} href={h}>{l}</Link>)}
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/signin" className={`hidden text-sm font-medium sm:inline ${link}`}>Sign in</Link>
          <Link href="/dashboard" className="btn-primary whitespace-nowrap px-3 sm:px-5">Open Helix</Link>
          {/* Phones: a simple menu that works without JavaScript. */}
          <details className="group relative md:hidden">
            <summary className={`flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg ring-1 [&::-webkit-details-marker]:hidden ${dark ? "text-white ring-white/30" : "text-slate-800 ring-slate-300"}`} aria-label="Menu">
              <Menu className="h-5 w-5" aria-hidden />
            </summary>
            <div className="absolute right-0 top-12 z-30 w-56 rounded-xl border border-slate-200 bg-white p-2 text-[15px] font-medium text-slate-800 shadow-lg">
              {LINKS.map(([h, l]) => <Link key={h} href={h} className="block rounded-lg px-3 py-2.5 hover:bg-slate-100">{l}</Link>)}
              <Link href="/signin" className="block rounded-lg px-3 py-2.5 hover:bg-slate-100">Sign in</Link>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
