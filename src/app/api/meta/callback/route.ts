import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { appUrl } from "@/lib/meta/config";
import { connectFromCode } from "@/lib/meta/service";
import { logAudit } from "@/lib/meta/store";

export const dynamic = "force-dynamic";

function sameState(a: string | undefined, b: string | null) {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(req: NextRequest) {
  const u = await requireUser("/dashboard/integrations");
  const sp = req.nextUrl.searchParams;
  const back = (q: string) => {
    const res = NextResponse.redirect(`${appUrl(req.nextUrl.origin)}/dashboard/integrations?${q}`);
    res.cookies.delete({ name: "helix_meta_state", path: "/api/meta" });
    return res;
  };
  if (!sameState(req.cookies.get("helix_meta_state")?.value, sp.get("state"))) {
    await logAudit(u.id, { actor: "user", action: "meta.connect", target: "oauth", outcome: "blocked", detail: { reason: "state mismatch" } });
    return back("error=state");
  }
  if (sp.get("error") || !sp.get("code")) return back("error=denied");
  try {
    await connectFromCode(u.id, sp.get("code")!, req.nextUrl.origin);
    return back("connected=1");
  } catch (e) {
    await logAudit(u.id, { actor: "user", action: "meta.connect", target: "oauth", outcome: "error", detail: { message: (e as Error).message } });
    return back("error=exchange");
  }
}
