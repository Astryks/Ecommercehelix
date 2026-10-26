import { requireUser } from "@/lib/session";
import { computeTools } from "@/lib/tools/server";
import { ToolPage, Stat, Table, usd } from "@/components/tools/ToolPage";

const VERDICT = { good: "Good", okay: "Okay", "needs-work": "Needs work", none: "No data yet" } as const;

export const metadata = { title: "Customer value" };

export default async function Customers() {
  const u = await requireUser("/dashboard/numbers/customers");
  const t = await computeTools(u.id);
  const c = t.customers;
  return (
    <ToolPage title="Customer value" intro="How often people buy again, and what one customer is worth to you over 12 months." auto="every day from new and returning orders" example={t.example} lesson={{ label: "Bring buyers back", href: "/learn/12-list-and-audience-growth" }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="tool-customers">
        <Stat k="Orders per customer (12 months)" v={c.ordersPerCustomer.toFixed(2)} />
        <Stat k="Customer value at 12 months" v={usd(c.value12m)} note="Sales from one customer" />
        <Stat k="Profit per customer" v={usd(c.profit12m)} note="Before ads. Compare with your cost to win one." />
        <Stat k="Orders from returning buyers" v={`${c.repeatShare}%`} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" data-testid="tool-customers-payback">
        <Stat k="New customer CAC" v={c.winCost === null ? "–" : usd(c.winCost)} note="Customer acquisition cost: all ad spend ÷ first-time buyers" />
        <Stat k="CAC payback" v={c.paybackMonths === null ? (c.winCost === null ? "–" : "Over 12 months") : c.paybackMonths === 0 ? "On the first order" : `${c.paybackMonths} months`} note={`${VERDICT[c.paybackVerdict]}. Months until a customer has earned back their CAC. Under 3 is good, 3 to 6 is okay.`} />
        <Stat k="LTV:CAC" v={c.valueForCost === null ? "–" : `${c.valueForCost.toFixed(1)} : 1`} note={`${VERDICT[c.valueVerdict]}. Profit per customer over 12 months (before ads) ÷ CAC. 3 : 1 or more is good, 2 : 1 to 3 : 1 is okay.`} />
      </div>
      {!c.enoughData && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Fewer than 20 new customers so far, so treat these as a first guess. They sharpen as sales grow.</p>}
      <h2 className="font-hand text-xl text-cyan-700">Month by month</h2>
      <Table head={["Month", "New customers", "Their sales", "Returning orders", "Returning sales", "Returning share"]} rows={c.cohorts.map((r) => [r.month, r.newCustomers, usd(r.newRevenue), r.returningOrders, usd(r.returningRevenue), `${r.repeatShare}%`])} />
      <p className="text-xs text-slate-500">Worked out from daily new and returning totals. Exact per-customer groups need order-level data from Shopify, which is a later step.</p>
    </ToolPage>
  );
}
