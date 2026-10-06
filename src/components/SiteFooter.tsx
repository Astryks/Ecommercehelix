import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-sm text-sm leading-6">Grow your e-commerce business a little every day. A head of growth by your side that explains every step and only acts with your approval.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Product</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/#how">How it works</Link></li>
            <li><Link className="hover:text-white" href="/#pricing">Pricing</Link></li>
            <li><Link className="hover:text-white" href="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-white" href="/learn">Learn</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Company</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/about">About</Link></li>
            <li><Link className="hover:text-white" href="/#faq">FAQ</Link></li>
            <li><a className="hover:text-white" href="https://github.com/Astryks/Ecommercehelix">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} Ecommerce Helix. Results vary. Helix gives guidance, not guarantees.</div>
    </footer>
  );
}
