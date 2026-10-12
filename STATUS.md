# STATUS

_Last updated: 13 Oct 2026, about 9 AM (Sydney)._

## At a glance

- **Live:** https://ecommercehelix.com (Vercel project `ecommercehelix`, Next.js 16). `www` redirects to the apex. Every push to `main` on GitHub (`Astryks/Ecommercehelix`) deploys to production.
- **Database:** Neon Postgres via Prisma. Schema changes are additive only and are applied to the production database before the code is pushed. Note: this build machine cannot reach Neon's port 5432, so changes are applied with `prisma migrate diff` (old schema to new schema, no drops allowed) run over Neon's HTTPS driver with the unpooled URL pulled from Vercel into a temp file that is deleted straight after.
- **Sign-in:** Resend email magic links are live. The demo login is on (each demo sign-in is a fresh, isolated test account). Google sign-in is optional and needs Sid's OAuth keys.
- **Checks before every push:** `npm test` (vitest, 166 tests), `tsc`, `npm run build`, the 8-gram originality check and the banned-term check against the private research, plus a title check (5-gram and near-match) of every heading.
- **Content:** 275 lessons in 29 modules (260 rewritten into steps on 6 Oct, 9 overlapping lessons merged on 13 Oct, 16 new lessons in Module 29, 8 more on 13 Oct for profit setup, marketing spend and gaps), plus the Helix Course (21 goals).
- **Research:** private research from two paid courses, kept off-repo. Nothing in this repo copies its wording, names or titles.

## What is new since 6 Oct 2026

**Profit first, marketing guide, free and paid (13 Oct, later).**
- **New course order.** Goal 1 on every track is now **Set up your profit dashboard**, then **Fill in your numbers 7 days in a row**, then **Learn the numbers that run your store** (break-even, target MER, marketing spend, monthly goals), then Attract, Convert, Grow and Run. Old progress on the former first goal carries over.
- **Profit setup** (`/dashboard/profit`, sidebar): enter selling price, product cost, freight and duty, packaging, shipping to the customer, payment fees, marketing per order, Shopify and app subscriptions, other monthly costs and orders a month. A live waterfall shows where each sale goes down to net profit, plus landed cost, gross margin, profit before marketing, break-even cost per purchase, break-even MER and ROAS, and a month's profit. Saving can also set fixed costs for the daily numbers. New additive `ProfitSetup` table (applied to production first).
- **New lessons:** 1.7 Sales, costs and profit in plain English (with a waterfall drawing and a worked $60 example), 1.8 Set up your profit dashboard, 1.9 How much to spend on marketing. Growth, Key metrics, Dashboard and Profit setup link to 1.7.
- **Marketing as a % of sales** (guide, not rule) on Profit setup, Growth and Key metrics: your share against the band for your size and your own break-even line. Under about $5k a month: no % target, a small fixed test budget judged by cost per purchase. Growing: about 10% to 30%. Scaling: about 15% to 25%, more while contribution stays positive. Break-even MER = profit before marketing / sales; break-even ROAS = 1 / break-even MER.
- **Free and paid, enforced in code.** Free: profit dashboard, daily numbers, key metrics, Growth by day and week, Dashboard week and month, the numbers goals of the course, every lesson, top 3 fixes from the monthly audit. Starter: Attract and Convert goals, Do it for me, Meta connect (gated in the connect route), seasonal prep plans (gated in the server action), all fixes, month, year and 12-month history. Growth: Grow and Run goals. Course ticks and confirms check the plan on the server. Friendly upgrade notes appear at the moment of value (next course goal, month view, more fixes, Connect Meta, prep plan). Checkout stays behind the existing Stripe flag.
- **Gaps closed:** 3.10 Subscribe and save, 9.16 When conversion suddenly drops, 13.12 A smaller sale between the big ones, 23.7 Customer service that keeps customers, 28.9 Selling to shops, each added to a course goal. A private coverage map was made against the private research (kept off-repo).
- **Fixes:** old links to renamed or merged lessons now jump to the exact lesson, even across modules; Black Friday steps that have already passed show as one catch-up line instead of many overdue tasks; course time estimates are capped (no task over 20 minutes, no day over an hour).

**The Helix Course (13 Oct).** A guided program on top of the lessons. One goal at a time, in plain words with a measurable finish line, on the profit-first ladder: your numbers, then Attract, Convert, Grow, then run the business. Three tracks: Just starting ($0 to $10k a month), Growing ($10k to $100k) and Scaling (over $100k). 20 goals, 16 per track. Each goal runs over 5 to 11 days; a day has 1 task on light days and up to 5 on busy ones. Every task is one action with the expected result, a time estimate, a link to the lesson step, Do it for me and Guide me. Ticking a day unlocks the next; hitting the finish line (checked from real daily numbers where possible, otherwise confirmed by the owner) unlocks the next goal with a small celebration. Sale prep (Black Friday from 1 August, Christmas, EOFY and more) and tax dates (BAS, EOFY, US dates) slot into the day when due within a week. Today now leads with Your goal (progress bar), Today's tasks and Why this matters. `/course` shows the whole path (done, current, locked, with day counts) and `/course/goal/<id>` shows each goal's days. Progress: new `CourseState` table plus the existing task and lesson-step tables, so ticks are shared with the lessons. Design: `docs/playbook/course.md`. Code: `src/lib/course-plan.ts`, `src/lib/course.ts`, `src/app/course`, `src/components/course`. Tests: `tests/course.test.ts`.

**Content audit and new lessons (13 Oct).** Every Helix title and heading was checked against the private research titles and branded phrases. 26 lesson and module titles were renamed to plain, original wording that says what you do (for example "Say clearly what the customer gets", "Your yearly sales calendar", "A 10-minute weekly stock check"). 9 overlapping lessons were merged into one each (for example community, content pillars, hiring, agencies, resilience, speed, tracking and policies); old step ticks, links and page anchors still work through `src/lib/lesson-aliases.json`. New Module 29, "Customers, partners and the weekly rhythm": 16 lessons (5 Attract, 3 Convert, 8 Grow) on customer words, the worry behind the purchase, repurposing content, referrals, partner brands, guest spots, a weekly story email, buying-question emails, leading numbers, a 30-minute weekly numbers meeting, playbooks, owners, a 90-day plan, a quarterly reset, a one-page direction and a wins file.

**Growth dashboard and key metrics (13 Oct).** `/dashboard/growth`: revenue, costs and net profit by Day, Week, Month and Year, change against the previous period in % and $, profit year to date, margin against benchmark bands, a profit trend line and a plain line such as "Profit is up 57% on last week ($396 more)". `/dashboard/metrics`: a 14-card grid with a good number for each, and a clear label on every card: You fill this in (with exactly where to find the number), Helix fills this automatically, or Automatic once you connect Meta (with a Connect button). The daily form is simpler: grouped fields (Shopify, ads, costs, more), examples and where to find each number, blank costs estimated from recent days, and calculated values shown read-only. New optional add-to-cart field (`ScorecardDay.addToCarts`).

**6 Oct (launch day):** production went live; lessons in steps (all 260, Do it for me, Guide me, glossary tooltips); sharper messages and the goals ladder; Black Friday all year; Attract, Convert, Grow tagging; Run your business modules 23 to 28; GST/VAT setting; Suppliers and stock; restyle; Shopify store setup module and the 28-day Just starting track; isolated demo login; visual Dashboard; calendar by country with .ics; Meta integration; the first web app, curriculum, audit engine, email automation and product docs.

## Commits since 6 Oct 2026

| Commit | Date | What |
|---|---|---|
| (this commit) | 13 Oct | STATUS: commit hashes and deploy check |
| 8854b87 | 13 Oct | Profit setup and new goal order, marketing % guide, free and paid gating, gap lessons, anchor redirects, Black Friday catch-up, shorter days, STATUS |
| a1e4f7b | 13 Oct | STATUS rewrite; /course sign-in redirect returns to /course |
| 39d8e78 | 13 Oct | The Helix Course |
| 6ecebdc | 13 Oct | Content audit, 9 merged lessons, 26 renamed titles, Module 29 |
| 14ee485 | 13 Oct | Growth dashboard, key metrics panel, simpler daily form |
| a2d3ad0 | 6 Oct | Lessons in steps (all 260) |
| 06d2ca0 | 6 Oct | Sharper messages and the nine objectives |
| 1a19b8c | 6 Oct | Black Friday all year, who Helix is for, goals ladder |
| 42f9a9c | 6 Oct | Attract, Convert, Grow tagging |
| eabe529 | 6 Oct | Run your business modules 23 to 28 |
| ce022fc | 6 Oct | GST/VAT setting |
| 7fb2c68 | 6 Oct | Suppliers and stock |
| 337b503 | 6 Oct | Restyle |
| 2243d3a | 6 Oct | Shopify store setup module 22, 28-day Just starting track |
| bc0bbff | 6 Oct | Isolated demo login |
| 95cb468 | 6 Oct | Visual Dashboard |
| 28fd4f0 | 6 Oct | Calendar by country, .ics, two tracks |
| 166bc0f | 6 Oct | Plain step-by-step lessons, seasonal alerts |
| 930d8be | 6 Oct | Plain words, profit-first Today, guides |
| 5640890 | 6 Oct | Meta integration |
| d65bcf4 | 6 Oct | Web app, curriculum, audit engine, email automation |
| 9308bfd | 6 Oct | Product docs and 18 SOPs |

## Live features

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
- **Today:** Your goal, Today's tasks and Why this matters from the Helix Course, profit-yesterday box with a one-minute update form, the day's lesson and action for your track (Just starting 28 days, Growing 64 days), up to two insights, seasonal alerts and prep plans, upcoming key dates, stock and admin reminders, goals ladder, streak and compound score, roadmap.
- **Dashboard** (`/dashboard/analytics`): week, month, year-to-date and last-12-months views compared with the previous period; revenue vs costs vs profit, profit trend, cost donut, ROAS and MER with the break-even line, channels, new vs returning; 16+ metric cards with plain-words explanations; ratings against the user's own break-even lines (`src/lib/analytics.ts`, `src/lib/metric-info.ts`, tested). Demo mode seeds two years of labelled example days.
- **Calendar** (`/dashboard/calendar`): every key date for 12 months for AU and US, countdowns, prep-plan status, business admin dates and Black Friday prep steps; `.ics` download and Google/webcal subscribe (`/api/calendar`).
- **Seasonal alerts and nudges:** Black Friday, Christmas cut-offs, Boxing Day and New Year, Valentine's Day, Mother's Day, EOFY, Father's Day (AU and US). Weekly report "Coming up" section. `/api/cron/seasonal-nudges` (Mondays 08:00 Sydney) builds a nudge per user; email sends only with `NUDGES_LIVE=1`; push is a stub.
- **Suppliers & stock** (`/dashboard/stock`): suppliers, landed cost, reorder points, stock-out countdowns, Black Friday last safe order dates, reorder alerts on Today.
- **Run your business** (`/dashboard/business`): modules 23 to 28 with AU and US versions, 13 topics, verified thresholds, dated admin reminders (BAS, tax returns, EOFY, 1099-NEC, estimated tax, security checks). General information, not advice.
- **GST/VAT setting:** "My prices include GST/VAT" strips tax from sales before any profit maths (`src/lib/tax.ts`).
- **Learn:** 29-module Helix Playbook (275 lessons) in plain words, each lesson tagged with a stage, "In plain words" boxes, a 106-term glossary (`/learn/words`), 16 drawings that show where to click, and the goals ladder guide.
- **Meta integration (real):** Facebook Login for Business connect, encrypted long-lived token, asset picker, daily sync plus Sync now, insights into the campaign tracker and audit rules, paused-only drafts after approval, audit log, disconnect. Mock mode without a Meta app. Setup: `docs/meta-setup.md`.
- **Other screens:** What to fix (insights), Waiting for your OK (approvals), Your numbers (scorecard and CSV import), Your ads, campaign builder, Email automation, Ad Trends, Weekly report, Connections, Settings (track, country, GST/VAT), Plan & billing (Stripe Checkout and webhook, waiting for keys).

- **Profit setup** (`/dashboard/profit`), **Your course** (`/course`), **Growth** (`/dashboard/growth`) and **Key metrics** (`/dashboard/metrics`) are in the sidebar.

## Integrations

| Integration | State | What is needed |
|---|---|---|
| Resend email sign-in | Live | Nothing |
| Meta (Facebook and Instagram ads) | Built: connect, encrypted tokens, daily sync, paused drafts, audit log. Runs in mock mode | Sid creates the Meta developer app, completes Business Verification and App Review (`docs/meta-setup.md`), then adds `META_APP_ID` and `META_APP_SECRET` |
| Stripe billing | Built: Checkout and signed webhook | Secret key, webhook secret and price IDs for Starter and Growth |
| Google sign-in | Built, optional | `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` |
| Shopify | Stock sync stubbed; sales, sessions and add-to-cart are typed in | Shopify app and API access to sync automatically |
| Google Ads, TikTok, Klaviyo | Example data only | API access later |

## Next steps and blockers (in priority order)

1. **Stripe keys and price IDs (blocker for revenue).** Paid plans cannot be bought until they are set.
2. **Meta developer app and verification (blocker for live ad data).** Unlocks automatic spend, ROAS and CTR on the metrics panel and live paused drafts.
3. **Logo redesign: pending Sid's pick.** Recommendation: a compounding-curve double helix, with a minimal tile favicon.
4. **Shopify sync.** Fills sessions, sales and add-to-cart automatically, so more course finish lines check themselves.
5. **Course polish.** Course-specific Do it for me actions for the new Module 29 lessons; a weekly email that recaps the current goal; let owners pick a goal out of order; a finish-line history.
6. **Plan changes for downgrades:** a user who drops to Free keeps their Meta connection and existing prep plans; decide whether to pause syncing.
7. **Decide when to switch off the demo login** on production.
8. **Google sign-in** if wanted.
9. **Google Ads, TikTok and Klaviyo connections** to replace example data.
10. Answer the open questions below.

## Waiting on Sid

1. Stripe secret key, webhook secret and price IDs.
2. Meta app, Business Verification and App Review.
3. Logo pick (recommended: compounding-curve double helix, minimal tile favicon).
4. Google OAuth keys (optional).
5. When to turn off the demo login.

## Decisions made

- Name: **Ecommerce Helix** (ecommercehelix.com). Tagline: "Grow your e-commerce business a little every day".
- Positioning: a growth copilot that behaves like a head of growth by your side. Every day: one lesson, one topic, one action, plus up to two insights. Ask before acting.
- Execution model (Sid, 6 Oct 2026): **Draft & you launch** by default. Helix pushes campaigns into the user's own Meta/Google account as paused drafts; the user presses Launch. Budget edits on live campaigns are always made by the user. **Guide me** mode for users without connected accounts. See docs/execution-model.md.
- Proactive audits (site, ads, email, social) with cross-diagnosis rules feed Today and Insights. See docs/audit-engine.md.
- Email automation: Helix suggests missing flows, drafts them and sets them up after approval. See docs/email-automation.md.
- Pricing (updated 13 Oct): Free $0 (profit dashboard, daily numbers, key metrics, basic growth chart, the numbers goals of the course, every lesson, top 3 audit fixes, hard AI cost cap), Starter $29 (Attract and Convert goals, Do it for me, Meta sync and paused drafts, seasonal prep plans, all fixes and AI help, full dashboard history, about $3 AI included at cost), Growth $59 (Grow and Run goals, team and playbooks, Meta and Google, email flows set up after approval, weekly report, about $8 AI included at cost). Extra AI via prepaid wallet at 2x provider cost, stops at $0. Ad spend stays on the customer's own accounts.
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

