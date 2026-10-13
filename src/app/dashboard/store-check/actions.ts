"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { safeDashboardPath, withParam } from "@/lib/safe-back";
import { getAccount } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { auditRuns, runAndSave } from "@/lib/site-audit/run";

const HOURS_BETWEEN_MANUAL = 6;

/** "Check my store now". Free: the first check (or a retry after a failed one). Paid: again after 6 hours. */
export async function checkNow(form: FormData) {
  const u = await requireUser();
  const back = safeDashboardPath(form.get("back"));
  const acct = await getAccount(u.id);
  if (!acct.storeUrl) redirect("/dashboard/settings?need=store");
  const [last] = await auditRuns(u.id, 1);
  const paid = PLAN_RANK[acct.plan] >= PLAN_RANK.starter;
  if (last?.ok && !paid) redirect("/dashboard/billing?need=starter&for=recheck");
  if (last?.ok && Date.now() - Date.parse(last.startedAt) < HOURS_BETWEEN_MANUAL * 3_600_000) redirect(withParam(back, "checked", "recent"));
  await runAndSave(u.id, acct.storeUrl!);
  revalidatePath("/dashboard", "layout");
  redirect(back);
}
