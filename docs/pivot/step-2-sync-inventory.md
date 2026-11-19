# Step 2 — Sync inventory: what is real, what is still stubbed

Date: 19 Nov 2026 · Branch: `helix-agent-pivot` · Step 2 commit: see `git log`

**Headline finding: the sync workers were already real.** Shopify, Meta, Google Ads,
TikTok and Klaviyo all had working read pulls and cron routes before Step 2.
What was stubbed was *downstream*: the Insights page fed the 17 audit rules with
`EXAMPLE_SIGNALS`, every new account was seeded with 730 days of example
scorecard data, the campaigns page showed made-up Google/TikTok rows, and the
Shopify stock sync only updated SKUs the user already tracked (so a real store
with no example stock got no stock items at all). Step 2 fixed the downstream
plumbing; it did not rewrite the sync workers.

**Rule for the whole step:** a real user never sees made-up numbers presented as
their own data. Demo users (`demo-*` ids) keep the example data — that is how the
product is tried with zero keys — and it is always labelled EXAMPLE. A real user
with nothing connected sees "Not connected yet" with the exact connect step.

## 1. Inventory

Status key: **Real** = live API pull, works when connected · **Real (gated)** = code
is real but an env flag / credential is still missing · **Partial** = some fields
real, some not collected · **Stub** = no live pull exists yet.

### 1.1 Shopify — orders, sales, refunds, product costs, stock

| Item | Status | Detail |
|---|---|---|
| OAuth + token refresh | Real | `src/lib/shopify/service.ts` — expiring offline tokens, refresh rotation, encrypted storage. Custom-app token path (`shpat_…`) also works. |
| Daily order pull | Real | `syncShopify(userId, "cron", 7)` — last 7 days on cron, 60 days on first/manual sync. GraphQL, aggregates only (no customer/email/address fields). Test + cancelled orders skipped. Idempotent upserts into `ScorecardDay` / `ProductSale` via `setShopifySales` / `setShopifyProducts`. |
| Product costs (COGS) | Real | Unit cost from variant `inventoryItem.unitCost`. |
| Stock on-hand | Real (fixed in Step 2) | `setShopifyStock` now **creates** a stock item for any synced SKU the user does not track yet (name defaults to the SKU; owner can rename it) and updates on-hand / daily sales for tracked SKUs, in DB and in-memory modes. Before Step 2 it only updated tracked SKUs and did nothing in memory mode. |
| Order webhooks | Real (gated) | `ORDERS_CREATE/UPDATED` registration behind `SHOPIFY_ORDER_WEBHOOKS`; `APP_UNINSTALLED` always registered. |
| Order history > 60 days | Stub (needs Sid) | Shopify caps order reads at 60 days without the `read_all_orders` scope. See §3. |
| Sessions / add-to-carts / checkout completion | Not collected | Shopify sync does not pull sessions, ATC or checkouts. Sessions come from GA4 or manual entry; ATC is a manual/CSV field. This is why the `atc-high-checkout-low` and `mobile-gap` audit rules stay suppressed for real users (§2). |
| Cron | Real | `/api/cron/shopify-sync`, Vercel cron `0 18 * * *` UTC = 05:00 AEDT (04:00 AEST — see note in §1.7). `syncAllShopify` isolates failures per user, 240 s deadline. |
| Scopes | `read_orders`, `read_products`, `read_inventory` (read-only; Helix never writes to a store) |
| Env | `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_API_VERSION` (default `2026-10`) |
| Blocked on | Shopify app credentials in Vercel; `read_all_orders` request in the Partner dashboard for > 60 days. |

### 1.2 Meta — ad insights + campaign rows

| Item | Status | Detail |
|---|---|---|
| OAuth + long-lived token | Real | `src/lib/meta/service.ts` — short → long-lived token (~60 days), encrypted. Revoked token (error 190) auto-clears the connection. |
| Daily insights pull | Real | `syncUser` — last-7-day campaign insights, account now/prev 7 days, 14 days of daily spend. Pure mapping in `src/lib/meta/insights.ts` (purchases never double-counted: first of `omni_purchase` / `purchase` / `offsite_conversion.fb_pixel_purchase`). Writes daily Meta spend + attributed revenue into the scorecard via `setMetaSpend` (idempotent upsert). |
| Campaign tracker rows | Real | From the snapshot (`MetaSnapshot.campaigns`); grades/recommendations run on them. |
| Paused drafts | Real | `createPausedDraft` — campaign/ad set/creatives/ads all PAUSED; guardrail `assertWriteAllowed` blocks anything else. Unchanged in Step 2. |
| Mock mode | Real (demo/dev only) | `META_MOCK=1`, or no app configured outside production → fixture data from `EXAMPLE_CAMPAIGNS`, labelled mock. Production without an app → mode `off`, connect button hidden. |
| Cron | Real | `/api/cron/meta-sync`, `30 18 * * *` UTC = 05:30 AEDT. `syncAll` isolates failures per user. |
| Scopes | `ads_management`, `ads_read`, `business_management`, `pages_show_list`, `pages_read_engagement` (Instagram `instagram_basic` optional) |
| Env | `META_APP_ID`, `META_APP_SECRET`, `META_CONFIG_ID`, `META_PUBLIC=1` once approved |
| Blocked on | **Meta app review**: Advanced Access for `ads_read` / `ads_management`, plus business verification. Until `META_PUBLIC=1`, only app testers can connect. See §3. |

### 1.3 Google Ads + GA4

| Item | Status | Detail |
|---|---|---|
| OAuth + refresh token | Real | `src/lib/google-ads/service.ts` — offline refresh token, encrypted; `invalid_grant` marks the connection expired. |
| Campaign pull | Real | `syncGoogleAds` — last-30-day GAQL campaign-by-day report (cost, conversions, conversion value, clicks, impressions). Writes daily spend + conversion value via `setGoogleSpend`; snapshot stored in `GoogleAdsSnapshot`. |
| Campaign rows on Your ads | Real (fixed in Step 2) | The campaigns page now maps `GaSnapshot.campaigns` to tracker rows (budget shown as $0 — Google reports no daily budget per campaign in this pull; hook rate / frequency show as n/a, which Google does not report). Before Step 2 the page showed example Google rows. |
| Search terms / negatives | Stub | Not pulled. This is why the `search-term-waste` rule stays suppressed for real users. Needs a `search_term_view` GAQL pull (Step 3 or later). |
| Paused Search drafts | Real | `createPausedGoogleCampaign` — budget + PAUSED Search campaign, then PAUSED ad group / phrase keywords / responsive search ad. Guardrail `assertPaused` / `assertAllPaused`. |
| GA4 sessions | Real (gated) | `syncGa4Sessions` — last 30 days of daily sessions into `ScorecardDay.sessions`, via the Analytics Data API. Off unless `GA4_SESSIONS=1`, needs the `analytics.readonly` scope (asked only in the optional "Connect GA4" step) and a property id saved with `setGa4Property`. Runs inside `syncAllGoogleAds`. |
| Cron | Real | `/api/cron/google-ads-sync`, `30 18 * * *` UTC = 05:30 AEDT. |
| Scopes | `https://www.googleapis.com/auth/adwords`, `openid`, `email` (+ `analytics.readonly` only for GA4) |
| Env | `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GA4_SESSIONS=1` to enable GA4. No developer token needed (Google sunset them 9 Sep 2026). |
| Blocked on | Google OAuth client id/secret in Vercel (Sid-only, §3). |

### 1.4 TikTok Ads

| Item | Status | Detail |
|---|---|---|
| OAuth + token | Real | `src/lib/tiktok/service.ts` — Marketing API v1.3, encrypted token. |
| Daily spend pull | Real | `syncTikTok` — last 30 days of daily spend into `ScorecardDay.adTiktok` via `setChannelDays`. |
| Campaign rows | Stub | No campaign-level pull; the campaigns page shows no TikTok rows and the Connect TikTok button stays disabled with that reason. Only daily spend is synced. |
| Cron | Real | `/api/cron/tiktok-sync`, `45 18 * * *` UTC = 05:45 AEDT. |
| Env | `TIKTOK_ADS=1`, `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET` |
| Blocked on | Approved TikTok app (Sid-only, §3). |

### 1.5 Klaviyo / email

| Item | Status | Detail |
|---|---|---|
| Key connect + totals | Real (gated) | `src/lib/klaviyo/service.ts` — private API key (`pk_…`), read-only. Pulls flow + campaign values reports (yesterday; last 30 days on first sync), list size, flow list/status. Totals only; no profiles are read or stored. |
| Email revenue share + missing flows | Real (wired in Step 2) | `klaviyoSummary` now feeds the audit `email-gap` rule and the Insights "Email fixes" list with real numbers. Before Step 2 the rule ran on example data. |
| Flow creation / sending | Stub (by design) | No write calls. The 9 flows exist as drafts/copy to paste; Klaviyo stays drafts-only in Step 2. Sending is Step 3+ work. |
| Cron | Real | `/api/cron/klaviyo-sync`, `0 19 * * *` UTC = 06:00 AEDT. |
| Scopes (key) | Accounts: Read, Campaigns: Read, Flows: Read, Lists: Read, Metrics: Read |
| Env | `KLAVIYO=1` (off otherwise) |
| Blocked on | `KLAVIYO=1` in Vercel + a Klaviyo private API key per store (entered by the owner on the Integrations page). |

### 1.6 Site check, PageSpeed, social

| Item | Status | Detail |
|---|---|---|
| Store check (crawl) | Real | `src/lib/site-audit/run.ts` — plain server fetches: robots.txt, home page, `/products.json`, one product page, `/cart.js`. ~5 requests, no paid API. Findings + facts saved per run; monthly re-check cron `/api/cron/site-audit` for paid stores. Now feeds the audit `site` block (reviews above fold, shipping text, free-shipping threshold, email capture). |
| PageSpeed score / LCP | Stub | No PageSpeed API call exists anywhere in the codebase. The audit rules that cite a speed score cannot be evaluated on real data; their speed evidence is stripped (see §2). Needs a PageSpeed Insights API key (free, no Sid approval needed beyond the key). |
| Social presence | Stub | No Instagram/TikTok/Facebook API pull exists. `social-profile-gaps` and `ads-social-mismatch` stay suppressed for real users. The example checklists on Insights are now demo-only. |
| Weekly report / Monday scorecard email | Real (gated) | `/api/cron/monday-scorecard` sends only when `SCORECARD_EMAIL_LIVE=1`. |

### 1.7 Cron schedule (vercel.json)

All Vercel cron times are UTC. Sydney is AEDT (UTC+11) Nov–Mar and AEST (UTC+10)
Apr–Oct, so the local time shifts by one hour in winter — the schedule is set for
AEDT and runs an hour earlier in local time during AEST. That is noted here
rather than "fixed" with a second schedule.

| Cron | UTC | Sydney (AEDT) | What it does |
|---|---|---|---|
| `/api/cron/shopify-sync` | 18:00 | 05:00 | Shopify orders/sales/stock, last 7 days |
| `/api/cron/meta-sync` | 18:30 | 05:30 | Meta insights + campaign rows |
| `/api/cron/google-ads-sync` | 18:30 | 05:30 | Google Ads campaigns + GA4 sessions |
| `/api/cron/tiktok-sync` | 18:45 | 05:45 | TikTok daily spend |
| `/api/cron/klaviyo-sync` | 19:00 | 06:00 | Klaviyo email totals |
| `/api/cron/site-audit` | 17:00 | 04:00 | Store re-checks (paid, 30+ days old) |
| `/api/cron/coach-learn` | 19:50 | 06:50 | Coach memory refresh from store totals |
| `/api/cron/sheets-sync` | 18:45 | 05:45 | Re-import linked Google Sheets |

Every cron route requires `Authorization: Bearer $CRON_SECRET` (401 otherwise) and
every `syncAll*` isolates failures per user with a 240 s deadline, so one broken
connection cannot block the rest.

## 2. What Step 2 changed in code

| File | Change |
|---|---|
| `src/lib/signal-coverage.ts` (new) | Pure module: `SyncCoverage` per data block, `RULE_NEEDS` per audit rule, `insightsFromSignals()` — runs the unchanged `runRules()` then keeps only insights whose data is really there, and strips PageSpeed evidence when there is no PageSpeed data. |
| `src/lib/signals.ts` | Rewritten: builds signals from real scorecard days (non-example only), Meta snapshot, Google snapshot (brand share from campaign names), Klaviyo summary, latest store-check facts, and the Black Friday calendar. Demo users still get `EXAMPLE_SIGNALS`. Returns `coverage` + `demo` alongside the insights. |
| `src/lib/repo.ts` | `ensureUser` seeds the 730 example days + example products for **demo users only** (new `seedExampleFor()`); real users start empty and keep getting their subscription row. `seedStock` likewise demo-only. `setShopifyStock` now creates stock items for new SKUs (DB + in-memory) instead of only updating tracked ones. |
| `src/lib/demo-auth.ts` | New `seedExampleFor(userId)` = `isDemoUserId(userId)`. |
| `src/app/dashboard/campaigns/page.tsx` | Google snapshot campaigns render as live rows; example rows are demo-only; a real user with nothing connected sees "No ad accounts connected yet" with connect steps instead of made-up campaigns; the Google connect button now links to Integrations (it exists — the old disabled button was stale); footer no longer crashes when only Google is live. |
| `src/app/dashboard/insights/page.tsx` | Example site/social checklists are demo-only; a real user with no synced data sees "Nothing checked yet" instead of the misleading "All clear"; schedule text corrected to "Daily, when connected". |
| `vercel.json` | Cron times aligned to the spec: Shopify 05:00, Meta/Google 05:30 Sydney (AEDT). |
| `tests/signal-coverage.test.ts` (new) | 5 tests: evaluable rules fire on real data and are marked real; `ad-good-site-bad` fires with speed evidence stripped; nothing fires with no coverage; the 5 uncollectable rules stay suppressed even when their numbers would trigger them; Meta-off keeps email + peak rules. |
| `tests/demo-auth.test.ts` | `seedExampleFor` cases added. |

### Audit rules: what can now fire on real data, and what cannot

Evaluable for a real user (7 of 12): `ad-good-site-bad` (speed evidence stripped),
`site-good-ctr-weak`, `fatigue`, `views-no-clicks`, `mer-drift`, `email-gap`,
`peak-runway`. Thresholds in `src/lib/audit.ts` were **not** changed.

Still suppressed for real users, with the exact data that would unlock each:
- `atc-high-checkout-low` — needs checkout completion; Shopify sync pulls orders, not checkouts.
- `mobile-gap` — needs a mobile/desktop conversion split; scorecard days carry no device split.
- `search-term-waste` — needs Google search-term rows; the Google sync pulls campaign totals only.
- `social-profile-gaps`, `ads-social-mismatch` — need a social presence pull; none exists.

### Verification (this sandbox)

- `npx vitest run`: **526 passed, 5 failed, 2 skipped** (520 baseline + 6 new tests).
  The 5 failures are the pre-existing ones in `tests/payments.test.ts` /
  `tests/fb-group.test.ts` / `tests/limits.test.ts`, all from the missing
  `@prisma/client` in this sandbox — identical to the Step 1 baseline.
- `npx tsc --noEmit`: **86 errors, identical to the clean-tree baseline**
  (verified by `git stash` comparison; only line numbers shifted).
- `next build` / `next dev` and any DB-backed path could **not** be smoke-tested
  here: Prisma client generation fails in this sandbox (npm registry ECONNRESET
  / `@prisma/engines` postinstall failure, same as Step 1). Tried once, recorded,
  moved on. Live verification needs a machine/Vercel deploy with a database —
  see §3.

## 3. Sid-only checklist — what only Sid can provide

Nothing below was requested, invented or set by the agent. Each item stays stubbed
or gated until it exists.

| # | Item | Where it is entered | What stays stubbed / gated until then |
|---|---|---|---|
| 1 | **Meta app review** — Advanced Access for `ads_read` and `ads_management`, plus business verification | Meta for Developers → the Helix app → App Review; then set `META_PUBLIC=1` in Vercel | Meta connect works only for app testers; all other stores see "Meta app is not configured" / mode `off`. Live Meta sync, drafts and insights are blocked for the public. |
| 2 | **Google Ads OAuth client id + secret** | Google Cloud project → OAuth client; set `GOOGLE_ADS_CLIENT_ID` + `GOOGLE_ADS_CLIENT_SECRET` in Vercel | Google Ads connect + sync + paused Search drafts are off (`googleAdsMode() === "off"`). |
| 3 | **Shopify `read_all_orders` scope** | Shopify Partner dashboard → the Helix app → request the scope (needs Shopify approval) | Order history is capped at 60 days; first syncs and year-on-year views only go back 60 days. |
| 4 | **Shopify app credentials** | Shopify Partner dashboard → app settings; set `SHOPIFY_API_KEY` + `SHOPIFY_API_SECRET` in Vercel | Shopify connect shows "coming soon" and `syncShopify` returns "not configured". (A store owner can still connect via the custom-app token path without this.) |
| 5 | **TikTok app approval** | TikTok for Business → app; set `TIKTOK_ADS=1` + `TIKTOK_APP_ID` + `TIKTOK_APP_SECRET` in Vercel | TikTok connect + spend sync off; campaign rows do not exist even after this (no campaign pull built yet). |
| 6 | **Klaviyo flag** | Set `KLAVIYO=1` in Vercel | Klaviyo connect returns "Klaviyo is coming soon" and the email audit block stays empty. Each store owner then pastes their own `pk_…` private key on the Integrations page. |
| 7 | **AI Gateway key (coach, live)** | Set `AI_GATEWAY_API_KEY` in Vercel; run the embedding job `npx vite-node scripts/coach-embed.ts --yes` | The coach (turned on by default in Step 1) cannot call a live model without it; RAG falls back to keyword search until the embed job runs. |
| 8 | **GA4 (optional)** | Set `GA4_SESSIONS=1` in Vercel; each owner picks "Connect GA4", grants the `analytics.readonly` scope, and saves their GA4 property id | Sessions stay 0 unless entered by hand/CSV, so store conversion rate cannot be computed and the funnel block stays uncovered. |
| 9 | **`CRON_SECRET`** | Set in Vercel (already required by every cron route) | Without it every cron route returns 401 and no daily sync runs. |
| 10 | **PageSpeed Insights API key (optional, free)** | Google Cloud → enable the PageSpeed Insights API; add the key and wire it into the site check | Speed score / LCP stay unknown; `ad-good-site-bad` fires without speed evidence and `mobile-gap` stays suppressed. No Sid approval is needed beyond the key itself. |
| 11 | **Live Stripe test purchase + refund** | Stripe dashboard (test mode) → buy Starter, refund it | Billing is real in test mode only; not verified end-to-end in this build. |
| 12 | **Course video storage (~14 GB, not in git)** | Vercel Blob (suggested in `docs/course-videos.md`) + `COURSE_VIDEO_BASE_URL` | Course videos are not served from the repo. |

## 4. What Step 2 deliberately did NOT do

- No video/social generation, no ads autonomy beyond the existing paused-draft
  guardrail, no pricing/wallet changes, no email sending (Klaviyo stays
  drafts-only). That is Step 3/4 work.
- No audit-rule threshold changes.
- No credential was requested, invented or stored by the agent.
- Nothing was pushed to GitHub (local commits only, same as Step 1).
