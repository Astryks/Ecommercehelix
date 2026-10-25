import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Stat, usd } from "@/components/tools/ToolPage";

export const metadata = { title: "New customer ad cost" };

export default async function AdCost() {
  const u = await requireUser("/dashboard/numbers/ad-cost");
  const t = await computeTools(u.id);
  const n = t.ncc;
  const max = Math.max(n.breakEven * 1.4, ...n.weeks.map((w) => w.pct ?? 0), 1);
  return (
    <ToolPage title="New customer ad cost" intro="Ad spend as a share of sales from brand-new customers. It shows if your ads win new buyers at a profit." auto="every day from ad spend and new-customer sales" example={t.example} lesson={{ label: "Read your ad results", href: "/learn/09-ad-analysis-audiences-and-setup" }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="tool-ncc">
        <Stat k="Last 4 weeks" v={n.current === null ? "–" : `${n.current}%`} note={n.status === "good" ? "On target" : n.status === "watch" ? "Above target, still under break-even" : n.status === "fix" ? "Over break-even: new buyers cost more than they leave" : "No new-customer sales yet"} />
        <Stat k="Target" v={`${n.target}%`} note="Leaves a quarter of the margin as profit" />
        <Stat k="Break-even" v={`${n.breakEven}%`} note="Your margin before ads" />
      </div>
      <section className="card p-5">
        <h2 className="font-hand text-xl text-cyan-700">Week by week</h2>
        <div className="mt-3 flex h-48 items-end gap-2" aria-label="Weekly new customer ad cost">
          {n.weeks.map((w) => (
            <div key={w.start} className="flex flex-1 flex-col items-center gap-1">
              <div className={`w-full rounded-t ${w.pct === null ? "bg-slate-200" : w.pct <= n.target ? "bg-emerald-500" : w.pct <= n.breakEven ? "bg-amber-400" : "bg-rose-500"}`} style={{ height: `${((w.pct ?? 2) / max) * 100}%` }} title={`${w.start}: ${w.pct ?? "–"}% (${usd(w.adSpend)} ads, ${usd(w.newRevenue)} new sales)`} />
              <span className="text-[10px] text-slate-500">{w.start.slice(5)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Green: on target. Amber: above target. Red: over break-even.</p>
      </section>
    </ToolPage>
  );
}
