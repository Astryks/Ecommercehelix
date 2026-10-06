import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { money, type TodaySummary } from "@/lib/today";
import { prettyDay } from "@/lib/dates";

type Props = {
  s: TodaySummary;
  date: string;
  prefill: { revenue: number; orders: number; adMeta: number; adGoogle: number };
  metaSynced: boolean;
  estimatePct: number;
  action: (form: FormData) => Promise<void>;
};

/** Big profit number, one plain-English line, and the one quick form to update yesterday. */
export function ProfitToday({ s, date, prefill, metaSynced, estimatePct, action }: Props) {
  const tone = { good: "text-emerald-600", ok: "text-slate-900", bad: "text-rose-600", empty: "text-slate-400" }[s.tone];
  const Icon = s.tone === "good" ? TrendingUp : s.tone === "bad" ? TrendingDown : null;
  return (
    <section aria-labelledby="profit-h" className="card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="p-6">
          <p id="profit-h" className="text-sm font-semibold uppercase tracking-wide text-slate-500">Profit yesterday · {prettyDay(date)}</p>
          <p className={`mt-1 flex items-center gap-3 text-5xl font-extrabold tracking-tight sm:text-6xl ${tone}`}>
            {s.hasDay ? money(s.profit) : "$ ?"}
            {s.hasDay && Icon && <Icon className="h-9 w-9" aria-hidden />}
          </p>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-700"><strong>What this means today:</strong> {s.meaning}</p>
          {s.hasDay && (
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {[["Sales (after discounts)", money(s.sales)], ["Orders", String(s.orders)], ["Ad spend", money(s.adSpend)], ["Ad cost per order", s.orders ? money(s.costPerSale) : "n/a"]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
            </dl>
          )}
          <p className="mt-3 text-xs text-slate-500">Profit here means sales minus product cost, shipping, payment fees, discounts, refunds and ads. <Link href="/dashboard/scorecard" className="text-cyan-700 underline">See all your numbers</Link></p>
        </div>
        <form action={action} className="border-t border-slate-100 bg-slate-50/70 p-6 lg:border-l lg:border-t-0">
          <p className="font-semibold">Update yesterday <span className="font-normal text-slate-500">(1 minute)</span></p>
          <input type="hidden" name="date" value={date} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm"><span className="text-slate-600">Sales ($)</span>
              <input name="revenue" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={prefill.revenue || ""} placeholder="0" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-lg font-semibold" /></label>
            <label className="text-sm"><span className="text-slate-600">Orders</span>
              <input name="orders" type="number" min="0" step="1" inputMode="numeric" defaultValue={prefill.orders || ""} placeholder="0" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-lg font-semibold" /></label>
            <label className="text-sm"><span className="text-slate-600">Meta ads ($){metaSynced && <span className="ml-1 rounded bg-emerald-100 px-1 text-[10px] font-bold uppercase text-emerald-800">synced</span>}</span>
              <input name="adMeta" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={prefill.adMeta || ""} placeholder="0" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-lg font-semibold" /></label>
            <label className="text-sm"><span className="text-slate-600">Google ads ($)</span>
              <input name="adGoogle" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={prefill.adGoogle || ""} placeholder="0" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-lg font-semibold" /></label>
          </div>
          <button className="btn-primary mt-4 w-full text-base">Save and show my profit</button>
          <p className="mt-2 text-xs leading-5 text-slate-500">Sales means the total before discounts and refunds, as shown in your store. Helix estimates product cost, shipping and fees from your recent days (about {estimatePct}% of sales). For exact costs, use <Link href="/dashboard/scorecard" className="underline">Your numbers</Link>.</p>
        </form>
      </div>
    </section>
  );
}
