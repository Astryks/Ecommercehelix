"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CalendarCheck, Settings, Trophy, Users } from "lucide-react";

type L = { href: string; label: string; icon: typeof CalendarCheck; also?: string[] };

/** The five places in Helix. Everything else lives under Settings. */
export const MAIN: L[] = [
  { href: "/dashboard", label: "Today", icon: CalendarCheck, also: ["/dashboard/cards", "/dashboard/plan"] },
  { href: "/dashboard/numbers", label: "Numbers", icon: BarChart3, also: ["/dashboard/scorecard", "/dashboard/analytics", "/dashboard/growth", "/dashboard/metrics", "/dashboard/profit", "/dashboard/goals"] },
  { href: "/dashboard/learn", label: "Learn", icon: BookOpen, also: ["/course"] },
  { href: "/dashboard/progress", label: "Progress", icon: Trophy },
  { href: "/dashboard/community", label: "Community", icon: Users },
];

export function isActive(path: string, l: L) {
  if (l.href === "/dashboard") return path === "/dashboard" || (l.also ?? []).some((a) => path.startsWith(a));
  return path.startsWith(l.href) || (l.also ?? []).some((a) => path.startsWith(a));
}

const inMain = (path: string) => MAIN.some((l) => isActive(path, l));

/** Sidebar on wide screens. */
export function NavLinks({ pending }: { pending: number }) {
  const path = usePathname();
  const settingsActive = path.startsWith("/dashboard") && !inMain(path);
  const cls = (a: boolean) => `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${a ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`;
  return (
    <div>
      <ul className="flex flex-col gap-1">
        {MAIN.map((l) => {
          const a = isActive(path, l);
          return <li key={l.href}><Link href={l.href} aria-current={a ? "page" : undefined} className={cls(a)}><l.icon className="h-5 w-5" aria-hidden />{l.label}</Link></li>;
        })}
      </ul>
      <div className="mt-4 border-t border-white/10 pt-4">
        <Link href="/dashboard/settings" aria-current={settingsActive ? "page" : undefined} className={cls(settingsActive)}>
          <Settings className="h-5 w-5" aria-hidden />Settings
          {pending > 0 && <span className="ml-auto rounded-full bg-cyan-400 px-2 text-xs font-bold text-slate-950" title="Waiting for your OK">{pending}</span>}
        </Link>
      </div>
    </div>
  );
}

/** Bottom bar on phones and small tablets. */
export function BottomBar() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {MAIN.map((l) => {
          const a = isActive(path, l);
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={a ? "page" : undefined} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${a ? "text-cyan-700" : "text-slate-600"}`}>
                <l.icon className="h-5 w-5" aria-hidden />{l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
