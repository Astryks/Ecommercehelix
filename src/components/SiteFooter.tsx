import Link from "next/link";
import { Logo } from "./Logo";
import { FEATURES } from "@/lib/content/features";
import { SOCIALS } from "@/lib/social";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-sm text-sm leading-6">Grow your e-commerce business a little every day. Self-serve growth software that guides you step by step and only acts with your approval.</p>
          <ul className="mt-4 flex gap-4 text-sm" aria-label="Follow Helix">
            {SOCIALS.map((s) => <li key={s.name}><a className="text-white underline-offset-2 hover:underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.name} {s.handle}</a></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Product</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/#how">How it works</Link></li>
            <li><Link className="hover:text-white" href="/#pricing">Pricing</Link></li>
            <li><Link className="hover:text-white" href="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-white" href="/features">Features</Link></li>
            <li><Link className="hover:text-white" href="/guides">Guides</Link></li>
            <li><Link className="hover:text-white" href="/learn">Learn</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Features</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {FEATURES.map((x) => <li key={x.slug}><Link className="hover:text-white" href={`/features/${x.slug}`}>{x.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Company</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/about">About</Link></li>
            <li><Link className="hover:text-white" href="/faq">FAQ</Link></li>
            <li><Link className="hover:text-white" href="/help">Help and support</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact us</Link></li>
            <li><Link className="hover:text-white" href="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-white" href="/terms">Terms</Link></li>
            <li><Link className="hover:text-white" href="/data-deletion">Data deletion</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} Astryks. E-commerce Helix is run by Astryks. Results vary. Helix gives guidance, not guarantees.</div>
    </footer>
  );
}
