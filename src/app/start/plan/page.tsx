import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/Logo";
import { ensureUser, getAccount, getDiagnosis } from "@/lib/repo";
import { auditRuns } from "@/lib/site-audit/run";
import { PersonalPlan } from "@/components/plan/PersonalPlan";

export const dynamic = "force-dynamic";

/** Screen 3 of onboarding: the diagnosis, the store check and the plan. */
export default async function StartPlan() {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin?next=/start/plan");
  const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const [acct, diag, runs] = await Promise.all([getAccount(id), getDiagnosis(id), auditRuns(id, 1)]);
  if (!diag) redirect("/start?step=2");
  return (
    <main className="min-h-screen bg-mist px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/"><Logo size={30} /></Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Step 3 of 3 · your plan</p>
        <PersonalPlan diag={diag} run={runs[0] ?? null} storeUrl={acct.storeUrl} userId={id} />
      </div>
    </main>
  );
}
