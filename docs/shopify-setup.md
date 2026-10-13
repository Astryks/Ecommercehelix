# Shopify setup (for Sid)

Helix connects to each store owner's Shopify store with OAuth (authorization code grant, **expiring offline token** with refresh, read-only scopes). Until `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are set in Vercel, the Shopify card says "Coming soon" and every Shopify route redirects back without error.

## What the code does
- `GET /api/shopify/install?shop=<store>.myshopify.com`: needs a signed-in Helix user on Starter or above. Checks Shopify's `hmac` when present, sets a random state cookie and redirects to `https://<shop>/admin/oauth/authorize` with scopes `read_orders,read_products,read_inventory`.
- `GET /api/shopify/callback`: verifies `state`, `shop` and `hmac`, then exchanges the code with `expiring=1`. The access and refresh tokens are stored AES-256-GCM encrypted (`TOKEN_ENCRYPTION_KEY`) in `ShopifyConnection`. The first sync pulls the last 60 days.
- Daily cron `/api/cron/shopify-sync` (18:30 UTC, about 5:30 AM Sydney) re-syncs the last 7 days (catches late refunds). It writes orders, units, gross sales, discounts, refunds and COGS (from variant unit cost) into Scorecard, product lines into Profit, and on-hand stock into Stock for SKUs the user already tracks. No customer names, emails or addresses are requested or stored.
- `POST /api/shopify/webhooks`: one endpoint for `app/uninstalled`, `customers/data_request`, `customers/redact` and `shop/redact`. Verifies `X-Shopify-Hmac-Sha256` with the app secret (401 if it fails). Uninstall deletes the token and Shopify product lines; shop/redact also deletes Shopify-sourced scorecard days. The customer topics are logged (Helix holds no customer personal data).
- `app/uninstalled` is also registered per shop through the Admin GraphQL API (`webhookSubscriptionCreate`, topic `APP_UNINSTALLED`, uri `https://ecommercehelix.com/api/shopify/webhooks`, API `2026-10`) right after the OAuth token exchange, and re-ensured by the daily sync cron. It is idempotent (skips if a subscription to that URI exists) and non-fatal (errors are audit-logged; connect and sync carry on). This replaces `shopify app deploy`, which could not log in.
- **Compliance webhooks** (`customers/data_request`, `customers/redact`, `shop/redact`) cannot be registered by API. They must be added via the CLI toml (`/workspace/shopify-app/shopify.app.toml`, `shopify app deploy`) before any App Store listing. The app is unlisted (custom distribution) for now.
- Disconnect in Helix calls `DELETE /admin/api_permissions/current.json` (uninstalls the app) and deletes the data.

## Steps in Shopify
1. Sign in at https://partners.shopify.com (or the Dev Dashboard at https://dev.shopify.com) with the E-commerce Helix organisation. Create one if needed.
2. **Apps → Create app → Create app manually** (a public app). Name: `E-commerce Helix`.
3. **Configuration / Versions** (or `shopify.app.toml` if you use the CLI):
   - App URL: `https://ecommercehelix.com/api/shopify/install`
   - Allowed redirection URL: `https://ecommercehelix.com/api/shopify/callback`
   - Embedded in Shopify admin: **off** (Helix is a standalone web app).
   - Access scopes: `read_orders,read_products,read_inventory` (nothing else).
   - Use expiring offline access tokens: **on** (required for new public apps since 1 April 2026).
4. **Webhooks**, API version `2026-10`, all to `https://ecommercehelix.com/api/shopify/webhooks`:
   - Compliance webhooks: customer data request, customer data erasure, shop data erasure.
   - App subscription: `app/uninstalled`.
   In `shopify.app.toml` this is:
   ```toml
   [webhooks]
   api_version = "2026-10"
   [[webhooks.subscriptions]]
   topics = ["app/uninstalled"]
   uri = "https://ecommercehelix.com/api/shopify/webhooks"
   [[webhooks.subscriptions]]
   compliance_topics = ["customers/data_request", "customers/redact", "shop/redact"]
   uri = "https://ecommercehelix.com/api/shopify/webhooks"
   ```
5. **API access → Protected customer data access**: request access to protected customer data. Orders count as protected data even though Helix keeps aggregates only. Choose **Level 1** (no name, email, phone or address fields). Give the reason: "Daily sales totals and product sales for the merchant's own profit dashboard." Answer the data protection questions: data minimised, encrypted at rest (tokens), TLS in transit, retained until uninstall, deleted on uninstall and on shop/redact.
6. **Client credentials**: copy the Client ID and Client secret into Vercel (Production):
   - `SHOPIFY_API_KEY` = Client ID
   - `SHOPIFY_API_SECRET` = Client secret
   Then redeploy (or push any commit). The Shopify card switches from "Coming soon" to "Connect Shopify".
7. **Test**: create a development store in Partners, install the app from Helix (Connections → enter `<store>.myshopify.com` → Connect Shopify), add a test order, press Sync now, and check Scorecard and Profit. Then uninstall from the store admin and confirm the card goes back to disconnected.
8. **Distribution**: pick **Custom distribution / unlisted** first (install link only, lighter review) or **Public (App Store)**. Note: an App Store listing requires charging merchants who install from the store through the Shopify Billing API. Helix bills through Stripe today, so stay unlisted unless you add Shopify Billing.
9. If you list it, the review needs: app icon, screenshots, a screencast of install → sync → disconnect, privacy policy URL `https://ecommercehelix.com/privacy`, a test Helix login on Starter for the reviewer, and the compliance webhooks above. Allow 1 to 3 weeks.

Optional later: `read_all_orders` (needs a separate request) to import more than 60 days of history.
