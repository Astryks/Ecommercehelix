import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { planState } from "@/lib/plan-state";
import { PersonalPlan } from "@/components/plan/PersonalPlan";
import { StageStrip } from "@/components/StageStrip";
import { questForUser } from "@/lib/quest-server";

export default async function PlanPage() {
  const u = await requireUser("/dashboard/plan");
  const [acct, st, qx] = await Promise.all([getAccount(u.id), planState(u.id), questForUser(u.id)]);
  if (!st) redirect("/start?step=2");
  return <div className="mx-auto max-w-3xl space-y-5"><StageStrip quest={qx.quest} /><PersonalPlan s={st} storeUrl={acct.storeUrl} plan={acct.plan} /></div>;
}
