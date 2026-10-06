# Module 20: Ad performance analysis, audiences and campaign setup

**Outcome:** you can set up audiences and campaigns correctly on Meta, Google and TikTok, read your results like an analyst, find the real cause of a problem (the ad, the page, the offer or the checkout), and report it in a way that leads to a clear decision.

**Related:** [Module 6 Defining campaigns](06-defining-campaigns.md), [Module 7 Meta ads](07-meta-ads.md), [Module 8 Google ads](08-google-ads.md), [Module 2 Diagnose and fix](02-diagnose-and-fix.md), [SOP 05](../sops/05-meta-structure-and-scaling.md), [SOP 06](../sops/06-meta-daily-optimisation.md), [SOP 09](../sops/09-google-shopping-pmax-search.md)


<!-- plain:start -->
> **In plain words**
>
> **Stage:** Attract (get seen by people who want what you sell). Every lesson below is tagged with its stage; see [Attract, Convert, Grow](stages.md).
>
> **What it is:** How to set up ads correctly and read your results like a pro.
>
> **Why it matters:** Good setup means you can trust the numbers. Good reading means you fix the real problem.
>
> **Do this:**
>
> 1. Check that your pixel and sales tracking work before you spend.
> 2. Set up your campaign step by step (drawings below).
> 3. When results drop, check in order: the ad, the page, the offer, the checkout.
>
> **Words to know:**
>
> - **Pixel:** A small piece of code on your store that tells Meta when someone views, adds to cart or buys.
> - **UTM:** Tags added to the end of a link so your analytics can tell which ad or email a visitor came from.
> - **Attribution:** Deciding which ad or channel gets credit for a sale.
> - **Funnel:** The steps from seeing an ad to buying: visit, add to cart, checkout, order.
>
> All words are explained in the [glossary](../glossary.md).
<!-- plain:end -->

---

## Lesson 20.1: Before you launch: tracking you can trust
<!-- stage:attract -->

**Why this matters:** Bad data leads to bad decisions, and a broken pixel can make good ads look like failures. Check tracking once now, then every month. Your store's own reports are the truth; ad platforms are only for direction.

**Step 1.** In Meta Events Manager and Google Ads **Goals > Conversions**, confirm the pixel (or Google tag) and server events (Conversions API on Meta, enhanced conversions on Google) are connected through your store platform.

**Expected result:** Both show purchases from browser and server.

<!-- do:meta-connect -->

**Step 2.** Make Purchase the only primary (main) conversion for sales campaigns, with add to cart and others as secondary.

**Expected result:** Only Purchase is primary on each platform.

**Step 3.** Place a real test order, check the value and currency arrive correctly in each platform, then refund it.

**Expected result:** The test purchase shows the right amount and currency.

**Step 4.** Check deduplication is on (the same sale is not counted twice from browser and server) in Events Manager's event details.

**Expected result:** Events Manager shows deduplicated purchase events.

**Step 5.** Verify your domain (Meta **Business Settings > Brand safety > Domains**) and set up a consent (cookie) banner for the countries you sell to.

**Expected result:** The domain shows Verified and the banner appears for visitors who need it.

**Step 6.** Add UTM tags (labels on the end of a link, like `?utm_source=facebook`) to every ad link, using the URL parameters field in each ad.

**Expected result:** Google Analytics shows visits by channel and campaign.

## Lesson 20.2: Setting up target audiences
<!-- stage:attract -->

**Why this matters:** Audiences tell each platform who already knows you, so cold campaigns find new people and warm campaigns reach the right ones. Set them up once on Meta, Google and TikTok, then reuse them in every campaign.

**Step 1.** On Meta, set account-wide audience segments in **Ad account settings > Audience segments**: engaged audience (visitors and social engagers) and existing customers (customer list or store connection).

**Expected result:** Reports show how much spend reaches brand-new people.

**Step 2.** On Meta, build custom audiences: visitors 30 and 180 days, product viewers 30 days, add to cart 14 days, checkout started 7 days, buyers 180 days and all time, Instagram and Facebook engagers 365 days, 50% video viewers 90 days, and email subscribers.

**Expected result:** Every custom audience shows "Ready".

**Step 3.** On Meta, build lookalikes of buyers or best customers at 1%, 3 to 5% and 10% for later tests.

**Expected result:** Three lookalike sizes are ready.

**Step 4.** Set cold targeting to broad (your country, age 18 to 65+, all genders unless the product is clearly for one), choose cold exclusions (none, light: recent buyers, or harsh: all buyers and engagers), and cap existing-customer spend in automated Sales campaigns at 10 to 20%.

**Expected result:** Cold campaigns reach new people on purpose.

**Step 5.** On Google, upload a customer match list, build remarketing lists (visitors 30 and 540 days, cart abandoners, buyers), add audience signals to Performance Max, and build negative keyword lists ("jobs", "free", "DIY", competitor brands you will not bid on).

**Expected result:** Google has signals to guide it and words to avoid.

**Step 6.** On TikTok, use broad targeting by country and age, build custom audiences (visitors, video viewers, profile engagers, customer list), and use Spark ads to keep likes and comments on posts.

**Expected result:** TikTok has the same audience layers as Meta.

**Step 7.** Map each audience to its layer using the table below.

**Expected result:** Every audience is labelled cold, mixed, warm, hot or existing customers.

### Good to know

| Layer | Who | Example targeting |
| --- | --- | --- |
| Cold | Never interacted with you | Broad, with harsh or light exclusions |
| Mixed | Anyone; the platform decides | Automated Sales campaign with a cap on existing customers |
| Warm | Engaged but not bought | Visitors (180 days), engagers, video viewers, leaving out buyers |
| Hot | Close to buying | Added to cart (14 days), started checkout (7 days), leaving out buyers from the last 7 days |
| Existing customers | Bought before | Buyers, for launches and products people reorder |

## Lesson 20.3: Setting up a Meta sales campaign step by step
<!-- stage:attract -->

**Why this matters:** A Meta sales campaign set up correctly in ten steps gives every ad a fair test. Helix can build steps 2 to 7 for you as a paused draft in your own account, which you check and switch on.

**Step 1.** Write the campaign brief first (Lesson 6.16): target CPA, audience layer, budget and stop rule.

**Expected result:** The brief is finished before you open Ads Manager.

**Step 2.** In Ads Manager click **Create**, choose **Sales**, then automated (Advantage+) or manual setup.

**Expected result:** A new Sales campaign is open.

<!-- do:meta-draft -->

**Step 3.** Name it with your pattern, for example `03-Manual-Cold-Broad-Light-TEST-B16`.

**Expected result:** The name follows Lesson 6.7.

**Step 4.** Set the budget at about 2 to 3 times your target CPA per day: campaign budget for automated, ad set budget for tight tests.

**Expected result:** The budget is set and written on the brief.

**Step 5.** Set the conversion: Website, event **Purchase**, attribution **7-day click, 1-day view** (or your usual setting, so results compare).

**Expected result:** The ad set optimises for purchases.

**Step 6.** Set the audience as in Lesson 20.2 and leave Advantage+ placements on unless you have a good reason.

**Expected result:** Audience and placements match the brief.

**Step 7.** Add 3 to 6 ads per ad set, all testing one thing, with main text, headline and a link with UTM tags.

**Expected result:** Each ad has text, headline and a tagged link.

**Step 8.** Turn off any creative enhancements that change your message, and preview on mobile in every placement.

**Expected result:** Text sits inside safe zones and the ad looks as designed.

**Step 9.** Publish, then do not touch it for 3 days unless something is broken.

**Expected result:** The campaign is live and learning undisturbed.

### Good to know

<!-- guide:meta-1-create-sales-campaign -->
![Start a Sales campaign in Meta Ads Manager](../../public/guides/meta-1-create-sales-campaign.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.* Official help: [Meta: create a campaign in Ads Manager](https://www.facebook.com/business/help/1658289035439772)
<!-- /guide:meta-1-create-sales-campaign -->

<!-- guide:meta-2-budget-pixel-audience -->
![Set budget, sales tracking and audience](../../public/guides/meta-2-budget-pixel-audience.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.*
<!-- /guide:meta-2-budget-pixel-audience -->

<!-- guide:meta-3-write-the-ad -->
![Write the ad and add tracking](../../public/guides/meta-3-write-the-ad.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.*
<!-- /guide:meta-3-write-the-ad -->

<!-- guide:meta-4-review-helix-draft -->
![Review a Helix draft and launch it](../../public/guides/meta-4-review-helix-draft.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.*
<!-- /guide:meta-4-review-helix-draft -->

## Lesson 20.4: Setting up Google step by step
<!-- stage:attract -->

**Why this matters:** Google works best with three building blocks: brand search to protect your name, a feed-only Performance Max or Shopping campaign for products, and non-brand search once you know your best terms. Build them in that order.

**Step 1.** Create a brand search campaign: Search, Sales goal, bidding **Maximise conversions** or **Target impression share**, keywords of your brand and misspellings in exact and phrase match, responsive search ads with sitelinks, callouts and price or promotion assets.

**Expected result:** Searches for your name show your ad, and the campaign is never "Limited by budget".

**Step 2.** Fix your product feed: search-first titles, good images, correct prices and availability, GTIN or brand, and product type.

**Expected result:** Merchant Center shows no errors.

**Step 3.** Create Performance Max with the Sales goal and your Merchant Center, giving it only the feed, and add your brand name as a brand exclusion.

**Expected result:** PMax behaves like Shopping and leaves brand searches to the brand campaign.

**Step 4.** Start bidding on **Maximise conversion value**, then add a target ROAS near your real target once you have about 30 conversions in 30 days, and split best sellers into their own campaign when they deserve more budget.

**Expected result:** Bidding is tuned to real data.

**Step 5.** Add non-brand search with one campaign per product theme and tight keyword groups, and check search terms weekly.

**Expected result:** New searchers find you and wasted searches are blocked.

### Good to know

<!-- guide:google-1-performance-max -->
![Start a Performance Max campaign in Google Ads](../../public/guides/google-1-performance-max.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.* Official help: [Google: about Performance Max campaigns](https://support.google.com/google-ads/answer/10724817)
<!-- /guide:google-1-performance-max -->

<!-- guide:google-2-block-wasted-searches -->
![Block searches that waste money](../../public/guides/google-2-block-wasted-searches.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.* Official help: [Google: add negative keywords](https://support.google.com/google-ads/answer/2453972)
<!-- /guide:google-2-block-wasted-searches -->

## Lesson 20.5: Setting up a TikTok campaign step by step
<!-- stage:attract -->

**Why this matters:** TikTok campaigns follow the same logic as Meta with a few differences: a different purchase event name, jumpier learning and sales that often show up under other channels.

**Step 1.** Create a campaign with the **Sales** objective (website conversions or TikTok Shop) and the pixel event **Complete payment**.

**Expected result:** The campaign optimises for purchases.

**Step 2.** Use broad targeting with a budget big enough for several sales a day per ad group.

**Expected result:** Each ad group can learn.

**Step 3.** Add 3 to 5 natural-looking tall videos per ad group, using Spark ads where you can.

**Expected result:** Ads look like TikTok posts and keep their social proof.

**Step 4.** Give it a week, then judge on total MER on the Dashboard as well as TikTok's reported return.

**Expected result:** You judge TikTok on its whole-store effect.

<!-- do:growth -->

## Lesson 20.6: The metric tree
<!-- stage:attract -->

**Why this matters:** Sales from ads come from a chain of steps, from showing the ad to the size of the order. Improve one link and everything below it moves, so finding the weak link is the fastest win.

**Step 1.** Read the metric tree below from top to bottom and write your current number next to each step.

**Expected result:** You have a number for CPM, CTR, cost per click, landing page view rate, add to cart rate, checkout rate, purchase rate and AOV.

<!-- do:metrics -->

**Step 2.** Circle the step furthest below its usual level and work on that one only.

**Expected result:** You have one link to fix. For example, a 20% better CTR with the same page means 20% more buyers for the same spend.

### Good to know

```
Spend
 └─ CPM (cost to show the ad 1,000 times)
     └─ CTR (out of 100 who see it, how many click)   ← the ad and its message
         └─ Cost per click
             └─ Landing page view rate                  ← page speed, tracking
                 └─ Add to cart rate                     ← product page, offer, price
                     └─ Checkout rate                    ← shipping cost, trust, payment options
                         └─ Purchase rate
                             └─ AOV (average order)      ← bundles, free shipping amount, upsells
```

## Lesson 20.7: Cross-diagnosis: is it the ad, the page, the offer or the checkout?
<!-- stage:attract -->

**Why this matters:** When results drop, the cause can be the ad, the page, the offer or the checkout. This table maps each pattern of numbers to its likely cause and fix. Helix runs the same rules for you in **What to fix**.

**Step 1.** Open **What to fix** in Helix to see which patterns it has found in your numbers.

**Expected result:** You see any matching insights with evidence.

<!-- do:insights -->

**Step 2.** Otherwise, find the row in the table below that matches your numbers.

**Expected result:** You have a likely cause and a fix.

**Step 3.** Make the fix and check the same numbers again after 7 days.

**Expected result:** You know whether the diagnosis was right.

### Good to know

| What you see | Likely cause | What to check and fix |
| --- | --- | --- |
| Good hook rate and CTR, but few visitors buy | The landing page or offer | Mobile page speed. Does the page match the ad? Is the offer clear at the top? Trust (reviews, guarantee). Mobile checkout. |
| Lots of add to carts, but few finish checkout | Something in checkout puts people off | Surprise shipping cost, a slow or long checkout, missing payment options (Apple Pay, buy now pay later), forced account sign-up, unclear delivery time. |
| Visitors from other channels buy well, but ads get few clicks | The ad itself | New hooks, new angles, new formats. Check the offer is in the ad. |
| Low hook rate, but OK CTR from people who watch | The first seconds | Re-cut the first 3 seconds. Test new visual and spoken hooks. |
| Good hook rate, low hold rate | The middle of the video | Tighten the middle, show the product sooner, add proof. |
| Frequency and CPM rising, CTR falling | People are tired of the ads, or the audience is used up | Launch a new batch of ads. Go broader. Check reach grows with spend. |
| CPM jumps across all campaigns | The season, or more advertisers competing | Expect it in busy periods. Protect your margin and lean on email and SMS. |
| Platform ROAS looks fine, but MER is getting worse | Platforms taking credit for sales they did not cause, often retargeting | Move budget to cold, check the share of new customers, run a holdout test (Lesson 20.9). |
| Plenty of clicks, few landing page views | A slow page or broken tracking | Test page speed. Check the pixel fires when the page loads. |
| Good conversion, small orders | Missing ways to raise order value | Free shipping amount, bundles, a free gift, an offer after purchase. |
| Lots of views, few clicks | Weak call to action, or the wrong people | A clear call to action, the offer in the ad, a hook that attracts buyers not browsers. |
| Lots of refunds after a campaign | The ad promised too much | Make claims match reality. Improve size or fit guidance. |

## Lesson 20.8: Breakdowns that reveal problems
<!-- stage:attract -->

**Why this matters:** Breakdowns split your results by group in Ads Manager and reveal problems hidden in averages. Look at them weekly, not daily.

**Step 1.** In Ads Manager click **Breakdown > By delivery > Placement** and check whether one placement (for example Audience Network) spends a lot at a high cost per sale.

**Expected result:** You know your best and worst placements.

**Step 2.** Break down by age and gender, and change the ads before you narrow targeting if some groups never buy.

**Expected result:** You know who buys and who does not.

**Step 3.** Break down by device and time: if phones convert far worse than computers, fix the mobile site; note day-of-week patterns for launches and emails.

**Expected result:** You have device and timing insights.

**Step 4.** Break down by country and by new versus existing customers.

**Expected result:** You know how much spend reaches new people and which countries deserve their own campaigns.

## Lesson 20.9: Attribution and incrementality
<!-- stage:attract -->

**Why this matters:** Every platform claims credit for the same sale. Incrementality means sales that would not have happened without the ad. Five rules keep you honest.

**Step 1.** Use MER (total ad spend divided by total store sales) as your first number.

**Expected result:** You judge ads by the store's real sales.

<!-- do:growth -->

**Step 2.** Use platform numbers for direction only, mainly to compare ads inside one platform.

**Expected result:** You stop adding up platform claims.

**Step 3.** Track new-customer CAC (ad spend divided by new customers) weekly.

**Expected result:** You know whether growth is real.

**Step 4.** Run a holdout test: pause a channel or campaign in one region or for one week and watch total sales.

**Expected result:** If sales do not drop, those ads were not adding sales.

**Step 5.** Add a post-purchase survey asking "Where did you first hear about us?".

**Expected result:** Customer answers sit next to your data.

## Lesson 20.10: Your analysis rhythm
<!-- stage:grow -->

**Why this matters:** A fixed rhythm of daily, weekly, monthly and quarterly checks means nothing is missed and nothing is over-checked.

**Step 1.** Put the daily, weekly, monthly and quarterly checks from the table below into your calendar.

**Expected result:** Each check has a recurring slot.

<!-- do:calendar -->

**Step 2.** Do today's daily check now.

**Expected result:** The rhythm has started.

### Good to know

| When | Time | What to do |
| --- | --- | --- |
| Daily | 10 minutes | Read your scorecard (MER, contribution profit). Stop money-wasting ads. Give more to winners. Check spend is on pace. |
| Weekly | 45 minutes | Ad report (hook rate, hold rate, CTR and cost per sale by idea), breakdowns, search terms, brief the next batch. |
| Monthly | 2 hours | MER and contribution profit against target, share of new customers, channel mix, test results, next month's plan. |
| Every 3 months | Half a day | A holdout test, a review of your account setup, and the budget plan for the next busy season. |

## Lesson 20.11: Reporting that leads to decisions
<!-- stage:grow -->

**Why this matters:** A report is only useful if it leads to a decision. Four questions do that; dashboards with 40 numbers do not.

**Step 1.** Start each report with what happened: sales, contribution profit and MER against target.

**Expected result:** Three numbers open every report.

<!-- do:growth -->

**Step 2.** Add why: the one or two biggest causes with evidence.

**Expected result:** Every change has a reason.

**Step 3.** Add what you did this period and the next three actions with an owner and a date each.

**Expected result:** The report ends in decisions.

**Watch out:** If a number would not change a decision, drop it.

## Lesson 20.12: Common analysis mistakes
<!-- stage:attract -->

**Why this matters:** Most analysis mistakes come from judging too soon or comparing the wrong things. Checking for these six saves money.

**Step 1.** Never judge an ad after one day or $10 of spend.

**Expected result:** Every ad gets its full test spend first.

**Step 2.** Compare ROAS with your own break-even, not with other stores or other seasons.

**Expected result:** ROAS is always read against break-even.

**Step 3.** Do not turn off an ad set the platform calls "bad" while your MER is improving, and check what happens after the click before trusting CTR.

**Expected result:** Decisions follow store results.

**Step 4.** Stop daily edits, and never trust the total of what each platform says it earned.

**Expected result:** Campaigns finish learning and your numbers stay honest.

## Self-check

1. Hook rate 35%, CTR 1.6%, conversion rate 0.6%. Where is the problem?
2. Your add to cart rate is double normal, but few people check out. What three things do you check first?
3. Platform ROAS is stable but MER is rising. What might be happening?
4. Why start Google Performance Max as feed-only, with your brand excluded?
5. Name four custom audiences to build on day one.

<details><summary>Answers</summary>

1. The ad works. The page or offer does not. Check speed, whether the page matches the ad, how clear the offer is, trust signs and mobile checkout.
2. Surprise shipping cost, checkout steps and payment options, and forced account sign-up.
3. Retargeting or double-counting is taking credit while fewer new customers arrive. Move budget to cold, check the share of new customers, and run a holdout test.
4. It behaves like Shopping (clearer data), and it stops Performance Max claiming cheap brand searches as its own wins.
5. Any four of: visitors (30 and 180 days), product viewers, add to cart, started checkout, buyers, engagers, video viewers, email list.

</details>
