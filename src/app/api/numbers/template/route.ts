import { NextResponse } from "next/server";
import { templateCsv } from "@/lib/csv-import";

/** Blank daily numbers template (one row per day, USD). */
export async function GET() {
  return new NextResponse(templateCsv(new Date().toISOString().slice(0, 10)), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="helix-daily-template.csv"` } });
}
