# STATUS

_Last updated: 15 Oct 2026, about 9 PM (Sydney)._

## Needs Sid (only these are left)

1. **Stripe: one real purchase + refund (5 minutes).** Setup is done (15 Oct 2026, live mode). Left for you: buy Starter (US$29) on the live site with your own card, open Plan and billing > Manage, cancel, check access stays until the period end, then refund in Stripe. Also set branding by hand (Stripe does not allow it via the API on your own account): Dashboard > Settings > Branding: name "E-commerce Helix", logo option B, colour #5A50D6, accent #1A1718.
2. **TikTok (paused by Sid).** When ready: create the app at https://business-api.tiktok.com/portal, redirect URL `https://ecommercehelix.com/api/tiktok/callback`, then set `TIKTOK_APP_ID` and `TIKTOK_APP_SECRET` in Vercel. Spend sync is built after that (small additive table).
3. **Meta app review** (so people who are not testers can connect Meta): Business Verification in Meta Business Settings > Security Centre, then App Review for `ads_read`, `ads_management`, `business_management`, `pages_read_engagement` with the screen recording described in `docs/meta-setup.md`.
4. **Meta "Save choice" check** on Settings > Connections: sign in as yourself, pick your ad account, Page and pixel, press Save choice and confirm it sticks (the fix shipped; it needs your real Meta account to confirm). Then refund your earlier Starter payment and set your account to Starter free.
5. **Google Ads check-in:** once Google approves the developer token (https://console.cloud.google.com/google/ads-apis/overview?project=astryks), send it to me or set `GOOGLE_ADS_DEVELOPER_TOKEN` in Vercel Production, then connect your Google Ads account on /dashboard/connect and check the first sync.
6. **GitHub Support request (old cached research commits):** ask GitHub Support to remove the old cached commits 79bd6e9, d93fb8b, ac984ea, 90a2d45 and d785342 from Astryks/Astryks PR #12. Ready text: `docs/github-support-pr12.md`; send it at https://support.github.com/contact ("Removing sensitive data").
7. **Lesson videos** (when recorded): send the URLs and I add them (free YouTube picks per path step live in `src/lib/learn-path.json`).
8. **Social v3:** say OK before the 50 new posts are scheduled.
9. **Closed Facebook group for paying members:** the group is live and linked from Community. Check the join button once with a paid account, and remove members who cancel (by hand for now).
10. **Wins wall moderators:** set `WINS_MODERATORS` (comma-separated emails) in Vercel so wins can be approved.
11. **Search Console and Bing:** submit `https://ecommercehelix.com/sitemap.xml` (verification tag is already in the site).

## QA fixes (15 Oct 2026, night)

- CSV import: dates written in words keep the right day, blank cells no longer wipe saved numbers, Shopify shipping charges (what customers paid) are no longer counted as a shipping cost.
- Daily table: cells show new values after an import, a failed save turns red and retries, Add a day uses your local date.
- Card deck: Finish saves the last answers before moving on. Setup and profit forms read "$60" and "1,75" instead of saving 0.
- Contact form: the "we got it" email goes to signed-in members only and never repeats the message. Members are limited to 5 messages an hour (kept in the audit log, no schema change); signed-out visitors keep the per-server limit. Typed text stays after an error.
- Lesson checklist: ticks are kept per account, guest ticks are merged once and cleared, failed saves retry with a note, finished lessons open on the last step.
- Store check: one check at a time (per server), 10-minute wait after a failed check.
- Live QA round 2: lessons with every step ticked now count as done on Learn (totals, path steps, next lesson) and are saved as done; a finished lesson shows a done view. CSV preview lists rows left out. First real CSV import clears the example numbers. Daily table cells save one field at a time with saving/saved status; conversion shows - with no visits; TikTok shows in the day ad breakdown. Saving the profit setup ticks "Tell Helix your costs". Plan copy fixed (no "healthy" with low conversion, week line matches "you are here", "Today:" button). Store check prices show $. Sidebar email is cut short. /login goes to /signin; Send magic link shows it is sending. Phone menu on the site header. Learn path links have clear names; contact honeypot hidden from screen readers; ladder labels wrap.
- Not changed yet: "card 1 of 10" in the next-card box vs a 4-card deck could not be reproduced from the code (both read the same deck); needs the steps to reproduce. Old store check results keep their old wording until the next check.
- Deferred: SSRF hardening that pins the checked IP for the fetch (DNS rebinding). Low risk, needs a custom fetch dispatcher.

## Learning coverage check (15 Oct 2026, evening)
- Checked the playbook against all private research videos and transcripts (two programmes, about 1,500 lessons, grouped into 129 topics). Before: 115 covered, 5 partial, 7 missing, 2 out of scope. After: all 127 in-scope topics covered. The private inventory and matrix stay outside the repo.
- **10 new lessons (297 in total), in our own words, each slotted into the guided path next to its closest lesson:** 2.8 Why each extra ad dollar buys a bit less; 3.11 Raise prices and lean less on discounts; 5.18 One product, many kinds of buyer; 5.19 Keep a creative library; 9.18 A product-finder quiz; 9.19 Video on product pages; 10.14 Plain-text emails that feel personal; 14.10 Clear slow stock without cheapening your brand; 14.11 Sold out? Pre-orders and back-in-stock lists; 22.18 Sell to people near you.
- **Extended:** 7.12 (ad scheduling and spending limits rows), 22.5 (custom product fields). Lesson 9.5 renamed "Words that help people buy" (ref unchanged). Stage tags added for 3.11 (Grow) and 14.11 (Convert). Lesson-count test now at least 297.
- **Checks:** 8-gram originality check, banned-term check and heading check against the private research; repo and live pages searched for outside brand and programme names. Results in the commit notes below.

## Learn is now one guided path (15 Oct 2026, evening)

- /dashboard/learn: one "Your next lesson" card, then a numbered 7-step path with progress per step; "See entire course" timeline now runs in path order. Attract / Convert / Grow are small tags only.
- Steps (lessons): 1 Start here (13), 2 Know your customer and your offer (16), 3 Get your store ready to sell (43), 4 Plan your ads (56), 5 Set up your first ad (24), 6 Read your results and improve (26), 7 Grow (109). Total 287, same as before; a test checks every lesson is in the path exactly once.
- Each step has a page at /dashboard/learn/path/<id>. "Set up your first ad" opens with "Before you start" and a numbered "Do it in this order" list.
- 1 to 2 free YouTube videos per step, checked with YouTube oEmbed on 15 Oct (list in `src/lib/learn-path.json`).
- Progress: lesson refs, files and links did not change, so every saved completion and started step still counts. No schema change, no data migration needed.

## Done today (15 Oct 2026)

- **Simpler lessons (all lessons):** one step at a time (Step X of N, instruction, green Expected result, inline tips), one "Done, next step" / "Finish lesson" button, small Back link, thin progress bar, and an inline Checklist accordion with big tickable checkboxes saved per user (existing LessonProgress table, synced with Done, next step). All ticked shows a small celebration and an "Up next" lesson card. Removed Give me a checklist, Guide me, Show all steps, Hide guide and the dots.

- **Homepage polish + contact form + Daily table (evening):** Black Friday/Cyber Monday banner is now a bold ink bar with an amber countdown pill and button (other seasons keep the calm lavender bar). Supporting accents (pink, coral, mint) on some headline swipes, cards and icons; purple stays primary. Hero now says "Built for stores doing $10k–$30k a month. We help you reach $1M, profitably." (also in meta description, Who-for section, FAQ). Stage cards and milestones stepper redesigned; goals ladder is a clean vertical stepper with no overflow. FAQ heading is just "FAQ". CSS-only micro-animations (scroll-driven where supported, off for reduced motion). New Contact form at /contact and /dashboard/contact (honeypot, rate limit, server validation; Resend to `CONTACT_TO`, reply-to the sender, confirmation to the sender); visible support email removed from Help pages and Need help box (legal pages keep it). Numbers > Daily table: inline editable cells with autosave, Add a day, Upload CSV (Shopify Sales over time / Orders export, Meta, Google, TikTok, generic) with column mapping, preview and merge by date, blank template, empty state. No schema change was needed.

- **Stripe (LIVE mode) done:** ran `scripts/stripe-setup.mjs` with the live restricted key (re-run safe: a second run reused the same prices). Starter US$29/month `price_1UQgTxIPhQ2XB9EXaLmzuM5g`, Growth US$59/month `price_1UQgTyIPhQ2XB9EXamkfPgUR` set as `STRIPE_PRICE_STARTER/GROWTH` (Production + Preview, sensitive). Old prices moved to `STRIPE_PRICE_STARTER_LEGACY` / `STRIPE_PRICE_GROWTH_LEGACY` and tagged `helix_plan`. Webhook `https://ecommercehelix.com/api/stripe/webhook` enabled with all 6 events (existing endpoint, signing secret unchanged). Customer portal: cancel at period end, update card, invoices, switch plans, return to /dashboard/billing. Checkout verified opening at US$29 / US$59 (not paid).

- **Emails live:** `EMAILS_LIVE=1`, `SCORECARD_EMAIL_LIVE=1` and `NUDGES_LIVE=1` set in Vercel Production (the Resend key `AUTH_RESEND_KEY` and `EMAIL_FROM` are already set). Welcome, daily steps, sale date, win-back, alerts, Monday scorecard and nudges now send; receipts and payment emails send from the webhook. `RESEND_API_KEY` is not needed (the code falls back to `AUTH_RESEND_KEY`).
- **Secrets:** `CRON_SECRET` and `TOKEN_ENCRYPTION_KEY` already exist in Production and Preview (not regenerated, so saved Meta/Shopify/Google tokens stay readable).
- **Stripe code ready for USD:** new prices are recognised by ID or by their `helix_plan` tag / lookup key, so the switch cannot lock out current members. Setup script `scripts/stripe-setup.mjs`.
- **Lessons:** every sentence across all 30 modules is now 20 words or under (the only longer lines are the 12 "Related:" lines, which are lists of links, not sentences). Start of today: average 13.6 words, 290 over 25, 722 over 20. Now: average 11.5, 0 over 20.
- **Planning tools, automation, billing and emails:** see the dated sections below.
- **Cleanup (15 Oct, evening):** audience line and stage bands now match everywhere (Just starting under $10k a month, Growing $10k to $30k, Scaling $30k to $80k+; "Built for stores doing $10k to $30k a month, we help you reach $1M profitably"). New default goals from the benchmark review (Growing: 14,000 visits, 1.5% CTR, 6.5% add to cart, 1.6% conversion, $90 AOV, 30% MER, $27 CPA, 20% contribution, $1,500 net a month; Just starting: 5,000, 1.2%, 5%, 1.4%, $65, 35%, $23, 10%, $0+), plus a $1M-year end goal on /learn/goals (about 60k visits, 1.6%, $87, 25% MER, about $22 CPA, 25% contribution). Only defaults changed; saved user targets are untouched. Guide ranges: conversion 0.8/1.4/2.6%, AOV $60/$100/$150, contribution 10/20/30%. Store size switches to Scaling at $30k a month. Leftover A$/AUD text removed. Lesson "View as cards" link and the course-task "Guide me" button replaced by the inline checklist. Instagram link (@ecommercehelix) in the footer and Organization JSON-LD `sameAs`. Learn path videos: step 1 profit map (Common Thread Collective), step 3 Shopify conversion video (Learn With Shopify), step 6 brand finance literacy (Commerce Roundtable), step 7 Klaviyo email and SMS (Klaviyo); all checked with YouTube oEmbed.
- Scheduled Google Sheets refresh: still a one-off import (re-run by hand); low priority, no Sid action needed.

## At a glance

- **Live:** https://ecommercehelix.com (Vercel project `ecommercehelix`, Next.js 16). `www` redirects to the apex. Every push to `main` on GitHub (`Astryks/Ecommercehelix`) deploys to production.
- **Database:** Neon Postgres via Prisma. Schema changes are additive only and are applied to the production database before the code is pushed. Note: this build machine cannot reach Neon's port 5432, so changes are applied with `prisma migrate diff` (old schema to new schema, no drops allowed) run over Neon's HTTPS driver with the unpooled URL pulled from Vercel into a temp file that is deleted straight after.
- **Sign-in:** Resend email magic links are live. The demo login is on (each demo sign-in is a fresh, isolated test account). Google sign-in is optional and needs Sid's OAuth keys.
- **Checks before every push:** `npm test` (vitest, 259 tests), `npm run lint` (0 errors), `tsc`, `npm run build`, the 8-gram originality check and the banned-term check against the private research, plus a title check (5-gram and near-match) of every heading.
- **Content:** 275 lessons in 29 modules (260 rewritten into steps on 6 Oct, 9 overlapping lessons merged on 13 Oct, 16 new lessons in Module 29, 8 more on 13 Oct for profit setup, marketing spend and gaps), plus the Helix Course (21 goals).
- **Research:** private research from two paid courses, kept off-repo. Nothing in this repo copies its wording, names or titles.



## Today, 15 Oct 2026: everything shipped, social, community and open items

**Shipped to main (all live on ecommercehelix.com)**
- `82d386c` Hero spacing, all prices in USD, FAQ answer on AI (writing only, monthly limits, never trained on user data).
- `37b7138` Five-tab app (Today, Numbers, Learn, Progress, Community; bottom bar on phones; the rest under Settings) plus extras: Monday scorecard email, milestone celebrations, Review my store, template library, wins wall.
- `87c5bf9` Date-driven seasonal calendar (computed dates for holidays that move each year, banner, timed Today tasks per event, Module 30 lessons, tests). `1a4f0f7` terms and privacy for USD, AI, community and reviews.
- `e1a558a` Numbers: the floating "I'm lost" button shrinks to an icon while a day panel is open, so it no longer covers the figures.
- `1be920a` Site-wide content engine (`src/content/site-content.ts`): event banners and hero line, 23 weekly tips, template highlights; new dates EOFY, mid-July deal days, back to school; daily revalidate cron; preview-only date simulator `/preview/season?asOf=`.
- `df24f21` Today in time blocks: Morning check, Main focus, Before you finish; 5 to 7 tasks with time, why, link, done tick; season tag; progress bar. (Replaces the older "1 to 3 tasks" list described further down.)
- `edf1b09` Connect your tools (`/dashboard/connect`): Shopify OAuth + custom app token, Meta, Google Ads, Google Sheets import, TikTok placeholder, CSV/manual; daily table `/dashboard/numbers/table` with CSV export.
- `0a62303` Learn: Attract | Convert | Grow columns of video cards (placeholders) and a "See entire course" timeline with progress, soft locks and "You are here".
- `7368c3c` Font fix: the purple hero event line uses the handwriting font.
- Screenshots: `/workspace/helix-shots/` on the build box (not in the repo).

**Social and community**
- Old v1 Facebook scheduled posts: all 33 deleted.
- Social v2 (`docs/social/v2`: schedule.csv, schedule.md, manifest.csv, contact sheet, statics, animated MP4s, all small enough for the repo; the source pack is also at `/workspace/reports/helix/social-v2` on the build box): post 1 published 15 Oct. 28 posts are scheduled daily at 19:00 Sydney on Instagram and Facebook through 12 Nov, with the time-sensitive Black Friday, Cyber Monday, Christmas and gift posts moved first. The remaining 21 (posts 26-28, 30-32, 37-50; 13 Nov to 2 Dec) get booked automatically once they fall inside Meta's 29-day scheduling limit.
- Private Facebook group **E-commerce Helix Members**: https://www.facebook.com/groups/1313305624157403/ . Page is admin, membership questions set, cover added, 6 starter posts with the Welcome post pinned. `FACEBOOK_GROUP_URL` set in Vercel (Production and Preview). Assets in `docs/social/fb-group` (cover, posts.md, images).
- Social v3 (`docs/social/v3`, 50 new posts, 17 animated): in progress. **Needs Sid's OK before anything is scheduled.**

## Simpler app, USD prices and the seasonal calendar (15 Oct 2026, Sydney)

**For Sid (action needed)**
- Closed Facebook group: created at https://www.facebook.com/groups/1313305624157403/, `FACEBOOK_GROUP_URL` set; paying members see the join button on Community, free users see an upgrade prompt.
- Wins wall: moderators (`WINS_MODERATORS`) see a "Wins waiting for a check" list on Community. Nothing shows until a moderator presses Show it.
- Prices are USD everywhere (site, JSON-LD, terms, Stripe live prices; see "Stripe (LIVE mode) done" above).
- Monday scorecard email: live (`SCORECARD_EMAIL_LIVE=1`; cron `/api/cron/monday-scorecard`, Mondays 8 AM Sydney).

**What changed**
- Homepage hero: more room between the purple underline and the paragraph; the URL box still shows without scrolling at 1280x720 and 1024x600.
- FAQ "Does Helix use AI?" now explains the small, writing-only AI with monthly allowances and no training on user data. Other "no AI" lines (store check copy) reworded. Terms gained "AI features", "Community and the Wins wall" and "Store reviews and emails"; privacy lists wins and review requests and how long they are kept. Legal date 15 Oct 2026.
- **Five places in the app** (sidebar on desktop, bottom bar on phones): **Today** ("Here's what to do today": tasks in time blocks (see `df24f21`), each with Do it for me, Done, and an I'm lost link; plus a weekly plan card and a milestone toast), **Numbers** (`/dashboard/numbers`: daily sales bars for the last 4 or 8 weeks with a Week/Month toggle; tap a day for sales, orders, cost of goods (unit cost x units when not synced), ad spend (Meta, Google), shipping, fees, other costs, profit, margin, ROAS, MER, ad cost per order and break-even ROAS; manual entry and connect prompts), **Learn** (`/dashboard/learn`: every lesson under Attract, Convert or Grow, grouped by module, with done ticks; template library at `/dashboard/learn/templates`), **Progress** (adds achievements: profit milestones, streaks, first ad, first lesson, goals), **Community** (members group button from `FACEBOOK_GROUP_URL`, weekly Wins wall with moderation).
- Everything else (approvals, connections, billing, ads, what to fix, stock, calendar, email flows, trends, weekly report, business admin, plan, help, review my store) is one tap away on **Settings**. All old URLs still work, so no redirects were needed.
- **Review my store** (`/dashboard/review`): request form emailed to support@astryks.com through Resend (max 2 a week per user).
- **Seasonal calendar** (`src/lib/season-calendar.ts`): the home banner and the Today prompt are worked out from the date. Prep copy with a countdown ("It's October, the build month for Black Friday and Cyber Monday. 43 days to go"), "happening now" during the event, then the next event; a calm quiet-time line when nothing is near. US events: Valentine's, Mother's Day, Father's Day, Memorial Day, 4th of July, Labor Day, Halloween, Thanksgiving, Black Friday/Cyber Monday, Christmas, New Year. Worldwide: Ramadan/Eid al-Fitr, Diwali, Lunar New Year, Singles' Day, Boxing Day, Easter. Easter and nth-weekday dates are computed; moon-based dates (Lunar New Year, Ramadan, Eid, Diwali) are in a checked table for 2026 to 2030 (extend `LUNAR` before 2030 ends; a test fails if a year is missing). Overlaps: running events first, then weight (Black Friday highest, from 1 August), then soonest.
- **Seasonal steps on Today** (`src/lib/season-tasks.ts`): about 10 to 7 weeks out plan the offer and order stock (uses the store's profit per order to suggest a safe discount and its daily units for a stock number), 6 to 4 weeks creators (outreach template, gifting, personal codes), 3 weeks discount codes (Shopify click path; Do it for me saves a paused `PromoDraft` and a checklist in Waiting for your OK; Helix never creates or turns on a discount), 2 weeks to 1 day dress the store, warm up and write emails, during the event check numbers daily, up to 7 days after review results. Earlier steps not done show as "Catch up". New **Module 30, Seasonal sales, step by step** (6 lessons) in Helix's own words.
- Tests: 247 (new: tasks, numbers, achievements, scorecard email, calendar boundaries, the day after Cyber Monday, year rollover, moving dates, which task shows in which week). Lint has 0 errors (fixed the old Connections page error).
- **Schema (additive, applied to Neon before the push):** new tables `Win`, `ReviewRequest`, `AchievementSeen`, `PromoDraft` (all cascade on user delete). No column changes.

## Integrations build (13 Oct 2026, about 9:30 PM Sydney)

**Live in code (switched on by env vars; each shows "Coming soon" without them and never errors):**
- **Shopify** (`src/lib/shopify`, `/api/shopify/{install,callback,webhooks}`, cron `/api/cron/shopify-sync` 18:30 UTC). Per-user OAuth, read-only scopes `read_orders,read_products,read_inventory`, expiring offline token + refresh token stored AES-256-GCM encrypted. First sync 60 days, daily 7 days: orders, units, gross sales, discounts, refunds, COGS into Scorecard (so the profit waterfall fills itself), product lines into Profit (`ProductSale.source = shopify`), on-hand stock for tracked SKUs. `app/uninstalled` and the 3 GDPR webhooks with HMAC check. No customer personal data stored. Needs `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` (docs/shopify-setup.md). **Status (13 Oct, ~9:50 PM Sydney):** Shopify app created in the Dev Dashboard (Astryks org, app id 434903482369, version e-commerce-helix-1), unlisted / custom distribution, not on the App Store. `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` set in Vercel Production, so Connections shows "Connect Shopify". Compliance webhooks, `app/uninstalled` and the redirect URL are defined in a `shopify.app.toml` kept outside the repo (`/workspace/shopify-app`); `shopify app deploy` was abandoned (CLI could not log in); instead `app/uninstalled` is registered per shop via Admin GraphQL `webhookSubscriptionCreate` in the OAuth callback and re-ensured by the daily sync (idempotent, non-fatal). **Before any App Store listing** the compliance webhooks (`customers/data_request`, `customers/redact`, `shop/redact`) must be added via the CLI toml (`/workspace/shopify-app/shopify.app.toml`) and deployed. The app is unlisted for now.
- **Google Ads** (`src/lib/google-ads`, `/api/google-ads/{connect,callback}`, cron `/api/cron/google-ads-sync` 19:15 UTC). Per-user OAuth (adwords scope, offline), refresh token encrypted, account picker, daily GAQL 30-day campaign report into Scorecard `adGoogle`/`googleRevenue` (ROAS by channel, MER), snapshot table on Connections. "Build a paused Google Search campaign" goes through Approvals; only on Approve does Helix create a budget + Search campaign with `status: PAUSED` (guarded by `assertPaused`). API v25. Needs `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN` with Basic Access (docs/google-ads-setup.md). **Status (13 Oct):** OAuth client set; API Explorer access under review; developer token pending; OAuth consent-screen verification needs a demo video. Still shows coming soon until the developer token is set.
- **AI layer** (`src/lib/ai`, `src/app/dashboard/ai-actions.ts`, `AiBox`). AI SDK v7 through the Vercel AI Gateway, model `google/gemini-2.5-flash-lite`, 400 max output tokens. Store-check summary (Insights), ad copy drafts (Campaigns → Build), "I'm lost" help (Today and /dashboard/help). Caps per month: Free 3, Starter 50, Growth 150; cached answers do not count. Usage logged in `AiUsage`, cache in `AiCache`. Global kill-switch `AI_MONTHLY_BUDGET_USD` (default 25) and `AI_DISABLED=1`. Falls back to rule-based text on any failure. Auth is Vercel OIDC on deployments; needs AI Gateway credits on the team (docs/ai-setup.md). **Status (13 Oct, ~9:50 PM Sydney):** live. Card added, free credit active; a test call to `google/gemini-2.5-flash-lite` with the project's OIDC token returned a response with no credit error.
- Spend safety: Meta and Google campaigns are only created paused, only after Approve.
- Copy: plans (Shopify and Google marked coming soon, AI allowances), pricing security panel, Connections security panel, terms, privacy (Shopify, Google Ads, Vercel AI Gateway and the model provider added as processors).
- Schema (additive, applied to Neon before push): tables ShopifyConnection, GoogleAdsConnection, GoogleAdsSnapshot, GoogleAdsDraft, AiUsage, AiCache; column ProductSale.source.

**Not done / next:** Shopify order webhooks for near-real-time sync (daily cron only); `read_all_orders` for more than 60 days; Google Ads ad groups, keywords and ads in the paused draft (campaign + budget only); GA4 sessions; Klaviyo.

## Launch-readiness audit (13 Oct 2026, evening Sydney)

**Verified**
- Git clean and in sync with origin/main at start (`c8aebeb`); that production deploy was READY on Vercel.
- `npm test` (207 tests) and `npm run build` pass. `npm run lint` has 4 small pre-existing errors (unescaped quotes on scorecard and settings pages, one prefer-const in diagnosis.ts); they do not block the build.
- Maths reviewed: profit waterfall (sales down through each cost to net profit; layers add up), break-even MER/ROAS/CPA, marketing % of sales bands, dashboard metrics (blended ROAS, MER, contribution, net after fixed share), week/month/YTD/12-month ranges and buckets. New unit tests in `tests/maths-audit.test.ts`.
- Store audit runs on the user's own saved store URL, with private-address and redirect guards. Card deck and next card follow setup, then the current goal's lessons, then the rest.
- Every user-data query is scoped by the signed-in user's id (approvals checked with id and userId). Cron routes return 401 without the secret.
- Live check: public pages, sitemap, robots, llms.txt, share image and calendar feed return 200; signed-in pages redirect to sign-in; no 500s after the fix below.

**Fixed**
- Checkout: a missing Stripe price env var (or missing Stripe keys in production) could grant a paid plan without payment. Now it returns 503 instead.
- Checkout: an empty POST returned 500; now 400.
- Store check: the `back` field could redirect to another site; it now only allows dashboard paths.

## Polish pass (13 Oct 2026, about 9:45 PM Sydney)

- Legal pages and footer name the business as **Astryks** only (no ABN, no personal name). Terms keep governing law (NSW) and consumer-law rights. Commit `07a38fa`.
- The 4 lint errors are fixed. Dashboard return paths may now carry a query string safely (`src/lib/safe-back.ts`, tested). `07a38fa`.
- **Need help?** box in the dashboard sidebar (support@astryks.com, prefilled subject), "Help and support" in the site footer, and step-by-step guides at `/help` and `/dashboard/help` for steps Helix cannot do itself: daily numbers by hand or CSV, Meta spend while Meta is not connected, reconnecting Meta for a missing Page/account/pixel, store check blocked by a password, Google Ads, billing, data download and deletion. `9b90f43`.
- New accounts start with example numbers; every dashboard page now says so with a **Clear examples** button. `9b90f43`.
- Signed-in pass on live (magic-link test account): all 25 dashboard pages, course and start return 200 with no NaN/undefined in visible text; free plan gating shows upgrade notes (year views, course goals, Meta connect); checkout for Starter redirects to Stripe Checkout (live mode, not paid); bad plan returns 400; portal without a subscription goes back to billing. The test accounts (helixtest@, helixtest+fresh1013b@, helixtest+audit1013@mail.grokbot.com) were then deleted from production.

## Open items

- Free users still see a "Profit this year so far" card on Growth while month and year views are Starter; decide whether that is a teaser or should be gated.
- Not tested end to end: server-action flows by click (saving profit setup, finishing a card deck, store check run) and a real live-mode purchase and refund.

## SEO and AI-search pass (13 Oct 2026, about 12:40 PM Sydney)

**Done**
- Root metadata: `metadataBase` is now always `https://ecommercehelix.com` (was the env var, falling back to localhost). Every public page has its own title, meta description, canonical, Open Graph and Twitter tags, and a generated 1200x630 share image (`/opengraph-image`). Sign-in is `noindex`.
- JSON-LD: Organization and WebSite on every page; SoftwareApplication with the real US$0 / US$29 / US$59 offers (priceCurrency USD) and FAQPage on home; SoftwareApplication + FAQPage on each feature page; Article on each guide; BreadcrumbList on features, guides and FAQ; FAQPage on /faq.
- New pages: `/features` plus 6 feature landing pages (profit-dashboard, daily-growth-plan, meta-ads, email-automation, black-friday-plan, store-audit); `/guides` plus 8 long-form guides; `/faq`. All facts are taken from the existing site copy, plans and docs. Each ends with a "Start free" call to action.
- Internal links: header (Features, Guides), footer (all features, FAQ page), home "What Helix does / Free guides" section, related guides and features on every new page.
- `robots.txt` (app/robots.ts): allows Googlebot, Bingbot, Google-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Applebot, Applebot-Extended and `*`; blocks /dashboard, /course, /api/, /signin. `sitemap.xml` (app/sitemap.ts) lists 51 public URLs including all 29 Learn modules. `/llms.txt` summarises the business.
- Checks: build, 170 tests, every sitemap URL has one H1, canonical and og:image, all 142 JSON-LD blocks parse, 87 internal links return 200.

**Positioning (Sid, 13 Oct).** E-commerce Helix is self-serve software that guides owners to grow their store. No consulting, no agency, no calls, no done-for-you service, and no location or ABN anywhere. CTAs are "Start free" and "Get your daily growth plan" (both go to /start, the onboarding behind sign-in). Feature pages use SoftwareApplication JSON-LD (not Service). The guide at `/guides/when-to-hire-an-ecommerce-consultant` is now "Do you need an e-commerce consultant? A self-serve alternative" (same URL, so no redirect). Site keywords target self-serve terms (e-commerce growth app, Shopify growth tool, DIY e-commerce marketing, e-commerce coach app, alternative to hiring an e-commerce agency). `locale en_AU` stays; prices are in USD; no address or areaServed. `/start` is not in the sitemap because signed-out visitors are redirected to sign-in.

**For Sid**
- Google Search Console: verification meta tag is in layout.tsx; submit `https://ecommercehelix.com/sitemap.xml`.
- Bing Webmaster Tools: import from Search Console (covers Copilot and feeds ChatGPT search) and submit the sitemap.
- Optional facts for Organization JSON-LD and /about (nothing invented): support email, founder name and bio, more social profile URLs (`sameAs`; Instagram is already in), real customer results or reviews. Add them in `src/lib/seo.ts` (`organizationLd`).
- Later: more guides on owner questions; an Amazon/marketplace page only if Helix adds that.

## What is new since 6 Oct 2026

**Brand spelling (13 Oct).** The brand is written **E-commerce Helix** everywhere users see it (titles, metadata, header, footer, About, home, guides, sign-in emails, docs). The domain, repo and code names stay `ecommercehelix`. Sign-in emails now use our own template: subject "Sign in to E-commerce Helix", sender name "E-commerce Helix" (address still from `EMAIL_FROM`).

**Logo option B live (13 Oct, ~11 AM).** Sid picked the coral double helix rising up and to the right. It is live on production as the site mark (`public/logo.svg`), favicon, apple touch icon and PWA icons (`icon-192.png`, `icon-512.png`, `manifest.ts`). Commit `0e6a721`, deployment READY. **For Sid:** in Stripe, set the public business name to "E-commerce Helix" and upload this logo and brand colour (Settings, Business, Public details and Branding) so Checkout, the portal and receipts match. Then buy Helix Starter once on the live site, confirm the payment lands, refund and cancel it.

**Stripe billing, test mode live (13 Oct).**
- Checkout is on in Stripe **test mode** (sandbox "E-commerce Helix sandbox"). Products: Helix Starter (`helix_starter_monthly`) and Helix Growth (`helix_growth_monthly`). The first prices were local-currency ones; live prices are now US$29 and US$59.
- Webhook: `https://ecommercehelix.com/api/stripe/webhook` for checkout.session.completed, customer.subscription.created, updated and deleted, invoice.payment_failed and invoice.paid. Plan and status update in the `Subscription` table.
- Customer portal (`/api/billing/portal`, "Manage billing" on the billing page): change plan, card, invoices, cancel at period end. Paying users who pick another plan go to the portal, so a sub is never orphaned.
- Cancel: the plan drops to Free and only plan and status change, so the Meta connection and prep plans stay (Sid's decision). Failed payment: status becomes past_due, a notice asks for a new card, the plan stays while Stripe retries and drops to Free if the subscription ends or becomes unpaid.
- Env vars (Production and Preview): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_STARTER, STRIPE_PRICE_GROWTH. No publishable key is needed (server-side Checkout redirect). No schema change.
- **To go live:** activate the Stripe account (business details, bank account), switch the dashboard to live mode, create the same two products and prices (same lookup keys) and a live webhook to the same URL with the same events, set up the live customer portal, then swap the four env vars for the live values and redeploy.

**The name, simpler Meta ads, honest Google (13 Oct, late morning).**
- About now tells the story behind the name: the double helix of DNA, how cells copy it to grow, and how a business grows by copying what works every day, with you as the owner and Helix as your tool. A short version sits on the home page.
- Meta lessons rewritten to one action per step with exact Ads Manager click paths and what to do if the screen looks different: 7.1, 7.2, 7.4, 7.6, 7.7, 7.10 and 20.3. New 7.13 "Launch your first Meta ad in 30 minutes" (setup check, budget from the marketing guide, 3 to 5 ads, Advantage+ Sales, or Do it for me as a paused draft you switch on) and 7.14 "Find your way around Ads Manager" with an annotated drawing. Both open the first traffic goals of the course.
- Google: guidance only, no Google Ads connection yet. Lesson 20.4 rewritten as an 11-step brand Search and Performance Max setup with click paths; 8.1 split into single actions. The Growth plan now says "Google Ads guided setup ... (Google connection coming soon)" instead of "Meta and Google together".
- **Downgrades (Sid decided):** a user who moves to Free keeps an existing Meta connection and any prep plans already added. Only new Meta connections and new prep plans need a paid plan.

**Profit first, marketing guide, free and paid (13 Oct, later).**
- **New course order.** Goal 1 on every track is now **Set up your profit dashboard**, then **Fill in your numbers 7 days in a row**, then **Learn the numbers that run your store** (break-even, target MER, marketing spend, monthly goals), then Attract, Convert, Grow and Run. Old progress on the former first goal carries over.
- **Profit setup** (`/dashboard/profit`, sidebar): enter selling price, product cost, freight and duty, packaging, shipping to the customer, payment fees, marketing per order, Shopify and app subscriptions, other monthly costs and orders a month. A live waterfall shows where each sale goes down to net profit, plus landed cost, gross margin, profit before marketing, break-even cost per purchase, break-even MER and ROAS, and a month's profit. Saving can also set fixed costs for the daily numbers. New additive `ProfitSetup` table (applied to production first).
- **New lessons:** 1.7 Sales, costs and profit in plain English (with a waterfall drawing and a worked $60 example), 1.8 Set up your profit dashboard, 1.9 How much to spend on marketing. Growth, Key metrics, Dashboard and Profit setup link to 1.7.
- **Marketing as a % of sales** (guide, not rule) on Profit setup, Growth and Key metrics: your share against the band for your size and your own break-even line. Under about $5k a month: no % target, a small fixed test budget judged by cost per purchase. Growing: about 10% to 30%. Scaling: about 15% to 25%, more while contribution stays positive. Break-even MER = profit before marketing / sales; break-even ROAS = 1 / break-even MER.
- **Free and paid, enforced in code.** Free: profit dashboard, daily numbers, key metrics, Growth by day and week, Dashboard week and month, the numbers goals of the course, every lesson, top 3 fixes from the monthly audit. Starter: Attract and Convert goals, Do it for me, Meta connect (gated in the connect route), seasonal prep plans (gated in the server action), all fixes, month, year and 12-month history. Growth: Grow and Run goals. Course ticks and confirms check the plan on the server. Friendly upgrade notes appear at the moment of value (next course goal, month view, more fixes, Connect Meta, prep plan). Checkout is live: Stripe live mode is set up in production (Helix Starter US$29/month and Helix Growth US$59/month, live webhook, customer portal). Preview deployments still use Stripe test mode.
- **Gaps closed:** 3.10 Subscribe and save, 9.16 When conversion suddenly drops, 13.12 A smaller sale between the big ones, 23.7 Customer service that keeps customers, 28.9 Selling to shops, each added to a course goal. A private coverage map was made against the private research (kept off-repo).
- **Fixes:** old links to renamed or merged lessons now jump to the exact lesson, even across modules; Black Friday steps that have already passed show as one catch-up line instead of many overdue tasks; course time estimates are capped (no task over 20 minutes, no day over an hour).

**The Helix Course (13 Oct).** A guided program on top of the lessons. One goal at a time, in plain words with a measurable finish line, on the profit-first ladder: your numbers, then Attract, Convert, Grow, then run the business. Three tracks: Just starting (under $10k a month), Growing ($10k to $30k) and Scaling ($30k to $80k+). 20 goals, 16 per track. Each goal runs over 5 to 11 days; a day has 1 task on light days and up to 5 on busy ones. Every task is one action with the expected result, a time estimate, a link to the lesson step, Do it for me and a short inline checklist. Ticking a day unlocks the next; hitting the finish line (checked from real daily numbers where possible, otherwise confirmed by the owner) unlocks the next goal with a small celebration. Sale prep (Black Friday from 1 August, Christmas, EOFY and more) and tax dates (BAS, EOFY, US dates) slot into the day when due within a week. Today now leads with Your goal (progress bar), Today's tasks and Why this matters. `/course` shows the whole path (done, current, locked, with day counts) and `/course/goal/<id>` shows each goal's days. Progress: new `CourseState` table plus the existing task and lesson-step tables, so ticks are shared with the lessons. Design: `docs/playbook/course.md`. Code: `src/lib/course-plan.ts`, `src/lib/course.ts`, `src/app/course`, `src/components/course`. Tests: `tests/course.test.ts`.

**Content audit and new lessons (13 Oct).** Every Helix title and heading was checked against the private research titles and branded phrases. 26 lesson and module titles were renamed to plain, original wording that says what you do (for example "Say clearly what the customer gets", "Your yearly sales calendar", "A 10-minute weekly stock check"). 9 overlapping lessons were merged into one each (for example community, content pillars, hiring, agencies, resilience, speed, tracking and policies); old step ticks, links and page anchors still work through `src/lib/lesson-aliases.json`. New Module 29, "Customers, partners and the weekly rhythm": 16 lessons (5 Attract, 3 Convert, 8 Grow) on customer words, the worry behind the purchase, repurposing content, referrals, partner brands, guest spots, a weekly story email, buying-question emails, leading numbers, a 30-minute weekly numbers meeting, playbooks, owners, a 90-day plan, a quarterly reset, a one-page direction and a wins file.

**Growth dashboard and key metrics (13 Oct).** `/dashboard/growth`: revenue, costs and net profit by Day, Week, Month and Year, change against the previous period in % and $, profit year to date, margin against benchmark bands, a profit trend line and a plain line such as "Profit is up 57% on last week ($396 more)". `/dashboard/metrics`: a 14-card grid with a good number for each, and a clear label on every card: You fill this in (with exactly where to find the number), Helix fills this automatically, or Automatic once you connect Meta (with a Connect button). The daily form is simpler: grouped fields (Shopify, ads, costs, more), examples and where to find each number, blank costs estimated from recent days, and calculated values shown read-only. New optional add-to-cart field (`ScorecardDay.addToCarts`).

**6 Oct (launch day):** production went live; lessons in steps (all 260, Do it for me, Guide me, glossary tooltips); sharper messages and the goals ladder; Black Friday all year; Attract, Convert, Grow tagging; Run your business modules 23 to 28; GST/VAT setting; Suppliers and stock; restyle; Shopify store setup module and the 28-day Just starting track; isolated demo login; visual Dashboard; calendar by country with .ics; Meta integration; the first web app, curriculum, audit engine, email automation and product docs.

**Accounts and Your progress (13 Oct).** Owners create an account with an emailed sign-in link (Auth.js plus Resend; Google sign-in optional); the account row is created on first sign-in. Settings now has **Download my data** (`/api/account/export`, one JSON file, no tokens) and **Delete my account** (type DELETE; every table cascades). New **Your progress** page (`/dashboard/progress`): goals finished with dates, tasks done, current and best streak, profit trend (by month since joining), a monthly recap and a day-by-day timeline of tasks, lesson steps and goals. Free shows the last 30 days, paid plans the full history. Built from existing task, lesson-step and daily-number tables plus one tiny additive `ProgressEvent` table (goal finished, profit set up), indexed on user and time and applied to the database first. No new services, no cron. Code: `src/lib/history.ts`, `src/app/dashboard/progress`, tests in `tests/history.test.ts`.

**Running costs (estimate, Oct 2026 list prices).** 100 users: about $0 to $20 a month (Neon free, Vercel Pro $20 if on Pro, Resend free, AI under $5). 1,000 users: about $45 to $90 (Neon Launch about $19 to $30, Vercel Pro $20, Resend Pro $20 once sign-in links pass 3,000 a month, AI about $10 to $30 if insights are cached daily). 10,000 users: about $250 to $600 (Neon Scale or higher compute about $70 to $200, Vercel Pro plus usage $20 to $150, Resend about $35 to $90 for 50k to 100k emails, AI $100 to $300). Risks: Neon free tier caps storage at 0.5 GB and compute hours; Resend free is 3,000 emails a month and 100 a day, so sign-in links alone can hit it; Vercel Hobby is not for commercial use. History adds roughly 100 bytes per event, so 10,000 users is a few MB a year.

## Commits since 6 Oct 2026

| Commit | Date | What |
|---|---|---|
| (this commit) | 13 Oct | STATUS: logo B live, Stripe confirm next, honest Growth Google wording |
| 0e6a721 | 13 Oct | Logo option B: coral double helix mark, lockup, favicon, apple icon, PWA icons |
| 9ac2bd1 | 13 Oct | STATUS: Stripe checkout is live in production |
| e9903cd | 13 Oct | Brand spelling E-commerce Helix everywhere, branded sign-in email |
| 8854b87 | 13 Oct | Profit setup and new goal order, marketing % guide, free and paid gating, gap lessons, anchor redirects, Black Friday catch-up, shorter days, STATUS |
| a1e4f7b | 13 Oct | STATUS rewrite; /course sign-in redirect returns to /course |
| 39d8e78 | 13 Oct | The Helix Course |
| 6ecebdc | 13 Oct | Content audit, 9 merged lessons, 26 renamed titles, Module 29 |
| 14ee485 | 13 Oct | Growth dashboard, key metrics panel, simpler daily form |
| a2d3ad0 | 6 Oct | Lessons in steps (all 260) |
| 06d2ca0 | 6 Oct | Sharper messages and the nine objectives |
| 1a19b8c | 6 Oct | Black Friday all year, who Helix is for, goals ladder |
| 42f9a9c | 6 Oct | Attract, Convert, Grow tagging |
| eabe529 | 6 Oct | Run your business modules 23 to 28 |
| ce022fc | 6 Oct | GST/VAT setting |
| 7fb2c68 | 6 Oct | Suppliers and stock |
| 337b503 | 6 Oct | Restyle |
| 2243d3a | 6 Oct | Shopify store setup module 22, 28-day Just starting track |
| bc0bbff | 6 Oct | Isolated demo login |
| 95cb468 | 6 Oct | Visual Dashboard |
| 28fd4f0 | 6 Oct | Calendar by country, .ics, two tracks |
| 166bc0f | 6 Oct | Plain step-by-step lessons, seasonal alerts |
| 930d8be | 6 Oct | Plain words, profit-first Today, guides |
| 5640890 | 6 Oct | Meta integration |
| d65bcf4 | 6 Oct | Web app, curriculum, audit engine, email automation |
| 9308bfd | 6 Oct | Product docs and 18 SOPs |

## Live features

**The framework: Attract, Convert, Grow.** All learning content sits in three stages. **Attract** gets the right buyers in (ads, content, social, SEO, creatives, audiences). **Convert** turns visits into sales (site, offer, CRO, checkout, email flows, pricing, promotions). **Grow** keeps more of every sale, then scales (profit numbers, scaling budgets, retention and LTV, stock and suppliers, international, team, AI and tools, Run your business). Stages live in `src/lib/stage-map.json` (module default plus lesson overrides) and `src/lib/stages.ts`. Shown as a visual trio on the home page, Learn and About, a chip on every lesson, the stage of the current lesson on Today and a label on each roadmap day. Tested in `tests/stages.test.ts`.

**Who it is for (updated 15 Oct 2026).** Headline (`WHO_HEADLINE` in `src/lib/audience.ts`, on the home page `#who`, About, onboarding and `/learn/goals`): **"Built for stores doing $10k to $30k a month, we help you reach $1M profitably."** Three bands, the same everywhere (site copy, stage cards, course tracks, `benchmarks.ts` `sizeFor`, About): **Just starting** (under $10k a month), **Growing** ($10k to $30k a month, best fit), **Scaling** ($30k to $80k+ a month, on the way to a $1M year and beyond). Milestones: first sale, first $10k month, first $1M year, first $10M year.

**Goals ladder (new, 6 Oct 2026).** Nine numbers in funnel order, each with a stage and a benchmark that matches the Dashboard explanations: site visits (Attract), CTR (Attract, 1%+ solid, 1.2%+ strong), add-to-cart rate (Convert, about 7.5%+), conversion rate (Convert, 2%+ solid), AOV (Convert), ROAS and MER (Grow, MER 20 to 35%), CPA (Grow, below break-even), contribution margin (Grow, 15%+), and **net profit** (Grow, the goal). Headline everywhere (`GOALS_HEADLINE` in `src/lib/goals.ts`): **"The goal is profit, not just revenue."** On the home page `#goals`, About (ordered list), onboarding (the goals fieldset shows the nine in order) and `/learn/goals`. Where it shows:
- Home page short section (`#goals`).
- Full guide at `/learn/goals` (public), linked from Learn, the Dashboard and onboarding.
- Onboarding (`/start`) asks for optional monthly targets; blank fields use the track's suggestions. Saving also sets the MER target and the monthly sales target to what the goals add up to.
- `/dashboard/goals` (new sidebar item "Monthly goals"): targets against the last 30 days with on track / close / off track, what the goals add up to (orders, sales, ad spend, contribution, net profit) and a form to change them.
- Today (compact ladder under the Dashboard card) and the Dashboard (`/dashboard/analytics#goals`).
- Actuals: visits, conversion, AOV, MER, CPA, contribution and net profit come from the daily numbers; CTR from Meta when connected; add-to-cart rate waits for the Shopify connection.
- Storage: new Prisma model `MonthlyGoals` (one row per user; MER stays in `ScorecardSettings`). Logic in `src/lib/goals.ts` (tested in `tests/goals.test.ts`).

**Black Friday and Cyber Monday all year (new, 6 Oct 2026).** BFCM is treated as the most important window of the year for many stores. The plan starts on **1 August** (was 12 weeks out, so it used to start in early September and read as an October-only plan). The prep plan has 18 dated steps in five stages:
- **August:** look back at last year and set targets (1 Aug), start testing ad angles and creatives, start building the email and SMS list, test offer ideas.
- **September:** order stock 10 to 12 weeks out, lock the offer, scale the winning tests (and book creators).
- **October:** finalise sale creatives, warm up audiences, build email and SMS flows, load stock and get ready to ship, build sale campaigns switched off.
- **November:** freeze the site and test codes, hype, launch, check results daily and scale winners through Cyber Monday.
- **December and January:** review the sale, write next year's test plan (the plan stays open about 50 days after Black Friday for these, listed after any upcoming date).
Where it shows: a "Critical" Black Friday card on Today from 1 August with the month-by-month timeline (it stays on Today even when another date such as Father's Day is closer), the one-click "Add the prep plan", every step on the Calendar on its own date ("Black Friday prep" entries, also in the .ics feed), a "Black Friday is won months before November" callout with the timeline at the top of the Calendar, a full section on the home page (`#bfcm`) and a rewritten About section. From February to July, Today shows a light "Test now for Black Friday" nudge with a different idea each month and a countdown to 1 August. Headlines change by month (August test, September commit, October build, November launch, live, review). Lesson 13.10 and day 52 now describe the staged plan. Logic in `src/lib/seasons.ts` (`BFCM_CRITICAL`, `BFCM_STAGES`, `bfcmTip`, `bfcmPlanEntries`), tested in `tests/seasons.test.ts` and `tests/calendar.test.ts`.

**Home page messages (new, 6 Oct 2026).** Besides the hero, framework, "Profit, profit, profit." and goals sections, the home page now says:
- **Nervous about ads?** Owners are scared to advertise, put in a little money, see nothing and give up. Helix shows how Meta and Google ads actually work (why small tests fail, a break-even limit on every dollar, learn by doing with paused drafts).
- **You do not need an expensive agency to grow.** Agencies charge high retainers and often do not deliver, and transparency is rarely in their interest. Helix keeps you in control, growing a little every day with compounding working for you. A side-by-side "typical agency vs with Helix" table. The same message is merged into About's "Why you should stay in control" (no duplicate section).
- **Black Friday all year** (above) and a new FAQ, "Who is Helix for?".

**Other features (all live):**
- **Today:** Your goal, Today's tasks and Why this matters from the Helix Course, profit-yesterday box with a one-minute update form, the day's lesson and action for your track (Just starting 28 days, Growing 64 days), up to two insights, seasonal alerts and prep plans, upcoming key dates, stock and admin reminders, goals ladder, streak and compound score, roadmap.
- **Dashboard** (`/dashboard/analytics`): week, month, year-to-date and last-12-months views compared with the previous period; revenue vs costs vs profit, profit trend, cost donut, ROAS and MER with the break-even line, channels, new vs returning; 16+ metric cards with plain-words explanations; ratings against the user's own break-even lines (`src/lib/analytics.ts`, `src/lib/metric-info.ts`, tested). Demo mode seeds two years of labelled example days.
- **Calendar** (`/dashboard/calendar`): every key date for 12 months for AU and US, countdowns, prep-plan status, business admin dates and Black Friday prep steps; `.ics` download and Google/webcal subscribe (`/api/calendar`).
- **Seasonal alerts and nudges:** Black Friday, Christmas cut-offs, Boxing Day and New Year, Valentine's Day, Mother's Day, EOFY, Father's Day (AU and US). Weekly report "Coming up" section. `/api/cron/seasonal-nudges` (Mondays 08:00 Sydney) builds a nudge per user; email sends only with `NUDGES_LIVE=1`; push is a stub.
- **Suppliers & stock** (`/dashboard/stock`): suppliers, landed cost, reorder points, stock-out countdowns, Black Friday last safe order dates, reorder alerts on Today.
- **Run your business** (`/dashboard/business`): modules 23 to 28 with AU and US versions, 13 topics, verified thresholds, dated admin reminders (BAS, tax returns, EOFY, 1099-NEC, estimated tax, security checks). General information, not advice.
- **GST/VAT setting:** "My prices include GST/VAT" strips tax from sales before any profit maths (`src/lib/tax.ts`).
- **Learn:** 29-module Helix Playbook (275 lessons) in plain words, each lesson tagged with a stage, "In plain words" boxes, a 106-term glossary (`/learn/words`), 16 drawings that show where to click, and the goals ladder guide.
- **Meta integration (real):** Facebook Login for Business connect, encrypted long-lived token, asset picker, daily sync plus Sync now, insights into the campaign tracker and audit rules, paused-only drafts after approval, audit log, disconnect. Mock mode without a Meta app. Setup: `docs/meta-setup.md`.
- **Other screens:** What to fix (insights), Waiting for your OK (approvals), Your numbers (scorecard and CSV import), Your ads, campaign builder, Email automation, Ad Trends, Weekly report, Connections, Settings (track, country, GST/VAT), Plan & billing (Stripe Checkout, portal and webhook live).

- **Profit setup** (`/dashboard/profit`), **Your course** (`/course`), **Growth** (`/dashboard/growth`) and **Key metrics** (`/dashboard/metrics`) are in the sidebar.

## Integrations

| Integration | State | What is needed |
|---|---|---|
| Resend email sign-in | Live | Nothing |
| Meta (Facebook and Instagram ads) | Built: connect, encrypted tokens, daily sync, paused drafts, audit log. Runs in mock mode | Sid creates the Meta developer app, completes Business Verification and App Review (`docs/meta-setup.md`), then adds `META_APP_ID` and `META_APP_SECRET` |
| Stripe billing | Live in production (Checkout, webhook, portal; Starter US$29, Growth US$59) | Sid: one real Starter purchase then refund/cancel; set public business name, support email and logo in Stripe |
| Google sign-in | Built, optional | `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` |
| Shopify | Stock sync stubbed; sales, sessions and add-to-cart are typed in | Shopify app and API access to sync automatically |
| Google Ads | Guidance only: lessons 8.1 to 8.11 and 20.4; example rows in Your ads | Developer token, OAuth client with the adwords scope and verification, manager account |
| TikTok, Klaviyo | Example data only | API access later |

## Next steps and blockers (in priority order)

_Updated 13 Oct 2026, 10:10 PM Sydney. Pick up here next session._

(Sid's actions are in "Needs Sid" at the top; Meta "Save choice", the Facebook group and the GitHub Support request live there.)

1. **Google Ads (check in a few days).** Built and deployed; shows "coming soon" until the developer token is set.
   - Check Explorer/Basic access status at https://console.cloud.google.com/google/ads-apis/overview?project=astryks (applied 13 Oct, under review). Manager account "E-commerce Helix" 965-774-7394.
   - When approved: copy the developer token into Vercel Production as `GOOGLE_ADS_DEVELOPER_TOKEN` (stdin, never printed), redeploy, test connect with Sid's account.
   - Demo video script is ready: `docs/google-ads-demo-script.md` (15 Oct). Record the demo video (consent flow, Helix web client, how Ads data is used), upload unlisted to YouTube, add on https://console.cloud.google.com/auth/scopes?project=astryks, then submit verification at https://console.cloud.google.com/auth/verification/submit?project=astryks. Scope justification already saved. Consent app name is "Astryks" (shared project `astryks`); branding verified and published.
   - `GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET` are set; client JSON is in /home/box/.secrets/ on the box.
2. **Shopify** is live (unlisted Dev Dashboard app 434903482369, org Astryks, version e-commerce-helix-1, `SHOPIFY_API_KEY`/`SECRET` set). APP_UNINSTALLED is registered per shop by code (`7e64baf`). Before any App Store listing: add compliance webhooks via `/workspace/shopify-app/shopify.app.toml` (needs a Shopify CLI login as support@astryks.com), turn on expiring offline tokens, add the privacy URL, and move protected customer data from Draft to submitted. Test a real store connect end to end.
   - **Partly done (15 Oct):** compliance webhooks (customers/data_request, customers/redact, shop/redact) are handled with HMAC check (401 on bad HMAC, 200 otherwise) at `/api/shopify/webhooks`; shop/redact deletes the connection, Shopify product lines and Shopify scorecard days; Helix stores no customer PII so the customer topics are logged only. Expiring offline tokens: requested with `expiring=1`, refreshed 5 minutes before expiry, rotated refresh token stored encrypted; a missing, expired or rejected refresh token now marks the connection `expired` (reconnect prompt). Privacy page `/privacy` covers Shopify. The local toml already lists the compliance subscriptions (backup at `shopify.app.toml.bak`). Still needs Sid: `shopify app deploy` (CLI login as support@astryks.com) to push the toml, turn on expiring offline tokens for the app in the Dev Dashboard, set privacy policy URL https://ecommercehelix.com/privacy in the listing, submit protected customer data, test a real store.
3. **AI** is live (Vercel AI Gateway free US$5 a month credit, `google/gemini-2.5-flash-lite`, per-plan caps, `AI_MONTHLY_BUDGET_USD`, `AI_DISABLED` kill switch). Watch usage on the Vercel AI Gateway page.
4. **Not yet clicked through live:** saving the profit setup, finishing a card deck, running a store check, a live payment and refund.
5. **Later (Google Sheets daily refresh done 15 Oct: linked sheet saved in ToolInput kind `sheet`, re-imported by `/api/cron/sheets-sync` at 18:45 UTC, unlink on Connect page; rest still open):** Shopify order webhooks (near real time), `read_all_orders` for more than 60 days, Google draft ad groups, keywords and ads, GA4, TikTok, Klaviyo; course polish (weekly recap email, goal picking, finish-line history).
6. Vercel connector lacks access to the astryks team; reconnect it with that team selected (the CLI works meanwhile).

## Decisions made

- Name: **E-commerce Helix** (ecommercehelix.com). Tagline: "Grow your e-commerce business a little every day".
- Positioning: a growth copilot that behaves like a head of growth by your side. Every day: one lesson, one topic, one action, plus up to two insights. Ask before acting.
- Execution model (Sid, 6 Oct 2026): **Draft & you launch** by default. Helix pushes campaigns into the user's own Meta/Google account as paused drafts; the user presses Launch. Budget edits on live campaigns are always made by the user. **Guide me** mode for users without connected accounts. See docs/execution-model.md.
- Proactive audits (site, ads, email, social) with cross-diagnosis rules feed Today and Insights. See docs/audit-engine.md.
- Email automation: Helix suggests missing flows, drafts them and sets them up after approval. See docs/email-automation.md.
- Pricing (updated 13 Oct): Free $0 (profit dashboard, daily numbers, key metrics, basic growth chart, the numbers goals of the course, every lesson, top 3 audit fixes, hard AI cost cap), Starter $29 (Attract and Convert goals, Do it for me, Meta sync and paused drafts, seasonal prep plans, all fixes and AI help, full dashboard history, about $3 AI included at cost), Growth $59 (Grow and Run goals, team and playbooks, Meta plus Google Ads guided setup with connection coming soon, email flows set up after approval, weekly report, about $8 AI included at cost). Extra AI via prepaid wallet at 2x provider cost, stops at $0. Ad spend stays on the customer's own accounts.
- Stack: Next.js on Vercel, Postgres, Prisma, Auth.js, Stripe, Vercel AI SDK with hosted models, SOPs as RAG. PWA push approvals in month 2. Native app later. No GPUs or fine-tuning in v1.
- Model routing: rules first (no LLM), Flash-Lite for extraction, Haiku 4.5 for daily writing and chat, Sonnet 5.5 for weekly reports and diagnosis.
- All playbooks are original Helix SOPs. Private research material stays outside this repo (`research/` and `transcripts/` are gitignored).

## Open questions for Sid

1. ~~Which ad platform first?~~ Decided: Meta first (6 Oct 2026). Next: create the Meta app and run docs/meta-setup.md.
2. Shopify-only at launch, or also WooCommerce?
3. Wallet minimum top-up: $10 (recommended) or $5? Should unused credit ever expire?
4. Free-tier abuse controls: is email verification plus one free store per domain enough, or do we require a card for audits beyond the first?
5. ~~Launch market and currency?~~ Decided: prices in USD for everyone (15 Oct 2026). GST notes stay only for Australian sellers.
7. Brand voice: friendly coach, or crisp operator? Any words to avoid?
8. Legal: terms of service and liability wording for approved bot actions on ad accounts and stores; who reviews?
9. Meta and Google developer app approvals: who owns the business verification and app review submissions?
10. Who reviews the weekly Trends feed before publishing in v1?
11. Auth preference: magic link plus Google (current) or add password login?
12. Pausing losing ads: may Helix pause after a per-action approval (it only reduces spend), and should we offer an opt-in auto-pause rule? Currently: pause with approval, no auto-pause.
13. Plan gating of the daily programme: Free Days 1 to 17, Starter to Day 52, Growth all 64. The Just starting track (21 days) is free in full, with Do it for me still gated. Happy with that split?
14. Social profile audit: public-data checks only at launch, or request Instagram/TikTok/Facebook account access for insights?
15. ~~Vercel project and Postgres provider?~~ Decided: Vercel and Neon (6 Oct 2026). ~~Stripe price IDs~~ Live checkout is on; Sid still confirms one real Starter payment (see Waiting on Sid).
16. Calendar: which other countries next (UK, NZ, Canada)? Should Helix fetch official Click Frenzy dates each year instead of the approximate rule?
17. ~~Who Helix is for?~~ Decided (15 Oct 2026): "Built for stores doing $10k to $30k a month, we help you reach $1M profitably". Bands: Just starting under $10k, Growing $10k to $30k, Scaling $30k to $80k+ a month.
18. ~~Goals ladder starting goals?~~ Updated 15 Oct 2026 from the benchmark review (see "Cleanup" under Done today).
19. Black Friday: should the August to January plan also run for Click Frenzy and Singles Day stores, or stay focused on BFCM? Should the Monday nudge email go out every week from August, or fortnightly until October?


## Onboarding redesign (Oct 2026)
Shipped in stages, each its own commit: 1 honest plan copy, 2 all countries, 3 real per-site store check (no AI, quotes the store, monthly re-check cron for paid users, SSRF guard, timeouts, size cap), 4 ten diagnostic questions to bottleneck and starting goal, 5 personal 12-week plan with "Step 1 today", 6 simpler Today and 7-item sidebar with progressive unlock, 7 upgrade prompts only at moments of need, 8 lesson audit (one action per step, plain words, exact clicks, expected results; scripts/lint_lessons.py), 9 downloadable metrics tracker (public/downloads, built by scripts/build_tracker.py) plus Lesson 1.10, 10 calm dashboards (one headline, three numbers, detail behind "Show more detail").
Open: store check not yet seen running from Vercel for a real paid user; "Do it for me" only real for Meta drafts.
Lesson step audit follow-up (Oct 13): rewrote the last 40 flagged steps into goal + single-action sub-steps; scripts/lint_lessons.py now reports 0 of 1190 steps flagged. Step numbers unchanged.

## Whiteboard restyle (Oct 13)
Whole site restyled to Sid's hand-drawn whiteboard reference. Tokens in src/app/globals.css (old slate/cyan/violet/indigo/sky palettes remapped, so every page follows): paper #F2F1EC, ink #1A1718, purple marker #6258DF (sampled), purple text-on-paper #4B42C9, rules #DEDCD4; green/red kept only for profit and loss. Fonts via next/font: Caveat Brush (headings, big numbers), Kalam (handwritten accents, eyebrows), Nunito (body and lesson steps, 17px). Hand-drawn SVG underline on key heading words (.grad-text / .scribble), slightly irregular card and button corners. New sketchy logo (purple strand + ink strand rising right) generated by scripts/build_logo.py into Logo.tsx paths, icon.svg, favicon.ico, apple-icon, 192/512 icons, public/logo.svg; manifest theme #6258DF. Sign-in email and OG image restyled; lesson guide drawings recoloured.
Tweaks (Oct 13, later): headings now Shantell Sans 700 (more original, still very legible; Kalam kept for accents, Nunito for body). Purple darkened slightly to #5A50D6 (5.2:1 on paper), link shade #453CBF (7.0:1), logo assets regenerated. Highlight underlines are now a straight, round-capped stroke.
Underlines (Oct 13, later): highlight underline is now a filled, tapered signature-style stroke rising about 3 degrees, thin start, full middle, flicked end with a small overshoot; scales with word width and repeats per line when a highlight wraps.
Underline (Oct 13, later): now a bold marker stroke, about 14% of the font size at its fullest, solid #5A50D6, sitting below descenders; headings with a highlight get extra line height. Highlights added to the About, Playbook and module page headings.
Reference match (Oct 13, later): fonts and underline matched to Sid's "explained with a vampire." reference. Big headings and numbers: Permanent Marker (closest to the reference's marker capitals). Subheadings (h2 to h4), eyebrow labels, intro lines (.lead), summaries and form labels: Kalam Bold (closest match to the reference handwriting). Long body and lesson steps stay Nunito. Underline is now a near-even marker swipe about 10% of the font size, almost flat, soft rounded ends, overshooting both ends, a small gap below the descenders.
Type split (Oct 13, later): Permanent Marker capitals only for h1, big section h2s (text-3xl and up) and big numbers; card and section titles, h3 and smaller, and the logo wordmark are Kalam Bold mixed case ("E-commerce Helix", Helix in purple) in header, footer, sidebar, sign-in, email and the share image (Kalam loaded from Google Fonts with fallback).

## 13 Oct 2026: revenue line and accuracy audit
- Revenue line was changed to $10k to $80k here (a9de7c6); since replaced by $10k to $30k (15 Oct).
- Accuracy audit fixed arithmetic, contradictions, platform facts (Google seasonality path, TikTok Shop website checkout), false Helix claims (AI, social audit, weekly report, Monday email), and softened benchmarks to "a common guide".
- Open: Meta app keys are missing in production, so "Meta connects today" is not true yet. NUDGES_LIVE is off.

## 13 Oct 2026: handwriting only for purple text
- Permanent Marker and Kalam are now used only for purple text (big purple headings and numbers, purple accents, the "Helix" in the logo). All ink text (card titles, subheadings, questions, buttons, labels, nav, "E-commerce" in the logo) is Nunito, normal or semibold.
- (Bands from this day are superseded; see "Who it is for".)

## 13 Oct 2026: real Meta integration on in production
- Production env: META_APP_ID, META_APP_SECRET, META_CONFIG_ID (Sensitive), META_PUBLIC=0. Existing APP_URL, TOKEN_ENCRYPTION_KEY, CRON_SECRET kept. No META_MOCK.
- Instagram is optional (no instagram_basic): Pages are listed without the Instagram field if Meta refuses it.
- Copy: Meta connection is open to early testers now and opens to all stores after Meta's approval. Integrations page says so while META_PUBLIC is not 1.
- Next: Sid connects his own ad account; publish privacy, terms and data deletion pages; Business Verification and App Review; then set META_PUBLIC=1 and switch the app to Live.

## 13 Oct 2026: legal pages
- /privacy, /terms, /data-deletion (see docs/legal-pages.md). Contact email is support@astryks.com.
- Meta data deletion callback: POST /api/meta/data-deletion (verifies signed_request with META_APP_SECRET, deletes that Facebook user's Meta data, returns url and confirmation_code).
- Deleting an account now also revokes Meta access and cancels any Stripe subscription (best effort).
- Links: site footer, sign-in, billing, dashboard sidebar, onboarding.

## 13 Oct 2026: legal contact email
- Legal pages now use support@astryks.com (mailto link). No placeholders left.

## Launch readiness (13 Oct 2026)

Checked about 5:05 PM Sydney against production deploy dpl_GicRmVUwEaJzEQSK9akXJAsLhMzo (commit 265448f, Ready). Commit 4c32c05 (legal email) landed during the check and deploys on its own.

| Item | Status | Notes |
| --- | --- | --- |
| Git and deploy | Works | origin/main matched the live commit; clean tree apart from the legal-email worker's change, which was then pushed |
| Public pages | Works | home, about, learn, a lesson (/learn/words), privacy, terms, data-deletion, signin: 200. /course and /start: 307 to sign-in (expected). No errors in recent runtime logs |
| Sign-in email | Works | 13 Oct 5:19 PM: link sent to helixtest@mail.grokbot.com (bot test inbox), arrived within a minute from login@ecommercehelix.com, link signed in (session OK) |
| Stripe account | Works | charges and payouts enabled, name "E-commerce Helix", descriptor "E-COMMERCE HELIX", nothing currently due |
| Stripe prices | Works | First prices (local currency), active then; replaced by the live US$29 / US$59 prices on 15 Oct |
| Stripe webhook | Works | /api/stripe/webhook enabled with 6 subscription and invoice events; no pending deliveries. No real payment events yet |
| Checkout Session (live key) | Works | Live Starter session created and expired straight away |
| Billing portal | Works | Key has the permission (a missing-customer error, not a permission error). Portal config exists |
| Real purchase and refund | Needs Sid | |
| Meta env and connect route | Works | META_APP_ID, META_APP_SECRET, META_CONFIG_ID, META_PUBLIC set. /api/meta/connect redirects signed-out users to sign-in. The data-deletion callback rejects an empty POST with 400 |
| Meta connect with a real account | Needs Sid | Plus app review and business verification |
| Crons | Works | meta-sync daily, site-audit (store re-check) daily and seasonal-nudges weekly in vercel.json. CRON_SECRET set; unauthenticated cron call returns 401 |
| Store check | Works | 13 Oct 5:21 PM: signed in as the test user, ran onboarding with https://www.allbirds.com; /dashboard/insights showed 10 allbirds-specific findings (thin description, heavy pages, 50% markdown, no email sign-up tool; express pay and free shipping shown as strengths). No audit errors in runtime logs |
| Legal pages | Needs Sid | Lawyer review |

## Stripe branding (13 Oct 2026)

- Icon and logo PNGs regenerated from the current live purple and ink helix (public/logo.svg). Earlier coral uploads to Stripe are unused. Copies are in docs/brand/.
- Setting branding failed. Stripe only lets the API change branding on connected accounts, not on your own account ("You cannot use this method on your own account"). This is a Stripe rule, not a missing key permission.
- Needs Sid: Stripe Dashboard > Settings > Branding. Upload docs/brand/stripe-icon-512.png and stripe-logo-1024.png, brand colour #5A50D6, accent #1A1718. The business name is already "E-commerce Helix".

## First-visit 500 fixed (13 Oct 2026)

A new user's first load of /course and /dashboard returned 500. Parallel server calls both tried to seed the same rows (Prisma P2002 on Subscription.userId and StockItem userId+sku). Fix in src/lib/repo.ts: subscription seeding uses createMany with skipDuplicates, and stock seeding claims stockSeeded before inserting. A second load already worked.

## 13 Oct 2026: cards are the one guided path
- **One path:** the dashboard (both views) now leads with **Your next card** (today's 3 cards), metrics below. After the plan (/start/plan) the first button is "Open my first card". Player at /dashboard/cards: one card at a time, Back/Next, progress dots, a short "typing" pause, resume where you left off (saved on the server in CourseState: cardDeck, cardIndex, cardDay, cardsToday).
- **Order:** setup deck "Understand your business" first (until profit setup exists), then the current course goal's lessons, then every other lesson in playbook order.
- **Setup deck (10 cards):** Okay, don't worry / What do you sell? / price (ex GST, divide by 1.1 for 10% GST) / product cost / postage / payment fee (1.75% + $0.30 prefilled, change if different) / ads per order / orders a month / what one order leaves you / done. Answers save into ProfitSetup (new column productName) once a price is entered, so Profit and the dashboard fill in. Checked: $40 price, $8 cost, $9 postage, 1.75% + $0.30 fee ($1.00), $5 ads leaves $17.00; 120 orders a month is $2,040.00 before monthly bills.
- **Every lesson is a deck:** 281 lessons, 1,739 cards (intro "Okay, don't worry" + one card per step with "You'll know it worked when" and "Careful" + done card). Card decks still open at /learn/[slug]/cards/[ref]; since 15 Oct the lesson page itself is the one-step view with an inline checklist, so the "View as cards" link was removed.
- **I'm lost:** small button bottom-right on every dashboard screen. Reopens the current card in a shorter, calmer version; with no progress it restarts at Step 1, understand your business.
- Schema (additive, applied to Neon before push): ProfitSetup.productName, CourseState.cardDeck/cardIndex/cardDay/cardsToday.
- Update (13 Oct evening): every lesson now has a hand-written child-simple deck with its own "I'm lost" text (see the next section). Production signed-in screenshots not possible (demo login is off in production); dashboard and setup deck screenshots were taken from the same build run locally, lesson-as-cards from production. Screenshots: /workspace/reports/helix/screenshots/28-*.png.

## 13 Oct 2026: one path on Today, child-simple card text (done)
- Today: "Your one step today", the course goal card and the "New here? / New: your personal plan" banners are gone. The next-card hero is the only call to action; it carries a small optional "answer a few questions" link when onboarding or the diagnosis is not done. Goal celebration stays.
- Child-simple rewrites live in docs/cards/NN.json (per lesson: intro; per step: say, check, careful, lost). A deck uses the rewrite only when its step count matches the lesson, otherwise it falls back to the playbook text. A test checks every file.
- Done: all 29 modules, 281 of 281 lessons, 1,177 steps, each with its own "I'm lost" text (modules 1 to 8 earlier; modules 9 to 29, 186 lessons and 807 steps, on 13 Oct about 7 PM Sydney). Every lesson warning has a matching "Careful" line (checked by script: 109 in total). Worked examples added where the lesson gives a formula (free shipping 1.25 × AOV, weeks of cover, reorder point = sales speed × (lead time + safety days), GST one eleventh, COGS, CAC, financing cost); each sum re-checked. Internal SOP and doc links dropped from cards; lesson cross-references kept by number. 8-gram check of every card file against the private research: 0 hits. Banned-term check: clean.
- Live check (13 Oct ~7:15 PM Sydney): production deploy READY on 779ff9c. Signed-in dashboard (test account) shows the one-line "45 days to Black Friday" prompt, collapsed by default, expanding on tap to the full plan; lesson 25.4 cards show the new simple text. Screenshots: /workspace/reports/helix/screenshots/31-dashboard-bf-collapsed.png, 31-dashboard-bf-expanded.png, 31-card-25-4-mobile.png.
- Lesson 20.4 Step 4 fixed (13 Oct ~6:40 PM): brand search uses Target impression share (90%, anywhere on results page) with a Maximum CPC bid limit of $0.50 to $1, the same as Lesson 8.12; the expected result now matches (it wrongly said Maximise conversions).
- Dashboard: the seasonal Black Friday box is now a collapsed one-line prompt (countdown plus "A short prep plan is ready when you are" or "Prep plan: X of Y steps done") that expands on tap to the full plan. Other seasonal alerts are unchanged.
- 13 Oct ~5:40 PM: brand-new account (helixtest+fresh1013b@mail.grokbot.com, magic link) first visit to /dashboard and /course returned 200 with no 5xx; the first-visit fix db4b450 is in the live deploy. Screenshots 30-*.png.

## 13 Oct 2026 (~7:45 PM Sydney): legal pages hardened
- /privacy: APPs, GDPR/UK GDPR controller, legal bases, rights, overseas transfers (APP 8, SCCs/UK Addendum/DPF), CCPA (no sale or share), subprocessor table (Vercel, Neon us-east-1, Resend, Stripe, Meta if connected, Google if used for sign-in), cookies and local storage, retention, breach notification, Meta Platform Terms and Google API Limited Use statements, under-18s, OAIC complaints.
- /terms: operator Astryks (sole trader, NSW), no guarantee of results and not advice, 18+, US$29/US$59 monthly, auto-renewal, failed payments, cancel at period end and prorated plan changes (matches the Stripe portal config, checked in test mode), account deletion cancels immediately, ACL guarantees in the standard wording (not excluded), acceptable use, liability limited to the extent permitted by law, NSW law.
- /data-deletion: Stripe records and backups noted, link to privacy.
- Auto-renew notice added to the home pricing section, the billing page and Stripe Checkout (custom submit text with a link to /terms).
- Removed "check with a lawyer" wording (legal pages, docs/legal-pages.md, Lesson 22.12 note).
- For Sid: when Stripe goes live, check the live-mode customer portal also cancels at period end.

## Originality check (2026-10-14)
- Method: `python3 scripts/originality-check.py <private transcript dirs>` (the paths are passed in when you run it, and no source text is stored in the repo). Text is lowercased and punctuation is stripped. Every text file in docs/ (md, cards json, html, csv, py) and src/ is compared with every private transcript and PDF-text file, 384 Helix files in all. The script looks for shared 8-word runs. It skips runs made only of stopwords or common terms, plus month lists and country-code lists. It also does sentence-to-sentence difflib matching (ratio > 0.75), with a shortlist built from shared 4-grams. As a separate pass, I ran 6-grams with no frequency whitelist.
- Results: 3 files had 8-gram overlaps at first. Two were month-name arrays in code, which were false positives. One was a generic phrase in playbook/22, and I reworded it anyway. After that: 0 8-gram overlaps, 0 near-paraphrase sentence pairs, and 0 hits for source or coach names (checked against the banned-terms list plus community and coach names). The 6-gram pass only finds everyday phrases (e.g. "give people a reason to buy").

## 15 Oct 2026 (afternoon): connect your tools, daily table, Learn columns, Today blocks, site-wide content engine
- **Connect your tools** (`/dashboard/connect`, linked from Settings, Numbers and a prompt on Today when Shopify is not connected):
  - Shopify: real. OAuth install (existing, needs SHOPIFY_API_KEY/SECRET) **plus new custom app token** route (owner pastes `shpat_` Admin API token; checked with one read call, stored AES-GCM encrypted in ShopifyConnection, then a 60-day sync). No schema change.
  - Meta Ads and Google Ads: real (existing OAuth + daily cron sync). Meta still in tester mode until Meta approval.
  - TikTok Ads: **placeholder**. `/api/tiktok/connect` sends the user to TikTok for Business sign-in when `TIKTOK_APP_ID` and `TIKTOK_APP_SECRET` are set, and the callback checks state; storing the token and the daily spend sync are not built yet (need an approved TikTok app with Reporting API, and a small additive table). Until then TikTok spend comes in by sheet, CSV or by hand (`adTiktok` column already exists).
  - Google Sheets: real, no Google login. Paste a sheet link shared "Anyone with the link can view" (or a Publish-to-web link); Helix pulls it as CSV (docs.google.com only) and maps common headings (Sales, Meta spend, Visits...). One-off import; re-import any time. No scheduled re-pull yet.
  - CSV upload and type-a-day: existing fallback.
- **Daily table** (`/dashboard/numbers/table`): spreadsheet view, newest first: date, sales, orders, avg order, Meta/Google/TikTok ads, total ads, product cost, shipping + fees, profit, ROAS, MER, conversion %, visits, source. **Download CSV** at `/api/numbers/export`. Numbers page has a "Fills in by itself" bar showing which tools are connected.
- **Learn**: three columns Attract | Convert | Grow (stack on phones), up to 5 key lessons each as video cards (placeholder thumbnail "Video coming soon", title, time, done tick). Add real videos in the `VIDEOS` map in `src/app/dashboard/learn/page.tsx`. "See entire course" opens a numbered timeline of all lessons by stage and module with progress bars, a "You are here" marker, and soft locks (modules more than one past your current one show a lock but can still be opened).
- **Today in blocks**: Morning check, Main focus, Before you finish; 5 to 7 tasks; each has a time, a why line, a lesson/tool link and a done tick; seasonal steps carry the event tag; weekly tip fills Main focus when no event is on; progress bar for today. New routine task ids `routine-<key>-<date>`.
- **Site-wide content engine**: one config file `src/content/site-content.ts` (event words, 23 weekly tips, template highlights). `src/lib/site-content.ts` picks for any date: homepage banner + hero extra line during events (BFCM, Christmas, Boxing Day, New Year, Valentine's, Mother's/Father's Day, EOFY, mid-July deal days, back to school, Halloween, Easter...), otherwise a "Tip of the week" banner that changes every Monday. Today tip, Learn "This week" lesson and "Right now" template highlights use the same engine. New calendar events: EOFY (20 to 30 June), mid-July deal days (2nd Tuesday of July + 1 day), back to school (US, 1 to 21 Aug). Tests in tests/site-content.test.ts.
- **Refresh without deploys**: homepage ISR (revalidate 1 hour) plus a daily Vercel cron `/api/cron/revalidate` at 13:05 UTC (just after midnight Sydney) that revalidates every page.
- **Preview any date** (preview and local only, 404 in production): `/preview/season?asOf=2026-11-20`.
- **Env vars Sid must add** (Vercel, Production and Preview): `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET` (TikTok for Business developer app, redirect URL `https://ecommercehelix.com/api/tiktok/callback`). Already needed/existing: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `META_APP_ID`, `META_APP_SECRET`, `META_CONFIG_ID`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `TOKEN_ENCRYPTION_KEY`, `CRON_SECRET`. Google Sheets needs no keys.

## 15 Oct 2026 (~3 PM): easy subscribe/cancel, payment audit, automated emails
- **Subscribe in one click:** pricing cards and upgrade prompts link to `/api/checkout?plan=…` (GET). Signed out: sign in, then straight on to Stripe Checkout. Already subscribed: the plan is switched in place with proration (upgrade charged now, downgrade credited), never a second subscription.
- **Cancel anytime** (Settings > Plan and billing): "Cancel anytime" button, confirm step, cancel at period end, access kept until the shown date, one-click Resume while cancelling, one-click resubscribe after it ends. "Update my card" opens the Stripe portal straight on the card form. "Cancel anytime, in one click. No lock-in." shown on pricing, FAQ, Checkout, sign-in and Terms.
- **Payment audit, findings and fixes:**
  1. Webhook had no idempotency: now every event id is recorded in `StripeEvent` and repeats are ignored; if processing fails the record is released so Stripe retries (500).
  2. Out-of-order events could overwrite newer state: `Subscription.lastEventAt` now ignores older events.
  3. `checkout.session.completed` trusted `metadata.plan`: the plan now comes from the real subscription's price.
  4. `invoice.paid` was not handled (past_due never cleared): now restores active and sends a receipt.
  5. Cancel at period end and period end were not stored: new columns `cancelAtPeriodEnd`, `currentPeriodEnd`, `priceId` (read from the subscription item, as current Stripe API versions put it there).
  6. Double subscriptions were possible if the webhook was slow: checkout now asks Stripe for any live subscription on the customer first; checkout sessions use an idempotency key.
  7. Price IDs: old prices are accepted through `STRIPE_PRICE_STARTER_LEGACY` / `STRIPE_PRICE_GROWTH_LEGACY`, so earlier members keep their plan. Done: USD prices are live.
  8. Open redirect on sign-in (`next=//other-site`): now same-site paths only.
  9. Portal return URL now goes back to Plan and billing; signature check kept; no secrets in code.
  - Gating: active, trialing and past_due (grace while Stripe retries) keep the plan; cancel at period end keeps it until Stripe ends the subscription; canceled, unpaid and incomplete drop to Free.
  - **Needs Sid:** make sure the Stripe webhook endpoint sends `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`.
- **Emails** (Resend, `src/lib/email/`, Helix-branded, simple words): welcome, daily Today steps (6 to 9 AM in the user's time zone, on by default for paid plans), big sale date emails (28, 14, 7, 1 and 0 days before, from the content engine), payment receipt, payment failed (with update-card link), cancellation ("Thank you for being a member", access-until date, Resubscribe), 14-day win-back, Monday scorecard (now branded). Marketing emails have List-Unsubscribe + one-click POST (RFC 8058) and a confirm page for browser clicks; preferences and time zone at Settings > Emails. Transactional emails are always sent. Each send is logged once per key in `EmailSent`.
- **Crons:** `/api/cron/emails?slot=0..23`, one daily cron per UTC hour (the Vercel plan is Hobby, which allows daily crons only), all with `CRON_SECRET`. Scheduled emails only send when `EMAILS_LIVE=1`; without it the cron reports what it would send. Receipts, payment and cancellation emails send from the webhook as soon as Resend is set.
- **Schema (additive, applied to Neon before push):** Subscription.cancelAtPeriodEnd/currentPeriodEnd/priceId/lastEventAt; new StripeEvent, EmailPrefs, EmailSent.
- **Env vars:** `EMAILS_LIVE=1` (to start scheduled emails), `RESEND_API_KEY` (optional, falls back to the existing `AUTH_RESEND_KEY`), `EMAIL_FROM` (existing), `STRIPE_PRICE_STARTER_LEGACY`, `STRIPE_PRICE_GROWTH_LEGACY`, USD `STRIPE_PRICE_STARTER/GROWTH`, existing `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CRON_SECRET`.

## 15 Oct 2026 (~4 PM): planning tools (the 10 gaps) and automation
**Where they live:** Numbers > "Plan ahead" (each card shows a live headline) opens a sub-page under `/dashboard/numbers/…`. Routines live on Today.
1. **Plan my year** (`/forecast`): 12 months of sales, ad budget at target MER, orders and profit, shaped by your own last year once you have 10+ months (otherwise a normal retail year), with big sale dates per month. Optional yearly goal.
2. **Cash plan** (`/cash`): 13 weeks of money in, ads, product costs, stock orders and bills; low weeks in red. Only manual input: bank balance and the "warn me below" floor.
3. **Stock buy plan** (`/stock-plan`): weeks of cover, order-by date, order size raised for sale dates inside the lead time (e.g. Black Friday ~2.5x), cash per order (feeds the cash plan).
4. **Customer value** (`/customers`): orders per customer, 12-month value and profit per customer, returning share, month-by-month table. Estimate from daily new/returning totals (true per-customer groups need order-level Shopify data later).
5. **New customer ad cost** (`/ad-cost`): ad spend / new-customer sales, last 4 weeks, with target and break-even and a 12-week trend.
6. **Monday review** (Today, Mon to Wed until saved): five numbers pre-filled (sales, profit after ads, orders, MER, conversion), vs last week and target, the biggest problem flagged, pick one fix (or your own); last week's fix shown next Monday. Saved in `WeeklyReview`.
7. **Profit per product** (`/products`): price, landed cost, shipping and packing, fees and an ads share per unit; red under break-even, amber under 10%.
8. **General guides** (`/benchmarks`): ranges by store size (from your sales) and type (you pick). Labelled as Helix rules of thumb, not survey data.
9. **Monthly ad check** (`/ad-check`): connection, pixel, MER vs target, cost per sale vs break-even, frequency, CTR, account set-up; score and the top 3 fixes added to Today once a month.
10. **My targets** (`/targets`): now (30 days), next step and stretch per metric; next moves up as you hit it.

**What is automated now**
- Daily cron `/api/cron/tools` (6:30 AM Sydney, after the Shopify/Meta/Google syncs) recalculates forecast, cash plan, buy plan, customers, ad cost, targets and the ad check for every store and saves them (`ToolSnapshot`).
- It opens alerts that become Today tasks (Main focus, tagged Cash / Stock / Profit / Ad check): cash under your floor in the next 13 weeks, products to reorder now or out of stock, products losing money (3+ sold), the monthly ad check's 3 fixes. Alerts that no longer apply close by themselves; ticking one on Today closes it.
- Optional "Heads-up alerts" email for new alerts (Settings > Emails, on by default, one-click unsubscribe; sends when `EMAILS_LIVE=1`).
- Monday review numbers and the flagged problem fill themselves; the ad check runs itself monthly.
- Benchmarks pick your store size from sales; targets and stretch goals recalc daily.
- Tools read Shopify (sales, products, stock and sales speed), Meta and Google Ads data already synced daily; pages always compute fresh.
- **Manual only where no data exists:** bank balance + cash floor, optional yearly goal, store type, supplier lead times and stock not in Shopify.

**Lessons readability:** every lesson now opens with "In short" (one sentence) and "Do this now" (your next undone step), above "Why this matters", and keeps the one-step-at-a-time cards. Check of all 30 modules: average sentence 13.6 words; 290 of 4,656 sentences are over 25 words. **Done (15 Oct, ~4:30 PM):** hand rewrite of every sentence over 22 words across all 30 modules (~550 rewritten), plus a plain-word pass. After: average 12.1 words, 20 sentences over 25 (mostly "Related" link lines and short lists), 308 over 20 (mostly 21 to 22 words). Commits a938222, 8747b35, 297784c, 0b1f77b.

Schema (additive, applied to Neon first): ToolInput, ToolSnapshot, ToolAlert, WeeklyReview; EmailPrefs.alerts. No new env vars.
