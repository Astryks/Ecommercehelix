"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { deleteAccount, getBilling } from "@/lib/repo";
import { disconnectMeta } from "@/lib/meta/service";
import { disconnectShopify } from "@/lib/shopify/service";
import { disconnectGoogleAds } from "@/lib/google-ads/service";
import { stripe } from "@/lib/stripe";
import { signOut } from "@/auth";

export async function deleteMyAccount(form: FormData) {
  const u = await requireUser();
  if (String(form.get("confirm") ?? "").trim() !== "DELETE") redirect("/dashboard/settings?delete=confirm#account");
  // Best effort: remove Helix's access at Meta, Shopify and Google Ads and stop any paid subscription before the data goes.
  await disconnectMeta(u.id).catch(() => {});
  await disconnectShopify(u.id).catch(() => {});
  await disconnectGoogleAds(u.id).catch(() => {});
  try {
    const b = await getBilling(u.id);
    if (stripe && b.subscriptionId && b.status !== "canceled") await stripe.subscriptions.cancel(b.subscriptionId);
  } catch {
    /* the account is still deleted; Stripe keeps its own billing records */
  }
  await deleteAccount(u.id);
  await signOut({ redirectTo: "/?deleted=1" });
}
