import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureUser } from "@/lib/repo";
import { loadScoreboard } from "@/lib/scoreboard/server";
import { LAST_YEAR_TEMPLATE } from "@/lib/scoreboard/csv";

/** CSV of week/month/year totals (paid only), or the last-year template (?template=1, anyone signed in). */
export async function GET(req: Request) {
  const s = await auth();
  if (!s?.user?.id) return new NextResponse("Sign in first", { status: 401 });
  const url = new URL(req.url);
  if (url.searchParams.get("template")) return new NextResponse(LAST_YEAR_TEMPLATE, { headers: { "content-type": "text/csv", "content-disposition": 'attachment; filename="helix-last-year-template.csv"' } });
  const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
  const sb = await loadScoreboard(id);
  if (!sb.paid || !sb.history) return new NextResponse("Exports are on Starter and Growth.", { status: 402 });
  const p = url.searchParams.get("by");
  const rows = sb.history[p === "week" || p === "year" ? p : "month"];
  const csv = ["period,from,to,sales,costs,profit,margin_pct,orders,ad_spend,roas", ...rows.map((r) => [r.label, r.from, r.to, r.sales, r.costs, r.profit, r.marginPct ?? "", r.orders, r.adSpend, r.roas ?? ""].join(","))].join("\n") + "\n";
  return new NextResponse(csv, { headers: { "content-type": "text/csv", "content-disposition": `attachment; filename="helix-${p ?? "month"}-totals.csv"` } });
}
