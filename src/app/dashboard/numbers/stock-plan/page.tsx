import Link from "next/link";
import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Stat, Table, usd } from "@/components/tools/ToolPage";

export const metadata = { title: "Stock buy plan" };

export default async function StockPlan() {
  const u = await requireUser("/dashboard/numbers/stock-plan");
  const t = await computeTools(u.id);
  const due = t.buys.filter((b) => b.orderQty > 0);
  return (
    <ToolPage title="Stock buy plan" intro="How many weeks your stock lasts, what to order and when, and how much cash each order needs." auto="every day from sales speed, lead times and big sale dates" example={t.example} lesson={{ label: "Never run out", href: "/learn/19-inventory-cash-planning" }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="tool-stock">
        <Stat k="Orders to place" v={String(due.length)} />
        <Stat k="Cash needed" v={usd(due.reduce((a, b) => a + b.cash, 0))} note="Also counted in your cash plan" />
        <Stat k="Products tracked" v={String(t.buys.length)} />
      </div>
      {t.buys.length === 0 ? <p className="card p-5 text-slate-700">Add your products on <Link className="text-cyan-700 underline" href="/dashboard/stock">Suppliers and stock</Link> and this fills in.</p> :
        <Table head={["Product", "On hand", "Sold a day", "Weeks left", "Order by", "Order", "Cash", "Why"]} rows={t.buys.map((b) => [b.name, b.onHand, b.dailySales, b.weeksCover ?? "–", b.orderBy ?? "–", b.orderQty || "–", b.cash ? usd(b.cash) : "–", b.upliftReason ?? (b.status === "ok" ? "Enough for now" : b.status === "no-sales" ? "No sales yet" : "Running low")])} highlight={(i) => (["out", "order-now"].includes(t.buys[i].status) ? "bg-rose-50" : t.buys[i].status === "order-soon" ? "bg-amber-50" : "")} />}
      <p className="text-xs text-slate-500">Sales speed updates from Shopify when connected; type it on Suppliers and stock otherwise.</p>
    </ToolPage>
  );
}
