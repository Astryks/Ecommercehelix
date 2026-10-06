"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CalendarCheck, CalendarDays, CreditCard, FileText, Inbox, Lightbulb, Link2, Mail, Megaphone, Settings, Sparkles } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Today", icon: CalendarCheck },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/insights", label: "What to fix", icon: Lightbulb },
  { href: "/dashboard/approvals", label: "Waiting for your OK", icon: Inbox },
  { href: "/dashboard/scorecard", label: "Your numbers", icon: BarChart3 },
  { href: "/dashboard/campaigns", label: "Your ads", icon: Megaphone },
  { href: "/dashboard/email", label: "Email automation", icon: Mail },
  { href: "/dashboard/trends", label: "Ad Trends", icon: Sparkles },
  { href: "/dashboard/report", label: "Weekly report", icon: FileText },
  { href: "/dashboard/integrations", label: "Connections", icon: Link2 },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Plan & billing", icon: CreditCard },
];

export function NavLinks({ pending }: { pending: number }) {
  const path = usePathname();
  return (
    <ul className="flex gap-1 overflow-x-auto lg:flex-col">
      {LINKS.map((l) => {
        const active = l.href === "/dashboard" ? path === l.href : path.startsWith(l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              <l.icon className="h-4 w-4" aria-hidden />
              {l.label}
              {l.href === "/dashboard/approvals" && pending > 0 && (
                <span className="ml-auto rounded-full bg-cyan-400 px-2 text-xs font-bold text-slate-950">{pending}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
