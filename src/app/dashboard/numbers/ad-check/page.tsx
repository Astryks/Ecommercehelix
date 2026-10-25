import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Stat } from "@/components/tools/ToolPage";

export const metadata = { title: "Monthly ad check" };

export default async function AdCheckPage() {
  const u = await requireUser("/dashboard/numbers/ad-check");
  const t = await computeTools(u.id);
  const a = t.adCheck;
  const C = { pass: "bg-emerald-50 text-emerald-800", warn: "bg-amber-50 text-amber-900", fail: "bg-rose-50 text-rose-900", skip: "bg-slate-100 text-slate-600" } as const;
  const W = { pass: "Pass", warn: "Watch", fail: "Fix", skip: "No data" } as const;
  return (
    <ToolPage title="Monthly ad check" intro="A quick health check of your ad accounts. It runs by itself each month and puts the top 3 fixes on Today." auto="on the 1st of each month from synced Meta and Google data" example={t.example} lesson={{ label: "Ad analysis and setup", href: "/learn/09-ad-analysis-audiences-and-setup" }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="tool-adcheck"><Stat k={`Score for ${a.month}`} v={`${a.score}/100`} /><Stat k="Fixes for Today" v={String(a.fixes.length)} /></div>
      <ul className="space-y-2">{a.items.map((i) => <li key={i.id} className="card flex items-start gap-3 p-4"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${C[i.grade]}`}>{W[i.grade]}</span><span><span className="block font-semibold text-slate-900">{i.name}</span><span className="block text-sm text-slate-700">{i.detail}</span>{i.fix && <a href={i.fix.href} className="text-sm text-cyan-700 underline">{i.fix.title}</a>}</span></li>)}</ul>
    </ToolPage>
  );
}
