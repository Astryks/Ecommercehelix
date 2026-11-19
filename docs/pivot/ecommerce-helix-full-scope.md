# Ecommerce Helix — Full Scope Document

**Product:** ecommercehelix.com — AI Growth Manager for owner-operated Shopify stores
**Companion to:** the web pivot plan *Ecommerce Helix Pivot Plan* (built 19 Nov 2026)
**Repo:** `~/workspace/ecommercehelix` — branch `helix-agent-pivot`, base HEAD `0754e27`
**Date:** 19 November 2026
**Status of this document:** Full scope, in detail. Nothing in the web plan is summarised away here — this is the expanded version, with the build status, the credit/capacity position, every job specified, every price, and the gated execution plan.

> **One-line product:** Helix checks your profit every morning, tells you the one thing that will move it today in plain English, and has already drafted it — paused, margin-checked, and waiting for one tap.

> **All ARR figures** in §9 are company-reported / self-reported run-rate (monthly recurring revenue × 12), **not audited GAAP revenue**, unless stated otherwise. Private companies publish no audited financials. Treat every $100M figure as a dated claim, not a verified fact.

---

## Build status (Step 5 + finishing step, 19 Nov 2026)

All five steps are built and committed locally on branch `helix-agent-pivot` — **nothing has been pushed to GitHub and nothing is deployed**. Step 1: one agent-led Today screen, coach on by default, Store Brain, approvals (`492b8bb`). Step 2: real syncs feed Today/Insights, example data demo-only (`488c1a6`). Step 3: job-by-job agent — ads ladder, morning QA/scorecard, stock/cash, email flows, video/social (`130f17d`). Step 4: pricing wallet + weekly-expiring credits, margin guards (`3e5cbd8`). Step 5: verification + this handover (see `docs/pivot/step-5-handover.md`).

**Finishing step (19 Nov 2026, local commit — not yet pushed):** hand-written Prisma migrations for the pricing wallet + TikTok snapshot (`prisma/migrations/20261119183000_pricing-wallet/`, `.../20261119183001_tiktok-snapshot/`); PAYG aligned to 500 credits (decision made, see below); checkout/pixel health wired into the morning QA; per-campaign stock blocking; PageSpeed pull (key-gated); weekly social-presence pull (Instagram/Facebook via Meta Graph; TikTok profile needs Login Kit); TikTok campaign rows + Google search-term rows; admin all-orgs margin view behind `HELIX_ADMIN_EMAILS`; a real ffmpeg slideshow MP4 renderer from the video brief (verified: 12s / 57KB MP4). Full handover at the top of `STATUS.md`.

Verification: vitest **672 passed / 5 failed / 2 skipped** (clean-tree baseline 630 passed / same 5 failures — the 5 are pre-existing `@prisma/client` missing, not regressions; +42 new tests in the finishing step). `tsc --noEmit` **86 errors, identical to the clean tree**. ESLint on all 50 changed files: **0 errors** (Step 5; re-check before deploy).

**Still unverified:** no `next build` / `next dev` / DB smoke test has ever run on this branch — the sandbox could not install Prisma (`npm install` fails `ECONNRESET`, `prisma generate` fails missing `@prisma/engines`). First render/DB check must happen on a real machine or a Vercel deploy, after `npx prisma migrate deploy` (the two migration files above now exist). Stripe top-up/PAYG round-trip is wired but untested live. **PAYG decision now made:** $10 PAYG pack = 500 credits, same as a $10 wallet top-up (margin at cap $4.41 / 44%); reversible in one constant (`PAYG_PACK` in `src/lib/pricing/costs.ts`).

---

## Contents

1. [What is being built right now — Step 1, in progress](#1-what-is-being-built-right-now--step-1-in-progress)
2. [Credits and capacity — stated plainly](#2-credits-and-capacity--stated-plainly)
3. [The verdict and the product shape](#3-the-verdict-and-the-product-shape)
4. [Diagnosis — what the actual code shows](#4-diagnosis--what-the-actual-code-shows)
5. [The daily operating system](#5-the-daily-operating-system)
6. [Profit maths, the profit ladder and the 17 audit rules](#6-profit-maths-the-profit-ladder-and-the-17-audit-rules)
7. [Agent architecture and Store Brain memory](#7-agent-architecture-and-store-brain-memory)
8. [The 30 modules as agent training](#8-the-30-modules-as-agent-training)
9. [Fast-grower playbooks — what transfers and what does not](#9-fast-grower-playbooks--what-transfers-and-what-does-not)
10. [Full scope, step by step — Steps 1 to 5](#10-full-scope-step-by-step--steps-1-to-5)
11. [Job-by-job specification](#11-job-by-job-specification)
12. [Pricing that never loses money](#12-pricing-that-never-loses-money)
13. [Model recommendation](#13-model-recommendation)
14. [Gated 30 / 60 / 90-day execution plan](#14-gated-306090-day-execution-plan)
15. [Verification — Step 5 in detail](#15-verification--step-5-in-detail)
16. [Risks, blockers and known gaps](#16-risks-blockers-and-known-gaps)
17. [Homepage and go-to-market](#17-homepage-and-go-to-market)
18. [Checklists](#18-checklists)

---
## 1. What is being built right now — Step 1, complete

You asked for **all of it, as a ready product, one step at a time**. All five steps are now built (see Build status above). This section is the live status, not a plan — Step 1 is complete and committed as `492b8bb`.

### 1.1 Where the work lives

| Item | Detail |
|---|---|
| Working copy | `~/workspace/ecommercehelix` (a copy of the GitHub repo `Astryks/Ecommercehelix`) |
| Branch | `helix-agent-pivot` |
| Base commit | `0754e27` — "STATUS: PR #7 merged and live (privacy: coach, Anthropic, Klaviyo)" |
| Push status | **Local commits / local changes only. Nothing has been pushed.** No deploy has been made from this branch. |
| Stack (from the audit) | Next.js 16, React 19, TypeScript, Prisma (53 models), Vercel AI SDK via AI Gateway — no direct Anthropic/OpenAI SDK in the app today |

### 1.2 Step 1 scope — exactly what is changing

**A. Simplified Today agent screen** — `src/app/dashboard/page.tsx` was cut down (Step 1 commit `492b8bb`: 390 insertions / 472 deletions across 11 files) and rebuilt around three new components:

- `src/components/dashboard/AgentScorecard.tsx` (new) — **one scorecard strip**: yesterday's revenue, orders, estimated profit, profit vs the 7-day average, MER (3-day and month-to-date) vs target.
- `src/components/dashboard/AgentTasks.tsx` (new) — **maximum 3 tasks**, each with: area, time estimate, one-line reason tied to a number, **Do it for me / I'll do it / Skip**.
- **One learning card** only — a single trend/tip card, not a library.
- `src/lib/today.ts` — new deterministic stance logic (no LLM):
  - `merPctFor(days)` — MER% = total ad spend ÷ net revenue (revenue − discounts − refunds), ignoring example days; returns `null` when there is no spend or no revenue to judge.
  - `stanceFor(days, today, targetMerPct)` — compares 3-day MER and month-to-date MER against the target and returns one of **Push / Careful push / Hold / Defend / Not enough data**.

| 3-day MER | Month-to-date MER | Stance | Agent behaviour |
|---|---|---|---|
| On target (≤ target) | On target | **Push** | Propose scale (≤20%) + a new test |
| On target | Off target | **Careful push** | Small steps, regular tidy-up, investigate earlier in the month |
| Off target | On target | **Hold** | No budget increases; diagnose what changed in 3 days |
| Off target | Off target | **Defend** | Cut spend up to 20%/day, aggressive optimisation, full diagnosis (SOP 03) |
| No spend/revenue in a window | — | **Not enough data** | Say so. Never invent a stance. |

**B. Coach turned on by default** — `src/lib/coach/config.ts`:

- Before: the coach was **off unless `HELIX_COACH=1`**, and in production it also needed a second explicit switch, `HELIX_COACH_PROD=1`.
- Now: `coachEnabled()` returns true unless `HELIX_COACH=0`. The kill switch is preserved — `HELIX_COACH=0` turns the coach off everywhere.
- `tests/coach.test.ts` updated to match the new default.

**C. CoachMemory / Store Brain wired into Today** — `src/components/dashboard/StoreBrainPanel.tsx` (new), with server actions added in `src/app/dashboard/actions.ts` and `src/lib/repo.ts`:

- Shows the facts Helix remembers for the store, grouped by kind, on the Today screen itself — not hidden in a chat widget.
- Owner can **add** a fact (with a kind), **edit** a fact inline (max 240 characters), **delete** one fact, or **delete everything** ("Delete everything Helix remembers?", with confirmation).
- This is the existing CoachMemory system surfaced properly — see §7. It is **not** a rebuild.

**D. Every "Do it for me" task goes through approvals, as paused drafts only** — `src/app/dashboard/approvals/page.tsx` reworked so that:

- Every do-it-for-me task creates an approval card in `/dashboard/approvals`.
- The executor path stays **paused-only**: campaigns, ad sets and ads are created with status `PAUSED`; pauses are the only live-object change, and only after approval.
- No live budget change, no launch, no unpause is introduced in Step 1. That is a published promise and a code guardrail — see §4.5 and §11, Job 2.

### 1.3 Step 1 acceptance criteria

- [ ] Today shows exactly: one scorecard strip, one stance, max 3 tasks, one learning card — nothing else above the fold.
- [ ] Stance is computed in code from real DayInput data and shows "Not enough data" honestly when a window has no spend/revenue.
- [ ] Coach is on with no env flags set; `HELIX_COACH=0` turns it off (test covers both).
- [ ] Store Brain panel on Today lists, adds, edits and deletes CoachMemory facts, and delete-all works.
- [ ] Every Do-it-for-me button lands in `/dashboard/approvals` as a paused draft; no code path creates an active campaign or changes a live budget.
- [ ] `npx tsc --noEmit` clean, test suite passing, app runs locally — see §15.

### 1.4 What Step 1 does **not** do

Step 1 does not connect live data. The syncs are still stubbed/example (Step 2), the agent cannot yet do the jobs end-to-end (Step 3), the credit ledger is not yet implemented (Step 4), and nothing is deployed. Step 1 is the visible product shape plus the memory and approvals spine that Steps 2–4 plug into.

---
## 2. Credits and capacity — stated plainly

You asked: *"will our current credits be enough for you to do it?"* The answer given in the chat, repeated here so it is on the record:

| Item | Position as of 19 Nov 2026 |
|---|---|
| Muse plan | **Free plan. No subscription.** |
| Usage | **46% of the free weekly limit used** — about half left |
| Reset | **Tuesday 25 November, 4:57pm AEDT** |
| Enough for | **Step 1, and probably part of Step 2** |
| Not enough for | The whole ready product in one run |

**Your two options:**

1. **Pause and resume.** Go step by step on the free limit, pause when it runs low, and pick the work up after the reset (or across several resets). Slower, costs nothing.
2. **Upgrade.** **Power — AUD $31/month.** **Maximum — AUD $149/month.** Either gives materially more room to keep building without stopping.

**Working rule adopted:** build one step at a time, verify it (§15), report what changed and what is blocked, then continue to the next step. No step is reported as done until its acceptance criteria pass.

---

## 3. The verdict and the product shape

### 3.1 Verdict

**Agent-led — yes. Chatbot-led — no.**

Helix today is three products fighting each other: a **course** to learn, a **dashboard** to interpret, and a **checklist** to do. The owner must learn, *then* decide, *then* act. Every fast grower in §9 flips that: the agent learns, decides and drafts — the owner approves in about two minutes.

The course does not disappear. It becomes the agent's **training data, rules and guardrails** (§8). The dashboard does not disappear either — its 46 pages are demoted to secondary navigation, not deleted on day one.

### 3.2 Three screens only

| Screen | What it is | What is on it |
|---|---|---|
| **1 — Today** (the only home screen) | The morning | Yesterday's profit vs 7-day average as one big number; what worked / what didn't (max 3 bullets, plain English, dollar impact); stance; up to 3 tasks; one learning card; Store Brain summary; Compound Score + streak |
| **2 — Work** (the queue) | Everything the agent has done, is doing, or waits on | Kill loser, scale winner, refresh creative, email flow, creator outreach, BFCM plan step. Each card: what, why, evidence link, expected profit impact, what happens if you do nothing, AI cost, undo window, expiry |
| **3 — Ask** (chat, secondary) | The coach, with memory | "Why did profit drop Tuesday?" / "Plan Black Friday." The course appears here and in Today as a 60-second explainer with a lesson citation when a job needs context — never as a library to finish first |

### 3.3 Onboarding — value in 10 minutes, first win in 24 hours

1. **0–2 min:** Paste store URL → live audit (30–90 seconds) → Helix Score across 6 areas + top 3 findings with evidence. No account wall before the audit result.
2. **2–5 min:** Three questions only — hero product + landed cost, monthly ad spend range, one goal (more profit / more sales / less waste). These seed the Store Brain and the break-even CPA.
3. **5–10 min:** Connect in value order — Shopify (read-only) → Meta → Google → Klaviyo/TikTok later. Each connection states exactly what it unlocks. If a key is missing in production, say "mock / off in production" honestly — never fake a connection.
4. **First week:** Day 1 profit dashboard; Day 2 yesterday's numbers + store re-check top 5; Days 3–5 fix #1 + first paused Meta test; Day 7 weekly check-in. The agent delivers a **first win in 24 hours**: one wasted spend flagged, one fix, one paused draft.

### 3.4 The approval card — the unit of trust

Every money card must show: **what** will change (diff/preview), **why**, **evidence** (spend / revenue / CPA vs break-even), **expected profit impact**, **what happens if you do nothing**, ad-spend impact vs the owner's cap, **AI cost** and which bucket pays, **undo window**, and **expiry**. No card without evidence ships — "evidence or it doesn't ship" is the audit-engine rule.

Worked example (from `docs/product-design.md`): *Pause 3 "Drain" ads in Cold · Broad* — CPP $92, frequency 2.1, $78 spent, 0 purchases; break-even CPA for the SKU $35; expected ~$60/day moves to Star ads; spend change $0; daily cap $400 (current $310); AI cost ~$0.01 (in plan); undo one tap for 7 days; expires 24h. **Approve / Edit / Reject / Ask why.**

Approval rules: expire after **24 hours** (budget changes **12 hours**); the executor **re-checks live state** before executing and sends the card back for re-approval if things changed materially; bundling only for the same action type; optional auto-approve (Growth, opt-in) only for pausing Drains within limits and scheduling already-approved emails — **never** for budgets, launches, new campaigns, site publishes or sends to a full list.

---
## 4. Diagnosis — what the actual code shows

Source: full codebase audit of `main` at `0754e27` (878 files), plus `docs/product-design.md` (928 lines), `docs/audit-engine.md`, `docs/execution-model.md`, `docs/email-automation.md`, `docs/compound-daily-plan.md`, `docs/pricing.md` and `STATUS.md`.

### 4.1 The size of the overwhelm, in numbers

| Asset | Count |
|---|---|
| Playbook lessons | **323 lessons** across **30 modules** |
| Lesson steps | **1,467 steps** (667KB of Markdown in `docs/playbook/`) |
| Dashboard pages | **46 pages** — 12 under Numbers alone, plus 17 Settings tools |
| Competing "what do I do today?" systems | **5** — Today tasks, Coach daily tasks, curriculum day, course goal, Learn Path step |
| Course goals / curricula | 21 goals; 66-day Growing track + 28-day Just Starting track; 12-step Learn Path |
| Strategies | 8 named strategies |
| Email flows | **9 flows, 25 messages** |
| SOPs | **18 SOPs** |
| Card decks / glossary / daily emails | 29 card decks, 125 glossary terms, 30 daily emails |

An owner cannot tell which of the five "today" systems wins. That is the product problem, in code.

### 4.2 The five root causes

1. **Three products fighting each other.** Course → dashboard → checklist (§3.1).
2. **The dashboard habit fails by design.** A dashboard charges a daily cost (open, scan, interpret) for an occasional payoff; on most days the honest answer is "nothing changed", so skipping is rational (Seam, Aug 2026). Stormly: merchants get "nothing actionable ~80% of the time". Shopify-app data (Taylor Sicard): **60–70% of churn is decided in the first 90 days, most in week 1; ~75% of churners go quiet inside week 1; average B2B SaaS activation ~37.5%.**
3. **Two AI systems, neither agentic** (§4.3).
4. **The stub-vs-real gap is the core trust risk** (§4.4).
5. **Manual burden breaks the 2-minute promise.** `DayInput` has **21 numeric fields** (§11, Job 3 lists every one). The habit only works if Shopify/Meta are connected.

Uninstall reasons from 1,000+ brands of customer-support experience (ex-Social Snowball): (1) no result in the first session — "nothing has changed in their store"; (2) setup takes too long; (3) price ≠ visible value at first charge; (4) duplicate tools; (5) theme conflicts/bugs. Helix currently risks 1–3 on day one.

### 4.3 Two AI systems, neither agentic

| System | What it actually is | Limits |
|---|---|---|
| **Generic write-ups** | Gemini 2.5 Flash Lite; only 3 kinds (store-check summary, ad copy, "I'm lost"); 400-token cap; no tool/function calling | Monthly caps Free 3 / Starter 50 / Growth 150; global $25/mo budget |
| **Coach** | Claude via AI Gateway — **Haiku 5.5 fast / Sonnet 5 deep / Gemini 3.8 Flash fallback**, Gemini Embedding 2; RAG over playbook/SOPs/cards (2,000-char chunks, hybrid 0.7 cosine + 0.3 keyword, top 6, ~30k context); requires `[L1]` lesson citations; one next step | A floating chat widget; **feature-flagged off by default** before Step 1 (`HELIX_COACH=1`, prod also `HELIX_COACH_PROD=1`). It cannot build a campaign, pause/scale an ad, send email, or run a morning briefing — those live in separate rule modules. 170 `do:` hooks in lessons wire to only 2 delegate types (`meta-draft`, flow copy). |

**STATUS.md contradiction (flagged, not resolved):** an older entry says the coach is "off in prod", while the 27 Oct 2026 entry says **LIVE, with production flags set to 1** (`HELIX_COACH`, `HELIX_COACH_PROD`, `KLAVIYO`, `TIKTOK_ADS`, `GA4_SESSIONS`, `SHOPIFY_ORDER_WEBHOOKS`) — and notes TikTok/GA4/Shopify webhooks still show "Coming soon" until their keys exist. **Verify the Vercel environment before launch** (§16).

### 4.4 Stub-vs-real gap

| Surface | Real today | Stubbed / example today |
|---|---|---|
| Insights | Rules engine (`src/lib/audit.ts`) runs for real | It runs on **seeded EXAMPLE signals**; the Insights page shows seeded example insights, clearly labelled EXAMPLE |
| Crawlers / API pulls | — | **Stubbed** (per `docs/audit-engine.md`) |
| Email automation page | Flow list + drafts UI; "Draft and set up for me" creates an approval | Flows listed with **EXAMPLE status and revenue**; **platform write calls stubbed** |
| Trends feed | Cards exist | **Static seed from week of 5 Oct 2026**, no live refresh |
| Coming-soon / dead surface | — | Google Ads connection + paused Search drafts; TikTok sync + GA4 sessions; Klaviyo connect/send (code exists but throws "coming soon"); Shopify Email connect disabled; weekly report ("a full personal weekly report is coming"); push notifications; add-to-cart rate needs a Shopify connection |

**Integration gates in code:** Shopify live only if API key/secret set (read-only); Meta live if app ID/secret set, otherwise mock outside production and off in production; Google Ads live only if client ID/secret set (developer tokens noted as sunset 9 Sep 2026 — re-verify); TikTok only if `TIKTOK_ADS=1` + keys; Klaviyo — no sending, all 9 flows are copy-to-paste today. A Growth plan that delivers "copy to paste" is exactly the work owners hate.

### 4.5 Guardrails already built — keep them exactly

- **Execution model (decision, 6 Oct 2026):** Helix never turns on ad spend. Mode 1, *Draft & you launch*: complete campaigns pushed into the owner's own Meta/Google account as **paused drafts** (structure, naming, audiences, budget suggestion, copy, UTMs, brief + kill/scale rules). The owner opens Ads Manager via a deep link + 6-point pre-launch checklist and presses Launch. Mode 2, *Guide me*: proven structures, clearly-labelled EXAMPLE swipe ads, click-by-click checklists.
- **Meta `guardrail.ts`** allows **only** paused campaign/ad set/ad creation, pausing an existing object, and disconnect. Everything else throws. Google Ads `assertPaused` likewise.
- The executor has **no code path** that writes `daily_budget`, `lifetime_budget`, bid or target values on an active entity. Budget numbers exist only on paused drafts.
- Every change is logged with a before/after snapshot and a one-tap revert for drafts and pauses. Approvals expire after 24 hours and re-check live state before executing.
- Published promises that are therefore non-negotiable: official sign-in only, Helix never sees passwords; tokens encrypted; Shopify read-only; disconnect in one click deletes token + synced data; "We never use your data to train AI models."

---
## 5. The daily operating system

Source: `docs/compound-daily-plan.md` — the operating system already in your docs. The full loop is 15–30 minutes; the agent does steps 1–2 overnight and the owner does the 2-minute approval version.

### 5.1 The daily loop

| Step | Time | What happens |
|---|---|---|
| 1. Scorecard | 3 min | Yesterday's revenue, orders, sessions; ad spend per channel; estimated profit; MER% (3-day + month-to-date) vs target; RPV / CR / AOV vs 30-day average; new vs returning customers |
| 2. One ad action | 5–10 min | Scale a winner ≤20%; **or** cut a loser that spent ≥ the "bad" CPP threshold with no purchase; **or** refresh if <30% of original ads still perform; **or** launch a test of 4–8 ads, one variable; **or** deliberately do nothing if in learning / changed in the last 3 days — and log "held" |
| 3. One site/conversion action | 5–10 min | Next item from the ranked Site Fix List. **Rule: if RPV is below benchmark, site/offer actions come before new ad spend.** |
| 4. One retention action | 5 min | Check flow revenue + pop-up sign-ups; approve/edit the next drafted email; reply to two reviews; add one missing flow step; tag one customer insight |
| 5. One learning | 3 min | One trend/tip card, or Helix's daily question, plus **one line in the decision log**: what changed, why, what you expect. "The decision log is the most underrated compounding asset." |

**Red flags override everything (fix today):** revenue or sessions down **>40%** vs the same weekday last week with no planned reason; a best seller out of stock; an ad account disabled or a payment failed; an email/SMS about to go out with a broken link or wrong discount.

**Safety rules:** never move a campaign budget more than **20% in a day**; never judge an ad before it has spent about **1–1.5× target CPP** (high-priced products: judge on CTR, CPC, add-to-carts); after a budget step-up, give the new level **10–14 days** before judging MER — it usually gets worse first; do not add ads to a winning campaign (it can restart learning).

### 5.2 Day-of-week themes

| Day | Theme | Bigger task |
|---|---|---|
| Monday | Numbers and budget | Weekly scorecard review, set the week's spend range, pick the **one** priority |
| Tuesday | Creative | Write/approve next week's creative briefs; review last week's test results |
| Wednesday | Launch | Launch the new ad test batch; load refresh batches |
| Thursday | Site | Start or call one site test; ship one landing-page improvement |
| Friday | Retention | Send the weekly email campaign; review flow performance + list growth |
| Saturday | Customer | Read reviews, support tickets, competitor ads for 20 min; log 3 insights |
| Sunday | Rest | Scorecard glance only; Helix alerts on red flags only |

### 5.3 Weekly rhythm (Monday, 60–90 minutes)

- **Scorecard (15 min):** revenue, profit, MER%, RPV, CR, AOV, new-customer orders — this week vs last week vs 4-week average; spend + CPP by channel and funnel layer; email flow/campaign revenue, list growth, unsubscribes; stock under 4 weeks or over 6 months of cover.
- **Creative cadence (20 min):** grade last week's batch (keep / iterate / kill, one sentence on why winners won); brief the next batch **~70% iterations of proven ideas / 30% new**; batch size by daily spend — **≤$100/day: 4–8 ads; $100–$500: 8–12; >$500: 12–15**; keep **70–80% of spend on proven, 20–30% on testing**.
- **Budget review (10 min):** this week's daily spend range from the stance table; funnel split default **cold 30–50% / mixed 30–40% / warm 20–30%** of Meta spend; Google search terms + negatives + brand vs non-brand share.
- **Offer review (10 min)** and **plan the week (10 min):** one priority, broken into daily chunks by Helix.

### 5.4 Monthly (2 hours) and quarterly (half a day)

Monthly: economics review (variable/fixed ratios, MER%, net profit% vs targets; constraint diagnosis SOP 03 if any ratio is out of band); cost sweep (cancel one unused subscription, ask one supplier/3PL for a better rate); customer value (repeat rate, 90-day and 12-month cohorts); product-fit snapshot; 90-day promo calendar; **stock and cash — weeks of cover, purchase orders, 3-month cash forecast**; roadmap check.

Quarterly: one or two big priorities for the next six weeks; pricing/offer test; hiring/ops ("what breaks if revenue doubles?"); channel review (add a channel only when current channels are profitable and you have creative to feed it); peak planning if a season is within 4 months; year view (revenue target, back-solve stock + marketing).

### 5.5 Schedules, notifications, engagement

**Job schedules (from `docs/audit-engine.md`):** Shopify pull daily **05:00** local; Meta pull daily **05:30** (+ intraday light check in peak); Google Ads pull daily 05:30; email platform pull daily; site crawl weekly + on demand; PageSpeed weekly; social presence audit weekly; cross-diagnosis rules after each pull; weekly report build **Monday 06:00**.

**Owner-facing times — reconciled:** QA runs internally at 07:00; the briefing is delivered at **07:30**; the scorecard card is on Today by 08:00. Pick **7:30am** as the one owner-facing time and state it everywhere.

**Notifications (quiet hours 9pm–7am local):** morning scorecard + Today (email v1, push month 2) 7:30am; approval needed (in-app badge, email, push month 2); red-flag alerts any time (email + push); weekly report (Growth); wallet low ($2 left) and wallet empty; streak reminder 6pm only if the loop is not done; trends digest weekly; seasonal nudge Mondays 8am while an alert is active.

**Engagement:** Compound Score 0–100 (Helix Score + share of last 14 days the loop was completed + roadmap progress + contribution-profit trend); streaks (Sundays/rest days don't break them; freeze tokens for holidays); milestones (first 10 orders tracked, first Star ad, first flow live, first profitable month, first $10k month); a monthly "what compounding did" card, always labelled estimate. **No dark patterns.**

### 5.6 Why it compounds — the worked example

`Revenue = Sessions × Conversion rate × AOV`. Three 10% gains multiply:

| | Before | After 90 days |
|---|---|---|
| Sessions / month | 10,000 | 11,000 (+10%) |
| Conversion rate | 2.0% | 2.2% (+10%) |
| AOV | $150 | $165 (+10%) |
| Revenue | $30,000 | $39,930 |
| Variable costs (40%) | $12,000 | $15,972 |
| Fixed costs / ad spend | $6,000 / $9,000 | $6,000 / $9,900 |
| **Profit** | **$3,000 (10%)** | **$8,058 (20%)** |

1% better each week ≈ **68% over a year** (1.01^52). A lever saturates at its healthy benchmark — which is why Helix keeps moving the owner to the **next weakest lever**.

---
## 6. Profit maths, the profit ladder and the 17 audit rules

**Principle: deterministic code does the maths. The LLM never computes these numbers — it reads them, explains them, and drafts from them.**

### 6.1 Core formulas

```
Revenue        = Sessions x Conversion rate x Average order value
Gross margin   = Revenue x (1 - Variable cost ratio)
Daily profit   = Gross margin - Ad spend - Daily share of fixed costs

Target MER%    = 100% - variable cost % - fixed cost % - target profit %
                 (example: variable 40%, fixed 15%, target profit 15% -> target MER 30%)

Break-even CPA = price - product/landed cost - shipping - fees   (per SKU and blended)
Break-even MER = before-marketing profit ÷ price
Break-even ROAS = 100 ÷ break-even MER
```

In code: `profit-setup.ts` (per-order waterfall) + the daily scorecard `derive` (net revenue, contribution, net profit) + **18 key metrics with thresholds**. Ad grading uses CPP + frequency over 7 days: **good CPP threshold = AOV × target MER × layer multiplier; bad = 2× good**. Layer multipliers: **Cold 2.0, Mixed 1.25, Warm 1.0, Hot 0.75** (cold looks expensive because attribution undercounts it — compare cold only with cold). Frequency bands: Cold fine <1.4 / high >1.8; Mixed <1.8 / >2.0; Warm <2.0 / >2.4; Hot <2.4 / >3.0. Grades: **Star** (good CPP, fine frequency → more budget, "take it on tour", brief iterations), **Steady** (keep, prepare refresh), **Passenger** (watch, off when a new batch is ready), **Drain** (bad CPP, or spent the bad threshold with zero purchases → off today).

Google rules: break-even ROAS = 1 ÷ gross margin after variable costs (60% margin → 1.67); accept lower ROAS on mostly-new-customer campaigns; no big changes to a new PMax in its first 2 weeks; judge a new campaign after ~2 weeks learning + 4 weeks data at ≥ ~$50/day; review search terms weekly, keep brand search separate and modest.

### 6.2 Healthy bands

| Metric | Healthy | Watch | Act now |
|---|---|---|---|
| Net profit % | **10–20%+** | 5–10% | Below 5% |
| MER% (ad spend ÷ revenue) | **20–35%** | 35–45% | Above 45%, or above your computed target for 7+ days |
| Variable cost ratio (VCR) | **30–45%** | 45–50% | Above 50% (above 60% makes paid growth very hard) |
| Fixed cost ratio (FCR) | **10–20%** | 20–30% | Above 30% |
| Shipping & fulfilment ÷ revenue | Under 10% | 10–15% | Above 15% |
| Payment fees | ~2–3% | — | Above 3.5% |
| Revenue per visit | $2.50–$4 (category-dependent) | $1–$2.50 | Below $1 |
| Meta outbound CTR | 1–1.5%+ | 0.5–1% | Below 0.5% |
| Pop-up sign-up rate | 6–10% | 3–6% | Below 3% |
| Flow open / click rate | Above 35% / above 1% | — | Below 25% / below 0.5% |
| Campaign unsubscribe rate | Under 0.3% | 0.3–0.5% | Above 0.5% |
| Repeat purchase rate (12 mo) | Above 25% | 15–25% | Below 15% (don't build loyalty yet) |
| Weeks of stock cover (top sellers) | 6–16 weeks | 4–6 or 16–26 | Under 4, or over 26 |

**When to stop scaling and fix:** profit >10% and ratios healthy → scale; fixed costs high, everything else fine → scale carefully; **variable costs high → stop scaling and fix costs/pricing/AOV first — scale cannot fix this**; MER high → diagnose (ads vs site, §6.4) before touching ads; everything borderline → fix MER, then variable costs, then scale.

### 6.3 The 9-rung profit ladder

Chase in order; each rung feeds the next. **Revenue is the vanity number. Profit is the goal.** Diagnose top-down: find the **lowest rung below threshold** and work that stage only — never optimise a lower rung (more ad spend) while an upper rung (conversion) is broken.

| # | Rung | Stage | Threshold |
|---|---|---|---|
| 1 | Site visits (sessions) | Attract | Grows with ads, content, email |
| 2 | CTR | Attract | **≥1% solid, ≥1.2% strong** |
| 3 | Add-to-cart rate | Convert | **~6%+** |
| 4 | Conversion rate | Convert | **≥2% solid; most stores 1–3%** |
| 5 | AOV | Convert | No universal target — lift it |
| 6 | ROAS / MER | Grow | **MER 20–35% (ROAS ~2.9×–5×)** |
| 7 | CPA | Grow | **Below break-even CPA** |
| 8 | Contribution margin | Grow | **≥15% healthy** |
| 9 | Net profit | Grow | **Above $0; many aim for 10–20%** |

**Worked $1M-year example (from the course):** ~$83k/month, ~60,000 visits, 1.6% buy rate, $87 AOV, ads ~25% of sales (~$22/sale), ~25% left after ads.

### 6.4 "Is it the ads or the site?"

```
MER too high?
├─ Temporary shock? (stockout, sale hangover, competitor sale, season, tracking break)
│    yes -> fix or wait it out; do not rebuild anything
├─ Revenue per visit below benchmark?
│    yes -> SITE / OFFER problem
│           AOV low -> bundles, cart tiers, post-purchase upsell (SOP 12)
│           CR low  -> clarity, proof, risk reversal, offer work (SOP 04, 11)
└─ RPV fine?
     -> AD problem
          Outbound CTR < 0.5% -> creative / message / offer in the ad (SOP 07, 08)
          CTR fine, CPC high vs RPV -> CPMs high: saturation, frequency, season (SOP 06)
          Engaging ads, poor purchase cost -> landing page doesn't match the ad (SOP 11)
```

Site test rules: one change at a time, 50/50 split, call only at ~95% confidence or after 2 full weeks with no winner (keep the simpler version); fix speed only if it saves 1–2 seconds.

### 6.5 The 17 audit rules — trigger → diagnosis → fix

Deterministic first; **evidence or it doesn't ship**; **7-day cooldown** per rule per entity unless it gets worse; minimum samples before firing (e.g. 1,000 impressions, 300 sessions, 2× target CPA spend). The LLM only phrases the top insights and drafts fixes after the owner taps Do it for me.

| Rule | Condition | Diagnosis → Fix |
|---|---|---|
| `ad-good-site-bad` | Hook rate ≥25% and outbound CTR ≥1.2%, but landing-page CR <50% of store average | Site/landing problem → mobile speed, message match, offer clarity, trust, mobile checkout. Do it for me: draft page fixes |
| `atc-high-checkout-low` | ATC rate ≥ benchmark but checkout completion <40% | Checkout friction → show shipping early, wallets/BNPL, no forced account, delivery dates |
| `site-good-ctr-weak` | Site CR ≥ benchmark on organic/email, Meta CTR <0.8% account-wide | Creative problem → new hooks/angles/formats, offer in the ad. Do it for me: creative brief |
| `fatigue` | Frequency up ≥25% WoW and CPM up ≥15% while CTR falls | Fatigue/saturation → new batch, broaden, check reach vs spend |
| `low-hook` | Hook rate <20% on ads with ≥2,000 impressions | Weak opening → re-cut first 3 seconds |
| `good-hook-low-hold` | Hook rate ≥30%, hold rate <25% | Weak body → show product sooner, add proof, tighten |
| `views-no-clicks` | ThruPlays high, outbound CTR <0.5% | Missing/weak CTA → draft new CTAs |
| `mer-drift` | Platform ROAS stable, MER up ≥3 points over 14 days | Over-attribution → shift budget to cold, check new-customer share |
| `mobile-gap` | Mobile CR <50% of desktop CR | Mobile UX → speed, sticky add-to-cart, simplify |
| `aov-levers` | AOV flat, no bundle/threshold detected | Missing AOV levers → free-shipping threshold ~20–30% above AOV, bundles, gifts |
| `google-brand-share` | Brand search >40% of Google spend | Non-brand under-invested / brand overpaying → feed titles, PMax with brand exclusion |
| `search-term-waste` | Search terms with spend ≥1× target CPA and 0 conversions | Wasted spend → add negatives (approval) |
| `email-gap` | Email revenue share <15% of total, or a core flow missing | Retention gap → turn on missing flows. Do it for me: draft the flow |
| `stock-ads` | Ad spend on products with <14 days of stock | Stockout risk → shift budget, set back-in-stock flow |
| `social-profile-gaps` | ≥2 of: bio without product keyword, broken/untracked link, no post in 14 days or <2/week, <3 highlights, no pinned posts, no proof in last 10 posts, unanswered questions >48h | Profile losing trust → rewrite bio, fix link with UTMs, highlights, pin best posts, cadence |
| `ads-social-mismatch` | Offer/product in live ads not found in bio, pinned or last 9 posts | Inconsistent message → mention offer in bio, pin a post, add a highlight |
| `peak-runway` | Within 10 weeks of Black Friday and no plan | Unprepared for peak → build the timeline |

**Site audit checklist (crawler + PageSpeed):** mobile speed (fires: score <50 or LCP >4s); top-of-page clarity (headline/value prop/CTA in first viewport); product-page proof (reviews near price); shipping clarity; free-shipping threshold vs AOV (fires: >1.5× AOV or < AOV); email capture present; trust (returns, contact, guarantee, payment badges — fires at ≥2 missing); payment options; images (≥4 on top products, ≤500KB); broken links/404s; tracking present; SEO basics (title, meta, H1, structured data).

**Insight object:** `id, rule, area (site/ads/checkout/creative/email/google/stock/social), severity, title, evidence[] (label, value, benchmark), why (money terms), fix[], doIt {label, tier, estAiCost}, learn {slug, label}, detectedAt, source[], example?`.

**Audit build order (from the doc):** 1) PageSpeed + crawler (no auth, works from a URL) — weeks 1–2. 2) Shopify read pull + funnel — weeks 2–3. 3) Meta insights + ad rules — weeks 3–4. 4) Cross-diagnosis needing both — week 4. 5) Google pull + search-term rules — week 5. 6) Email pull + email-gap — week 6. 7) Social presence audit — week 6.

---
## 7. Agent architecture and Store Brain memory

Source: `docs/product-design.md` §13. **Principle: deterministic code does the maths and enforces the rules; LLMs explain, prioritise, draft and converse. The LLM never holds a credential and never executes a write directly.**

### 7.1 The pipeline

```
Cron / events → Sync workers (no LLM): Shopify, Meta, Google, email read APIs
  → Metrics + rules engine (SQL/TypeScript): scorecard, stance, ad grades, stock flags,
    candidate actions with numbers attached
  → Model router + cost guard: pick tier, estimate cost, reserve allowance/wallet hold, set max tokens
  → RAG: SOP chunks + store context
  → Tools: read_* (safe) and draft_* (proposals only)
  → Approvals service: card, preview, expiry
  → Owner taps Approve
  → Executor (no LLM): re-check live state, enforce caps, call provider write API
    with idempotency key, store revert payload
  → Audit log (append-only, hash-chained) + notifications
```

**Model tiers:** Tier 0 — no LLM (ratios, grades, thresholds, stock cover; most daily intelligence lives here, which keeps cost tiny). Tier 1 — cheap (extraction, tagging, classification, page summaries). Tier 2 — default writing (daily plan wording, task guides, chat, email/ad drafts). Tier 3 — judgement (weekly report, constraint diagnosis, structure proposals, escalations), gated by plan allowance or wallet. Prompt caching on the SOP + store-context prefix. Fallback: retry on an equivalent model from another provider via the gateway; **never silently upgrade to a pricier tier** without the cost guard.

**Tools:** `read_scorecard`, `read_ad_grades`, `read_search_terms`, `read_flows`, `read_products`, `read_findings`, `search_sops`. Draft tools: `draft_budget_change` (produces instructions for the owner — never an API write on a live campaign), `draft_pause_ads`, `draft_ad_batch` (created paused), `draft_negative_keywords`, `draft_email`, `draft_flow`, `draft_theme_edit`. Each returns a proposed Action object and creates an approval card — not a change. The executor holds credentials and runs an Action only with a valid, unexpired, server-signed approval ID.

**Supervisor pattern (from Sierra, §9):** a second, cheaper agent (Haiku) checks the first agent's draft against break-even, banned words, the discount ceiling and the never-pause list **before** a card reaches the owner.

**Guardrails:** per-platform daily spend cap (owner-set; executor rejects anything over it); budget moves max **20% per campaign per day** by default; new campaigns/ads always created paused; never pause the last active ad in a campaign; auto-pause rules capped per day; claims checker for regulated topics + per-store banned words; least-privilege OAuth scopes; PII minimised in prompts (no customer names/emails to LLMs unless needed for a draft the owner asked for); per-tenant isolation; encrypted tokens, secrets never logged; **one-toggle kill switch per store disables all writes instantly**; rate limits + idempotency + exponential backoff on all provider calls; fetched content (websites, reviews, emails) is treated as data — it cannot trigger write tools, and all writes need human approval anyway.

**Orchestration:** LangGraph (model-agnostic, `interrupt()` for durable pause/resume at approvals), with Claude Agent SDK patterns (permissions gate, compaction, subagents, session store) where they fit — not single-vendor lock-in. Tools via the **official MCP servers**: Shopify, Meta Ads, Google Ads, GA4 and Klaviyo all publish MCP servers.

### 7.2 Store Brain — memory that feels personal

**You already built the strongest asset. Don't rebuild it.** CoachMemory is live in code:

- **Max 60 facts, max 240 characters each, 9 kinds:** `business, store, products, channels, goals, budget, decisions, tried, results`.
- Facts are extracted by a small fast-model call after good answers (not counted toward the user's limit); no customer PII is kept; logs are redacted.
- The owner can view, edit and delete every fact — Step 1 puts this on Today (§1.2C).
- Plus `storeFacts`, auto-derived from synced data: shop, last-30-day orders/revenue/ad spend/profit, top-3 products, channels, store-check score, AOV/margin, Klaviyo state. Daily tasks and the greeting are rule-based — no model call.

**Store Brain = CoachMemory + storeFacts presented as one owner-visible record per store:**

| Memory | Contents | Source | Updated |
|---|---|---|---|
| Store profile | Niche, hero products, price points, brand voice (3–5 example sentences + banned words from reviews/site), audience, fulfilment reality | Onboarding + site + reviews | Owner edits anytime |
| Unit economics | Per-SKU price, landed cost, shipping, fees → gross profit/order; **break-even CPA per SKU + blended**; contribution margin; MER target (20–35%) | Shopify sync + owner costs | On cost change; recomputed daily in code |
| Winners / losers | Per ad/creative/offer/flow: spend, revenue, CPA vs break-even, verdict keep/kill/hold, date, evidence link | Meta/Shopify sync + agent verdicts | After every test window closes |
| Decisions log | Every approval/rejection with reason, every guardrail override, every offer margin-check | Agent + owner | Append-only |
| Rules learned | Plain-English store rules ("never discount hero SKU", "free gift above $80 works, 20% off does not", "creator ads beat studio ads 2:1") | Agent proposes, **owner confirms** | Only after owner confirms |
| Plan state | Current stage (Attract/Convert/Grow), current ladder rung, current test (3–6 max), BFCM timeline position | Agent + course progress | Daily |

**Mechanics:** (1) deterministic facts live in the database, not the LLM's context — the agent *reads* break-even CPA, it does not "remember" it from chat. (2) The Store Brain is injected as a compact, **cached** system-prompt block at the start of every session. (3) **Write-back:** after every task the agent writes one line to Decisions/Rules-learned and shows it in the morning briefing — "I learned X — correct me if I'm wrong." (4) **Forgetting:** a contradicting fact is flagged, not silently overwritten (a former winner whose CPA stays above break-even for 7 days → "winner gone stale" alert). (5) **Never train on it:** per-tenant only, never shared across stores; patterns may be aggregated only as anonymous, opt-in benchmarks.

**Coach behaviour to keep:** answers cite the store numbers used + the SOP section; can say "I don't know" and name the data that would answer it; offers next steps as buttons (Add to Today / Draft this / Show me how); cheap model by default, escalates on "think harder" (wallet-metered beyond allowance). Existing coach guardrails: monthly message caps (Free 20 fast; Starter 300 of which 40 deep; Growth 800 of which 100 deep), hard global monthly spend cap (`COACH_MONTHLY_BUDGET_USD`, default $50), rate limit 6/minute — see the margin warning in §12.4.

### 7.3 The 18 SOPs the agent reasons from

01 Store audit · 02 Scorecard and unit economics · 03 Constraint diagnosis · 04 Offer design · 05 Meta structure and scaling · 06 Meta daily optimisation · 07 Creative testing · 08 Creative briefs, UGC, creators · 09 Google Shopping, PMax, Search · 10 TikTok and emerging channels · 11 Landing pages and CRO · 12 AOV and cart offers · 13 Email/SMS flows · 14 List growth and campaigns · 15 Promo calendar and sales · 16 Customer research and reviews · 17 Inventory and cash planning · 18 Founder rhythm and hiring.

---
## 8. The 30 modules as agent training

**How to train the agent on the course:** each module becomes four things — (1) **RAG chunks** (already built for the coach: 2,000-char chunks, hybrid 0.7 cosine + 0.3 keyword, top 6, `[L1]` lesson citations required), (2) a **deterministic rule**, (3) a **`draft_*` tool**, (4) a **guardrail**. The LLM cites the lesson; code checks the numbers. System-prompt rules to keep: plain English, one next step, never invent claims/reviews/numbers, discount rules are hard rules.

**Honesty note on module mapping:** the table below is the pivot plan's training map, keyed to the stages and rules in the repo docs. The repo's playbook files are numbered 01–30 (daily profit foundations through customers/partners/rhythm). **Gaps not invented:** Modules **12 / 28 / 29** titles were not retrieved publicly in the research; lesson-number gaps exist in modules 3 / 6 / 8 / 9 / 17 / 24; and `product-design.md` says 28 modules while the live Learn index shows **30 modules / 323 lessons** — 30 is the live figure. Audit those three modules in the repo before training them; do not ship an agent skill for a module whose content has not been verified.

| # | Module / stage | Deterministic rule | Decision | Action | Guardrail |
|---|---|---|---|---|---|
| 1 | Start Here — Attract | No spend advice until break-even CPA computed | Ready / not ready | Onboarding plan | Costs from owner, never guessed |
| 2 | Profit & Numbers | Profit waterfall daily; MER 20–35% | Stance Push/Hold/Defend | Scorecard card | Code maths only |
| 3 | Offers | Contribution ≥15% after the offer | Approve offer / reprice | `draft_offer_check` | No margin-wiping offer |
| 4 | Store / Product Page | Store-check score; `mobile-gap` rule | Top-5 fixes ranked | `draft_theme_edit` | Draft only, owner publishes |
| 5 | Traffic Foundations | Sessions trend vs same weekday last year | Traffic vs conversion problem | Diagnosis card | Min 300 sessions |
| 6 | Meta Ads Foundations | CTR ≥1%; judge after 1–1.5× CPP | Kill / hold / keep | `draft_ad_batch` (paused) | Paused only; ≤20%/day |
| 7 | Creative — Hooks | 20 openings from reviews; hook <20% on ≥2k impressions = `low-hook` | Test 4–8 (see note) | `draft_ad_batch` + video scripts | No invented claims/reviews |
| 8 | Creative Testing | One variable per test; 70% iterations / 30% new | Winner / loser / inconclusive | Test plan card | Max 3–6 concurrent; 7-day cooldown |
| 9 | Google Ads | `search-term-waste`; brand-share check | Add negatives / protect brand | `draft_negative_keywords`, paused Search draft | `assertPaused`; developer-token status re-verify |
| 10 | TikTok / Social Organic | `social-profile-gaps`; `ads-social-mismatch` | Post / don't post | Draft + schedule (Job 1) | Approval per channel; no auto-post by default |
| 11 | Conversion — ATC/Checkout | ATC ≥6%; `atc-high-checkout-low` | Site fix before ad spend if RPV low | Site Fix List card | Evidence + screenshot |
| 12 | **Title not retrieved** | Audit in repo before training | — | Do not ship until titled | No invented content |
| 13 | AOV — Bundles & Thresholds | Free-shipping threshold > margin break-even; `aov-levers` | Bundle/gift vs discount | `draft_bundle` | Gift threshold computed, not guessed |
| 14 | Email Foundations | `email-gap` rule | Which flow is missing first | `draft_flow` | No live flow without approval |
| 15 | Welcome Flow | 5 messages, Day 0/1/3/5/6 (full copy in §11, Job 5) | Draft ready? | `draft_flow` (5 emails) | Sign-up incentive in email 1 only |
| 16 | Abandoned Checkout/Cart/Browse | Checkout 4 msgs 1h/4h/24h/48h; Cart 2 msgs 2h/Day 1; Browse 2 msgs 4h/Day 2 | Discount timing | `draft_flow` | No discount in email 1; new customers only in the last checkout email |
| 17 | Post-Purchase & Reviews | Post-purchase 3 msgs (immediate / delivery+2d / Day 14); Review delivery+10d email, +17d SMS | Send timing | `draft_flow` | SMS opt-out + quiet hours |
| 18 | Win-back / Replenishment / VIP | Win-back Day 0/7/14, incentive only in final; Replenishment usage−5d / usage day; VIP on 3rd order / top-10% spend | Who is due | `draft_flow` | VIP: early access/gifts over blanket discounts |
| 19 | Retention / Repeat | New vs returning split on scorecard | Retention action of the day | Retention card | One action/day max in Today |
| 20 | Product Launch | Waitlist → early access → launch day → 24h push | Launch ready? | Launch checklist + paused drafts | Launch at full price — an event, not a discount |
| 21 | Pricing & Margin — Grow | Contribution ≥15%; VCR/FCR bands | Price / cost action | Margin diagnosis | Code maths |
| 22 | Scaling Ads | Scale ≤20%/day; 70–80% proven / 20–30% test; funnel splits | Stance Push / Hold / Defend | `draft_budget_change` (instructions, not a live write) | Daily cap owner-set; never-pause list |
| 23 | Influencer / Partnerships | Creator must have bought/posted or fit the audience; partnership-ad permission required | Shortlist top 3 | Outreach draft + brief | No outreach sent without approval |
| 24 | Seasonal — BFCM | `peak-runway`: within 10 weeks of Black Friday, no plan = red flag; timeline from 1 Aug | Next dated task due | BFCM plan + paused sale campaigns (off) | Offer margin-checked; stock 10–12 weeks out (Sep) |
| 25 | Christmas Gifting | 2–3 bundles, gift guide, cut-offs everywhere | Bundles ready? | Bundle + guide draft | Lift AOV without discounts |
| 26 | Valentine's / Mother's Day | 6–10 giftable products; free gift above a set amount | Threshold amount | Edit plan + paused drafts | No store-wide discount |
| 27 | Stock, Cash & Ops | Reorder if stock ÷ daily sales < lead time + buffer; `stock-ads` <14 days | Reorder list | Reorder draft (Job 4) | Agent never auto-orders |
| 28 | **Title not retrieved** | Audit in repo | — | Hold | No invented content |
| 29 | **Title not retrieved** | Audit in repo | — | Hold | No invented content |
| 30 | Run / Handover / Team | Weekly agenda, handover playbooks (Growth) | Weekly priority (ONE) | Weekly report (Mon 06:00) | Owner approves the priority |

**Conflicts to reconcile in code (one source-of-truth file):** test batch size — public copy says test 3–6 at a time, the daily plan says 4–8 (pick **4–8**, update public copy); briefing time 7:30 vs 8:00 (pick **7:30** delivery); Haiku/Sonnet version names + prices differ across docs, code and provider pages (pin one list); module count 28 vs 30 (use **30**).

**Training assets already in the repo:** playbook RAG chunks; `flows.json` (9 flows, 25 messages, timing/discount rules as structured data); 18 SOPs; 29 card decks; 125 glossary terms; 30 daily emails.

**The 8 public strategies, as agent playbooks:** (1) Daily profit habit — agent pulls Shopify + Meta and reports the change in plain words; if data is missing/stale, say so, never present a profit number from a broken feed. (2) Win back almost-buyers — discount **only to new customers, only in the last email** (hard rule). (3) Welcome emails — 3–6 emails; test email to self before launch. (4) Ads that stop the scroll — hooks from reviews, 20 openings, test in small batches, paused drafts only. (5) New product launch — waitlist, early access, launch day, 24-hour push; launch at full price. (6) Black Friday plan — from 1 Aug (§11, Job 5); every offer margin-checked first, "a bad offer can wipe out your profit". (7) Christmas gifting — bundles/guide/cut-offs; lift AOV without discounts. (8) Valentine's/Mother's Day — free gift with purchase instead of a store-wide discount; the free-gift threshold must be computed above the margin break-even for the gift's cost. Cross-strategy rule: every strategy names **one** success metric ("You will see it in: …") — the agent reports that metric and no other as the verdict.

---
## 9. Fast-grower playbooks — what transfers and what does not

All figures below are **company-reported / self-reported run-rate, not audited**, from the deep-research report of 19 Nov 2026 (`~/workspace/research_notes/ecommercehelix-pivot-research-20261119-0530/report.md`). A May 2026 TechCrunch note relayed in that research warns AI startups routinely report contracted ARR (including signed-but-not-live deals) as ARR, in some cases ~70% above real ARR. **Copy the model, not the hype numbers.**

| Company | To $100M ARR (self-reported) | What it sells / pricing | Copy for Helix | Does NOT transfer |
|---|---|---|---|---|
| **Lovable** | Jul 2025, ~8 months from Nov 2024 launch; $200M Nov 2025; $400M Feb 2026; ~$500M run-rate Jun 2026; $600M+ Sep 2026. Valuation $1.8B Jul 2025 | An outcome (a working web app from a prompt). Credits: Free 5/day (public projects only), Pro $25/mo (100 credits/mo + 5/day), Business $50/mo. A tweak ~0.5 credits, a landing page ~1.7 | Credit ceiling that bites **mid-build, at the moment of value**; publish milestones as content; make the output shareable so each user advertises you | A store's output (a paused draft, a profit number) is private — **no public billboard loop**; no viral open-source predecessor or large founder following unless built deliberately |
| **Cursor (Anysphere)** | Jan 2025 (~20–22 months after Mar 2023); $500M+ Jun 2025; $1B Nov 2025; $2B Feb 2026; $3B May 2026 | An outcome (working code, merged PRs) inside a familiar tool (VS Code fork). Pro $20/mo = $20 of frontier-model usage at API prices (from 16 Jun 2025), overage at cost; Pro+ $60; Ultra $200 | Meet the owner **inside the tools they already live in** (Shopify/Meta); a measurable first-session win; bottom-up (one owner → their VA/team) | The Jun 2025 metering switch caused surprise bills, an apology and refunds — **change metering transparently or trust collapses**. Negative gross margins on heavy users are the warning against flat unlimited pricing. Developers demo tools publicly; Shopify owners don't post their P&L |
| **Sierra** | Nov 2025, ~21 months after Feb 2024 launch; $150M Jan 2026; $200M May 2026; ~$400M Oct 2026 (Sacra estimate). Valuation $15.8B May 2026 | An outcome — a resolved conversation. Outcome pricing per resolved interaction (~$1.50/resolution, third-party estimate, unverified); setup $50k–$200k est.; year-1 contracts $150k–$350k+ est.; no public price, no self-serve | **Paid design partners** (wanted 4, got 6 — all paying — before launch; 100% conversion); **supervisor agents** monitoring the first agent in real time; simulate/rehearse before live; outcome pricing as a *principle* | Founder credibility and network, $110M raised pre-launch, $150k+ multi-year contracts, enterprise procurement. A $10k/mo store will not sign one, and Helix cannot afford bespoke sales-engineering per customer |
| **Legora** (ex-Leya) | 2 Apr 2026, $1M→$100M in <18 months (company press release — primary source); >$200M Oct 2026 | A legal-work operating system. Seat ~$3,000/user/yr, 10-seat minimum (third-party guides; a later $450/seat/mo figure conflicts — **unconfirmed**); moving seat → consumption → outcome | **Embed inside 3–5 real stores for weeks** (the design-partner lab model at Helix scale: a shared Slack, watching the owner work); pilot with a named, measured conversion to paid; a workspace where work happens, not a report | $30k minimums; firmwide mandates (a managing partner can order 1,400 lawyers to use it; nobody can order a Shopify owner); the professional duty that forces daily use |
| **Clay** | Dec 2025, $1M→$100M in ~2 years — **after ~6 years to the first $1M**. ~$200M Sep 2026 (Sacra/NYT) | Enriched, actionable GTM data + the Claygent research agent; waterfall enrichment across 150+ providers (pay for the hit). Unlimited seats + usage credits: Launch $185/mo, Growth $495/mo, Enterprise custom | **The most copyable GTM in this report:** be in the rooms where the ICP complains and help with no demo; **reverse demos** (prospect shares *their* screen with *their* data, you guide them to a solved problem in 30 min); support **in public** (community) so every question becomes content; **agencies/operators as distribution** — they run many stores and publish the workflows | Clay's ICP *is* a tooling-loving operator; a Shopify owner wants *less* tooling. And the 6-year wilderness to $1M is a warning against staying broad |
| **ElevenLabs** | ~Jan 2025, ~20 months after Jan 2023 beta; $200M Sep 2025; $330–350M end-2025; $500M Apr 2026; $600M mid-2026 | Voice as infrastructure (TTS, cloning, dubbing, agents) — a capability others embed. **7-rung credit ladder:** Free 10k credits (no commercial licence), Starter $5–6 (30k), Creator $22 (121k), Pro $99 (600k), Scale $299 (1.8M), Business $990 (6M); each rung unlocks a *commercial capability*, not just more credits | The ladder shape — **each tier unlocks a new job** (§12); pay the supply side (Helix's equivalent: the creators/agencies whose angles the agent learns from — with consent/revenue share, not scraping); treat every feature ship as its own launch | An instantly demonstrable "wow" (hear a clone in 10 seconds). Helix's wow — profit per order — takes a day of data to prove |
| **Coframe** | **No ARR disclosed.** $25M Series A 9 Nov 2026; revenue "more than doubled every quarter" (Antler); CEO closed the first $1M ARR as sole sales leader | An outcome — incremental revenue from existing traffic; agents + CRO experts test site experiences **against revenue**, winners scaled by bandit. Flat annual rate, no public price; internal rule: target ≥10× ROI before proposing | **The closest product-shape analogue:** snippet-speed onboarding + a **3-day first win** (one Fortune 500 customer: contract → live in 3 days, +70% conversion in <1 month — company claim); measure against revenue/profit per visitor, never clicks; agree the measure and guardrails up front; human approves before launch | Enterprise CRO budgets and statistical power. A $10k/mo store has ~5–15k sessions/month, so most A/B tests are **inconclusive for weeks** — use Coframe's own rule ("a result without enough evidence stays inconclusive") and default to creative/offer/email tests. Its headline lifts (158% Dropbox, 410% Replit, 60% Cash App; $300M+ incremental revenue) are company claims |
| **Helena — Enrich Labs** | **No company ARR disclosed.** Launched ~Mar 2026 | "Hire Helena, the AI marketer" — plans, creates, ships marketing. Credits per brand: Starter $39/mo (200 credits), Pro $99 (700), Pro Plus $199 (2,000, rollover). Task costs: 1 credit social post, 2 blog article, 3 email campaign, 12–24 short video | **The closest analogue overall** — same customer, same stack, daily loop, human approves money moves. Copy the **7am QA + 8am scorecard** (§11, Job 3), the Shopify-money ÷ Meta-money scoreboard, the $150 test/kill rules, and the plain-file store brain + written policy file | See the honest result below. Also: monthly-reset credits punish a store whose best week is week 4 — Helix uses **weekly expiry** instead (§12) |
| **Triple Whale / Moby** | **No $100M.** Estimated $21.6M ARR (Latka, 2025 — third-party estimate); 60,000+ brands claimed | Attribution that became an execution layer: Moby agents analyse always-on and, on Automate, **execute** (pause ads, scale budgets, launch campaigns, discount codes, product edits, Klaviyo campaigns, landing pages). Pricing: two-axis grid, feature package × trailing-12-month GMV — Foundation from $219/mo, Automate from $749/mo; 12-month commitments standard | **"Ask every time" → "Let Moby decide"** as an earned ladder with written guardrails (spend caps, MER bands, max daily change e.g. 20%, never-pause lists); plain-language automation rules the owner writes; start from the one painful measurable problem | **GMV-based pricing** — fees rise with topline whether or not margins do (a mid-contract $329→$549 jump is the documented complaint); 12-month lock-in; $749/mo is ~25× Helix Starter. Helix must be the *cheap* execution layer |
| **Ecommerce Equation** (Jay Wright) | **No ARR disclosed.** A $9.15M annual-revenue figure is a third-party estimate (Prospeo) — **unverified, do not quote as fact** | Done-with-you coaching + community (not software): **Attract – Convert – Operate**; 1,000+ hours/month of coaching claimed; 4,000+ founders claimed. Price on application only (secondary reviews: mid-four to low-five figures, 12-week programme) | The Attract–Convert–Operate skeleton (Helix's Attract–Convert–Grow) delivered by software instead of coaching hours; a **peer group at the same revenue stage** as a retention asset; explicit qualification ("not for beginners") keeps the churn story clean. **Founder is Jay Wright** (Newcastle, NSW; founded 2019) — Nick Shackelford is not the founder | High-ticket, human-heavy economics (1,000 hrs/month of coaching cannot be sold for $29/mo); application-only pricing (Helix is self-serve); a $30k+/mo entry filter (Helix's ICP *starts* at $10k/mo). Client result claims on its own pages are unverified |

### 9.1 Helena's Shopify experiment — the honest warning, in full

Helena's own public experiment (Project FSD, primary source) ran an AI-operated Shopify store end-to-end:

- **26 products tested, 12 reached live spend, 1 winner** — a $59 vibrating workout band Helena found, sourced and launched unasked: ~$7.4k gross on ~$6.2k Meta spend + ~$2k product cost, ~$800 short of break-even; cost per purchase $77.54 average, falling to $63.01/week by mid-September.
- **Totals: $10,242 in sales / 156 orders in 56 days; $11,532 / 170 orders to 21 Sep 2026. It lost money overall.** "Phase 1 did not make money for us." Break-even CPA was ~$35 (price $59.99 − landed ~$17 − 3% fees − $6 shipping ≈ $30 gross profit/order).
- **What it did catch:** a dead checkout, broken images and a misfiring pixel in morning QA — each before burning a day of spend. And it **trusted dashboards until they betrayed it**: ads spending, add-to-carts firing, pixel healthy, Shopify orders zero — because checkout was broken.

**The transfer rule for Helix:** Helix's stores already have products and customers. The agent must **optimise stores with existing winners, not go product-hunting** — and it must cross-check the ad platform against Shopify orders before believing any number (§11, Job 3).

### 9.2 Why dashboards churn — the research synthesis

- A dashboard inverts the work: you arrive with a question, scan, decide whether anything changed. **Cost is paid daily, payoff is occasional**; habits survive on unpredictable reward, and a dashboard is predictable — "today is a nothing day" — so skipping is rational (Seam, Aug 2026).
- A daily *push* report fails the same way and becomes wallpaper unless it is **"willing to be boring out loud"** — willing to say nothing happened (Seam).
- Merchants don't use analytics consistently because opening takes time, requires knowing what to look for, and "returns nothing actionable 80% of the time". The fix is **proactive surfacing** — monitoring that finds the thing before the merchant would notice (Stormly).
- **What makes owners return daily:** (i) the agent did work overnight — the owner returns to *approve*, not to query; (ii) one number that is money (profit yesterday vs 7-day average) plus one line saying what changed; (iii) one small completable task (~15 min) with a visible effect; (iv) an **exception, not a routine** — interrupt only when something is wrong or a decision is due; (v) a streak/plan, so skipping feels like breaking a plan, not skipping a chart.

---
## 10. Full scope, step by step — Steps 1 to 5

This is the build sequence you approved: **all of it, one step at a time**, each step verified before the next starts (§15). §14 re-expresses the same work as the gated 30/60/90-day plan.

### Step 1 — Today + coach + memory *(in progress — see §1)*

- [x] Repo copied to `~/workspace/ecommercehelix`, branch `helix-agent-pivot` created from `0754e27`
- [~] Simplified Today: `AgentScorecard.tsx`, `AgentTasks.tsx`, stance logic in `today.ts`, dashboard page cut down
- [~] Coach on by default (`HELIX_COACH=0` kill switch), coach tests updated
- [~] Store Brain panel on Today with add/edit/delete/delete-all over CoachMemory
- [~] Approvals page: every Do-it-for-me task → `/dashboard/approvals`, paused drafts only
- [ ] Verification pass (§15) and local run — pending
- [ ] Local commit(s) on `helix-agent-pivot` — **no push**

### Step 2 — Real syncs replacing stubs

Replace the stubbed/EXAMPLE signals with real pulls, in the audit-engine build order (§6.5). **Remove the EXAMPLE label only for rules now running on real data; keep the badge on the rest — honesty is the feature.**

| Sync | Scope / requirement | Schedule | Notes |
|---|---|---|---|
| Shopify | Admin API read; **`read_all_orders` scope** needed for full order history | Daily 05:00 | Orders, products, inventory, AOV, new vs returning, funnel. Live in code only when API key/secret are set |
| Meta | Marketing API Insights (campaign/ad set/ad: spend, impressions, reach, frequency, CPM, CTR, 3s views, ThruPlays, purchases, value); **`ads_read` + `ads_management`**; **Meta app review** is the gating item | Daily 05:30 + intraday light check in peak | Live only with app ID/secret; mock outside production, off in production without them |
| Google Ads | Google Ads API (GAQL): campaigns, search terms, Shopping products, conversions, value — **live** (not "coming soon") | Daily 05:30 | Live only with client ID/secret; developer-token status must be re-verified (sunset noted 9 Sep 2026) |
| TikTok | Ads read (spend, performance) | Daily, with the other ad pulls | Only when `TIKTOK_ADS=1` + keys are set and the path is tested |
| Klaviyo / email platform | Flows live, flow revenue, list growth, campaign results | Daily | Today: code exists but throws "coming soon" and cannot send. Step 2 makes the **read** pull real; Step 3 adds draft writes |
| Site crawl + PageSpeed | Home, top 10 product pages, collection, cart; PSI mobile + desktop on home + top 3 product pages | Weekly + on demand | No auth needed — works from a URL; the first real signal available to every store, including Free |

Each job writes raw snapshots (JSON, 90 days) → normalised `daily_metrics` → rules engine → ranked insights (impact × confidence × effort, dedupe, 7-day cooldown) → Today feed (top 1–2), Insights panel, weekly report.

**Step 2 gate:** real Shopify + Meta pulls stable for 14 days on pilot stores; no EXAMPLE data presented as real anywhere; stale-feed badge (>24h) working.

### Step 3 — The job-by-job agent

Ship the five jobs specified in full in §11:

1. **Video generation + social posting** — draft-first, opt-in auto-post per channel, per-day caps, never-post list, manual upload packet fallback.
2. **Ads autonomy ladder** — L1 propose-only → L2 assisted auto-pause → L3 autonomous opt-in scaling, with the kill rule and one-tap undo.
3. **Daily metrics** — 05:00/05:30 pulls, **7am QA walk, 8am scorecard** (briefing delivered 7:30am), and the 21-field `DayInput` replaced by auto-sync (§11, Job 3 names every field).
4. **Stock and cash** — reorder point, stock-out countdown, scale-blocking stock check, 13-week cash forecast, margin-checked offers.
5. **Email (9 flows), influencer/partnerships, and the BFCM engine** — full copy/timing tables in §11, Job 5; BFCM timeline August–November (with December–January review).

Sequencing inside Step 3: L1 + Jobs 3/4 first (they need only Step 2 data); Job 5 email drafts (Welcome + Abandoned Checkout first); Job 1 video; L2; BFCM engine; L3 last, behind its own gate (§14).

### Step 4 — Pricing: wallet + weekly-expiring credits

Implement the ledger in `docs/pricing.md` — do not redesign the economics (§12 has every number):

- One credit ledger replacing the two separate monthly counters (AI write-ups 3/50/150 and Coach messages 20/300/800).
- **Weekly-expiring subscription credits** (expire Sunday 23:59 owner timezone), priced at the **cap** cost of the actions they cover, at **≥2× provider cost** — never at typical use.
- **Prepaid wallet at 2× provider cost**, $10 minimum top-up, no auto top-up by default; at $0 the AI extras stop and the scorecard, rules, guides and existing approvals keep working.
- Pre-flight estimate → reserve → charge → release (§12.5); hard caps per call and per day; downgrade before stopping; daily margin dashboard.

### Step 5 — Verification

Full detail in §15: `tsc --noEmit`, the test suite, a local run, the **golden set of 50 store scenarios**, and the live operating metrics — **approval rate, revert rate, cost per active store per day**. No step ships on "it builds" alone.

---
## 11. Job-by-job specification

Every job uses the same contract: **Trigger → Data in → Agent steps (code first, LLM second) → Owner sees/approves → Auto vs Never auto → Guardrail → Credits → Failure case.** Credit costs use `docs/pricing.md` per-action costs (§12.2) — where the docs and any modelled estimate conflict, **the docs win**.

### Job 1 — Video generation and social posting

**Can it generate videos? Honest answer: not today in Helix code.** The design is **draft-only short-form assembly, not generative film**: real product media + real UGC + generated scripts, assembled by a template renderer.

- **Trigger:** Tuesday creative day; the `fatigue` rule fires; a new product launch; the owner taps "Make 3 variants" on a Work card.
- **Data in:** product photos/video (Shopify), review phrases (hooks), existing UGC (owner-uploaded, with a permission flag in the Store Brain), brand voice + banned words, winning hook/hold data from Meta.
- **Agent steps:** (1) Code picks the hero SKU + break-even CPA + confirms **stock ≥14 days**. (2) Sonnet drafts scripts from the 20-openings rule: pull phrases from reviews → write 20 openings → rank by past hook rate → pick 3. (3) The assembly tool (not an LLM) builds **3 variants, 9:16** for Reels/TikTok/Shorts: product photo/UGC sequence + voiceover (TTS) + burned-in captions + hook text in the first 3 seconds, **one variable different per variant**. (4) A Haiku supervisor checks banned words, claims, the discount ceiling and price accuracy vs Shopify. (5) Three draft posts with preview thumbnails land in the review queue.
- **Owner sees/approves:** thumbnail grid, script, caption, hashtags, and "Post to: ☐ Instagram ☐ TikTok ☐ Pinterest ☐ Shorts" — **Approve / Edit script / Regenerate hook / Skip**. No post leaves without this, by default.
- **Auto vs never auto:** Auto — draft generation, caption drafts, scheduling *after* approval. Never auto by default — publishing. **Opt-in exception, "Let Helix post", per channel:** the owner toggles it per channel, sets a **per-day cap (default 1/day)**, and maintains a **never-post list** (e.g. no price/promotion posts without approval, no new-product claims). Even with Let-Helix-post on, **price/promo posts still require approval**.
- **Platform rules (verify at build — APIs change):** Meta/Instagram — Graph API allows scheduled publishing for professional accounts; token stored encrypted. TikTok — Content Posting API requires app review + user authorisation, and posts may land as private/draft depending on account/audit status: design for **"draft in TikTok inbox, owner taps post"** as the fallback and label it honestly. Pinterest — API allows Pin creation for authorised accounts; schedule via the draft queue. YouTube Shorts — Data API upload possible; defaults to draft/private until the owner publishes in Studio if the channel is not fully authorised. **Any channel without a working authorised API gets a manual upload packet** (video file + caption + cover frame, one-tap download) — never pretend it auto-posted.
- **Fatigue and refresh:** code watches frequency +25% WoW + CPM +15% while CTR falls (`fatigue`) and hook <20% / hold drop → "refresh creative" Work card proposing 3 new openings from fresh reviews and retiring the bottom variant. Cadence: a new batch when <30% of original ads still perform, or weekly on Tuesday, whichever comes first.
- **Credits:** priced as an ad batch draft — docs: **ad batch draft (8 ads) $0.088** provider cost; a video variant batch is priced in credits at ≥2× cost at its cap (§12).
- **Failure cases:** no UGC permission → photo-only variant + a "needs creator clip" flag; TTS voice unavailable → captions-only draft; API 403 → manual packet + a "connection needs re-authorising" card. **Never a silent fail.**

### Job 2 — Ads: control vs automation (the autonomy ladder)

- **Trigger:** daily 05:30 Meta/Google pull; the 08:00 scorecard; `fatigue`/kill rules firing.
- **Data in:** Meta/Google/TikTok spend, Shopify revenue per product, per-SKU break-even CPA (code), frequency, CTR, hook/hold, stock days, the never-pause list.
- **Scoreboard rule (Helena, adapted): Shopify money ÷ Meta money, per product.** The ad platform's own ROAS is never the verdict.

| Level | What the agent may do | Owner control |
|---|---|---|
| **L1 — Propose-only (default)** | Paused drafts only (campaign + ad set + ads); kill/scale proposals as cards | Approve / Edit / Skip every card; the owner presses Launch in Meta |
| **L2 — Assisted** | **Auto-pause losers** under an owner-written rule; never auto-spend-up | The rule is the owner's, in plain language (below); every auto-pause notifies and is undoable |
| **L3 — Autonomous (opt-in, capped)** | **Scale winners ≤ +20%/day up to the owner-set daily cap**; refresh creative drafts; send already-approved flows | Daily spend cap, max change 20%, kill switch, daily report, every move logged + reversible |

- **The L2 rule, as the owner writes it:** *"Pause any ad with spend ≥ $50 over 3 days, 0 orders, or ROAS < 0.7 → auto-pause + notify + undo."*
- **Kill rule (exact): $50/day × 3 days (~$150 test) — kill on 0 orders or ROAS < 0.7**, after a fair test. Fair test = max(3 days, 1–1.5× target CPP spend) — never kill before the learning window ends ("a tiny budget switched off after three days never had a fair chance"). **Hold:** +2 days, no budget change. **Keep:** CPA < break-even → propose scale ≤20% (approval at L1/L2; auto at L3 within cap). **The hero product never auto-pauses.**
- **One-tap undo:** every pause, draft and (at L3) scale carries a revert payload; undo window **7 days**.
- **Owner controls (Guardrails page):** daily spend cap per platform; never-pause list (hero products, brand search); max concurrent tests 3–6; brand voice + banned words; discount ceiling; quiet hours; auto-approve rules (none by default for money).
- **Credits (docs):** approval card **$0.006**, ad batch draft **$0.088**, daily plan **$0.015**.
- **Failure case:** feed stale, or checkout broken (spend firing, Shopify orders zero) → the agent says **"data unreliable — do not scale"**, creates a red-flag card, and proposes nothing money-moving. That is Helena's dead-checkout lesson, encoded.
- **What Helix does not do yet, plainly:** no live budget changes — by published promise and by guardrail code (§4.5). Closing that gap is staged: L2 in Days 31–60 via the Executor (re-check live state, idempotency, revert payload) behind an owner-written rule; **L3 only in Days 61–90, opt-in, after 30 days of L2 with a revert rate <5%** (§14).

### Job 3 — Daily metrics: 7am QA + 8am scorecard

- **Trigger (cron, owner timezone):** **05:00** Shopify pull → **05:30** Meta/Google pull → **07:00 QA walk** → briefing delivered **07:30** → **08:00 scorecard** card on Today.
- **7am QA walk (code + Haiku):** open every live product page with spend; walk the buying path (product → add-to-cart → checkout start); check checkout alive, images load, pixel firing **and Shopify orders >0 if spend >0**, price/discount codes match the plan, hero product in stock, mobile layout. Writes a **dated QA file** to the Store Brain.
- **8am scorecard (code maths, Haiku words):** revenue, orders, sessions; spend per channel (Meta/Google/TikTok); estimated profit and profit/order; **MER% 3-day + month-to-date vs target**; stance; RPV/CR/AOV vs 30-day average; new vs returning; CTR; ATC%; contribution; net profit; **CPA vs break-even per hero SKU**; refund rate; stock days on winners; email revenue share. Sources: Shopify orders, Meta/Google/TikTok spend, Klaviyo when connected (today: manual/example — **labelled**).
- **Exceptions worth interrupting (push / red-flag):** dead checkout; broken pixel; CPA above break-even for 3 days; stock-out on a winning product; refund spike; revenue/sessions down >40% vs the same weekday last week; ad account disabled / payment failed; an email/SMS about to go out with a broken link or wrong discount.
- **Logged silently (no interrupt):** normal variance inside the bands; held ads in learning; minor CTR drift; "nothing changed" days. The briefing must be **willing to be boring out loud** — "Nothing needs you today" is a valid briefing.
- **Credits (docs):** daily plan **$0.015**, approval card **$0.006**.
- **Failure cases:** any feed stale >24h → the profit number shows a **"stale — last synced [time]"** badge, never presented as fresh; a missing cost → **"profit estimate incomplete"**, never a fake precise number.

#### The 21-field `DayInput`, replaced field by field

Today the owner (or a CSV) must supply all 21 numeric fields in `src/lib/scorecard.ts`. Step 2/3 replaces them with auto-sync; manual entry survives **only** as a fallback for a missing field, and each prompt names the field and where it should have come from.

| # | Field (code name) | Label | Auto source | Manual fallback |
|---|---|---|---|---|
| 1 | `orders` | Orders | Shopify orders | Ask only if Shopify is not connected |
| 2 | `newCustomerOrders` | New-customer orders | Shopify (first-order flag) | Derived/omitted — do not ask the owner to count these |
| 3 | `units` | Units sold | Shopify line items | — |
| 4 | `sessions` | Sessions | Shopify Analytics / GA4 | — |
| 5 | `addToCarts` | Sessions with an add to cart (optional) | Shopify Analytics — **needs the Shopify connection** | — |
| 6 | `revenue` | Gross sales ($) | Shopify orders | Yesterday's revenue (1 of only 2 fields asked when unconnected) |
| 7 | `newCustomerRevenue` | New-customer sales ($) | Shopify (first-order flag) | — |
| 8 | `discounts` | Discounts ($) | Shopify orders | — |
| 9 | `refunds` | Refunds ($) | Shopify refunds | — |
| 10 | `cogs` | Product cost / COGS ($) | Store Brain per-SKU landed cost × units | Owner enters landed cost **once per SKU**; a missing cost blocks break-even for that SKU — never guess |
| 11 | `shipping` | Shipping and fulfilment ($) | Store Brain per-order shipping × orders (or 3PL/Shopify data) | Owner-entered per-order default, set once |
| 12 | `paymentFees` | Payment fees ($) | Fee % in Store Brain × revenue | Owner-entered fee %, set once |
| 13 | `adMeta` | Meta ad spend ($) | Meta Marketing API | Spend for that channel only, if Meta is not connected |
| 14 | `adGoogle` | Google ad spend ($) | Google Ads API | Same, per disconnected channel |
| 15 | `adTiktok` | TikTok ad spend ($) | TikTok Ads API | Same |
| 16 | `adOther` | Other ad spend ($) | None — no API | Owner-entered (the one genuinely manual spend field) |
| 17 | `otherMarketing` | Other marketing ($) | None | Owner-entered, optional |
| 18 | `metaRevenue` | Meta-attributed sales ($) | Meta Marketing API | — (shown for attribution comparison, never the verdict) |
| 19 | `googleRevenue` | Google-attributed sales ($) | Google Ads API | — |
| 20 | `tiktokRevenue` | TikTok-attributed sales ($) | TikTok Ads API | — |
| 21 | `source` / `example` | Provenance flags (not owner-entered) | Set by the sync job (`shopify` / `meta` / …); `example: true` on seeded data | The UI must badge any day whose data is example or stale |

Plus the non-`DayInput` settings the maths needs, held in Settings/Store Brain: `monthlyRevenueTarget`, `targetMerPct`, `fixedCostsMonthly` — entered once at onboarding, editable anytime. **Tax handling (already built):** where prices include GST/VAT, Helix divides every sales-type number by 1 + rate before any profit maths (Australia GST 10% on by default; NZ 15%; UK VAT 20%; US off); costs are untouched and raw numbers are stored as typed, so tax is never taken out twice.

### Job 4 — Stock, cash and operations

- **Trigger:** daily inventory pull; the `stock-ads` rule (<14 days of stock); a scale proposal on a winner; the Monday weekly review.
- **Data in:** Shopify inventory per SKU/variant; daily sales velocity (7-day + 30-day); supplier lead time + safety days (Store Brain); landed cost; cash inputs the owner provides monthly.
- **The maths (code, from `src/lib/stock.ts`):**

```
Daily sales velocity  v = units/day for the SKU
Reorder point         = v x (lead time days + safety days)        [safety days default 14]
Days of stock left    = on-hand ÷ v          ->  stock-out date = today + days left
Order-by date         = the day stock (on-hand + on-order) falls to the reorder point
Suggested order qty   = ceil( v x (lead time + safety days + 60 cover days) - stock position )
                        [60 = COVER_DAYS: days of sales each new order should cover after it lands]
Landed cost           = unit cost + freight/unit + duty % + other/unit
Status                = out / order-now (position <= reorder point) / order-soon / ok
```

- **Agent steps:** (1) Code computes days-of-stock per SKU. (2) **Reorder point = sales/day × (lead time + safety days)** → a reorder card with quantity, **order-by date**, supplier, estimated cost, and the **stock-out countdown** ("Hero SKU runs out in 11 days at current velocity; order by Friday"). (3) **Scale-blocking check:** before any scale card, if the winner has <14 days of stock the scale card is blocked and replaced with a "reorder first" card. (4) **13-week cash forecast** (code spreadsheet logic, Sonnet narrative): inflows from the sales trend; outflows = ad spend plan + COGS + known fixed costs — draft only, the owner edits the assumptions. (5) **Margin-checked offers:** every bundle/gift/discount proposal recomputes contribution and must stay **≥15%**, or the card shows red and cannot be approved without an owner override logged in Decisions. Free-shipping threshold = the smallest threshold where (AOV lift × margin) > shipping cost absorbed — computed per store, never a generic $75. Default to **bundle/gift over discount** ("discounts often drive margin away; try bundles and bonuses instead"); a discount only if code shows a bundle cannot reach the AOV target and contribution still holds ≥15%.
- **Supplier data the Store Brain holds:** factory vs trading company, MOQ, lead time, payment terms, country, contact; Black Friday **last safe order date** per product (BF date − (lead time + 7 days)).
- **Owner sees:** the reorder list (SKU, qty, order-by date, supplier, est. cost); the cash-forecast chart with its assumptions listed; offer cards with contribution before/after.
- **Auto vs never:** Auto — alerts, lists, calculations. **Never auto: ordering stock, contacting a supplier, changing a price.** The agent prepares; the owner orders.
- **Credits (docs):** constraint diagnosis **$0.065**.
- **Failure case:** velocity based on <7 days of data or a sale spike → the card is labelled **"low confidence — promo week"** and the quantity is shown as a range.

### Job 5 — Email/SMS, partnerships and seasonal / BFCM

#### 5a. Email and SMS — the pipeline

**Detect** (daily email-platform pull: which flows exist, are live, what they earn; compare against the core set and store data — replenishment only for consumables, VIP only once there are repeat buyers) → **Suggest** (an insight with evidence: checkouts started, recovered, revenue) → **Draft** (each message — subject, preview, body, SMS text — in the store's brand voice, plus timing, filters, exit conditions) → **Approve** (the full flow in the approval queue: messages, timing, discount logic, estimated AI cost) → **Set up** (templates, segments and the flow created via API **in draft status first**, live only after a final check; for Shopify Email / Shopify Flow, where API creation is limited, Helix prepares the content + a guided click-by-click setup and verifies once live) → **Watch** (weekly: revenue per recipient, conversion, unsubscribe, spam; A/B test suggestions on subject lines and timing).

**Guardrails:** no message goes live without approval; discounts follow the owner's offer rules (new customers only, never bigger than the public offer); SMS always carries opt-out and respects quiet hours; flows start in draft; everything is logged and reversible. **Status in the app today:** the page lists all flows with EXAMPLE status/revenue and the write calls are stubbed — Step 2/3 closes this. **Klaviyo check on every run:** if Klaviyo is not connected, the output is copy + timing to paste / guided setup, **labelled as such** — never presented as a live flow.

**Writing rules Helix follows:** one goal and one main button per email; subject lines under 45 characters; preview text adds new information; customer language from reviews, one review in most emails; plain-text style for founder notes, designed blocks for product emails; mobile-first (short paragraphs, big buttons, images under 1 MB); placeholders (`[Brand]`, `[Product]`) replaced from store data; **never invent claims, reviews or numbers**.

#### 5b. The 9 flows — full copy and timing table

Source of truth: `docs/email-automation.md`. All 9 are Growth-plan flows.

**1. Welcome series** — Trigger: joins the email/SMS list. Goal: first order. Exit: places an order. Discount rule: deliver the sign-up incentive in email 1; never send a bigger code later. Good = often 3–6% of store revenue once list growth is steady.

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | Immediately | Email | "Welcome in. Here's your 10% off" | Thanks for joining. Code WELCOME10, ready today. Why [Brand] started (one line). Best sellers: 3 products, one line each. |
| 2 | 1 day | Email | "Why people switch to [Brand]" | Three reasons customers give, each with a short review. Code still waiting. |
| 3 | 3 days | Email | "Your questions, answered" | Top 4 support questions: fit/sizing, shipping times, returns, care. Link to the guarantee. |
| 4 | 5 days | SMS | — | "[Brand]: your 10% code WELCOME10 ends tomorrow night. Shop: [link] Reply STOP to opt out" |
| 5 | 6 days | Email | "Last day for your welcome code" | Short reminder: best-selling product, top review, clear button. |

**2. Abandoned checkout** — Trigger: started checkout, no order within 1 hour. Exit: orders. Discount rule: **none in email 1; an optional small incentive in the last message, new customers only.** Good = commonly the highest revenue-per-recipient flow.

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | 1 hour | Email | "Did something go wrong?" | Cart items, a reassuring line on shipping/returns, one review. Button: Complete my order. |
| 2 | 4 hours | SMS | — | "[Brand]: your cart is saved. Free shipping over $[threshold]. Finish here: [link] Reply STOP to opt out" |
| 3 | 24 hours | Email | "Still thinking it over?" | Address the top objection (price, fit, delivery). Guarantee + 3 reviews. |
| 4 | 48 hours | Email | "A little something to help you decide" | New customers only: free shipping or a small gift. Returning customers get a reminder with no incentive. |

**3. Abandoned cart** — Trigger: added to cart, no checkout started within 2 hours. Exit: starts checkout or orders. Discount rule: none by default. Good = lower per-recipient than checkout recovery, larger volume.

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | 2 hours | Email | "You left something behind" | Product image, price, one benefit, one review, button back to cart. |
| 2 | 1 day | Email | "Pairs well with…" | Cart item + a complementary product/bundle that reaches the free-shipping threshold. |

**4. Browse abandonment** — Trigger: viewed a product 2+ times in 24 hours, no add-to-cart (known subscriber). Exit: adds to cart or orders. Discount rule: none. Good = high volume, lower conversion; helpful, not pushy.

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | 4 hours | Email | "Still deciding on [Product]?" | One-paragraph guide: who it suits, how it compares, top review. |
| 2 | 2 days | Email | "Our most loved picks" | Three related best sellers with short reasons. |

**5. Post-purchase** — Trigger: first order placed. Exit: second order. Discount rule: none in the thank-you; a loyalty/referral offer later. Good = improves repeat rate, reduces support tickets.

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | Immediately | Email | "Thank you, [Name]. Here's what happens next" | Founder thank-you, shipping timeline, how to get the best from the product. |
| 2 | Delivery + 2 days | Email | "How to get the most from [Product]" | 3 quick tips or a short video. Link to support. |
| 3 | 14 days | Email | "Customers who bought this also love" | Cross-sell from the first product. Loyalty or referral offer. |

**6. Review request** — Trigger: delivered + 7–14 days (based on how long the product takes to show results). Exit: leaves a review. Discount rule: an optional small reward for photo/video reviews is allowed (follow platform/local rules; **never pay for positive reviews only**). Good = review volume feeds product-page conversion and ad hooks.

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | Delivery + 10 days | Email | "Quick question about your [Product]" | Star rating inside the email; ask for a photo. Short and personal. |
| 2 | Delivery + 17 days | SMS | — | "[Brand]: how's your [Product]? A 30-second review helps a small business a lot: [link] Reply STOP to opt out" |

**7. Replenishment** — Trigger: days since order reaches the typical usage period (e.g. day 25 of a 30-day supply). Exit: reorders. Discount rule: subscribe-and-save rather than a code. Good = strong for consumables (skincare, supplements, food, pet).

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | Usage period − 5 days | Email | "Running low on [Product]?" | One-click reorder link; subscribe-and-save option. |
| 2 | Usage period | SMS | — | "[Brand]: time for a refill? Reorder in 1 tap: [link] Reply STOP to opt out" |

**8. Win-back** — Trigger: no order for 1.5–2× the typical repeat interval (e.g. 120 days). Exit: orders. Discount rule: lead with what's new; **incentive only in the final email**. Good = lifts repeat revenue and cleans the list.

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | Day 0 | Email | "It's been a while. Here's what's new" | New products, improvements, best sellers. No discount. |
| 2 | Day 7 | Email | "We saved you something" | Small incentive, clear expiry. |
| 3 | Day 14 | Email | "Should we stay in touch?" | One click to keep hearing from us; suppress non-engagers to protect deliverability. |

**9. VIP and loyalty** — Trigger: third order, or lifetime spend above the top-10% threshold. Exit: n/a (ongoing segment). Discount rule: early access, gifts and surprise perks over blanket discounts. Good = top customers often drive a large share of profit.

| # | When | Channel | Subject | Draft body |
|---|---|---|---|---|
| 1 | On qualifying | Email | "You're one of our favourite people" | Personal founder thank-you; VIP perks: early access to launches/sales, a gift on the next order. |
| 2 | Before each launch/sale | Email | "VIP early access starts now" | Early-access link (24 hours before everyone else); limited-quantity note if true. |

**Public-site note:** the homepage names only welcome, abandoned checkout and post-purchase publicly. The full 9 above come from your internal docs — do not market "9 flows" by name until the docs and the site agree.

**Credits (docs):** email draft **$0.015**, flow draft (5 emails) **$0.110**, weekly report **$0.080**.

#### 5c. Influencer and brand partnerships

- **Trigger:** Wednesday launch day / the monthly shortlist.
- **Data:** existing customers (Shopify), reviewers, social mentions, creator audience fit.
- **Steps:** code shortlists creators who **already bought or posted first**, then lookalikes by audience fit; Sonnet drafts the outreach + brief + the **partnership-ad permission ask** (whitelisting rights, term, fee/product). The owner approves the shortlist (top 3 highlighted) and **every outreach send**.
- **Auto:** tracking replies in the Work queue; suggesting a follow-up draft after 4 days with no reply.
- **Never auto:** agreeing a fee, sending a contract, posting creator content.
- **Failure case:** no customers who create content → the shortlist is labelled **"cold outreach — lower expected reply"**. Never fabricate "fans".

#### 5d. Seasonal and BFCM — the August–November timeline

The agent owns the dates; tasks land on Today. Source: Strategy 06 + Module 17/18 + SOP 15. **Every offer is margin-checked (contribution ≥15%) before it is proposed.**

| Month | Work |
|---|---|
| **August** | Look back at last year; set targets; test ad angles/creatives; build the email/SMS list; test offers. `peak-runway` fires from 10 weeks out if there is no plan |
| **September** | **Order stock 10–12 weeks out**; lock the offer; scale the winning tests |
| **October** | Finalise sale creatives; warm audiences; build email/SMS flows; load stock; **build sale campaigns switched off** |
| **November** | Freeze the site; test every code; hype; launch day; check daily; scale winners |
| **December–January** | Review; write next year's test plan |

Also owned by the agent: **Christmas gifting** (2–3 gift bundles, gift guide, delivery cut-offs shown everywhere — lift AOV without discounts) and **Valentine's / Mother's Day** (6–10 giftable products, free gift above a computed threshold, no store-wide discount). Seasonal alerts surface on Today and the home page at the right lead time (Black Friday from 12 weeks, Christmas cut-offs 8, Boxing Day/New Year 5, Valentine's 6, Mother's Day 8, EOFY 6, Father's Day 7), with an "Add the prep plan" action that inserts dated, tick-off steps. If a store joins after a deadline has passed, the plan is compressed honestly — **never backdate a stock deadline that has already passed**; flag "stock window missed — here's the revised plan".

---
## 12. Pricing that never loses money

Your own design in `docs/pricing.md` is the foundation — use it verbatim where it conflicts with any modelled estimate:

> **"Helix never loses money on any step. Free usage is hard-capped. Paid AI usage is either inside a plan allowance priced into the subscription, or prepaid in a wallet at 2× provider cost. Ad spend always runs on the customer's own ad accounts and payment methods."**

All costs below are **estimates in USD**, from list prices for hosted models as of October 2026, to be re-measured from real `usage_events` in the first month of beta.

### 12.1 Model tiers and list prices used

| Tier | Model | Input / Output per 1M tokens | Used for |
|---|---|---|---|
| 0 | No LLM (SQL and rules) | $0 / $0 | Ratios, grades, thresholds, alerts |
| 1 | Gemini Flash-Lite | $0.10 / $0.40 | Extraction, tagging, classification, page summaries |
| 2 | Claude Haiku 4.5 | $1.00 / $5.00 | Daily plan wording, chat, drafts, guides |
| 3 | Claude Sonnet 5.5 | $2.00 / $10.00 | Weekly report, diagnosis, structure proposals, escalations |

*Version note:* the coach code routes Haiku 5.5 / Sonnet 5 / Gemini 3.8 Flash, while the pricing doc lists Haiku 4.5 — align docs, code and this plan to **one named, pinned version list** and re-verify prices on provider pages before launch (models retire fast).

### 12.2 Per-action costs — the exact table

Token counts are estimates for a typical store, including SOP retrieval context. "With buffer" adds 50% for retries, longer stores and variance. Prompt caching should reduce real costs further — these are deliberately conservative.

| Action | Model mix (in / out tokens) | Provider cost | With 1.5× buffer | Billed from wallet (2×) |
|---|---|---|---|---|
| **Store audit** | Tier 1: 25k / 3k; Tier 2: 12k / 2.5k | **$0.028** | $0.042 | $0.08 |
| **Daily plan** | Tier 0 rules; Tier 2: 9k / 1.2k | **$0.015** | $0.023 | $0.04 |
| Daily plan (Tier 1 fallback) | Tier 1: 9k / 1.2k | $0.0014 | $0.002 | n/a |
| **Chat message** | Tier 2: 6k / 0.5k | **$0.0085** | $0.013 | $0.02 |
| **Chat message, deep** | Tier 3: 15k / 1.2k | **$0.042** | $0.063 | $0.13 |
| **Approval card** (pause / budget) | Tier 0 rules; Tier 2: 4k / 0.4k | **$0.006** | $0.009 | $0.02 |
| **Ad batch draft (8 ads)** | Tier 3: 18k / 4k; Tier 2 check: 8k / 0.8k | **$0.088** | $0.132 | $0.26 |
| Email draft | Tier 2: 7k / 1.5k | $0.015 | $0.022 | $0.04 |
| **Flow draft (5 emails)** | Tier 3: 20k / 7k | **$0.110** | $0.165 | $0.33 |
| Shopify theme edit draft | Tier 3: 30k / 5k | $0.110 | $0.165 | $0.33 |
| **Weekly report** | Tier 3: 25k / 3k | **$0.080** | $0.120 | $0.24 |
| Constraint diagnosis | Tier 3: 20k / 2.5k | $0.065 | $0.098 | $0.20 |
| Review tagging (200 reviews) | Tier 1: 40k / 8k | $0.007 | $0.011 | $0.02 |
| Adapt a trend card | Tier 2: 5k / 0.8k | $0.009 | $0.014 | $0.03 |
| Executing an approved action (API write) | No LLM | $0 | $0 | n/a |
| AI image variant (optional, later) | Image model | ~$0.02–$0.08 per image | — | 2× provider cost |

Shared costs (not per user): trends feed ~$0.30/week in model cost plus human review; SOP embeddings under $0.01 per full re-index.

### 12.3 Plans

| | **Free — $0** | **Starter — $29/mo** | **Growth — $59/mo** |
|---|---|---|---|
| Store audits | 3/month | Unlimited re-audits (cached weekly) | Unlimited re-audits (cached weekly) |
| Daily plans (Today) | 3/month | Every day | Every day |
| Guides ("I'll do it") | Yes | Yes | Yes |
| Scorecard | Manual entry | Auto from Shopify + Meta | Auto from Shopify + Meta; Google Ads guided setup |
| Approvals + bot actions | No | Yes — **Meta** (paused drafts you launch) | Yes — Meta; Google as it ships |
| Email/SMS flow drafts | Guides only | Guides only | **Yes** |
| Weekly agency-style report | No | No | **Yes** |
| Site edit drafts with preview | No | No | Yes (beta) |
| Trends feed | Read only | Read + "adapt" | Read + "adapt" |
| Chat | 10 messages/month (cheap model) | Within AI allowance | Within AI allowance |
| **AI allowance (at provider cost)** | Hard cap ~$0.30–$1 total | **~$3/month** | **~$8/month** |
| Extra AI | Not available | Prepaid wallet at 2× | Prepaid wallet at 2× |
| Team seats | 1 | 2 | 5 |

Starter allows **one ad platform only** — it keeps support/sync costs low and gives a clear reason to upgrade. In the UI the allowance shows as "AI usage included" with a progress bar, not a dollar figure, unless the owner opens details. Annual plans (e.g. two months free) still clear 70%+ contribution. A done-with-you human review add-on is **not** in v1 — revisit after 50 paying stores.

### 12.4 Margin — the worked numbers

**Free (worst realistic case):** 3 audits $0.13 + 3 daily plans $0.07 + 10 chats $0.13 + crawl/email/storage $0.05 = **~$0.38**, inside a **$0.60 hard cap** (the cost guard pauses features at $0.60 of model cost until next month). Same-URL audits are cached 7 days, so repeat audits by abusers cost nothing extra. This is acquisition cost, budgeted as such.

**Starter ($29):** typical AI use with buffer — 30 daily plans $0.68, 60 chats $0.77, 5 deep chats $0.32, 40 approval cards $0.36, 2 ad batches $0.26, 1 audit $0.04, 4 trend adaptations $0.05 = **~$2.48 of AI inside the $3 allowance**.

| Starter line | Amount |
|---|---|
| Price | $29.00 |
| Stripe (2.9% + $0.30, plus 0.7% Billing) | −$1.34 |
| AI allowance, fully used | −$3.00 |
| Hosting, database, queues, sync, email, monitoring | −$1.00 |
| Support allowance | −$1.50 |
| **Contribution** | **~$22.16 (76%)** |

**Growth ($59):** typical AI use with buffer — 30 plans $0.68, 120 chats $1.53, 15 deep chats $0.95, 4 weekly reports $0.48, 1 diagnosis $0.10, 80 approval cards $0.72, 4 ad batches $0.53, 4 emails $0.09, 1 flow $0.17, 2 theme edits $0.33, review tagging $0.01, 2 audits $0.08, 8 trend adaptations $0.11 = **~$5.78 of AI inside the $8 allowance**.

| Growth line | Amount |
|---|---|
| Price | $59.00 |
| Stripe | −$2.42 |
| AI allowance, fully used | −$8.00 |
| Hosting and sync (heavier: two ad platforms + an email platform) | −$1.50 |
| Support allowance | −$2.50 |
| **Contribution** | **~$44.58 (76%)** |

If prices are shown GST-inclusive in Australia, net revenue is price ÷ 1.1 (Starter $26.36, Growth $53.64) and contribution is still positive at ~$19.50 and ~$39.20.

**Wallet top-ups (prepaid, billed at 2× provider cost):**

| Top-up | Stripe fee (est.) | Provider cost the user can consume | Helix margin |
|---|---|---|---|
| **$10** | $0.59 | $5.00 | **$4.41** |
| $25 | $1.03 | $12.50 | $11.47 |
| $50 | $1.75 | $25.00 | $23.25 |

A $5 top-up would still be positive ($2.50 − $0.45), but **$10 is the recommended minimum** because of the fixed card fee. Wallet rules: prepaid only ($10 / $25 / $50); at $0 the AI extras stop while the scorecard, rules-based alerts, guides and already-generated approvals keep working; **no auto top-up by default** (if added later: opt-in, with a monthly ceiling); the app shows the estimated cost before any wallet-funded action and the actual cost after.

**Margin warning from the code:** the coach caps are currently the only protection — a Growth user sending 800 deep Sonnet messages is ~$32/month against a $59 plan. And the $25/mo (write-ups) and $50/mo (coach) **global shared budgets are a first-come-first-served pool**: one heavy user can starve everyone, and the pool says nothing about per-store margin. Keep a global budget only as a **circuit breaker** (alert + pause expensive tasks), never as the margin system. Margin must be **per-store, per-action, pre-paid**.

### 12.5 Weekly-expiring credits — reconciling the two cap systems

Do not conflate the two counters that exist today: **(A)** Coach messages (Free 20 / Starter 300 / Growth 800 per month) and **(B)** AI write-ups (3 / 50 / 150 per month). **Replace both with one credit ledger:**

- **Subscription credits expire weekly** — weekly buckets expiring **Sunday 23:59 in the owner's timezone** (Growth gets a 1-week grace: last week's unused credits are usable in week 1 of the next, then gone). Weekly matches the owner's cadence, caps liability to one week, and avoids Helena's monthly-reset cliff (§9).
- **Price the weekly pack at the cap, not at typical use.** Credits are priced at **≥2× the provider cost of the actions they cover at their maximum token/tool budget**, keeping ≥70% contribution. Illustrative mapping at $0.10/credit face value for legibility — briefing/QA 1 credit, ad copy 1, store-check summary 2, email flow 2, campaign build 5, escalated/Opus task 10 — then **verify each against the §12.2 cost ×2 at cap**; if a task's cap cost exceeds its credit price, raise its credit price or downgrade its model. Never subsidise from the subscription.
- **PAYG top-up credits expire 7 days after purchase** ($10 = 100 credits at the illustrative face value).
- **Bucket order:** free cap → plan allowance (weekly credits) → wallet.
- **Hard task caps:** max tokens per tier, max tool calls (~25), max wall-clock (5 min for a draft, 15 min for a plan). On hitting a cap: stop and report partial work — **never loop-retry on the owner's credits**.
- **Worst-case check:** even if a Growth owner burns a full week's credits entirely on the most expensive capped task, the $59 subscription covers the maximum credit burn at 2× pricing **by construction** — because the credits were priced at cap, not typical use. Measure real tokens per task in a 4-week pilot on 10–20 stores before locking credit prices publicly.

### 12.6 The 10 never-lose guarantees (from `docs/pricing.md` §5)

1. **Pre-flight estimate.** Before every LLM call, the cost guard estimates the maximum cost (input tokens counted, output capped by `max_tokens`).
2. **Reserve, then charge.** That maximum is reserved from the allowance or wallet (a hold in `wallet_ledger`); after the call the real cost is charged and the rest released.
3. **Order of buckets:** free cap → plan allowance → wallet. If the next bucket cannot cover the reservation, the action does not run and the user sees why, and what it would cost.
4. **Hard caps per call and per day:** max tokens per tier, max deep-chat turns per day, max audits per hour per org.
5. **Downgrade before stopping (free users):** as the free cap nears, plans fall back to Tier 1, then to rules-only text.
6. **No silent upgrades:** the router never moves a request to a pricier tier unless the bucket can pay for it.
7. **Caching:** audits cached per URL for 7 days; SOP and store-context prefixes use prompt caching; trend cards generated once for everyone.
8. **Abuse controls:** email verification, disposable-email block, one free store per domain, captcha on anonymous audits, rate limits.
9. **Daily margin dashboard (admin):** revenue, provider cost and margin by plan, by feature and by org; alerts if any org's cost passes 80% of its allowance in the first half of the month.
10. **Refund-safe:** wallet credits are prepaid and drawn down as used; subscription refunds only for unused time, never for consumed AI.

**Explicitly not doing:** no free agent tier; no unlimited flat fee (the Cursor lesson); **no GMV escalator** (the Triple Whale lesson); **no outcome/profit-share pricing** (Sierra's unit does not transfer — attribution disputes, and Helix would carry Meta-auction risk); no 12-month lock-in. Model prices change often — the router reads prices from a config table so margins update without a deploy.

---
## 13. Model recommendation

**Recommendation: Claude Sonnet (pinned version — 5.5 in the docs/research pricing, $2 in / $10 out per MTok) as the default, on LangGraph, with Haiku for cheap tasks and Opus only on escalation.** This is a consolidation, not a greenfield: Helix today uses Gemini for write-ups and Claude Haiku/Sonnet + a Gemini fallback for the coach, both via the Vercel AI Gateway. Make Claude the default, keep Gemini as fallback #2, and keep the gateway/router abstraction.

| Role | Model | Jobs |
|---|---|---|
| **Default** | **Claude Sonnet 5.5** | Diagnosis, weekly report, campaign/flow builds, structure proposals, deep chat |
| Cheap tasks | Claude Haiku (Tier 2 in the pricing doc; the coach's fast model) | Daily plan wording, briefing words, chat default, drafts, supervisor checks, extraction-after-answer for memory |
| Escalation only | Claude Opus | Only when Sonnet confidence is low or the owner taps "think harder" — gated by allowance/wallet, priced at the top credit band (§12.5) |
| Tier 1 volume work | Gemini Flash-Lite | Extraction, tagging, classification, page summaries, review tagging |
| **Fallback 1** | **GPT-5.4** (mini for cheap tasks) | Provider outage / quality regression. Do **not** build on GPT-5 — it deprecates 11 Dec 2026 in the research trackers |
| **Fallback 2** | **Gemini 3 Pro / Flash** | Long-context work (Pro) and cheap volume (Flash). Keep prompts under 200k tokens — the research notes a whole-request price cliff above 200k |
| **Fallback 3** | **Kimi K2 / Qwen** (open-weight, via Bedrock/OpenRouter) | Cost, data-residency or provider-outage cover only — cheapest tokens, thinner agent scaffolding |

**Why Claude as default:** the strongest tool-use record in the research sources (τ-bench / SWE-bench, vendor-reported and secondary — not like-for-like independent tests); the Agent SDK's per-tool permissions gate, compaction and subagents fit the approvals architecture; **MCP originated at Anthropic**, and Shopify/Meta/Klaviyo publish MCP servers built around Claude as the reference client; and Anthropic's API terms (no training on customer content by default) match Helix's published promise word for word. **Trade-off, stated plainly:** Sonnet is ~2–10× the token price of Gemini Flash / open-weight models — which is exactly why the tiered routing (§7.1) and the credit design (§12) exist.

**Why LangGraph:** model-agnostic orchestration with `interrupt()` for durable pause/resume — an approval *is* an interrupt that may wait 24 hours. The agent must be swappable by model, not rebuilt: fallbacks swap the model behind the same graph interface. Claude Agent SDK patterns (permissions gate, compaction, subagents, session store) are adopted where they fit, without single-vendor lock-in.

**Official MCP servers to use:** Shopify, Meta Ads, Google Ads, GA4, Klaviyo.

**Competitor models — do not invent:** Sierra's own blog lists GPT-4o, Claude 3.5 Sonnet, Gemini + smaller models. For Coframe Inc, Clay, Legora, Triple Whale Moby and Helena, **no primary model disclosure was found** in the research. (A namesake "Coframe Core" open-source project is a different project — do not attribute it to Coframe Inc.)

**Store Brain memory (§7.2) is part of the model choice:** deterministic facts in the database, injected as a cached prompt block; session memory (transcript + compaction) for the current task; write-back after every task; contradictions flagged, never silently overwritten.

---

## 14. Gated 30 / 60 / 90-day execution plan

Each phase ends at a **gate**. Do not proceed past a gate on enthusiasm — proceed on the gate's evidence.

### Days 1–30 — Kill the front door, ship Today v1, prove one win *(Steps 1–2)*

**Week 1 — Freeze and measure**
- Freeze new lessons/pages. Add analytics: activation (audit → connect → first card viewed), time-to-first-win, credits/tokens per task by model.
- Verify the coach flags in production (resolve the STATUS.md contradiction, §4.3) and every integration gate (Shopify/Meta/Google keys present or not) — write the truth table and share it internally.
- Reconcile the conflicts in §8 (batch size 4–8, briefing 7:30, pinned model names/prices, 30 modules) into one source-of-truth file linked from `product-design.md`.

**Week 2 — Today v1 + first real pulls**
- Ship Step 1 (§1): Today as the new home (profit big number in code, stance, 3 bullets, 1 job card, Store Brain strip, Compound Score + streak). Demote Dashboard/Learn/Numbers to secondary nav; keep all 46 pages reachable, just not first.
- Real pulls (P0): Shopify daily 05:00 (orders, inventory, sessions where available); Meta daily 05:30 (spend, CTR, frequency). Wire `mer-drift`, `fatigue`, `stock-ads`, `ad-good-site-bad` to real signals first — highest value, data you already sync. Remove the EXAMPLE label **only** for rules now on real data.

**Week 3 — Agent v1 (L1 only) + credit ledger v1**
- LangGraph graph: sync → metrics/rules → router/cost guard → RAG → `read_*` → `draft_ad_batch` / `draft_pause_ads` (paused) → approval card → Executor (paused creation / pause only, via the existing guardrails). Coach moves from the floating widget to the Ask page, with the Store Brain injected (cached). Feature-flag the agent per store.
- One ledger replacing the separate write-up/coach counters **for agent tasks** (keep the legacy counters for non-agent write-ups until migration completes, and label them in the billing UI so owners are not double-confused). Implement: pre-flight estimate, reserve-then-charge, weekly bucket expiry Sunday 23:59, wallet top-up $10 minimum at 2×, hard task caps, the downgrade path, and the internal daily margin dashboard. Global budgets become circuit-breaker alerts at 80%.

**Week 4 — Paid design partners**
- Recruit **5 stores** ($10k–$30k/month, already on Starter/Growth) as a **paid** pilot (discounted, not free — serious only). Embed: a shared Slack per store; watch them use Today for 2 weeks.
- Reverse demos for the next cohort (Clay): "Bring your worst ad — we rebuild it as a paused draft in 30 minutes, on your screen."
- Pilot success metrics: first win in 24 hours; ≥4 Today opens/week by week 3; **approval rate ≥40%**; **revert rate <10%**.

**🚪 Day 30 gate — do not proceed to L2 until ALL hold:** real Shopify + Meta pulls stable for 14 days; the golden set (50 scenarios, §15) passing; per-task cost measured and credit prices at cap verified ≥2×; 5 pilot stores retained.

### Days 31–60 — Assisted autonomy, creative refresh, flows that ship *(Step 3, first half)*

- **L2 Assisted:** owner-written auto-pause rules UI in plain language ("Pause any ad with >$X spend over Y days and return <Z"). The Executor auto-pauses **only** under a saved rule, notifies within 15 minutes, undo for 7 days. Never auto-spend-up.
- **Creative refresh + Video (Job 1):** script + assembly drafts (3 variants, 9:16, captions, voiceover), review queue with thumbnails, manual packet fallback, per-channel "Let Helix post" opt-in (default off). Fatigue trigger wired to real Meta data.
- **Email flows — drafted in the platform:** Klaviyo OAuth; `draft_flow` writes a **draft flow only**; Shopify Email stays guided click-by-click, labelled. Ship **Welcome + Abandoned Checkout first** (highest revenue), then Cart/Browse, then the rest in docs order. Watch-weekly job + the `email-gap` rule on the real daily Klaviyo pull.
- **Morning loop hardening:** 07:00 QA walk on real pages (checkout, pixel-vs-orders cross-check); 07:30 briefing by email + in-app (WhatsApp only if a provider + consent path is actually built — do not promise a channel you have not shipped); the "Nothing needs you today" briefing variant.
- **Google Ads:** finish paused Search drafts + `draft_negative_keywords` from `search-term-waste`, or keep the surface hidden. Re-verify developer-token status.
- **Weekly report:** Monday 06:00 agency-style report (headline, scorecard, what we did, what we learned, what's next, roadmap progress, one question for the owner — the check-in reply goes into the store's context) — replacing "coming soon".

**🚪 Day 60 gate:** L2 revert rate **<5%**; Klaviyo draft flows live in ≥3 pilot stores; video drafts approved ≥30% of the time; the margin dashboard shows **≥70% contribution on agent costs for 4 consecutive weeks**.

### Days 61–90 — Partnerships, the BFCM engine, re-price and re-launch *(Steps 3–4 completed)*

- **L3 Autonomous (opt-in only):** scale winners ≤20%/day to the owner's cap, for stores with 30+ days of L2, no red flag in the last 14 days, and stock ≥14 days on the scaled SKU. Daily L3 report; the kill switch is prominent on Today; **any revert pauses L3 for that store** pending owner re-enable.
- **Partnerships loop:** creator shortlist from customers/reviews, outreach drafts, reply tracking in Work, the partnership-ad permission template. **Agencies/VAs as distribution (Clay):** a "run Helix for clients" view (multi-store Work queue, per-store guardrails unchanged) — they bring the stores.
- **BFCM engine:** timeline tasks generated from 1 Aug (or from the join date if later, compressed honestly — §11, Job 5d). Sale campaigns built switched-off in the October pattern; offer margin checks enforced.
- **Community:** one public support community (Slack or Discord — pick one you will staff daily; Clay's lesson: public support becomes content). Founder milestone posts weekly (Lovable's lesson) — **only if you will actually do it weekly; otherwise don't start**.
- **Re-price and re-launch:** lock credit prices from pilot data; publish the pricing page with weekly expiry explained plainly ("Credits refresh every Monday — use them or lose them"); launch the §17 homepage with 5 real customer mornings (with permission and real numbers).

**Day 90 metrics to publish internally:** activation %, week-1 retention, Today opens/week, approval/revert rates, **cost per active store per day**, contribution margin, churn vs the old dashboard cohort.

### Cut-or-finish list — decide per item; leave no "coming soon" in the nav

| Item | Decision required |
|---|---|
| Google Ads paused Search drafts | Finish behind `assertPaused`, or hide |
| TikTok sync + GA4 sessions | Hide until the `TIKTOK_ADS=1` path is tested |
| Klaviyo connect/send | Finish draft-only in Days 31–60, or label copy-to-paste |
| Shopify Email connect | Guided click-by-click is honest — label it as such |
| Weekly report | Ship the Monday 06:00 report (mostly code + one Sonnet narrative) |
| Push notifications | Ship the §5.5 notification types, or remove the promise |
| Trends | Add a live refresh job, or date-stamp "Week of 5 Oct 2026 — static" visibly |

---
## 15. Verification — Step 5 in detail

Verification runs at the end of **every** step, not only at the end of the build.

### 15.1 Per-step technical checks

- [ ] `npx tsc --noEmit` — clean, no type errors.
- [ ] Full test suite passing (the repo's suite; Step 1 already touches `tests/coach.test.ts` for the new coach default).
- [ ] Lint clean.
- [ ] **Local run:** the app boots locally, Today renders with the scorecard strip, stance, ≤3 tasks, one learning card and the Store Brain panel; approvals render; the coach answers with the flag unset and stays off with `HELIX_COACH=0`.
- [ ] Guardrail test: attempt (in test) to create an active campaign and to write a budget on a live entity — both must throw.
- [ ] Cost-guard test: an action whose reservation exceeds the available bucket must not run, and must tell the user why and what it would cost.

### 15.2 The golden set — 50 store scenarios

A fixed set of **50 anonymised store scenarios** with expected diagnoses and expected tasks, run on **every prompt or model change** (from `docs/product-design.md` §13, Evaluation). It must cover, at minimum:

- Each of the **17 audit rules** firing, and not firing just below its threshold / minimum sample.
- Each **stance** (Push / Careful push / Hold / Defend / Not enough data).
- Each **ad grade** (Star / Steady / Passenger / Drain), including the layer multipliers (Cold 2.0 / Mixed 1.25 / Warm 1.0 / Hot 0.75).
- The **dead-checkout** case: spend firing, pixel healthy, Shopify orders zero → "data unreliable — do not scale", no money-moving proposal.
- **Stale feed** (>24h) → stale badge, no fresh-looking profit number. **Missing landed cost** → break-even blocked for that SKU, no guessed number.
- **Stock blocking:** a scale proposal on a SKU with <14 days of stock → replaced by a reorder card.
- **Discount discipline:** no flow draft may put a discount in checkout email 1, or offer one to a returning customer, or exceed the owner's public offer.
- **Margin discipline:** an offer that takes contribution below 15% cannot be approved without a logged owner override.
- **"Nothing needs you today"**: a healthy, in-band store produces a boring briefing and zero invented tasks.

### 15.3 Operating metrics — tracked from the first pilot store

| Metric | Target / use |
|---|---|
| **Approval rate** (cards approved ÷ cards shown) | Pilot target ≥40% (Day 30); a falling rate means the agent is proposing the wrong work |
| **Revert rate** (actions undone ÷ actions executed) | <10% in the pilot; **<5% required for L2→L3**; any L3 revert pauses L3 for that store |
| **Cost per active store per day** | From `usage_events`; must keep contribution ≥70% (§12.4) |
| Task completion rate; owner-rated usefulness | Per task type; feeds which jobs get built next |
| Time-to-first-win; Today opens/week; week-1 retention | Activation and habit (§5, §9.2) |
| Per-task token/cost by model | Feeds the §12.5 credit prices at cap — measured, not estimated, before prices are locked |

---

## 16. Risks, blockers and known gaps

### 16.1 Live credentials and external approvals needed

| Blocker | Needed for | Status |
|---|---|---|
| **AI Gateway key** (`AI_GATEWAY_API_KEY`) | Coach embeddings + live model calls in the build environment | Noted in STATUS.md as **not set in Vercel (checked by name) and not on the box** at the time of the 27 Oct entry; coach embeddings (797 chunks) were later run via AI Gateway OIDC. **Re-verify before Step 2/3 work that calls models.** A dry run put a full re-embed at well under $0.01 — cost is not the blocker, access is |
| **Meta app review** (`ads_read` / `ads_management`) | Real Meta pulls and paused-draft creation for all stores (not just early testers) | The gating item for Step 2 Meta. Until approval: early testers only |
| **Google Ads** developer token + client ID/secret | Live Google pulls and paused Search drafts | Developer tokens noted as **sunset 9 Sep 2026** in the code audit — re-verify the current token path before building on it |
| **Shopify `read_all_orders` scope** | Full order history (beyond the recent-orders window) for cohorts, repeat rate and LTV | Request with the read-only connection; the rest of the Shopify read sync does not depend on it |
| **Klaviyo** OAuth / API access | Flow read pull (Step 2) and draft-flow writes (Step 3) | Code exists but throws "coming soon"; no sending today |
| **TikTok** app review + Content Posting API authorisation | TikTok pulls and Job 1 posting | Posts may land as private/draft — the fallback is designed in (§11, Job 1) |
| **Course video storage ~14GB** | Hosting/serving the course video library that sits behind the Learn content | A real infrastructure cost and migration item — budget and locate it before any hosting move; it is not part of the agent build, but it cannot be discovered mid-migration |
| **Stripe live test** | Wallet top-ups, plan changes, the credit ledger's money path | Test the full top-up → reserve → charge → $0-stop path in live mode (small amounts) before any paying pilot store touches the wallet |

### 16.2 Known gaps — flagged, not invented

- **Modules 12 / 28 / 29 titles** were not retrieved publicly; lesson-number gaps exist in modules 3 / 6 / 8 / 9 / 17 / 24. Audit them in the repo before training (§8).
- **28 vs 30 modules:** `product-design.md` says 28; the live Learn index and the playbook directory show 30. Use 30; fix the doc.
- **STATUS.md coach-live contradiction:** "off in prod" (older) vs "LIVE, flags set to 1" (27 Oct 2026). Verify the Vercel environment; Step 1's new default (§1.2B) makes the code side unambiguous, but production env vars still decide what users actually get.
- **Model version drift:** pricing doc (Haiku 4.5) vs coach code (Haiku 5.5 / Sonnet 5 / Gemini 3.8 Flash) vs research trackers (Sonnet 5.5; Sonnet 4.5 retiring 30 Nov 2026; GPT-5 deprecating 11 Dec 2026). Pin one list; re-verify prices on provider pages before launch.
- **Test-batch size conflict:** 3–6 (public) vs 4–8 (daily plan). Decision: 4–8; update public copy.
- **Briefing-time conflict:** 7:30 (product-design notifications) vs 8:00 (Helena-style scorecard). Decision: QA 07:00 internal, briefing delivered 07:30, scorecard card on Today by 08:00; state 7:30 as the owner-facing time everywhere.
- **Public vs internal email flows:** the homepage names 3 of the 9 flows. The full 9 in §11 come from internal docs. Align before marketing them.
- **Helena's credit figures and task costs** come from secondary sources in the research; Helix's own §12.2 table is the pricing source of truth.

### 16.3 Product risks

| Risk | Mitigation in this scope |
|---|---|
| Agent proposes work on bad data (Helena's dead checkout) | Cross-source checks (pixel vs Shopify orders), stale badges, "data unreliable" state that blocks money-moving proposals (§11, Jobs 2–3) |
| Owners don't trust automation with money | Paused-only by default; the earned autonomy ladder; written guardrails the owner can read; one-tap undo; a kill switch (§11, Job 2) |
| Heavy users erase the margin | Per-store, per-action, prepaid credits priced at cap; weekly expiry; downgrade-before-stopping; the global budget demoted to a circuit breaker (§12) |
| Small-store statistics make tests inconclusive | Coframe's rule — inconclusive stays inconclusive; default to creative/offer/email tests; minimum samples in every audit rule (§6.5) |
| Platform policy / API change (Meta, TikTok, Google) | Official APIs + MCP servers only; manual-packet and guided fallbacks that are honestly labelled; verify-at-build notes in Job 1 |
| The build stalls on Muse credits | Step-by-step delivery with a verification gate per step (§2, §15) — a paused build still leaves a working, verified Step 1 |

---

## 17. Homepage and go-to-market

**The current homepage sells the overwhelm** — Attract/Convert/Grow, the 9-rung ladder and the 8 strategies, all in public. Replace it with:

- **Hero:** the Morning Briefing as a real screenshot/video — the profit number, 3 bullets, 1 job card. Headline = the job: *"Helix checks your profit every morning, tells you the one thing that will move it today, and does it for you."*
- **Proof line:** "Yesterday's profit, today's job, done for you." + the 10-minute onboarding promise + first win in 24 hours.
- **Three outcomes only:** more profit, less wasted spend, hours back. (Do not copy vendor numbers you have not earned — Helena's claimed traffic/time figures in the research are secondary vendor claims. Publish your pilot stores' real mornings instead, with permission and real numbers.)
- **Move** Learn, Dashboard, Trends, FAQ, the ladder and the 8 strategies to the footer / in-app only.

**GTM motions to run:** weekly **reverse demos** (Clay); **paid design partners** per cohort (Sierra); **agencies/VAs as a channel** (Clay); a **public community as support**. No enterprise sales motion; no high-ticket coaching funnel (Ecommerce Equation's economics do not fit $29–$59).

**The three product screens, restated as the launch story:** Today is the product. Work is the queue. Ask is secondary. Learn lives inside the job as a 60-second explainer. Without L2/L3 autonomy Helix is a nicer dashboard at $29/month; with it — auto-pause losers, scale winners ≤20%/day inside a cap the owner sets — it is positioned against a ~$3k/month agency retainer.

---

## 18. Checklists

### 18.1 Before Step 2 starts

- [ ] Step 1 verified (§15.1) and committed locally on `helix-agent-pivot`
- [ ] Integration truth table written: which of Shopify / Meta / Google / TikTok / Klaviyo keys exist, per environment
- [ ] Meta app review status confirmed for `ads_read` / `ads_management`
- [ ] Shopify scopes confirmed, including the `read_all_orders` request
- [ ] Google Ads developer-token path re-verified
- [ ] AI Gateway access confirmed for the build environment
- [ ] Muse credit position checked (§2) — enough left, or a reset/upgrade decision made

### 18.2 Before any store goes past L1

- [ ] Owner has set: daily spend cap per platform, never-pause list, discount ceiling, banned words
- [ ] Break-even CPA computed in code for every hero SKU (no guessed costs)
- [ ] Stock ≥14 days on any SKU the agent may propose scaling
- [ ] Golden set passing, including the dead-checkout and stale-feed scenarios
- [ ] Undo tested end-to-end on a real pause

### 18.3 Before launch / re-pricing

- [ ] 4 weeks of measured per-task costs; credit prices verified at cap ≥2×
- [ ] Stripe live test of the wallet path completed
- [ ] Pricing page explains weekly expiry in plain words
- [ ] No "coming soon" left in the nav (§14 cut-or-finish list decided, item by item)
- [ ] EXAMPLE badges removed only where the data is now real — and nowhere else

---

*Sources inside this document: the repo at `~/workspace/ecommercehelix` (`docs/pricing.md`, `docs/product-design.md`, `docs/execution-model.md`, `docs/audit-engine.md`, `docs/email-automation.md`, `docs/compound-daily-plan.md`, `STATUS.md`, and the Step 1 diff on `helix-agent-pivot`); the deep-research report at `~/workspace/research_notes/ecommercehelix-pivot-research-20261119-0530/report.md` (per-company sources are listed there); and the web pivot plan built 19 Nov 2026, which this document expands.*
