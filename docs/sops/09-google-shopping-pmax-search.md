# SOP 09: Google Shopping, Performance Max and Search

> **In plain words.** Google ads reach people who are already searching for what you sell. Keep a clean product feed (the list of products Google reads), start with a simple setup, and only spend where it stays profitable.

**Purpose.** Capture people already searching for what the store sells, at a return the economics can afford, with a clean product feed and a simple structure.

**Copilot triggers**
- Google Ads or Merchant Center connected.
- The store is profitable on its main channel and wants a second channel (usually Stage 1 to 2).
- Weekly search-term review (Monday).
- Merchant Center errors or disapprovals detected.
- The user asks "is Google right for me?" or "why did my PMax drop?".

## Is Google right yet?

Good signs: people search for the category or problem, and the product has clear names. The feed is clean, and Meta or organic is already profitable. You can give one campaign about $50 a day, so it gets enough data (see Testing rule). Weak signs: brand-new category nobody searches for; very low price point with low margin.

## Structure (default)

1. **Brand search:** a small campaign (often $20 to $30 a day) on your brand terms. Use target impression share or manual bidding. Expect a very low cost per sale and do not let it inflate your view of Google overall.
2. **Shopping or feed-only Performance Max:** non-brand prospecting with your brand left out. Use **Brand exclusions** in Performance Max, or brand negative keywords in Shopping. Group products by best sellers or by margin tier (custom labels), not by every collection.
3. **Non-brand Search (optional):** high-intent terms you want control over. Helix defaults: up to 5 keywords per ad group (1 to 2 broad, the rest exact) and shared negative lists. Write up to 15 headlines (the most Google allows) and pin only 1 to 2. Do not over-segment.
4. **Demand Gen or YouTube (Stage 2+):** short-form video discovery. Judge it with view-through and platform-comparable metrics, not last-click.

## Conversion setup

- One primary conversion: purchase. Everything else secondary.
- Enhanced conversions on.
- Check monthly that only one purchase action is set to Primary. A second one often appears after installing an app or importing from Google Analytics. Two primary purchase actions double-count sales and mislead bidding.
- Turn on the customer acquisition goal if the account supports it. Choose deliberately between bidding higher for new customers and bidding only for new customers.

## Bidding

- Breakeven ROAS = 1 ÷ (1 - VCR). VCR is variable costs ÷ revenue (SOP 02), so 1 - VCR is the margin left. For example, VCR of 40% means 1 ÷ 0.6 = 1.67.
- Target ROAS = breakeven adjusted for the profit you want to keep. New-customer campaigns can run nearer breakeven.
- Levers are budget and target. Change one at a time, by modest steps.
- For a short sale, set a seasonality adjustment covering the sale dates so bidding catches up. Find it under **Tools > Budgets and bidding > Adjustments**. Use the conversion rate lift you saw in past sales. Google's example is up to +50% for a 3-day sale. Keep it to 1 to 7 days and let it end on its own (see [Google: seasonality adjustments](https://support.google.com/google-ads/answer/10369906)).

## Feed optimisation

1. Fix every Merchant Center issue first. They are listed under **Needs attention** (this used to be called Diagnostics).
2. Titles: put the words people actually search for at the front (use converting search terms). Include brand, product type, key attribute (material, size, colour).
3. Images: clean main image; test lifestyle images where allowed.
4. Price and shipping must match the site exactly.
5. Use custom labels for margin tier, best seller, seasonal.

## Weekly routine (10 minutes)

- [ ] Search terms: add negatives, move converting terms into feed titles or exact keywords. Performance Max now has its own search terms report and accepts negative keywords (see [Google: Performance Max reporting](https://support.google.com/google-ads/answer/16451273)).
- [ ] Spend split: brand vs non-brand.
- [ ] Merchant Center **Needs attention** issues.
- [ ] Return by campaign vs target.

## Testing rule

Give a new campaign about 2 weeks of learning plus 4 weeks of evaluation. Spend no less than about $50 a day. Google itself says to run a new Performance Max campaign for at least 6 weeks. Avoid frequent budget, bid strategy or status changes in that time (see [Google: Performance Max optimisation tips](https://support.google.com/google-ads/answer/11385582)).

## 2026 changes to watch

AI Max for Search and AI Max for Shopping (beta) can rewrite ad text and product titles (text customisation). They can also pick the landing page (final URL expansion). Ads can show in AI Overviews and AI Mode too. All of this changes what you control. Keep brand exclusions, review AI-written copy and chosen landing pages, and check search terms more often after any auto-upgrade. See [Google: AI Max for Search](https://support.google.com/google-ads/answer/15910187) and [Google: AI Max for Shopping](https://support.google.com/google-ads/answer/17091277). The Trends feed section of the product design doc has more.

## Who does what

| Helix can do (with approval) | The user does |
| --- | --- |
| Read account, Merchant Center **Needs attention** issues, search terms (read-only) | Approve structure and targets |
| Draft negatives lists and feed title rewrites (with approval); build new campaigns as paused drafts | Approve; launch new campaigns yourself |
| Prepare budget and target ROAS changes with exact values | Make the change in Google Ads; own billing and verification |
| Weekly Google summary in the report | Decide on new channels |

**Related:** SOP 02, 05.
