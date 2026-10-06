# SOP 01: Store audit

**Purpose.** Turn a pasted store URL into a score, a ranked fix list and a first-week plan within a few minutes. The audit is the first impression of Helix, so it must be specific to the store, never generic.

**Copilot triggers**
- A new user pastes a URL during onboarding.
- A user asks "what is wrong with my store?" or "where do I start?".
- Monthly re-audit (paid plans) or after a theme change is detected.
- RPV falls more than 20% below the 30-day average for 7 days.

**Inputs**
- Public pages: homepage, one collection page, the top 2 to 3 product pages, cart, policies (shipping, returns), about page.
- Optional connections: Shopify (orders, sessions, products), Meta, Google, email platform.
- Category guess (fashion, beauty, home, food, pets, high-ticket, other) for benchmarks.

## Steps

1. **Fetch and parse.** Fetch the pages with a lightweight crawler. Do not run a full browser unless the page is client-rendered. Record page weight, image sizes, number of apps/scripts detected, and mobile viewport behaviour.
2. **Clarity check (is it confusing?).**
   - Can a stranger tell what is sold and for whom within 5 seconds of the homepage hero?
   - Is there a single clear call to action above the fold?
   - Is navigation simple, with best sellers easy to find?
3. **Compelling check (is it convincing?).**
   - Does the product page have a one-line "why this is different" under the title?
   - Are there reviews with photos near the top?
   - Are the main objections answered (fit/size, quality, shipping time, returns, how to use)?
   - Is there an offer block (bundle, gift, free shipping threshold) near the add-to-cart button?
4. **Friction check (what slows people down?).**
   - Speed: estimated load time on mobile. Flag only issues worth 1 to 2+ seconds.
   - Policies visible and plain-language. Returns window stated.
   - Payment options shown (express wallets, buy now pay later where relevant).
   - Pop-ups: is there an email capture? Does it block the page on mobile in a bad way?
5. **Sell check (is it pushing for more?).**
   - Cart tiers or free-shipping progress bar present?
   - Cross-sell or bundle on product page or cart?
   - Post-purchase upsell (only visible with Shopify connection)?
6. **Retention check.** Pop-up present, email platform detected, review app detected, SMS opt-in, loyalty (only relevant above 15 to 20% repeat).
7. **Tracking check.** Meta pixel, Google tag, conversions API signals detected. Flag duplicates.
8. **Ads presence.** Look up the brand in public ad libraries where available. Count active ads and formats (video, static, carousel, creator).
9. **Score.** Score each area 0 to 100 and combine into the **Helix Score** (weights: Clarity 20, Compelling 25, Friction 15, Sell 15, Retention 15, Tracking 10).
10. **Fix list.** Rank every issue by (expected impact x confidence) ÷ effort. Top 10 become the Site Fix List.
11. **First-week plan.** Pick 7 days of daily-loop tasks from the fix list, the stage roadmap and connection setup.

## Decision rules

- If tracking is broken or missing, the first task is always to fix tracking. Every other number depends on it.
- If there is no email capture, the pop-up plus welcome flow is a top-3 task regardless of stage.
- If the product page has no reviews, collecting reviews is a top-3 task.
- Never recommend a full redesign in the first 30 days. Recommend targeted fixes on the highest-traffic pages.
- Every finding must cite the page and element it refers to. No generic advice without evidence.
- If a page cannot be fetched (password, bot protection), say so plainly and ask the user to connect Shopify instead.

## Who does what

| Helix can do (with approval where it writes) | The user does |
| --- | --- |
| Crawl, score and rank fixes (no approval needed: read-only) | Confirm category, margin and target market |
| Draft copy for headlines, reasons-why, FAQ answers | Decide which fixes to accept |
| Draft Shopify theme or content edits for preview (Growth, beta) | Approve or reject each edit |
| Re-audit monthly and show the score change | Provide brand assets and photos |

**Done when:** the user sees the score, the top 10 fixes with evidence, and a 7-day plan, and has picked "do it for me" or "I'll do it" on at least one task.

**Related:** SOP 02 (scorecard), SOP 11 (CRO), SOP 13 (email flows).
