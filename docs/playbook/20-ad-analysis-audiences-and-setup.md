# Module 20: Ad performance analysis, audiences and campaign setup

**Outcome:** you can set up target audiences and campaigns correctly on Meta, Google and TikTok, read performance like an analyst, find the real cause of a problem (ad, page, offer or checkout), and report it in a way that leads to a clear decision.

**Related:** [Module 6 Defining campaigns](06-defining-campaigns.md), [Module 7 Meta ads](07-meta-ads.md), [Module 8 Google ads](08-google-ads.md), [Module 2 Diagnose and fix](02-diagnose-and-fix.md), [SOP 05](../sops/05-meta-structure-and-scaling.md), [SOP 06](../sops/06-meta-daily-optimisation.md), [SOP 09](../sops/09-google-shopping-pmax-search.md)

---

## Lesson 20.1: Before you launch: tracking you can trust

Bad data leads to bad decisions. Check these once, then monthly:

- [ ] Pixel or tag plus server-side events (conversions API, enhanced conversions) connected through your store platform.
- [ ] Purchase is the only primary conversion for sales campaigns. Add to cart and others are secondary.
- [ ] Purchase value and currency pass correctly. Test with a real order and refund it.
- [ ] Event deduplication is on (browser and server events are not double counted).
- [ ] Domain verified; consent banner set up for your markets.
- [ ] Your store's own analytics (orders, sessions) is the source of truth for revenue. Platforms are for direction.
- [ ] UTM parameters on every ad so your analytics can split traffic by channel and campaign.

## Lesson 20.2: Setting up target audiences

**Meta**

1. Define account-level audience segments: engaged audience (site visitors, social engagers) and existing customers (upload your customer list, connect your store). This lets reports show how much spend reaches brand-new people.
2. Build custom audiences: site visitors 30 and 180 days, product viewers 30 days, add to cart 14 days, checkout started 7 days, purchasers 180 days and all time, Instagram and Facebook engagers 365 days, video viewers 50% 90 days, email subscribers.
3. Build lookalikes from purchasers or high-value customers (1%, 3 to 5%, 10%) for later tests.
4. Default cold targeting: broad (country, age 18 to 65+, all genders unless the product is clearly gendered). Use audience suggestions only as hints.
5. Exclusions for cold: none, light (recent purchasers), or harsh (all purchasers and engagers). Choose based on whether you want efficiency or strictly new customers.
6. In automated sales campaigns, cap spend on existing customers (often 10 to 20%).

**Google**

1. Customer match list (upload customers) to use as a signal and for exclusions.
2. Remarketing lists: all visitors 30 and 540 days, cart abandoners, purchasers.
3. For PMax, add audience signals (customer list, your own search terms, visitors). Signals guide, they do not restrict.
4. For search, the keyword is the audience. Build negative keyword lists for jobs, free, DIY, competitor brands you will not bid on.

**TikTok**

1. Broad targeting with country and age is the default.
2. Custom audiences: site visitors, video viewers, profile engagers, customer list.
3. Spark ads use creator or your own organic posts so the engagement stays on the post.

**Audience by layer** (see Module 6):

| Layer | Who | Example targeting |
| --- | --- | --- |
| Cold | Never interacted | Broad, harsh or light exclusions |
| Mixed | Anyone, platform decides | Automated sales campaign, existing-customer cap |
| Warm | Engaged, not bought | Visitors 180d, engagers, video viewers, excluding purchasers |
| Hot | Close to buying | Add to cart 14d, checkout 7d, excluding purchasers 7d |
| Existing customers | Bought before | Purchasers, for launches and repeat products |

## Lesson 20.3: Setting up a Meta sales campaign step by step

1. Write the campaign brief first (Module 6, Lesson 6.16): target CPA, audience layer, budget, kill rule.
2. Create campaign: objective **Sales**. Choose automated (platform-optimised) or manual setup.
3. Name it using your convention, for example `03-Manual-Cold-Broad-Light-TEST-B16`.
4. Budget: campaign budget for automated, ad set budget for tight tests. Start at about 2 to 3x target CPA per day.
5. Conversion: website, event Purchase, attribution 7-day click, 1-day view (or what you use consistently).
6. Audience: per Lesson 20.2. Advantage placements on unless you have a reason.
7. Ads: upload 3 to 6 ads per ad set, all testing one variable. Add primary text, headline, link with UTMs.
8. Check creative enhancements. Turn off anything that changes your message.
9. Preview on mobile in every placement. Check safe zones.
10. Publish, then do not touch for 3 days unless something is broken.

## Lesson 20.4: Setting up Google step by step

**Brand search**

1. Search campaign, Sales goal, bidding Maximise conversions or target impression share.
2. Keywords: brand name and common misspellings, exact and phrase.
3. Ads: responsive search ads with sitelinks, callouts and price or promotion assets.
4. Budget: enough never to be limited.

**Shopping or PMax (feed-only)**

1. Fix the feed first: titles with the words people search, good images, correct price, availability, GTIN or brand, product type.
2. Create PMax with Sales goal, linked Merchant Center, and only the feed (no extra creative assets) if you want it to behave like Shopping.
3. Exclude your brand so brand demand stays in the cheap brand campaign.
4. Split hero products into their own campaign when they deserve more budget.
5. Start with Maximise conversion value, then add a target ROAS once you have about 30+ conversions in 30 days. Set it near your target, not wishful.

**Non-brand search**

1. One campaign per product theme, tight keyword groups.
2. Review the search terms report weekly. Add negatives. Promote converting terms to keywords and to feed titles.

## Lesson 20.5: Setting up a TikTok campaign step by step

1. Objective: Sales (website conversions or Shop).
2. Pixel event: Complete payment.
3. Targeting: broad. Budget: enough for several conversions a day per ad group.
4. Ads: native-looking vertical videos, Spark ads where possible, 3 to 5 per ad group.
5. Give it a week. TikTok's learning is noisier than Meta's.
6. Judge on blended MER as well as platform return, because TikTok often drives sales that show up elsewhere.

## Lesson 20.6: The metric tree

Revenue from ads breaks into a chain. Find the weak link:

```
Spend
 └─ CPM (cost to reach people)
     └─ CTR (do they click?)          ← creative and message
         └─ Cost per click
             └─ Landing page view rate  ← speed, tracking
                 └─ Add to cart rate     ← product page, offer, price
                     └─ Checkout rate    ← shipping cost, trust, payment options
                         └─ Purchase rate
                             └─ AOV      ← bundles, thresholds, upsells
```

Change one link and everything below moves. A 20% better CTR with the same page means 20% more buyers for the same spend.

## Lesson 20.7: Cross-diagnosis: is it the ad, the page, the offer or the checkout?

This is the most useful table in the playbook. Helix runs the same rules automatically in Insights.

| What you see | Likely cause | What to check and fix |
| --- | --- | --- |
| Good hook rate and CTR, low conversion rate | Landing page or offer | Page speed on mobile, message match between ad and page, offer clarity above the fold, trust (reviews, guarantee), mobile checkout |
| High add-to-cart rate, low checkout completion | Checkout friction | Shipping cost surprise, slow or long checkout, missing payment options (wallets, buy now pay later), forced account creation, delivery time unclear |
| Strong site conversion from other traffic, weak CTR on ads | Creative | New hooks, new angles, new formats; check the offer is in the ad |
| Low hook rate, OK CTR from those who watch | Opening seconds | Re-cut the first 3 seconds; test visual and verbal hooks |
| Good hook rate, low hold rate | Body of the video | Tighten the middle, show the product sooner, add proof |
| Rising frequency and CPM, falling CTR | Creative fatigue or audience saturation | Load a new creative batch; broaden; check reach is growing with spend |
| CPM jumps across all campaigns | Season or auction pressure | Expect it in peak periods; protect margin, lean on email and SMS |
| Platform ROAS fine, MER getting worse | Over-attribution or retargeting taking credit | Shift budget to cold, check new customer share, run a holdout test |
| Clicks fine, landing page views low | Slow page or broken tracking | Test page speed, check pixel fires on load |
| Good conversion, low AOV | Order value levers missing | Free shipping threshold, bundles, gift with purchase, post-purchase upsell |
| Lots of views, few clicks | Weak CTA or wrong audience | Clear call to action, offer in the ad, hook that attracts buyers not browsers |
| High refunds after a campaign | Ad overpromises | Align claims with reality, improve size or fit guidance |

## Lesson 20.8: Breakdowns that reveal problems

Use breakdowns weekly, not daily:

- **Placement:** is one placement burning spend at a high CPA?
- **Age and gender:** are you paying for people who never buy? Adjust creative before restricting targeting.
- **Device:** a mobile conversion rate far below desktop usually means a mobile UX problem.
- **Time:** day of week patterns help plan launches and emails.
- **Country or region:** separate countries when spend allows.
- **New vs existing customers:** how much of spend reaches new people?

## Lesson 20.9: Attribution and incrementality

Platforms each claim credit for the same sale. Rules of thumb:

1. **MER first.** Total ad spend ÷ total revenue from your store is the honest number.
2. **Platform metrics for direction**, especially when comparing ads inside one platform.
3. **New-customer CAC** (ad spend ÷ new customers) tells you if growth is real.
4. **Holdout tests:** pause a channel or campaign in one region, or for a week, and see what happens to total sales. If sales do not drop, it was not incremental.
5. **Post-purchase survey:** ask "Where did you first hear about us?" Combine with data.

## Lesson 20.10: Your analysis rhythm

| When | Time | What |
| --- | --- | --- |
| Daily | 10 min | Scorecard (MER, contribution), kill drains, scale winners, check spend pacing |
| Weekly | 45 min | Creative report (hook, hold, CTR, CPA by concept), breakdowns, search terms, new batch brief |
| Monthly | 2 hours | MER and contribution vs target, new customer share, channel mix, test results, next month's plan |
| Quarterly | Half day | Holdout or incrementality test, structure review, budget plan for the next peak |

## Lesson 20.11: Reporting that leads to decisions

Every report answers four questions:

1. **What happened?** Three numbers: revenue, contribution profit, MER vs target.
2. **Why?** The one or two biggest causes, with evidence.
3. **What did we do?** Actions taken this period.
4. **What next?** The next three actions, with owners and dates.

Avoid dashboards with 40 metrics. If a metric does not change a decision, drop it.

## Lesson 20.12: Common analysis mistakes

- Judging an ad after one day or $10 of spend.
- Comparing ROAS across stores or seasons instead of against your own break-even.
- Turning off an ad set that platform says is "bad" while MER is improving.
- Reading CTR without checking what happens after the click.
- Editing campaigns daily so they never leave learning.
- Trusting the sum of platform-attributed revenue (it is usually more than your real revenue).

## Self-check

1. Hook rate 35%, CTR 1.6%, conversion rate 0.6%. Where is the problem?
2. Add to cart rate is double your benchmark but few checkouts. First three things to check?
3. Platform ROAS is stable but MER is rising. What might be going on?
4. Why start Google PMax as feed-only with brand excluded?
5. Name four custom audiences to build on day one.

<details><summary>Answers</summary>

1. The ad works; the page or offer does not. Check speed, message match, offer clarity, trust and mobile checkout.
2. Shipping cost surprise, checkout steps and payment options, forced account creation.
3. Retargeting or over-attribution is taking credit while fewer new customers arrive. Shift to cold, check new customer share, test a holdout.
4. It behaves like Shopping (clearer data) and stops PMax claiming cheap brand searches as its own wins.
5. Any four of: visitors 30 and 180 days, product viewers, add to cart, checkout started, purchasers, engagers, video viewers, email list.

</details>
