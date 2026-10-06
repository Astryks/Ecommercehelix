import Link from "next/link";
import { BookOpen, Check, ImageIcon, Lock, Rocket, Sparkles, Wand2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getDays, getSettings, listApprovals } from "@/lib/repo";
import { targetsFrom } from "@/lib/targets";
import { getConnection, listDrafts } from "@/lib/meta/store";
import { PLAN_RANK } from "@/lib/plans";
import { STRUCTURES, SWIPES, META_STEPS, GOOGLE_STEPS, PRELAUNCH } from "@/lib/seed/builder";
import { doItForMe } from "../../actions";

export default async function NewCampaign({ searchParams }: PageProps<"/dashboard/campaigns/new">) {
  const sp = await searchParams;
  const mode = sp.mode === "guide" ? "guide" : "draft";
  const u = await requireUser("/dashboard/campaigns/new");
  const [acct, approvals, days, settings, conn, drafts] = await Promise.all([getAccount(u.id), listApprovals(u.id), getDays(u.id), getSettings(u.id), getConnection(u.id), listDrafts(u.id)]);
  const ready = Boolean(conn?.adAccountId && conn.pageId && conn.pixelId);
  const pending = approvals.some((a) => a.taskId === "build-meta-campaign" && a.status === "pending");
  const canDo = PLAN_RANK[acct.plan] >= PLAN_RANK.starter;
  const t = targetsFrom(days, settings);
  const goodCpa = t.aov * (t.targetMerPct / 100) * 2;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard/campaigns" className="text-sm font-medium text-cyan-700 hover:underline">Your ads</Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Build a campaign</h1>
      <p className="mt-1 max-w-3xl text-slate-600">Two ways to work. Either way, Helix never switches on spend: you press Launch.</p>

      <div className="mt-6 inline-flex rounded-xl bg-white p-1 ring-1 ring-slate-200" role="tablist" aria-label="Build mode">
        <Link role="tab" aria-selected={mode === "draft"} href="/dashboard/campaigns/new" className={`rounded-xl px-4 py-2 text-sm font-semibold ${mode === "draft" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Draft &amp; you launch</Link>
        <Link role="tab" aria-selected={mode === "guide"} href="/dashboard/campaigns/new?mode=guide" className={`rounded-xl px-4 py-2 text-sm font-semibold ${mode === "guide" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Guide me</Link>
      </div>

      {mode === "draft" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="card p-6">
            <h2 className="text-lg font-semibold">Helix builds it in your account, paused</h2>
            <p className="mt-1 text-sm text-slate-600">Helix pushes everything below into your own Meta ad account as paused drafts. You review it in Ads Manager and press Launch. Google is coming next.</p>
            <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${ready ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
              {ready ? <>Ready: {conn!.adAccountName}, {conn!.pageName}, {conn!.pixelName}{conn!.mode === "mock" ? " (mock mode)" : ""}.</> : <>First <Link className="underline" href="/dashboard/integrations">connect Meta</Link> and pick your ad account, Page and pixel.</>}
            </p>
            <ol className="mt-5 space-y-3">
              {[
                ["Structure and naming", "03-Manual-Cold-Broad-Light-TEST-B16, one ad set, matched to your spend band"],
                ["Audience", "Broad, AU, 18 to 65+, light exclusions (purchasers 180 days)"],
                ["Budget suggestion", `$${Math.round(goodCpa * 2.5)}/day (2.5x your good cold CPA of $${goodCpa.toFixed(0)}), written into the paused draft only`],
                ["Copy", "3 primary texts, 3 headlines, UTMs on every link"],
                ["Creative", "Brief, 5 hook variants and 4 ads from your approved assets"],
                ["Rules", "Kill at $" + Math.round(goodCpa * 2) + " spend with CPA above $" + Math.round(goodCpa * 2) + "; scale +20% steps when CPA is under $" + goodCpa.toFixed(0)],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-600" aria-hidden />
                  <span><span className="font-semibold text-slate-900">{k}:</span> <span className="text-slate-700">{v}</span></span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
              {pending ? (
                <Link href="/dashboard/approvals" className="btn-ghost"><Sparkles className="h-4 w-4 text-violet-600" aria-hidden /> Waiting for your approval</Link>
              ) : (
                <form action={doItForMe}>
                  <input type="hidden" name="taskId" value="build-meta-campaign" />
                  <button className="btn-dark">{canDo ? <Wand2 className="h-4 w-4" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}{canDo ? "Build paused drafts in my account" : "Build paused drafts · Starter"}</button>
                </form>
              )}
              {drafts[0]?.campaignId && <Link href="/dashboard/integrations" className="btn-ghost">Last draft: {drafts[0].status}, {drafts[0].adIds.length} paused ads</Link>}
              <Link href="/learn/06-defining-campaigns#lesson-616-the-campaign-brief-template" className="btn-ghost"><BookOpen className="h-4 w-4 text-cyan-700" aria-hidden /> Campaign brief template</Link>
            </div>
          </section>
          <aside className="space-y-6">
            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-semibold"><Rocket className="h-4 w-4 text-violet-600" aria-hidden /> Before you press Launch</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">{PRELAUNCH.map((p) => <li key={p} className="flex gap-2"><span className="mt-1 h-3.5 w-3.5 flex-none rounded border border-slate-300" aria-hidden />{p}</li>)}</ul>
            </section>
            <section className="rounded-xl bg-ink p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">What Helix will never do</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Launch, resume or unpause anything</li>
                <li>Change a budget on a live campaign</li>
                <li>Touch billing or spend caps</li>
              </ul>
            </section>
          </aside>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-semibold">1. Pick a proven structure for your spend</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {STRUCTURES.map((s) => (
                <div key={s.band} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold">{s.band}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Meta</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-700">{s.meta.map((m) => <li key={m}>{m}</li>)}</ul>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-amber-700">Google</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-700">{s.google.map((m) => <li key={m}>{m}</li>)}</ul>
                  <p className="mt-3 text-xs text-slate-500">{s.note}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="card p-6">
            <div className="flex items-center gap-2"><h2 className="text-lg font-semibold">2. Swipe file</h2><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Example ads</span></div>
            <p className="mt-1 text-sm text-slate-600">Original examples for a made-up linen brand. Adapt the structure, not the words.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SWIPES.map((w) => (
                <article key={w.hook} className="rounded-xl border border-slate-200 p-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{w.format}</p>
                  <p className="mt-2 font-semibold text-slate-900">Hook: {w.hook}</p>
                  <p className="mt-2 text-slate-700">{w.primary}</p>
                  <p className="mt-2 text-xs text-slate-500">Headline: {w.headline} · CTA: {w.cta}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            {[["3. Build it in Meta Ads Manager", META_STEPS], ["4. Build it in Google Ads", GOOGLE_STEPS]].map(([title, steps]) => (
              <div key={title as string} className="card p-6">
                <h2 className="text-lg font-semibold">{title as string}</h2>
                <ol className="mt-4 space-y-3">
                  {(steps as typeof META_STEPS).map((s, i) => (
                    <li key={s.step} className="flex gap-3">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{s.step}</p>
                        <p className="text-sm text-slate-600">{s.detail}</p>
                        <div className="mt-2 flex h-16 items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400"><ImageIcon className="h-4 w-4" aria-hidden /> Screenshot placeholder: {s.shot}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>
          <p className="text-sm text-slate-600">Full lessons: <Link className="text-cyan-700 underline" href="/learn/20-ad-analysis-audiences-and-setup#lesson-203-setting-up-a-meta-sales-campaign-step-by-step">Meta setup</Link> · <Link className="text-cyan-700 underline" href="/learn/20-ad-analysis-audiences-and-setup#lesson-204-setting-up-google-step-by-step">Google setup</Link> · <Link className="text-cyan-700 underline" href="/learn/06-defining-campaigns">Defining campaigns</Link></p>
        </div>
      )}
    </div>
  );
}
