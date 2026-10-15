#!/usr/bin/env node
/**
 * One-time Stripe setup for Helix. Safe to run more than once.
 * Usage:  STRIPE_SECRET_KEY=sk_... node scripts/stripe-setup.mjs
 * It never prints the key. It prints the new price IDs and (if a webhook endpoint is created) the signing secret ONCE,
 * which you then paste into Vercel. Run with sk_test_ first, then sk_live_.
 */
const KEY = process.env.STRIPE_SECRET_KEY;
const SITE = process.env.SITE_URL || "https://ecommercehelix.com";
if (!KEY) { console.error("Set STRIPE_SECRET_KEY"); process.exit(1); }
const EVENTS = ["checkout.session.completed", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "invoice.paid", "invoice.payment_failed"];
const PLANS = [{ id: "starter", name: "Helix Starter", usd: 29 }, { id: "growth", name: "Helix Growth", usd: 59 }];

function form(obj, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((x, i) => (typeof x === "object" ? form(x, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(x))));
    else if (v && typeof v === "object") form(v, key, out);
    else if (v !== undefined) out.append(key, String(v));
  }
  return out;
}
async function api(method, path, body) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/x-www-form-urlencoded" }, body: body ? form(body) : undefined });
  const j = await r.json();
  if (!r.ok) throw new Error(`${method} ${path}: ${j.error?.message}`);
  return j;
}

const mode = KEY.startsWith("sk_live") || KEY.startsWith("rk_live") ? "LIVE" : "TEST";
console.log(`Stripe mode: ${mode}`);

// 1) Products and USD monthly prices (found again by lookup_key, so re-runs do not duplicate).
const ids = {};
for (const p of PLANS) {
  const lookup = `helix_${p.id}_usd_monthly`;
  const found = (await api("GET", `prices?lookup_keys[]=${lookup}&active=true&limit=1`)).data[0];
  if (found) { ids[p.id] = found.id; continue; }
  const prod = (await api("GET", `products/search?query=${encodeURIComponent(`metadata['helix_plan']:'${p.id}'`)}`)).data[0] ?? (await api("POST", "products", { name: p.name, metadata: { helix_plan: p.id } }));
  const price = await api("POST", "prices", { product: prod.id, currency: "usd", unit_amount: p.usd * 100, recurring: { interval: "month" }, lookup_key: lookup, metadata: { helix_plan: p.id } });
  ids[p.id] = price.id;
}
console.log(`STRIPE_PRICE_STARTER=${ids.starter}`);
console.log(`STRIPE_PRICE_GROWTH=${ids.growth}`);

// 2) Webhook endpoint with the six events.
const url = `${SITE}/api/stripe/webhook`;
const hooks = (await api("GET", "webhook_endpoints?limit=100")).data.filter((h) => h.url === url);
if (hooks.length) {
  for (const h of hooks) await api("POST", `webhook_endpoints/${h.id}`, { enabled_events: EVENTS, disabled: false });
  console.log(`Webhook ${url}: updated to the 6 events (signing secret unchanged).`);
} else {
  const h = await api("POST", "webhook_endpoints", { url, enabled_events: EVENTS, description: "Helix" });
  console.log(`Webhook created. Put this in Vercel as STRIPE_WEBHOOK_SECRET: ${h.secret}`);
}

// 3) Customer portal: cancel at period end, update card, invoices, switch plans.
const portal = {
  business_profile: { headline: "Manage your Helix plan", privacy_policy_url: `${SITE}/privacy`, terms_of_service_url: `${SITE}/terms` },
  default_return_url: `${SITE}/dashboard/billing`,
  features: {
    customer_update: { enabled: true, allowed_updates: ["email", "address"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end", proration_behavior: "none" },
    subscription_update: { enabled: true, default_allowed_updates: ["price"], proration_behavior: "create_prorations", products: PLANS.map((p) => ({ product: null, prices: [ids[p.id]] })) },
  },
};
for (const [i, p] of PLANS.entries()) portal.features.subscription_update.products[i].product = (await api("GET", `prices/${ids[p.id]}`)).product;
const configs = (await api("GET", "billing_portal/configurations?is_default=true&limit=1")).data;
if (configs[0]) await api("POST", `billing_portal/configurations/${configs[0].id}`, portal);
else await api("POST", "billing_portal/configurations", portal);
console.log("Customer portal: cancel at period end, update card, invoices, switch plans.");

// 4) Branding (works on your own account where Stripe allows it; otherwise set it in Dashboard > Settings > Branding).
try {
  await api("POST", "account", { settings: { branding: { primary_color: "#5A50D6", secondary_color: "#1A1718" } } });
  console.log("Branding colours set.");
} catch (e) { console.log(`Branding: set by hand in Dashboard > Settings > Branding (${e.message}).`); }

// 5) Tag older Helix prices still used by subscriptions, so members on them keep their plan without *_LEGACY env vars.
let tagged = 0, after;
do {
  const page = await api("GET", `subscriptions?status=all&limit=100&expand[]=data.items.data.price.product${after ? `&starting_after=${after}` : ""}`);
  for (const sub of page.data) for (const it of sub.items.data) {
    const pr = it.price;
    if (pr.metadata?.helix_plan) continue;
    const name = (typeof pr.product === "object" ? pr.product.name : "") || pr.nickname || "";
    const plan = /growth/i.test(name) ? "growth" : /starter/i.test(name) ? "starter" : null;
    if (plan) { await api("POST", `prices/${pr.id}`, { metadata: { helix_plan: plan } }); pr.metadata = { helix_plan: plan }; tagged++; console.log(`Older price ${pr.id} (${pr.currency.toUpperCase()}) tagged as ${plan}. Optional: add it to STRIPE_PRICE_${plan.toUpperCase()}_LEGACY.`); }
  }
  after = page.has_more ? page.data.at(-1).id : null;
} while (after);
console.log(`Older prices tagged: ${tagged}. Done.`);
