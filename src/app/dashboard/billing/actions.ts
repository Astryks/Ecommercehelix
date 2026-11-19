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

/**
 * Step 4 — Wallet actions.
 *
 * Top-ups are prepaid only. With Stripe configured, the user pays through
 * Stripe Checkout (see /api/checkout?topup=) and the webhook credits the
 * wallet — no credit is ever granted before Stripe confirms the payment.
 * Without Stripe (demo mode), the top-up is recorded as demo credit and
 * labelled as such, mirroring the existing demo plan switch. Nothing here
 * ever fakes a live charge.
 */
export async function topUpWalletAction(form: FormData) {
  const u = await requireUser();
  const amount = Number(form.get("amount"));
  if (![10, 25, 50].includes(amount)) redirect("/dashboard/billing?topup=bad");
  if (stripe) redirect(`/api/checkout?topup=${amount}`);
  const { getPricingState, savePricingState, topUpWallet } = await import("@/lib/pricing/store");
  const state = await getPricingState(u.id);
  const r = topUpWallet(state, amount as 10 | 25 | 50, { demo: true });
  if ("error" in r) redirect("/dashboard/billing?topup=bad");
  await savePricingState(u.id, r.state);
  await logAudit(u.id, { actor: "user", action: "wallet.topup.demo", target: String(amount), outcome: "ok" });
  revalidatePath("/dashboard/billing");
  redirect("/dashboard/billing?topup=demo");
}

/** Buy a PAYG pack ($10 = 500 credits, 7-day expiry) from the wallet balance, or by card via Stripe Checkout. */
export async function buyPaygAction(form: FormData) {
  const u = await requireUser();
  const payFrom = String(form.get("payFrom") ?? "wallet");
  const { getPricingState, savePricingState, buyPaygPack } = await import("@/lib/pricing/store");
  if (payFrom === "card") {
    if (stripe) redirect("/api/checkout?payg=1");
    redirect("/dashboard/billing?payg=nostripe");
  }
  const state = await getPricingState(u.id);
  const r = buyPaygPack(state, "wallet", false);
  if ("error" in r) redirect("/dashboard/billing?payg=nofunds");
  await savePricingState(u.id, r.state);
  await logAudit(u.id, { actor: "user", action: "wallet.payg", target: r.bucket.id, outcome: "ok" });
  revalidatePath("/dashboard/billing");
  redirect("/dashboard/billing?payg=1");
}

/** Auto top-up: opt-in only, with a monthly ceiling. Off by default. */
export async function setAutoTopUpAction(form: FormData) {
  const u = await requireUser();
  const enabled = form.get("enabled") === "1";
  const amount = Number(form.get("amount") ?? 10);
  const ceiling = Number(form.get("ceiling") ?? 0);
  const { getPricingState, savePricingState, setAutoTopUp } = await import("@/lib/pricing/store");
  const state = await getPricingState(u.id);
  const r = setAutoTopUp(state, enabled ? { enabled: true, amount: amount as 10 | 25 | 50, ceilingUsd: ceiling } : null);
  if ("error" in r) redirect("/dashboard/billing?autotopup=bad");
  await savePricingState(u.id, r.state);
  revalidatePath("/dashboard/billing");
  redirect("/dashboard/billing?autotopup=1");
}
