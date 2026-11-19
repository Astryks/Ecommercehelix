# Step 3 — The job-by-job agent

Date: 19 Nov 2026 · Branch: `helix-agent-pivot` · Builds on Steps 1–2 (commits `492b8bb`, `5380ea0`, `488c1a6`).

**Headline: the agent can now do the five jobs end-to-end as drafts and
proposals — never as live money moves.** Every job follows the same
contract from the pivot plan (§11): trigger → data in → agent steps (code
first, LLM second) → owner sees/approves → auto vs never auto → guardrail
→ failure case. No Step 4 work (no pricing/wallet/credits changes), no
credentials invented, nothing pushed to GitHub.

## 1. What was built

### 1.1 Ads autonomy ladder — `src/lib/agent/autonomy.ts`

Three modes, per store, default **propose-only**:

| Level | What the agent may do |
|---|---|
| L1 propose-only (default) | Paused drafts + kill/scale proposals as approval cards; owner presses Launch in Ads Manager |
| L2 assisted | Auto-pause losers under the owner-written rule; never auto-spend-up |
| L3 autonomous (opt-in, capped) | Scale winners ≤ +20%/day up to the owner-set daily spend cap |

- **Kill rule, exact:** $50/day × 3 days (~$150 test) — kill on 0 orders or ROAS < 0.7, **after a fair test** (≥3 days since last edit AND ≥1× target CPP spent). Never kill before the learning window ends.
- **The L2 rule, as the owner writes it:** *"Pause any ad with spend ≥ $50 over 3 days, 0 orders, or ROAS < 0.7 → auto-pause + notify + undo."*
- **Every money move** shows its reason, the evidence (spend, revenue, CPA vs the store's own break-even CPA from `profit-setup.ts`), and a **one-tap undo** (revert payload, 7-day window).
- **Blocks, enforced in code:** never-pause list (hero products, brand search); scale blocked when the winner has <14 days of stock; autonomous scaling blocked without a daily cap or when the step would breach it; **stale feed (>24h) → "data unreliable — do not scale"**, no money move proposed (Helena's dead-checkout lesson, encoded).
- **L3 gate:** autonomous mode only after 30 days of L2 with a revert rate under 5% and a daily cap set (`autonomousGate()`).
- **Guardrail unchanged:** `meta/guardrail.ts` still allows only paused drafts and pauses. At L1/L2 a "scale" is instructions for the owner in Ads Manager; the module never calls an ad API and never changes a live budget or bid.
- **Settings:** `/dashboard/settings/agent` (Guardrails page, linked from the Settings hub) — mode, daily cap, max scale step (clamped ≤20%), auto-pauses/day, never-pause list, max concurrent tests (3–6), discount ceiling, per-channel "Let Helix post", never-post list. Stored as a `ToolInput` row (kind `"agent"`, the established no-schema-change pattern), in-memory in demo mode. `parseAgentSettings()` clamps everything; an unknown mode falls back to propose-only.
- **Wiring:** the campaigns page shows the current mode, the kill rule, and one agent decision per row (kill/scale/refresh with reason, block, and whether the agent may do it itself). A "Send to Waiting for your OK" button creates the approval card via `proposeAdDecision` — re-evaluated server-side from live data, never trusted from the form.

### 1.2 Daily metrics — `src/lib/agent/morning.ts` + `/api/cron/morning-brief`

- **7am QA walk** (`qaWalk()`): dead checkout, broken pixel, spend with zero orders, revenue/sessions down >40% vs the same weekday last week, CPA above break-even for 3 days, hero product out of stock, refund spike (>5% over 7 days). Each is an interrupting red-flag card; stale feeds are logged silently.
- **8am scorecard** (`scorecardBrief()`): deterministic maths only — revenue, orders, sessions, spend per channel, contribution, net profit, MER 3-day + MTD vs target, stance, CPA vs break-even. A stale feed makes the profit number carry a **"stale — last synced"** badge, never presented as fresh. "Nothing needs you today" is a valid briefing.
- **Cron:** `/api/cron/morning-brief`, 20:00 UTC = 07:00 Sydney AEDT (same winter-shift caveat as Step 2: runs an hour earlier in local time during AEST). Creates one approval card per interrupting exception, deduped by task id per day. Checkout/pixel health is passed as `null` (unknown) until the site check wires it in — never assumed OK.
- **The 21-field DayInput, replaced field by field** (`DAY_FIELD_SOURCES`): every field names its auto source (Shopify orders, Meta/Google/TikTok APIs, Store Brain per-SKU landed cost, fee %). Manual entry survives only where there is no source: revenue + orders when Shopify is not connected, per-channel spend when that channel is not connected, `adOther` / `otherMarketing` (optional). `fieldsStillManual()` computes exactly what the owner is still asked for.

### 1.3 Stock and cash — `src/lib/agent/stock-plan.ts`

- **Reorder list** (`reorderList()`): built on `stock.ts` + `buyPlan()` — SKU, quantity, order-by date, supplier, estimated cost, stock-out date. Velocity based on <7 days of history is labelled **"low confidence — promo week"** and the quantity is shown as a range.
- **Scale-blocking check** (`scaleBlockedByStock()`): a winner under 14 days of stock gets a "reorder first" card instead of a scale card.
- **Margin-checked offers** (`marginCheck()`): contribution must stay ≥15%; below that the card shows red and cannot be approved without a logged owner override. Default to bundle/gift over discount.
- **13-week cash forecast** (`cashForecast()`): wraps the existing `cashPlan()` and lists its assumptions in plain words (opening balance, floor, sales source, ad %, stock orders, fixed costs, tax due). Draft only.
- **Never auto:** ordering stock, contacting a supplier, changing a price. The stock page banner was also fixed: it said "Shopify stock and sales sync is coming" — Step 2 made it real, and the page now says so and that Helix never orders stock.

### 1.4 Email flows — `src/lib/agent/email-flows.ts`

- All **9 flows** from `docs/email-automation.md` (copy + timing already in `src/lib/seed/flows.json`): welcome, abandoned checkout, abandoned cart, browse abandonment, post-purchase, review request, replenishment, win-back, VIP/loyalty.
- **Eligibility:** replenishment only for consumables, VIP only once there are repeat buyers (unknown = eligible, never assumed ineligible).
- **Writing-rule validation** (`validateFlow()`): subjects under 45 characters, SMS always carries opt-out + a link, welcome incentive in email 1 only, no discount in abandoned-checkout email 1. The shipped copy passes all rules.
- **Approval payload** (`flowApproval()`): full copy, timing, discount logic, estimated cost ($0.110 per docs/pricing.md), and the honest setup mode — **Klaviyo draft** when connected (draft status first, live only after a final check), **copy + timing to paste, labelled as such**, when not. Klaviyo stays drafts-only: no sending, no flow-creation API calls.
- **Wiring:** `doItForMe` now builds flow approvals from `flowApproval()`; the email page shows real Klaviyo live flows + flow revenue when connected, and example-labelled numbers otherwise. "Draft and set up for me" still goes through the approval queue.

### 1.5 Video and social — `src/lib/agent/video-social.ts`

- **Honest answer, encoded:** Helix does not generate film. Draft-only short-form assembly: real product media + real UGC + generated scripts.
- **Video brief** (`buildVideoBrief()`): 3 variants, 9:16, one variable different per variant, hook in the first 3 seconds (from the 20-openings rule / review phrases, never invented). Blocked when the hero SKU has <14 days of stock. Supervisor checks: banned words, claims, discount ceiling, price accuracy. No UGC with permission → photo-only variants flagged "needs creator clip".
- **Auto-post:** off by default. Per-channel "Let Helix post" opt-in with a per-day cap (default 1). **Price / promotion posts always need approval**, even with auto-post on. The never-post list blocks matching drafts.
- **Platform limits, documented in code:** Instagram scheduled publish; TikTok **draft-inbox** (Content Posting API needs app review; posts may land as private/draft — "draft in TikTok inbox, owner taps post"); Pinterest Pin; YouTube Shorts draft/private. Any channel without a working authorised API gets a **manual upload packet** (video + caption + cover frame) — never presented as auto-posted.

## 2. Files changed

| File | Change |
|---|---|
| `src/lib/agent/autonomy.ts` (new) | Ladder, kill rule, fair test, scale/stock/cap/stale blocks, revert payloads, L3 gate, settings parsing |
| `src/lib/agent/morning.ts` (new) | QA walk, scorecard brief, 21-field DayInput source table |
| `src/lib/agent/stock-plan.ts` (new) | Reorder list, scale block, margin check, cash forecast |
| `src/lib/agent/email-flows.ts` (new) | Flow eligibility, writing-rule validation, approval payloads |
| `src/lib/agent/video-social.ts` (new) | Video briefs, auto-post rules, platform limits, manual packet |
| `src/lib/agent/settings.ts` (new) | Agent settings persistence (ToolInput kind `"agent"`, in-memory in demo mode) |
| `src/app/dashboard/settings/agent/page.tsx` (new) | Guardrails page |
| `src/app/api/cron/morning-brief/route.ts` (new) | 7am QA + 8am scorecard cron |
| `src/app/dashboard/actions.ts` | `saveAgentSettingsAction`, `proposeAdDecision`, flow approvals via `flowApproval()` |
| `src/app/dashboard/campaigns/page.tsx` | Mode banner + per-row agent decision + approval button |
| `src/app/dashboard/email/page.tsx` | Real Klaviyo status/revenue when connected; draft/live/not-set-up states; eligibility + setup-mode notes |
| `src/app/dashboard/stock/page.tsx` | Banner copy fixed (Shopify sync is real since Step 2; Helix never orders stock) |
| `src/components/dashboard/SettingsHub.tsx` | Guardrails link |
| `vercel.json` | `morning-brief` cron, 20:00 UTC (07:00 AEDT) |
| `tests/agent-*.test.ts` (new, 5 files) | 44 tests |
| `docs/pivot/step-3-jobs.md` (this file) | Record |

## 3. Verification (this sandbox)

- `npx vitest run`: **570 passed, 5 failed, 2 skipped** (526 baseline + 44 new). The 5 failures are the pre-existing ones in `tests/payments.test.ts` / `tests/fb-group.test.ts` / `tests/limits.test.ts`, all from the missing `@prisma/client` — identical to the Step 1/2 baseline.
- `npx tsc --noEmit`: **86 errors, identical to the clean-tree baseline** (verified by `git stash` comparison; two errors introduced during the work — a missing `getDays`/`getSettings` import in `actions.ts` — were found by this check and fixed).
- `next build` / `next dev` and any DB-backed path could **not** be smoke-tested here: Prisma client generation fails in this sandbox (npm registry ECONNRESET / `@prisma/engines` postinstall failure, same as Steps 1–2). Live verification needs a machine/Vercel deploy with a database.
- Two test failures during the work were fixed in the code, not the tests: the scale approval card did not state the proposed budget in its detail, and the video block message casing was inconsistent.

## 4. What each job does end-to-end (summary)

| Job | Trigger | Owner approves | Never auto-runs |
|---|---|---|---|
| Ads ladder | Daily 05:30 pull; 08:00 scorecard | Kill/scale/refresh cards; L2 rule itself; L3 opt-in + cap | Live budget/bid changes; launching; pausing a never-pause campaign; scaling a low-stock winner; any move on a stale feed |
| Daily metrics | 05:00/05:30 pulls; 07:00 QA; 08:00 scorecard | Red-flag cards; the 2 fields asked only when unconnected | Nothing — the briefing is read-only; stale numbers are badged, never faked |
| Stock/cash | Daily inventory pull; `stock-ads` rule; Monday review | Reorder list; offer cards (≥15% contribution, else logged override) | Ordering stock, contacting suppliers, changing prices |
| Email flows | Daily Klaviyo pull; `email-gap` rule | Full flow (copy, timing, discount logic) in the approval queue | Sending; going live (draft first, final check) |
| Video/social | Tuesday creative day; `fatigue` rule; launch; owner tap | Thumbnail grid, script, caption, channels — Approve / Edit / Regenerate / Skip | Publishing (default); price/promo posts; anything on the never-post list; posting on a channel without a working API (manual packet instead) |

## 5. What remains blocked for Step 4/5

- **Step 4 (pricing/wallet/credits):** not started. The per-action costs in the approval cards ($0.006 card, $0.110 flow draft) are the docs/pricing.md figures, but there is no credit ledger, no weekly-expiry logic, and no reserve-then-charge — the two monthly counters (AI write-ups, Coach messages) are still separate.
- **Live verification:** no `next build` / `next dev` / DB smoke test possible in this sandbox (Prisma client cannot be generated). Needs a machine or Vercel deploy with `DATABASE_URL`.
- **Sid-only items (unchanged from Step 2):** Meta app review (`META_PUBLIC=1`), Google Ads OAuth client, Shopify `read_all_orders` + app credentials, TikTok app approval, `KLAVIYO=1` + per-store keys, AI Gateway key + embedding job, `CRON_SECRET` (the morning-brief cron returns 401 without it).
- **Known gaps, not papered over:** checkout/pixel health is `null` (unknown) in the morning cron until the site check wires it in; per-campaign stock blocking uses `null` on the campaigns page (the SKU is not known per campaign there — it applies on Today/Stock); Google search-term rows still not pulled (`search-term-waste` stays suppressed); PageSpeed and social presence pulls still do not exist; TikTok campaign rows still do not exist (daily spend only); video assembly itself (template renderer + TTS) is specified, not built — briefs and drafts are real, rendered video files are not.
- Nothing was pushed to GitHub (local commits only, same as Steps 1–2).
