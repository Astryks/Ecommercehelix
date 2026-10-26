import { LostButton } from "@/components/cards/LostButton";
import { CoachWidget } from "@/components/dashboard/CoachWidget";
import { coachEnabled } from "@/lib/coach/config";
import { LegalLinks } from "@/components/legal/LegalLinks";
import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NavLinks, BottomBar } from "@/components/dashboard/NavLinks";
import { DemoBanner } from "@/components/DemoBanner";
import { ExampleBanner } from "@/components/dashboard/ExampleBanner";
import { NeedHelp } from "@/components/NeedHelp";
import { DemoAccountNotice } from "@/components/DemoAccountNotice";
import { isDemoUserId } from "@/lib/demo-auth";
import { requireUser } from "@/lib/session";
import { getAccount, listApprovals } from "@/lib/repo";
import { planName } from "@/lib/plans";
import { signOut } from "@/auth";
import { StageStrip } from "@/components/StageStrip";
import { questForUser } from "@/lib/quest-server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const u = await requireUser();
  const [acct, approvals, qx] = await Promise.all([getAccount(u.id), listApprovals(u.id), questForUser(u.id)]);
  const pending = approvals.filter((a) => a.status === "pending").length;
  async function out() {
    "use server";
    await signOut({ redirectTo: "/" });
  }
  return (
    <div className="min-h-screen bg-mist">
      <DemoBanner />
      {isDemoUserId(u.id) && <DemoAccountNotice />}
      <ExampleBanner userId={u.id} />
      <div className="lg:flex lg:min-h-screen">
        <header className="flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
          <Link href="/dashboard" className="block"><Logo dark size={26} /></Link>
          <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10" aria-label="Settings">
            <SettingsIcon className="h-5 w-5" aria-hidden /> Settings{pending > 0 && <span className="rounded-full bg-cyan-400 px-1.5 text-xs font-bold text-slate-950">{pending}</span>}
          </Link>
        </header>
        <div className="bg-ink px-4 pb-3 lg:hidden"><StageStrip quest={qx.quest} compact dark /></div>
        <aside className="hidden bg-ink px-4 lg:block lg:w-64 lg:flex-none">
          <div className="py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <Link href="/" className="block px-2"><Logo dark size={30} /></Link>
          <div className="mt-5"><StageStrip quest={qx.quest} compact dark /></div>
          <nav className="mt-4 lg:flex-1" aria-label="Dashboard"><NavLinks pending={pending} /></nav>
          <div className="mt-4 hidden min-w-0 rounded-xl bg-white/5 p-4 text-sm text-slate-300 lg:block">
            <p className="truncate font-medium text-white" title={u.name || u.email || undefined}>{u.name || u.email}</p>
            {isDemoUserId(u.id) && <p className="mt-1 text-xs font-semibold text-amber-300">Demo account</p>}
            <p className="mt-0.5 truncate text-xs text-slate-400">{acct.storeUrl ?? "No store connected yet"}</p>
            <p className="mt-3 text-xs"><span className="rounded-full bg-cyan-500 px-2 py-0.5 font-bold text-slate-950">{planName(acct.plan)}</span></p>
            <form action={out} className="mt-3"><button className="text-xs text-slate-400 underline hover:text-white">Sign out</button></form>
          </div>
          <NeedHelp dark guidesHref="/dashboard/help" className="mt-3" />
          <LegalLinks className="mt-3 block px-2 pb-2 text-xs text-slate-400" />
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-8 lg:py-10">{children}</div>
      </div>
      <LostButton />
      {coachEnabled() && <CoachWidget />}
      <BottomBar />
    </div>
  );
}
