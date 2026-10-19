import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getDays, getProfitSetup, getSettings } from "@/lib/repo";
import { tableRows, toCsv } from "@/lib/numbers";

export const dynamic = "force-dynamic";

/** Download the daily tracking table as CSV (opens in any spreadsheet app). */
export async function GET() {
  const u = await requireUser("/dashboard/numbers/table");
  const [days, settings, setup] = await Promise.all([getDays(u.id), getSettings(u.id), getProfitSetup(u.id)]);
  const unitCost = setup ? setup.productCost + setup.freightDuty + setup.packaging : 0;
  return new NextResponse(toCsv(tableRows(days, settings, unitCost)), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="helix-daily-numbers.csv"`, "cache-control": "no-store" } });
}
