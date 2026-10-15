import { NextResponse, type NextRequest } from "next/server";
import { logAudit } from "@/lib/meta/store";
import { normaliseShop, verifyWebhookHmac } from "@/lib/shopify/config";
import { deleteShopifyData, usersForShop } from "@/lib/shopify/service";

export const dynamic = "force-dynamic";

/**
 * One endpoint for app/uninstalled and the three mandatory compliance webhooks.
 * Helix stores no customer names, emails, phones or addresses, so customers/data_request and customers/redact have nothing to return or erase.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_API_SECRET;
  const raw = await req.text();
  if (!secret || !verifyWebhookHmac(raw, req.headers.get("x-shopify-hmac-sha256"), secret)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const topic = req.headers.get("x-shopify-topic") ?? "";
  let body: { shop_domain?: string; myshopify_domain?: string; domain?: string; customer?: { id?: number }; orders_requested?: number[]; orders_to_redact?: number[]; data_request?: { id?: number } } = {};
  try {
    body = JSON.parse(raw);
  } catch {
    /* empty body is fine */
  }
  const shop = normaliseShop(req.headers.get("x-shopify-shop-domain") ?? body.shop_domain ?? body.myshopify_domain ?? body.domain);
  const users = shop ? await usersForShop(shop) : [];
  for (const userId of users) {
    if (topic === "app/uninstalled") await deleteShopifyData(userId, "shopify", "app/uninstalled");
    else if (topic === "shop/redact") await deleteShopifyData(userId, "shopify", "shop/redact", true);
    else await logAudit(userId, { actor: "shopify", action: `shopify.${topic.replace("/", ".")}`, target: shop!, outcome: "ok", detail: { note: "Helix stores no customer personal data for this shop, so there is nothing to export or erase.", customerId: body.customer?.id ?? null, dataRequestId: body.data_request?.id ?? null, orders: (body.orders_requested ?? body.orders_to_redact ?? []).length } });
  }
  return NextResponse.json({ ok: true });
}
