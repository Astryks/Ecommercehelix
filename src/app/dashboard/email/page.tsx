import Link from "next/link";
import { BookOpen, Lock, Mail, MessageSquare, Sparkles, Wand2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, getDays, listApprovals } from "@/lib/repo";
import { FLOWS } from "@/lib/seed/flows";
import { PLAN_RANK, planName } from "@/lib/plans";
import { doItForMe } from "../actions";
import { flowStatuses } from "@/lib/agent/email-flows";
import { klaviyoSummary } from "@/lib/klaviyo/service";
import { klaviyoOn } from "@/lib/klaviyo/config";

export default async function EmailAutomation() {
  const u = await requireUser("/dashboard/email");
  const [acct, approvals, days] = await Promise.all([getAccount(u.id), listApprovals(u.id), getDays(u.id)]);
  const pending = new Set(approvals.filter((a) => a.status === "pending").map((a) => a.taskId));
  const approved = new Set(approvals.filter((a) => a.status === "approved").map((a) => a.taskId));
  // Step 3: real Klaviyo status when connected; example numbers stay example-labelled for everyone else.
  const klaviyo = klaviyoOn() ? await klaviyoSummary(u.id).catch(() => null) : null;
  const recent = days.filter((d) => !d.example).slice(-30);
  const hasRepeatBuyers = recent.some((d) => (d.newCustomerRevenue ?? 0) < (d.revenue - d.discounts - d.refunds));
  const statuses = flowStatuses({ klaviyo, hasRepeatBuyers, approvedFlowIds: [...approved].map((t) => t.replace(/^flow-/, "")) });
  const byId = new Map(statuses.map((s) => [s.flow.id, s]));
  const live = statuses.filter((s) => s.status === "live").length;
  const revenue = klaviyo ? klaviyo.flowRevenue30 : FLOWS.reduce((a, f) => a + f.example.revenue30d, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Email automation</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${klaviyo ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{klaviyo ? "Klaviyo connected — live data" : "Example data"}</span>
          </div>
          <p className="mt-1 max-w-3xl text-slate-600">Every flow most stores need, with timing, discount rules and full copy to paste into your email tool (for example Shopify Email). {klaviyo ? "Flows are created in Klaviyo in draft status first and go live only after your final check. Helix never sends email on its own." : "Klaviyo is not connected, so Helix gives you copy + timing to paste — labelled as such, never presented as a live flow."}</p>
        </div>
        <div className="flex gap-2">
                    <button disabled title="Coming soon" className="btn-ghost text-xs">Connect Shopify Email</button>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-slate-500">Flows live{klaviyo ? "" : " (example)"}</p><p className="mt-1 text-2xl font-bold">{live} of {FLOWS.length}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Flow revenue, last 30 days{klaviyo ? " (Klaviyo)" : " (example)"}</p><p className="mt-1 text-2xl font-bold">${revenue.toLocaleString("en-AU")}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Biggest gap{klaviyo ? "" : " (example)"}</p><p className="mt-1 text-lg font-bold">{statuses.filter((s) => s.status !== "live" && s.eligible).slice(0, 2).map((s) => s.flow.name).join(" + ") || "None — all flows live"}</p></div>
      </div>

      <div className="mt-6 space-y-4">
        {FLOWS.map((f) => {
          const id = `flow-${f.id}`;
          const st = byId.get(f.id);
          const isLive = st?.status === "live";
          const isDraft = st?.status === "draft";
          const canDo = PLAN_RANK[acct.plan] >= PLAN_RANK[f.tier];
          return (
            <details key={f.id} className="card group p-0" open={f.id === "abandoned-cart"}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-5 marker:hidden">
                <span className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500" : isDraft ? "bg-amber-500" : "bg-slate-300"}`} aria-hidden />
                <span className="font-semibold">{f.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${isLive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : isDraft ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>{isLive ? "Live" : isDraft ? "Draft — final check needed" : "Not set up"}</span>
                <span className="text-xs text-slate-500">{f.emails.length} messages · {f.trigger}</span>
                <span className="ml-auto text-sm font-semibold text-slate-700">{klaviyo ? "" : f.example.revenue30d ? `$${f.example.revenue30d.toLocaleString("en-AU")} / 30d (example)` : ""}</span>
              </summary>
              <div className="border-t border-slate-100 p-5">
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <p><span className="font-semibold">Goal:</span> {f.goal}</p>
                  <p><span className="font-semibold">Exit when:</span> {f.exitWhen}</p>
                  <p><span className="font-semibold">Discount rule:</span> {f.discount}</p>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {st && !st.eligible ? st.eligibilityReason : st?.setupMode === "klaviyo-draft" ? "Set up: draft in Klaviyo first, live only after your final check." : "Set up: copy + timing to paste into your email tool — not a live flow until you build it."}
                </p>
                <ol className="mt-4 space-y-3">
                  {f.emails.map((e, i) => (
                    <li key={i} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">{e.channel === "Email" ? <Mail className="h-4 w-4 text-cyan-700" aria-hidden /> : <MessageSquare className="h-4 w-4 text-violet-700" aria-hidden />}</span>
                      <div className="min-w-0 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{e.delay} · {e.channel}</p>
                        {e.channel === "Email" && <p className="font-semibold text-slate-900">{e.subject} <span className="font-normal text-slate-500">· {e.preview}</span></p>}
                        <p className="text-slate-700">{e.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {!isLive && (pending.has(id) ? (
                    <Link href="/dashboard/approvals" className="btn-ghost"><Sparkles className="h-4 w-4 text-violet-600" aria-hidden /> Waiting for your approval</Link>
                  ) : (
                    <form action={doItForMe}>
                      <input type="hidden" name="taskId" value={id} />
                      <button className="btn-dark">{canDo ? <Wand2 className="h-4 w-4" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}{canDo ? "Draft and set up for me" : `Set up for me · ${planName(f.tier)}`}</button>
                    </form>
                  ))}
                  <Link href="/learn/16-email-sms-whatsapp#lesson-162-the-five-core-flows-and-extras" className="btn-ghost"><BookOpen className="h-4 w-4 text-cyan-700" aria-hidden /> Show me how</Link>
                  <span className="text-xs text-slate-500">{f.benchmark}</span>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
