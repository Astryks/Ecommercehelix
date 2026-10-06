import Link from "next/link";
import { AlertTriangle, BookOpen, Boxes, CalendarClock, Factory, PackageCheck, Plus, Truck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getStock, getSuppliers } from "@/lib/repo";
import { isoDay } from "@/lib/dates";
import { COVER_DAYS, bfPlan, nextBlackFriday, stockRows, type StockRow, type StockStatus } from "@/lib/stock";
import { clearStockExamples, saveCounts, saveStockItem, saveSupplier } from "./actions";

export const metadata = { title: "Suppliers & stock" };

const STATUS: Record<StockStatus, { label: string; chip: string }> = {
  out: { label: "Out of stock", chip: "bg-rose-100 text-rose-800 ring-rose-200" },
  "order-now": { label: "Order now", chip: "bg-rose-50 text-rose-700 ring-rose-200" },
  "order-soon": { label: "Order soon", chip: "bg-amber-50 text-amber-800 ring-amber-200" },
  ok: { label: "Enough stock", chip: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  "no-sales": { label: "No recent sales", chip: "bg-slate-100 text-slate-700 ring-slate-200" },
};
const KIND = { factory: "Factory", trading: "Trading company", unknown: "Not checked yet" } as const;

const money = (n: number) => "$" + n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = (n: number) => Math.round(n).toLocaleString("en-AU");
const pretty = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });

function Countdown({ r }: { r: StockRow }) {
  if (r.daysLeft === null) return <span className="text-slate-500">No sales</span>;
  const span = r.leadTime + r.safetyDays + COVER_DAYS;
  const pct = Math.min(100, (r.daysLeft / span) * 100);
  const mark = Math.min(100, ((r.leadTime + r.safetyDays) / span) * 100);
  const tone = r.status === "ok" ? "bg-emerald-500" : r.status === "order-soon" ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="min-w-36">
      <p className="tabular-nums"><strong>{r.daysLeft}</strong> days <span className="text-xs text-slate-500">(runs out {pretty(r.stockOutDate!)})</span></p>
      <div className="relative mt-1.5 h-1.5 rounded-full bg-slate-100" aria-hidden>
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
        <span className="absolute -top-1 h-3.5 w-px bg-slate-500" style={{ left: `${mark}%` }} title="Lead time plus safety days" />
      </div>
    </div>
  );
}

export default async function Stock() {
  const u = await requireUser();
  const today = isoDay();
  const [items, suppliers] = await Promise.all([getStock(u.id), getSuppliers(u.id)]);
  const rows = stockRows(items, suppliers, today);
  const hasExamples = items.some((i) => i.example) || suppliers.some((s) => s.example);
  const counts = { now: rows.filter((r) => r.status === "out" || r.status === "order-now").length, soon: rows.filter((r) => r.status === "order-soon").length, ok: rows.filter((r) => r.status === "ok").length };
  const value = rows.reduce((s, r) => s + r.onHand * r.landedCost, 0);
  const bf = nextBlackFriday(today);
  const bfRows = rows.filter((r) => r.dailySales > 0).map((r) => ({ r, p: bfPlan(r, today) })).sort((a, b) => a.p.daysToLastOrder - b.p.daysToLastOrder);
  const example = rows.find((r) => r.status === "order-now" || r.status === "order-soon") ?? rows.find((r) => r.dailySales > 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <p className="eyebrow flex items-center gap-2"><Boxes className="h-4 w-4" aria-hidden /> Suppliers &amp; stock</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Never run out of your best sellers</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Helix works out when each product will run out, the latest day to reorder and how many to order, using your sales speed, your supplier&apos;s lead time and a few safety days. <Link className="text-cyan-700 underline" href="/learn/14-inventory-cash-planning#lesson-148-finding-and-vetting-suppliers">How to find and vet suppliers</Link></p>
      </header>

      {hasExamples && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p><strong>Example data.</strong> These suppliers and products are made up so you can see how the page works. Add your own below. Shopify stock and sales sync is coming; until then you type sales per day yourself.</p>
          <form action={clearStockExamples}><button className="btn-ghost py-1.5 text-xs">Clear the examples</button></form>
        </div>
      )}

      <section className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:grid-cols-4" aria-label="Stock summary">
        {[
          { k: "Order now", v: counts.now, sub: "At or below the reorder point", tone: counts.now ? "text-rose-700" : "text-slate-900" },
          { k: "Order in the next 2 weeks", v: counts.soon, sub: "Plan the order and the cash", tone: counts.soon ? "text-amber-700" : "text-slate-900" },
          { k: "Enough stock", v: counts.ok, sub: "No action needed", tone: "text-emerald-700" },
          { k: "Stock value (landed cost)", v: money(value), sub: "What the stock on hand cost you", tone: "text-slate-900" },
        ].map((t) => (
          <div key={t.k} className="bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t.k}</p>
            <p className={`mt-2 font-display text-3xl font-semibold tabular-nums ${t.tone}`}>{t.v}</p>
            <p className="mt-1 text-xs text-slate-500">{t.sub}</p>
          </div>
        ))}
      </section>

      <section className="card mt-6 overflow-hidden" aria-labelledby="stock-h">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 px-5 py-4">
          <h2 id="stock-h" className="text-xl">Stock and reorder dates</h2>
          <p className="text-xs text-slate-500">Most urgent first. The grey tick on each bar is lead time plus safety days.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl w-full">
            <thead><tr><th>Product</th><th>Status</th><th>On hand</th><th>On order</th><th>Sells a day</th><th>Stock lasts</th><th>Reorder point</th><th>Order by</th><th>Suggested order</th><th>Landed cost</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><p className="font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.sku}{r.supplier ? ` · ${r.supplier.name.replace(/^Example: /, "")}` : " · no supplier set"}</p></td>
                  <td><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${STATUS[r.status].chip}`}>{STATUS[r.status].label}</span></td>
                  <td className="tabular-nums">{whole(r.onHand)}</td>
                  <td className="tabular-nums">{r.onOrder ? whole(r.onOrder) : "–"}</td>
                  <td className="tabular-nums">{r.dailySales.toFixed(1)}</td>
                  <td><Countdown r={r} /></td>
                  <td className="tabular-nums">{whole(r.reorderPoint)}</td>
                  <td className={r.status === "order-now" || r.status === "out" ? "font-semibold text-rose-700" : ""}>{r.orderBy ? (r.daysUntilOrder! <= 0 ? "Today" : pretty(r.orderBy)) : "–"}</td>
                  <td className="tabular-nums">{r.suggestedQty ? <>{whole(r.suggestedQty)}{r.supplier && r.suggestedQty === r.supplier.moq ? <span className="block text-[11px] text-slate-500">supplier minimum</span> : null}</> : "–"}</td>
                  <td className="tabular-nums">{money(r.landedCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {example && (
          <details className="border-t border-slate-200 px-5 py-4 text-sm">
            <summary className="cursor-pointer font-semibold text-slate-800">How these numbers are worked out (using {example.name})</summary>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-slate-700">
              <li><strong>Landed cost</strong> = unit cost {money(example.unitCost)} + freight {money(example.freightPerUnit)} + duty {example.dutyPct}% of unit cost + other {money(example.otherPerUnit)} = <strong>{money(example.landedCost)}</strong>. Use this, not the supplier price, as your product cost in Helix.</li>
              <li><strong>Reorder point</strong> = sells a day {example.dailySales} × (lead time {example.leadTime} days + safety {example.safetyDays} days) = <strong>{whole(example.reorderPoint)} units</strong>. When stock on hand plus on order falls to this, place the order.</li>
              <li><strong>Stock lasts</strong> = on hand {whole(example.onHand)} ÷ {example.dailySales} a day = <strong>{example.daysLeft ?? 0} days</strong>.</li>
              <li><strong>Suggested order</strong> covers the lead time, the safety days and {COVER_DAYS} more days of sales, minus what you have and have on order, and never below the supplier minimum (MOQ).</li>
            </ol>
            <p className="mt-3 text-xs text-slate-500">Sales speed is the average a day over the last 4 to 8 weeks. Leave out days when you were out of stock or running a big sale.</p>
          </details>
        )}
      </section>

      {bf.daysTo >= 0 && bf.daysTo <= 150 && bfRows.length > 0 && (
        <section className="mt-6 rounded-xl border border-cyan-200 bg-cyan-50 p-5" aria-labelledby="bf-h">
          <h2 id="bf-h" className="flex items-center gap-2 text-xl"><CalendarClock className="h-5 w-5 text-cyan-700" aria-hidden /> Black Friday stock: {bf.daysTo} days to go ({pretty(bf.date)})</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-700">Peak week often sells 2 to 4 times a normal week. The last safe order date allows for the supplier&apos;s lead time plus a week to receive, check and list the stock. This is the &ldquo;Order stock and gifts&rdquo; step of your <Link href="/dashboard" className="text-cyan-800 underline">Black Friday prep plan on Today</Link>.</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {bfRows.slice(0, 6).map(({ r, p }) => (
              <li key={r.id} className="rounded-lg border border-cyan-200 bg-white p-4 text-sm">
                <p className="font-semibold text-slate-900">{r.name}</p>
                <p className={`mt-1 ${p.daysToLastOrder < 0 ? "text-rose-700" : p.daysToLastOrder <= 14 ? "text-amber-800" : "text-slate-700"}`}>
                  {p.daysToLastOrder < 0 ? `Last safe order date passed (${pretty(p.lastOrder)}). Ask about air freight or a local top-up.` : `Order by ${pretty(p.lastOrder)} (${p.daysToLastOrder} days)`}
                </p>
                <p className="mt-1 text-xs text-slate-500">About {whole(p.extraUnits)} extra units for peak week, on top of your normal reorder.</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="counts-h">
          <h2 id="counts-h" className="flex items-center gap-2 text-xl"><PackageCheck className="h-5 w-5 text-cyan-700" aria-hidden /> Update counts</h2>
          <p className="mt-1 text-sm text-slate-600">Once a week, type what is on the shelf, what is on the way and how many you sell a day.</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.id} className="py-2.5">
                <form action={saveCounts} className="grid grid-cols-[1fr_repeat(3,5.5rem)_auto] items-end gap-2 text-sm">
                  <input type="hidden" name="id" value={r.id} />
                  <span className="truncate pb-2 font-medium" title={r.name}>{r.name}</span>
                  <label className="text-[11px] text-slate-500">On hand<input name="onHand" type="number" min="0" defaultValue={r.onHand} className="input mt-0.5 px-2 py-1.5" /></label>
                  <label className="text-[11px] text-slate-500">On order<input name="onOrder" type="number" min="0" defaultValue={r.onOrder} className="input mt-0.5 px-2 py-1.5" /></label>
                  <label className="text-[11px] text-slate-500">A day<input name="dailySales" type="number" min="0" step="0.1" defaultValue={r.dailySales} className="input mt-0.5 px-2 py-1.5" /></label>
                  <button className="btn-ghost px-3 py-1.5 text-xs">Save</button>
                </form>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5" aria-labelledby="sup-h">
          <h2 id="sup-h" className="flex items-center gap-2 text-xl"><Factory className="h-5 w-5 text-cyan-700" aria-hidden /> Suppliers</h2>
          <ul className="mt-4 space-y-3">
            {suppliers.map((s) => (
              <li key={s.id} className="rounded-lg border border-slate-200 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${s.kind === "factory" ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : s.kind === "trading" ? "bg-violet-50 text-violet-800 ring-violet-200" : "bg-amber-50 text-amber-800 ring-amber-200"}`}>{KIND[s.kind]}</span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-slate-700 sm:grid-cols-4">
                  <div><dt className="text-[11px] uppercase tracking-wide text-slate-500">Lead time</dt><dd>{s.leadTimeDays} days</dd></div>
                  <div><dt className="text-[11px] uppercase tracking-wide text-slate-500">Minimum order</dt><dd>{s.moq ? whole(s.moq) : "–"}</dd></div>
                  <div className="col-span-2"><dt className="text-[11px] uppercase tracking-wide text-slate-500">Payment terms</dt><dd>{s.paymentTerms || "–"}</dd></div>
                </dl>
                {(s.contact || s.country || s.notes) && <p className="mt-2 text-xs text-slate-500">{[s.country, s.contact, s.notes].filter(Boolean).join(" · ")}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg bg-paper-2 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Factory or trading company? A quick check</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Ask for the business licence and check the listed business scope includes making your product.</li>
              <li>Ask for a live video walk through the production line, or use an inspection company.</li>
              <li>A trading company is not bad: it can help with small orders and many products. Just know who really makes it.</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <details className="card p-5" open={!rows.length}>
          <summary className="flex cursor-pointer items-center gap-2 font-display text-lg font-semibold"><Plus className="h-4 w-4 text-cyan-700" aria-hidden /> Add or update a product</summary>
          <form action={saveStockItem} className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label>SKU<input name="sku" required className="input mt-1" placeholder="LIN-SH-01" /></label>
            <label>Product name<input name="name" required className="input mt-1" placeholder="Linen Shirt" /></label>
            <label className="col-span-2">Supplier
              <select name="supplierId" className="input mt-1" defaultValue="">
                <option value="">No supplier yet</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>Unit cost ($)<input name="unitCost" type="number" min="0" step="any" className="input mt-1" /></label>
            <label>Freight per unit ($)<input name="freightPerUnit" type="number" min="0" step="any" className="input mt-1" /></label>
            <label>Duty (% of unit cost)<input name="dutyPct" type="number" min="0" max="100" step="any" className="input mt-1" /></label>
            <label>Other per unit ($)<input name="otherPerUnit" type="number" min="0" step="any" className="input mt-1" placeholder="Packaging, inspection" /></label>
            <label>On hand<input name="onHand" type="number" min="0" className="input mt-1" /></label>
            <label>On order<input name="onOrder" type="number" min="0" className="input mt-1" /></label>
            <label>Sells a day<input name="dailySales" type="number" min="0" step="0.1" className="input mt-1" /></label>
            <label>Safety days<input name="safetyDays" type="number" min="0" max="120" defaultValue={14} className="input mt-1" /></label>
            <label className="col-span-2">Lead time in days (leave empty to use the supplier&apos;s)<input name="leadTimeDays" type="number" min="0" max="365" className="input mt-1" /></label>
            <button className="btn-primary col-span-2">Save product</button>
          </form>
          <p className="mt-3 text-xs text-slate-500">Same SKU again updates the product.</p>
        </details>

        <details className="card p-5">
          <summary className="flex cursor-pointer items-center gap-2 font-display text-lg font-semibold"><Truck className="h-4 w-4 text-cyan-700" aria-hidden /> Add a supplier</summary>
          <form action={saveSupplier} className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2">Name<input name="name" required className="input mt-1" /></label>
            <label>Contact (email or phone)<input name="contact" className="input mt-1" /></label>
            <label>Country<input name="country" className="input mt-1" /></label>
            <label>Type
              <select name="kind" className="input mt-1" defaultValue="unknown">
                <option value="factory">Factory</option>
                <option value="trading">Trading company</option>
                <option value="unknown">Not checked yet</option>
              </select>
            </label>
            <label>Minimum order (MOQ)<input name="moq" type="number" min="0" className="input mt-1" /></label>
            <label>Lead time (days)<input name="leadTimeDays" type="number" min="1" max="365" defaultValue={45} className="input mt-1" /></label>
            <label>Payment terms<input name="paymentTerms" className="input mt-1" placeholder="30% deposit, 70% before shipping" /></label>
            <label className="col-span-2">Notes<textarea name="notes" rows={2} className="input mt-1" /></label>
            <button className="btn-primary col-span-2">Save supplier</button>
          </form>
        </details>
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs text-slate-500"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden /> Lead time means from paying the deposit to stock being ready to sell in your warehouse: making, shipping, customs and receiving. Ask your supplier and freight forwarder for each part. <BookOpen className="ml-1 mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden /> <Link className="underline" href="/learn/14-inventory-cash-planning#lesson-142-the-weekly-stock-snapshot">The weekly stock snapshot</Link></p>
    </div>
  );
}
