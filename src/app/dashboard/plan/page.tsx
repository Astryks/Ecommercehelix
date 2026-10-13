import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { planState } from "@/lib/plan-state";
import { PersonalPlan } from "@/components/plan/PersonalPlan";

export default async function PlanPage() {
  const u = await requireUser("/dashboard/plan");
  const [acct, st] = await Promise.all([getAccount(u.id), planState(u.id)]);
  if (!st) redirect("/start?step=2");
  return <div className="mx-auto max-w-3xl"><PersonalPlan s={st} storeUrl={acct.storeUrl} plan={acct.plan} /></div>;
}
