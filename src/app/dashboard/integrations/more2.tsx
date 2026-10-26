import Link from "next/link";
import { BarChart3, Link2, Mail, RefreshCw, Unplug } from "lucide-react";
import { hasDb, prisma } from "@/lib/db";
import { klaviyoOn, KLAVIYO_SCOPES, type KlaviyoSummary } from "@/lib/klaviyo/config";
import { getKlaviyo } from "@/lib/klaviyo/service";
import { tiktokMode } from "@/lib/tiktok/config";
import { getTikTok } from "@/lib/tiktok/service";
import { ga4On, googleAdsMode } from "@/lib/google-ads/config";
import { connectKlaviyoAction, disconnectKlaviyoAction, disconnectTikTokAction, pickTikTokAction, saveGa4Action, syncKlaviyoAction, syncTikTokAction } from "./more-actions";

export const MORE2_MSG: Record<string, [string, string]> = {
  klaviyo_connected: ["ok", "Klaviyo is connected. Helix pulled your email totals. Daily numbers appear from tomorrow."],
  klaviyo_synced: ["ok", "Klaviyo synced."],
  klaviyo_disconnected: ["ok", "Klaviyo is disconnected. Helix deleted your key and every Klaviyo total."],
  tiktok_saved: ["ok", "Saved. Helix is reading this TikTok ad account's daily spend."],
  tiktok_synced: ["ok", "TikTok synced. Scorecard ad spend is up to date."],
  tiktok_disconnected: ["ok", "TikTok is disconnected. Helix deleted the token."],
  tiktok_soon: ["err", "TikTok Ads connect is coming soon."],
  ga4_saved: ["ok", "Saved. Helix pulled your last 30 days of sessions from GA4."],
  ga4_soon: ["err", "Google Analytics connect is coming soon."],
};
export const msgFrom = (sp: Record<string, string | string[] | undefined>): [string, string] | null => {
  for (const k of ["klaviyo_err", "tiktok_err", "ga4_err"]) if (typeof sp[k] === "string") return ["err", String(sp[k])];
  if (sp.tiktok === "soon") return MORE2_MSG.tiktok_soon;
  if (sp.ga4 === "soon") return MORE2_MSG.ga4_soon;
  const k = Object.keys(MORE2_MSG).find((x) => sp[x] !== undefined);
  return k ? MORE2_MSG[k] : null;
};

const when = (d: Date | null | undefined) => (d ? d.toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short" }) : "never");
const Soon = () => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">Coming soon</span>;
const On = () => <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">Connected</span>;
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;

/** Plain-language explainer, shown on the card before connecting. */
export function KlaviyoExplainer() {
  return (
    <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
      <div className="rounded-xl bg-slate-50 p-4"><p className="font-semibold text-slate-900">What is Klaviyo?</p><p className="mt-1">An email and text tool. It sends automatic emails for you, like a welcome email, an abandoned cart reminder and a thank-you after someone buys.</p></div>
      <div className="rounded-xl bg-slate-50 p-4"><p className="font-semibold text-slate-900">Why connect it?</p><p className="mt-1">Helix reads your email results, so your coach and What to fix can tell you which emails make money and which ones to turn on.</p></div>
      <div className="rounded-xl bg-slate-50 p-4"><p className="font-semibold text-slate-900">4 simple steps</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5"><li>In Klaviyo, go to Settings, then API keys.</li><li>Create a private key with Read-only access (see the list below).</li><li>Copy the key and paste it here.</li><li>See your email numbers in Helix from the next day.</li></ol></div>
      <div className="rounded-xl bg-ink p-4 text-slate-300"><p className="font-semibold text-white">What Helix stores</p><p className="mt-1">Totals only: email revenue, sends, opens, clicks, list size and which flows are on. No customer names or emails. Your key is encrypted. Disconnect any time and Helix deletes it.</p></div>
    </div>
  );
}

export async function KlaviyoCard({ userId, paid }: { userId: string; paid: boolean }) {
  const live = klaviyoOn() && hasDb;
  const conn = live ? await getKlaviyo(userId).catch(() => null) : null;
  const s = (conn?.summary ?? null) as KlaviyoSummary | null;
  return (
    <section className="card mt-6 p-6" id="klaviyo">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white"><Mail className="h-4 w-4" aria-hidden /></span>
        <h2 className="text-xl font-semibold">Klaviyo (email)</h2>
        {!live ? <Soon /> : conn && <On />}
        <Link href="/dashboard/learn/klaviyo" className="ml-auto text-sm text-cyan-700 underline">How this works</Link>
      </div>
      {!conn && <KlaviyoExplainer />}
      {live && !conn && (
        paid ? (
          <form action={connectKlaviyoAction} className="mt-4 rounded-xl border border-slate-200 p-4">
            <label className="text-sm"><span className="font-semibold text-slate-900">Your Klaviyo private API key</span>
              <input name="key" type="password" autoComplete="off" required placeholder="pk_..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono" />
            </label>
            <p className="mt-2 text-xs text-slate-500">Give the key Read access to: {KLAVIYO_SCOPES.join(", ")}. Leave everything else on No access. Helix only reads totals.</p>
            <button className="btn-primary mt-3 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect Klaviyo</button>
          </form>
        ) : <Link href="/dashboard/billing?need=starter&for=klaviyo" className="btn-dark mt-4 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect Klaviyo · Starter</Link>
      )}
      {conn && (
        <div className="mt-4 space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Account</dt><dd className="font-medium">{conn.accountName || "Klaviyo"} · key ending {conn.keyHint}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Email revenue, 30 days</dt><dd className="font-medium">{s ? money(s.revenue30) : "after first sync"}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Last sync</dt><dd className="font-medium">{when(conn.lastSyncAt)}</dd></div>
          </dl>
          {s && <p className="text-sm text-slate-600">Sends {s.sends30.toLocaleString("en-US")} · opens {pct(s.openRate)} · clicks {pct(s.clickRate)} · list {s.listSize.toLocaleString("en-US")} ({s.listGrowth30 >= 0 ? "+" : ""}{s.listGrowth30}) · welcome {s.flows.welcome}, abandoned cart {s.flows.abandoned}, post-purchase {s.flows["post-purchase"]}</p>}
          {conn.lastSyncError && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">{conn.lastSyncError}</p>}
          <div className="flex flex-wrap gap-2">
            <form action={syncKlaviyoAction}><button className="btn-ghost text-sm"><RefreshCw className="h-4 w-4" aria-hidden /> Sync now</button></form>
            <form action={disconnectKlaviyoAction}><button className="btn-ghost text-sm text-rose-700"><Unplug className="h-4 w-4" aria-hidden /> Revoke and delete</button></form>
          </div>
        </div>
      )}
    </section>
  );
}

export async function TikTokCard({ userId, paid }: { userId: string; paid: boolean }) {
  const live = tiktokMode() === "live";
  const conn = live ? await getTikTok(userId).catch(() => null) : null;
  const ids = conn?.advertiserIds.split(",").filter(Boolean) ?? [];
  return (
    <section className="card mt-6 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">T</span>
        <h2 className="text-xl font-semibold">TikTok Ads</h2>
        {!live ? <Soon /> : conn && <On />}
      </div>
      {!live ? <p className="mt-2 text-sm text-slate-600">Coming soon: connect TikTok and Helix adds your daily TikTok ad spend to Scorecard and ROAS by channel. For now, type TikTok spend in on Scorecard.</p>
        : !conn ? (
          <>
            <p className="mt-2 text-sm text-slate-600">Sign in with TikTok. Helix reads daily ad spend only. It never changes your ads.</p>
            {paid ? <a href="/api/tiktok/connect" className="btn-primary mt-4 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect TikTok Ads</a> : <Link href="/dashboard/billing?need=starter&for=tiktok" className="btn-dark mt-4 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect TikTok Ads · Starter</Link>}
          </>
        ) : (
          <div className="mt-4 space-y-4">
            <form action={pickTikTokAction} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold">Pick the TikTok ad account Helix should read</p>
              {ids.length === 0 && <p className="mt-2 text-sm text-rose-700">TikTok did not share any ad accounts. Disconnect, then connect again and tick your ad account.</p>}
              <select name="advertiserId" defaultValue={conn.advertiserId ?? ""} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-1/2">
                <option value="" disabled>Choose an ad account</option>
                {ids.map((id) => <option key={id} value={id}>Ad account {id}</option>)}
              </select>
              <button className="btn-primary mt-3 text-sm">Save</button>
            </form>
            <p className="text-sm text-slate-600">Last sync: {when(conn.lastSyncAt)}{conn.lastSyncError ? ` · ${conn.lastSyncError}` : ""}</p>
            <div className="flex flex-wrap gap-2">
              {conn.advertiserId && <form action={syncTikTokAction}><button className="btn-ghost text-sm"><RefreshCw className="h-4 w-4" aria-hidden /> Sync now</button></form>}
              <form action={disconnectTikTokAction}><button className="btn-ghost text-sm text-rose-700"><Unplug className="h-4 w-4" aria-hidden /> Disconnect</button></form>
            </div>
          </div>
        )}
    </section>
  );
}

export async function Ga4Card({ userId, paid }: { userId: string; paid: boolean }) {
  const live = ga4On() && googleAdsMode() === "live" && hasDb;
  const [prop, google] = live ? await Promise.all([prisma.ga4Property.findUnique({ where: { userId } }).catch(() => null), prisma.googleAdsConnection.findUnique({ where: { userId }, select: { scopes: true } }).catch(() => null)]) : [null, null];
  const hasScope = google?.scopes.includes("analytics.readonly") ?? false;
  return (
    <section className="card mt-6 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white"><BarChart3 className="h-4 w-4" aria-hidden /></span>
        <h2 className="text-xl font-semibold">Google Analytics (GA4)</h2>
        {!live ? <Soon /> : prop && hasScope && <On />}
      </div>
      {!live ? <p className="mt-2 text-sm text-slate-600">Coming soon: connect GA4 and Helix adds your daily store visits (sessions) to Scorecard, so it can work out your conversion rate. Optional, and separate from your normal sign-in.</p>
        : !paid ? <Link href="/dashboard/billing?need=starter&for=ga4" className="btn-dark mt-4 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect GA4 · Starter</Link>
        : !hasScope ? (
          <>
            <p className="mt-2 text-sm text-slate-600">Optional. Google will ask you to allow read-only access to Analytics. Helix reads daily sessions only. Your normal sign-in never asks for this.</p>
            <a href="/api/google-ads/connect?ga4=1" className="btn-primary mt-4 text-sm"><Link2 className="h-4 w-4" aria-hidden /> Connect GA4</a>
          </>
        ) : (
          <form action={saveGa4Action} className="mt-4 rounded-xl border border-slate-200 p-4">
            <label className="text-sm"><span className="font-semibold text-slate-900">GA4 property ID</span>
              <input name="property" inputMode="numeric" defaultValue={prop?.propertyId ?? ""} placeholder="123456789" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 md:w-1/2" />
            </label>
            <p className="mt-2 text-xs text-slate-500">In Google Analytics, open Admin, then Property details. Copy the number at the top right.</p>
            {prop && <p className="mt-2 text-sm text-slate-600">Last sync: {when(prop.lastSyncAt)}{prop.lastSyncError ? ` · ${prop.lastSyncError}` : ""}</p>}
            <button className="btn-primary mt-3 text-sm">Save and sync</button>
          </form>
        )}
    </section>
  );
}
