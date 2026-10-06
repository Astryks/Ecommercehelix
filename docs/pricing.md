# Ecommerce Helix pricing and unit economics

**Rule:** Helix never loses money on any step. Free usage is hard-capped. Paid AI usage is either inside a plan allowance priced into the subscription, or prepaid in a wallet at 2x provider cost. Ad spend always runs on the customer's own ad accounts and payment methods.

All costs below are **estimates** in USD, based on list prices for hosted models as of October 2026. They will be re-measured from real `usage_events` in the first month of beta.

## 1. Plans

| | **Free** | **Starter** | **Growth** |
| --- | --- | --- | --- |
| Price | $0 | **$29/month** | **$59/month** |
| Store audits | 3 a month | Unlimited re-audits (cached weekly) | Unlimited re-audits (cached weekly) |
| Daily plans (Today screen) | 3 a month | Every day | Every day |
| Guides ("I'll do it") | Yes | Yes | Yes |
| Scorecard | Manual entry | Auto from Shopify + one ad platform | Auto from Shopify, Meta, Google |
| Approval queue and bot actions | No | Yes, **one of Meta or Google** | Yes, **Meta and Google** |
| Email and SMS flow drafts (Klaviyo) | Guides only | Guides only | Yes |
| Weekly agency-style report | No | No | Yes |
| Site edit drafts with preview (Shopify) | No | No | Yes (beta) |
| Trends feed | Read only | Read + "adapt" | Read + "adapt" |
| Chat | 10 messages a month (cheap model) | Included within AI allowance | Included within AI allowance |
| **AI allowance (at provider cost)** | Hard cap about $0.30 to $1 total cost to us | **about $3 a month** | **about $8 a month** |
| Extra AI | Not available | Prepaid wallet at 2x provider cost | Prepaid wallet at 2x provider cost |
| Team seats | 1 | 2 | 5 |

**Wallet rules**
- Prepaid only. Minimum top-up $10 (recommended), options $10, $25, $50.
- Extra AI work is billed at **2x provider cost** (provider cost = the model provider's list price for the tokens used).
- When the wallet hits $0, AI extras stop. The scorecard, rules-based alerts, guides and approvals already generated keep working.
- No auto top-up by default. If added later, it must be opt-in with a monthly ceiling.
- The app shows the estimated cost before any wallet-funded action, and the actual cost after.

**Ad spend:** Helix never buys media. Budgets are set on the customer's own Meta and Google accounts, charged to their card by Meta or Google. Helix only changes budgets after approval and within the customer's cap.

## 2. Model prices used (list, per 1M tokens, USD)

| Tier | Model | Input | Output | Used for |
| --- | --- | --- | --- | --- |
| 0 | No LLM (SQL and rules) | $0 | $0 | Ratios, grades, thresholds, alerts |
| 1 | Gemini Flash-Lite | $0.10 | $0.40 | Extraction, tagging, classification, page summaries |
| 2 | Claude Haiku 4.5 | $1.00 | $5.00 | Daily plan wording, chat, drafts, guides |
| 3 | Claude Sonnet 5.5 | $2.00 | $10.00 | Weekly report, diagnosis, structure proposals, escalations |

## 3. Per-action cost estimates

Token counts are estimates for a typical store, including SOP retrieval context. "With buffer" adds 50% for retries, longer stores and variance. Prompt caching should reduce real costs further, so these are deliberately conservative.

| Action | Model mix (input / output tokens) | Est. provider cost | With 1.5x buffer | Who pays | Billed to user if from wallet (2x) |
| --- | --- | --- | --- | --- | --- |
| Store audit | Tier 1: 25k / 3k, Tier 2: 12k / 2.5k | $0.028 | $0.042 | Free cap or plan | $0.08 |
| Daily plan | Tier 0 rules, Tier 2: 9k / 1.2k | $0.015 | $0.023 | Free cap or plan | $0.04 |
| Daily plan (Tier 1 fallback) | Tier 1: 9k / 1.2k | $0.0014 | $0.002 | Free cap | n/a |
| Chat message | Tier 2: 6k / 0.5k | $0.0085 | $0.013 | Plan or wallet | $0.02 |
| Chat message, deep | Tier 3: 15k / 1.2k | $0.042 | $0.063 | Plan or wallet | $0.13 |
| Approval card (pause / budget) | Tier 0 rules, Tier 2: 4k / 0.4k | $0.006 | $0.009 | Plan | $0.02 |
| Ad batch draft (8 ads copy) | Tier 3: 18k / 4k, Tier 2 check: 8k / 0.8k | $0.088 | $0.132 | Plan or wallet | $0.26 |
| Email draft | Tier 2: 7k / 1.5k | $0.015 | $0.022 | Plan or wallet | $0.04 |
| Flow draft (5 emails) | Tier 3: 20k / 7k | $0.110 | $0.165 | Plan or wallet | $0.33 |
| Shopify theme edit draft | Tier 3: 30k / 5k | $0.110 | $0.165 | Plan or wallet | $0.33 |
| Weekly report | Tier 3: 25k / 3k | $0.080 | $0.120 | Plan (Growth) | $0.24 |
| Constraint diagnosis | Tier 3: 20k / 2.5k | $0.065 | $0.098 | Plan or wallet | $0.20 |
| Review tagging (200 reviews) | Tier 1: 40k / 8k | $0.007 | $0.011 | Plan | $0.02 |
| Adapt a trend card | Tier 2: 5k / 0.8k | $0.009 | $0.014 | Plan or wallet | $0.03 |
| Executing an approved action (API write) | No LLM | $0 | $0 | n/a | n/a |
| AI image variant (optional, later) | Image model | about $0.02 to $0.08 per image | | Wallet only | 2x provider cost |

**Shared costs (not per user)**
- Trends feed: about 200k Tier 1 tokens plus about 50k in / 15k out Tier 3 per week, so roughly $0.30 a week in model cost, plus human review time.
- SOP embeddings: under $0.01 per full re-index.

## 4. Monthly cost per user and margin

### Free user (worst realistic case)

| Item | Est. cost |
| --- | --- |
| 3 audits (with buffer) | $0.13 |
| 3 daily plans | $0.07 |
| 10 chat messages | $0.13 |
| Crawl compute, email, storage | $0.05 |
| **Total** | **about $0.38** |
| Hard cap enforced by the cost guard | $0.60 model cost, then features pause until next month |

Same-URL audits are cached for 7 days, so repeat audits by abusers cost nothing extra. This sits inside the target of $0.30 to $1 per free user, treated as acquisition cost.

### Starter ($29)

Typical AI use (with buffer): 30 daily plans $0.68, 60 chats $0.77, 5 deep chats $0.32, 40 approval cards $0.36, 2 ad batch drafts $0.26, 1 audit $0.04, 4 trend adaptations $0.05. **Total about $2.48**, inside the $3 allowance.

| Line | Amount |
| --- | --- |
| Price | $29.00 |
| Stripe (estimate: 2.9% + $0.30 card, plus 0.7% Billing) | -$1.34 |
| AI allowance, assuming the user uses all of it | -$3.00 |
| Hosting, database, queues, sync jobs, email, monitoring (estimate) | -$1.00 |
| Support allowance (estimate) | -$1.50 |
| **Contribution per Starter user** | **about $22.16 (76%)** |

### Growth ($59)

Typical AI use (with buffer): 30 plans $0.68, 120 chats $1.53, 15 deep chats $0.95, 4 weekly reports $0.48, 1 diagnosis $0.10, 80 approval cards $0.72, 4 ad batches $0.53, 4 emails $0.09, 1 flow $0.17, 2 theme edits $0.33, review tagging $0.01, 2 audits $0.08, 8 trend adaptations $0.11. **Total about $5.78**, inside the $8 allowance.

| Line | Amount |
| --- | --- |
| Price | $59.00 |
| Stripe (estimate) | -$2.42 |
| AI allowance, fully used | -$8.00 |
| Hosting and sync (heavier: two ad platforms plus Klaviyo) | -$1.50 |
| Support allowance | -$2.50 |
| **Contribution per Growth user** | **about $44.58 (76%)** |

If prices are shown GST-inclusive in Australia, net revenue is price ÷ 1.1 (Starter $26.36, Growth $53.64). Contribution is still positive at about $19.50 and $39.20.

### Wallet top-ups

| Top-up | Stripe fee (est.) | Provider cost the user can consume (at 2x) | Our margin |
| --- | --- | --- | --- |
| $10 | $0.59 | $5.00 | $4.41 |
| $25 | $1.03 | $12.50 | $11.47 |
| $50 | $1.75 | $25.00 | $23.25 |

A $5 top-up would still be positive ($2.50 - $0.45), but $10 is the recommended minimum because of the fixed card fee.

## 5. How the app guarantees "never lose money on a step"

1. **Pre-flight estimate.** Before every LLM call, the cost guard estimates the maximum cost (input tokens counted, output capped by `max_tokens`).
2. **Reserve, then charge.** That maximum is reserved from the allowance or the wallet (a hold in `wallet_ledger`). After the call, the real cost is charged and the rest is released.
3. **Order of buckets:** free cap (free users) -> plan allowance (paid users) -> wallet. If the next bucket cannot cover the reservation, the action does not run and the user sees why and what it would cost.
4. **Hard caps per call and per day:** max tokens per tier, max deep-chat turns per day, max audits per hour per org.
5. **Downgrade before stopping (free users only):** if the free cap is close, plans fall back to Tier 1, then to rules-only text.
6. **No silent upgrades:** the router never moves a request to a pricier tier unless the bucket can pay for it.
7. **Caching:** audits cached per URL for 7 days, SOP and store context prefixes use prompt caching, trend cards generated once for everyone.
8. **Abuse controls:** email verification, disposable email block, one free store per domain, captcha on anonymous audits, rate limits.
9. **Daily margin dashboard (admin):** revenue, provider cost and margin by plan, by feature and by org. Alerts if any org's cost passes 80% of its allowance in the first half of the month.
10. **Refund-safe:** wallet credits are prepaid and drawn down as used. Subscription refunds only for unused time, never for consumed AI.

## 6. Pricing decisions and things to revisit

- Starter allows only one ad platform to keep support and sync costs low, and to give a clear reason to upgrade.
- The AI allowance is "at cost" internally. In the UI we show it as "AI usage included" with a progress bar, not as a dollar figure, unless the user opens details.
- Annual plans (for example two months free) still clear 70%+ contribution.
- A done-with-you human review add-on (from earlier drafts) is not in v1. Revisit after 50 paying stores.
- Model prices change often. The router reads prices from a config table so margins update without a deploy.
