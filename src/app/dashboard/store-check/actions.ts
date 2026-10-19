"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { safeDashboardPath, withParam } from "@/lib/safe-back";
import { getAccount } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { auditRuns, isCheckRunning, runAndSave } from "@/lib/site-audit/run";
import { checkGate } from "@/lib/site-audit/gate";

/** "Check my store now". Rules live in checkGate (src/lib/site-audit/gate.ts). */
export async function checkNow(form: FormData) {
  const u = await requireUser();
  const back = safeDashboardPath(form.get("back"));
  const acct = await getAccount(u.id);
  if (!acct.storeUrl) redirect("/dashboard/settings?need=store");
  const [last] = await auditRuns(u.id, 1);
  const paid = PLAN_RANK[acct.plan] >= PLAN_RANK.starter;
  const gate = checkGate({ last, paid, running: await isCheckRunning(u.id) });
  if (gate === "upgrade") redirect("/dashboard/billing?need=starter&for=recheck");
  if (gate !== "ok") redirect(withParam(back, "checked", gate));
  const run = await runAndSave(u.id, acct.storeUrl!);
  if (!run) redirect(withParam(back, "checked", "running"));
  revalidatePath("/dashboard", "layout");
  redirect(back);
}
