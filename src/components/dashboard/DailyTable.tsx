"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, Check, FileDown, Link2, Loader2, Upload, X } from "lucide-react";
import { SOURCE_LABEL, detectSource, guessMapping, parseTable, rollUp, type ImportDay, type Source, type Target } from "@/lib/csv-import";

type Raw = Record<string, number | string>;
type Calc = { date: string; profit: number; roas: number; merPct: number; convPct: number; aov: number };
type Actions = {
  addDay: (date: string) => Promise<{ ok: boolean; error?: string }>;
  saveCell: (date: string, field: string, value: number) => Promise<{ ok: boolean }>;
  importDays: (rows: ImportDay[]) => Promise<{ ok: boolean; added: number; updated: number; error?: string }>;
};

/** Raw inputs you can edit, then calculated columns (read-only). */
const EDIT: [string, string, boolean][] = [
  ["revenue", "Gross sales", true], ["orders", "Orders", false], ["sessions", "Visits", false], ["discounts", "Discounts", true], ["refunds", "Refunds", true],
  ["cogs", "Product cost", true], ["shipping", "Shipping", true], ["paymentFees", "Payment fees", true],
  ["adMeta", "Meta ads", true], ["adGoogle", "Google ads", true], ["adTiktok", "TikTok ads", true],
];
const CALC: [keyof Calc, string][] = [["profit", "Profit"], ["roas", "ROAS"], ["merPct", "MER"], ["convPct", "Conversion"], ["aov", "Avg order"]];
const FIELD_OPTIONS: [Target, string][] = [["", "Ignore"], ["date", "Date"], ["orderId", "Order id (count orders)"], ...EDIT.map(([k, h]) => [k as Target, h] as [Target, string]),
  ["units", "Units sold"], ["metaRevenue", "Meta-attributed sales"], ["googleRevenue", "Google-attributed sales"], ["tiktokRevenue", "TikTok-attributed sales"]];

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtCalc = (k: keyof Calc, v: number) => (k === "profit" || k === "aov" ? money(v) : k === "roas" ? (v ? `${v.toFixed(2)}x` : "-") : `${v.toFixed(1)}%`);
const today = () => new Date().toISOString().slice(0, 10);

function Cell({ date, field, value, isMoney, save }: { date: string; field: string; value: number; isMoney: boolean; save: Actions["saveCell"] }) {
  const [v, setV] = useState(String(value || ""));
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const last = useRef(String(value || ""));
  const commit = async () => {
    if (v === last.current) return;
    setState("saving");
    const r = await save(date, field, Number(v) || 0);
    last.current = v;
    setState(r.ok ? "saved" : "idle");
    setTimeout(() => setState("idle"), 1200);
  };
  return (
    <td className="relative px-1 py-1">
      <label className="sr-only" htmlFor={`${date}-${field}`}>{field} on {date}</label>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">{isMoney ? "$" : ""}</span>
      <input id={`${date}-${field}`} inputMode="decimal" value={v} placeholder="0" onChange={(e) => setV(e.target.value.replace(/[^0-9.]/g, ""))} onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        className={`w-24 rounded-md border border-transparent bg-transparent py-1 pr-2 text-right tabular-nums hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:outline-none ${isMoney ? "pl-5" : "pl-2"} ${state === "saved" ? "bg-emerald-50" : ""}`} />
      {state === "saving" && <Loader2 className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-slate-400" aria-hidden />}
    </td>
  );
}

function Importer({ onClose, run }: { onClose: () => void; run: Actions["importDays"] }) {
  const [file, setFile] = useState<{ name: string; head: string[]; rows: string[][]; source: Source } | null>(null);
  const [map, setMap] = useState<Target[]>([]);
  const [us, setUs] = useState(false);
  const [drag, setDrag] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const read = async (f: File) => {
    if (f.size > 5_000_000) return setMsg("That file is over 5 MB. Export a shorter date range.");
    const t = parseTable(await f.text());
    if (t.length < 2) return setMsg("We could not find any rows in that file.");
    const source = detectSource(t[0]);
    setFile({ name: f.name, head: t[0], rows: t.slice(1), source });
    setMap(guessMapping(t[0], source));
    setMsg("");
  };
  const days = file ? rollUp(file.rows, map, file.source, us) : [];
  const cols = [...new Set(map.filter((m) => m && m !== "date"))].map((m) => (m === "orderId" ? "orders" : m));
  return (
    <section className="card space-y-4 p-5" aria-label="Upload CSV" data-testid="import-panel">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Upload a CSV</h2>
        <button onClick={onClose} className="rounded p-1 hover:bg-slate-100" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      {!file ? (
        <label onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) read(f); }}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center ${drag ? "border-cyan-500 bg-cyan-50" : "border-slate-300"}`}>
          <Upload className="h-6 w-6 text-slate-500" aria-hidden />
          <span className="font-semibold">Drop a file here, or click to choose</span>
          <span className="text-sm text-slate-600">Shopify (Sales over time or Orders export), Meta Ads, Google Ads, TikTok Ads, or any spreadsheet saved as CSV.</span>
          <input type="file" accept=".csv,.tsv,.txt,text/csv" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) read(f); }} />
        </label>
      ) : (
        <>
          <p className="text-sm text-slate-700"><strong>{file.name}</strong>: looks like a <strong>{SOURCE_LABEL[file.source]}</strong>, {file.rows.length} rows. Check the columns below, then import. Days are merged by date, so nothing is doubled.</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600"><tr>{file.head.map((h, i) => (
                <th key={i} className="px-2 py-2 text-left font-semibold">
                  <div className="whitespace-nowrap">{h || `Column ${i + 1}`}</div>
                  <select aria-label={`Map ${h}`} value={map[i] ?? ""} onChange={(e) => setMap(map.map((m, j) => (j === i ? (e.target.value as Target) : m)))} className={`mt-1 rounded border px-1 py-0.5 text-xs ${map[i] ? "border-cyan-400 bg-cyan-50" : "border-slate-300"}`}>
                    {FIELD_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </th>))}</tr></thead>
              <tbody>{file.rows.slice(0, 3).map((r, i) => <tr key={i} className="border-t border-slate-100">{file.head.map((_, j) => <td key={j} className="whitespace-nowrap px-2 py-1 text-slate-700">{r[j]}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={us} onChange={(e) => setUs(e.target.checked)} /> Dates are month first (US style, e.g. 10/15/2026)</label>
          <div>
            <h3 className="text-sm font-semibold">Preview: {days.length} days</h3>
            {map.includes("date") ? (
              <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-right text-sm tabular-nums">
                  <thead className="sticky top-0 bg-slate-50 text-xs text-slate-600"><tr><th className="px-2 py-1 text-left">Date</th>{cols.map((c) => <th key={c} className="px-2 py-1">{FIELD_OPTIONS.find(([v]) => v === c)?.[1] ?? c}</th>)}</tr></thead>
                  <tbody>{days.slice(0, 31).map((d) => <tr key={d.date} className="border-t border-slate-100"><td className="px-2 py-1 text-left">{d.date}</td>{cols.map((c) => <td key={c} className="px-2 py-1">{(d as unknown as Record<string, number>)[c] ?? 0}</td>)}</tr>)}</tbody>
                </table>
              </div>
            ) : <p className="mt-1 text-sm text-rose-700">Pick which column holds the date.</p>}
          </div>
          <p className="text-xs text-slate-500">Helix shows money in USD. If your file is in another currency, convert it first (or set your store currency to USD) so profit adds up.</p>
          <div className="flex flex-wrap gap-2">
            <button disabled={pending || !days.length} className="btn-primary text-sm disabled:opacity-50" onClick={() => start(async () => {
              const r = await run(days);
              setMsg(r.ok ? `Imported: ${r.added} new days, ${r.updated} updated.` : r.error ?? "Import failed.");
              if (r.ok) { setFile(null); router.refresh(); }
            })}>{pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />} Import {days.length} days</button>
            <button className="btn-ghost text-sm" onClick={() => setFile(null)}>Choose another file</button>
          </div>
        </>
      )}
      {msg && <p className="text-sm font-medium text-slate-800" role="status">{msg}</p>}
    </section>
  );
}

export function DailyTable({ raw, calc, actions }: { raw: Raw[]; calc: Calc[]; actions: Actions }) {
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [date, setDate] = useState(today());
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const byDate = new Map(calc.map((c) => [c.date, c]));
  const rows = [...raw].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 120);
  const add = () => start(async () => { const r = await actions.addDay(date); if (!r.ok) setErr(r.error ?? ""); else { setAdding(false); setErr(""); router.refresh(); } });

  const toolbar = (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => setAdding(true)} className="btn-primary text-sm"><CalendarPlus className="h-4 w-4" aria-hidden /> Add a day</button>
      <button onClick={() => setImporting(true)} className="btn-ghost text-sm"><Upload className="h-4 w-4" aria-hidden /> Upload CSV</button>
      <a href="/api/numbers/template" className="btn-ghost text-sm"><FileDown className="h-4 w-4" aria-hidden /> Blank template</a>
      {rows.length > 0 && <a href="/api/numbers/export" className="btn-ghost text-sm"><FileDown className="h-4 w-4" aria-hidden /> Download CSV</a>}
    </div>
  );

  return (
    <div className="space-y-4">
      {toolbar}
      {adding && (
        <div className="card flex flex-wrap items-end gap-3 p-4">
          <label className="text-sm font-semibold">Date<input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className="mt-1 block rounded-lg border border-slate-300 px-3 py-1.5" /></label>
          <button onClick={add} disabled={pending} className="btn-primary text-sm">Add row</button>
          <button onClick={() => setAdding(false)} className="btn-ghost text-sm">Cancel</button>
          {err && <p className="text-sm text-rose-700">{err}</p>}
          <p className="w-full text-xs text-slate-500">The new row appears in the table. Click any white cell to type a number; it saves when you leave the cell.</p>
        </div>
      )}
      {importing && <Importer onClose={() => setImporting(false)} run={actions.importDays} />}
      {rows.length === 0 ? (
        <section className="card p-8 text-center" data-testid="numbers-empty">
          <h2 className="text-xl font-semibold">No days yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-600">Pick the easiest way to get your numbers in. Helix then works out profit, ROAS, MER and conversion for every day.</p>
          <div className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-3">
            <Link href="/dashboard/connect" className="card flex flex-col items-center gap-2 p-5 hover:border-cyan-400"><Link2 className="h-6 w-6 text-cyan-600" aria-hidden /><span className="font-semibold">Connect your tools</span><span className="text-xs text-slate-500">Shopify and ads fill it in every morning.</span></Link>
            <button onClick={() => setAdding(true)} className="card flex flex-col items-center gap-2 p-5 hover:border-cyan-400"><CalendarPlus className="h-6 w-6 text-[#C2306F]" aria-hidden /><span className="font-semibold">Add a day</span><span className="text-xs text-slate-500">Type yesterday&apos;s sales and ad spend.</span></button>
            <button onClick={() => setImporting(true)} className="card flex flex-col items-center gap-2 p-5 hover:border-cyan-400"><Upload className="h-6 w-6 text-[#2F7359]" aria-hidden /><span className="font-semibold">Upload a CSV</span><span className="text-xs text-slate-500">From Shopify, Meta, Google, TikTok or a spreadsheet.</span></button>
          </div>
        </section>
      ) : (
        <div className="card max-w-full overflow-x-auto p-0" data-testid="numbers-table">
          <table className="min-w-max text-right text-sm tabular-nums">
            <thead className="bg-slate-100 text-xs text-slate-600">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-slate-100 px-3 py-2 text-left font-semibold">Date</th>
                {EDIT.map(([k, h]) => <th key={k} scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">{h}</th>)}
                {CALC.map(([k, h], i) => <th key={k} scope="col" className={`whitespace-nowrap bg-paper-2 px-3 py-2 font-semibold ${i === 0 ? "border-l border-slate-300" : ""}`}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const c = byDate.get(String(r.date));
                return (
                  <tr key={String(r.date)} className="border-t border-slate-100 bg-white">
                    <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-1.5 text-left font-medium text-slate-900 shadow-[1px_0_0_#dedcd4]">{String(r.date)}</th>
                    {EDIT.map(([k, , m]) => <Cell key={k} date={String(r.date)} field={k} value={Number(r[k]) || 0} isMoney={m} save={actions.saveCell} />)}
                    {CALC.map(([k], i) => <td key={k} className={`whitespace-nowrap bg-slate-50 px-3 py-1.5 text-slate-700 ${i === 0 ? "border-l border-slate-300 font-semibold " + ((c?.profit ?? 0) < 0 ? "text-rose-700" : "text-emerald-700") : ""}`}>{c ? fmtCalc(k, Number(c[k])) : "-"}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
