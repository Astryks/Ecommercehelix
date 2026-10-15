/**
 * CSV import for the Daily table: parses Shopify (Sales over time, Orders export), Meta Ads,
 * Google Ads, TikTok Ads exports or any spreadsheet, guesses a column mapping, and rolls rows up by date.
 * Pure functions, safe on client and server.
 */
import { NUM_FIELDS } from "./scorecard";

export type Field = (typeof NUM_FIELDS)[number];
export type Target = "date" | "orderId" | Field | "";
export type Source = "shopify-sales" | "shopify-orders" | "meta" | "google" | "tiktok" | "helix" | "generic";
export const SOURCE_LABEL: Record<Source, string> = {
  "shopify-sales": "Shopify: Sales over time", "shopify-orders": "Shopify: Orders export", meta: "Meta Ads export",
  google: "Google Ads export", tiktok: "TikTok Ads export", helix: "Helix template", generic: "Spreadsheet",
};

/** RFC 4180-ish parser: quotes, escaped quotes, commas, semicolons or tabs. */
export function parseTable(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const first = src.split(/\r?\n/, 1)[0] ?? "";
  const delim = first.includes("\t") ? "\t" : (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cell.trim()); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell.trim()); cell = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

const norm = (h: string) => h.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export function detectSource(headers: string[]): Source {
  const h = headers.map(norm);
  const has = (s: string) => h.some((x) => x === s || x.includes(s));
  if (h.includes("date") && NUM_FIELDS.some((f) => headers.includes(f))) return "helix";
  if (has("financial status") || (h.includes("name") && has("lineitem"))) return "shopify-orders";
  if (has("gross sales") && (has("net sales") || has("total sales"))) return "shopify-sales";
  if (has("amount spent") || has("reporting starts")) return "meta";
  if (has("cost") && (has("impr") || has("clicks")) && (has("day") || has("conv value"))) return "google";
  if (has("cost") && has("by day") || has("total complete payment") || (has("cost") && has("tiktok"))) return "tiktok";
  return "generic";
}

/** Guess which Helix field each column holds, per source. Unknown columns map to "" (ignored). */
export function guessMapping(headers: string[], source: Source): Target[] {
  const ad: Field = source === "google" ? "adGoogle" : source === "tiktok" ? "adTiktok" : "adMeta";
  const adRev: Field = source === "google" ? "googleRevenue" : source === "tiktok" ? "tiktokRevenue" : "metaRevenue";
  const used = new Set<Target>();
  return headers.map((raw) => {
    if (source === "helix") { const t = (raw === "date" || NUM_FIELDS.includes(raw as Field) ? raw : "") as Target; return t; }
    const h = norm(raw);
    let t: Target = "";
    if (["date", "day", "reporting starts", "by day", "created at", "order date"].includes(h) || h === "stat time day") t = "date";
    else if (source === "shopify-orders" && h === "name") t = "orderId";
    else if (source === "meta" || source === "google" || source === "tiktok") {
      if (/^(amount spent|cost|spend|total cost)/.test(h)) t = ad;
      else if (/purchases conversion value|conv value|total complete payment value|purchase value/.test(h)) t = adRev;
    } else if (source === "shopify-orders") {
      if (h === "subtotal") t = "revenue";
      else if (h === "discount amount") t = "discounts";
      else if (h === "refunded amount") t = "refunds";
      else if (h === "shipping") t = "shipping";
    } else {
      if (/^gross sales|^sales$|^revenue$|^total sales$/.test(h)) t = "revenue";
      else if (/^orders$|^total orders|^orders count/.test(h)) t = "orders";
      else if (/^discounts?$/.test(h)) t = "discounts";
      else if (/^returns$|^refunds?$/.test(h)) t = "refunds";
      else if (/^sessions$|^visits$|^online store sessions/.test(h)) t = "sessions";
      else if (/^shipping/.test(h)) t = "shipping";
      else if (/cost of goods|^cogs|product cost/.test(h)) t = "cogs";
      else if (/^units|net quantity|items sold/.test(h)) t = "units";
      else if (/meta|facebook/.test(h) && /spend|ads/.test(h)) t = "adMeta";
      else if (/google/.test(h) && /spend|ads/.test(h)) t = "adGoogle";
      else if (/tiktok/.test(h) && /spend|ads/.test(h)) t = "adTiktok";
    }
    if (t && t !== "date" && used.has(t)) t = "";
    if (t) used.add(t);
    return t;
  });
}

/** Many date formats down to YYYY-MM-DD. Day-first for slashes unless the first part is over 12 (US). */
export function toYmd(v: string, usDates = false): string | null {
  const s = v.trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})/);
  if (m) {
    let [a, b] = [Number(m[1]), Number(m[2])];
    if (usDates || b > 12) [a, b] = [b, a];
    if (a > 31 || b > 12) return null;
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}

export const toNum = (v: string) => {
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export type ImportDay = { date: string } & Partial<Record<Field, number>>;

/** Roll rows up by date with the chosen mapping. Orders exports count one order per order id. */
export function rollUp(rows: string[][], mapping: Target[], source: Source, usDates = false): ImportDay[] {
  const di = mapping.indexOf("date");
  if (di < 0) return [];
  const oi = mapping.indexOf("orderId");
  const byDate = new Map<string, ImportDay>();
  const seenOrders = new Set<string>();
  for (const r of rows) {
    const date = toYmd(r[di] ?? "", usDates);
    if (!date) continue;
    const d = byDate.get(date) ?? { date };
    if (oi >= 0) {
      const id = r[oi];
      if (!id || seenOrders.has(id)) continue; // Shopify repeats an order on each line item row
      seenOrders.add(id);
      d.orders = (d.orders ?? 0) + 1;
    }
    mapping.forEach((t, i) => {
      if (!t || t === "date" || t === "orderId") return;
      const v = toNum(r[i] ?? "");
      d[t] = Math.round(((d[t] ?? 0) + (t === "discounts" || t === "refunds" ? Math.abs(v) : v)) * 100) / 100;
    });
    byDate.set(date, d);
  }
  void source;
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** The blank template users can fill in. */
export const TEMPLATE_FIELDS: Field[] = ["revenue", "orders", "sessions", "discounts", "refunds", "cogs", "shipping", "paymentFees", "adMeta", "adGoogle", "adTiktok"];
export function templateCsv(today: string): string {
  return ["date," + TEMPLATE_FIELDS.join(","), `${today},` + TEMPLATE_FIELDS.map(() => "").join(",")].join("\n") + "\n";
}
