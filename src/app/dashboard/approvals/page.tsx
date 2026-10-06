import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listApprovals } from "@/lib/repo";
import { decide } from "../actions";

export default async function Approvals() {
  const u = await requireUser("/dashboard/approvals");
  const rows = await listApprovals(u.id);
  const pending = rows.filter((r) => r.status === "pending");
  const history = rows.filter((r) => r.status !== "pending");
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
      <p className="mt-1 text-slate-600">Helix never changes your store, ads or emails until you approve here.</p>
      <section className="mt-8 space-y-4">
        {pending.length === 0 && (
          <div className="card p-8 text-center text-slate-600">
            Nothing waiting. Tap <strong>Do it for me</strong> on a task in <Link className="text-cyan-700 underline" href="/dashboard">Today</Link> and Helix will prepare it here.
          </div>
        )}
        {pending.map((a) => (
          <article key={a.id} className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{a.title}</h2>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200">Est. AI cost ${a.estAiCost.toFixed(2)}</span>
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{a.detail}</pre>
            <p className="mt-3 text-xs text-slate-500">Ad changes are created paused; launching and budget changes on live campaigns stay with you. Execution against live platforms is stubbed in this version: approving marks the task done and logs the decision.</p>
            <form action={decide} className="mt-4 flex gap-3">
              <input type="hidden" name="id" value={a.id} />
              <button name="decision" value="approve" className="btn-primary">Approve</button>
              <button name="decision" value="reject" className="btn-ghost">Reject</button>
            </form>
          </article>
        ))}
      </section>
      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">History</h2>
          <ul className="card mt-3 divide-y divide-slate-100">
            {history.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{a.title}</span>
                <span className={a.status === "approved" ? "text-emerald-700" : "text-slate-500"}>{a.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
