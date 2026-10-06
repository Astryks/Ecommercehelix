import Link from "next/link";
import { BookOpen, Lock, Mail, MessageSquare, Sparkles, Wand2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAccount, listApprovals } from "@/lib/repo";
import { FLOWS } from "@/lib/seed/flows";
import { PLAN_RANK, planName } from "@/lib/plans";
import { doItForMe } from "../actions";

export default async function EmailAutomation() {
  const u = await requireUser("/dashboard/email");
  const [acct, approvals] = await Promise.all([getAccount(u.id), listApprovals(u.id)]);
  const pending = new Set(approvals.filter((a) => a.status === "pending").map((a) => a.taskId));
  const approved = new Set(approvals.filter((a) => a.status === "approved").map((a) => a.taskId));
  const live = FLOWS.filter((f) => f.example.status === "live" || approved.has(`flow-${f.id}`)).length;
  const revenue = FLOWS.reduce((a, f) => a + f.example.revenue30d, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Email automation</h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">Example data</span>
          </div>
          <p className="mt-1 max-w-3xl text-slate-600">Helix suggests the flows you are missing, drafts every message in your voice, and sets them up in Klaviyo or Shopify Email after you approve.</p>
        </div>
        <div className="flex gap-2">
          <button disabled title="Coming soon" className="btn-ghost text-xs">Connect Klaviyo</button>
          <button disabled title="Coming soon" className="btn-ghost text-xs">Connect Shopify Email</button>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-slate-500">Flows live</p><p className="mt-1 text-2xl font-bold">{live} of {FLOWS.length}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Flow revenue, last 30 days</p><p className="mt-1 text-2xl font-bold">${revenue.toLocaleString("en-AU")}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Biggest gap</p><p className="mt-1 text-lg font-bold">Abandoned cart + win-back</p></div>
      </div>

      <div className="mt-6 space-y-4">
        {FLOWS.map((f) => {
          const id = `flow-${f.id}`;
          const isLive = f.example.status === "live" || approved.has(id);
          const canDo = PLAN_RANK[acct.plan] >= PLAN_RANK[f.tier];
          return (
            <details key={f.id} className="card group p-0" open={f.id === "abandoned-cart"}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-5 marker:hidden">
                <span className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden />
                <span className="font-semibold">{f.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${isLive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>{isLive ? "Live" : "Not set up"}</span>
                <span className="text-xs text-slate-500">{f.emails.length} messages · {f.trigger}</span>
                <span className="ml-auto text-sm font-semibold text-slate-700">{f.example.revenue30d ? `$${f.example.revenue30d.toLocaleString("en-AU")} / 30d` : ""}</span>
              </summary>
              <div className="border-t border-slate-100 p-5">
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <p><span className="font-semibold">Goal:</span> {f.goal}</p>
                  <p><span className="font-semibold">Exit when:</span> {f.exitWhen}</p>
                  <p><span className="font-semibold">Discount rule:</span> {f.discount}</p>
                </div>
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
                  <Link href="/learn/10-email-sms-whatsapp#lesson-102-the-five-core-flows-and-extras" className="btn-ghost"><BookOpen className="h-4 w-4 text-cyan-700" aria-hidden /> Show me how</Link>
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
