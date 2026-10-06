# Module 6: Defining campaigns

**Outcome:** you can plan any ad campaign from scratch. You set the numbers it must hit, choose the goal and setup, pick the audience and budget, name it properly, brief the ads, test them fairly, read the results and decide: spend more, wait, make new ads, or stop.

This module connects your plan to Ads Manager (the place where you build Meta ads). The [campaign brief template](#lesson-616-the-campaign-brief-template) at the end is what Helix fills in with you when you press "New campaign" in Your ads.

**Related SOPs:** [05 Meta structure](../sops/05-meta-structure-and-scaling.md), [06 Meta daily optimisation](../sops/06-meta-daily-optimisation.md), [07 Creative testing](../sops/07-creative-testing.md), [09 Google](../sops/09-google-shopping-pmax-search.md), [15 Promo calendar](../sops/15-promo-calendar-and-sales.md)


<!-- plain:start -->
> **In plain words**
>
> **What it is:** How to plan one ad campaign from start to finish.
>
> **Why it matters:** A plan with clear numbers tells you when to spend more, wait or stop, so you never guess.
>
> **Do this:**
>
> 1. Set your target cost per sale from your break-even numbers.
> 2. Choose the goal (sales), the audience and the daily budget.
> 3. Launch, wait for enough data, then decide: spend more, wait, new ads or stop.
>
> **Words to know:**
>
> - **Campaign:** The top level in an ad account. It holds the goal, like getting sales.
> - **Ad set:** The middle level in Meta. It holds who sees the ads, where, and often the budget.
> - **Target CPA:** The cost per sale you aim for so each sale still leaves you profit.
> - **Break-even CPA:** The most you can pay in ads for one sale before that sale stops making money.
>
> All words are explained in the [glossary](../glossary.md).
<!-- plain:end -->

---

## Lesson 6.1: Numbers first

Never open Ads Manager until you know these five numbers. Module 1 explains each one.

| Number | What it means | How to work it out | Example (AOV $90, VCR 40%, FCR 15%, profit goal 15%) |
| --- | --- | --- | --- |
| Target MER | The share of all sales you can spend on ads | 100% - VCR - FCR - profit goal | 30% |
| Break-even ROAS | Sales per $1 of ads where a sale makes $0 | 1 ÷ (1 - VCR) | 1.67 |
| Break-even CPA | The most you can pay for one sale before it loses money | AOV x (1 - VCR) | $54 |
| Target blended CPA | What you aim to pay per sale, across all customers | AOV x target MER | $27 |
| Allowance for cold campaigns | What a campaign aimed at new people may show per sale | Target CPA x 2 | $54 |

**Why cold campaigns get double:** ad platforms miss many of the sales that cold ads cause (people see an ad, then buy days later another way). So the cost per sale they report looks worse than it really is.

**Decision rule:** if your **target** CPA is lower than what similar stores pay to win a customer, do not spend yet. First fix your offer, order size or margins (Module 2).

**First order versus lifetime value:** if customers reliably buy again, you can afford to pay more for the first order. Only do this when you have real repeat data: the share of customers who buy again within 12 months, and the margin on their second order. Watch your cash, because the payback comes later.

## Lesson 6.2: Pick the job of the campaign

Each campaign has one job. The job decides which goal (objective) you choose in Ads Manager and what you tell the platform to aim for (optimise for).

| Job | Objective to choose | Aim for |
| --- | --- | --- |
| Find new buyers | Sales | Purchase |
| Bring back visitors and subscribers | Sales | Purchase (if sales are few, sometimes add to cart) |
| Grow your email list | Leads, or Sales sending people to a sign-up page | Lead, or completed sign-up |
| Build excitement before a launch or sale | Leads or Engagement | Sign-ups |
| Test ads cheaply on a new platform | Sales, aimed at an earlier step (view content, add to cart) when purchases are too few | The earlier step, then switch to purchase |
| Show people products they looked at (catalog retargeting) | Sales with your product catalog | Purchase |

**Decision rule:** aim for the deepest step (purchase is deepest) that happens at least about 25 to 50 times a week per campaign. With fewer, the platform cannot learn and results jump around.

## Lesson 6.3: Testing campaigns vs scaling campaigns

Keep testing and winning separate, so new tests do not upset what already works.

1. **Scaling campaigns** hold your proven ads and most of the budget (70 to 80%). Do not add new ads to them while they are winning.
2. **A testing campaign** (or a test ad set) gets 20 to 30% of the budget and your new batches of ads. When an ad wins, move it to a scaling campaign by copying it. Keep the same post ID, so it keeps its likes and comments.
3. **A build campaign** is a campaign that is always switched off. You build each ad there once, then copy it wherever you need it.

## Lesson 6.4: Account structure by spend

"Cold" means people who do not know you. "Warm" means people who visited or engaged. "Mixed" means both. Set up your account based on how much you spend each day.

| Daily ad spend | Suggested setup |
| --- | --- |
| Under $100 | 1 cold Sales campaign with broad targeting and your best 4 to 8 ads, plus 1 warm campaign. Put 70 to 80% of the budget into cold. |
| $100 to $500 | Cold, mixed and warm campaigns, plus a testing campaign and a build campaign. |
| $500 to $1,000 | Add a second cold campaign with different exclusions (people you leave out) or a different automated setup. |
| $1,000 to $3,000 | Campaigns per country or product line. Separate sale campaigns during big events. |
| $3,000 or more | A set test budget, creator and partnership ad campaigns, catalog video ads, more countries. |

**Budget split:** when you are small, 70 to 80% cold and 20 to 30% warm. Later: cold 30 to 50%, mixed 30 to 40%, warm 20 to 30%.

**Other setups to test once things are stable.** Test one at a time:

1. **Campaign budget** (the platform splits money between ad sets) versus **ad set budget** (you decide each one).
2. **Cost cap bidding,** when you need a hard limit on cost per purchase.
3. **How many people to leave out (exclusions):**
   - None.
   - Light: recent buyers.
   - Harsh: all buyers and people who engaged.
   - Very harsh: also recent visitors.

   Harsher exclusions usually show a worse cost per sale, but they find more truly new customers.
4. **A cap on spend to existing customers** in automated Sales campaigns (for example, at most 10 to 20% to existing customers).
5. **Aiming for landing page views** for very cold, broad tests where you mostly want reach.

## Lesson 6.5: Audiences

The audience is who sees your ads.

1. **Start broad.** Let the ads themselves find the right people. Only test interest targeting after you have winning ads.
2. **Custom audiences** are lists of people who already know you:
   - Site visitors (last 30 and 180 days).
   - People who viewed a product, added to cart or started checkout.
   - Buyers (last 180 days, and all time).
   - People who engaged on social media.
   - Your email list.
3. **Lookalikes** are new people who look like your customers. 1% is the closest match and 10% is the widest. 3 to 5% is a sensible test.
4. **Audience segments** (new, engaged, existing customers) are set once for the whole ad account. They let you see how much spend reaches new people.
5. **Exclusions.** Leave employees and existing customers out of cold campaigns where it makes sense.
6. **Countries.** A new country gets its own campaign once spend allows. Start with the country most like the one that already works.

## Lesson 6.6: Budgets

1. **Start with what you can afford to lose while learning.** A common minimum is 2 to 3 times your target CPA, per day, per campaign.
2. **Never change the budget of a campaign that is working by more than 20% a day.** Bigger jumps can reset its learning.
3. **When raising the budget stops working, add new campaigns instead** (this is called scaling horizontally).
4. **Set spending limits** on ad sets and campaigns during big events, so they cannot overspend.
5. **Judge by the week, not the day.** Daily budgets spend more on some days and less on others.

## Lesson 6.7: Naming conventions

A naming convention is a fixed pattern for names. It lets you, your team and Helix read the account at a glance and compare results later.

**Campaign name pattern:**

`[Number]-[Automation: Auto/Manual]-[Who: Cold/Mixed/Warm/Hot]-[Targeting: Broad/Interest/LAL]-[Exclusions: None/Light/Harsh]-[BAU or Sale]`

Example: `03-Manual-Cold-Broad-Harsh-BAU`. (BAU means "business as usual", the normal campaigns outside sales. LAL means lookalike.)

**Ad name pattern:**

`[Batch]-[Concept]-[Pillar]-[Format]-[Hook]-[Creator]-[Date]`

Example: `B14-OneStarRebuttal-Prove-Video-ReviewHook-Sam-2610`

**Tip:** rename your old campaigns to this pattern, so your history becomes easy to read.

## Lesson 6.8: Creative concepts, angles and hooks

1. **Concept:** the big idea. For example "answering a one-star review".
2. **Angle:** why it matters to a specific person. For example "for tall men who can never find shirts that fit".
3. **Hook:** the first 3 seconds.
4. **Format:** video, still image, carousel (several swipeable cards), catalog, collection, or creator video.

**Decision rule:** each batch tests **one** thing. Keep products and prices similar within a batch, so the test is fair.

## Lesson 6.9: Writing the creative brief

A creative brief is a one-page set of instructions for each ad. Include:

1. The goal, and who it is for (cold, warm or hot).
2. The pillar (teach, prove, feel or stand for).
3. The customer and their problem, in their own words.
4. Three hook options.
5. The key message.
6. The proof.
7. The offer and the call to action.
8. Format and length.
9. What must be shown and what must be avoided.
10. The deadline.
11. Usage rights.

The full template is in [SOP 08](../sops/08-creative-briefs-ugc-creators.md).

## Lesson 6.10: Testing methodology

Use these default rules for every ad test.

| Rule | Default |
| --- | --- |
| Things you change per batch | 1 |
| Ads per batch | 4 to 8 under $100 a day per campaign. 8 to 12 at $100 to $500. 12 to 15 above that. |
| Spend before you judge an ad | 1 to 1.5 times target CPA (more for cold ads) |
| Expensive products | Judge on early signs: outbound CTR, cost per click, add to cart rate, and how fast frequency rises |
| Budget for tests | 20 to 30% of the total |
| Learning time | Do not edit for 3 to 7 days after launch |
| Be careful with small numbers | Under about 10 purchases per ad, treat results as a hint, not proof |

**Why spend rules matter:** to tell a 2% conversion rate from a 3% one with confidence, you need a few thousand visitors for each version. Most ad tests never get that many. So you use spend limits and early signs instead.

## Lesson 6.11: Reading metrics

| Metric | What it tells you | What good looks like |
| --- | --- | --- |
| Hook rate (3-second views ÷ impressions) | Does the first moment stop people? | About 25 to 35% or more on video |
| Hold rate (views to 50%, or ThruPlays, ÷ 3-second views) | Does the story keep them watching? | Going up as you make new versions |
| Outbound CTR | Does the ad make people want to click to your site? | 1 to 1.5% or more. Below 0.5% is a problem. |
| CPM | Cost to show the ad 1,000 times | Compare with your own past and season, not other stores |
| Cost per outbound click | CPM and CTR combined | Must be low compared with RPV (what a visit earns) |
| Add to cart rate | Does the page turn interest into carts? | Compare with your site average |
| CPA (cost per purchase) | How efficient the ad is | Compare with the target for its audience |
| ROAS (as the platform reports it) | Sales the platform credits to the ad, per $1 | Compare with break-even, and with your MER trend |
| Frequency | How often the same people see it | Within the limit for its audience |
| Reach growth versus spend growth | Are you reaching new people as you spend more? | Reach should grow about as fast as spend |

**How to read patterns:**

1. People engage with the ad, but cost per sale is poor: the page or offer does not match the ad.
2. Low CTR across a whole batch: the message or offer is weak.
3. CPM rising while CTR stays steady: you have reached most of the audience, or it is a busy season.

## Lesson 6.12: Decision rules: scale, hold, refresh, kill

In Helix these show as **Spend more**, **Wait**, **New ads needed** and **Stop**.

| Decision | When | What to do |
| --- | --- | --- |
| **Scale (Spend more)** | Cost per sale is at or under target, frequency is fine, and MER for the last 3 days and the month so far is on target. | Add 20% to the budget a day, or copy the ad into another campaign. |
| **Hold (Wait)** | It is still learning, was edited recently, or results are mixed but getting better. | Make no changes for 3 days. |
| **Refresh creative (New ads needed)** | No strong ads are left, frequency is high, or fewer than 30% of the batch still perform. | Launch a new batch from your list of ad ideas. |
| **Kill (Stop)** | It has spent the "bad" amount (2 times the good CPA for its audience) with poor results or no purchases. | Turn it off today. |

## Lesson 6.13: Google campaign definitions

| Campaign | What it is for | Key settings |
| --- | --- | --- |
| Brand search | Protect your own name cheaply when people search for it | Small budget. Bid for impression share or set bids yourself. Your brand words only. |
| Brand shopping (optional) | Show your products when people search your name | Low priority, brand searches |
| Feed-only Performance Max or Shopping | Find new customers from your product list | Leave out your brand name. Group products by best sellers or margin level. Set a target ROAS above break-even. |
| Non-brand search | Control over high-intent search words | At most 5 keywords per ad group. A shared list of blocked words (negative keywords). Up to 15 headlines. |
| Competitor search | Reach people comparing you with competitors | Honest comparison ads. Watch costs closely. |
| Demand Gen and YouTube | Visual ads to help people discover you | Judge with view-through results (people who saw the ad and bought later) |
| Local | Visits to a physical shop | Only if you have a shop |

**Timing:** a new Google campaign needs about 2 weeks to learn, then 4 weeks to judge, at $50 a day or more.

## Lesson 6.14: Promotional and seasonal campaigns

1. Build sale campaigns separately from your normal (BAU) campaigns.
2. Copy your best normal cold campaign as the base for the sale's cold campaign.
3. Warm and hot sale campaigns use ads that lead with the offer.
4. Set spending limits. Plan the budget for each day of the sale.
5. Expect some days to look poor (for example quiet days in the middle). Judge the whole event, not single days.

### Black Friday plan (timeline)

| When | What to do |
| --- | --- |
| 10 to 12 weeks before | Set a sales target from last year and recent growth. Choose the offer. Order stock and free gifts. Start growing your email list. |
| 8 weeks | Brief the sale ads: the announcement, how the offer works, best sellers, gift guides, last chance. Plan landing pages. |
| 6 weeks | Plan the sale emails and texts. Book creators. Check site speed and checkout. |
| 4 weeks | Build the sale campaigns (switched off) and the excitement campaign. Load ads into the build campaign. |
| 2 weeks | Stop changing the website code. Test discount codes, free gift minimums and sale prices in your catalog. |
| 5 to 3 days before | Excitement phase: sign-up ads and teaser emails. Move normal budget across slowly. |
| Launch day | Early access for your best customers, then everyone. Send the launch email and text. Turn sale campaigns on. |
| Middle of the sale | Release something new or a limited bundle for 24 hours. Refresh the ads. |
| Last 48 hours | Last-chance emails and texts, and ads that stress the deadline. |
| After | Turn normal campaigns back up slowly. Welcome new buyers. Compare results with the target. |

## Lesson 6.15: Common campaign mistakes

1. Starting without break-even numbers.
2. Too many campaigns for the budget, so each one gets too little data.
3. Editing every day, so nothing ever finishes learning.
4. Adding ads one at a time instead of in batches.
5. Comparing cold campaigns with warm ones (warm always looks better).
6. Having no new ads ready when you start spending more.
7. Turning everything off after one bad day.

## Lesson 6.16: The campaign brief template

Copy this for every new campaign. Helix fills in the numbers from your scorecard.

```
CAMPAIGN BRIEF

1. Name (use the naming pattern):
2. Channel: Meta / Google / TikTok / Pinterest / other
3. Job of the campaign: new buyers / warm / list growth / excitement / catalog / sale
4. Objective, and what it aims for:
5. Products and offer:
6. Numbers
   - AOV:            - VCR:           - Target MER:
   - Break-even CPA: - Target CPA:    - CPA allowance for this audience:
   - Break-even ROAS:
7. Audience: broad / interests / lookalike / custom. Who to leave out:
8. Countries and placements:
9. Budget: daily $____  test period ____ days  most you accept losing $____
10. Ad plan: concepts, angles, hooks, formats, number of ads, the one thing tested
11. Landing page: URL. Does it match the ad's message? (Y/N)
12. Tracking check: pixel and server events working, purchase is the only main conversion (Y/N)
13. Success looks like: CPA <= ____ after spending ____; outbound CTR >= ____
14. Decision date:
15. If it wins: +20% a day up to $____, then copy winners to ____
16. Stop rule: spend ____ with CPA above ____, or no purchases
17. Approvals: who approves the launch and budget changes
```

## Self-check

1. AOV is $120 and VCR is 35%. What is break-even CPA?
2. Why keep testing and scaling campaigns apart?
3. How many ads go in a batch at $250 a day?
4. A cold ad has 0.4% outbound CTR after enough spend. What do you decide?
5. Which Google campaign protects your brand name?
6. What happens 5 to 3 days before a big sale?

<details><summary>Answers</summary>

1. 120 x 0.65 = $78.
2. So new ads do not reset proven campaigns, and tests get a fair, fixed budget.
3. 8 to 12.
4. Stop it, or rework the message. A click problem comes from the ad or the offer.
5. Brand search.
6. The excitement phase: sign-up ads and teaser emails, and a slow move of budget across.
</details>
