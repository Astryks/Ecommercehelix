import { NextResponse, type NextRequest } from "next/server";
import { unsubscribe } from "@/lib/email/prefs";

export const dynamic = "force-dynamic";

/** One-click unsubscribe (RFC 8058): mail apps POST here. Opening the link in a browser (GET) shows a confirm page, so link scanners cannot unsubscribe people by accident. */
export async function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const k = req.nextUrl.searchParams.get("k") ?? "all";
  const ok = await unsubscribe(t, k);
  if ((req.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded") && req.headers.get("sec-fetch-mode") === "navigate")
    return NextResponse.redirect(new URL(`/email/unsubscribe?done=${ok ? 1 : 0}&k=${k}`, req.url), 303);
  return NextResponse.json({ ok });
}

export async function GET(req: NextRequest) {
  const u = new URL("/email/unsubscribe", req.url);
  u.searchParams.set("t", req.nextUrl.searchParams.get("t") ?? "");
  u.searchParams.set("k", req.nextUrl.searchParams.get("k") ?? "all");
  return NextResponse.redirect(u, 303);
}
