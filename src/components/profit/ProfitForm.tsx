"use client";
import { useMemo, useState } from "react";
import { waterfall, type ProfitInputs } from "@/lib/profit-setup";

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = (n: number) => (n < 0 ? "-$" : "$") + Math.round(Math.abs(n)).toLocaleString("en-AU");

const FIELDS: { k: keyof ProfitInputs; label: string; hint: string; group: "order" | "month" }[] = [
  { k: "price", label: "Selling price", hint: "What the customer pays for one order, before GST/VAT.", group: "order" },
  { k: "productCost", label: "Product cost (COGS)", hint: "Making or buying the items in one order.", group: "order" },
  { k: "freightDuty", label: "Freight and duty", hint: "Getting it to you: shipping from the factory, duty, customs. Per order.", group: "order" },
  { k: "packaging", label: "Packaging", hint: "Mailer, box, tissue, inserts.", group: "order" },
  { k: "shipToCustomer", label: "Shipping to the customer", hint: "Postage you pay, after any shipping the customer pays.", group: "order" },
  { k: "feePct", label: "Payment fee %", hint: "Shopify Payments on the Basic plan: about 1.7% (Australia) or 2.9% (US) for local cards. Check Settings > Payments. Australia: since 1 October 2026 you can't add a card surcharge, so this fee comes out of your price.", group: "order" },
  { k: "feeFixed", label: "Payment fee per order", hint: "Usually about $0.30.", group: "order" },
  { k: "marketingPerOrder", label: "Marketing per order", hint: "Last month's ad and marketing spend divided by orders. Use 0 if you do not know yet.", group: "order" },
  { k: "subscriptions", label: "Shopify or website and apps", hint: "Monthly plan plus every app and tool subscription.", group: "month" },
  { k: "otherFixed", label: "Other monthly costs", hint: "Wages, rent, accounting, software. Leave 0 if none.", group: "month" },
  { k: "ordersPerMonth", label: "Orders a month", hint: "Your usual month, or your goal if you are just starting.", group: "month" },
];

export function ProfitForm({ initial, action, saved }: { initial: ProfitInputs; action: (f: FormData) => Promise<void>; saved: boolean }) {
  const [v, setV] = useState<ProfitInputs>(initial);
  const w = useMemo(() => waterfall(v), [v]);
  const top = Math.max(v.price, 1);
  const bar = (n: number) => `${Math.max(0, Math.min(100, (n / top) * 100))}%`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <form action={action} className="card space-y-5 p-5">
        {(["order", "month"] as const).map((grp) => (
          <fieldset key={grp} className="space-y-3">
            <legend className="font-hand text-lg font-semibold text-[#1A1718]">{grp === "order" ? "For one order" : "Each month"}</legend>
            {FIELDS.filter((f) => f.group === grp).map((f) => (
              <label key={f.k} className="block">
                <span className="text-sm font-medium text-slate-800">{f.label}</span>
                <input name={f.k} type="number" step="any" min="0" inputMode="decimal" value={Number.isFinite(v[f.k]) ? v[f.k] : 0}
                  onChange={(e) => setV({ ...v, [f.k]: Number(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 tabular" />
                <span className="mt-0.5 block text-xs text-slate-500">{f.hint}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" name="useFixed" defaultChecked className="mt-1" />
          Use my monthly costs as fixed costs in my daily numbers
        </label>
        <button className="btn-dark w-full">Save my profit setup</button>
        {saved && <p className="text-center text-sm font-medium text-emerald-700">Saved. Your dashboard now uses these costs.</p>}
      </form>

      <div className="space-y-4">
        <section className="card p-5" aria-label="Where each sale goes">
          <h2 className="font-hand text-xl font-semibold text-[#1A1718]">Where {money(v.price)} goes</h2>
          <p className="text-xs text-slate-500">Sales (also called revenue) is what the customer pays. Each cost takes a layer off until what is left is profit.</p>
          <ol className="mt-4 space-y-2">
            <li className="grid grid-cols-[9rem_1fr_5rem] items-center gap-2 text-sm">
              <span className="font-semibold">Sales</span>
              <span className="h-6 rounded bg-[#1A1718]" style={{ width: "100%" }} />
              <span className="text-right font-semibold tabular">{money(v.price)}</span>
            </li>
            {w.layers.map((l) => (
              <li key={l.key} className="grid grid-cols-[9rem_1fr_5rem] items-center gap-2 text-sm" title={l.plain}>
                <span className="text-slate-700">{l.label}</span>
                <span className="relative h-6">
                  <span className="absolute inset-y-0 rounded bg-[#5A50D6]/80" style={{ left: bar(l.left), width: bar(l.cost) }} />
                </span>
                <span className="text-right text-rose-700 tabular">-{money(l.cost)}</span>
              </li>
            ))}
            <li className="grid grid-cols-[9rem_1fr_5rem] items-center gap-2 border-t border-slate-200 pt-2 text-sm">
              <span className="font-semibold">Net profit</span>
              <span className={`h-6 rounded ${w.netPerOrder >= 0 ? "bg-[#8FA98B]" : "bg-rose-500"}`} style={{ width: bar(Math.abs(w.netPerOrder)) }} />
              <span className={`text-right font-semibold tabular ${w.netPerOrder >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{money(w.netPerOrder)}</span>
            </li>
          </ol>
          <p className="mt-3 text-sm text-slate-700">That is <strong>{w.netMarginPct.toFixed(1)}%</strong> of each sale kept as profit.</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2" aria-label="Your key profit numbers">
          {[
            ["Landed cost", money(w.landed), "Product plus freight and duty."],
            ["Gross margin", `${w.grossMarginPct.toFixed(0)}%`, "Sales minus landed cost."],
            ["Profit before marketing", money(w.beforeMarketing), "What one order leaves to pay for ads and bills."],
            ["Break-even cost per purchase", money(w.breakEvenCpa), "Spend more than this on ads to win one order and you lose money."],
            ["Break-even MER", `${w.breakEvenMerPct.toFixed(0)}%`, "Marketing as a % of sales where profit hits zero (before fixed costs)."],
            ["Break-even ROAS", w.breakEvenRoas ? w.breakEvenRoas.toFixed(2) : "-", "1 divided by break-even MER."],
          ].map(([t, n, h]) => (
            <div key={t} className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t}</p>
              <p className="mt-1 font-hand text-2xl font-semibold tabular text-[#1A1718]">{n}</p>
              <p className="text-xs text-slate-500">{h}</p>
            </div>
          ))}
        </section>

        <section className="card p-5" aria-label="Per month">
          <h2 className="font-hand text-lg font-semibold text-[#1A1718]">A month at {v.ordersPerMonth.toLocaleString("en-AU")} orders</h2>
          <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
            <dt>Sales</dt><dd className="text-right tabular">{whole(w.month.sales)}</dd>
            <dt>Marketing</dt><dd className="text-right tabular">-{whole(w.month.marketing)}</dd>
            <dt>Fixed costs</dt><dd className="text-right tabular">-{whole(w.month.fixed)}</dd>
            <dt className="font-semibold">Net profit a month</dt><dd className={`text-right font-semibold tabular ${w.month.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{whole(w.month.net)}</dd>
          </dl>
        </section>
      </div>
    </div>
  );
}
