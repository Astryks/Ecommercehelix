# Step 5 — Verification and handover

Date: 19 Nov 2026 · Branch: `helix-agent-pivot` · Base: `0754e27` · Steps 1–4 commits: `492b8bb`, `5380ea0`, `488c1a6`, `130f17d`, `3e5cbd8`

**Headline: the pivot build is complete and verified as far as this sandbox allows — and the limit of that verification is stated plainly below. Nothing was pushed to GitHub. The product is not live yet: it still needs a real machine (or Vercel deploy) to run, a database migration, Sid's credentials, and one pricing decision.**

## 1. What was built, step by step

### Step 1 — One agent-led Today screen, coach on by default (`492b8bb`, 11 files, +390/−472)
- `src/app/dashboard/page.tsx` cut from a 46-page maze to one screen: `AgentScorecard` (yesterday revenue/orders/estimated profit, profit vs 7-day average, MER 3-day + MTD vs target), `AgentTasks` (max 3 tasks, each with area, time estimate, one-line reason tied to a number, **Do it for me / I'll do it / Skip**), one learning card.
- Deterministic stance in `src/lib/today.ts` (no LLM): Push / Careful push / Hold / Defend / Not enough data from 3-day vs month-to-date MER against target.
- Coach on by default in `src/lib/coach/config.ts` — `coachEnabled()` true unless `HELIX_COACH=0` (kill switch preserved; the old `HELIX_COACH=1` + `HELIX_COACH_PROD=1` double gate is gone).
- Store Brain surfaced on Today (`StoreBrainPanel.tsx`): CoachMemory facts grouped by kind, add/edit (max 240 chars)/delete one/delete everything, via server actions in `src/app/dashboard/actions.ts` + `src/lib/repo.ts`.
- Approvals page: every Do-it-for-me task routes to `/dashboard/approvals` with what changes, why, expected money effect, Approve / Edit / Skip.

### Step 2 — Real syncs feed Today/Insights; example data is demo-only (`488c1a6`, 10 files, +611/−69)
- The sync workers (Shopify, Meta, Google Ads, TikTok, Klaviyo) were already real; Step 2 fixed the downstream plumbing: Insights now runs the 17 audit rules on real signals (`src/lib/signals.ts`, `src/lib/signal-coverage.ts`) instead of `EXAMPLE_SIGNALS`; new real accounts are no longer seeded with 730 days of example scorecard data; campaigns page shows real rows (Google/TikTok made-up rows removed); Shopify stock sync now **creates** stock items for synced SKUs the user doesn't track yet.
- Rule enforced: a real user never sees made-up numbers as their own. Demo users (`demo-*` ids) keep example data, always labelled EXAMPLE. A real user with nothing connected sees "Not connected yet" with the exact connect step.
- Gaps left open on purpose (see §6): Shopify sessions/ATC/checkout not collected (so `atc-high-checkout-low` and `mobile-gap` rules stay suppressed for real users); order history capped at 60 days without `read_all_orders`; TikTok has no campaign pull.
- Full inventory in `docs/pivot/step-2-sync-inventory.md`.

### Step 3 — The job-by-job agent (`130f17d`, 20 files, +1731/−17)
- Ads autonomy ladder (`src/lib/agent/autonomy.ts`): L1 propose-only (default), L2 assisted (auto-pause losers under the owner's written rule), L3 autonomous opt-in (scale winners ≤ +20%/day up to owner-set daily cap). Kill rule: $50/day × 3 days (~$150), kill on 0 orders or ROAS < 0.7, only after a fair test (≥3 days since last edit AND ≥1× target CPP spent). L3 gate: 30 days of L2 with revert rate under 5% + daily cap set. Blocks enforced: never-pause list, scale blocked under 14 days of stock, stale feed (>24h) → "data unreliable — do not scale".
- Daily metrics (`src/lib/agent/morning.ts` + `/api/cron/morning-brief`, 07:00 Sydney): 7am QA walk (dead checkout, broken pixel, spend with zero orders, revenue/sessions down >40% vs same weekday last week, CPA above break-even 3 days, hero out of stock, refund spike >5%/7 days) and 8am deterministic scorecard. Stale feeds get a "stale — last synced" badge, never presented as fresh. The 21-field DayInput is replaced field by field (`DAY_FIELD_SOURCES`); manual entry survives only where no source exists.
- Stock and cash (`src/lib/agent/stock-plan.ts`): reorder list with order-by dates, margin-checked offers (contribution must stay ≥15%, red card + logged owner override below), 13-week cash forecast with assumptions listed. Never auto-orders stock, never contacts a supplier, never changes a price.
- Email flows (`src/lib/agent/email-flows.ts`): all 9 flows from `docs/email-automation.md`, Klaviyo drafts-only — no sending, no flow-creation API calls; otherwise copy-to-paste.
- Video/social (`src/lib/agent/video-social.ts`): per-channel capability (Instagram scheduled publish via Graph API, YouTube draft/private by default, TikTok manual packet where not authorised), "Let Helix post" per channel, never-post list. Rendered video files are **not** built — scripts/briefs/captions only (see §6).
- Settings: `/dashboard/settings/agent` — mode, daily cap, max scale step (clamped ≤20%), auto-pauses/day, never-pause list, max tests (3–6), discount ceiling, per-channel posting. Stored as a `ToolInput` row (kind `"agent"`), in-memory in demo mode.
- Full spec in `docs/pivot/step-3-jobs.md`.

### Step 4 — Pricing wallet + weekly-expiring credits, margin guards (`3e5cbd8`, 20 files, +2643/−3)
- One shared credit pool, 1 credit = $0.01 provider cost: Free 60 credits/month hard-capped ($0.60), Starter 60/week, Growth 180/week with 1-week grace, inside monthly ceilings $3.00/$8.00. Actions need BOTH a count left (write-ups Free 3 / Starter 50 / Growth 150; coach messages 20 / 300 / 800, deep 0 / 40 / 100 — counts unchanged) AND credits left. The two global kill-switches ($25/month generic AI, $50/month coach) kept as separate second layers.
- `src/lib/pricing/`: `costs.ts` (per-action buffered cost × 100 = credits; PAYG pack $10 = 100 credits, 7 days; agent add-on +$29/mo, +120/week), `cost-guard.ts` (guarantees 1–9: pre-flight estimate, reserve-then-charge, bucket order free → allowance → wallet, hard caps, weekly expiry, downgrade-before-stopping for free only, no silent upgrades, abuse predicates, margin aggregation + 80%-in-first-half alert), `allowance.ts`, `store.ts` (ledger, buckets, usage events, top-ups $10/$25/$50, PAYG purchase, refunds of unused balance only, auto top-up off by default), `server.ts` (Billing + margin views).
- Stripe: `?topup=10|25|50` and `?payg=1` Checkout sessions; webhook credits the wallet / grants the PAYG pack **only** in `checkout.session.completed` with `mode === "payment"`; `claimEvent()` dedupes replays.
- Margin proof (from `docs/pricing.md` §4, recomputed in code): Starter 78%/75% nominal/worst, Growth 76%/72%, PAYG 84%, agent add-on 77%, wallet top-ups 44–47% (a payment rail, not a pack — 2x markup minus Stripe fee). Free worst realistic month $0.38 vs $0.60 hard cap.
- One bug found by the tests and fixed in code: `settleReservation()` released the unused wallet hold but never returned released allowance credits to their buckets.
- Prisma: new models `WalletLedger`, `CreditBucket`, `UsageEvent` in `prisma/schema.prisma` — **no migration file exists yet** (see §4).
- Full spec in `docs/pivot/step-4-pricing.md`. **Open decision: §5 below.**

## 2. Verification results (Step 5, this step)

Run in this sandbox on 19 Nov 2026. All counts exact.

| Check | Pivot branch (`helix-agent-pivot` @ `3e5cbd8`) | Clean-tree baseline (`0754e27`, separate worktree) | Verdict |
|---|---|---|---|
| Full vitest suite | **630 passed, 5 failed, 2 skipped** (637 total; 76 files, 3 failed) | **514 passed, 5 failed, 2 skipped** (521 total; 65 files, 3 failed) | ✅ +116 new tests, same 5 failures |
| Failing tests | `tests/fb-group.test.ts`, `tests/limits.test.ts`, `tests/payments.test.ts` (5 Stripe webhook tests) — all fail at `src/lib/db.ts:1` with `Cannot find package '@prisma/client'` | Identical 5 failures, same files, same cause | ✅ Pre-existing, not a regression |
| `npx tsc --noEmit` | **86 errors** | **86 errors** | ✅ Identical count; spot-checked files overlap (11 in `src/lib/repo.ts`, 10 in `src/lib/coach/server.ts` — both pre-existing patterns) |
| ESLint on all 50 files changed across Steps 1–4 | **0 errors, 0 warnings** | — | ✅ Clean |
| Touched suites re-run (`agent-today`, `coach`, `signal-coverage`, `agent-autonomy`, `agent-morning`, `agent-stock-plan`, `agent-email-flows`, `agent-video-social`, `pricing-allowance`, `pricing-cost-guard`, `pricing-costs`, `pricing-store`, `demo-auth`) | **159 passed, 0 failed** (13 files) | — | ✅ |

### What could NOT be verified here (sandbox limits — do not retry in this sandbox)
- `npm install`: attempted once, fails with `ECONNRESET` (npm registry unreachable from this sandbox). Not retried.
- `npx prisma generate`: fails — `@prisma/engines` missing (`MODULE_NOT_FOUND` from `node_modules/prisma/build/index.js`), a consequence of the failed install. Not retried.
- Consequence: `@prisma/client` is absent, so `next build`, `next dev`, and every DB-backed path (including the 5 failing tests above) cannot be smoke-tested here. Tests are the verification route in this sandbox; a real render/DB check needs a normal machine or a Vercel deploy (§4).

## 3. Audit findings (Step 5)

Checked across the whole pivot branch (`git diff 0754e27..HEAD`, 50 changed `.ts`/`.tsx` files).

| # | Check | Finding |
|---|---|---|
| 1 | Live spend / budget change without approval | **None found.** `src/lib/meta/guardrail.ts` still allows only PAUSED creation and pauses (`assertWriteAllowed` throws otherwise). At L1/L2 a "scale" is instructions for the owner in Ads Manager — `autonomy.ts` never calls an ad API and never changes a live budget or bid. Approvals page copy states it explicitly. L2 auto-pause and L3 auto-scale are opt-in, capped, and gated (L3 needs 30 days of L2 + revert rate <5% + daily cap). |
| 2 | Fake/demo data shown to real users as real | **None found.** Demo users get `EXAMPLE_SIGNALS` with `demo: true`; real users get "Not connected yet" / suppressed rules where data is missing. Stale feeds are badged "stale — last synced". Demo top-ups are recorded as demo credit, labelled as such. |
| 3 | Invented credentials / hardcoded secrets | **None found.** Diff grep for API keys, passwords and private-key blocks returned nothing. `.env.example` contains key *names* only. All credentials come from env vars. |
| 4 | Pricing figures contradicting `docs/pricing.md` | **One deliberate, documented deviation** — the Step 4 unification: the two counters (write-ups + coach messages) now share one pool, so maxing out *both* maxima is no longer possible; each ceiling is still individually reachable. Stated on Billing and in `step-4-pricing.md` §1, not hidden. One internal inconsistency in the source doc was reconciled in code (Stripe fee split: 2.9% + $0.30 one-off, +0.7% Billing on subscriptions) and documented. |
| 5 | Step 1–4 scope items left half-done | **One:** the new Prisma models have no migration file (no `prisma/migrations/` directory exists at all) — migration must be created on a real machine (§4). Everything else in the step docs is implemented and tested. No `TODO`/`FIXME`/`XXX`/`HACK` markers in the new-code diff. |
| 6 | Email sends / social posts without approval | **None.** Email is Klaviyo drafts-only or copy-to-paste; no sending. Social posting is draft/scheduled-publish only where the channel is authorised, gated by per-channel "Let Helix post" and the never-post list; YouTube defaults to draft/private. |
| 7 | Margin safety | Cost-guard enforces reserve-then-charge, bucket order, hard caps, weekly expiry, and the margin dashboard alerts at 80% of allowance in the first half of the month. Worst-case Growth weekly burn was modelled in Step 4 at $10.14 provider against the $59 plan (72% margin). |

## 4. How to run it locally (normal machine)

```bash
git clone https://github.com/Astryks/Ecommercehelix.git
cd Ecommercehelix
git checkout helix-agent-pivot   # after the branch is pushed — see note below
npm install
npx prisma generate
npx prisma migrate dev --name pricing-wallet   # NEW: creates the migration for WalletLedger, CreditBucket, UsageEvent (no migration file exists yet)
npm run dev
```

**Push note:** this branch exists only in `~/workspace/ecommercehelix` on this machine. It has never been pushed. To get it to GitHub, from that copy run `git push -u origin helix-agent-pivot` (needs Sid's GitHub access), or copy the folder to a machine with access and push from there.

**Env vars** (copy `.env.example` to `.env` and fill in; every value is a key name only in the repo — no secrets are stored here):

| Var | Needed for |
|---|---|
| `DATABASE_URL` | Postgres (required for anything beyond demo mode) |
| `AI_GATEWAY_API_KEY` | Coach live model calls; without it the coach falls back to keyword search |
| `HELIX_COACH` | Coach on by default; set `HELIX_COACH=0` to kill-switch it off |
| `META_APP_ID`, `META_APP_SECRET`, `META_CONFIG_ID`, `META_PUBLIC=1` | Meta connect/sync/drafts (public only after app review) |
| `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_API_VERSION` | Shopify connect/sync |
| `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET` | Google Ads connect/sync (developer token no longer required since 9 Sep 2026) |
| `TIKTOK_ADS=1`, `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET` | TikTok connect/sync |
| `KLAVIYO=1` | Klaviyo connect (each owner then pastes their own `pk_…` key) |
| `GA4_SESSIONS=1` | GA4 sessions (owner also picks a GA4 property id) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH` | Billing, top-ups, PAYG |
| `CRON_SECRET` | Required by every cron route (401 without it) |
| `SHOPIFY_ORDER_WEBHOOKS` | Order webhooks (off by default) |
| `COURSE_VIDEO_BASE_URL` | Course videos (~14 GB, Vercel Blob, not in git) |

**How to test it (demo mode, no keys needed):** with no env vars the app runs in-memory with a demo login. Sign in as a demo user, open Today — one scorecard strip, stance, max 3 tasks, one learning card, Store Brain panel. Try Do it for me → the card lands in `/dashboard/approvals` (Approve / Edit / Skip). Open `/dashboard/settings/agent` to change the autonomy mode and caps. Open `/dashboard/billing` to see credits, buckets, wallet, PAYG pack, and the margin dashboard at `/dashboard/billing/margin`. Run the checks: `npx vitest run` (expect 630 passed / 5 pre-existing `@prisma/client` failures until `prisma generate` runs) and `npx tsc --noEmit` (expect 86 pre-existing errors — compare against the clean tree, don't chase them).

## 5. How to deploy to Vercel

1. Push the branch (§4 note), open a PR, merge to `main` (or deploy the branch directly as a preview).
2. In Vercel → Project → Settings → Environment Variables, set every var in §4 (at minimum `DATABASE_URL`, `CRON_SECRET`, `AI_GATEWAY_API_KEY`, Stripe keys; the rest unlock features one by one).
3. Set the production Postgres database, then run the Prisma migration against it (`npx prisma migrate deploy`).
4. Cron is declared in `vercel.json` — no separate setup. Key schedules (UTC): Shopify sync `0 18 * * *` (05:00 AEDT), Meta + Google Ads sync `30 18 * * *` (05:30 AEDT), TikTok `45 18 * * *`, Klaviyo `0 19 * * *`, coach-learn `50 19 * * *`, **morning brief `0 20 * * *` (07:00 AEDT)**, site audit `0 17 * * *`, seasonal nudges + Monday scorecard Sundays `0 21 * * *`. Note: Sydney daylight saving shifts these an hour in local time during AEST (see `step-2-sync-inventory.md` §1.7).
5. Verify after deploy: demo login works, Today renders, one cron fires (check the Vercel cron logs), Stripe webhook endpoint is registered and receives `checkout.session.completed`.

## 6. Sid-only checklist to go live

Only Sid can provide these. Each item stays stubbed or gated until it exists (full detail in `step-2-sync-inventory.md` §3).

| # | Item | Until then |
|---|---|---|
| 1 | Meta app review — Advanced Access `ads_read` + `ads_management`, business verification, then `META_PUBLIC=1` | Meta connect works only for app testers |
| 2 | Google Ads OAuth client id + secret | Google Ads connect/sync/paused Search drafts off |
| 3 | Shopify `read_all_orders` scope (Partner dashboard request) | Order history capped at 60 days |
| 4 | Shopify app credentials | Shopify connect shows "coming soon" (custom-app token path still works) |
| 5 | TikTok app approval + `TIKTOK_ADS=1` + keys | TikTok connect/sync off; no campaign pull exists yet even after this |
| 6 | `KLAVIYO=1` | Klaviyo connect returns "coming soon" |
| 7 | `AI_GATEWAY_API_KEY` + embedding job `npx vite-node scripts/coach-embed.ts --yes` | Coach cannot call a live model; RAG falls back to keyword search |
| 8 | GA4 (`GA4_SESSIONS=1`, owner picks property id) — optional | Sessions stay 0; conversion rate cannot be computed |
| 9 | `CRON_SECRET` | Every cron returns 401; no daily sync runs |
| 10 | PageSpeed Insights API key — optional, free | Speed/LCP unknown; `mobile-gap` stays suppressed |
| 11 | Live Stripe test purchase + refund (test mode) | Billing verified in test mode only; webhook round-trip untested live |
| 12 | Course video storage (~14 GB) — Vercel Blob + `COURSE_VIDEO_BASE_URL` | Course videos not served from the repo |
| 13 | **Decide the PAYG vs wallet value gap (§5 below) before launch** | — |

## 7. Open pricing decision — pick before launch

A $10 wallet top-up buys $5.00 of provider cost (**500 credits** at 2x). A $10 PAYG pack buys **100 credits** ($1.00 of provider cost) — 5x less for the same $10, because the pack is priced at $0.10/credit. Both clear the margin tests (PAYG 84%). The page already says "the wallet top-up is better value". Pick one: **(a)** keep it and say so on Billing, **(b)** align PAYG to 500 credits for $10, or **(c)** price PAYG at $0.02/credit (same as (b)). The code prices PAYG from one constant (`PAYG_PACK` in `src/lib/pricing/costs.ts`), so the change is one line plus the Billing copy.

## 8. Known gaps — not yet built

- **Live render / DB verification:** no `next build` / `next dev` / DB smoke test has ever run on this branch (sandbox could not install Prisma). First run on a real machine or Vercel deploy.
- **Checkout / pixel health wiring:** the 7am QA walk passes checkout/pixel health as `null` (unknown) until the site check wires it in — never assumed OK.
- **Per-campaign stock blocking:** scale is blocked when the *hero product* has <14 days of stock; there is no per-campaign, per-SKU stock check yet.
- **Google search-term rows:** search-term waste is detected by rule, but the Google search-terms table is not pulled into the UI.
- **PageSpeed:** no live PageSpeed pull (needs the optional API key, §6 #10).
- **Social pulls:** no scheduled social-presence pull; social-profile audit rules run on stored data only.
- **Rendered video files:** video/social produces scripts, briefs, captions and a posting packet — no rendered video files are generated.
- **Admin role for all-orgs margin view:** `/dashboard/billing/margin` shows the current org only; there is no admin view across all orgs.
- **TikTok campaign pull:** spend sync exists; campaign rows do not.
- **Stripe live round-trip:** top-up/PAYG Checkout + webhook crediting are wired but untested live (test-mode purchase + refund, §6 #11).

## 9. Files changed in Step 5

- `docs/pivot/step-5-handover.md` (this file, new)
- `docs/pivot/ecommerce-helix-full-scope.md` (Build status section added at the top; §1 updated from "in progress" to complete)
