# STATUS

_Last updated: 6 Oct 2026, 2:30 PM (Sydney)._

## At a glance

- **Live:** https://ecommercehelix.com (Vercel, Next.js 16). `www` redirects to the apex.
- **Database:** Neon Postgres (Free, `ecommercehelix-db`, us-east-1), connected to Production and Preview. Schema changes are applied to the production database (additive only) before the code is pushed.
- **Sign-in:** Resend email magic link (domain `ecommercehelix.com`, `AUTH_RESEND_KEY` and `EMAIL_FROM` set) plus the demo login (each demo sign-in gets its own isolated test account, labelled "Demo account"). Google sign-in is ready in code but needs Sid's OAuth keys.
- **Deploys:** every push to `main` on GitHub (`Astryks/Ecommercehelix`) builds and deploys to production.
- **Checks:** `npm test` (vitest), `npm run lint`, `npm run build`, plus the 8-gram originality check and banned-term check against private research, all green before each push.

## What Helix does today

**The framework: Attract, Convert, Grow.** All learning content sits in three stages. **Attract** gets the right buyers in (ads, content, social, SEO, creatives, audiences). **Convert** turns visits into sales (site, offer, CRO, checkout, email flows, pricing, promotions). **Grow** keeps more of every sale, then scales (profit numbers, scaling budgets, retention and LTV, stock and suppliers, international, team, AI and tools, Run your business). Stages live in `src/lib/stage-map.json` (module default plus lesson overrides) and `src/lib/stages.ts`. Shown as a visual trio on the home page, Learn and About, a chip on every lesson, the stage of the current lesson on Today and a label on each roadmap day. Tested in `tests/stages.test.ts`.

**Who it is for (new, 6 Oct 2026).** Headline (`WHO_HEADLINE` in `src/lib/audience.ts`, on the home page `#who`, About, onboarding and `/learn/goals`): **"Built for stores doing $10k to $100k a month that want to reach a $1M year, profitably."** Three revenue bands: **Just starting** ($0 to first sales, under about $10k a month, great start), **Growing** (about $10k to $100k a month, up to about $1M a year, most value), **Scaling** (about $1M to $10M a year, good fit). Milestones: first sale, first $10k month, first $100k month, first $1M year, first $10M year. The bands line up with the stages in `docs/compound-daily-plan.md` (under $10k, $10k to $100k, $100k+ a month).

**Goals ladder (new, 6 Oct 2026).** Nine numbers in funnel order, each with a stage and a benchmark that matches the Dashboard explanations: site visits (Attract), CTR (Attract, 1%+ solid, 1.2%+ strong), add-to-cart rate (Convert, about 7.5%+), conversion rate (Convert, 2%+ solid), AOV (Convert), ROAS and MER (Grow, MER 20 to 35%), CPA (Grow, below break-even), contribution margin (Grow, 15%+), and **net profit** (Grow, the goal). Headline everywhere (`GOALS_HEADLINE` in `src/lib/goals.ts`): **"The goal is profit, not just revenue."** On the home page `#goals`, About (ordered list), onboarding (the goals fieldset shows the nine in order) and `/learn/goals`. Where it shows:
- Home page short section (`#goals`).
- Full guide at `/learn/goals` (public), linked from Learn, the Dashboard and onboarding.
- Onboarding (`/start`) asks for optional monthly targets; blank fields use the track's suggestions. Saving also sets the MER target and the monthly sales target to what the goals add up to.
- `/dashboard/goals` (new sidebar item "Monthly goals"): targets against the last 30 days with on track / close / off track, what the goals add up to (orders, sales, ad spend, contribution, net profit) and a form to change them.
- Today (compact ladder under the Dashboard card) and the Dashboard (`/dashboard/analytics#goals`).
- Actuals: visits, conversion, AOV, MER, CPA, contribution and net profit come from the daily numbers; CTR from Meta when connected; add-to-cart rate waits for the Shopify connection.
- Storage: new Prisma model `MonthlyGoals` (one row per user; MER stays in `ScorecardSettings`). Logic in `src/lib/goals.ts` (tested in `tests/goals.test.ts`).

**Black Friday and Cyber Monday all year (new, 6 Oct 2026).** BFCM is treated as the most important window of the year for many stores. The plan starts on **1 August** (was 12 weeks out, so it used to start in early September and read as an October-only plan). The prep plan has 18 dated steps in five stages:
- **August:** look back at last year and set targets (1 Aug), start testing ad angles and creatives, start building the email and SMS list, test offer ideas.
- **September:** order stock 10 to 12 weeks out, lock the offer, scale the winning tests (and book creators).
- **October:** finalise sale creatives, warm up audiences, build email and SMS flows, load stock and get ready to ship, build sale campaigns switched off.
- **November:** freeze the site and test codes, hype, launch, check results daily and scale winners through Cyber Monday.
- **December and January:** review the sale, write next year's test plan (the plan stays open about 50 days after Black Friday for these, listed after any upcoming date).
Where it shows: a "Critical" Black Friday card on Today from 1 August with the month-by-month timeline (it stays on Today even when another date such as Father's Day is closer), the one-click "Add the prep plan", every step on the Calendar on its own date ("Black Friday prep" entries, also in the .ics feed), a "Black Friday is won months before November" callout with the timeline at the top of the Calendar, a full section on the home page (`#bfcm`) and a rewritten About section. From February to July, Today shows a light "Test now for Black Friday" nudge with a different idea each month and a countdown to 1 August. Headlines change by month (August test, September commit, October build, November launch, live, review). Lesson 13.10 and day 52 now describe the staged plan. Logic in `src/lib/seasons.ts` (`BFCM_CRITICAL`, `BFCM_STAGES`, `bfcmTip`, `bfcmPlanEntries`), tested in `tests/seasons.test.ts` and `tests/calendar.test.ts`.

**Home page messages (new, 6 Oct 2026).** Besides the hero, framework, "Profit, profit, profit." and goals sections, the home page now says:
- **Nervous about ads?** Owners are scared to advertise, put in a little money, see nothing and give up. Helix shows how Meta and Google ads actually work (why small tests fail, a break-even limit on every dollar, learn by doing with paused drafts).
- **You do not need an expensive agency to grow.** Agencies charge high retainers and often do not deliver, and transparency is rarely in their interest. Helix keeps you in control, growing a little every day with compounding working for you. A side-by-side "typical agency vs with Helix" table. The same message is merged into About's "Why you should stay in control" (no duplicate section).
- **Black Friday all year** (above) and a new FAQ, "Who is Helix for?".

**Other features (all live):**
- **Today:** profit-yesterday box with a one-minute update form, the day's lesson and action for your track (Just starting 28 days, Growing 64 days), up to two insights, seasonal alerts and prep plans, upcoming key dates, stock and admin reminders, goals ladder, streak and compound score, roadmap.
- **Dashboard** (`/dashboard/analytics`): week, month, year-to-date and last-12-months views compared with the previous period; revenue vs costs vs profit, profit trend, cost donut, ROAS and MER with the break-even line, channels, new vs returning; 16+ metric cards with plain-words explanations; ratings against the user's own break-even lines (`src/lib/analytics.ts`, `src/lib/metric-info.ts`, tested). Demo mode seeds two years of labelled example days.
- **Calendar** (`/dashboard/calendar`): every key date for 12 months for AU and US, countdowns, prep-plan status, business admin dates and Black Friday prep steps; `.ics` download and Google/webcal subscribe (`/api/calendar`).
- **Seasonal alerts and nudges:** Black Friday, Christmas cut-offs, Boxing Day and New Year, Valentine's Day, Mother's Day, EOFY, Father's Day (AU and US). Weekly report "Coming up" section. `/api/cron/seasonal-nudges` (Mondays 08:00 Sydney) builds a nudge per user; email sends only with `NUDGES_LIVE=1`; push is a stub.
- **Suppliers & stock** (`/dashboard/stock`): suppliers, landed cost, reorder points, stock-out countdowns, Black Friday last safe order dates, reorder alerts on Today.
- **Run your business** (`/dashboard/business`): modules 23 to 28 with AU and US versions, 13 topics, verified thresholds, dated admin reminders (BAS, tax returns, EOFY, 1099-NEC, estimated tax, security checks). General information, not advice.
- **GST/VAT setting:** "My prices include GST/VAT" strips tax from sales before any profit maths (`src/lib/tax.ts`).
- **Learn:** 28-module Helix Playbook in plain words, each lesson tagged with a stage, "In plain words" boxes, a 106-term glossary (`/learn/words`), 16 drawings that show where to click, and the goals ladder guide.
- **Meta integration (real):** Facebook Login for Business connect, encrypted long-lived token, asset picker, daily sync plus Sync now, insights into the campaign tracker and audit rules, paused-only drafts after approval, audit log, disconnect. Mock mode without a Meta app. Setup: `docs/meta-setup.md`.
- **Other screens:** What to fix (insights), Waiting for your OK (approvals), Your numbers (scorecard and CSV import), Your ads, campaign builder, Email automation, Ad Trends, Weekly report, Connections, Settings (track, country, GST/VAT), Plan & billing (Stripe Checkout and webhook, waiting for keys).

## Waiting on Sid

1. **Stripe:** secret key, webhook secret and the price IDs for Starter ($29) and Growth ($59). Until then, paid plans cannot be bought on the live site.
2. **Meta:** create the Meta app, complete Business Verification and App Review (steps in `docs/meta-setup.md`), then add `META_APP_ID` and `META_APP_SECRET` in Vercel. Until then Meta runs in mock mode.
3. **Google sign-in (optional):** an OAuth client ID and secret (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) if you want "Continue with Google" next to email sign-in.
4. **Demo login on production:** `ALLOW_DEV_LOGIN` is on so people can try Helix. Decide when to switch it off.

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
| Seasonal alerts, prep plans and nudge messages from the real date; Black Friday plan from 1 August with calendar steps and year-round nudges | Push notifications (stub); nudge email sending is off unless `NUDGES_LIVE=1` |
| Monthly goals ladder: targets, actuals from daily numbers and Meta CTR, ratings | Add-to-cart rate actuals (need Shopify sync) |

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
15. ~~Vercel project and Postgres provider?~~ Decided: Vercel and Neon (6 Oct 2026). Stripe price IDs are still needed (see Waiting on Sid).
16. Calendar: which other countries next (UK, NZ, Canada)? Should Helix fetch official Click Frenzy dates each year instead of the approximate rule?
17. Who Helix is for: is the headline right ("built for stores doing $10k to $100k a month that want to reach a $1M year, profitably")? Bands: Just starting under about $10k a month, Growing about $10k to $100k a month (most value), Scaling about $1M to $10M a year.
18. Goals ladder: are the suggested starting goals right for each track (Growing: 30,000 visits, 1.2% CTR, 7.5% add to cart, 2.2% conversion, $92 AOV, 30% MER, $28 CPA, 20% contribution, $3,000 net profit; Just starting: 3,000 visits, 1% CTR, 6%, 1.5%, $60, 35% MER, $21, 10%, $0 or more)?
19. Black Friday: should the August to January plan also run for Click Frenzy and Singles Day stores, or stay focused on BFCM? Should the Monday nudge email go out every week from August, or fortnightly until October?

## Changelog: 6 Oct 2026 (Sydney)

- **Today, about 2:45 PM:** sharper messages: "Built for stores doing $10k to $100k a month that want to reach a $1M year, profitably" and "The goal is profit, not just revenue" with the nine objectives in order, on home, About, onboarding and `/learn/goals`.
- **Today, about 2:30 PM:** Black Friday all year (plan from 1 August in five stages, Today banner, calendar steps, home and About messages, year-round test nudges), home messages on fear of advertising and on agencies (merged into About), who Helix is for (revenue bands), the goals ladder (home, `/learn/goals`, onboarding targets, `/dashboard/goals`, Today and Dashboard against actuals, new `MonthlyGoals` table), STATUS rewrite.
- **2:01 PM:** Attract, Convert, Grow: every module and lesson tagged with a stage, trio on home, Learn and About.
- **1:55 PM:** Run your business: modules 23 to 28, business hub, dated admin reminders.
- **1:46 PM:** GST/VAT setting.
- **1:41 PM:** Suppliers & stock.
- **1:37 PM:** Restyle (paper, navy ink, terracotta accent, sage positives, serif headings) and new logo colours.
- **1:31 PM:** Shopify store setup module 22 and the 28-day Just starting track; demo login isolated per sign-in.
- **1:21 PM:** Visual Dashboard.
- **Earlier today:** production went live at ecommercehelix.com (Vercel, Neon, Resend email sign-in, GitHub auto-deploy).
