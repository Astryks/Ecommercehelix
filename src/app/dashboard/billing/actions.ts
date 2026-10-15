"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { getBilling } from "@/lib/repo";
import { stripe } from "@/lib/stripe";
import { subFields, type SubLike } from "@/lib/billing";
import { planForPrice } from "@/lib/stripe";
import { writeSub } from "@/lib/billing-store";
import { logAudit } from "@/lib/meta/store";

/** Cancel at period end (after the confirm step). Access stays until the paid period ends. The webhook sends the thank-you email. */
export async function cancelAtPeriodEnd() {
  const u = await requireUser("/dashboard/billing");
  const b = await getBilling(u.id);
  if (!stripe || !b.subscriptionId) redirect("/dashboard/billing?noportal=1");
  const sub = await stripe.subscriptions.update(b.subscriptionId, { cancel_at_period_end: true });
  await writeSub(u.id, { ...subFields(sub as unknown as SubLike, (p, price) => planForPrice(p, process.env, price)) });
  await logAudit(u.id, { actor: "user", action: "billing.cancel", target: b.subscriptionId, outcome: "ok" });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/billing?cancelled=1");
}

/** Undo a cancel before the period ends: one click, no new checkout. */
export async function resumeSubscription() {
  const u = await requireUser("/dashboard/billing");
  const b = await getBilling(u.id);
  if (!stripe || !b.subscriptionId) redirect("/dashboard/billing");
  const sub = await stripe.subscriptions.update(b.subscriptionId, { cancel_at_period_end: false });
  await writeSub(u.id, { ...subFields(sub as unknown as SubLike, (p, price) => planForPrice(p, process.env, price)) });
  await logAudit(u.id, { actor: "user", action: "billing.resume", target: b.subscriptionId, outcome: "ok" });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/billing?resumed=1");
}
