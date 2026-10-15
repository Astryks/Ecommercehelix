import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/** Daily Vercel Cron just after midnight Sydney: refresh every cached page so date-driven content changes without a deploy. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
