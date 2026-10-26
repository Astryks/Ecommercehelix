# Helix AI coach: LLM plan and costs

Status: plan only. Nothing paid has been built or switched on. Prices were checked on the official pricing pages on **26 Oct 2026 (AEDT)**. Everything is in USD.

## 1. Architecture (phased)

| Phase | Scope | What the coach "knows" |
|---|---|---|
| **MVP** | RAG over our own lesson library (transcript-derived notes, rewritten in Helix wording) plus the store summary the user pastes or the Numbers tab already holds | General playbook plus the user's self-reported numbers |
| **P2** | Shopify connector (OAuth, read-only) | Orders, AOV, repeat rate, top products, refunds |
| **P3** | Meta Ads, Google Ads + GA4, TikTok Ads (OAuth, read-only) | Spend, ROAS/MER, CPA, creative fatigue, funnel drop-off |

**RAG pipeline**
- Corpus: 1,115 files, 31.36 MB, about 7.8M tokens. That is about 15.6k chunks of 500 tokens with about 50 tokens of overlap.
- Each chunk carries metadata: stage (Attract/Convert/Grow), topic id, lesson slug.
- Storage: **pgvector on the existing Postgres**, with a hybrid of BM25 (`tsvector`) and cosine similarity, top-k 6. A reranker is optional and deferred.
- Answers cite Helix lesson links, never the source material. The system prompt forbids naming any external course, brand or person.

**Connectors (P2/P3)**
- Scopes:
  - Shopify: `read_orders`, `read_products`, `read_customers`, `read_analytics`. Note that orders older than 60 days need `read_all_orders`, which needs approval.
  - Meta: `ads_read`. App Review plus Business Verification is needed for other users' accounts, and that takes about 1–4 weeks (unverified estimate).
  - Google Ads: needs a developer token with Basic access, which requires an application. GA4 uses `analytics.readonly`.
  - TikTok: Marketing API `ad.read`, which needs app approval.
- Rate limits: Shopify REST is a leaky bucket of 2 requests per second (GraphQL is cost-based). Meta uses per-ad-account BUC scoring. Google Ads has daily operation quotas by access tier. So **sync nightly plus on demand** into our own summary tables, and the LLM reads summaries rather than calling the live APIs.
- Token storage: encrypt at rest with AES-256-GCM using an env key (KMS later), store refresh tokens only server-side, scope tokens per store, and give users revoke/disconnect controls.
- Privacy: no customer PII goes into prompts. Aggregate first (counts, sums, cohorts), keep raw rows out of the LLM, follow the retention policy in legal-pages, and let users delete everything.

**Routing**
- Default is the **fast tier** (Claude Haiku 5.5). Escalate to the **deep tier** (Claude Sonnet 5) only when one of these holds:
  - the user taps "Deep dive"
  - the query classifier flags a multi-step diagnosis or plan
  - the retrieved context exceeds 12k tokens
  - the fast answer fails self-check (low retrieval score below 0.55, or the "I'm not sure" flag)
- Target split: 80% fast, 20% deep.
- Fallback: Gemini 3.8 Flash if Anthropic errors.

**Caching**
- Cache the system prompt and Helix rules (~2k tokens) as a prompt-cache prefix: it costs $0.01/MTok on Haiku 5.5 and $0.20 on Sonnet 5.
- Cache identical FAQ answers for 24 h. Use semantic dedupe at 0.95 or above.

**Guardrails**
- Answers are grounded only: if retrieval is empty, say so.
- No financial, legal or tax advice beyond general education.
- No promises of results.
- Strip PII.
- Rate-limit per user, and apply a hard monthly cap (see section 5).
- Log prompts and answers for QA. Redact before storing.

## 2. Official pricing (as of 26 Oct 2026, per 1M tokens)

| Model | Input | Cached input | Output | Source |
|---|---|---|---|---|
| Claude Haiku 5.5 (prompts ≤100k) | $0.10 | $0.01 | $0.50 | docs.anthropic.com pricing |
| Claude Haiku 4.5 | $1.00 | $0.10 | $5.00 | same |
| Claude Sonnet 5 | $2.00 | $0.20 (5-minute write $2.50) | $10.00 | same |
| Claude Sonnet 4.6 | $3.00 | $0.30 | $15.00 | same |
| Gemini 3.8 Flash | $0.75 (**$1.50 from 1 Jan 2027**) | $0.075 | $3.75 (**$7.50 from 1 Jan 2027**) | ai.google.dev pricing (page updated 22 Oct 2026) |
| Gemini 3.5 Flash-Lite | $0.30 | n/a | $2.50 | same |
| Gemini 2.5 Flash-Lite | $0.10 | n/a | $0.40 | same |
| grok-4.3 | $1.25 | $0.20 | $2.50 | docs.x.ai models |
| grok-4.7 | $2.00 | $0.50 | $6.00 | same |
| Gemini Embedding 2 (text) | $0.20 (batch $0.10) | n/a | n/a | ai.google.dev |

Batch APIs are 50% off. They don't suit live chat, but they do suit embeddings and nightly summaries.

## 3. Cost per response

Token assumptions (cached prefix + fresh input → output):

| Scenario | Cached | Fresh input | Output |
|---|---|---|---|
| Low | 2k | 1.5k | 300 |
| Typical | 2k | 4.5k | 600 |
| Heavy | 2k | 25k (RAG + store data) | 1.5k |

Results:

| Model | Low | Typical | Heavy |
|---|---|---|---|
| Haiku 5.5 | $0.00036 | **$0.00077** | $0.0031 |
| Sonnet 5 | $0.0072 | **$0.0154** | $0.0614 |
| Gemini 3.8 Flash (2026 / 2027) | — | $0.0071 / $0.0143 | — |
| grok-4.3 | — | $0.0096 | — |
| **Routed 80/20 Haiku/Sonnet** | — | **$0.0037** | — |

Worked example (Sonnet 5, typical): 2,000×$0.20/1M + 4,500×$2/1M + 600×$10/1M = $0.0004 + $0.009 + $0.006 = **$0.0154**.

Routed blend: 0.8×$0.00077 + 0.2×$0.0154 = **$0.0037**.

## 4. Cost per user per month

| User | Messages/month | Mix | Cost |
|---|---|---|---|
| Light | 50 | 80/20 | 50×0.0037 = **$0.19** |
| Typical | 200 | 80/20 | 200×0.0037 = **$0.74** |
| Heavy (all heavy-size prompts) | 600 | 60/40 | 360×0.0031 + 240×0.0614 ≈ **$15.8** |

**One-off and fixed costs**
- Embedding the corpus: 7.8M tokens × $0.20 = **$1.57** once, or $0.78 by batch. Re-embedding only changed lessons costs cents.
- Query embeddings: about 50 tokens each, so roughly $0.00001 per query, which is negligible.
- Vector DB: pgvector on the current Postgres costs **$0 extra**. 15.6k vectors at 768 dims is about 50 MB.
- ⚠️ Unverified: whether our current Neon/Supabase plan's storage and compute limits absorb this. Check this before launch.

## 5. Against plan prices, and the recommended fair-use limits

docs/pricing.md sets the AI allowance at about $3 (Starter, $29) and about $8 (Growth, $59) at provider cost, with top-ups through the wallet at 2×.

| Plan | Fair-use limit | Worst case (all heavy) | Typical | Share of price |
|---|---|---|---|---|
| **Starter $29** | **300 msgs/mo, of which 40 are Deep** | 260×0.0031 + 40×0.0614 = **$3.26** | about $0.82 | worst 11%, typical 3% |
| **Growth $59** | **800 msgs/mo, of which 100 are Deep** | 700×0.0031 + 100×0.0614 = **$8.31** | about $2.4 | worst 14%, typical 4% |

- Free tier: 20 fast messages/mo, no Deep. Cost is at most about $0.06.
- After the limit: fast messages continue but slow down to 1 per 30 s. Deep pulls from the wallet at 2× cost (about $0.12 per Deep message).
- Starter's worst case is only about $0.26 over the $3 allowance, so it is acceptable, or tighten Starter to 35 Deep messages.

## 6. Risks and unverified items
- **Gemini 3.8 Flash doubles on 1 Jan 2027.** Use it only as a fallback.
- **Haiku 5.5 pricing applies to prompts of 100k tokens or fewer.** Keep context under 30k.
- Anthropic, Google and xAI prices change often. Re-check them quarterly.
- Meta App Review, the Google Ads developer token and TikTok approval timelines are estimates.
- Shopify `read_all_orders` approval isn't guaranteed.
- Token counts are estimates, not measured. Log real usage in the MVP and recalibrate.
