import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { appUrl } from "@/lib/meta/config";
import { logAudit } from "@/lib/meta/store";
import { tiktokMode } from "@/lib/tiktok/config";
import { connectTikTok, syncTikTok } from "@/lib/tiktok/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const u = await requireUser("/dashboard/connect");
  const sp = req.nextUrl.searchParams;
  const origin = appUrl(req.nextUrl.origin);
  const back = (q: string) => {
    const res = NextResponse.redirect(`${origin}/dashboard/connect?${q}`);
    res.cookies.delete({ name: "helix_tt_state", path: "/api/tiktok" });
    return res;
  };
  if (tiktokMode() !== "live") return back("err=tiktok_not_configured");
  const a = req.cookies.get("helix_tt_state")?.value ?? "", b = sp.get("state") ?? "";
  if (!a || a.length !== b.length || !timingSafeEqual(Buffer.from(a), Buffer.from(b))) {
    await logAudit(u.id, { actor: "user", action: "tiktok.connect", target: "oauth", outcome: "blocked", detail: { reason: "state mismatch" } });
    return back("err=tiktok_state");
  }
  if (sp.get("error") || !sp.get("auth_code")) return back("err=tiktok_denied");
  try {
    await connectTikTok(u.id, sp.get("auth_code")!);
    const r = await syncTikTok(u.id);
    return back(r.ok ? "ok=tiktok_connected" : "ok=tiktok_pick");
  } catch (e) {
    await logAudit(u.id, { actor: "user", action: "tiktok.connect", target: "oauth", outcome: "error", detail: { message: (e as Error).message } });
    return back("err=tiktok_exchange");
  }
}
