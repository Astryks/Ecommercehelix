import { NextResponse, type NextRequest } from "next/server";
import { fetchSocialPresence } from "@/lib/social-presence";
import { listConnections } from "@/lib/meta/store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Weekly social-presence pull (Sundays 06:00 UTC). Needs CRON_SECRET like every other cron. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const conns = await listConnections().catch(() => []);
  let pulled = 0;
  for (const c of conns) {
    const p = await fetchSocialPresence(c.userId).catch(() => null);
    if (p) pulled++;
  }
  return NextResponse.json({ pulled, users: conns.length });
}
