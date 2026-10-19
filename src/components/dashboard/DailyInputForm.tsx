"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronDown, CircleAlert, Link2, PencilLine, PlugZap, Save, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { derive, NUM_FIELDS, sum, type DayInput, type Settings } from "@/lib/scorecard";
import { saveDay } from "@/app/dashboard/actions";

type Field = (typeof NUM_FIELDS)[number];
type Ratios = { cogs: number; shippingPerOrder: number; fees: number; fromHistory: boolean };
type Spec = { f: Field; label: string; where: string; example: string; int?: boolean; optional?: boolean; money?: boolean };

const SHOPIFY: Spec[] = [
  { f: "revenue", label: "Gross sales", where: "Shopify > Analytics > Reports > Total sales over time, Gross sales column (not Total sales, which adds shipping and tax). Gross sales leaves tax out, so pick \"before tax\" in Settings if you copy it", example: "2450", money: true },
  { f: "orders", label: "Orders", where: "Same report, Orders column", example: "27", int: true },
  { f: "sessions", label: "Sessions", where: "Shopify > Analytics > Reports > Sessions over time", example: "1180", int: true },
  { f: "addToCarts", label: "Sessions with an add to cart", where: "Shopify > Analytics > Reports > Conversion over time", example: "80", int: true, optional: true },
];
const ADS: Spec[] = [
  { f: "adMeta", label: "Meta ad spend", where: "Meta Ads Manager > Amount spent (yesterday)", example: "320", money: true },
  { f: "adGoogle", label: "Google ad spend", where: "Google Ads > Campaigns > Cost (yesterday)", example: "95", money: true, optional: true },
  { f: "adTiktok", label: "TikTok ad spend", where: "TikTok Ads Manager > Cost (yesterday)", example: "0", money: true, optional: true },
];
const COSTS: Spec[] = [
  { f: "cogs", label: "Product cost (COGS)", where: "Shopify > Analytics > Reports > Profit by product", example: "700", money: true, optional: true },
  { f: "shipping", label: "Shipping and packing", where: "Shipping label bills or your 3PL invoice", example: "240", money: true, optional: true },
  { f: "paymentFees", label: "Payment fees", where: "Shopify Payments payouts > Fees", example: "64", money: true, optional: true },
];
const ADVANCED: Spec[] = [
  { f: "discounts", label: "Discounts", where: "Total sales over time report, Discounts column", example: "140", money: true, optional: true },
  { f: "refunds", label: "Refunds (returns)", where: "Total sales over time report, Returns column", example: "45", money: true, optional: true },
  { f: "newCustomerOrders", label: "New-customer orders", where: "Reports > New vs returning customers, New column", example: "16", int: true, optional: true },
  { f: "newCustomerRevenue", label: "New-customer sales", where: "Reports > New vs returning customers, sales for new customers", example: "1400", money: true, optional: true },
  { f: "units", label: "Units sold", where: "Reports > Sales by product, Net quantity", example: "38", int: true, optional: true },
  { f: "adOther", label: "Other ad spend", where: "Pinterest, Snapchat and other ad accounts", example: "0", money: true, optional: true },
  { f: "otherMarketing", label: "Other marketing", where: "Creators, email tool, agency (per day)", example: "25", money: true, optional: true },
  { f: "metaRevenue", label: "Meta-attributed sales", where: "Meta Ads Manager > Purchases conversion value", example: "900", money: true, optional: true },
  { f: "googleRevenue", label: "Google-attributed sales", where: "Google Ads > Conv. value", example: "320", money: true, optional: true },
  { f: "tiktokRevenue", label: "TikTok-attributed sales", where: "TikTok Ads Manager > Total purchase value", example: "0", money: true, optional: true },
];
const SALES: Field[] = ["revenue", "newCustomerRevenue", "discounts", "refunds", "metaRevenue", "googleRevenue", "tiktokRevenue"];

const money = (n: number, dp = 0) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const pct = (n: number) => `${n.toFixed(1)}%`;

export function DailyInputForm({ defaultDate, recent, settings, ratios, taxRate, metaConnected }: { defaultDate: string; recent: DayInput[]; settings: Settings; ratios: Ratios; taxRate: number; metaConnected: boolean }) {
  const [date, setDate] = useState(defaultDate);
  const prefill = (d: string) => {
    const ex = recent.find((r) => r.date === d && !r.example);
    const v: Partial<Record<Field, string>> = {};
    if (ex) for (const f of NUM_FIELDS) if (Number(ex[f])) v[f] = String(ex[f]);
    return v;
  };
  const [vals, setVals] = useState<Partial<Record<Field, string>>>(() => prefill(defaultDate));
  const existing = recent.find((r) => r.date === date && !r.example);
  const metaSynced = existing?.source === "meta";
  const set = (f: Field, v: string) => setVals((s) => ({ ...s, [f]: v }));
  const num = (f: Field) => Number(vals[f] || 0) || 0;
  const blank = (f: Field) => !vals[f] || vals[f]!.trim() === "";

  const est = {
    cogs: blank("cogs") ? num("revenue") * ratios.cogs : null,
    shipping: blank("shipping") ? num("orders") * ratios.shippingPerOrder : null,
    paymentFees: blank("paymentFees") ? num("revenue") * ratios.fees : null,
  };

  const preview = useMemo(() => {
    const d = { ...sum([]), date } as DayInput;
    for (const f of NUM_FIELDS) d[f] = num(f);
    if (est.cogs !== null) d.cogs = est.cogs;
    if (est.shipping !== null) d.shipping = est.shipping;
    if (est.paymentFees !== null) d.paymentFees = est.paymentFees;
    if (taxRate > 0) for (const f of SALES) d[f] = (Number(d[f]) || 0) / (1 + taxRate);
    return derive(d, settings, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vals, date, settings, taxRate]);

  const errors: string[] = [];
  const warnings: string[] = [];
  for (const s of [...SHOPIFY, ...ADS, ...COSTS, ...ADVANCED]) {
    const raw = vals[s.f];
    if (raw && raw.trim() !== "") {
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) errors.push(`${s.label} must be a number of 0 or more.`);
      else if (s.int && !Number.isInteger(n)) errors.push(`${s.label} must be a whole number.`);
    }
  }
  if (num("sessions") && num("orders") > num("sessions")) errors.push("Orders cannot be more than sessions. Check you copied yesterday's numbers.");
  if (num("sessions") && num("addToCarts") > num("sessions")) errors.push("Sessions with an add to cart cannot be more than sessions.");
  if (num("revenue") > 0 && !num("orders")) errors.push("Add the number of orders for those sales.");
  if (num("orders") > 0 && !num("revenue")) errors.push("Add gross sales for those orders.");
  const aov = num("orders") ? num("revenue") / num("orders") : 0;
  if (aov && (aov < 5 || aov > 2000)) warnings.push(`Average order of ${money(aov, 2)} looks unusual. Double-check sales and orders.`);
  if (num("cogs") > num("revenue") && num("revenue")) warnings.push("Product cost is more than sales. Is that right?");
  if (num("orders") && !num("sessions")) warnings.push("Add sessions so Helix can work out your conversion rate.");
  const ok = errors.length === 0 && (num("revenue") > 0 || num("adMeta") > 0 || num("adGoogle") > 0);

  const input = (s: Spec, estimate?: number | null) => (
    <div key={s.f}>
      <label htmlFor={`f-${s.f}`} className="flex items-baseline justify-between gap-2 text-sm font-medium text-slate-800">
        <span>{s.label}{s.money ? " ($)" : ""}</span>
        {s.optional && <span className="text-[11px] font-normal text-slate-500">optional</span>}
      </label>
      <input
        id={`f-${s.f}`}
        name={s.f}
        type="number"
        min="0"
        step={s.int ? "1" : "any"}
        inputMode={s.int ? "numeric" : "decimal"}
        value={vals[s.f] ?? ""}
        onChange={(e) => set(s.f, e.target.value)}
        placeholder={estimate != null ? `Helix estimate: ${Math.round(estimate)}` : `e.g. ${s.example}`}
        className="input mt-1"
        aria-describedby={`h-${s.f}`}
      />
      <p id={`h-${s.f}`} className="mt-1 text-[11px] leading-4 text-slate-500">{s.where}</p>
    </div>
  );

  const results: { label: string; value: string; note?: string; tone?: "good" | "bad" }[] = [
    { label: "Net revenue", value: money(preview.netRevenue), note: taxRate > 0 ? "after discounts, refunds and GST" : "after discounts and refunds" },
    { label: "Conversion rate", value: num("sessions") ? pct(preview.cr) : "n/a", note: "good: 2.5%+", tone: num("sessions") ? (preview.cr >= 2.5 ? "good" : preview.cr < 1.5 ? "bad" : undefined) : undefined },
    { label: "Add-to-cart rate", value: num("addToCarts") ? pct(preview.atcRate) : "n/a", note: "good: 7%+" },
    { label: "AOV", value: num("orders") ? money(preview.aov, 2) : "n/a", note: "average order" },
    { label: "Ad spend", value: money(preview.adSpend) },
    { label: "MER", value: preview.adSpend ? pct(preview.merPct) : "n/a", note: `target ${settings.targetMerPct}%`, tone: preview.adSpend ? (preview.merPct <= settings.targetMerPct ? "good" : "bad") : undefined },
    { label: "ROAS (blended)", value: preview.adSpend ? `${(preview.netRevenue / preview.adSpend).toFixed(2)}x` : "n/a", note: preview.breakEvenRoas ? `break-even ${preview.breakEvenRoas.toFixed(2)}x` : undefined },
    { label: "CPA", value: preview.adSpend && num("orders") ? money(preview.aCpa, 2) : "n/a", note: "ad spend per order" },
    { label: "Contribution margin", value: money(preview.contribution), note: pct(preview.contributionPct), tone: preview.contributionPct >= 15 ? "good" : preview.netRevenue ? "bad" : undefined },
    { label: "Net profit", value: money(preview.netProfit), note: "after a day of fixed costs", tone: preview.netProfit >= 0 ? "good" : "bad" },
  ];

  return (
    <form action={saveDay} className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="date" className="text-sm font-medium">Which day?</label>
          <input id="date" name="date" type="date" required value={date} onChange={(e) => { setDate(e.target.value); setVals(prefill(e.target.value)); }} className="input mt-1 w-auto" />
        </div>
        <p className="pb-2 text-xs text-slate-500">{existing ? "This day is saved already. Change what you need and save again." : "Most people fill in yesterday, first thing in the morning."}</p>
      </div>

      <fieldset className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
        <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-900"><PencilLine className="h-4 w-4 text-cyan-700" aria-hidden /> 1. From Shopify (you fill this in)</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{SHOPIFY.map((s) => input(s))}</div>
      </fieldset>

      <fieldset className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
        <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-900"><Link2 className="h-4 w-4 text-violet-700" aria-hidden /> 2. Ad spend</legend>
        <p className="text-xs text-slate-600">
          {metaConnected ? <>Meta is connected, so Meta spend fills in automatically each morning{metaSynced ? " (already synced for this day)" : ""}. Type Google and TikTok yourself.</> : <>Type it for now. <Link href="/dashboard/integrations" className="font-medium text-cyan-700 underline"><PlugZap className="mr-0.5 inline h-3 w-3" aria-hidden />Connect Meta</Link> and Meta spend fills in automatically.</>}
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">{ADS.map((s) => input(s))}</div>
      </fieldset>

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
        <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-900"><Calculator className="h-4 w-4 text-emerald-700" aria-hidden /> 3. Costs (leave blank and Helix estimates)</legend>
        <p className="text-xs text-slate-600">Helix estimates blank costs from {ratios.fromHistory ? "your last 30 days" : "typical store numbers (30% product cost, $9 shipping per order, 2.6% fees)"}. Type the real number when you have it.</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">{COSTS.map((s) => input(s, est[s.f as "cogs" | "shipping" | "paymentFees"]))}</div>
      </fieldset>

      <details className="rounded-2xl border border-slate-200 bg-white p-4">
        <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-900"><ChevronDown className="h-4 w-4" aria-hidden /> More detail (optional): discounts, refunds, new customers, attributed sales</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{ADVANCED.map((s) => input(s))}</div>
      </details>

      <section aria-label="Worked out for you" className="rounded-2xl bg-slate-900 p-4 text-white">
        <p className="flex items-center gap-1.5 text-sm font-semibold"><Calculator className="h-4 w-4 text-emerald-300" aria-hidden /> Helix works these out for you (read only)</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {results.map((r) => (
            <div key={r.label} className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <dt className="text-[11px] uppercase tracking-wide text-slate-300">{r.label}</dt>
              <dd className={`mt-0.5 text-lg font-semibold tabular ${r.tone === "good" ? "text-emerald-300" : r.tone === "bad" ? "text-rose-300" : "text-white"}`}>{r.value}</dd>
              {r.note && <dd className="text-[11px] text-slate-400">{r.note}</dd>}
            </div>
          ))}
        </dl>
      </section>

      {(errors.length > 0 || warnings.length > 0) && (
        <ul className="space-y-1.5 text-sm" aria-live="polite">
          {errors.map((e) => <li key={e} className="flex items-start gap-2 text-rose-700"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{e}</li>)}
          {warnings.map((w) => <li key={w} className="flex items-start gap-2 text-amber-800"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{w}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={!ok}><Save className="h-4 w-4" aria-hidden /> Save {date}</button>
        <p className="text-xs text-slate-500">Blank boxes keep what is already saved for that day, or are estimated (costs) or zero.</p>
      </div>
    </form>
  );
}
