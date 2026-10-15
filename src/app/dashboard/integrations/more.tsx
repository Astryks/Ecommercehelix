import Link from "next/link";
import { Link2, RefreshCw, ShoppingBag, Unplug } from "lucide-react";
import { SHOPIFY_SCOPES, shopifyMode } from "@/lib/shopify/config";
import { getShopify } from "@/lib/shopify/service";
import { googleAdsMode } from "@/lib/google-ads/config";
import { getGoogleAds, getGoogleSnapshot, listCustomers, listGoogleDrafts } from "@/lib/google-ads/service";
import { disconnectGoogleAction, disconnectShopifyAction, pickGoogleCustomer, syncGoogleNow, syncShopifyNow } from "./actions";

export const MORE_MSG: Record<string, [string, string]> = {
  shopify_connected: ["ok", "Shopify is connected. Helix pulled your last 60 days of orders into Scorecard and Profit."],
  shopify_synced: ["ok", "Shopify synced. Scorecard, Profit and Stock are up to date."],
  shopify_disconnected: ["ok", "Shopify is disconnected. Helix removed its access at Shopify and deleted the token and synced product lines."],
  shopify_soon: ["err", "Shopify connect is coming soon. You can add your numbers by hand or CSV on Scorecard for now."],
  shopify_shop: ["err", "Enter your store's myshopify.com address, for example mystore.myshopify.com."],
  shopify_state: ["err", "That Shopify sign-in did not match or expired. Please try again."],
  shopify_denied: ["err", "The Shopify sign-in did not finish, so nothing was connected."],
  shopify_exchange: ["err", "Shopify did not accept the sign-in. Please try again."],
  shopify_sync: ["err", "The Shopify sync failed. See the activity log below."],
  google_connected: ["ok", "Google Ads is connected. Now pick the ad account Helix should read."],
  google_saved: ["ok", "Saved. Helix synced your last 30 days of Google Ads results."],
  google_synced: ["ok", "Google Ads synced. Scorecard ad spend and ROAS by channel are up to date."],
  google_disconnected: ["ok", "Google Ads is disconnected. Helix revoked its access and deleted the token and synced data."],
  google_soon: ["err", "Google Ads connect is coming soon. The Guide me tab under Campaigns has the step-by-step setup."],
  google_state: ["err", "That Google sign-in did not match or expired. Please try again."],
  google_denied: ["err", "The Google sign-in did not finish, or the Google Ads permission was not ticked, so nothing was connected."],
  google_exchange: ["err", "Google did not accept the sign-in. Please try again, and tick the Google Ads permission."],
  google_pick: ["err", "That Google Ads account is not available to this login. Pick one from the list."],
  google_sync: ["err", "The Google Ads sync failed. See the activity log below."],
};

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short" })  : "never");
const Soon = () => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">Coming soon</span>;
const On = () => <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">Connected</span>;

export async function ShopifyCard({ userId, paid }: { userId: string; paid: boolean }) {
  const live = shopifyMode() === "live";
  const conn = live ? await getShopify(userId).catch(() => null) : null;
  return (
    <section className="card mt-6 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><ShoppingBag className="h-4 w-4" aria-hidden /></span>
        <h2 className="text-xl font-semibold">Shopify (orders, sales and products)</h2>
        {!live ? <Soon /> : conn && <On />}
      </div>
      {!live ? (
        <p className="mt-2 text-sm text-slate-600">Coming soon: connect your Shopify store with Shopify&apos;s own sign-in, and Helix fills in your daily orders, sales, refunds, product costs and stock automatically. Until then, add your numbers on Scorecard by hand or CSV.</p>
      ) : !conn ? (
        <>
          <p className="mt-2 text-sm text-slate-600">Sign in with Shopify. Helix gets read-only access ({SHOPIFY_SCOPES.join(", ")}) and syncs every morning: orders, sales, discounts and refunds per day into Scorecard and the profit waterfall, product sales and unit costs into Profit, and stock counts for the SKUs you track. No customer names, emails or addresses are stored.</p>
          {paid ? (
            <form action="/api/shopify/install" method="get" className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input name="shop" required placeholder="mystore.myshopify.com" className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <button className="btn-primary text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect Shopify</button>
            </form>
          ) : (
            <Link href="/dashboard/billing?need=starter&for=shopify" className="btn-dark mt-4 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect Shopify · Starter</Link>
          )}
        </>
      ) : (
        <div className="mt-4 space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Store</dt><dd className="font-medium">{conn.shopName || conn.shop}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Products</dt><dd className="font-medium">{conn.productCount}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Last sync</dt><dd className="font-medium">{when(conn.lastSyncAt)}</dd></div>
          </dl>
          {conn.status !== "active" && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-900">{conn.status === "expired" ? "Your Shopify login has expired. Disconnect and connect again." : `Last sync failed: ${conn.lastSyncError}`}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <form action={syncShopifyNow}><button className="btn-primary text-sm"><RefreshCw className="h-4 w-4" aria-hidden /> Sync now</button></form>
            <Link href="/dashboard/profit" className="btn-ghost text-sm">Open profit</Link>
            <form action={disconnectShopifyAction} className="ml-auto"><button className="btn-ghost text-sm text-rose-700"><Unplug className="h-4 w-4" aria-hidden /> Disconnect</button></form>
          </div>
          <p className="text-xs text-slate-500">Read-only. Helix never changes your store, products, prices or orders.</p>
        </div>
      )}
    </section>
  );
}

export async function GoogleAdsCard({ userId, paid }: { userId: string; paid: boolean }) {
  const live = googleAdsMode() === "live";
  const conn = live ? await getGoogleAds(userId).catch(() => null) : null;
  let customers: Awaited<ReturnType<typeof listCustomers>> = [];
  let listError = "";
  if (conn && !conn.customerId && conn.status !== "expired") {
    try {
      customers = await listCustomers(userId);
    } catch (e) {
      listError = (e as Error).message;
    }
  }
  const [snap, drafts] = conn ? await Promise.all([getGoogleSnapshot(userId), listGoogleDrafts(userId)]) : [null, []];
  return (
    <section className="card mt-6 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-sm font-bold text-white">G</span>
        <h2 className="text-xl font-semibold">Google Ads</h2>
        {!live ? <Soon /> : conn && <On />}
      </div>
      {!live ? (
        <p className="mt-2 text-sm text-slate-600">Coming soon: sign in with Google and Helix reads your campaign spend and conversion value every day for ROAS by channel, and builds new Search campaigns as paused drafts after you approve. Until then, the Guide me tab under Campaigns walks you through Google Ads step by step.</p>
      ) : !conn ? (
        <>
          <p className="mt-2 text-sm text-slate-600">Sign in with Google. Helix reads campaign results (spend, clicks, conversions, conversion value) once a day into Scorecard and ROAS by channel. After you approve in Helix it can create a Search campaign, always PAUSED. You turn it on in Google Ads.</p>
          {paid ? <a href="/api/google-ads/connect" className="btn-primary mt-4 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect Google Ads</a> : <Link href="/dashboard/billing?need=starter&for=google" className="btn-dark mt-4 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect Google Ads · Starter</Link>}
        </>
      ) : (
        <div className="mt-4 space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Signed in as</dt><dd className="font-medium">{conn.googleEmail || "Google account"}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Ad account</dt><dd className="font-medium">{conn.customerName ?? "not picked"}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Last sync</dt><dd className="font-medium">{when(conn.lastSyncAt)}</dd></div>
          </dl>
          {conn.status !== "active" && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-900">{conn.status === "expired" ? "Your Google login has expired or was removed. Disconnect and connect again." : `Last sync failed: ${conn.lastSyncError}`}</p>}
          {!conn.customerId && (
            <form action={pickGoogleCustomer} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold">Pick the ad account Helix should read</p>
              {listError && <p className="mt-2 text-sm text-rose-700">Could not load your accounts: {listError}</p>}
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm"><span className="text-slate-600">Ad account</span>
                  <select name="customerId" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                    {customers.filter((c) => !c.manager).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.id}{c.currency ? `, ${c.currency}` : ""})</option>)}
                  </select>
                </label>
                <label className="text-sm"><span className="text-slate-600">Manager account ID (only if you reach it through one)</span>
                  <input name="loginCustomerId" placeholder="optional" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
              </div>
              <button className="btn-dark mt-4 text-sm">Save and sync</button>
            </form>
          )}
          {snap && snap.campaigns.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-sm font-semibold">Last 30 days: spend {snap.totals.spend.toFixed(2)} {snap.currency ?? ""}, ROAS {snap.totals.roas ?? "n/a"}</p>
              <table className="tbl mt-2 w-full text-xs">
                <thead><tr><th>Campaign</th><th>Status</th><th>Spend</th><th>Conv.</th><th>Value</th><th>ROAS</th></tr></thead>
                <tbody>{snap.campaigns.slice(0, 10).map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.status}</td><td>{c.spend.toFixed(2)}</td><td>{c.conversions}</td><td>{c.value.toFixed(2)}</td><td>{c.roas ?? "n/a"}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {drafts.length > 0 && <ul className="text-sm text-slate-700">{drafts.map((d) => <li key={d.id}>{when(d.createdAt)} · paused campaign {d.campaignId ?? "none"} · <strong>{d.status}</strong>{d.error ? ` · ${d.error}` : ""}</li>)}</ul>}
          <div className="flex flex-wrap items-center gap-3">
            <form action={syncGoogleNow}><button className="btn-primary text-sm" disabled={!conn.customerId}><RefreshCw className="h-4 w-4" aria-hidden /> Sync now</button></form>
            <Link href="/dashboard/campaigns/new" className="btn-ghost text-sm">Build a paused Search campaign</Link>
            <form action={disconnectGoogleAction} className="ml-auto"><button className="btn-ghost text-sm text-rose-700"><Unplug className="h-4 w-4" aria-hidden /> Disconnect</button></form>
          </div>
        </div>
      )}
    </section>
  );
}
