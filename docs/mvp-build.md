# Ecommerce Helix: MVP build plan (6 weeks)

**Goal:** a responsive web app where a store owner pastes a URL, gets an audit and score, sees a Today screen with up to three tasks, can approve "Do it for me" actions for Meta (first) and Google, and pays through Stripe. Docs-first, then a thin vertical slice, then connectors.

## Stack

- Next.js (App Router, TypeScript, Tailwind) on Vercel.
- Postgres (Neon or Vercel Postgres) with Prisma, pgvector for SOP retrieval.
- Auth.js (NextAuth v5): email magic link and Google.
- Stripe Checkout and Billing webhooks for plans; Stripe one-off payments for wallet top-ups.
- Vercel AI SDK with tool calling; AI Gateway for multi-provider routing and fallbacks.
- Background jobs: Vercel Cron plus a queue (Inngest, Trigger.dev or Upstash QStash).
- Email: Resend (magic links, morning scorecard, weekly report).
- No GPUs, no fine-tuning, no browser automation in v1.

## Week 1: foundation and marketing site

- [ ] Repo scaffold, lint, CI build on Vercel previews.
- [ ] Marketing home (hero, how it works, strategies, pricing, trends teaser, FAQ), About page, brand and logo.
- [ ] Auth (magic link, Google), orgs, stores, memberships.
- [ ] Prisma schema: users, stores, subscriptions, tasks, completions, approvals (expand to the full model in the product design doc over time).
- [ ] Stripe products: Starter $29, Growth $59; Checkout; webhook sets plan. Dev fallback when keys are missing.
- [ ] Seed data: roadmap items, SOP-derived tasks, trend cards, a sample weekly report.

## Week 2: audit and Today screen

- [ ] URL audit worker: fetch pages, extract (Tier 1), score (rules), write findings (Tier 2). Cache per URL for 7 days.
- [ ] Helix Score screen with evidence.
- [ ] Today screen: scorecard strip (manual entry first), stance, max 3 tasks, guides, Mark done, Do it for me (creates approval).
- [ ] Roadmap timeline with done / today / next / locked by plan.
- [ ] Cost guard and `usage_events` from the very first LLM call. Free caps enforced.

## Week 3: data connections (read-only)

- [ ] Shopify OAuth: orders, sessions, products. Auto scorecard and backfill 60 days.
- [ ] Meta OAuth (read): campaigns, ad sets, ads, insights. Ad grading rules engine.
- [ ] Cost drivers wizard and target MER.
- [ ] Morning scorecard email.

## Week 4: approvals and Meta writes

_All Meta and Google writes create **paused** entities; there is no code path that edits budgets on live campaigns or launches anything (see [execution-model.md](execution-model.md))._

- [ ] Approval cards with preview, AI cost, spend impact versus cap, expiry, undo.
- [ ] Executor: pause ads, budget change within cap and the 20% rule, duplicate ads from a paused staging campaign. Idempotency, revert payloads.
- [ ] Append-only audit log and activity feed.
- [ ] Guardrails page (caps, auto-approve rules, kill switch).
- [ ] Meta app review submission (start in week 1 paperwork; the review can take weeks).

## Week 5: Google, wallet, chat

- [ ] Google Ads and Merchant Center read; search terms; draft negatives; budget changes with approval.
- [ ] Wallet top-ups, ledger, holds, 2x billing, stop at $0.
- [ ] Chat copilot with RAG over SOPs and store data; "Add to Today" and "Draft this" actions.
- [ ] Trends feed admin (generate, review, publish weekly).

## Week 6: Growth features, polish, beta

- [ ] Klaviyo read plus draft flows and campaigns (approval to go live).
- [ ] Weekly agency-style report (Tier 3).
- [ ] Compound Score, streaks, milestones.
- [ ] Admin margin dashboard.
- [ ] Golden-set evaluation for plans and diagnoses.
- [ ] Private beta with 10 to 20 stores; measure cost per active store per day.

## Status of the scaffold (6 Oct 2026)

Already built in the repo: marketing site, About, Learn, auth, Stripe, Today with the 64-day curriculum, Insights (rules engine on example signals), Approvals, Daily scorecard, Campaign tracker, Campaign builder, Email automation, Trends and Weekly report (seeded). The weeks above now mainly add the real connectors, crawler, LLM drafting and executors.

## Month 2

- [ ] PWA with push notifications for approvals.
- [ ] Shopify theme edit drafts with preview (Growth beta).
- [ ] TikTok read connector.

## Non-goals for v1

- Custom model training or GPUs.
- Native mobile apps.
- Reselling ad spend or holding customer ad budgets.
- Fully autonomous agents. Every write goes through approval.
- Any third-party course or community content in the product or repo.

## Risks

| Risk | Mitigation |
| --- | --- |
| Meta and Google API app review delays | Start applications in week 1; ship read-only and guides first |
| LLM cost creep | Cost guard, caps, caching, rules-first design, admin margin alerts |
| Wrong advice damages a store | Rules engine with conservative defaults, approvals, undo, evaluation set |
| Account bans from automated changes | Small changes, rate limits, no policy-risky content, human approval |
| Data security | Least-privilege scopes, encrypted tokens, tenant isolation, audit log |
