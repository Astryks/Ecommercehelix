"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, PiggyBank, Route, Gauge, TrendingUp, BarChart3, BookOpen, Boxes, Briefcase, LineChart, CalendarCheck, CalendarDays, CreditCard, FileText, Inbox, Lightbulb, Link2, Mail, Megaphone, Settings, Sparkles, Target } from "lucide-react";

type L = { href: string; label: string; icon: typeof CalendarCheck; unlock?: string };

/** The seven you need. Everything else sits under More tools and opens up as your plan reaches it. */
const MAIN: L[] = [
  { href: "/dashboard", label: "Today", icon: CalendarCheck },
  { href: "/dashboard/plan", label: "Your plan", icon: Route },
  { href: "/dashboard/profit", label: "Profit", icon: PiggyBank },
  { href: "/dashboard/scorecard", label: "Your numbers", icon: BarChart3 },
  { href: "/dashboard/insights", label: "What to fix", icon: Lightbulb },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
const MORE: L[] = [
  { href: "/course", label: "Your course", icon: Route },
  { href: "/dashboard/approvals", label: "Waiting for your OK", icon: Inbox },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/metrics", label: "Key metrics", icon: Gauge, unlock: "numbers" },
  { href: "/dashboard/analytics", label: "Dashboard", icon: LineChart, unlock: "numbers" },
  { href: "/dashboard/growth", label: "Growth", icon: TrendingUp, unlock: "numbers" },
  { href: "/dashboard/goals", label: "Monthly goals", icon: Target, unlock: "numbers" },
  { href: "/dashboard/progress", label: "Your progress", icon: History, unlock: "numbers" },
  { href: "/dashboard/integrations", label: "Connections", icon: Link2, unlock: "attract" },
  { href: "/dashboard/campaigns", label: "Your ads", icon: Megaphone, unlock: "attract" },
  { href: "/dashboard/trends", label: "Ad Trends", icon: Sparkles, unlock: "attract" },
  { href: "/dashboard/email", label: "Email flows", icon: Mail, unlock: "grow" },
  { href: "/dashboard/stock", label: "Suppliers & stock", icon: Boxes, unlock: "aov" },
  { href: "/dashboard/report", label: "Weekly report", icon: FileText, unlock: "review" },
  { href: "/dashboard/business", label: "Run your business", icon: Briefcase, unlock: "review" },
  { href: "/dashboard/billing", label: "Plan & billing", icon: CreditCard },
];


/** reached: plan block ids the user has reached (null = no personal plan yet, so everything is open). unlockWeek: block id to its first week. */
export function NavLinks({ pending, reached = null, unlockWeek = {} }: { pending: number; reached?: string[] | null; unlockWeek?: Record<string, number> }) {
  const path = usePathname();
  const isOpen = (l: L) => !l.unlock || reached === null || reached.includes(l.unlock);
  const item = (l: L) => {
    const active = l.href === "/dashboard" ? path === l.href : path.startsWith(l.href);
    return (
      <li key={l.href}>
        <Link href={l.href} aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
          <l.icon className="h-4 w-4" aria-hidden />
          {l.label}
          {l.href === "/dashboard/approvals" && pending > 0 && <span className="ml-auto rounded-full bg-cyan-400 px-2 text-xs font-bold text-slate-950">{pending}</span>}
        </Link>
      </li>
    );
  };
  const open = MORE.filter(isOpen);
  const later = MORE.filter((l) => !isOpen(l));
  const moreActive = MORE.some((l) => path.startsWith(l.href));
  return (
    <div>
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">{MAIN.map(item)}</ul>
      <details className="mt-3" open={moreActive}>
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-300">More tools ({open.length})</summary>
        <ul className="flex flex-col gap-1">{open.map(item)}</ul>
        {later.length > 0 && (
          <ul className="mt-2 space-y-1 px-3 text-xs text-slate-500" aria-label="Opens up later in your plan">
            {later.map((l) => <li key={l.href} title="Opens up as your plan reaches it"><Link href={l.href} className="hover:text-slate-300">{l.label} · week {unlockWeek[l.unlock!] ?? "later"}</Link></li>)}
          </ul>
        )}
      </details>
    </div>
  );
}
