import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Stat, Table, usd } from "@/components/tools/ToolPage";
import { saveForecastInputs } from "../tools/actions";

export const metadata = { title: "Plan my year" };

export default async function ForecastPage() {
  const u = await requireUser("/dashboard/numbers/forecast");
  const t = await computeTools(u.id);
  const f = t.forecast;
  return (
    <ToolPage title="Plan my year" intro="Set your sales goal for the year. Helix shows what to spend on ads each month and what you should keep." auto="every day from your sales, costs and the sale calendar" example={t.example} lesson={{ label: "Set your budget", href: "/learn/01-daily-profit-foundations" }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="tool-forecast">
        <Stat k="Sales, next 12 months" v={usd(f.yearSales)} note={f.source === "goal" ? "From your goal" : f.source === "history" ? "From your last 90 days" : "From your monthly target"} />
        <Stat k="Ad budget" v={usd(f.yearAds)} note={`At your target of ${Math.round(f.mer * 100)}% of sales`} />
        <Stat k="Profit after bills" v={usd(f.yearProfit)} />
        <Stat k="Average order" v={usd(f.aov)} note={`${Math.round(f.margin * 100)}% left before ads`} />
      </div>
      <form action={saveForecastInputs} className="card flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm"><span className="block font-semibold text-slate-900">Your sales goal for the next 12 months (USD)</span><input name="yearGoal" defaultValue={t.fcIn.yearGoal ?? ""} placeholder="Leave empty to use your trend" className="input mt-1 w-64" inputMode="numeric" /></label>
        <button className="btn-primary text-sm">Update plan</button>
        <span className="text-xs text-slate-500">Month shape: {f.shapeFrom === "history" ? "your own last year" : "a normal retail year (busy in November and December)"}.</span>
      </form>
      <Table head={["Month", "Sales", "Ad budget", "Orders", "Profit after bills", "Big dates"]} rows={f.months.map((m) => [m.label, usd(m.sales), usd(m.adBudget), m.orders, usd(m.profit), m.events.join(", ") || "–"])} highlight={(i) => (f.months[i].profit < 0 ? "bg-rose-50" : "")} />
    </ToolPage>
  );
}
