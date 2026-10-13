import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/session";
import { appUrl } from "@/lib/meta/config";
import { logAudit } from "@/lib/meta/store";
import { normaliseShop, shopifyMode, verifyQueryHmac } from "@/lib/shopify/config";
import { connectShopify, ensureUninstallWebhook, syncShopify } from "@/lib/shopify/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function GET(req: NextRequest) {
  const u = await requireUser("/dashboard/integrations");
  const sp = req.nextUrl.searchParams;
  const back = (q: string) => {
    const res = NextResponse.redirect(`${appUrl(req.nextUrl.origin)}/dashboard/integrations?${q}`);
    res.cookies.delete({ name: "helix_shopify_state", path: "/api/shopify" });
    return res;
  };
  if (shopifyMode() !== "live") return back("shopify=soon");
  const [state, cookieShop] = (req.cookies.get("helix_shopify_state")?.value ?? "").split(".");
  const shop = normaliseShop(sp.get("shop"));
  if (!state || !sp.get("state") || !same(state, sp.get("state")!) || !shop || shop !== cookieShop || !verifyQueryHmac(sp, process.env.SHOPIFY_API_SECRET!)) {
    await logAudit(u.id, { actor: "user", action: "shopify.connect", target: "oauth", outcome: "blocked", detail: { reason: "state, shop or hmac mismatch" } });
    return back("error=shopify_state");
  }
  if (!sp.get("code")) return back("error=shopify_denied");
  try {
    await connectShopify(u.id, shop, sp.get("code")!);
  } catch (e) {
    await logAudit(u.id, { actor: "user", action: "shopify.connect", target: shop, outcome: "error", detail: { message: (e as Error).message } });
    return back("error=shopify_exchange");
  }
  await ensureUninstallWebhook(u.id, "user"); // non-fatal
  const r = await syncShopify(u.id, "user", 60);
  return back(r.ok ? "shopify_connected=1" : "shopify_connected=1&error=shopify_sync");
}
