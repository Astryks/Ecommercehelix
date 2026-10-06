# STATUS

_Last updated: 6 Oct 2026 (Sydney)._

## Current state

- Product docs written: README, compound daily plan, product design, pricing, MVP build plan and 18 SOPs.
- Web app: lean Next.js scaffold in progress (marketing site, About, auth, Stripe plan webhook, dashboard with seeded Today, roadmap, approvals, trends, weekly report, billing). Connectors (Shopify, Meta, Google, Klaviyo) and LLM features are not built yet.
- No production deployment yet.

## Decisions made

- Name: **Ecommerce Helix** (ecommercehelix.com). Tagline: "Grow your e-commerce business a little every day".
- Positioning: a growth copilot that behaves like an agency account manager. Max 3 tasks a day. Ask before acting.
- Pricing: Free $0 (3 audits and 3 daily plans a month, no bot actions, hard cost cap), Starter $29 (daily plans, approval queue, one of Meta or Google, about $3 AI included at cost), Growth $59 (Meta and Google, email, scorecards, weekly report, about $8 AI included at cost). Extra AI via prepaid wallet at 2x provider cost, stops at $0. Ad spend stays on the customer's own accounts.
- Stack: Next.js on Vercel, Postgres, Prisma, Auth.js, Stripe, Vercel AI SDK with hosted models, SOPs as RAG. PWA push approvals in month 2. Native app later. No GPUs or fine-tuning in v1.
- Model routing: rules first (no LLM), Flash-Lite for extraction, Haiku 4.5 for daily writing and chat, Sonnet 5.5 for weekly reports and diagnosis.
- All playbooks are original Helix SOPs. Private research material stays outside this repo (`research/` and `transcripts/` are gitignored).

## Open questions for Sid

1. Which ad platform gets "Do it for me" first: Meta (bigger impact for most small stores) or Google?
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
