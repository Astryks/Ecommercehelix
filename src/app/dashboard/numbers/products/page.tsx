import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Table, usd } from "@/components/tools/ToolPage";

export const metadata = { title: "Profit per product" };

export default async function Products() {
  const u = await requireUser("/dashboard/numbers/products");
  const t = await computeTools(u.id);
  const p = t.products;
  const d = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2);
  return (
    <ToolPage title="Profit per product" intro="Which products really make you money after product cost, shipping, fees and a fair share of ads." auto="every day from product sales (Shopify or typed in) and your costs" example={t.example} lesson={{ label: "Price for profit", href: "/learn/03-offer-and-product" }}>
      <div data-testid="tool-products">
        {p.length === 0 ? <p className="card p-5 text-slate-700">No product sales in the last 30 days yet. Connect Shopify or add products on the scorecard.</p> :
          <Table head={["Product", "Sold", "Price", "Landed cost", "Shipping + pack", "Fees", "Ads share", "Profit each", "Margin", "Total"]} rows={p.map((x) => [`${x.flag === "loss" ? "⚠ " : ""}${x.name}`, x.units, d(x.price), d(x.landed), d(x.shipping), d(x.fees), d(x.ads), d(x.profitPerUnit), `${x.marginPct}%`, usd(x.totalProfit)])} highlight={(i) => (p[i].flag === "loss" ? "bg-rose-50" : p[i].flag === "thin" ? "bg-amber-50" : "")} />}
      </div>
      <p className="text-xs text-slate-500">Red: loses money on each sale (under break-even). Amber: under 10% margin. Ads are shared out by units sold.</p>
    </ToolPage>
  );
}
