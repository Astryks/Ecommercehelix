import Link from "next/link";
import { CheckCircle2, FileSpreadsheet, Keyboard, Link2, Upload } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/lib/repo";
import { PLAN_RANK } from "@/lib/plans";
import { shopifyMode } from "@/lib/shopify/config";
import { googleAdsMode } from "@/lib/google-ads/config";
import { metaMode } from "@/lib/meta/config";
import { getShopify } from "@/lib/shopify/service";
import { getGoogleAds } from "@/lib/google-ads/service";
import { getConnection } from "@/lib/meta/store";
import { LostLink } from "@/components/dashboard/LostLink";
import { connectShopifyCustomApp, importSheet } from "./actions";

export const metadata = { title: "Connect your tools" };

const MSG: Record<string, [string, string]> = {
  shopify: ["ok", "Shopify is connected and your last 60 days of orders are in."],
  shopify_nosync: ["ok", "Shopify is connected. The first sync did not finish; press Sync now in Connections."],
  shopify_shop: ["err", "That store address did not look right. Use yourstore.myshopify.com."],
  shopify_token: ["err", "That token did not look right. It starts with shpat_."],
  shopify_rejected: ["err", "Shopify did not accept that token. Check the store address and that the app can read orders."],
  sheet: ["ok", "Your sheet is imported."],
  sheet_url: ["err", "Paste the link to a Google Sheet (docs.google.com/spreadsheets/...)."],
  sheet_access: ["err", "Helix could not open that sheet. In Google Sheets press Share and pick “Anyone with the link can view”."],
  sheet_empty: ["err", "No rows came in. The sheet needs a date column (YYYY-MM-DD) and columns like revenue and orders."],
  tiktok_not_configured: ["err", "TikTok Ads connect is not switched on yet. For now add TikTok spend in your sheet, a CSV or by hand."],
  tiktok_pending: ["ok", "TikTok sign-in worked. Daily TikTok spend sync is coming soon; add it by hand until then."],
  tiktok_state: ["err", "That TikTok sign-in expired. Please try again."],
};

function Card({ title, status, children, connected }: { title: string; status: string; connected?: boolean; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-hand text-xl text-cyan-700">{title}</h2>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${connected ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{connected && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}{status}</span>
      </div>
      {children}
    </section>
  );
}

export default async function ConnectTools({ searchParams }: PageProps<"/dashboard/connect">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/connect");
  const [acct, shop, ga, meta] = await Promise.all([getAccount(u.id), getShopify(u.id), getGoogleAds(u.id), getConnection(u.id)]);
  const paid = PLAN_RANK[acct.plan] >= PLAN_RANK.starter;
  const key = typeof sp.ok === "string" ? sp.ok : typeof sp.err === "string" ? sp.err : "";
  const flash = MSG[key];
  const tiktokOn = Boolean(process.env.TIKTOK_APP_ID && process.env.TIKTOK_APP_SECRET);
  const upgrade = (f: string) => <Link href={`/dashboard/billing?need=starter&for=${f}`} className="btn-dark mt-3 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect · Starter</Link>;
  return (
    <div className="mx-auto max-w-4xl space-y-5" data-testid="connect-tools">
      <p className="text-sm"><Link href="/dashboard/settings" className="text-cyan-700 hover:underline">Settings</Link> / Connect your tools</p>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Connect your tools</h1>
        <p className="mt-1 text-slate-700">Connect once and your daily numbers fill in by themselves every morning, like a tracking sheet that keeps itself up to date.</p>
      </header>
      {flash && <p className={`rounded-xl border p-3 text-sm ${flash[0] === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>{flash[1]}{key === "sheet" && sp.n ? ` ${sp.n} days added.` : ""}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Shopify" status={shop ? `Connected: ${shop.shopName || shop.shop}` : "Not connected"} connected={Boolean(shop)}>
          <p className="mt-1 text-sm text-slate-700">Sales, orders, items sold, refunds and product costs, every day.</p>
          {shop ? <Link href="/dashboard/integrations" className="btn-ghost mt-3 text-sm">Manage Shopify</Link> : !paid ? upgrade("shopify") : (
            <>
              {shopifyMode() === "live" && (
                <form action="/api/shopify/install" method="get" className="mt-3 flex gap-2">
                  <input name="shop" required placeholder="yourstore.myshopify.com" className="input flex-1 text-sm" aria-label="Shopify store address" />
                  <button className="btn-primary text-sm">Connect</button>
                </form>
              )}
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium text-slate-700">Or use a custom app token</summary>
                <p className="mt-2 text-slate-600">In Shopify admin: Settings, Apps, Develop apps, Create an app. Allow read_orders, read_products and read_inventory, install it and copy the Admin API token.</p>
                <form action={connectShopifyCustomApp} className="mt-2 space-y-2">
                  <input name="shop" required placeholder="yourstore.myshopify.com" className="input w-full text-sm" aria-label="Store address" />
                  <input name="token" required type="password" autoComplete="off" placeholder="shpat_..." className="input w-full text-sm" aria-label="Admin API token" />
                  <button className="btn-primary text-sm">Connect with token</button>
                </form>
              </details>
            </>
          )}
        </Card>
        <Card title="Meta Ads" status={meta ? "Connected" : metaMode() === "off" ? "Not set up yet" : "Not connected"} connected={Boolean(meta)}>
          <p className="mt-1 text-sm text-slate-700">Facebook and Instagram ad spend and sales, every day.</p>
          {meta ? <Link href="/dashboard/integrations" className="btn-ghost mt-3 text-sm">Manage Meta</Link> : !paid ? upgrade("meta") : <a href="/api/meta/connect" className="btn-primary mt-3 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect Meta</a>}
        </Card>
        <Card title="Google Ads" status={ga?.customerId ? "Connected" : googleAdsMode() === "live" ? "Not connected" : "Not set up yet"} connected={Boolean(ga?.customerId)}>
          <p className="mt-1 text-sm text-slate-700">Google ad spend and sales, every day.</p>
          {ga ? <Link href="/dashboard/integrations" className="btn-ghost mt-3 text-sm">Manage Google Ads</Link> : !paid ? upgrade("google") : <a href="/api/google-ads/connect" className="btn-primary mt-3 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect Google Ads</a>}
        </Card>
        <Card title="TikTok Ads" status={tiktokOn ? "Sign-in ready, sync coming soon" : "Coming soon"}>
          <p className="mt-1 text-sm text-slate-700">TikTok ad spend, every day. Until it is ready, add TikTok spend in your sheet, a CSV or by hand.</p>
          {tiktokOn && paid ? <a href="/api/tiktok/connect" className="btn-primary mt-3 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect TikTok Ads</a> : <button disabled className="btn-ghost mt-3 cursor-not-allowed text-sm opacity-60">Connect TikTok Ads</button>}
        </Card>
        <Card title="Google Sheets" status="Import any time">
          <p className="mt-1 text-sm text-slate-700">Already track your days in a sheet? Share it as “Anyone with the link can view” and paste the link. Columns: date, revenue, orders, sessions, adMeta, adGoogle, adTiktok, cogs, shipping, paymentFees.</p>
          <form action={importSheet} className="mt-3 flex gap-2">
            <input name="url" required type="url" placeholder="https://docs.google.com/spreadsheets/d/..." className="input flex-1 text-sm" aria-label="Google Sheet link" />
            <button className="btn-primary text-sm"><FileSpreadsheet className="h-4 w-4" aria-hidden /> Import</button>
          </form>
        </Card>
        <Card title="CSV or by hand" status="Always works">
          <p className="mt-1 text-sm text-slate-700">No connection? Upload a CSV or type a day in. It takes about two minutes.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/dashboard/scorecard#import" className="btn-ghost text-sm"><Upload className="h-4 w-4" aria-hidden /> Upload a CSV</Link>
            <Link href="/dashboard/scorecard" className="btn-ghost text-sm"><Keyboard className="h-4 w-4" aria-hidden /> Type in a day</Link>
            <a href="/scorecard-template.csv" download className="btn-ghost text-sm">CSV template</a>
          </div>
        </Card>
      </div>
      <p className="text-xs text-slate-500">Helix only reads your numbers. It never changes your store or spends money without your OK. <LostLink about="Connecting my tools" /></p>
    </div>
  );
}
