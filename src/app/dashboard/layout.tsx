import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/dashboard/NavLinks";
import { DemoBanner } from "@/components/DemoBanner";
import { requireUser } from "@/lib/session";
import { getAccount, listApprovals } from "@/lib/repo";
import { planName } from "@/lib/plans";
import { signOut } from "@/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const u = await requireUser();
  const [acct, approvals] = await Promise.all([getAccount(u.id), listApprovals(u.id)]);
  const pending = approvals.filter((a) => a.status === "pending").length;
  async function out() {
    "use server";
    await signOut({ redirectTo: "/" });
  }
  return (
    <div className="min-h-screen bg-mist">
      <DemoBanner />
      <div className="lg:flex lg:min-h-screen">
        <aside className="bg-ink px-4 lg:w-64 lg:flex-none">
          <div className="py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <Link href="/" className="block px-2"><Logo dark size={30} /></Link>
          <nav className="mt-6 lg:flex-1" aria-label="Dashboard"><NavLinks pending={pending} /></nav>
          <div className="mt-4 hidden rounded-2xl bg-white/5 p-4 text-sm text-slate-300 lg:block">
            <p className="font-medium text-white">{u.name || u.email}</p>
            <p className="mt-0.5 truncate text-xs text-slate-400">{acct.storeUrl ?? "No store connected yet"}</p>
            <p className="mt-3 text-xs"><span className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-2 py-0.5 font-bold text-slate-950">{planName(acct.plan)}</span></p>
            <form action={out} className="mt-3"><button className="text-xs text-slate-400 underline hover:text-white">Sign out</button></form>
          </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
