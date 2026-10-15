import Link from "next/link";
import { Boxes, Briefcase, CalendarDays, CreditCard, FileText, Inbox, LifeBuoy, Lightbulb, Link2, Mail, Megaphone, Route, Sparkles, Store } from "lucide-react";

const ITEMS = [
  { href: "/dashboard/approvals", label: "Waiting for your OK", note: "Things Helix prepared. Nothing happens until you approve.", icon: Inbox },
  { href: "/dashboard/connect", label: "Connect your tools", note: "Shopify, Meta, Google, TikTok, Sheets or CSV.", icon: Link2 },
  { href: "/dashboard/integrations", label: "Connection details", note: "Sync, accounts and activity log.", icon: Link2 },
  { href: "/dashboard/billing", label: "Plan and billing", note: "Your plan, card and invoices.", icon: CreditCard },
  { href: "/dashboard/campaigns", label: "Your ads", note: "Ad results and paused drafts.", icon: Megaphone },
  { href: "/dashboard/insights", label: "What to fix", note: "Your store check and fixes.", icon: Lightbulb },
  { href: "/dashboard/stock", label: "Suppliers and stock", note: "Reorder dates and landed cost.", icon: Boxes },
  { href: "/dashboard/calendar", label: "Calendar", note: "Key sale dates and prep steps.", icon: CalendarDays },
  { href: "/dashboard/email", label: "Email flows", note: "Welcome, cart and thank-you emails.", icon: Mail },
  { href: "/dashboard/trends", label: "Ad trends", note: "Ad ideas that work right now.", icon: Sparkles },
  { href: "/dashboard/report", label: "Weekly report", note: "Your week on one page.", icon: FileText },
  { href: "/dashboard/business", label: "Run your business", note: "Tax dates and admin.", icon: Briefcase },
  { href: "/dashboard/plan", label: "Your plan", note: "Your week-by-week plan.", icon: Route },
  { href: "/dashboard/review", label: "Review my store", note: "Ask a person to look at your store.", icon: Store },
  { href: "/dashboard/help", label: "Help", note: "Step-by-step guides and support.", icon: LifeBuoy },
];

export function SettingsHub({ pending }: { pending: number }) {
  return (
    <nav aria-label="All tools" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} className="card flex items-start gap-3 p-4 transition hover:ring-2 hover:ring-cyan-200">
          <i.icon className="mt-0.5 h-5 w-5 flex-none text-[#5A50D6]" aria-hidden />
          <span>
            <span className="block font-semibold text-slate-900">{i.label}{i.href === "/dashboard/approvals" && pending > 0 ? ` (${pending})` : ""}</span>
            <span className="block text-sm text-slate-600">{i.note}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
