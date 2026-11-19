# Step 4 — Pricing wallet + weekly-expiring credits, margin guards

Date: 19 Nov 2026 · Branch: `helix-agent-pivot` · Builds on Steps 1–3 (commits `492b8bb`, `5380ea0`, `488c1a6`, `130f17d`).

**Headline: Helix now charges for AI against one shared pool, with the
money rules enforced in code — not in good intentions.** Every number comes
from `docs/pricing.md`; nothing was invented. Tier prices $0/$29/$59 are
unchanged. No Step 5 work beyond tests/typecheck. Nothing pushed to GitHub.

## 1. The unified allowance — the two counters, reconciled

Step 3 flagged the problem: Helix had two monthly counters that never met.

| Counter | Before Step 4 | After Step 4 |
|---|---|---|
| AI write-ups (`src/lib/ai/config.ts` `AI_MONTHLY_CAP`) | Free 3 / Starter 50 / Growth 150 calls a month; $25/month global budget (`AI_MONTHLY_BUDGET_USD`) | Same counts, **unchanged**. Now draws from the shared credit pool. |
| Coach messages (`src/lib/coach/config.ts` `COACH_LIMITS`) | Free 20 / Starter 300 / Growth 800, deep 0 / 40 / 100; $50/month global cap (`COACH_MONTHLY_BUDGET_USD`) | Same counts, **unchanged**. Now draws from the shared credit pool. |

**The pool:** 1 credit = $0.01 of provider cost (buffered estimate).
Free 60 credits/month, hard-capped ($0.60). Starter 60 credits/week,
Growth 180 credits/week with 1-week grace — inside monthly ceilings of
$3.00 / $8.00. An action needs BOTH a count left AND credits left.

**What did not change:** the count ceilings, the two global kill-switches
(coach $50/month, generic AI $25/month — kept as separate second layers
because they are business-wide safety nets, not per-user allowances;
merging them would silently change the safety net), the tier prices.

**The one user-visible change (stated in code, on Billing, and here):**
previously the two counters were independent — in theory a Starter user
could max out 300 coach messages AND all 50 write-ups. Now they share one
pool, so heavy use of one leaves less for the other. Each ceiling is still
individually reachable: 300 fast coach messages cost 300 × 0.2 = 60
credits, and the typical Starter mix in `docs/pricing.md` §4 costs $2.48 =
248 credits. Only the combination of both maxima is no longer free — and
that combination cost more than the allowance, which is exactly the loss
the old design allowed.

**Effective month vs monthly ceiling (breakage, stated not hidden):**
weekly expiry means a Starter month is really ~260 credits (60 × 52/12),
not 300 — $2.60 of the $3.00 allowance; Growth is ~780, not 800 — $7.80
of $8.00. The unspendable remainder is the margin cushion.

## 2. What was built

### 2.1 Core — `src/lib/pricing/`

| File | Change |
|---|---|
| `costs.ts` (new) | The cost table: per-action buffered provider cost × 100 = credits, to 1 decimal (charged exactly, not rounded up per action, so the typical months in `docs/pricing.md` §4 still fit). Stripe fee: 2.9% + $0.30 on one-off payments, + 0.7% Billing on subscriptions — the doc's own tables disagree on this point ($0.59 on a $10 top-up vs $1.34 on a $29 subscription) and the split above is what reconciles them. Weekly grants, PAYG pack ($10 = 100 credits, 7 days), agent add-on (+$29/mo, +120/week), and the margin-proof functions. |
| `cost-guard.ts` (new) | Pure enforcement of guarantees 1–9: pre-flight estimate, reserve-then-charge (hold in the ledger, real cost charged, rest released), bucket order (free cap → allowance → wallet), hard caps (deep chats 10/day, audits 3/hour/org, trend adapts 4/day), weekly expiry + Growth grace, Monday–Sunday weeks, downgrade-before-stopping (free only: Tier 1 at 45 credits spent, rules-only at 60), no-silent-upgrades check, abuse predicates (disposable email, unverified email, second free store per domain, anonymous audit without captcha), margin aggregation + the 80%-in-the-first-half alert. |
| `allowance.ts` (new) | `UNIFIED_ALLOWANCE`: the mapping above, count ceilings, effective-monthly maths, and the plain-words unification note shown on Billing. |
| `store.ts` (new) | Pricing state, persisted as a ToolInput row (kind `"pricing"`) with an in-memory map in demo mode — the established Step 2/3 pattern. Wallet ledger (topup/hold/charge/release/refund/payg, capped at 200 entries), credit buckets, usage events (capped at 500), monthly/daily rollover, idempotent weekly grants, top-ups ($10/$25/$50 only), PAYG purchase from wallet or card, refunds of unused balance only, auto top-up (off by default, opt-in, monthly ceiling), approval coverage marks. |
| `server.ts` (new) | `getPricingView()` for Billing (credits + progress bar, buckets, counts, wallet, usage history, ledger, unification note, margin alert) and `marginView()` for the margin dashboard. |

**One bug found by the tests and fixed in the code, not the tests:**
`settleReservation()` released the unused *wallet* hold but never returned
released *allowance* credits to their buckets — a settled action would have
kept the full reservation charged. Released credits now go back to the
buckets they were held from.

### 2.2 Prisma — `prisma/schema.prisma`

New models `WalletLedger`, `CreditBucket`, `UsageEvent` (+ `User` relations),
with the comment that `npx prisma generate` + a migration must run on a
machine with registry access. The runtime ToolInput shape mirrors them.
`UsageEvent` is the unified log (coach + write-ups) the margin dashboard
reads. No change to `Approval` — approval coverage is tracked in pricing
state by task id.

### 2.3 Wiring — the cost guard is now on the real paths

- **`src/lib/ai/service.ts` (`aiText`):** after the existing count gate,
  hard-cap check + reserve (audit → `store-audit`, ad copy/help → `chat`).
  Settles the real token cost after the call; a failed/empty call settles
  $0 and releases the hold (the hold is hoisted out of the `try` so the
  `catch` can release it). Cache hits still cost nothing and do not count.
- **`src/lib/coach/server.ts` (`askCoach`):** reserves the dearest tier the
  question could need before `runCoach`, settles the tier actually used
  afterwards (fast 0.2 / deep 4.2 credits); a limited answer settles $0.
  Memory extraction stays 0 credits (system cost, global $50 cap only).
  The count ceilings inside `runCoach`/`limitGate` are untouched.
- **Approval creation (`src/app/dashboard/actions.ts` `doItForMe`,
  `proposeAdDecision`):** the card's AI cost (its `estAiCost` in provider $)
  is authorised + settled at creation, and the approval is marked covered.
  If the pool cannot cover it, no card is created and the owner is sent to
  Billing (`?uncovered=1`) with a plain-words banner.
- **Executor (`decide`):** before executing an approved action, it checks
  coverage — approvals created by the paths above are already covered;
  older ones are covered here on first execution. If coverage fails, the
  approval stays pending and the owner sees `?unpaid=1`. Execution itself
  costs $0 of AI (no LLM); this only settles the drafting cost.
- **Approvals page:** each card now quotes its cost in credits and the
  bucket that pays ("plan allowance" / "wallet" / "not covered" + the wallet
  price), computed live from pricing state.
- **Billing page:** AI allowance section — progress bar (credits used of
  the monthly cap), weekly grant + buckets with expiry dates, counts left
  (write-ups / coach / deep), wallet balance, top-up ($10/$25/$50),
  PAYG pack ($10 = 100 credits, wallet or card), auto top-up form (opt-in,
  ceiling), recent AI use, unification note, margin alert banner.
  Tier prices and the plan cards are untouched.
- **Billing actions (`billing/actions.ts`):** `topUpWalletAction`,
  `buyPaygAction`, `setAutoTopUpAction`. Demo mode records demo credit,
  labelled as such.
- **Stripe (`src/app/api/checkout/route.ts`, `src/app/api/stripe/webhook/route.ts`):**
  `?topup=10|25|50` and `?payg=1` create one-off Checkout sessions
  (`price_data`, metadata `{userId, kind, amountUsd}`); the webhook credits
  the wallet / grants the PAYG pack **only** in `checkout.session.completed`
  with `mode === "payment"` — never at checkout time. `claimEvent()`
  dedupes webhook retries, so a replayed event cannot credit twice.
- **Margin dashboard (`/dashboard/billing/margin`):** revenue, provider
  cost and margin by plan / feature / store from usage events, with the 80%
  alert. The all-orgs view needs an admin role, which does not exist yet —
  the page shows this org's numbers and says so.

## 3. Margin proof — every pack clears 70% at its cap

Computed by `contributionAtCap()` / `packContribution()` in `costs.ts`
and asserted in `tests/pricing-costs.test.ts` (nominal = 1 credit =
$0.01; worst case = every credit spent on the least efficient action, a
generic chat at $0.013 provider for 1.3 credits).

| Pack | Price | Provider at cap | Contribution | Margin |
|---|---|---|---|---|
| Starter weekly (60/wk) | $29/mo | $2.60 nominal / $3.38 worst | $22.56 / $21.78 | 78% / 75% |
| Growth weekly (180/wk) | $59/mo | $7.80 nominal / $10.14 worst | $44.78 / $42.44 | 76% / 72% |
| PAYG $10 = 100 credits | $10 | $1.00 | $8.41 | 84% |
| Agent add-on +120/wk | +$29/mo | $5.20 | $22.46 | 77% |
| Wallet top-up $10 / $25 / $50 | — | $5.00 / $12.50 / $25.00 | $4.41 / $11.47 / $23.25 | 44% / 46% / 47% |

Wallet top-ups are the one line under 70% — they are a payment rail, not
a pack: the margin is the 2x markup minus the Stripe fee, exactly as
`docs/pricing.md` §4 tables it. Free worst realistic month is $0.38
against the $0.60 hard cap, unchanged.

## 4. The 10 guarantees — where each one lives

| # | Guarantee | Enforcement |
|---|---|---|
| 1 | Pre-flight estimate | `estimate()` in `cost-guard.ts`, called before every LLM call (`aiText`, `askCoach`) and quoted on every approval card. |
| 2 | Reserve, then charge | `authorize()` places the hold (buckets reduced, wallet held in the ledger); `settleReservation()` charges the real cost and releases the rest — including back to buckets (bug fixed above). |
| 3 | Bucket order | `reserve()`: free cap → allowance (oldest-expiring first) → wallet. Refusal returns why + the wallet price. |
| 4 | Hard caps | `hardCapViolation()`: deep chats 10/day, audits 3/hour/org, trend adapts 4/day; max tokens per tier in `HARD_CAPS`. Checked in `aiText`; coach deep caps stay in `limitGate()`. |
| 5 | Downgrade before stopping | `downgradeForFree()`: Tier 1 at 45/60 credits, rules-only at 60. Free only. |
| 6 | No silent upgrades | `tierAffordable()` + the router never moves tier unless the bucket can pay (coach `pickTier` already gates deep on `deepLeft`; the credit pre-check in `askCoach` adds the money gate). |
| 7 | Caching | Unchanged from before: audits cached per URL 7 days, `AiCache` (cache hits cost 0 credits), prompt caching on the SOP + store-context prefix in the coach. |
| 8 | Abuse controls | `abuseCheck()`: disposable-email block, email verification, one free store per domain, captcha on anonymous audits, rate limits via `limits.ts`. |
| 9 | Daily margin dashboard | `marginView()` + `/dashboard/billing/margin`; `marginAlert()` at 80% of allowance in the first half of the month. |
| 10 | Refund-safe | `refundWallet()` refuses anything above unused balance; subscription refunds only for unused time (existing billing code, unchanged). |

## 5. Verification (this sandbox)

- `npx vitest run`: **630 passed, 5 failed, 2 skipped** (570 baseline + 60 new).
  The 5 failures are the pre-existing ones in `tests/payments.test.ts` /
  `tests/fb-group.test.ts` / `tests/limits.test.ts`, all `Cannot find
  package '@prisma/client'` at import — identical to the Step 1–3
  baseline, confirmed by the error text (the webhook edit is not the
  cause: those tests fail before any webhook code runs).
- `npx tsc --noEmit --skipLibCheck`: **86 errors, identical to the clean-tree
  baseline** (verified by `git stash -u` comparison: 86 on the clean tree,
  86 with Step 4). One error introduced during the work — a new `PageProps`
  use in the approvals page — was found by this check and fixed by using an
  inline type instead; the remaining `PageProps` error on the billing page
  is pre-existing (that page already used it).
- `next build` / `next dev` and any DB-backed path could **not** be
  smoke-tested here: Prisma client generation fails in this sandbox (npm
  registry ECONNRESET / `@prisma/engines` postinstall failure, same as
  Steps 1–3). Live verification needs a machine/Vercel deploy with a
  database — including the Stripe top-up/PAYG checkout + webhook round
  trip, and `npx prisma generate` + migration for the three new models.

## 6. Files changed

| File | Change |
|---|---|
| `src/lib/pricing/costs.ts` (new) | Cost table, credit definition, Stripe fees, packs, margin proofs |
| `src/lib/pricing/cost-guard.ts` (new) | Guarantees 1–9, pure |
| `src/lib/pricing/allowance.ts` (new) | Unified allowance mapping + counts |
| `src/lib/pricing/store.ts` (new) | Wallet/buckets/ledger/usage state, ToolInput + demo-memory |
| `src/lib/pricing/server.ts` (new) | Billing view + margin view |
| `prisma/schema.prisma` | `WalletLedger`, `CreditBucket`, `UsageEvent` models |
| `src/lib/ai/service.ts` | Reserve/settle around `aiText`, hold released on failure |
| `src/lib/coach/server.ts` | Credit pre-check + settle in `askCoach` |
| `src/app/dashboard/actions.ts` | Cover cost at approval creation; executor guard in `decide` |
| `src/app/dashboard/approvals/page.tsx` | Per-card credit quote + pays-from; `?unpaid=1` banner |
| `src/app/dashboard/billing/page.tsx` | AI allowance, wallet, top-up, PAYG, auto top-up, usage history |
| `src/app/dashboard/billing/actions.ts` | `topUpWalletAction`, `buyPaygAction`, `setAutoTopUpAction` |
| `src/app/dashboard/billing/margin/page.tsx` (new) | Margin dashboard |
| `src/app/api/checkout/route.ts` | One-off top-up / PAYG Checkout sessions |
| `src/app/api/stripe/webhook/route.ts` | Credit wallet / grant PAYG only on confirmed payment |
| `tests/pricing-*.test.ts` (new, 4 files) | 60 tests |
| `docs/pivot/step-4-pricing.md` (this file) | Record |

## 7. Open decision for Sid — PAYG vs wallet value gap (flagged, not hidden)

A $10 wallet top-up buys $5.00 of provider cost (500 credits at 2x). A
$10 PAYG pack buys 100 credits ($1.00 of provider cost) — 5x less for the
same $10, because the pack is priced at $0.10/credit. Both clear the
margin tests (PAYG 84%), and the pack's premium is the small-pack,
7-day-expiry price — but a customer who compares the two will notice.
Before launch, pick one: (a) keep it and say so on Billing (the page
already says "the wallet top-up is better value"), (b) align PAYG to 500
credits for $10, or (c) price PAYG at $0.02/credit ($10 = 500 credits is
the same as (b)). The code prices PAYG from one constant (`PAYG_PACK`),
so the change is one line plus the Billing copy.

## 8. What remains blocked for Step 5

- **Live verification:** no `next build` / `next dev` / DB smoke test in
  this sandbox. Needs a machine or Vercel deploy with `DATABASE_URL`,
  plus `npx prisma generate` + migration for `WalletLedger`,
  `CreditBucket`, `UsageEvent`.
- **Stripe round trip:** top-up and PAYG Checkout + webhook crediting are
  wired but untested live — needs Stripe test keys, a test payment, and
  the webhook endpoint registered. In demo mode they record labelled demo
  credit only.
- **Sid-only items (unchanged from Step 2):** Meta app review
  (`META_PUBLIC=1`), Google Ads OAuth client, Shopify `read_all_orders` +
  app credentials, TikTok app approval, `KLAVIYO=1` + per-store keys, AI
  Gateway key + embedding job, `CRON_SECRET`.
- **Known gaps, not papered over:** the pricing-state count mirrors
  (`counts.writeUps/coachTotal/coachDeep`) are display mirrors — the
  `AiUsage`/`CoachUsage` tables stay the source of truth for the hard
  count ceilings; the margin dashboard's revenue is the plan price (wallet
  top-ups / PAYG sales are not yet broken out per org); the all-orgs
  margin view needs an admin role; model prices are Oct 2026 list prices
  and must be re-measured from real `usage_events` in the first beta month
  (docs/pricing.md §6: the router reads prices from a config table so
  margins update without a deploy — that config-table read is not built
  yet).
- Nothing was pushed to GitHub (local commits only, same as Steps 1–3).
