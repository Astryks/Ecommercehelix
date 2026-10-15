import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Table } from "@/components/tools/ToolPage";
import { band, CATEGORY_LABEL, SIZE_LABEL } from "@/lib/tools/benchmarks";
import { saveStoreInputs } from "../tools/actions";

export const metadata = { title: "General guides" };

export default async function Benchmarks() {
  const u = await requireUser("/dashboard/numbers/benchmarks");
  const t = await computeTools(u.id);
  const b = t.bench;
  const f = (v: number | null, unit: string) => (v === null ? "–" : unit === "$" ? `$${Math.round(v)}` : `${Math.round(v * 10) / 10}%`);
  const LBL = { great: "Great", good: "Good", low: "Room to grow", none: "No data" } as const;
  return (
    <ToolPage title="General guides" intro="Where stores like yours often sit. These are Helix's rules of thumb, not averages from real stores. Use them as a rough guide and watch your own trend." auto="your store size updates as your sales grow" example={t.example}>
      <form action={saveStoreInputs} className="card flex flex-wrap items-end gap-3 p-4" data-testid="tool-bench">
        <p className="text-sm text-slate-700">Size: <strong>{SIZE_LABEL[b.size]}</strong> (from your sales).</p>
        <label className="text-sm"><span className="block font-semibold text-slate-900">What you sell</span>
          <select name="category" defaultValue={b.category} className="input mt-1">{Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <button className="btn-primary text-sm">Save</button>
      </form>
      <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"><span className="font-hand text-lg text-[#5A50D6]">For your type of store:</span> {b.categoryNote}</p>
      <Table head={["Number", "You (30 days)", "Room to grow", "Good", "Great", "Where you are", "Note"]} rows={b.guides.map((g) => [g.name, f(b.values[g.id], g.unit), `${g.higherIsBetter ? "under" : "over"} ${f(g.low, g.unit)}`, f(g.good, g.unit), f(g.great, g.unit), LBL[band(b.values[g.id], g)], g.note])} />
      <p className="text-xs text-slate-500">General guide only. Not survey data, and every store is different.</p>
    </ToolPage>
  );
}
