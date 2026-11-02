import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { seminarForDate, todayInSydney } from "@/lib/seminars/rotation";

export const dynamic = "force-dynamic";

/**
 * Daily switch. The seminar page already works out "today" in Sydney on every request, so this cron only refreshes
 * caches and logs the pick. Scheduled at 13:01 and 14:01 UTC so it lands just after midnight Sydney in both AEDT and AEST.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const pick = seminarForDate(todayInSydney());
  revalidatePath("/seminars", "layout");
  console.log("[seminars] today", pick.date, pick.seminar.id, pick.reason, pick.event?.key ?? "");
  return NextResponse.json({ date: pick.date, seminar: pick.seminar.id, reason: pick.reason, event: pick.event?.key ?? null });
}
