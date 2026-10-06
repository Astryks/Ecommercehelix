# STATUS

_Last updated: 6 Oct 2026 (Sydney)._

## Current state

- Docs: README, compound daily plan, product design, pricing, MVP build plan, 18 SOPs, the 21-module Helix Playbook, the 64-day daily curriculum, audit engine design, email automation, execution model.
- Web app (Next.js 16, Vercel-ready): marketing site, About, Learn, Auth.js sign-in, Stripe Checkout + webhook, dashboard with Today (profit box + day-by-day curriculum + insights + roadmap), What to fix (insights), Waiting for your OK (approvals), Your numbers (scorecard), Your ads (campaign tracker), Campaign builder, Email automation, Ad Trends, Weekly report, Plan & billing. `npm run build` and `npm run lint` pass.
- Runs with zero keys in demo mode (in-memory store, demo login, instant plan switching).
- **Meta integration (real):** Facebook Login for Business connect, long-lived token stored encrypted (AES-256-GCM), ad account / Page / pixel picker, daily sync via Vercel Cron plus Sync now, insights into the Campaign tracker, scorecard ad spend and audit rules, paused-only draft creation after approval, full audit log, disconnect. Mock mode runs it all without a Meta app. Setup steps: docs/meta-setup.md. `npm test` covers the guardrail and encryption.
- **Plain words (Sid, 6 Oct 2026):** every lesson, day and screen uses short, simple sentences with numbered steps, and any tricky word is explained in one line (68-term glossary at docs/glossary.md and /learn/words; a "Words to know" box appears automatically on lessons and days). All 21 playbook modules are now fully rewritten in plain step-by-step language (every lesson body, keeping the detail and decision rules and the same lesson headings), each opening with an "In plain words" box (`scripts/plain_layer.py`). The 18 SOPs are internal procedures the copilot reads, not shown in the app; each now opens with an "In plain words" summary while the detailed procedure below is unchanged. `scripts/check_links.py` checks every doc anchor and lesson link.
- **Proactive seasonal alerts (Sid, 6 Oct 2026):** `src/lib/seasons.ts` works out key dates from the real Sydney date (Black Friday 27 Nov 2026, Christmas cut-offs, Boxing Day and New Year, Valentine's Day, Mother's Day, EOFY, Father's Day) and shows the most urgent one as a prominent banner on Today and the home page (home rebuilds hourly). "Add the prep plan" adds 5 to 10 dated steps (stored in `SeasonPlan`; ticks use normal task completions with `season-...` ids). The weekly report has a live "Coming up" section with a preview of the Monday email and push. `/api/cron/seasonal-nudges` (Vercel Cron, Mondays 08:00 Sydney summer time) builds a nudge per user and logs it; email really sends only with `NUDGES_LIVE=1` plus Resend keys; push is a stub until web push or the app exists.
- **Calendar and tracks (Sid, 6 Oct 2026):** a Calendar page (`/dashboard/calendar`) with every key date for the next 12 months by country (AU and US), countdowns, plain notes, prep-plan status, `.ics` download and Google/webcal subscribe links (`/api/calendar`, public, no user data; subscribing needs a public URL). Today has an "Upcoming key dates" strip. Click Frenzy and the US and AU back-to-school dates are marked approximate. Onboarding (`/start`) now asks for the track and country. Two tracks: **Just starting** (21 lighter days: product and offer validation, store basics, first small-budget test campaign; all stages free) and **Growing** (the 64-day programme). Settings (`/dashboard/settings`) switches track or country; progress per track is kept (`start-N` and `day-N` task ids). New User fields: `track`, `country`, `onboardedAt` (run `npm run db:push`).
- **Fixed (6 Oct 2026):** Today and the roadmap now always agree. The next lesson is the lowest-numbered unfinished day (`src/lib/progress.ts`, tested). "Tomorrow" only shows after you finish that day's lesson today.
- **Drawings that show where to click:** 9 numbered SVG guides in `public/guides/` (Meta x4, Google x2, Shopify x2, Helix x1, made by `scripts/build_guides.py`), embedded in modules 1, 7, 8, 9 and 20 with official help links. They are clearly labelled as drawings, not real screenshots.
- **Today screen:** a big profit-yesterday number, a one-line "what this means today", and a one-minute form (sales, orders, Meta ads auto-filled when connected, Google ads). Each day's strategy shows what, why, numbered how, "Want me to do it for you?" and what to watch.
- **Home page:** a "Profit, profit, profit." section: profit is what counts; you need to spend on ads to make revenue and Helix keeps it profitable with break-even targets; Meta and Google can seem saturated but still work for most stores; "Let's grow a little every day."

### Real vs stubbed

| Real | Stubbed or seeded |
| --- | --- |
| Auth.js (Google, Resend magic link, demo credentials), JWT sessions, Prisma adapter when a DB exists | Live crawler, PageSpeed calls, Shopify/Google/Klaviyo/social API pulls |
| Meta: OAuth connect, encrypted tokens, asset picker, daily sync, paused drafts, audit log, disconnect (needs Sid's Meta app for live data; mock mode otherwise) | Meta App Review and Business Verification (Sid's steps in docs/meta-setup.md) |
| Prisma schema (users, plans, tasks, approvals, scorecard days, product sales, settings, Meta connection, snapshot, drafts, audit log) and dual DB/in-memory repository | Non-Meta insight signals (EXAMPLE), Google and TikTok campaign rows (EXAMPLE), flow status and revenue (EXAMPLE) |
| Scorecard maths, rollups, RAG flags, CSV import, manual entry, Meta ad spend sync | Scorecard sync for Shopify and Google |
| Cross-diagnosis rules engine (Meta block fed by real data when connected) and campaign recommendation rules | Google paused drafts; pausing losing Meta ads (guardrail allows it, UI not built); creating flows in Klaviyo/Shopify Email |
| Curriculum progression, streak, compound score, plan gating, approvals | LLM drafting (approval text is templated), wallet top-up |
| Stripe Checkout + signed webhook setting the plan | Ad Trends pipeline and weekly report generation (seeded) |
| Seasonal alerts, prep plans and nudge messages from the real date | Push notifications (stub); nudge email sending is off unless `NUDGES_LIVE=1` |

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

1. ~~Which ad platform first?~~ Decided: Meta first (6 Oct 2026). Next: create the Meta app and run docs/meta-setup.md.
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
13. Plan gating of the daily programme: Free Days 1 to 17, Starter to Day 52, Growth all 64. The Just starting track (21 days) is free in full, with Do it for me still gated. Happy with that split?
14. Social profile audit: public-data checks only at launch, or request Instagram/TikTok/Facebook account access for insights?
15. Vercel project and Postgres provider (Neon, Supabase or Vercel Postgres)? Stripe price IDs for Starter and Growth?
16. Calendar: which other countries next (UK, NZ, Canada)? Should Helix fetch official Click Frenzy dates each year instead of the approximate rule?
