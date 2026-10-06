# Ecommerce Helix

**ecommercehelix.com**

Ecommerce Helix is a growth copilot for online store owners. You paste your store URL. Helix audits the store, scores it, and builds a short plan for today and this week. Each day you get at most three tasks. Each task says why it matters, how to do it, and how long it takes. You can do the task yourself with a step-by-step guide, or press **Do it for me**. Helix then prepares the change and asks for your approval before it touches anything.

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
| Free | $0 | 3 store audits and 3 daily plans a month. Guides only, no bot actions. |
| Starter | $29/mo | Daily plans, approval queue, one ad platform (Meta or Google), about $3 of AI usage included at cost. |
| Growth | $59/mo | Meta and Google, email and SMS flows, scorecards and weekly reports, about $8 of AI usage included at cost. |
| AI wallet | prepaid | Extra AI work billed at 2x provider cost. Stops at a $0 balance. Never auto-charges. |

Ad spend always runs on your own ad accounts and your own card. Helix never resells media. Full unit economics: [docs/pricing.md](docs/pricing.md).

## Documentation index

| Doc | What it covers |
| --- | --- |
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
3. **Ask before acting.** Every write action (ads, site, email) goes through an approval card with a preview, a cost estimate, a spend cap and an undo path.
4. **Extremely easy to follow.** Three tasks a day at most, each with a time estimate and a checklist.
5. **Never lose money on a step.** Every AI action is costed before it runs. Free usage is hard-capped. Paid usage is prepaid.

## Stack (v1)

Next.js on Vercel, Postgres, Stripe Billing, Vercel AI SDK with hosted LLMs and tool calling, SOPs as RAG documents. PWA push approvals in month 2. Native app later. No GPUs or custom model training in v1.

## Status

Docs-first. No application code yet. See [STATUS.md](STATUS.md).

## Independence note

Ecommerce Helix playbooks are original operating procedures written for this product. They are based on widely used e-commerce growth practice (unit economics, creative testing, conversion rate optimisation, lifecycle marketing). They do not reproduce or republish any third-party course, coaching program or paid community content.
