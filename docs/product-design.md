# Ecommerce Helix: product design

Helix should feel like a great agency account manager: it knows your numbers, tells you the one thing to do next, explains why in plain words, offers to do it for you, and never acts without asking. This doc covers the experience, the screens, the data model and the agent architecture for the v1 web app (responsive, desktop and mobile web), with PWA push approvals in month 2.

---

## 1. Design principles

1. **One lesson, one topic, one action.** The Today screen shows the day's curriculum step (short lesson, topic, action, "I'll do it for you") plus at most two insights from the latest audit. Everything else waits on the Roadmap. See [daily-curriculum.md](daily-curriculum.md).
2. **Why, how, how long.** Every task has a one-line reason tied to a number, a time estimate and a checklist.
3. **Two buttons.** **Do it for me** (Helix prepares, you approve) or **I'll do it** (step-by-step guide). A third, quieter **Skip** teaches Helix your preferences.
4. **Ask before acting, and never switch on spend.** No write action reaches Meta, Google, Shopify or the email platform without an explicit approval with preview, cost estimate and undo. Campaigns are pushed as **paused drafts** and the owner presses Launch; budget edits on live campaigns are always made by the owner. See [Execution model](execution-model.md).
5. **Speak human.** No jargon without a tooltip. Show money, not acronyms, first ("You made about $186 yesterday").
6. **Show progress.** Compound score, streaks and a visible roadmap make small daily work feel like it adds up, because it does.
7. **Honest by default.** Label estimates as estimates. Say when data is missing. Never invent benchmarks for a store we cannot see.

---

## 2. Onboarding: URL to first-week plan in under 5 minutes

**Flow**
1. Landing page: one input, "Paste your store URL".
2. Sign up (email magic link or Google) after the audit starts, so the user sees progress immediately.
3. Live audit progress (fetching pages, checking product pages, checking tracking...). 30 to 90 seconds.
4. **Helix Score** with six area scores and the top 3 findings with screenshots/evidence.
5. Three quick questions: category, rough monthly revenue, main goal (more sales, more profit, less time).
6. First-week plan (7 days, max 3 tasks a day).
7. Optional connections, in order of value: Shopify, Meta, Google, Klaviyo. Each shows exactly what Helix will read and what it can never do without approval.
8. Cost drivers mini-wizard (SOP 02), skippable with smart defaults.

```
+--------------------------------------------------------------+
|  ECOMMERCE HELIX                                             |
|                                                              |
|   Your growth copilot. Paste your store and get a plan.      |
|                                                              |
|   [ https://yourstore.com                     ] [Audit ->]   |
|                                                              |
|   Free: 3 audits and 3 daily plans a month. No card needed.  |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|  Auditing yourstore.com ...                                  |
|  [x] Homepage           [x] Product pages (3)                |
|  [x] Policies           [~] Tracking and pixels              |
|  [ ] Ads library        [ ] Scoring                          |
|  ███████████████░░░░░░  68%                                  |
|  Tip: most stores we audit are missing at least one of the   |
|  five core email flows.                                      |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|  HELIX SCORE  62 / 100        Stage: Under $10k/mo           |
|--------------------------------------------------------------|
|  Clarity    78 ████████    Compelling  48 █████              |
|  Friction   70 ███████     Sell        41 ████               |
|  Retention  55 ██████      Tracking    80 ████████           |
|--------------------------------------------------------------|
|  Top 3 fixes                                                 |
|  1. No reviews on your best seller (Linen Shirt)  [evidence] |
|  2. No email pop-up detected                       [evidence] |
|  3. Free-shipping threshold ($50) is below your AOV          |
|--------------------------------------------------------------|
|  [See my first-week plan ->]                                 |
+--------------------------------------------------------------+
```

---

## 3. Today screen

The home screen. One scorecard strip, a stance, up to three tasks, one learning card.

```
+-------------------------------------------------------------------+
| Today · Tue 6 Oct          Compound 71 (+2)   🔥 9 days   Wallet $4.20 |
|-------------------------------------------------------------------|
| Yesterday: $1,240 revenue · 14 orders · ~$186 profit (estimate)   |
| MER 3-day 28% · month 31% · target 30%     Stance: CAREFUL PUSH   |
|-------------------------------------------------------------------|
| 1  ADS · 5 min                                                    |
|    Raise "Cold · Broad" from $120 to $140 a day                   |
|    Why: lowest cost per purchase this week ($31), frequency 1.3   |
|    [ Do it for me ]   [ I'll do it ]   skip                       |
|-------------------------------------------------------------------|
| 2  SITE · 10 min                                                  |
|    Add 3 photo reviews above the fold on Linen Shirt              |
|    Why: your top landing page earns $1.90 per visit vs $3.00 avg  |
|    [ Do it for me ]   [ I'll do it ]   skip                       |
|-------------------------------------------------------------------|
| 3  EMAIL · 5 min                                                  |
|    Approve Friday's "back in stock" email (drafted)               |
|    [ Preview ]   [ Approve ]   [ Edit ]                           |
|-------------------------------------------------------------------|
| LEARN · 1 min  Partnership ads are cutting acquisition cost in    |
| apparel this month. See 2 examples you can adapt ->               |
+-------------------------------------------------------------------+
```

**Task card states:** new, in progress, waiting for approval, scheduled, done, skipped, blocked (missing connection or plan tier, with an upgrade or connect prompt).

**I'll do it** opens a guide:

```
+--------------------------------------------------------------+
|  Raise "Cold · Broad" budget to $140/day          ~5 min     |
|--------------------------------------------------------------|
|  1. Open Ads Manager -> Campaigns            [Open Meta ↗]   |
|  2. Find "Cold-ASC-Broad-Excl-BAU"                           |
|  3. Click the budget, change $120 -> $140                    |
|  4. Do not change anything else today                        |
|  5. Come back and tap Done                                   |
|--------------------------------------------------------------|
|  Why 20% max? Bigger jumps restart Meta's learning and        |
|  costs usually spike for days.                    [Learn more]|
|--------------------------------------------------------------|
|  [ Done ]     [ I got stuck: ask Helix ]                     |
+--------------------------------------------------------------+
```

When Helix is connected read-only, it verifies "Done" from the API and congratulates or gently flags a mismatch.

---

## 4. Approval queue

Every **Do it for me** creates an approval card. The queue lives in a tab and as a badge on Today. In month 2 the same card arrives as a PWA push notification with Approve / Reject.

```
+--------------------------------------------------------------+
|  APPROVAL NEEDED                                  expires 24h|
|  Pause 3 "Drain" ads in Cold · Broad                         |
|--------------------------------------------------------------|
|  Preview of change                                           |
|   - B12-Unboxing-Video-PriceHook-Sam   CPP $92  freq 2.1     |
|   - B12-Static-Review-4x5              $78 spent, 0 purchases|
|   - B11-Demo-Video-Problem-Jo          CPP $88  freq 1.9     |
|  Expected effect: about $60/day moves to your Star ads        |
|--------------------------------------------------------------|
|  Ad spend change: $0 total (budget unchanged)                |
|  Your daily cap: $400 (current $310)                         |
|  AI cost of this action: about $0.01 (included in plan)      |
|  Undo: one tap for 7 days (re-enables the ads)               |
|--------------------------------------------------------------|
|  [ Approve ]   [ Edit ]   [ Reject ]   [ Ask why ]           |
+--------------------------------------------------------------+
```

**Every card shows:** what will change (diff or preview), why, expected effect, ad spend impact versus the user's cap, AI cost estimate and which bucket pays (plan allowance or wallet), undo window, expiry (stale approvals cannot execute), and who approved (team members).

**Rules**
- Approvals expire (24 hours by default; budget changes 12 hours) because data moves.
- Before executing, the executor re-checks the live state. If things changed materially, the card goes back for re-approval.
- Bundled approvals are allowed only for the same action type ("pause all 3 Drains").
- Optional auto-approve rules (Growth, opt-in, proposed): pausing Drains within limits, scheduling already-approved emails. Never for budgets, launches, new campaigns, site publishes or sends to a full list.
- Ad execution follows **Draft & you launch**: anything Helix creates in an ad account is paused; budget, bid and target changes on live campaigns are prepared by Helix and made by the owner. Users without a connected account get **Guide me** mode (structures, original example ads, click-by-click checklists).

---

## 5. Roadmap: "What we can do for you"

The agency-style view of everything Helix can take on, grouped by area, with status by plan tier. It answers "what else can you do?" and makes upgrades feel natural.

```
+-------------------------------------------------------------------+
|  ROADMAP · yourstore.com                Plan: Starter (Meta)      |
|-------------------------------------------------------------------|
|  FOUNDATIONS                                                      |
|  [✓] Store audit and score               done 2 Oct               |
|  [✓] Daily scorecard (Shopify + Meta)    done 3 Oct               |
|  [→] Cost drivers and target MER         next · 10 min            |
|  ADS                                                              |
|  [✓] Meta structure review               done                     |
|  [→] Daily ad grading and pauses         active                   |
|  [ ] Build campaign and first test batch       next week                |
|  [🔒] Google Shopping setup              Growth plan              |
|  SITE                                                             |
|  [→] Site Fix List (3 of 10 done)        active                   |
|  [🔒] Shopify draft edits with preview   Growth plan (beta)       |
|  RETENTION                                                        |
|  [ ] Pop-up and welcome flow guide       available                |
|  [🔒] Klaviyo flow drafts                Growth plan              |
|  PLANNING                                                         |
|  [ ] 90-day promo calendar               in 2 weeks               |
|  [🔒] Weekly agency report               Growth plan              |
|-------------------------------------------------------------------|
|  Next 30 days: finish Site Fix List, launch 2 test batches,       |
|  start welcome flow. Expected impact: RPV +10 to 15% (estimate)   |
+-------------------------------------------------------------------+
```

Statuses: done, active, next, available (can start), scheduled, locked (plan tier or missing connection). Each item links to its SOP-derived guide.

---

## 6. Ad Trends feed

A weekly-refreshed feed of what is working now on Meta, TikTok, Google and emerging channels, written for small brands, with an "Adapt this for my store" button.

**How it is built (cheap, shared across all users)**
1. Weekly job collects platform announcements, ad library samples by category, and reputable industry sources.
2. A cheap model extracts candidate trends; a stronger model writes 5 to 10 cards a week; a human (Sid or an editor) reviews before publishing in v1.
3. Each card: what it is, who it suits (category, stage), how to try it in 30 minutes, an example brief, the source link, and a date.
4. Personalisation: cards are ranked by the store's category, stage and connected channels. "Adapt this" generates a brief for the store (wallet-metered, Haiku tier).

**Starter set of trend cards for October 2026 (from public sources)**

| Trend | What to do | Source |
| --- | --- | --- |
| Partnership (creator) ads inside normal sales campaigns | Run 3 to 5 creator posts as ads from the creator's handle in evergreen and Q4 campaigns | Meta announcement via Storyboard18: https://www.storyboard18.com/digital/meta-launches-new-era-of-shopping-experiences-powered-by-ai-reels-creators-ws-l-94638.htm ; Q4 guidance: https://commonthreadco.com/blogs/coachs-corner/meta-holiday-insights-center-2026-q4-ecommerce |
| Catalog product video on Reels | Turn existing videos into catalog templates so each product gets a video ad | https://www.adgully.com/post/14093/meta-launches-ai-powered-shopping-experiences-across-reels-and-creators |
| Review Advantage+ creative auto-enhancements | Check which default AI enhancements (music, overlays, backgrounds) are on and turn off any that hurt your brand | https://leapbuzz.com/blog/meta-advantage-plus-creative-ai/ |
| Reels trending ads around big moments | Event-based placements (for example Black Friday lineups) for brands with cultural tie-ins | https://www.thekeyword.co/news/meta-newfronts-2026-ad-products |
| TikTok Shop runs on GMV-based automated campaigns | If you sell on TikTok Shop, feed it creator and affiliate videos; judge in-platform return as its own score | https://ads.tiktok.com/resources/help/article/about-product-gmv-max ; https://www.enrichlabs.ai/blog/tiktok-shop-ads-complete-guide-2026 |
| TikTok Search ads and in-app checkout | Test search ads once TikTok creative is working | https://channelx.world/2026/10/tiktok-ai-powered-updates-for-advertisers-unveiled/ |
| AI Max for Search and Shopping | Audit auto-upgraded campaigns, review AI-written copy and landing pages, add negatives | https://blog.google/products/ads-commerce/ai-max-for-shopping/ ; https://commonthreadco.com/blogs/coachs-corner/google-ads-changes-2026 |
| PMax vs AI Max roles | Keep brand exclusions on PMax, keep brand search separate | https://roardigital.co.uk/insights/how-to-choose-between-ai-max-and-performance-max-in-2026/ |
| ChatGPT product-feed and visual ads | Make sure product data is clean; test ads once in beta in your market | https://openai.com/index/new-chatgpt-ads-format-and-measurement/ ; https://www.geekseller.com/blog/openai-chatgpt-product-feed-ads-are-now-opening-to-more-sellers-via-ads-manager-beta/ |
| Shopify products in AI shopping assistants | Check agentic storefront eligibility and product data quality | https://www.getcatalog.ai/blog/shopify-chatgpt-product-visibility |

Trend claims and platform figures are the sources' own numbers. Helix shows the source and date on every card and never presents vendor stats as guarantees.

```
+--------------------------------------------------------------+
|  TRENDS · week of 5 Oct                 [Meta][TikTok][Google]|
|--------------------------------------------------------------|
|  🔥 Creator posts as ads (partnership ads)                    |
|  Suits: apparel, beauty, home · Stage 1+                      |
|  Try it in 30 min: pick your best 3 creator posts, ask for    |
|  ad permission, add them to your Cold campaign.               |
|  Source: Meta (Storyboard18), 2026                            |
|  [ Adapt this for my store ]  [ Save ]  [ Not for me ]        |
|--------------------------------------------------------------|
|  📈 Hook of the week: "I tried the 1-star reviews so you..."  |
|  ...                                                          |
+--------------------------------------------------------------+
```

---

## 7. Weekly agency-style report and check-in (Growth)

Every Monday morning (Sydney time by default, user's own time zone respected) Helix sends a report by email and in-app, written like a good account manager's note.

**Sections**
1. **The headline:** one sentence ("Profit up 18% on last week; the new review block lifted product page conversion").
2. **Scorecard:** revenue, profit estimate, MER, RPV, new customers, vs last week and 4-week average.
3. **What we did:** every approved action with result so far.
4. **What we learned:** winning ads and why, test results, decision log highlights.
5. **What is next:** this week's priority and the 3 biggest tasks, each with approve buttons.
6. **Roadmap progress:** items done, next unlocks.
7. **One question for you:** a check-in prompt ("Any stock arriving this month we should plan ads around?").

The check-in reply goes straight into the store's context for planning.

---

## 8. Chat copilot

A side panel on every screen and a full-page view. It answers questions using the store's own data plus the SOP library, and can turn any answer into a task or an approval card.

**Behaviour**
- Grounded: answers cite the store numbers it used and the SOP section.
- Can say "I don't know" and suggest what data would answer it.
- Offers next steps as buttons: "Add to Today", "Draft this", "Show me how".
- Cheap model by default; escalates to the stronger model for diagnosis, multi-step plans or when the user taps "think harder" (wallet-metered beyond plan allowance).

**Questions the copilot must answer well** (paraphrased from common store-owner questions in public and private founder communities)

*Numbers and tracking*
- How do I treat wholesale orders and 3PL account fees in my numbers?
- Why does Shopify revenue not match what Meta says?
- My Google conversions doubled overnight. Is that real?
- Should I trust incremental attribution settings?
- How do I report by country when I sell in several markets?

*Meta*
- Should I scale my new test campaign or move its best ads into my main campaigns?
- A former star ad is hogging budget now. What do I do?
- How do I know an ad has fatigued versus normal day-to-day noise?
- Does adding a new campaign reset learning on the others?
- What structure should I use for a new product drop or a 3-day sale?
- My ads show "partial delivery". Why?
- Meta added a discount to my ad I did not set up. How do I stop it?
- Instagram converts much worse than Facebook. Should I exclude it?
- My account was hacked and a campaign was created. What now?

*Google*
- Is Google right for my brand yet?
- How should I split PMax asset groups for 5 to 6 best sellers?
- My PMax campaign crashed after a Google update. What do I check?
- Custom labels in Shopify or in a supplemental feed?

*Email and SMS*
- Is Klaviyo worth the price, or should I switch?
- What pop-up opt-in rate is normal?
- How do I handle abandoned-cart discounts during a sale?
- My emails are not reaching Outlook or Gmail. What do I fix?
- Do I need to register an SMS sender ID?

*Sales and ops*
- What day should I launch my Black Friday sale?
- How much should evergreen budgets drop during the hype phase?
- I will sell out two weeks before stock lands. Slow ads or air-freight?
- Can my ads say "20% off sitewide" if some ranges are excluded?
- Should I ditch my agency and bring marketing in-house?
- What content output per week is realistic for a small team?
- How do I get through a bad sales week without panicking?

---

## 9. Notifications

| Type | Channel | Default |
| --- | --- | --- |
| Morning scorecard and Today | Email (v1), push (month 2) | On, 7:30am local |
| Approval needed | In-app badge, email, push (month 2) | On |
| Red-flag alert (site down, revenue crash, ad account disabled, best seller out of stock) | Email + push | On, any time |
| Weekly report | Email + in-app | On (Growth) |
| Wallet low ($2 left) and wallet empty | Email + in-app | On |
| Streak reminder | Push, 6pm local, only if loop not done | On, easy to turn off |
| Trends digest | Email | Weekly |
| Seasonal nudge (the current seasonal alert plus your next prep steps, or an invite to add the plan) | Email + push, Mondays 8am local (`/api/cron/seasonal-nudges`) | On while an alert is active and the plan is unfinished |

Quiet hours: no non-critical notifications from 9pm to 7am local.

---

## 10. Engagement: the Compound Score and streaks

The goal is to reward the habit that grows the business, not app opens.

- **Compound Score (0 to 100):** a weighted mix of (a) Helix Score of the store, (b) the share of the last 14 days the daily loop was completed, (c) roadmap progress, and (d) the trend of contribution profit. It moves slowly and visibly.
- **Streaks:** consecutive days with the daily loop done (Sundays and user-set rest days do not break it). Freeze tokens for holidays.
- **Milestones:** first 10 orders tracked, first Star ad, first flow live, first profitable month, first $10k month.
- **"What compounding did":** a monthly card showing cumulative effect of completed tasks (for example "RPV +12% since you started; that is about $1,900 more revenue this month at the same traffic", always labelled estimate).
- **No dark patterns:** no fake urgency, no guilt messages, easy to pause.

---

## 11. Settings, connections, team, wallet

- **Connections:** Shopify, Meta, Google Ads and Merchant Center, Klaviyo (v1); TikTok, Pinterest later. Each connection page lists read scopes, write scopes, last sync, and a disconnect button.
- **Guardrails page:** daily spend cap per platform, max budget change per day (default 20%), auto-approve rules, quiet hours, brand voice notes, banned claims.
- **Team:** invite members with roles (owner, approver, viewer). Only owner/approver can approve spend changes.
- **Billing:** plan, renewal, AI allowance used this month, wallet balance, top-up (prepaid only), usage history per action.

```
+--------------------------------------------------------------+
|  AI USAGE · October                                          |
|  Plan allowance (Starter, $3.00 at cost)   ████████░░ $2.41   |
|  Wallet balance                            $4.20             |
|  When allowance runs out, extra AI work uses the wallet at   |
|  2x provider cost. At $0 wallet, Helix pauses AI extras and  |
|  keeps your scorecard and guides running.                    |
|  [ Top up $10 ]  [ Top up $25 ]  [ Usage details ]           |
+--------------------------------------------------------------+
```

---

## 12. Data model (Postgres)

Core tables (simplified; all rows carry `id`, `created_at`, `updated_at`; tenant isolation by `org_id` with row-level security).

| Table | Key fields | Notes |
| --- | --- | --- |
| `orgs` | name, plan, stripe_customer_id, timezone | Billing owner |
| `users` | email, name, locale | |
| `memberships` | org_id, user_id, role (owner, approver, viewer) | |
| `stores` | org_id, url, platform, category, stage, currency, target_profit_pct | One org can have several stores later |
| `connections` | store_id, provider, scopes, status, secret_ref, last_sync_at | Tokens stored in a secrets vault or encrypted column, never in logs |
| `cost_drivers` | store_id, product_cost_pct, ship_per_order, pack_per_order, fee_pct, fixed_monthly jsonb, valid_from | Versioned |
| `metrics_daily` | store_id, date, revenue, orders, units, sessions, new_orders, spend_by_channel jsonb, est_profit, mer, rpv, cr, aov | Computed by SQL jobs |
| `ad_entities` | store_id, provider, level (campaign, adset, ad), external_id, name, layer, status | Snapshot of account structure |
| `ad_metrics_daily` | ad_entity_id, date, spend, purchases, value, reach, impressions, frequency, outbound_clicks, atc | |
| `ad_grades` | ad_entity_id, date, grade (star, steady, passenger, drain), cpp_4d, freq_7d, thresholds jsonb | Output of rules engine |
| `audits` | store_id, score, area_scores jsonb, pages jsonb, version | |
| `findings` | audit_id, area, title, evidence jsonb, impact, effort, status | Feeds the Site Fix List |
| `plans` | store_id, date, stance, summary | One per day |
| `tasks` | plan_id, store_id, area, title, why, steps jsonb, minutes, status, sop_ref, roadmap_item_id | Max 3 per plan |
| `roadmap_items` | store_id, area, title, status, tier_required, sop_ref, order | |
| `approvals` | store_id, task_id, action_type, payload jsonb, preview jsonb, est_ai_cost, est_spend_delta, cap_snapshot, status, approved_by, approved_at, expires_at | |
| `actions` | approval_id, provider, request jsonb, response jsonb, external_ref, revert_payload jsonb, status, executed_at, reverted_at | Idempotency key per action |
| `audit_log` | org_id, actor (user, system, agent), event, object_ref, before jsonb, after jsonb, hash, prev_hash | Append-only, hash-chained |
| `experiments` | store_id, type (site, email, ad), hypothesis, variant_a, variant_b, start, end, result, decision | Site test log |
| `creative_library` | store_id, ad_entity_id, concept, pillar, hook, format, creator, result_grade, notes | |
| `decision_log` | store_id, date, change, reason, expectation, outcome | Owner's playbook |
| `trend_cards` | week, channel, title, body, suits jsonb, source_url, published_at, reviewed_by | Shared, not per tenant |
| `sop_docs` / `sop_chunks` | slug, version / doc_id, text, embedding vector | pgvector for RAG |
| `chat_threads` / `chat_messages` | store_id / thread_id, role, content, tool_calls jsonb, model, cost | |
| `notifications` | user_id, type, channel, payload, sent_at, read_at | |
| `engagement` | store_id, date, loop_done, streak, compound_score | |
| `usage_events` | org_id, feature, model, input_tokens, output_tokens, provider_cost, billed_cost, bucket (allowance, wallet, free) | Every LLM call |
| `wallet_ledger` | org_id, type (topup, hold, charge, release, refund), amount, balance_after, ref | Balance never below zero |
| `subscriptions` | org_id, plan, status, period_start, period_end, allowance_cost_limit | Mirrors Stripe |

---

## 13. Agent architecture

**Principle:** deterministic code does the maths and enforces the rules; LLMs explain, prioritise, draft and converse. The LLM never holds a credential and never executes a write directly.

```
                 ┌───────────────────────────────────────────────┐
  Cron / events  │  Sync workers (no LLM)                        │
 ───────────────▶│  Shopify, Meta, Google, Klaviyo read APIs     │
                 └───────────────┬───────────────────────────────┘
                                 ▼
                 ┌───────────────────────────────────────────────┐
                 │  Metrics + rules engine (SQL / TypeScript)    │
                 │  scorecard, stance, ad grades, stock flags,   │
                 │  candidate actions with numbers attached      │
                 └───────────────┬───────────────────────────────┘
                                 ▼
                 ┌───────────────────────────────────────────────┐
                 │  Model router + cost guard                    │
                 │  pick tier, estimate cost, reserve allowance  │
                 │  or wallet hold, set max tokens               │
                 └──────┬───────────────┬───────────────┬────────┘
                        ▼               ▼               ▼
                 Tier 1 cheap     Tier 2 default   Tier 3 strong
                 (Flash-Lite)     (Haiku 4.5)      (Sonnet 5.5)
                 extract, tag,    daily plan copy, weekly report,
                 classify, page   chat, drafts,    diagnosis, structure
                 summaries        guides           proposals, escalations
                        └───────────────┬───────────────┘
                                        ▼
                 ┌───────────────────────────────────────────────┐
                 │  RAG: SOP chunks + store context              │
                 │  Tools: read_* (data), draft_* (proposals)    │
                 │  Output: typed objects validated by schema    │
                 └───────────────┬───────────────────────────────┘
                                 ▼
                 ┌───────────────────────────────────────────────┐
                 │  Approvals service: card, preview, expiry     │
                 └───────────────┬───────────────────────────────┘
                     user taps   ▼   Approve
                 ┌───────────────────────────────────────────────┐
                 │  Executor (no LLM): re-check live state,      │
                 │  enforce caps, call provider write API with   │
                 │  idempotency key, store revert payload        │
                 └───────────────┬───────────────────────────────┘
                                 ▼
                         audit_log + notifications
```

**Routing rules**
- Tier 0 (no LLM) for anything computable: ratios, grades, thresholds, stock cover. Most daily intelligence is here, which keeps costs tiny.
- Tier 1 for high-volume, low-judgement text: page extraction during audits, review tagging, ticket classification, trend candidate extraction.
- Tier 2 for user-facing writing: daily plan wording, task guides, chat default, email and ad copy drafts.
- Tier 3 for judgement: weekly report, constraint diagnosis narrative, account structure proposals, chat when the user asks for depth or Tier 2 confidence is low. Gated by plan allowance or wallet.
- Prompt caching on the SOP and store-context prefix wherever supported.
- Fallback: if a provider fails, retry on an equivalent model from another provider through the AI gateway; never silently upgrade to a pricier tier without the cost guard.

**Tools (via Vercel AI SDK tool calling)**
- `read_*`: `read_scorecard`, `read_ad_grades`, `read_search_terms`, `read_flows`, `read_products`, `read_findings`, `search_sops`. Read-only, safe to call.
- `draft_*`: `draft_budget_change` (produces instructions for the owner, never an API write on a live campaign), `draft_pause_ads`, `draft_ad_batch` (created paused), `draft_negative_keywords`, `draft_email`, `draft_flow`, `draft_theme_edit`. Each returns a proposed Action object; it creates an approval card, not a change.
- The executor holds provider credentials and runs the Action only with a valid, unexpired approval id signed by the server.

**Guardrails**
- Spend: per-platform daily cap set by the user; the executor rejects any change that would exceed it. Budget moves max 20% per campaign per day by default.
- Creation: new campaigns and ads are always created paused; going live is a separate approved action.
- Pauses: never pause the last active ad in a campaign; auto-pause rules are capped per day.
- Content: claims checker for regulated topics (health, before/after, finance), banned words list per store, platform policy hints.
- Data: least-privilege OAuth scopes, PII minimised in prompts (no customer names or emails sent to LLMs unless needed for a draft the user asked for), per-tenant isolation, encrypted tokens, secrets never logged.
- Kill switch: one toggle per store disables all write actions instantly.
- Rate limits and idempotency on all provider calls; exponential backoff.
- Prompt injection: content fetched from websites, reviews and emails is treated as data; the model cannot call write tools based on instructions found in that content, and all writes require human approval anyway.

**Audit log**
- Every read sync, plan, approval, execution, revert and setting change is written to an append-only, hash-chained log with before and after state.
- Users see a readable activity feed ("Helix paused 3 ads you approved at 9:14am · Undo").
- Exportable for agencies or accountants.

**Evaluation**
- Golden set of 50 anonymised store scenarios with expected diagnoses and tasks; run on every prompt or model change.
- Track: task completion rate, approval rate, revert rate, user-rated usefulness, cost per active store per day.

---

## 15. v1 app additions (built)

| Screen | What it does | Source of truth |
| --- | --- | --- |
| Today | Day N of the 64-day curriculum (lesson, topic, action, "I'll do it for you", Mark done), up to two insights, streak, compound score, right-hand roadmap by stage with done / today / next / locked-by-plan | [daily-curriculum.md](daily-curriculum.md) |
| Insights | Proactive audit results with evidence, why it matters, suggested fix, Do it for me or Show me how; site and social checklists; audit schedule | [audit-engine.md](audit-engine.md) |
| Daily scorecard | Manual entry and CSV import of daily orders, sales, discounts, refunds, COGS, shipping, fees, ad spend by channel, other marketing; computed gross profit, contribution, MER, blended CAC, aCPA, channel ROAS, break-even ROAS and CPA, new vs returning, target vs actual, WTD/MTD, sparklines, RAG flags; product table | Module 1, SOP 02 |
| Campaign tracker | Every campaign with CPA, ROAS, CTR, CPM, hook rate, status, stage and a scale / hold / refresh / kill call from SOP rules | Module 6, SOP 06 |
| Campaign builder | Draft & you launch (paused drafts in the user's account) and Guide me (structures, original example ads, click-by-click checklists) | [execution-model.md](execution-model.md) |
| Email automation | Nine flows with drafts; set up after approval | [email-automation.md](email-automation.md) |
| Learn | The 21-module playbook, linked from every day and insight | [playbook/](playbook/README.md) |
| Seasonal alerts | Prominent banner on Today and the home page from the real date, at the right lead time for each key date (Black Friday from 12 weeks, Christmas cut-offs 8, Boxing Day and New Year 5, Valentine's Day 6, Mother's Day 8, EOFY 6, Father's Day 7). "Add the prep plan" inserts dated steps with Mark done and lesson links; also in the weekly report and the Monday nudge | `src/lib/seasons.ts`, Module 13, SOP 15 |

