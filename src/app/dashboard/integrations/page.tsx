import Link from "next/link";
import { CheckCircle2, Link2, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { requireUser } from "@/lib/session";
import { metaMode, META_SCOPES, GRAPH_VERSION } from "@/lib/meta/config";
import { getConnection, listAudit, listDrafts } from "@/lib/meta/store";
import { listAssets } from "@/lib/meta/service";
import { disconnectMetaAction, pickMetaAssets, syncMetaNow } from "./actions";

const MSG: Record<string, [string, string]> = {
  connected: ["ok", "Meta is connected. Now pick your ad account, Page and pixel."],
  saved: ["ok", "Saved. If you just picked an ad account, now pick its pixel, then press Sync now."],
  synced: ["ok", "Synced. Your campaign tracker, scorecard ad spend and insights are up to date."],
  disconnected: ["ok", "Meta is disconnected. Helix deleted your token and synced data."],
  state: ["err", "That sign-in link expired or did not match. Please try again."],
  denied: ["err", "You cancelled the Meta sign-in. Nothing was connected."],
  exchange: ["err", "Meta did not accept the sign-in. Check the app settings in docs/meta-setup.md."],
  sync: ["err", "The sync failed. See the activity log below."],
  not_configured: ["err", "The Meta app is not set up on this server yet."],
};

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short" }) + " Sydney" : "never");

export default async function Integrations({ searchParams }: PageProps<"/dashboard/integrations">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/integrations");
  const mode = metaMode();
  const [conn, audit, drafts] = await Promise.all([getConnection(u.id), listAudit(u.id, 30), listDrafts(u.id)]);
  let assets: Awaited<ReturnType<typeof listAssets>> | null = null;
  let assetError = "";
  if (conn) {
    try {
      assets = await listAssets(u.id, conn.adAccountId);
    } catch (e) {
      assetError = (e as Error).message;
    }
  }
  const flash = Object.keys(MSG).find((k) => sp[k] !== undefined || sp.error === k);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
      <p className="mt-1 max-w-3xl text-slate-600">Connect your ad accounts so Helix can read your results every day and build new campaigns as paused drafts. Helix never turns on spend.</p>

      {flash && (
        <p className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${MSG[flash][0] === "ok" ? "border border-emerald-200 bg-emerald-50 text-emerald-900" : "border border-rose-200 bg-rose-50 text-rose-900"}`}>{MSG[flash][1]}</p>
      )}

      <section className="card mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">M</span>
              <h2 className="text-xl font-semibold">Meta (Facebook and Instagram ads)</h2>
              {mode === "mock" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Mock mode</span>}
              {conn && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">Connected</span>}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {mode === "mock" ? "No Meta app is configured, so this uses realistic sample data and makes no network calls. Everything else works the same, including the paused-only safety checks." : mode === "off" ? "The Meta app is not configured on this server yet." : `Uses Facebook Login for Business and Marketing API ${GRAPH_VERSION}.`}
            </p>
          </div>
          {!conn && mode !== "off" && (
            <a href="/api/meta/connect" className="btn-dark"><Link2 className="h-4 w-4" aria-hidden /> Connect Meta</a>
          )}
        </div>

        {!conn && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">What Helix will do</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Read your campaign results once a day (spend, sales, cost per sale).</li>
                <li>Add your daily Meta ad spend to your scorecard.</li>
                <li>Build new campaigns as paused drafts, only after you approve.</li>
              </ol>
            </div>
            <div className="rounded-xl bg-ink p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">What Helix will never do</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Turn on a campaign or ad. You press Launch.</li>
                <li>Change a budget on a live campaign.</li>
                <li>Delete anything in your account.</li>
              </ul>
            </div>
            <p className="text-xs text-slate-500 md:col-span-2">Permissions requested: {META_SCOPES.join(", ")}. Your access token is encrypted before it is stored.</p>
          </div>
        )}

        {conn && (
          <div className="mt-5 space-y-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Signed in as</dt><dd className="font-medium">{conn.fbUserName || conn.fbUserId}</dd></div>
              <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Login expires</dt><dd className="font-medium">{when(conn.tokenExpiresAt)}</dd></div>
              <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Last sync</dt><dd className="font-medium">{when(conn.lastSyncAt)}</dd></div>
            </dl>
            {conn.status !== "active" && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-900">{conn.status === "expired" ? "Your Meta login has expired. Disconnect and connect again." : `Last sync failed: ${conn.lastSyncError}`}</p>}

            <form action={pickMetaAssets} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold">1. Pick what Helix should use</p>
              {assetError && <p className="mt-2 text-sm text-rose-700">Could not load your accounts: {assetError}</p>}
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-sm"><span className="text-slate-600">Ad account</span>
                  <select name="adAccountId" defaultValue={conn.adAccountId ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="" disabled>Choose an ad account</option>
                    {assets?.accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                  </select>
                </label>
                <label className="text-sm"><span className="text-slate-600">Facebook Page (ads run from it)</span>
                  <select name="pageId" defaultValue={conn.pageId ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Choose a Page</option>
                    {assets?.pages.map((p) => <option key={p.id} value={p.id}>{p.name}{p.instagram_business_account?.username ? ` + @${p.instagram_business_account.username}` : ""}</option>)}
                  </select>
                </label>
                <label className="text-sm"><span className="text-slate-600">Pixel (tracks sales)</span>
                  <select name="pixelId" defaultValue={conn.pixelId ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">{conn.adAccountId ? "Choose a pixel" : "Save an ad account first"}</option>
                    {assets?.pixels.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
              </div>
              <button className="btn-dark mt-4 text-sm"><CheckCircle2 className="h-4 w-4" aria-hidden /> Save choices</button>
              {conn.adAccountName && <p className="mt-2 text-xs text-slate-500">Using {conn.adAccountName}{conn.pageName ? `, ${conn.pageName}` : ""}{conn.pixelName ? `, ${conn.pixelName}` : ""}.</p>}
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <form action={syncMetaNow}><button className="btn-primary text-sm" disabled={!conn.adAccountId}><RefreshCw className="h-4 w-4" aria-hidden /> 2. Sync now</button></form>
              <Link href="/dashboard/campaigns" className="btn-ghost text-sm">Open campaign tracker</Link>
              <Link href="/dashboard/campaigns/new" className="btn-ghost text-sm">Build a paused draft</Link>
              <form action={disconnectMetaAction} className="ml-auto"><button className="btn-ghost text-sm text-rose-700"><Unplug className="h-4 w-4" aria-hidden /> Disconnect</button></form>
            </div>
            <p className="text-xs text-slate-500">Helix syncs automatically every morning at about 6:00 Sydney time.</p>
          </div>
        )}
      </section>

      {drafts.length > 0 && (
        <section className="card mt-6 p-6">
          <h2 className="font-semibold">Paused drafts Helix created</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {drafts.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>{when(d.createdAt)} · campaign {d.campaignId ?? "none"} · {d.adIds.length} ads · <strong>{d.status}</strong>{d.error ? ` · ${d.error}` : ""}</span>
                {d.campaignId && conn?.adAccountId && (
                  <a className="text-cyan-700 underline" target="_blank" rel="noreferrer" href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${conn.adAccountId.replace("act_", "")}&selected_campaign_ids=${d.campaignId}`}>Review in Ads Manager</a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden /> Activity log</h2>
        <p className="mt-1 text-sm text-slate-600">Every call Helix makes to Meta, and every action you approved or Helix blocked.</p>
        {audit.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="tbl w-full text-xs">
              <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Result</th></tr></thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td>{when(a.createdAt)}</td><td>{a.actor}</td><td>{a.action}</td>
                    <td className="font-mono">{a.target}</td>
                    <td className={a.outcome === "ok" ? "text-emerald-700" : a.outcome === "retry" ? "text-amber-700" : "text-rose-700"}>{a.outcome}{a.httpStatus ? ` ${a.httpStatus}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {["Google Ads", "Shopify", "Klaviyo"].map((n) => (
          <div key={n} className="card p-5 text-sm"><p className="font-semibold">{n}</p><p className="mt-1 text-slate-500">Coming next.</p></div>
        ))}
      </section>
    </div>
  );
}
