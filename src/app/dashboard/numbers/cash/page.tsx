import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Stat, Table, usd } from "@/components/tools/ToolPage";
import { saveCashInputs } from "../tools/actions";

export const metadata = { title: "Cash plan" };

export default async function CashPage() {
  const u = await requireUser("/dashboard/numbers/cash");
  const t = await computeTools(u.id);
  const c = t.cash;
  return (
    <ToolPage title="Cash plan" intro="See your bank balance 13 weeks ahead. Spot a tight week before it arrives." auto="every day from your forecast, stock orders, ads and bills" example={t.example} lesson={{ label: "Cash and stock planning", href: "/learn/14-inventory-cash-planning" }}>
      <form action={saveCashInputs} className="card flex flex-wrap items-end gap-3 p-4" data-testid="tool-cash">
        <label className="text-sm"><span className="block font-semibold text-slate-900">Money in the bank today (USD)</span><input name="startBalance" defaultValue={t.cashIn.startBalance ?? ""} placeholder="e.g. 12000" className="input mt-1 w-48" inputMode="numeric" required /></label>
        <label className="text-sm"><span className="block font-semibold text-slate-900">Warn me below</span><input name="floor" defaultValue={t.cashIn.floor} className="input mt-1 w-36" inputMode="numeric" /></label>
        <button className="btn-primary text-sm">Save</button>
        <span className="text-xs text-slate-500">The only number Helix cannot read for you. Update it now and then.</span>
      </form>
      {!c ? <p className="card p-5 text-slate-700">Type in your bank balance above and Helix fills in the 13 weeks.</p> : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat k="Lowest week" v={usd(c.lowest.end)} note={`Week of ${c.lowest.start}`} />
            <Stat k="In 13 weeks" v={usd(c.weeks.at(-1)!.end)} />
            <Stat k="Tight weeks" v={String(c.weeks.filter((w) => w.low).length)} note={c.firstLow ? `First: ${c.firstLow.start}` : "None. Nice."} />
          </div>
          {c.firstLow && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">Cash may drop under {usd(c.floor)} the week of {c.firstLow.start}. Helix added a task on Today.</p>}
          <Table head={["Week of", "Money in", "Ads", "Product, shipping, fees", "Stock orders", "Bills", "Bank at week end"]} rows={c.weeks.map((w) => [w.start, usd(w.cashIn), usd(-w.ads), usd(-w.costs), usd(-w.stock), usd(-w.bills), usd(w.end)])} highlight={(i) => (c.weeks[i].low ? "bg-rose-50" : "")} />
        </>
      )}
    </ToolPage>
  );
}
