"use client";
import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NumbersDay } from "@/lib/numbers";

const m = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const m2 = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const label = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });
const long = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/** Daily sales bars with a week (last 4 weeks) or month (last 8 weeks) toggle. Click a day to open it. */
export function NumbersChart({ days, initialDay, shopify, meta, google }: { days: NumbersDay[]; initialDay?: string; shopify: boolean; meta: boolean; google: boolean }) {
  const [range, setRange] = useState<"week" | "month">("week");
  const shown = range === "week" ? days.slice(-28) : days.slice(-56);
  const lastWithData = [...days].reverse().find((d) => d.hasData)?.date;
  const [open, setOpen] = useState<string | undefined>(initialDay ?? lastWithData);
  const day = days.find((d) => d.date === open);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-700">Tap a bar to see that day.</p>
        <div role="group" aria-label="Range" className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm">
          {(["week", "month"] as const).map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)} className={`rounded-md px-3 py-1 font-semibold ${range === r ? "bg-cyan-500 text-white" : "text-slate-700"}`}>
              {r === "week" ? "Week (last 4 weeks)" : "Month (last 8 weeks)"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 h-64 w-full" data-testid="sales-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shown} onClick={(e) => { const p = (e as { activeLabel?: string | number })?.activeLabel; if (p) setOpen(String(p)); }}>
            <XAxis dataKey="date" tickFormatter={label} fontSize={11} interval={range === "week" ? 3 : 7} />
            <YAxis tickFormatter={(v) => m(Number(v))} fontSize={11} width={60} />
            <Tooltip formatter={(v) => m(Number(v))} labelFormatter={(l) => long(String(l))} />
            <Bar dataKey="revenue" name="Sales" radius={[4, 4, 0, 0]} cursor="pointer">
              {shown.map((d) => <Cell key={d.date} fill={d.date === open ? "#5A50D6" : d.hasData ? "#9b95e6" : "#e5e3dc"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-1" aria-label="Pick a day">
        {shown.slice(-7).map((d) => (
          <button key={d.date} type="button" onClick={() => setOpen(d.date)} className={`rounded-md border px-2 py-1 text-xs ${d.date === open ? "border-cyan-500 bg-cyan-50 font-semibold" : "border-slate-200 bg-white"}`}>{label(d.date)}</button>
        ))}
      </div>
      {day && <DayPanel d={day} shopify={shopify} meta={meta} google={google} />}
    </div>
  );
}

function DayPanel({ d, shopify, meta, google }: { d: NumbersDay; shopify: boolean; meta: boolean; google: boolean }) {
  const rows: [string, string, string?][] = [
    ["Sales", m2(d.revenue), d.fromShopify ? "from Shopify" : shopify ? undefined : "typed in"],
    ["Orders", String(d.orders)],
    ["Cost of goods", "-" + m2(d.cogs), d.cogsEstimated ? "your unit cost x units sold" : undefined],
    ["Ad spend", "-" + m2(d.adSpend), [d.adMeta ? `Meta ${m2(d.adMeta)}` : "", d.adGoogle ? `Google ${m2(d.adGoogle)}` : "", d.adTiktok ? `TikTok ${m2(d.adTiktok)}` : ""].filter(Boolean).join(", ") || undefined],
    ["Shipping", "-" + m2(d.shipping)],
    ["Fees", "-" + m2(d.fees)],
    ["Other costs", "-" + m2(d.other)],
  ];
  return (
    <section aria-label={`Numbers for ${long(d.date)}`} className="mt-4 rounded-xl border border-slate-200 bg-white p-4" data-testid="day-panel">
      <h3 className="font-hand text-xl text-cyan-700">{long(d.date)}</h3>
      {!d.hasData ? (
        <p className="mt-2 text-sm text-slate-700">No numbers for this day yet. Add them below, or connect Shopify so they fill in by themselves.</p>
      ) : (
        <>
          <dl className="mt-3 divide-y divide-slate-100 text-sm">
            {rows.map(([k, v, note]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 py-1.5"><dt className="text-slate-700">{k}{note && <span className="ml-1 text-xs text-slate-500">({note})</span>}</dt><dd className="font-semibold tabular-nums text-slate-900">{v}</dd></div>
            ))}
            <div className="flex items-baseline justify-between gap-3 py-2"><dt className="font-bold text-slate-900">Profit</dt><dd className={`text-lg font-bold tabular-nums ${d.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{m2(d.profit)}</dd></div>
          </dl>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              ["Margin", `${d.marginPct.toFixed(1)}%`, "Profit out of every $100 of sales."],
              ["ROAS", d.adSpend ? `${d.roas.toFixed(2)}x` : "–", "Sales for each $1 of ads."],
              ["MER", d.adSpend ? `${d.merPct.toFixed(1)}%` : "–", "Ads as a share of sales."],
              ["Ad cost per order", d.orders && d.adSpend ? m2(d.costPerOrder) : "–", "Ad spend split over orders."],
              ["Break-even ROAS", d.breakEvenRoas ? `${d.breakEvenRoas.toFixed(2)}x` : "–", "Below this, ads lose money."],
            ].map(([k, v, h]) => (
              <div key={k} className="rounded-lg bg-slate-50 p-2.5"><p className="text-xs text-slate-600">{k}</p><p className="font-bold tabular-nums text-slate-900">{v}</p><p className="text-[11px] text-slate-500">{h}</p></div>
            ))}
          </div>
        </>
      )}
      {(!shopify || !meta || !google) && (
        <p className="mt-3 text-xs text-slate-600">
          Missing numbers fill in by themselves when you connect: {[!shopify && "Shopify (sales and orders)", !meta && "Meta (ad spend)", !google && "Google Ads (ad spend)"].filter(Boolean).join(", ")}. <a href="/dashboard/integrations" className="font-semibold text-cyan-700 underline">Connect</a>
        </p>
      )}
    </section>
  );
}
