import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { appUrl } from "@/lib/meta/config";
import { logAudit } from "@/lib/meta/store";
import { googleAdsMode } from "@/lib/google-ads/config";
import { connectGoogleAds } from "@/lib/google-ads/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const u = await requireUser("/dashboard/integrations");
  const sp = req.nextUrl.searchParams;
  const origin = appUrl(req.nextUrl.origin);
  const back = (q: string) => {
    const res = NextResponse.redirect(`${origin}/dashboard/integrations?${q}`);
    res.cookies.delete({ name: "helix_gads_state", path: "/api/google-ads" });
    return res;
  };
  if (googleAdsMode() !== "live") return back("google=soon");
  const a = req.cookies.get("helix_gads_state")?.value ?? "", b = sp.get("state") ?? "";
  if (!a || a.length !== b.length || !timingSafeEqual(Buffer.from(a), Buffer.from(b))) {
    await logAudit(u.id, { actor: "user", action: "google.connect", target: "oauth", outcome: "blocked", detail: { reason: "state mismatch" } });
    return back("error=google_state");
  }
  if (sp.get("error") || !sp.get("code")) return back("error=google_denied");
  try {
    await connectGoogleAds(u.id, sp.get("code")!, `${origin}/api/google-ads/callback`);
    return back("google_connected=1");
  } catch (e) {
    await logAudit(u.id, { actor: "user", action: "google.connect", target: "oauth", outcome: "error", detail: { message: (e as Error).message } });
    return back("error=google_exchange");
  }
}
