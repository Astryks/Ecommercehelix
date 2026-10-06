# STATUS

_Last updated: 6 Oct 2026 (Sydney)._

## Current state

- Docs: README, compound daily plan, product design, pricing, MVP build plan, 18 SOPs, the 21-module Helix Playbook, the 64-day daily curriculum, audit engine design, email automation, execution model.
- Web app (Next.js 16, Vercel-ready): marketing site, About, Learn, Auth.js sign-in, Stripe Checkout + webhook, dashboard with Today (day-by-day curriculum + insights + roadmap), Insights, Approvals, Daily scorecard, Campaign tracker, Campaign builder, Email automation, Ad Trends, Weekly report, Plan & billing. `npm run build` and `npm run lint` pass.
- Runs with zero keys in demo mode (in-memory store, demo login, instant plan switching).

### Real vs stubbed

| Real | Stubbed or seeded |
| --- | --- |
| Auth.js (Google, Resend magic link, demo credentials), JWT sessions, Prisma adapter when a DB exists | Live crawler, PageSpeed calls, Shopify/Meta/Google/Klaviyo/social API pulls |
| Prisma schema (users, plans, tasks, approvals, scorecard days, product sales, settings) and dual DB/in-memory repository | Insight signals (EXAMPLE), campaign rows (EXAMPLE), flow status and revenue (EXAMPLE) |
| Scorecard maths, rollups, RAG flags, CSV import, manual entry | Scorecard sync buttons (Shopify, Meta, Google) |
| Cross-diagnosis rules engine and campaign recommendation rules | Pushing paused drafts to ad accounts; creating flows in Klaviyo/Shopify Email |
| Curriculum progression, streak, compound score, plan gating, approvals | LLM drafting (approval text is templated), wallet top-up |
| Stripe Checkout + signed webhook setting the plan | Ad Trends pipeline and weekly report generation (seeded) |

## Decisions made

- Name: **Ecommerce Helix** (ecommercehelix.com). Tagline: "Grow your e-commerce business a little every day".
- Positioning: a growth copilot that behaves like a head of growth by your side. Every day: one lesson, one topic, one action, plus up to two insights. Ask before acting.
- Execution model (Sid, 6 Oct 2026): **Draft & you launch** by default. Helix pushes campaigns into the user's own Meta/Google account as paused drafts; the user presses Launch. Budget edits on live campaigns are always made by the user. **Guide me** mode for users without connected accounts. See docs/execution-model.md.
- Proactive audits (site, ads, email, social) with cross-diagnosis rules feed Today and Insights. See docs/audit-engine.md.
- Email automation: Helix suggests missing flows, drafts them and sets them up after approval. See docs/email-automation.md.
- Pricing: Free $0 (daily programme Days 1 to 17, monthly audit, no bot actions, hard cost cap), Starter $29 (Days 1 to 52, approval queue, paused-draft builds, one of Meta or Google, about $3 AI included at cost), Growth $59 (all 64 days, Meta and Google, email flows set up after approval, scorecards, weekly report, about $8 AI included at cost). Extra AI via prepaid wallet at 2x provider cost, stops at $0. Ad spend stays on the customer's own accounts.
- Stack: Next.js on Vercel, Postgres, Prisma, Auth.js, Stripe, Vercel AI SDK with hosted models, SOPs as RAG. PWA push approvals in month 2. Native app later. No GPUs or fine-tuning in v1.
- Model routing: rules first (no LLM), Flash-Lite for extraction, Haiku 4.5 for daily writing and chat, Sonnet 5.5 for weekly reports and diagnosis.
- All playbooks are original Helix SOPs. Private research material stays outside this repo (`research/` and `transcripts/` are gitignored).

## Open questions for Sid

1. Which ad platform gets paused-draft builds first: Meta (bigger impact for most small stores) or Google?
2. Shopify-only at launch, or also WooCommerce?
3. Wallet minimum top-up: $10 (recommended) or $5? Should unused credit ever expire?
4. Free-tier abuse controls: is email verification plus one free store per domain enough, or do we require a card for audits beyond the first?
5. Launch market: Australia first (GST-inclusive pricing in AUD?) or US first (USD, GST-free)?
6. Keep or drop a human "done with you" review add-on for later?
7. Brand voice: friendly coach, or crisp operator? Any words to avoid?
8. Legal: terms of service and liability wording for approved bot actions on ad accounts and stores; who reviews?
9. Meta and Google developer app approvals: who owns the business verification and app review submissions?
10. Who reviews the weekly Trends feed before publishing in v1?
11. Auth preference: magic link plus Google (current) or add password login?
12. Pausing losing ads: may Helix pause after a per-action approval (it only reduces spend), and should we offer an opt-in auto-pause rule? Currently: pause with approval, no auto-pause.
13. Plan gating of the daily programme: Free Days 1 to 17, Starter to Day 52, Growth all 64. Happy with that split?
14. Social profile audit: public-data checks only at launch, or request Instagram/TikTok/Facebook account access for insights?
15. Vercel project and Postgres provider (Neon, Supabase or Vercel Postgres)? Stripe price IDs for Starter and Growth?
