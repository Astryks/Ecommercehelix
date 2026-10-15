/** Google Sheets import without a Google login: the sheet is shared "anyone with the link" or published as CSV. */
export function sheetCsvUrl(input: string): string | null {
  let u: URL;
  try { u = new URL(input.trim()); } catch { return null; }
  if (u.protocol !== "https:" || u.hostname !== "docs.google.com") return null;
  const m = u.pathname.match(/^\/spreadsheets\/d\/(e\/)?([A-Za-z0-9_-]{10,})/);
  if (!m) return null;
  const gid = u.searchParams.get("gid") ?? u.hash.match(/gid=(\d+)/)?.[1] ?? "0";
  if (m[1]) return `https://docs.google.com/spreadsheets/d/e/${m[2]}/pub?output=csv&gid=${gid}`; // "Publish to web" link
  return `https://docs.google.com/spreadsheets/d/${m[2]}/export?format=csv&gid=${gid}`;
}

/** Map common spreadsheet headings onto Helix fields, so people can keep their own sheet. */
const ALIASES: Record<string, string> = {
  day: "date", sales: "revenue", "gross sales": "revenue", "total sales": "revenue", "shopify revenue": "revenue",
  "meta spend": "adMeta", "facebook spend": "adMeta", "meta ads": "adMeta", "google spend": "adGoogle", "google ads": "adGoogle",
  "tiktok spend": "adTiktok", "tiktok ads": "adTiktok", "cost of goods": "cogs", "product cost": "cogs", fees: "paymentFees",
  "payment fees": "paymentFees", visits: "sessions", "add to carts": "addToCarts", "items sold": "units",
};
export function normaliseHeaders(csv: string): string {
  const [head, ...rest] = csv.replace(/^\uFEFF/, "").split(/\r?\n/);
  const h = head.split(",").map((c) => { const k = c.trim().replace(/^"|"$/g, "").toLowerCase(); return ALIASES[k] ?? k; }).join(",");
  return [h, ...rest.map((l) => l.replace(/"([^"]*)"/g, (_, x: string) => x.replace(/[,$]/g, "")))].join("\n");
}
