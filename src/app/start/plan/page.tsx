import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/Logo";
import { ensureUser, getAccount } from "@/lib/repo";
import { planState } from "@/lib/plan-state";
import { PersonalPlan } from "@/components/plan/PersonalPlan";

export const dynamic = "force-dynamic";

/** Screen 3 of onboarding: the diagnosis, the store check and the plan. */
export default async function StartPlan() {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=/start/plan");
  const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const [acct, st] = await Promise.all([getAccount(id), planState(id)]);
  if (!st) redirect("/start?step=2");
  return (
    <main className="min-h-screen bg-mist px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/"><Logo size={30} /></Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Step 3 of 3 · your plan</p>
        <div className="mt-2"><PersonalPlan s={st} storeUrl={acct.storeUrl} plan={acct.plan} /></div>
        <Link href="/dashboard" className="mt-6 inline-block text-sm font-semibold text-slate-600 hover:underline">Or go to Today</Link>
      </div>
    </main>
  );
}
