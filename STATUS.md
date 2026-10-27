## Road to $100M content v2 (27 Oct 2026)
- Branch: `helix-journey-content-27oct` (from main d2c3fb7). Not merged, not deployed.
- New `src/lib/journey-content.ts`: per-level deep content for all 7 levels (what it takes, timeline range, worked unit economics, cash and stock, hiring order, channels, ecosystem/partners, ad saturation, mistakes, sources), a "what you spend" card per level from stated assumptions ($60 retail, $13.50 cost, $4 shipping, 3% fees, 10% leakage; ads 25-40% of sales at scale), formula in plain words, change-the-assumptions note, ads-saturation caveat, bootstrapping fit note, and three verified brand lessons (Gymshark, Casper, Allbirds) with sources.
- Paywall unchanged: Free sees the map plus levels 1-2 in full; deep/spend data for locked levels is never sent to Free (tested). Brand lessons are paid-only.
- New `LevelDeep.tsx`; `RoadSection.tsx`, `journey-view.ts`, `journey.ts` (MER wording, ad-spend ranges) updated. Tests added to `tests/journey.test.ts` (503 passing), lint 0 errors, build OK.
- Screenshots: /workspace/reports/helix/screens/journey2/ (desktop and mobile, $10M and $100M levels, formula, brands).
- Timelines, overhead %, partner %, creator costs are labelled Helix estimates.

## Road to $100M (branch helix-road-to-100m-27oct, 27 Oct 2026, not merged or deployed)

- Progress page: a 7-level map (first sale, $1k, $10k a month, $1M, $10M, $50M, $100M a year) with XP, streak, badges and "You are here". Position comes from real daily numbers (last 30 days of sales); without numbers the member picks a level.
- Each level: what changes, the 3 numbers to hit, the next 5 moves (linked lessons, paywall respected) and what the business often looks like. Free gets the whole map plus levels 1 and 2 in full; locked levels send only a teaser from the server. Starter and up get everything.
- Today page: compact Road teaser. Coach gets one context line with the level. Daily email adds one Road line.
- No schema change: the picked level is stored in ToolInput with kind "journey". No SQL to run.
- Ranges are labelled typical ranges/estimates; sources are linked on each level (Shopify Help, Baymard).
- Screenshots: /workspace/reports/helix/screens/journey/.

# ▶ NEXT STEPS (updated 27 Oct 2026, morning AEDT) — start here

## CHANNELS 101 + BEGINNER ORDER (27 Oct 2026, branch `helix-101-27oct`)

- New Learn path step 3 **"Channels 101: pick where to show up"** (`/dashboard/learn/path/channels-101`), right after "Get your store ready first". Five plain first-time lessons, each with its own card deck and a new permanent saved-progress id:

| Shown | Lesson | Permanent id |
|---|---|---|
| 8.17 | Meta ads 101 (start here if you have never run an ad) | 7.17 |
| 10.14 | Google 101 | 8.14 |
| 11.14 | TikTok 101 | 12.14 |
| 11.15 | Other channels 101 (Pinterest, SEO, YouTube, email, SMS, marketplaces) | 12.15 |
| 8.18 | Which channel first? A simple guide | 7.18 |

- Each 101: short numbered steps (one action, one recommended choice), "More detail" collapsed boxes, Before you start / After you launch, YouTube search phrases (no video links) and the screenshot-and-ask-the-coach tip. Facts cite official Meta, Google, TikTok and Pinterest help pages inline.
- Glossary: Placement, Boosted post, Objective, Performance Max, Merchant Center.
- **Coach embed NOT re-run:** `AI_GATEWAY_API_KEY` is not set in Vercel (checked by name) and not on the box, so per the brief it stopped. The new lessons are already in the corpus (dry run: 817 chunks); run `npx vite-node scripts/coach-embed.ts --yes` once credentials are available (changed chunks only, well under $0.01).
- **Live:** `main` 62db4d4, production deployment **dpl_4bskKLej2A5ggGVpxayMPg9xDmze** (ecommercehelix-93er82feh), Ready, aliased to ecommercehelix.com. Public lesson pages show all five new lessons.
- **Rollback:** previous prod deployment **dpl_BmsUhXvFej1RiBUCiQ2B87uJ6jur** (ecommercehelix-orr7drpsl) — `vercel promote ecommercehelix-orr7drpsl-astryks.vercel.app`.

### Beginner order per stage (Learn path, framework checklist and stages.md all follow this; ids and progress unchanged)

| Stage | Order |
|---|---|
| Attract | 2 Get your store ready first → 3 Channels 101 (pick a channel) → 4 Know who you are selling to → 5 Make your first ads (profile, content, creative, creators) → 6 Plan your campaign (numbers, job, audiences, structure, budget, naming, brief) → 7 Set up your first ad (launch) → 8 Read your results and improve → 9 Add more places to be seen |
| Convert | Sharpen your offer → product pages and store (13, 14) → cart, checkout and payments (14, 20) → trust: shipping and returns (21) → email and SMS (16, 30.7, 30.8) → promotions and sales (17, 18) |
| Grow | Metrics and retention (17.7, 18.6, 16.x) → profit and books (23.1–23.3, 19.3, 19.4, 19.12, 19.5) → scaling (8.13, 8.14, 25, 26.8, 26.9) → stock and cash (19.1, 19.2, 19.9, 19.10, 19.6, 19.7, 26.4, 26.5) → admin and team (22, 23.4–23.6, 26.6, 30.11–30.16, 26.1–26.3, 26.7, 27, 28, 24.3–24.6) |

Note: in the app the store basics sit in Attract step 2 (before ads, as before); stages.md lists Convert with the offer first. "Plan your ads" was split into "Make your first ads" (new step id `make-ads`) and "Plan your campaign" (`plan-ads` kept).

## LIVE IN PRODUCTION (27 Oct 2026)

- `main` = `helix-live-27oct` (includes `helix-audit-fixes-27oct`). Production deployment **dpl_Evq76KucQri6ujJamUbKhpL6LX9G** (ecommercehelix-of69h75fn), Ready, aliased to ecommercehelix.com.
- **Rollback:** previous prod deployment **dpl_CWqNvy2rkMuEBnj82pcGGaRX1ofE** (ecommercehelix-4kjjefvcx) — `vercel promote ecommercehelix-4kjjefvcx-astryks.vercel.app` or Vercel → Deployments → Promote.
- Production flags set to 1: `HELIX_COACH`, `HELIX_COACH_PROD`, `KLAVIYO`, `TIKTOK_ADS`, `GA4_SESSIONS`, `SHOPIFY_ORDER_WEBHOOKS`. TikTok/GA4/Shopify webhooks show "Coming soon" until their keys exist.
- `BUSINESS_POSTAL_ADDRESS` intentionally NOT set (owner decision).
- Coach embeddings: 797 chunks (incl. the 5 new Learn-path lessons), via AI Gateway (OIDC). MIN_SCORE 0.5; thinking disabled; empty answer → fallback model.
- Test spend total ≈ $0.07 (embeds ≈ $0.046, coach calls $0.023 per CoachUsage). Demo test users (`demo-*`) and their rows deleted.
- Tests: 468 passed, 2 skipped.

## Helix AI coach (history; now LIVE — see above)


A pop-up coach ("Helix - Your business coach") sits at the bottom right of the dashboard. It is behind the `HELIX_COACH` flag. In production it also needs `HELIX_COACH_PROD=1`, so it is **off in prod**. No money has been spent and no paid API calls were made, because no gateway key is set on the box.

**What's built (verified with mocked models and tests):**
- **Three answer modes, each labelled.** *Your store* uses aggregated numbers only: plan, profit waterfall, 30-day totals and store-check findings, with no customer PII. *Helix course* uses RAG over the Helix course text (playbook, SOPs and cards, about 787 chunks), takes the top 6 and links to `/learn/...` lessons. *General* is used when the best score is under 0.55. It starts with "General advice (not from the Helix course):", gives no links and makes up no numbers.
- **Retrieval.** Hybrid pgvector (cosine) plus Postgres full-text, scored 0.7/0.3. Until the embedding job runs, a free keyword (BM25) search is used, so the coach works without embeddings.
- **Routing through the Vercel AI Gateway.**
  - The fast model is `anthropic/claude-haiku-5.5`, the deep model is `anthropic/claude-sonnet-5`, and `google/gemini-3.8-flash` is the fallback if Claude errors. The ids are in `src/lib/coach/config.ts` and can be overridden with env vars (`COACH_MODEL_FAST/DEEP/FALLBACK/EMBED`).
  - Deep is used for the Deep dive button, multi-step questions, context over 12k tokens, or a fast answer that fails the self-check.
- **Guardrails, enforced on the server.**
  - Monthly messages: Free 20 fast. Starter 300, of which 40 can be deep. Growth 800, of which 100 can be deep.
  - Hard monthly spend cap across all users: `COACH_MONTHLY_BUDGET_USD`, default $50.
  - Rate limit of 6 a minute. Logs are redacted (emails, phones, cards, addresses). Prompt training is turned off at the gateway.
  - The system prompt forbids naming or imitating any outside course, coach or brand. Optional `COACH_BLOCKED_NAMES` (comma-separated, set in Vercel and never committed) strips listed names from answers.
- **Helix voice.** The tone guide is in the system prompt. Every answer that has matching course material includes a "Helix tip" with a lesson link, including store answers.
- **Memory.**
  - Saved per user and kept across sessions, under: business, store, products, channels, goals, budget, decisions, tried and results.
  - Notes are pulled out after each answer by a small fast-model call that does not count toward the user's limit.
  - No customer PII is kept. Users can edit or delete any note, or delete everything, under "What Helix remembers" in the widget.
- **Daily chat.** Each day starts a new visible chat, and memory carries over. The chat opens with the fixed greeting, then a personal line (yesterday's done or open task, the user's goal).
- **Daily tasks.** One to three tasks a day, built from: yesterday's open task, a numbers flag, the next checklist lesson and the daily topic. Users can tick them off, and open tasks carry over to the next day. `coachTasksForEmail()` is ready, but it is not wired into the daily email yet.
- **Database.** The migration is additive: `CoachChunk`, `CoachUsage`, `CoachMemory`, `CoachMessage`, `CoachTask`, plus the `vector` extension. It is in `prisma/schema.prisma` and `prisma/sql/2026-10-27-helix-coach.sql`.
- **Tests.** `tests/coach.test.ts` has 29 tests covering routing, fallback, Gemini failover, self-check escalation, limits and caps, the flag, redaction, memory and daily tasks. The full suite passes: 406 passed, 2 skipped. `tsc` and `next build` are clean.

**Costs (USD):**
- **One-off embedding.**
  - Helix course text in the repo: about 228k tokens, about **$0.05**. The exact figure is printed by `npx vite-node scripts/coach-embed.ts`, a dry run that sends nothing.
  - Full 7.8M-token corpus from the plan: **$1.57**, or $0.78 by batch. It only applies if the Helix-reworded extra material is added through `COACH_EXTRA_DIR`. Never point that at raw transcripts.
- **Monthly.**
  - Typical message about $0.004, plus about $0.0003 for memory.
  - Per user: about $0.74 typical, $0.19 light. Worst case at the plan caps: Starter $3.26, Growth $8.31.
  - The hard cap defaults to $50 a month in total.

### Not built yet / needs Sid
1. **Approve spend and add a gateway key:** set `AI_GATEWAY_API_KEY` in Vercel (Preview first), then run a 2-3 message smoke test.
2. **Apply the DB change:** run `npm run db:push` (or the SQL file) against Neon. It needs the `vector` extension, which Neon supports.
3. **Run the embedding job:** `npx vite-node scripts/coach-embed.ts --yes` (about $0.05, or $1.57 with the full corpus).
4. **Enable the flag:** `HELIX_COACH=1` on Preview. Production also needs `HELIX_COACH_PROD=1`.
5. Optionally set `COACH_BLOCKED_NAMES` and `COACH_MONTHLY_BUDGET_USD` in Vercel.
6. **Meta app review**, so live ad numbers can feed store answers.
7. **Shopify scopes** (`read_orders`, `read_all_orders`) for richer store answers.
8. Wire `coachTasksForEmail()` into the daily email cron (optional).

## Not built yet / needs Sid (27 Oct 2026, branch `helix-fixes-27oct`)

Code for everything below is either built behind a flag or lives in another repo. Each item needs Sid (an approval, a key, a spend, or a click).

- **Meta app review:** Advanced Access for `ads_read`/`ads_management` so non-test users can connect. Submit in the Meta developer console.
- **Google Ads developer token:** Basic access needed before any real account can sync or get the paused draft (campaign + budget + PAUSED ad group, phrase keywords and a responsive search ad, built 27 Oct). Set `GOOGLE_ADS_DEVELOPER_TOKEN`. *(27 Oct update: No longer required: Google sunset developer tokens on 9 Sep 2026; Helix is live with just `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` (an existing token is still sent but optional).)*
- **GA4 sessions (built 27 Oct, off):** set `GA4_SESSIONS=1`; the Google sign-in then also asks for `analytics.readonly`, which may need Google OAuth verification. Users must reconnect and save a property id (`setGa4Property`; no settings form yet). Runs inside the daily google-ads-sync cron.
- **TikTok app approval (built 27 Oct, off):** TikTok For Business app with Reporting scope. Then set `TIKTOK_ADS=1`, `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET`, run `docs/sql/2026-10-27-tiktok-ga4.sql` (or `npm run db:push`; additive only), and add the redirect `https://ecommercehelix.com/api/tiktok/callback`. Connect at `/api/tiktok/connect`; daily spend sync at `/api/cron/tiktok-sync` (19:25 UTC). No Integrations card yet; picking between several advertisers has `pickTikTokAdvertiser` but no UI.
- **Shopify `read_all_orders`:** request in the Partner dashboard (needs a reason). Until then sync stays at 60 days.
- **Shopify order webhooks (built 27 Oct, off):** set `SHOPIFY_ORDER_WEBHOOKS=1`. Topics orders/create, updated, paid, cancelled and refunds/create are registered on the next connect or sync; each event triggers a 3-day re-sync (HMAC checked, deduped by webhook id, throttled to one sync per 2 minutes per store). The daily cron stays.
- **Course video storage:** about 14 GB of videos are not in git. Upload steps and costs are in `docs/course-videos.md` (Vercel Blob suggested; needs Sid's OK for the storage and bandwidth cost). Then set `COURSE_VIDEO_BASE_URL`.
- **Stripe test purchase and refund:** one live-mode test buy and refund of Starter to prove checkout, webhooks and cancellation end to end.
- **Vercel env vars:** add the new flags above on Production when ready (`SHOPIFY_ORDER_WEBHOOKS`, `TIKTOK_ADS`, `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET`, `GA4_SESSIONS`, `COURSE_VIDEO_BASE_URL`) plus any still missing (`GOOGLE_ADS_DEVELOPER_TOKEN`). *(27 Oct update: No longer required: Google sunset developer tokens on 9 Sep 2026; Helix is live with just `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` (an existing token is still sent but optional).)*
- **Becky site:** turn on "Enforce HTTPS" in the HTML host settings.
- **Firebase and Orca migrations:** live in other repos, not this one.
- **Klaviyo:** not built. Owner chose ready-to-paste flow copy and removed the Klaviyo brand; an API sync needs a decision and a private API key.

**Fixed 27 Oct:** text one word per line across the app (Tailwind theme token `--spacing-block` generated `.inline-block{inline-size:24-32px}`; renamed to `--spacing-stack`, regression test added), plan card clipping hardening (`min-w-0`/`shrink-0`), store-check SSRF gaps (internal hostnames, non-default ports, IP literals, 31 tests), `plain_layer.py` crash and accidental overwrite, Today "card x of y" now opens exactly that deck, Learn page video slot.
## 27 Oct 2026: stage-ordered Learn path, "You are here" strip, 5 new lessons (branch `helix-audit-fixes-27oct`, pushed, NOT merged, NOT deployed)
- Learn path now runs Start here, then Attract (steps 2-7), Convert (8-9), Grow (10). Each step has a `stage` and shows it. Step ids kept (`store-ready`, `customer-and-offer`, `plan-ads`, `first-ad`, `read-results`, `grow`) plus new `know-your-customer`, `more-channels`, `email-and-promos`. Lesson refs and saved progress unchanged.
- Step 2 "Get your store ready first" sits in Attract and is labelled "Convert basics you do before ads". Its lessons stay tagged Convert in `stage-map.json`; the quest puts them in the Attract section only because they come before ads. The rule is explained on the step, the strip and the Attract, Convert, Grow page.
- Attract lessons that sat under Grow (11.x, 12.x, 10.11-10.13, 8.6, 18.2, 30.3-30.6) are now in "Add more places to be seen". Convert lessons (16.x, 17.x, 18.x, 19.11, 30.7, 30.8) are now in "Email, SMS and promotions".
- "You are here" strip (`src/components/StageStrip.tsx`) on Today, /start, the plan page and the nav (sidebar and mobile header). It links to /dashboard/learn/framework.
- 5 new lessons in Helix wording, each with cards, aliases, stages.md and a place in the path: 15.12 product validation and fit (permanent id 3.12), 16.18 visitors to subscribers with consent (10.18), 5.22 tired ads (5.23), 11.13 organic Pinterest (12.13), 27.7 founder energy and sleep (16.10). New glossary terms: Creative fatigue, Product-market fit, Pop-up. The coach corpus (on `helix-live-27oct`) reads docs/playbook and docs/cards, so it picks these up once both branches are merged and the embed is re-run.
- Daily email topic follows the user's stage: if their next lesson is in a later stage than the shared topic, they get a topic from their own stage, never the same as yesterday (`topicForStage`, tests/daily-topic-stage.test.ts).

## 26 Oct 2026: daily topics, checklist quest, AI plan (branch `helix-daily-topics-quest`, NOT pushed)
- Daily email topic teaser: 72-topic Attract→Convert→Grow calendar with no repeats per cycle (fcf43d1). Social calendar of 72 IG + 72 FB posts in `docs/social/daily/`, prepared only and not scheduled.
- `/dashboard/learn/framework`: stage timeline, ticks, XP, badges, streak, plus "Next up" on Today (d85cb1e). Build OK, 376 tests pass.
- `docs/HELIX-LLM-PLAN.md`: RAG-first plan, costs and fair-use limits. Nothing paid is enabled.
- To ship: Sid OKs, then push or merge to main (Vercel deploys prod).

**Latest (26 Oct 2026):** Learn path videos now come from official channels only, and two new compliance lessons are live: 21.8 Product safety, labelling and recalls, and 13.17 Privacy and cookie consent (see "Official videos and two compliance lessons" below). Earlier the same day: course reorder (Start here → Attract → Convert → Grow), SEO basics (11.8), Meta audience check (9.3), founder-story emails and corrections.

**Needs Sid:** the numbered list under "Needs Sid" below (Stripe test purchase, TikTok, Meta app review and Save choice, Google Ads token, GitHub Support, lesson videos, Facebook group, wins moderators, Search Console, Resend usage, re-rendered social images).

**Still unverified:** Click Frenzy 2026 date; Meta creator marketplace possibly renamed "Creator Marketing Hub"; add the second Ramadan of 2030 when creating a 2031 lunar entry.

**Ideas for later** (optional lessons from the gap research; Sid to choose. Full reports on Sid's Mac in `~/Desktop/Helix research/gaps-2026-10-20/`, kept out of the repo):
- Higher value: Google AI Max readiness; creative variety (near-identical ads count as one); incremental attribution for warm campaigns; bot traffic check; change freeze and theme backup before peak; a customer's first 100 days; day-by-day sale send plan; hype phase and December after the shipping cut-off.
- Also: freebies instead of discount sign-ups; subscription law (ROSCA, California, UK/AU 2027); drip pricing; delivery updates; bold guarantees priced safely; pre-order timing; core range + drops; landed cost; instant-win and purchase-linked prize maths; gift thresholds; competitors on your brand name; brand-only Shopping; local inventory ads; tROAS from margin; Google budget planner; Pinterest structure and its 30-day attribution; delegation levels; splitting each payout; scorecard colours + monthly project review; trademarks; insurance; European Accessibility Act.
- Do not adopt: extending a sale after "last chance", "leaked" codes, prize draws with no free entry, charging more for instalments, emailing scraped addresses.

## Daily emails: different every day (26 Oct 2026)

Sid: "the daily emails are the same". The daily email is now built fresh per user and date (`src/lib/email/daily-mix.ts`, seeded hash, so the same user and day always match and nobody sees a repeat subject, opener or idea within 30 days):
- **Subject and opener** from pools of 36 and 34, filled with the weekday, date, focus, step count and minutes (e.g. "Tuesday: your ads + 1 lesson step").
- **Weekday themes** for the middle task: Monday plan, Tuesday ads (free-traffic tasks if the store has no ad spend), Wednesday store pages, Thursday customers, Friday stock and cash, weekend light. Each has 5-8 tasks that rotate week to week; sale-prep tasks (season tasks) take that slot every other day when due.
- **Personal:** next lesson step by title with a button to it, current goal (day x of y) from `getCourse`, and yesterday's sales, orders, ad spend and MER against the 7 days before from real scorecard days (`daily-facts.ts`). Missing data is skipped, never guessed.
- **Today's idea** rotates a story or lesson idea (the 30 sequence emails), a site tip and a glossary word. Win prompt and numbers-check wording rotate too.
- Same window (6-9 AM local), keys, demo exclusion, unsubscribe headers and footer, Resend path and volume. `notify` now claims the send before building, so data loads once per user per day. Tests: `tests/email-daily-mix.test.ts` (`PREVIEW=1 npx vitest run tests/email-daily-mix.test.ts` prints 7 sample days). The old `dailyTasksEmail` stays for its tests but the cron no longer uses it.

# STATUS

_Last updated: 26 Oct 2026, evening (Sydney)._

## Needs Sid (only these are left)

1. **Stripe: one real purchase + refund (5 minutes).** Setup is done (15 Oct 2026, live mode). Left for you: buy Starter (US$29) on the live site with your own card, open Plan and billing > Manage, cancel, check access stays until the period end, then refund in Stripe. Also set branding by hand (Stripe does not allow it via the API on your own account): Dashboard > Settings > Branding: name "E-commerce Helix", logo option B, colour #5A50D6, accent #1A1718.
2. **TikTok (paused by Sid).** When ready: create the app at https://business-api.tiktok.com/portal, redirect URL `https://ecommercehelix.com/api/tiktok/callback`, then set `TIKTOK_APP_ID` and `TIKTOK_APP_SECRET` in Vercel. Spend sync is built after that (small additive table).
3. **Meta app review** (so people who are not testers can connect Meta): Business Verification in Meta Business Settings > Security Centre, then App Review for `ads_read`, `ads_management`, `business_management`, `pages_read_engagement` with the screen recording described in `docs/meta-setup.md`.
4. **Meta "Save choice" check** on Settings > Connections: sign in as yourself, pick your ad account, Page and pixel, press Save choice and confirm it sticks (the fix shipped; it needs your real Meta account to confirm). Then refund your earlier Starter payment and set your account to Starter free.
5. **Google Ads check-in:** once Google approves the developer token (https://console.cloud.google.com/google/ads-apis/overview?project=astryks), send it to me or set `GOOGLE_ADS_DEVELOPER_TOKEN` in Vercel Production, then connect your Google Ads account on /dashboard/connect and check the first sync. *(27 Oct update: No longer required: Google sunset developer tokens on 9 Sep 2026; Helix is live with just `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` (an existing token is still sent but optional).)*
6. **GitHub Support request (old cached research commits):** ask GitHub Support to remove the old cached commits 79bd6e9, d93fb8b, ac984ea, 90a2d45 and d785342 from Astryks/Astryks PR #12. Ready text: `docs/github-support-pr12.md`; send it at https://support.github.com/contact ("Removing sensitive data").
7. **Lesson videos** (when recorded): send the URLs and I add them (free YouTube picks per path step live in `src/lib/learn-path.json`).
8. **Closed Facebook group for paying members:** set `FB_GROUP_URL` in Vercel (send the group link). After that, join emails go out automatically and the daily digest plus `/admin/community` list who to approve or remove (Facebook has no API, so the final tap is by hand). Also set `AUTH_SECRET` and `CRON_SECRET` if missing.
9. **Wins wall moderators:** set `WINS_MODERATORS` (comma-separated emails) in Vercel so wins can be approved.
10. **Search Console and Bing:** submit `https://ecommercehelix.com/sitemap.xml` (verification tag is already in the site).
11. **Email cost (Resend, checked 19 Oct 2026, resend.com/pricing):** Free = 3,000 a month and max 100 a day; Pro = US$20 a month for 50,000, no daily limit, US$0.90 per extra 1,000. About one email per user per day, so the free plan stops covering it at roughly 90-100 active users (sends over 100 a day fail). Check usage in the Resend dashboard.
12. **Replace re-rendered social images on Meta if those posts are already booked** (Instagram and Facebook). v2 post 47 (planned 29 Nov; the routine books it at the end of November): `docs/social/v2/static/post47-rest.png`. Check its real date on Meta. "Especially during BFCM" is right from 27 to 30 Nov; if it lands on 1 Dec or later, tell me. v3-25, 29, 33, 48 and 49 (planned 27 Dec, 31 Dec, 4 Jan, 19 Jan and 20 Jan) if Product's routine has already booked them. v3-48 and v3-49 are MP4s, and the v3-48 caption changed too (`docs/social/v3/manifest.csv`). v2 post 4 needs nothing (see the correction below).

## Official videos and two compliance lessons (26 Oct 2026, evening)

Branch `cleanup-oct27`.

**Learn path videos: official channels only** (`src/lib/learn-path.json`; each checked with YouTube oEmbed for title and channel, and embeddable):

| Step | Was (channel) | Now (channel, id) |
| --- | --- | --- |
| Start here | Common Thread Collective | PRICING STRATEGY: How To Find The Ideal Price For A Product (Learn With Shopify, xQWUm_eHjGk) |
| Store ready | Arsh Sanwarwala, ThrillX | How to Optimize Your Shopify Store for Higher Conversions (Learn With Shopify, kFWPkoOx_ao) |
| Plan ads | Dara Denney | Unlock better performance by diversifying your ad creative (Meta for Business, NGIKjtQTcLM) |
| Plan ads | Dara Denney | Hook hacking: How to grab attention in the first three seconds (Meta for Business, OHX1ctQn6NY) |
| First ad | Ben Heath | The COMPLETE Meta Tutorial (Learn With Shopify, OE4WimLYVGE) |
| First ad | Aaron Young, Define Digital Academy | Google Ads: How to use Shopping ads to reach more customers (Google Ads, mCj40f2QmHI) |
| Read results | Ben Heath | Solving creative fatigue with strategies to refresh your ads (Meta for Business, -vZEjTgEX-0) |
| Read results | Commerce Roundtable | Ecommerce Marketing Analytics: A Beginner's Guide to Data-Driven Success (Learn With Shopify, hXHym9wDnNo) |
| Grow | ethercycle | How to prepare your Google Ads retail campaigns for holiday shopping (Google Ads, K-hcfC7rrVo) |

The 3 existing Learn With Shopify videos stay (RWI59fC7Z48, KMrTD8KIB18, vNIcSMLyutc).

**New lessons (Helix's own words, official sources only, general information not legal advice)**
- **21.8 Product safety, labelling and recalls** (Grow, end of Fulfilment, shipping and returns; learn path after 21.7): Australian mandatory standards and bans (button and coin battery warnings), supplier proof, labels and listings, EU GPSR listing details and EU responsible person (applies since 13 Dec 2024), US CPSC certificates (Children's Product Certificate, eFiling since 8 Jul 2026), incident plan, recalls. Deadlines table: ACCC mandatory report within 2 days, recall notice within 2 days of recall action, EU accident notice without undue delay, CPSC report within 24 hours. Sources: productsafety.gov.au (when you must report, recall notification, button battery information standard, mandatory standards search), accc.gov.au (product safety responsibilities), EUR-Lex Regulation (EU) 2023/988 (Articles 9, 16, 19, 20, 52), cpsc.gov (duty to report, Children's Product Certificate).
- **13.17 Privacy and cookie consent** (Convert, end of Shopify store setup; learn path right after 13.12 Policies, which it links to): data list, who the Privacy Act covers (over $3M turnover, plus some smaller businesses), privacy policy update incl. automated-decision wording from 10 Dec 2026, Shopify cookie banner (Settings > Customer privacy), EU/UK consent for non-essential cookies, UK "statistical purposes" exception for site analytics, Google consent mode and the EU user consent policy, yearly review. Sources: oaic.gov.au (small business, ADM transparency news 30 Sep 2026), ico.org.uk (storage and access exceptions), europa.eu Your Europe (cookies), support.google.com (consent mode, EEA consent mode updates), help.shopify.com (customer privacy settings). 13.12 and the 13.15 pre-launch table now point to 13.17.
- Both: card decks, a self-check (new Self-check sections in modules 13 and 21), stage tags, learn path places. Permanent ids for saved progress: 22.19 → 13.17 and 23.8 → 21.8 (`lesson-aliases.json`; old saved 21.8 still reads as 4.6, tested). New glossary words: Cookie banner, Consent mode, Mandatory standard, Product recall, EU responsible person. Regenerated: glossary, curricula (unchanged), stages.md.

**Checks (26 Oct 2026, evening):** `npm ci` ok; `next typegen` ok; `tsc` clean; `npm run lint` 0 errors (same 5 old warnings); `npm test` 51 files, 370 passed and 1 skipped (lesson-refs, alias and learn-path tests included); `npm run build` ok; `check_links.py` ok; all 29 card JSON files parse.

**STATUS cleanup:** `#klaviyo` captions are fine (owner, 26 Oct), no postal address will be added (owner), learn path channel question resolved, branch deletion note removed; optional gap-research lessons kept as "Ideas for later" at the top.

## Course reorder, SEO basics, Meta audience check, corrections (26 Oct 2026)

Branch `course-reorder`. Full old → new lesson list: `src/lib/lesson-aliases.json` (`renumbered`), also written out before the change as an outline.

**Corrections (each verified on the official source first)**
- Australia, card surcharges and interchange: since 1 Oct 2026 Visa, Mastercard and eftpos have no-surcharge rules (debit, credit, prepaid) and American Express, UnionPay and PayPal dropped surcharging too; interchange caps fell the same day (debit 8c or 0.16%, consumer credit 0.3%; foreign cards 1.0% from 1 Apr 2027). Sources: RBA conclusions paper (FAQs, Impact and implementation, At a glance). The ACCC page returned 403 to our fetch, so the RBA FAQ is cited. Updated: 20.1 (was 24.1) Watch out and card, 13.11 (was 22.11) Watch out and card, Profit setup fee hint.
- Free-shipping threshold: one rule of thumb, "about 20 to 30% above your average order value (1.2 to 1.3 times)", in 14.10 (was 9.11) and its plain box and self-check, 2.3, 13.9 (was 22.9), cards 02/14/13, both curricula, SOP 12, audit-engine doc, email sources doc and the free-shipping email. 14.9 (was 9.10) gift tier now sits above the free-shipping amount.
- 14.9 (was 9.10): the free gift must be something people value and would buy, not something that looks like a sample (lesson and card).
- EU: 21.5 (was 23.5) adds the online withdrawal function from 19 Jun 2026 ("withdraw from contract here", available for the whole 14 days, confirm by email; EUR-Lex Directive (EU) 2023/2673, application date confirmed on commission.europa.eu); 17.4 (was 13.4) "was" price = lowest price in the prior 30 days including earlier sale prices (EUR-Lex: Commission guidance on Article 6a of the Price Indication Directive). Cards matched.

**New lessons (Helix's own words, official sources only)**
- 11.8 SEO basics (Attract): search intent → page type, free keyword sources (Search Console Queries, autocomplete, People also ask), titles and descriptions, URL handles, redirects when renaming or deleting, alt text, internal links, sitemap, 404s, product FAQs, structured data via the theme (Rich Results Test), writing for AI search, a 20-minute monthly routine. 11.9 (SEO step by step) keeps keyword research, articles and mentions; 11.10 keeps AI shopping helpers. Sources: developers.google.com/search, Search Console help, help.shopify.com.
- 9.3 Meta audience check (Attract): Audience segments breakdown, new-audience share (rule of thumb about 70%+ of cold spend), new-audience frequency under about 2 over 7 days, cause → fix table. The per-ad-set setting name could not be verified on Meta's help centre, so it is described generically: exclude customer audiences in cold ad sets and give past buyers their own ad set with a spending limit, as Meta for Developers' Advantage+ campaign guide describes after retiring the existing-customer cap.
- Both have card decks, a self-check question, learn path places and stage tags. New glossary words: Search intent, Alt text, URL redirect, Sitemap, Structured data, Audience segments.

**Founder stories:** Spanx, Nike (with Blue Ribbon Sports), Gymshark, Glossier and Patagonia stories restored in `src/lib/email/sequence.ts` (story text only; facts as in `docs/email-sequence-sources.md`). Warby Parker, Bombas and Under Armour stay generic.

**New order** (modules → lessons; lesson numbers read in order; Meta and Google modules now start with the tour, account setup and first launch):

| New | Was | Group | Module | Lessons |
| --- | --- | --- | --- | --- |
| 1 | 1 | Start here | Daily profit foundations | 10 |
| 2 | 2 | Start here | Diagnose before you fix | 8 |
| 3 | 4 | Attract | Brand, content and community | 9 |
| 4 | 21 | Attract | Brand and social presence | 7 |
| 5 | 5 | Attract | Creative strategy | 21 |
| 6 | 19 | Attract | Creators, UGC and video ads | 13 |
| 7 | 6 | Attract | Defining campaigns | 16 |
| 8 | 7 | Attract | Meta ads in practice | 16 |
| 9 | 20 | Attract | Ad performance analysis, audiences and campaign setup | 14 |
| 10 | 8 | Attract | Google ads in practice | 13 |
| 11 | 12 | Attract | TikTok, Pinterest, SEO and AI search | 12 |
| 12 | 11 | Attract | List and audience growth | 5 |
| 13 | 22 | Convert | Shopify store setup | 16 |
| 14 | 9 | Convert | Your store: more sales per visit and bigger orders | 18 |
| 15 | 3 | Convert | Offer and product | 11 |
| 16 | 10 | Convert | Email, SMS and messaging | 17 |
| 17 | 13 | Convert | Promotions, launches and big sales | 13 |
| 18 | 30 | Convert | Seasonal sales, step by step | 6 |
| 19 | 14 | Grow | Inventory, cash and the year plan | 12 |
| 20 | 24 | Grow | Payments, fraud and chargebacks | 5 |
| 21 | 23 | Grow | Fulfilment, shipping and returns | 7 |
| 22 | 26 | Grow | Tax, GST, sales tax and duties | 5 |
| 23 | 27 | Grow | Accounting, bookkeeping and tax time | 6 |
| 24 | 25 | Grow | Account safety, ad accounts and agencies | 6 |
| 25 | 15 | Grow | International expansion | 7 |
| 26 | 28 | Grow | Team, creators and money | 9 |
| 27 | 16 | Grow | Founder rhythm, team and resilience | 6 |
| 28 | 17 | Grow | AI for e-commerce operators | 5 |
| 29 | 18 | Grow | Choosing your tool stack | 2 |
| 30 | 29 | Grow | Customers, partners and the weekly rhythm | 16 |

**How old refs and progress keep working**
- Saved data uses permanent ids: each lesson's number before this change (new lessons 12.12 and 20.14). `src/lib/lesson-alias.ts` converts at the edges: LessonProgress step keys (read and write in `repo.ts`), lesson and course task ids (`lessonTaskId`, `courseTaskId`, so existing TaskCompletion rows still match), the card player deck (CourseState.cardDeck and the browser position key) and store-check findings (AuditRun). No database change or migration was needed.
- Browser progress moves once from `helix-lesson-steps` (old numbers) to `helix-lesson-steps-v2`. The API takes `v: 2` for current numbers; a page loaded before the deploy sends old numbers without it, which are stored as-is.
- Old module URLs 308-redirect to the new slugs (`next.config.ts`, from `lesson-aliases.json` `modules`); old `#lesson-…` anchors jump to the same lesson (AnchorRedirect); old card links `/learn/<old>/cards/<old ref>` redirect in the cards page. Merged-lesson aliases still work.
- Daily curricula keep their day order and task ids (only the lesson refs changed), so day progress is unchanged.
- Tests: `tests/lesson-alias.test.ts` (old refs and step keys resolve to the same title and step, task ids round-trip, anchors and slugs), `tests/lesson-refs.test.ts` (numbers read in order; every "Lesson x.y", /learn link, anchor, goal, learn path, curriculum, business hub, store check, 12-week plan, stage map, card deck and email ref resolves).

**Generated files:** curricula and glossary (`build_curriculum.py`), `stages.md` (`plain_layer.py --stages` only), `course.md` (`build_course_doc.ts`); `plain_layer.py` keys and guide targets updated; `build_guides.py` not re-run (no lesson refs in it).

**Checks (26 Oct 2026):** `npm ci` ok; `next typegen` ok; `tsc` clean; `npm run lint` 0 errors (same 5 old warnings); `npm test` 51 files, 370 passed and 1 skipped (after merging the daily-email PR from main); `npm run build` ok; `check_links.py` ok; all 29 card JSON files parse. Local production build: `/`, `/learn` (Start here, Attract, Convert, Grow), modules 1, 8, 9, 11, 13, 16, 22 and 30, new card decks 11.8 and 9.3 all 200; `/learn/07-meta-ads` and `/learn/22-shopify-store-setup` 308 to `08-meta-ads` and `13-shopify-store-setup`; `/learn/07-meta-ads/cards/7.14` 308 to `/learn/08-meta-ads/cards/8.1`; `/learn/07-meta-ads#lesson-714-find-your-way-around-ads-manager` lands on Lesson 8.1 in a browser.

## Website brand sweep and Helix example names (20 Oct 2026)

Owner asks: same no-third-party-brand rule on the website and app as the course; made-up example brands get a Helix name; non-profits named only as a source come out unless they set the rule or are a safety resource.

**Branding rule (updated 26 Oct 2026):** third-party brands may be named only as founder success-story examples, and only these five, in the daily founder-story emails (`src/lib/email/sequence.ts`): Spanx (Sara Blakely), Nike (Phil Knight, Bill Bowerman, Blue Ribbon Sports as part of Nike's story), Gymshark (Ben Francis), Glossier (Emily Weiss, Into The Gloss) and Patagonia (Yvon Chouinard). The other three stories stay generic. Everything else below still applies.

**Third-party names removed or made generic**
- Daily founder-story emails (`src/lib/email/sequence.ts`): the 8 stories no longer name brands or people (26 Oct 2026: five restored, see the branding rule above) (Spanx/Sara Blakely, Nike/Phil Knight/Bill Bowerman/Blue Ribbon Sports, Gymshark/Ben Francis/Pizza Hut, Under Armour/Kevin Plank, Warby Parker, Bombas/David Heath/Randy Goldberg, Glossier/Emily Weiss/Into The Gloss, Patagonia/Yvon Chouinard). Same facts, now "one founder", "a gym clothing brand" etc.; subjects, previews and titles stay unique. Sources stay in `docs/email-sequence-sources.md` (internal).
- Trends feed (`src/lib/seed/trends.ts`): news-site sources Storyboard18, Adgully and ChannelX replaced by official pages (Meta for Developers: partnership ads; Meta for Developers: product videos in catalog ads; TikTok Ads help: automated keywords for search ads). Unverified figures (19% / 13%) and the in-app checkout claim dropped. `docs/product-design.md` table matched (also dropped thekeyword.co and enrichlabs.ai).
- Daily form: "Pinterest, Snapchat and other ad accounts" -> "Pinterest and other ad accounts".
- Learn path video titles (our copy): dropped "| The Unofficial Shopify Podcast" and "with Taylor Holiday".

**Kept on purpose:** Stripe on billing, terms, privacy and support text (Helix's own payment processor / sub-processor); legal sub-processor lists; Helix's AI disclosure (Gemini via Vercel AI Gateway); vendor names in store-check detection regexes (never shown; the store check shows kinds of apps); crawler names in `robots.ts`; "Copilot triggers" in SOPs (Helix's own copilot); "Clarity" (a Helix Score area); "Canvas Cap" (a product); infrastructure names in engineering docs and `docs/pricing.md` (internal); test fixtures.

**Non-profits**
- Removed: W3C (Lesson 9.3 contrast step now says "at least WCAG AA, which is 4.5 to 1 for normal text" and links web.dev); Streamlined Sales Tax (Lesson 26.3 now cites the Illinois Department of Revenue bulletin FY 2026-12 for the dropped 200-sales test, next to California CDTFA); Cornell LII (3 links: 47 CFR 64.1200 in Lesson 10.10 and SOP 13, 16 CFR 233.1 in SOP 15, now ecfr.gov).
- Kept: auDA (Lesson 22.2 states the .com.au eligibility rule auDA sets); Beyond Blue, Lifeline, Small Business Debt Helpline, 988 Suicide and Crisis Lifeline, Samaritans (founder wellbeing safety resources, Lesson 28.7).

**Made-up names renamed to Helix names**
- "Acme Linen Shirt, Men's, Relaxed Fit, Sand" -> "Helix Linen Shirt, ..." (Lesson 8.2 and card 08).
- Meta mock accounts "Linen Co. AU/US (mock)", "Linen Co. (mock page)", "linenco.mock", "Linen Co. Pixel (mock)" -> "Helix Linen ..." (`src/lib/meta/mock.ts`).
- Members group demo rows (`src/lib/fb-group/store.ts`): petalandpine.com, okaforgoods.com, saltandsage.co, trailcoffee.com, ruizceramics.com, patelprints.com -> helixflowers / helixgoods / helixspice / helixcoffee / helixceramics / helixprints `.example` (people's first names kept).
- Store check title tip: "Brand: Linen bedding made in Portugal" -> "Helix Linen: Linen bedding made in Portugal".
- Home page morning view label: "Example store" -> "Example store: Helix Linen".
- Guide drawings (hand-edited SVG text, `build_guides.py` source updated but not re-run): "Ad account: Your Store", "Your Brand", "Your Brand Ads", "Your Brand Pixel", "My store pixel", "My store products", "Your Facebook Page · Your Instagram", "https://yourstore.com", "YOURBRAND" -> Helix Linen equivalents (helixlinen.example, @helixlinen, HELIX LINEN).
- Not renamed: instruction placeholders "hello@yourbrand.com" and "[Brand]" in flow templates (they tell the owner to use their own brand), test fixtures ("Linen Co" in `tests/site-audit.test.ts`), people's names, places, generic products. No PNG images carried a made-up brand.

**Checks:** `npm test` 49 files, 350 tests passed; `tsc` clean; `npm run lint` 0 errors (5 old warnings); `npm run build` ok; `check_links.py` ok; card JSON and guide SVGs parse.

## Second fact-check and no-third-party-branding pass (19 Oct 2026)

Owner asks: fact check everything, keep the past-customer cap consistent, and no third-party branding in content (generic advice; platforms Helix teaches or connects to, government bodies and laws stay named). Six groups (A to F) checked the course, then one integration pass.

**Per-group key fixes**
- **A (modules 1 to 5, SOPs 01 to 04, 12, 16):** 3.4 ACCC countdown-timer case ($15m penalty, bedding seller, [2026] FCA 493); 2.5 Meta frequency definition; 5.13 "six" options now "several"; 4.9 creator gift disclosure (FTC); SOPs 01, 02, 04, 16 now match what the app does (read-only Shopify, Monday-only scorecard email, no reviews, inbox or A/B integration); rules of thumb labelled.
- **B (Meta and creators):** cap made consistent (below); 7.16 catalog ads naming, Facebook & Instagram is a sales channel not an app, Commerce Manager match rate, rule of thumb; 7.15; 20.1; 20.2 Advertising settings path; 20.3 no separate Advantage+ vs manual choice; 20.5 Purchase event; 19.6 partnership ads claim softened; 19.4 UK ASA; an unsupported compound-plan claim removed.
- **C (Google, CRO, channels, Shopify setup):** Google exclusion lists and Keyword Planner paths; new-customer acquisition wording; seasonality adjustment "up to"; Shopify spam protection, web performance reports, funnel naming; 16px rule of thumb; BXGY source; Meta checkout moved mid-2025 plus the Shopify Facebook & Instagram channel setup; TikTok Shop regions; agentic storefronts; policy names; Bogus Gateway; tax-inclusive default per country; LCP 2.5 s; SOP 09 brand budget aligned and Helix capabilities corrected; SOP 11.
- **D (email, SMS, list growth, promotions, social):** WhatsApp pricing changes from 1 Oct 2026; 10.12 Customer cohort analysis report; US quiet hours cite the law; email click benchmarks now rules of thumb; NY/FL $5,000 giveaway registration; 13.6 cap; 13.7 dip softened; 13.13 MER direction; TikTok bio link softened; SOPs 13 to 15 match the product; ACCC link fixed.
- **E (modules 14, 15, 23 to 26, SOP 17):** 14.12 days of inventory remaining; payout business days; duties fee and HS codes; Settings > Taxes and duties; EU EUR 3 temporary duty; UK/EU 14-day cancellation added to 23.5; Shopify app rule on pre-selected charges; Australia Post link; Plus bot protection; 2% rule of thumb; Australia-only rules named.
- **F (modules 17, 27, 28, curricula):** Module 17 uses generic AI tools, adds a data-setting tip and Helix's own AI disclosure; 27/28 Australia-only labels, ABN 47% withholding, W-9, support lines (Samaritans added for the UK), Amazon fees and trademark, rule of thumb; curricula wallets, BNPL and email tools made generic (sources edited, files regenerated); calendar dates verified.

**Past-customer cap, one wording:** "Meta announced in 2025 it is retiring its old past-customer spend cap, so check Ads Manager" (source: Meta for Developers, 3 Jun 2025). Used in 6.4 (Watch out and card 06), 13.6 table, 20.2 (Step 4, Watch out, table, card 20), SOP 05 and the sale builder label (`src/lib/seed/builder.ts`). The only merge conflict (13.6 table row, B vs D) took this wording.

**Brands removed (all groups plus the sweep):** Klaviyo, Omnisend, Mailchimp/Privy/Justuno (store check text), Slack, Stripe/Radar, PayPal, Afterpay, Klarna, Apple Pay, Google Pay (as named wallets), Excel/Numbers/Google Sheets (as advice), Google Drive, Dropbox, Canva, CapCut, Emma Sleep, Microsoft Clarity, WebAIM, Baymard, ChatGPT/OpenAI, Gemini/Perplexity/Copilot (as recommendations), Claude, Xero, QuickBooks, Apple Mail, Outlook, USPS/UPS/FedEx/DHL (as advice), hCaptcha, plus vendor/agency trend sources (Leapbuzz, Roar Digital, Catalog.ai, Common Thread Collective) and two vendor videos (Klaviyo Academy, HubSpot) in the learn path.

**Sweep (integration pass):** app copy (plans, FAQ, features, actionable, email and integrations pages, personal plan, key metrics, profit setup, guides, calendar button, numbers export), the store check (now names kinds of apps, e.g. "an email sign-up tool", "express wallets", "buy now pay later"; detection code unchanged), trends feed (sources now Meta, Google and Shopify help pages; "ads in ChatGPT" and "brief creators for Q4" dropped, no official source), payments guide drawing (hand-edited SVG text; `build_guides.py` updated but not re-run, because re-running repaints every guide in the old palette), metrics tracker (`build_tracker.py` re-run), curricula and email doc regenerated from their sources, Lesson 22 payment link now Shopify's third-party providers page, internal docs (pricing, product design, audit engine, MVP plan, README, llms.txt). Kept on purpose: Helix's own AI disclosure (Gemini 2.5 Flash-Lite via Vercel AI Gateway), legal sub-processor lists (Privacy, Terms), infrastructure notes in engineering docs (Vercel, Resend, Neon), Google Sheets import (a real Helix integration), crawler names in robots.ts, vendor names inside detection regexes and test fixtures, "Copilot triggers" (Helix's own copilot). News-site sources (Storyboard18, Adgully, ChannelX) remain on three trend cards.

**Consistency:** SOP 06 and the compound plan judged ads on "last 4 days"; the app reads Meta's last 7 days, so both now say CPP and frequency over 7 days, plus Lesson 6.12's 3-day and month-to-date MER check before scaling. Lead time is "from placing the order with your supplier (usually when you pay the deposit)" in 14.9, its card and the glossary. STATUS 13.7 dip now matches the lesson's rule of thumb.

**GST/VAT double deduction (real bug, fixed):** Shopify defines Gross sales as product price x quantity "before taxes" (Finances and Sales report definitions; Total sales = gross sales - discounts - returns + taxes + shipping, so tax is only added at Total sales). Helix tells people to type or import Gross sales, but the country default ("auto", on for AU, NZ, UK, EU and others) divided every day's sales by 1 + rate again, so typed sales and profit were about 9 to 20% too low. Order prices from the Shopify sync (`totalLineItemsPriceSet`) and the Subtotal of an orders export do include tax in a tax-inclusive store. Fix: "auto" now strips tax only from days whose sales come from order prices (`shopify` sync, new `csv-orders` source for orders exports); an explicit Yes still strips every day, No strips none. Typing sales over a synced day makes it a typed day. Settings, Today, Your numbers and the daily form hints, Lessons 22 and 26 and their cards updated. Tests in `tests/tax.test.ts`.

**Could not verify:** Shopify does not document gross sales for tax-inclusive stores in words (the fix relies on the "before taxes" definition and the Total sales formula); Click Frenzy 2026 date; whether Meta's creator marketplace is now called "Creator Marketing Hub"; three news-site trend sources (not official pages).

**Owner items**
- Calendar: when adding a 2031 lunar entry, Ramadan has a second start in 2030 (about late December), so add the second date then.
- Click Frenzy date unverified; check the official site before the November nudge.
- Meta creator marketplace may have been renamed "Creator Marketing Hub"; check Meta Business Help before relying on the old name.

## Audit follow-ups fixed (17 Oct 2026, Sydney)

The follow-ups listed under "Needs Sid (from this audit)" below, fixed on the same branch (PR #1).

- **Social images re-rendered with corrected text.** The repo can re-render: `docs/social/v3/src/render.py` (posts built from `data.py`) and new `docs/social/render_html.py` (from the saved `html/` page; v2 posts 8 to 57 come from `facebook/src/posts_data.py`, which lives only on the build box). Paths are now repo-relative; `CHROME` and `SOCIAL_WEBFONTS=1` (loads the three Google Fonts) let it run on a Mac. A re-render of unchanged posts matched the committed images apart from font anti-aliasing.
  - **Correction (Sid checked Meta):** v2 post 4 was published on Facebook on Tue 13 Oct 2026 at 19:43, when "45 days" to Black Friday was correct. The "should say 41" finding came from the planned date in `schedule.csv` (17 Oct), not the real one. The repo's caption, video, still, `samples/` copy, contact sheet and `src/data.py` tile are back to 45 days, and `schedule.csv` / `schedule.md` now show the real date. Tonight's 17 Oct post ("Test in October. Sell in November") has no countdown.
  - Posting dates re-checked. The repo only records the planned dates (`v2/schedule.csv`, one a day from 15 Oct; v3 one a day from 3 Dec per this file). The real Meta order differs (time-sensitive v2 posts moved first), so only date-dependent text was judged against a date. v2 #47 is among the 21 posts the routine books for 13 Nov to 2 Dec, in planned order, so it lands around 29 to 30 Nov. That is mid-BFCM, so "during" fits; confirm the real date on Meta. v3-48 is the only v3 post whose text depends on its date (planned 19 Jan 2027). v3-25, 29, 33 and 49 were accuracy fixes that are right on any date.
  - v2 post 47 (29 Nov): "especially before BFCM" -> "especially during BFCM".
  - v3-25: "Find buyers from 3+ months ago" -> "Find subscribers who last bought 3+ months ago" (marketing email needs consent).
  - v3-29: "only if you really sold it at that price" -> "only if you really charged it for a fair stretch, recently" (ACCC, FTC 16 CFR 233).
  - v3-33: Step 3 now "Let them be honest, and say it was a gift" (https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers).
  - v3-49: "= about 4 a day" -> "= 3 to 4 a day" (100 a month is 3.3 a day).
  - v3-48 posts 19 Jan 2027 (v3 starts 3 Dec, one a day), so "January is closer than it looks" with a 1 Jan tile was out of date. Now "February is closer than it looks", "Plan February now", tile FEB 1 Mon (1 Feb 2027 is a Monday), list and caption updated. Alternative: move it to early December and restore the January text.
  - Contact sheets updated with the new thumbnails.
- **AI no-training is now enforced, and the promise says exactly what is true.** Helix calls Gemini 2.5 Flash-Lite through the Vercel AI Gateway (not an AI Studio key and not a direct Vertex project). Every call now sets `providerOptions.gateway.disallowPromptTraining: true` (`gatewayOptions` in `src/lib/ai/config.ts`): the gateway only routes to providers that do not train on prompts and fails the call otherwise (Helix then shows its standard advice). It is free on all gateway plans (https://vercel.com/docs/ai-gateway/security-and-compliance/disallow-prompt-training). Both Gemini providers on the gateway qualify: Google (Gemini API paid terms: "Google doesn't use your prompts ... or responses to improve our products", prompts logged for a limited time for abuse checks and legal reasons, https://ai.google.dev/gemini-api/terms, last modified 28 Apr 2026) and Google Vertex AI. Unpaid AI Studio use may be used for training and human review (same terms), and the filter is not enforced on BYOK keys, so never add a free-tier key as BYOK. Stricter option, not turned on: zero data retention (per request free, team-wide $0.10 per 1,000 requests, Pro and Enterprise only, https://vercel.com/docs/ai-gateway/security-and-compliance/zdr). FAQ, Privacy (with both links) and Terms updated; `LEGAL_UPDATED` is 17 October 2026. Test added.
- **CAN-SPAM postal address.** Every marketing email footer (HTML and text) shows `BUSINESS_POSTAL_ADDRESS` after "E-commerce Helix" (`src/lib/email/postal.ts`, `templates.ts`). Unset: nothing is shown and one warning is logged per server instance. Transactional emails are unchanged. Documented in README and `.env.example`. `BUSINESS_POSTAL_ADDRESS` is intentionally not set (owner decision), so the footer shows no address. Source: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business.
  - Also found: the live seasonal nudge emails (Mondays, `NUDGES_LIVE=1`) went to every user with no unsubscribe link and ignored email preferences. They now respect the "Big sale dates" preference, carry a one-click unsubscribe link and List-Unsubscribe headers, and the postal address (`src/lib/nudges.ts`, `api/cron/seasonal-nudges`).
- **Growing track: Lessons 7.14 and 7.13 now come before 20.3.** New Day 38 "Find your way around Ads Manager" (7.14, before tracking, audiences and the build, which all happen in Ads Manager) and Day 42 "Get your first campaign ready" (7.13 Steps 1 to 3: pixel check, budget, 3 to 5 ads; the build itself is Day 43, Lesson 20.3). Each says experienced advertisers can skim and mark it done. The track is now 66 days (stage 4 is Days 27 to 48). Saved progress is kept: each Growing day now has a fixed task id in `curriculum.json` (`id`; the new days are `day-65` and `day-66`), `dayTaskId` maps day number to it, `progress.ts` maps ids back to days, and the drawings for a day are keyed by task id. Copy that said 64 days updated (track card, audience page, README, docs). Tests added.
- Checks: `npm test` (47 files, 336 tests), `npm run lint` (0 errors; 5 old warnings in files not touched), `npm run build` passed.

## Fact-check and flow audit (16 to 17 Oct 2026)

Every factual claim in the 30 playbook modules, their card decks (`docs/cards`), the 18 SOPs, the daily curricula, the course goals, the site and app copy, legal pages, glossary, `llms.txt` and the social captions was checked against official sources. Wrong or out-of-date facts were fixed, unverifiable claims were softened to "rule of thumb" or removed, and no new statistics were invented. Lesson headings, refs and step counts are unchanged except where noted, so saved progress still counts.

**Needs Sid (from this audit)** (17 Oct: social images, AI training, postal address and the Growing track order are fixed, see "Audit follow-ups fixed" above; what is left is in "Needs Sid" at the top)
- ~~**Social v2 post 4 (17 Oct 19:00):** "45 days" should say 41.~~ Wrong, corrected 17 Oct: post 4 was published on Facebook on Tue 13 Oct 2026 at 19:43 Sydney, when 45 days was right (13 Oct to 27 Nov). This note used the planned date in `schedule.csv` (17 Oct). Caption, image and video are back to "45 days".
- **Other posts with text baked into images** (captions fixed in the repo, images not re-rendered): v2 #47 (29 Nov, "before BFCM" -> "during"), v3-25 (win-back "to subscribers"), v3-29 (a "was" price must be charged for a fair time recently), v3-33 (gifted creators should say it was a gift), v3-49 ("3 to 4 a day"), v3-48 (19 Jan "January is closer than it looks": move to early December or drop).
- **AI training claim:** the FAQ promises the AI never trains on user data. `src/lib/ai/service.ts` does not set the AI Gateway's no-training option. Consider `providerOptions.gateway` zero-data-retention / disallow prompt training.
- **Country wording:** commit 6b2842c made lessons country-neutral ("Outside the US:"). Where a rule only applies in Australia (GST $75,000, BAS, .com.au, ACCC refunds, ReportCyber, SMS Sender ID Register, import declarations), the text now names Australia, because "outside the US" was factually wrong.
- **Course logic, not changed:** the Growing track never assigns Lessons 7.13 and 7.14, which Lesson 20.3 asks you to do first.

**Product accuracy fixes (copy matched to what the code does)**
- Shopify was "coming soon" in plans, FAQ, features, `llms.txt` and emails; it is live read-only on paid plans. Google Ads is "coming soon"; TikTok and Klaviyo are not connected. README pricing table now matches `plans.ts` (one-off store check on Free, 50/150 AI write-ups, flows are ready-to-paste copy).
- Lesson 17.5 and `llms.txt` said Helix uses no AI; it uses Gemini 2.5 Flash-Lite via the Vercel AI Gateway for three writing features (`src/lib/ai/config.ts`).
- Copy that promised Helix sets up email flows, edits the store, changes live budgets or builds Google drafts now says Helix writes copy to paste, flags and suggests, or that Google is coming soon (home page, guides, features, compound plan, the Google setup days in the curriculum, example weekly report).
- Black Friday plan is from 1 August (about 17 weeks), not "12 weeks". Prime Day 2026 ran 23 to 26 June, so "Mid-July deal days" is now "Mid-year deal days" with known dates (https://9to5mac.com/2026/06/02/amazon-prime-day-2026-dates-announced). EOFY event labelled "(Australia)".
- **Sales definition:** the daily form said type Shopify "Total sales", but Helix treats that box as gross sales and subtracts discounts and refunds. Shopify's Total sales = net sales + shipping + duties + taxes, so discounts were double counted and shipping and tax added. The form, key metrics and Today hint now say Gross sales column; the spreadsheet tracker (no discount column) says Net sales; both note that Shopify's columns already leave tax out.
- Weekly report reminder preview now reflects `NUDGES_LIVE`; push is labelled coming soon.
- Deleting an account now also revokes Shopify and Google Ads (was Meta only). Data deletion page updated. Privacy and terms list contact-form data, the members group list, product emails and the store-check reads; `LEGAL_UPDATED` is 16 October 2026.
- Shopify custom app token help: Shopify stopped new admin custom apps on 1 Jan 2026 (https://help.shopify.com/en/manual/apps/working-with-apps); now labelled for older stores only.
- Benchmarks made consistent: add to cart about 6%+, conversion 2%+ solid (many 1 to 3%), CTR 1.2%+ strong; ROAS and CPA ratings use the same 1.2x / 0.85x lines as the dashboard. MER is defined everywhere as ad spend / sales (%), with a note that many tools show sales / ad spend (30% = about 3.3x).

**Platform facts corrected (sources)**
- Shopify: AU Basic card rate 1.7% + 30c, US 2.9% + 30c (https://www.shopify.com/au/pricing); Basic A$56/month; Horizon is the default theme; Metafields path; store launch via Online Store > Private/Public (https://help.shopify.com/en/manual/online-store/themes/password-page); Markets moved out of Settings (Markets > Catalogs); Shop Pay Installments is US, Canada and UK only (https://help.shopify.com/en/manual/payments/shop-pay-installments); report names (New vs returning customers, Total sales by billing location, Conversion rate over time); profit reports not on every plan.
- Meta: no separate Advantage+ vs Manual sales campaign (Advantage+ is on by default and turns off when you narrow settings, https://www.facebook.com/business/help/830005979993164); cost cap is now "Cost per result goal", an average (…/1619591734742116); scheduling works with daily budgets (…/1381935425400769); learning ends after about 50 results in the week after a significant edit (…/112167992830700); attribution is 1 or 7 days after a click and 1 day after a view or engage-through, compared via "Compare attribution models" (…/460276478298895); Advantage+ creative "Enhancements" path; hook rate is a custom metric; Audience segments under Advertising settings; Meta removed the 10 to 20% existing-customer cap; Shops checkout moved to the merchant website by Aug 2025; spending limit covers lifetime spend (…/203321833042958).
- Google: GA4 linked via Tools > Data manager (https://support.google.com/google-ads/answer/7519537); Merchant Center "Needs attention" replaces Diagnostics (https://support.google.com/merchants/answer/12568804); PMax has search terms and channel reports and accepts negatives (https://support.google.com/google-ads/answer/16451273); seasonality adjustments cover the sale dates, best for 1 to 7 days (https://support.google.com/google-ads/answer/10369906); Demand Gen includes Shorts and Display (https://support.google.com/google-ads/answer/13695777); pinning lowers ad strength; "Local" campaigns are now PMax with store goals (https://support.google.com/google-ads/answer/11576060); GA4 report paths; meta descriptions have no fixed limit (https://developers.google.com/search/docs/appearance/snippet).
- TikTok: "Complete payment" renamed "Purchase" (https://ads.tiktok.com/help/article/how-to-adopt-tiktoks-updated-standard-events); TikTok Shop ads are GMV Max only (https://ads.tiktok.com/help/article/gmv-max-migration-tiktok-shop-ads) and TikTok Shop is not in Australia; TikTok One replaced Creator Marketplace (https://ads.tiktok.com/help/article/how-creators-can-upgrade-to-tiktok-one). CSV import now detects TikTok exports with either column name.
- Pinterest: start with Consideration, Sales at about 50 conversions a week (https://help.pinterest.com/en/business/article/performance-plus).
- Email and SMS: Gmail/Yahoo bulk sender rules (https://support.google.com/a/answer/81126, https://senders.yahooinc.com/best-practices/); Klaviyo 2026 click benchmarks (https://www.klaviyo.com/products/email-marketing/benchmarks), open rates now a rule of thumb; Spam Act unsubscribe within 5 working days (https://www.acma.gov.au/avoid-sending-spam) and CAN-SPAM 10 business days; ACMA SMS Sender ID Register, unregistered IDs show "Unverified" from 1 July 2026 (https://www.acma.gov.au/sms-sender-id-register); WhatsApp per-message pricing since 1 July 2025 (https://developers.facebook.com/docs/whatsapp/pricing/); Facebook promotions must not require sharing or tagging (https://www.facebook.com/policies_center/pages_groups_events).
- Consumer law: "was" prices must be genuine and recent (ACCC two-price guide, FTC 16 CFR 233 https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-233, EU 30-day rule); Emma Sleep $15m penalty example; FTC fake reviews rule (https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials); FTC Mail Order Rule (https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule); drip pricing must be in the total price; influencer gift disclosure (https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers).
- Payments: chargeback fee refunded on Shopify Payments if you win (https://help.shopify.com/en/manual/payments/chargebacks/chargeback-process); Visa VAMP merchant line 1.5% from April 2026 and Mastercard thresholds (https://help.shopify.com/en/manual/payments/chargebacks/monitoring-programs); 3D Secure only when the bank asks; Baymard 70% abandonment and 40% extra costs (https://baymard.com/lists/cart-abandonment-rate); Core Web Vitals (https://web.dev/articles/vitals).
- Tax: Canada C$30,000 only applies to stock held in Canada (https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/find-out-need-register.html); US de minimis suspended since 29 Aug 2025 and repealed from 1 July 2027 (https://www.cbp.gov/trade/basic-import-export/e-commerce/faqs); EU €3 duty per item type from 1 July 2026 (https://commission.europa.eu/news-and-media/news/ensuring-fairness-and-safety-eur3-customs-duty-low-value-parcels-2026-06-29_en); states dropping the 200-transaction test; 1099-K $20,000 and 200 payments (https://www.irs.gov/businesses/understanding-your-form-1099-k); 1099-NEC $2,000 (https://www.irs.gov/instructions/i1099mec); Form 5472 for foreign-owned US companies; US record keeping 3 years; super guarantee 12% and Payday Super link (https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee); Malaysia removed from the VAT defaults (it has SST); France's Mother's Day Pentecost rule.
- Confirmed unchanged: GST $75,000 and 21 days, BAS dates, NZ$60,000 at 15%, A$1,000 import GST, UK £135, IOSS €150, BFCM 27/30 Nov 2026, AU cubic weight, 7 to 21 day chargeback response.

**Flow fixes**
- Lesson 20.1 reordered so you install and connect tracking before checking it, with one test order (11 steps still; its cards reordered too). 4.4 pillar names unified; 14.4 now a 13-week weekly forecast like the app's cash tool; 6.4 and 7.15 cost-goal wording match; 7 "raise daily" vs "hold 10 to 14 days" contradiction removed; 30.4 vs 30.5 sale-day advice aligned; 13.12 sale count matches 13.1; wrong counts fixed (16.6, 17.4, 15.4, 13.4, 20.12); self-check answers added to Module 29.
- Card decks that the app ignored because their step count did not match now match: 4.4, 22.12, 28.1, 28.7 (and new decks for 22.18). Lessons still without a deck use the automatic one: 2.8, 3.11, 5.18, 5.19, 9.18, 9.19, 10.14, 14.10, 14.11 and Module 30.
- Daily curriculum: two broken refs (merged lessons 16.5, 22.14) repointed; "Just starting" no longer edits pages before the store exists; Google search-words step moved after Google setup; screen names match the app. First-100-visits goal now runs 7.14, 7.1, 7.13 (setup before launch, 7.4 repeat dropped). `stages.md`, `course.md`, curricula and glossary regenerated. Words-to-know boxes updated for the 13 glossary terms that changed.
- `scripts/plain_layer.py` pointed at the removed Lesson 22.14 and crashed; fixed. Note: its stored plain-words text is older than the lessons, so do not re-run its `main()` without first syncing it.

**Functional fixes**
- Lesson tables no longer push lesson pages sideways on phones (Modules 11, 19, 21). Stock page no longer scrolls sideways on phones. Connect > Upload a CSV pointed at a missing `#import` anchor. `tests/payments.test.ts` failed unless Stripe keys were in the shell; the test now sets them itself.

**Checks:** `npm test` 331 passed, `tsc` clean, `npm run lint` 0 errors (5 old warnings), `npm run build` ok, `check_links.py` ok, all card JSON valid, originality check against the private research: 0 shared 8-word runs, 0 close paraphrases. Headless Chrome at 375px: 75 public pages and 316 signed-in pages crawled with no console errors, no broken links or anchors, no sideways scroll; demo sign-in, onboarding, Today quick update, card decks and the contact form fields checked (no message sent).

**Could not verify (softened or left labelled):** Shopify US Basic price (US page did not load; third-party US$39), Meta pages that block fetching (partnership ad path, ad account moves, currency change), Click Frenzy 2026 dates, Klaviyo open rates, US sweepstakes bond rules, Neon region, "not registered for GST" (business fact).

## Store check safety and stages rebuild (20 Oct 2026)
- **Store check address safety tightened:** the check now verifies the IP address at the moment it connects (so a site cannot pass the check and then switch its DNS to a private address), on every redirect hop. Redirects to non-http(s) schemes, odd ports, localhost or private, loopback and link-local addresses are refused. IPv6 forms that wrap a private IPv4 address (e.g. `::127.0.0.1`, 6to4, NAT64, Teredo) are now blocked too. New tests cover these.
- **stages.md rebuild fixed:** `scripts/plain_layer.py` crashed on modules 29 and 30 (they have hand-written plain-words boxes). It now keeps those boxes, and `python3 scripts/plain_layer.py --stages` rebuilds only `docs/playbook/stages.md` without touching module files (a full run would undo recent hand edits in modules 9 to 28, so use `--stages`). stages.md was already up to date.

## Sale maths, list health and cash lessons (17 Oct 2026)
- **5 new lessons (309 in total), in our own words, slotted into the guided path, each with a card deck and "I'm lost" lines:** 13.13 Work out your sale numbers before you pick the discount; 10.16 Wake up your quieter subscribers before a big sale; 10.17 Do your customers come back? Plan around it (Grow tag); 7.16 Catalog ads; 14.12 Count the days your cash is stuck. Lesson-count test now at least 309.
- **Past-customer spend cap reworded** in 20.2, its card and the sale builder label. Now one wording everywhere (19 Oct): "Meta announced in 2025 it is retiring its old past-customer spend cap, so check Ads Manager" (Meta for Developers, 3 Jun 2025). 13.6 now has a table of who each sale campaign leaves out.
- **13.7 extended:** the post-sale dip (as a rule of thumb, it takes back some of the extra sales, not all of them), wait 7 days before final numbers, and what to run next (2 new steps + cards).
- **Small adds:** 10.1 sign-up reward and form rules; 9.10 free-gift tiers; 6.12 traffic-light colour rules; 20.5 which TikTok goal to use when; 8.2 put key words in the first 70 characters of feed titles.
- stages.md regenerated (it was also behind on some earlier lessons).
- **Merged with the fact-check audit (PR #1, 19 Oct):** 20.2 keeps the "check Ads Manager" wording above, and its Watch out and card now say Meta announced in 2025 it is retiring the old existing-customer budget cap (Meta for Developers source from the audit, as in SOP 05), so exclude customer audiences to keep past buyers out.

## Teen course videos and next steps (17 Oct 2026)

- **Course:** 22 chapters (Intro + lessons 01-95). Every video now opens with a hook and ends with a cliffhanger into the next one (`build/hooks.py`). Chapter openers follow "In this chapter we'll learn to X. Let's get started." then a simple real-world story.
- **Look and voice:** cream-paper sketch style with stick figures, soft music only, no sound effects, fewer zooms (simple scene cuts). Narrator is Brad. Intro animation v5 approved; a more realistic Brad take (v6) is next.
- **Voice runs locally** on Sid's Mac; no paid GPU spend without Sid's OK.
- **17 Oct update:** the teen course is now the Intro plus 103 lessons (8 new, including 'Ad Ideas People Remember'), each with a 'Did you know?' retail founder-story card before the cliffhanger (104 checked facts). The videos need re-rendering and re-voicing. App lessons now total 309 (commit dcaa7d1).
- **Paused:** work stopped on 16 Oct when Grok Bot usage ran out; resumes when usage is added.
- **Coverage:** 18 high-priority untranscribed videos picked for Sid to record (about 75 min); public research fills the rest.
- **Also in progress (separate courses):** share market course (29 chapters, fact-checked) and a kids open-source AI course.

## Independent coverage check (15 Oct 2026, late evening)
- Re-checked every private research video and transcript one by one (1,115 + 386 = 1,501 items; private matrix kept outside the repo). Before: 1,110 covered, 23 partial, 3 gaps, 365 out of scope (intros, admin, partner listings, tool walkthroughs, coaching-only material). After: 1,136 covered, 0 partial, 0 gaps.
- 321 items have no transcript or local video; they were judged from their titles only and are listed in the private report for a separate check.
- **7 new lessons (304 in total), in our own words, slotted into the guided path:** 5.20 Tell a short story in an ad; 5.21 Borrow what is already popular; 5.22 Make simple ads with free apps; 7.15 Cost caps, bid caps and value rules (Grow tag); 10.15 Ask shoppers what they want, then use the answers; 12.11 Start a YouTube channel that keeps selling; 20.13 Read Google Analytics in 15 minutes. Each has a simple card deck with "I'm lost" lines. Lesson-count test now at least 304.

## Leftovers (20 Oct 2026)

- **Lasting limits across servers:** two new additive tables, applied to Neon before the push: `RateHit` (one row per hit, keyed by a hashed IP or hashed email, never the raw value) and `Lease` (short locks). The signed-out and signed-in contact form now allows 5 messages per 10 minutes per hashed IP and per email on every server; members also keep the 5-an-hour audit-log limit. The store check is one at a time per user across servers (2-minute lease, taken over if a server dies). Code in `src/lib/limits.ts`, tests in `tests/limits.test.ts`. The audit log could not be reused for signed-out visitors because every row needs a user.
- Site-wide search keywords no longer include "e-commerce coach app".
- J1 (Today's next card vs /dashboard/cards): not reproduced with a fresh demo account; both read the same `userCards()`.
- Vercel production env (checked 20 Oct): `AUTH_SECRET`, `CRON_SECRET`, `FACEBOOK_GROUP_URL` present (used as the fallback for `FB_GROUP_URL`, which is not set). `WINS_MODERATORS` is missing, so /admin/community and the Wins wall have no owner yet.

## Spacing pass and members group workflow (16 Oct 2026)

- **Spacing:** shared tokens in `src/app/globals.css` (`--space-eyebrow`, `--space-lead`, `--space-lead-underlined`, `--space-block`, `--space-section`, `--space-page`, `--space-card`; tighter on phones) used as Tailwind `mt-eyebrow`, `mt-lead`, `mt-lead-ul`, `mt-block`, `py-section`, `pt-page`, `p-card`, plus `page-title` / `page-lead` and `PageHero` / `PageHeader` in `src/components/ui`. Taglines under an underlined heading get more room everywhere. The repeated "About" eyebrow is gone. Lesson pages no longer scroll sideways on phones. Screenshots in `/workspace/reports/helix/spacing-1016/` on the build box.
- **About:** new "The real secret?" paragraph after "You are the owner."
- **Members Facebook group:** when someone starts (or restarts) a paid plan, Stripe's webhook sends them a "join our community" email once per subscription (skipped if `FB_GROUP_URL` / `FACEBOOK_GROUP_URL` is unset), shows the group link on Plan and billing, and puts them on "to approve" (off "to remove"). When paid ends, people who were let in go on "to remove". Lists are events in the existing audit log (no schema change).
- Owner email to support@astryks.com every day at 9am Sydney (`/api/cron/community-digest`, only when something new is waiting): To approve and To remove, one signed 7-day button per person (marks done, then opens the group's member requests or a member search), plus Open dashboard. Links are signed with `AUTH_SECRET`.
- `/admin/community` (owners in `WINS_MODERATORS`): tabs Pending approval, To remove, Done with counts and search; Copy name, Open in Facebook, Mark done and bulk Mark selected done.

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
- Google Sheets refresh: linked sheets re-import every morning (`/api/cron/sheets-sync`, 18:45 UTC).

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
- Social v2 (`docs/social/v2`: schedule.csv, schedule.md, manifest.csv, contact sheet, statics, animated MP4s, all small enough for the repo; the source pack is also at `/workspace/reports/helix/social-v2` on the build box): post 1 published 15 Oct. 28 posts are scheduled daily at 19:00 Sydney on Instagram and Facebook through 12 Nov, with the time-sensitive Black Friday, Cyber Monday, Christmas and gift posts moved first. The remaining 21 (posts 26-28, 30-32, 37-50; 13 Nov to 2 Dec) are booked by Product's daily routine (10:17 AM Sydney), which books each post once it falls inside Meta's 29-day scheduling limit, at 19:00 Sydney on Instagram and Facebook.
- Private Facebook group **E-commerce Helix Members**: https://www.facebook.com/groups/1313305624157403/ . Page is admin, membership questions set, cover added, 6 starter posts with the Welcome post pinned. `FACEBOOK_GROUP_URL` set in Vercel (Production and Preview). Assets in `docs/social/fb-group` (cover, posts.md, images).
- Social v3 (`docs/social/v3`, 50 new posts, 17 animated): ready, no approval needed (Sid, 15 Oct). Product's daily routine books them after v2, starting 3 Dec, one a day at 19:00 Sydney on Instagram and Facebook.

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
- **Google Ads** (`src/lib/google-ads`, `/api/google-ads/{connect,callback}`, cron `/api/cron/google-ads-sync` 19:15 UTC). Per-user OAuth (adwords scope, offline), refresh token encrypted, account picker, daily GAQL 30-day campaign report into Scorecard `adGoogle`/`googleRevenue` (ROAS by channel, MER), snapshot table on Connections. "Build a paused Google Search campaign" goes through Approvals; only on Approve does Helix create a budget + Search campaign with `status: PAUSED` (guarded by `assertPaused`). API v25. Needs `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN` with Basic Access (docs/google-ads-setup.md). **Status (13 Oct):** OAuth client set; API Explorer access under review; developer token pending; OAuth consent-screen verification needs a demo video. Still shows coming soon until the developer token is set. *(27 Oct update: No longer required: Google sunset developer tokens on 9 Sep 2026; Helix is live with just `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` (an existing token is still sent but optional).)*
- **AI layer** (`src/lib/ai`, `src/app/dashboard/ai-actions.ts`, `AiBox`). AI SDK v7 through the Vercel AI Gateway, model `google/gemini-2.5-flash-lite`, 400 max output tokens. Store-check summary (Insights), ad copy drafts (Campaigns → Build), "I'm lost" help (Today and /dashboard/help). Caps per month: Free 3, Starter 50, Growth 150; cached answers do not count. Usage logged in `AiUsage`, cache in `AiCache`. Global kill-switch `AI_MONTHLY_BUDGET_USD` (default 25) and `AI_DISABLED=1`. Falls back to rule-based text on any failure. Auth is Vercel OIDC on deployments; needs AI Gateway credits on the team (docs/ai-setup.md). **Status (13 Oct, ~9:50 PM Sydney):** live. Card added, free credit active; a test call to `google/gemini-2.5-flash-lite` with the project's OIDC token returned a response with no credit error.
- Spend safety: Meta and Google campaigns are only created paused, only after Approve.
- Copy: plans (Shopify and Google marked coming soon, AI allowances), pricing security panel, Connections security panel, terms, privacy (Shopify, Google Ads, Vercel AI Gateway and the model provider added as processors).
- Schema (additive, applied to Neon before push): tables ShopifyConnection, GoogleAdsConnection, GoogleAdsSnapshot, GoogleAdsDraft, AiUsage, AiCache; column ProductSale.source.

**Not done / next:** see "Not built yet / needs Sid" at the top (27 Oct: order webhooks, Google ad groups/keywords/ads, GA4 and TikTok built behind flags).

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
| Meta (Facebook and Instagram ads) | Live in production for app testers: connect, encrypted tokens, daily sync, paused drafts, audit log | Business Verification and App Review so every store can connect (`docs/meta-setup.md`) |
| Stripe billing | Live in production (Checkout, webhook, portal; Starter US$29, Growth US$59) | Sid: one real Starter purchase then refund/cancel; set public business name, support email and logo in Stripe |
| Google sign-in | Built, optional | `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` |
| Shopify | Live, read-only (OAuth, daily sync of orders, sales, discounts, refunds, product cost and stock). Sessions and add to cart are still typed in | Nothing for now; compliance webhooks via the CLI before any App Store listing |
| Google Ads | Built (OAuth, daily sync, paused Search draft); shows "coming soon" until the developer token is approved | Developer token with Basic Access, OAuth consent verification | *(27 Oct update: No longer required: Google sunset developer tokens on 9 Sep 2026; Helix is live with just `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` (an existing token is still sent but optional).)*
| TikTok, Klaviyo | Not connected (TikTok paused by Sid; Klaviyo flows are copy to paste) | API access later |

## Next steps and blockers (in priority order)

_Updated 13 Oct 2026, 10:10 PM Sydney. Pick up here next session._

(Sid's actions are in "Needs Sid" at the top; Meta "Save choice", the Facebook group and the GitHub Support request live there.)

1. **Google Ads (check in a few days).** Built and deployed; shows "coming soon" until the developer token is set. *(27 Oct update: No longer required: Google sunset developer tokens on 9 Sep 2026; Helix is live with just `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` (an existing token is still sent but optional).)*
   - Check Explorer/Basic access status at https://console.cloud.google.com/google/ads-apis/overview?project=astryks (applied 13 Oct, under review). Manager account "E-commerce Helix" 965-774-7394.
   - When approved: copy the developer token into Vercel Production as `GOOGLE_ADS_DEVELOPER_TOKEN` (stdin, never printed), redeploy, test connect with Sid's account. *(27 Oct update: No longer required: Google sunset developer tokens on 9 Sep 2026; Helix is live with just `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` (an existing token is still sent but optional).)*
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
- **Env vars Sid must add** (Vercel, Production and Preview): `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET` (TikTok for Business developer app, redirect URL `https://ecommercehelix.com/api/tiktok/callback`). Already needed/existing: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `META_APP_ID`, `META_APP_SECRET`, `META_CONFIG_ID`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `TOKEN_ENCRYPTION_KEY`, `CRON_SECRET`. Google Sheets needs no keys. *(27 Oct update: No longer required: Google sunset developer tokens on 9 Sep 2026; Helix is live with just `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` (an existing token is still sent but optional).)*

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

## 2026-10-26 (AEDT) — deploy + metrics pass
- Pushed 726bc58 to main. Prod deploy ecommercehelix-id7ck88rw is Ready. Live checks: / is 200, dashboard routes redirect to sign-in, and the email cron returns 401 without auth (nothing sent).
- Metrics: added New customer CAC, Returning customer revenue, Refund rate and Cart abandonment rate tiles. Contribution now shows "You kept $X of every $100". Customers tool adds CAC, CAC payback and LTV:CAC. Stock plan shows Days left. Ratings are Good/Okay/Needs work. See docs/METRICS-AND-SOURCES.md.

## 27 Oct 2026 — coach lifecycle, Klaviyo, TikTok picker, opt-in GA4 (branch helix-live-27oct, not merged)
- Done in code: coach welcome on subscribe (in-app + email, once per sub), 1-3 daily tasks that never repeat yesterday (coach window + daily email), store memory from totals only (connect, store check, profit, nightly cron `coach-learn`).
- Klaviyo (KLAVIYO=1): encrypted private key, revoke deletes everything, nightly `klaviyo-sync` totals into summary, coach and What to fix; help page /dashboard/learn/klaviyo. SQL applied to prod Neon.
- TikTok advertiser picker and GA4 property form on Integrations; "coming soon" when off. GA4 scope only via optional Connect GA4 (`/api/google-ads/connect?ga4=1`).
- Preview flags set (branch helix-live-27oct): HELIX_COACH, KLAVIYO, TIKTOK_ADS, GA4_SESSIONS, SHOPIFY_ORDER_WEBHOOKS = 1.
- BLOCKED: AI Gateway team is free tier (prepaid credits ~$5); free tier refuses the coach models and embedding model. Embed not run. Needs Sid: top up paid credits, or approve free-tier models. Main merge and prod coach flags held.

## Learn paywall (27 Oct 2026, branch helix-learn-paywall-27oct)

- Free (and signed-out) users get 16 full lessons: all 10 Start here profit basics (1.1–1.10, these power the Free plan's course goals), plus a first lesson in each stage: 13.1 Plan before you build (start of Attract), 8.17 Meta ads 101, 8.18 Which channel first, 30.1 Collect your customers' own words, 15.1 Five ways to make an offer stronger, 17.7 After the sale.
- Every other lesson shows a teaser: title, about-how-long, 2–3 "what you'll learn" bullets taken from the lesson's "why" (never the steps), and an "Unlock with Starter" button (/dashboard/billing when signed in, /#pricing when not).
- Starter and Growth (incl. trialing and past_due, which keep their plan via planForStatus) see everything. Canceled/unpaid fall back to Free.
- Enforced on the server: /learn module pages (now dynamic), card decks (/learn/.../cards and /dashboard/cards), Today card preview, "Do it for me" lesson tasks, Learn path pages, and the AI coach (locked lessons give one short insight + unlock pointer only).
- To change which lessons are free, edit ONE file: `src/lib/paywall/free-lessons.ts` (FREE_LESSONS list of lesson refs). Tests in `tests/paywall.test.ts` check the refs exist.
## 27 Oct 2026: email variety and reorder-alert fix (branch helix-email-variety-27oct, not merged, not deployed)
- Root cause of the daily "Reorder Weekend Bundle" email: the tools cron (/api/cron/tools, daily 19:30 UTC) keyed reorder alerts as `reorder-<sku>-<orderBy>`. For an out-of-stock or overdue item `orderBy` is clamped to *today*, so the key changed every day: yesterday's alert was closed as "no longer applies", a new one opened and was emailed (the alerts email send-log key also contained the date). The SKU was the seeded *example* "Weekend Bundle" (BUN-05, onHand 0): example stock was only suppressed while the store had no real numbers, so once real days existed the example item alerted forever.
- Fix: reorder key is per SKU (`reorder-<sku>`); example stock never alerts; a resolved alert reopens instead of duplicating; new `src/lib/email/cooldown.ts` lets each alert key email at most once per 30 days (logged in EmailSent kind `alert-item`, no schema change).
- Daily email: `composeDaily` takes the user's sent history (ToolInput kind `email-history`, last 90 days, no schema change) and never resends a subject, task, P.S. idea or topic; the open lesson-step reminder repeats at most weekly; subjects rotate through several shapes; if there is nothing new it returns null and nothing is sent. Coach tasks already sent are filtered out too.
- Footers: no postal address (daily, alerts, scorecard, winback, seasonal nudges); one-click unsubscribe + preferences links kept.
- Tests: tests/email-variety.test.ts (14-day simulation, nothing-new rule, reorder at most once). Sample: /workspace/reports/helix/email-variety-sample/index.html.
- Open: seasonal-nudges cron (weekly) has no send-log and ignores prefs; removing the postal address conflicts with CAN-SPAM for US recipients.

## Content QA 27 Oct 2026 (branch helix-content-quality-27oct)
Changelog: reports/helix/content-qa-27oct.md (box path /workspace/reports/helix/). New 19.13 (permanent 14.13). 15.7 retitled and rewritten. 28.5 removed (merged into 28.4, stored 17.5→17.4). 7 thin lessons expanded, cards updated, 11.11 date fixed.
**Re-embed after merge (spends about $0.05, needs DATABASE_URL + AI_GATEWAY_API_KEY):** `npx vite-node scripts/coach-embed.ts` (dry run), then `npx vite-node scripts/coach-embed.ts --yes`. Only changed chunks are paid for.
**Follow-up:** Google Ads developer tokens were sunset 9 Sep 2026. Review the GOOGLE_ADS_DEVELOPER_TOKEN requirement in src/lib/google-ads/config.ts and the setup notes above.


**27 Oct:** Google Ads developer token requirement removed (`googleAdsMode` needs only client id + secret; developer token optional header). Resolves the follow-up above.
## Daily scoreboard (branch helix-daily-scoreboard-27oct)
- Today page top: "Did I grow yesterday?" (YES / NOT YET / NO / no data) vs usual same weekday and target; Sales/Costs/Profit in plain English; streak, target hits; quick entry for yesterday (keeps Shopify sales/orders); today's target with own goal; "My plan to grow today" (1-3 tasks from your numbers, uses markDone/TaskCompletion, ids `grow-<rule>-<date>`, no repeat within 6 days).
- History: /dashboard/numbers/history (week/month/year, chart or table, YTD vs last year, last-year entry by month/week or CSV template, CSV export at /api/scoreboard/export).
- Target: 60% average of last 4 same weekdays + 40% last-14-day average, times trend (last 14 vs previous 14, capped at ±10%); if last year's same day exists and ≥14 YoY pairs in last 28 days, blend 25% last-year×YoY growth (clamped 0.5-2x); ×1.05; rounded to $10. Needs 5 days with sales in the last 28, else no target. A custom goal always wins.
- Paywall (server-side in loadScoreboard, actions, export route): Free = yesterday, today's target, current week. Paid = full history, YTD vs LY, last-year entry/import, exports.
- Level hook for Road-to-$100M: `scoreboardProgress(userId)` in src/lib/scoreboard/server.ts returns { targetStreak, bestTargetStreak, targetHits, bests, lastYesterday, growTasksDone, xp } (xp = hits*10 + grow tasks*5 + personal bests*25). Not wired to Progress page (other branch).
- Coach gets `scoreboardCoachLine`; daily email numbers line adds "Today's target: $X in sales." (subjects unchanged).
- Storage: ToolInput kind "scoreboard" (goal + manual periods, totals only). No schema change, no SQL.
- Screenshot-only flag SCOREBOARD_PREVIEW_PAID=true (non-production, demo users only) shows the paid view.
- Shopify history beyond 60 days isn't pulled (would need read_all_orders, not requested); use last-year entry.

## Simple guided mode (branch helix-simple-guide-27oct, 27 Oct 2026)
- Today is now 3 guided steps (Where do you stand? / Did you grow? / What's your plan today?), plus a "Your road to $100M" strip. Everything else is inside "Want to see more?".
- Simple chart (Sales/Profit by Days/Weeks/Months). On Free only days are shown; weeks and months are locked, and that data is not sent to the browser.
- New: PageGuide (what is this page + what next), TextAlert ("Overwhelming text alert!" summary with the full text in a collapsed dropdown), MoreInfo.
- Learn and /learn: a gamified "Your Path" timeline (stages, badges, XP, streak, Next step). Locked lessons are teasers that link to the unlock page.
- Mobile: "I'm lost" sits bottom-left and the coach bottom-right.
- Tests: tests/simple-guide.test.ts.
