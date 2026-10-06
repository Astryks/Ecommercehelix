import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const link = dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900";
  return (
    <header className={dark ? "relative z-20" : "relative z-20 border-b border-slate-200 bg-paper/90 backdrop-blur"}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4" aria-label="Main">
        <Link href="/" aria-label="Ecommerce Helix home">
          <Logo dark={dark} />
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link className={link} href="/#how">How it works</Link>
          <Link className={link} href="/#strategies">Strategies</Link>
          <Link className={link} href="/#pricing">Pricing</Link>
          <Link className={link} href="/learn">Learn</Link>
          <Link className={link} href="/about">About</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin" className={`hidden text-sm font-medium sm:inline ${link}`}>Sign in</Link>
          <Link href="/dashboard" className="btn-primary">Open Helix</Link>
        </div>
      </nav>
    </header>
  );
}
