import type { Review } from "@/lib/tools/weekly-review";

type Action = (f: FormData) => Promise<void>;
const fmt = (id: string, v: number | null) => (v === null ? "–" : id === "mer" || id === "cr" ? `${v}%` : id === "orders" ? String(Math.round(v)) : `$${Math.round(v).toLocaleString("en-US")}`);

/** Monday review on Today: five numbers pre-filled, the biggest problem flagged, pick one fix and save. */
export function MondayReview({ r, saved, lastFix, action }: { r: Review; saved: { fixText: string | null } | null; lastFix: string | null; action: Action }) {
  return (
    <section id="review" className="card scroll-mt-6 p-5 sm:p-6" data-testid="monday-review">
      <h2 className="text-xl font-semibold text-slate-900">Monday review</h2>
      <p className="mt-1 text-sm text-slate-700">15 minutes. Five numbers. One fix. Helix filled these in from last week.</p>
      {lastFix && <p className="mt-2 text-sm text-slate-600"><span className="font-hand text-lg text-[#5A50D6]">Last week you picked:</span> {lastFix}. Did it help?</p>}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {r.numbers.map((n) => (
          <div key={n.id} className={`rounded-xl border p-3 ${r.worst?.id === n.id ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"}`}>
            <p className="text-xs text-slate-600">{n.name}</p>
            <p className="text-lg font-bold tabular-nums text-slate-900">{fmt(n.id, n.now)}</p>
            <p className="text-xs text-slate-500">{n.changePct === null ? "No week before" : `${n.changePct > 0 ? "+" : ""}${n.changePct}% vs last week`}</p>
            {n.target !== null && <p className="text-xs text-slate-500">Target {fmt(n.id, n.target)}</p>}
            {r.worst?.id === n.id && <p className="mt-1 text-xs font-semibold text-rose-700">Biggest problem</p>}
          </div>
        ))}
      </div>
      {saved ? (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Saved. This week&apos;s fix: <strong>{saved.fixText}</strong>. Helix will ask how it went next Monday.</p>
      ) : (
        <form action={action} className="mt-4 space-y-2">
          <p className="font-semibold text-slate-900">{r.worst ? `Pick one fix for ${r.worst.name.toLowerCase()}:` : "Everything looks steady. Pick one thing to try:"}</p>
          {(r.fixes.length ? r.fixes : [{ id: "email", label: "Send one email to your list", href: "" }, { id: "new-ad", label: "Test one new ad idea", href: "" }]).map((f, i) => (
            <label key={f.id} className="flex items-center gap-2 text-sm text-slate-800"><input type="radio" name="fix" value={f.id} defaultChecked={i === 0} className="accent-[#5A50D6]" /> {f.label}</label>
          ))}
          <label className="flex items-center gap-2 text-sm text-slate-800"><input type="radio" name="fix" value="own" className="accent-[#5A50D6]" /> My own: <input name="own" maxLength={200} className="input flex-1 py-1 text-sm" placeholder="e.g. Call my supplier about price" /></label>
          <button className="btn-primary text-sm">Save my fix</button>
        </form>
      )}
    </section>
  );
}
