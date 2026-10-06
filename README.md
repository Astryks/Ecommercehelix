# Ecommerce Helix

**ecommercehelix.com**

*Grow your e-commerce business a little every day.*

Ecommerce Helix is a growth copilot for online store owners. You paste your store URL. Helix keeps auditing the store, the ad accounts, email and social profiles, and connects the dots (is it the ad, the page, the offer or the checkout?). Every day you get **one short lesson, one topic and one clear action**, plus up to two things Helix noticed. You can do it yourself with a step-by-step guide, or say **I'll do it for you**. Helix then prepares the work and asks for your approval. In ad accounts it builds **paused drafts** and you press Launch: Helix never turns on spend.

Think of it as a good ad agency account manager who never sleeps. It watches your numbers, tells you what to fix first, shows you which ad formats are working right now, and keeps a roadmap of what it can take off your plate. It does not take over without asking. You keep oversight and the final call on every change, every dollar of ad spend and every email that goes out.

## Who it is for

- Founders running a Shopify (first) store doing anything from $0 to a few hundred thousand dollars a month.
- People who run their own Meta and Google ads, or who want to stop paying an agency they cannot see into.
- Owners who know they "should" be doing email flows, creative testing and site tests but do not know what to do first.

## The core idea: compound the business every day

Most stores do not fail from one big mistake. They drift. Helix replaces drift with a 15 to 30 minute daily loop:

1. Check the scorecard (is today's profit on track?).
2. Take one ad action.
3. Take one site or conversion action.
4. Take one retention action (email, SMS, reviews, repeat buyers).
5. Learn one thing and log it.

Small improvements to traffic, conversion, order value and margin multiply together. Improving each of three levers by 10% lifts revenue by about 33%, and profit by much more. See [docs/compound-daily-plan.md](docs/compound-daily-plan.md).

## How it makes money (summary)

| Plan | Price | What you get |
| --- | --- | --- |
| Free | $0 | Daily programme Days 1 to 17, monthly site audit, manual scorecard, Guide me ad builder, full Learn library. |
| Starter | $29/mo | Days 1 to 52, "I'll do it for you" with approval, daily Insights, one ad platform (Meta or Google) with paused-draft campaign builds, about $3 of AI usage included at cost. |
| Growth | $59/mo | All 64 days, Meta and Google, email and SMS flows drafted and set up after approval, weekly report, about $8 of AI usage included at cost. |
| AI wallet | prepaid | Extra AI work billed at 2x provider cost. Stops at a $0 balance. Never auto-charges. |

Ad spend always runs on your own ad accounts and your own card. Helix never resells media. Full unit economics: [docs/pricing.md](docs/pricing.md).

## Documentation index

| Doc | What it covers |
| --- | --- |
| [docs/playbook/](docs/playbook/README.md) | **The Helix Playbook**: 21 modules of original lessons, checklists, examples and self-checks (also served in the app at /learn). |
| [docs/daily-curriculum.md](docs/daily-curriculum.md) | The 64-day programme: one lesson, one topic, one action per day, ordered by store stage (generated). |
| [docs/audit-engine.md](docs/audit-engine.md) | Proactive audits: schedules, crawler, PageSpeed, API pulls, cross-diagnosis rules, Insights. |
| [docs/email-automation.md](docs/email-automation.md) | Nine email and SMS flows with draft copy; suggest, draft, approve, set up. |
| [docs/execution-model.md](docs/execution-model.md) | Draft & you launch (paused drafts, user launches) and Guide me modes. What Helix may and may not do. |
| [docs/meta-setup.md](docs/meta-setup.md) | Meta integration: the exact steps to create the Meta app, verification, App Review, redirect URIs and environment variables. |
| [docs/compound-daily-plan.md](docs/compound-daily-plan.md) | The operating system: daily loop, weekly and monthly rhythm, 90-day roadmaps by store stage, thresholds and decision rules. |
| [docs/product-design.md](docs/product-design.md) | Screens, wireframes, onboarding, approval flow, trends feed, reports, chat, engagement, data model and agent architecture. |
| [docs/pricing.md](docs/pricing.md) | Tiers, per-action cost estimates, margin proof, guardrails so no step loses money. |
| [docs/mvp-build.md](docs/mvp-build.md) | Six-week build plan for the web app. |
| [docs/sops/](docs/sops/) | 18 standard operating procedures the copilot retrieves (RAG) to plan and guide. |
| [STATUS.md](STATUS.md) | Current state, decisions made, open questions. |

### SOP library

| # | SOP |
| --- | --- |
| 01 | [Store audit](docs/sops/01-store-audit.md) |
| 02 | [Daily scorecard and unit economics](docs/sops/02-scorecard-and-unit-economics.md) |
| 03 | [Constraint diagnosis](docs/sops/03-constraint-diagnosis.md) |
| 04 | [Offer design](docs/sops/04-offer-design.md) |
| 05 | [Meta account structure and scaling](docs/sops/05-meta-structure-and-scaling.md) |
| 06 | [Meta daily optimisation](docs/sops/06-meta-daily-optimisation.md) |
| 07 | [Creative testing](docs/sops/07-creative-testing.md) |
| 08 | [Creative briefs, UGC and creators](docs/sops/08-creative-briefs-ugc-creators.md) |
| 09 | [Google Shopping, PMax and Search](docs/sops/09-google-shopping-pmax-search.md) |
| 10 | [TikTok and emerging channels](docs/sops/10-tiktok-and-emerging-channels.md) |
| 11 | [Landing pages and site CRO](docs/sops/11-landing-pages-and-cro.md) |
| 12 | [Order value and cart offers](docs/sops/12-aov-and-cart-offers.md) |
| 13 | [Email and SMS flows](docs/sops/13-email-sms-flows.md) |
| 14 | [List growth and campaign calendar](docs/sops/14-list-growth-and-campaigns.md) |
| 15 | [Promo calendar and sale playbook](docs/sops/15-promo-calendar-and-sales.md) |
| 16 | [Customer research and reviews](docs/sops/16-customer-research-and-reviews.md) |
| 17 | [Inventory, cash and planning](docs/sops/17-inventory-cash-planning.md) |
| 18 | [Founder rhythm, hiring and agencies](docs/sops/18-founder-rhythm-hiring.md) |

## Principles

1. **Profit first.** The north star is daily contribution profit, not revenue or platform ROAS.
2. **Fix the real constraint.** Ads only fix ad problems. Helix diagnoses before it prescribes.
3. **Ask before acting, never switch on spend.** Every write action (ads, site, email) goes through an approval card with a preview, a cost estimate and an undo path. Ad campaigns are created paused; the owner launches and makes budget changes.
4. **Extremely easy to follow.** One lesson, one topic, one action a day, plus at most two insights.
5. **Never lose money on a step.** Every AI action is costed before it runs. Free usage is hard-capped. Paid usage is prepaid.

## Stack (v1)

Next.js on Vercel, Postgres, Stripe Billing, Vercel AI SDK with hosted LLMs and tool calling, SOPs as RAG documents. PWA push approvals in month 2. Native app later. No GPUs or custom model training in v1.

## The web app

Everything is written in plain words: short sentences, numbered steps, and a one-line explanation for any tricky word ([glossary](docs/glossary.md), also at `/learn/words`). Setup lessons include numbered drawings that show where to click (`public/guides/`). The Today screen leads with yesterday's profit and one line on what it means.

A Next.js 16 (App Router, TypeScript, Tailwind v4) app lives at the repo root and deploys to Vercel.

| Area | Route | Status |
| --- | --- | --- |
| Marketing home, About, pricing, FAQ | `/`, `/about` | Real |
| Learn (21 playbook modules rendered from `docs/playbook`) | `/learn`, `/learn/[slug]` | Real, static |
| Sign-in (Google, email magic link, or demo login) | `/signin` | Real (Auth.js v5) |
| Today: day N lesson + action, two insights, streak, compound score, right-hand roadmap | `/dashboard` | Real logic, seeded curriculum |
| Insights (proactive audit, cross-diagnosis) | `/dashboard/insights` | Rules engine real, signals EXAMPLE |
| Approvals queue | `/dashboard/approvals` | Real; Meta paused drafts execute for real when connected |
| Connections (Meta connect, asset picker, sync, disconnect, activity log) | `/dashboard/integrations`, `/api/meta/*`, `/api/cron/meta-sync` | Real (mock mode without a Meta app) |
| Daily scorecard (entry, CSV import, rollups, flags, sparklines, products) | `/dashboard/scorecard` | Real; syncs stubbed; example data until cleared |
| Your ads (campaign tracker: spend more / wait / new ads needed / stop) | `/dashboard/campaigns` | Real Meta rows when connected; Google and TikTok EXAMPLE |
| Campaign builder (Draft & you launch, Guide me) | `/dashboard/campaigns/new` | Real paused-draft push to Meta after approval |
| Email automation (9 flows with drafts) | `/dashboard/email` | Drafts real; Klaviyo/Shopify Email setup stubbed |
| Ad Trends, Weekly report | `/dashboard/trends`, `/dashboard/report` | Seeded |
| Plan & billing (Stripe Checkout + webhook) | `/dashboard/billing`, `/api/checkout`, `/api/stripe/webhook` | Real in test mode; instant plan switch in demo mode |

### Run locally

```bash
npm install          # also runs prisma generate
npm run dev          # http://localhost:3000
```

With no environment variables the app runs in **demo mode**: in-memory data (resets on restart), a demo login form, and plan changes without payment. A banner says so.

To go live, copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Auth.js secret (`npx auth secret`) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google sign-in |
| `AUTH_RESEND_KEY`, `EMAIL_FROM` | Email magic links (needs the database) |
| `ALLOW_DEV_LOGIN` | `true` keeps the demo login on even with providers (never in production) |
| `DATABASE_URL` | Postgres; then run `npm run db:push` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe test mode keys |
| `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH` | Recurring price IDs |
| `NEXT_PUBLIC_APP_URL`, `APP_URL` | Public URL used for redirects (`APP_URL` wins for the Meta OAuth redirect) |
| `META_APP_ID`, `META_APP_SECRET`, `META_CONFIG_ID` | Meta app and Facebook Login for Business configuration ([setup steps](docs/meta-setup.md)) |
| `TOKEN_ENCRYPTION_KEY` | 32-byte key (`openssl rand -hex 32`) for AES-256-GCM token encryption |
| `CRON_SECRET` | Protects the daily Meta sync cron |
| `META_MOCK` | `1` forces mock Meta data. Without a Meta app, mock mode is automatic outside production |

Tests: `npm test` (paused-only guardrail, token encryption, Graph client retries, insights mapping).

Regenerate generated docs: `python3 scripts/build_curriculum.py` (curriculum JSON + doc) and `python3 scripts/build_email_doc.py`.

See [STATUS.md](STATUS.md) for what is stubbed and the open questions.

## Independence note

Ecommerce Helix playbooks are original operating procedures written for this product. They are based on widely used e-commerce growth practice (unit economics, creative testing, conversion rate optimisation, lifecycle marketing). They do not reproduce or republish any third-party course, coaching program or paid community content.
