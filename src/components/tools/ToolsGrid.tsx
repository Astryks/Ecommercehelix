import Link from "next/link";
import type { Tools } from "@/lib/tools/server";
import { usd } from "./ToolPage";

/** Planning tools on Numbers, each with a live headline. */
export function ToolsGrid({ t }: { t: Tools }) {
  const lossy = t.products.filter((p) => p.flag === "loss").length;
  const due = t.buys.filter((b) => b.orderQty > 0).length;
  const items = [
    { href: "/dashboard/numbers/forecast", title: "Plan my year", line: `${usd(t.forecast.yearSales)} sales, ${usd(t.forecast.yearAds)} ads in 12 months` },
    { href: "/dashboard/numbers/cash", title: "Cash plan", line: t.cash ? (t.cash.firstLow ? `Tight week: ${t.cash.firstLow.start}` : `Lowest week ${usd(t.cash.lowest.end)}`) : "Add your bank balance" },
    { href: "/dashboard/numbers/stock-plan", title: "Stock buy plan", line: due ? `${due} orders to place` : "No orders needed now" },
    { href: "/dashboard/numbers/customers", title: "Customer value", line: `${usd(t.customers.value12m)} per customer over 12 months` },
    { href: "/dashboard/numbers/ad-cost", title: "New customer ad cost", line: t.ncc.current === null ? "Needs new-customer sales" : `${t.ncc.current}% (target ${t.ncc.target}%)` },
    { href: "/dashboard/numbers/products", title: "Profit per product", line: lossy ? `${lossy} under break-even` : `${t.products.length} products checked` },
    { href: "/dashboard/numbers/targets", title: "My targets", line: (() => { const x = t.targets.find((g) => g.current !== null); return x ? `${x.name}: next ${x.unit === "$" ? "$" + Math.round(x.next) : x.next + "%"}` : "Add data to see targets"; })() },
    { href: "/dashboard/numbers/benchmarks", title: "General guides", line: "Where stores like yours often sit" },
    { href: "/dashboard/numbers/ad-check", title: "Monthly ad check", line: `Score ${t.adCheck.score}/100` },
  ];
  return (
    <section className="card p-5" data-testid="tools-grid">
      <h2 className="font-hand text-xl text-cyan-700">Plan ahead</h2>
      <p className="mt-1 text-sm text-slate-700">These fill in from your numbers and update every day.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="rounded-xl border border-slate-200 bg-white p-4 hover:ring-2 hover:ring-cyan-200">
            <span className="font-hand block text-lg text-[#5A50D6]">{i.title}</span>
            <span className="mt-1 block text-sm text-slate-800">{i.line}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
