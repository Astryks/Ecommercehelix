# Module 6: Defining campaigns

**Outcome:** you can plan any ad campaign from scratch: set the numbers it must hit, choose the objective and structure, define audiences and budgets, name it properly, brief the creative, test it fairly, read the results and decide to scale, hold, refresh or kill.

This module is the bridge between strategy and Ads Manager. The [campaign brief template](#lesson-616-the-campaign-brief-template) at the end is what Helix fills in with you when you press "New campaign brief" in the Campaign tracker.

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

Never open Ads Manager before you know these five numbers:

| Number | Formula | Example (AOV $90, VCR 40%, FCR 15%, profit goal 15%) |
| --- | --- | --- |
| Target MER | 100% - VCR - FCR - profit goal | 30% |
| Break-even ROAS | 1 ÷ (1 - VCR) | 1.67 |
| Break-even CPA | AOV x (1 - VCR) | $54 |
| Target blended CPA | AOV x target MER | $27 |
| Cold-campaign CPA allowance | Target CPA x 2 (attribution undercounts cold) | $54 |

If your **target** CPA is below what similar stores pay to acquire a customer, fix offer, AOV or margins before spending (Module 2).

**First-order vs lifetime:** if customers reliably buy again, you can pay more for the first order. Only do this with real repeat data (12-month repeat rate and second-order margin), and keep cash flow in mind.

## Lesson 6.2: Pick the job of the campaign

| Job | Objective to choose | Optimise for |
| --- | --- | --- |
| Find new buyers | Sales | Purchase |
| Re-engage visitors and subscribers | Sales | Purchase (sometimes add to cart for low volume) |
| Grow the list | Leads, or sales to a sign-up page | Lead or complete registration |
| Build hype before a launch or sale | Leads or engagement | Sign-ups |
| Test creative cheaply on new platforms | Sales with an earlier event (view content, add to cart) when purchase volume is too low | Earlier event, then switch to purchase |
| Catalog retargeting | Sales with catalog | Purchase |

Rule: optimise for the deepest event you can get at least roughly 25 to 50 times a week per campaign. Fewer and delivery becomes unstable.

## Lesson 6.3: Testing campaigns vs scaling campaigns

- **Scaling campaigns** hold proven ads and most of the budget (70 to 80%). You avoid adding ads while they are winning.
- **Testing campaign** (or a test ad set) gets 20 to 30% of budget and new batches. Winners graduate to scaling campaigns by duplicating the ad (keep the post ID to keep likes and comments).
- **Build campaign:** a campaign that is always off, where you build ads once before duplicating them where needed.

## Lesson 6.4: Account structure by spend

| Daily spend | Suggested structure |
| --- | --- |
| Under $100 | 1 Cold sales campaign (broad) with your best 4 to 8 ads, 1 Warm campaign. 70 to 80% to Cold. |
| $100 to $500 | Cold, Mixed, Warm, plus testing and a build campaign |
| $500 to $1,000 | Add a second Cold campaign with different exclusions or a different automated setup |
| $1,000 to $3,000 | Campaigns per country or product line, separate sale campaigns in events |
| $3,000+ | Dedicated test budget, creator/partnership campaigns, catalog video, more countries |

Starting splits: 70 to 80% Cold and 20 to 30% Warm when small. Later: Cold 30 to 50%, Mixed 30 to 40%, Warm 20 to 30%.

**Alternative structures worth testing once stable** (one at a time):
- Campaign budget (platform allocates) vs ad set budget (you allocate).
- Cost cap bidding when you need a hard ceiling on cost per purchase.
- Exclusion levels: none, light (recent buyers), harsh (all buyers and engaged), very harsh (also recent visitors). Harsher exclusions usually show worse CPA but find more new customers.
- Existing-customer budget caps in automated sales campaigns (for example 10 to 20% maximum to existing customers).
- Landing page view optimisation for very cold, broad reach tests.

## Lesson 6.5: Audiences

- **Broad first.** Let creative do the targeting. Test interests only after you have winning ads.
- **Custom audiences:** site visitors (30 and 180 days), product viewers, add to cart, checkout, purchasers (180 days, all time), social engagers, email list.
- **Lookalikes:** 1% is closest, 10% is broadest. Often 3 to 5% is a sensible test.
- **Audience segments** (new, engaged, existing customers) set at account level let you see the share of spend reaching new people.
- **Exclusions:** employees and existing customers from Cold where it makes sense.
- **Countries:** new country = new campaign once spend allows; start in the next most similar market.

## Lesson 6.6: Budgets

1. Start with what you can afford to lose while learning: a common floor is about 2 to 3x your target CPA per day per campaign.
2. Never change a budget more than 20% a day on a performing campaign.
3. Scale horizontally (new campaigns) when vertical steps stop working.
4. Use spending limits on ad sets and campaigns during big events to prevent overspend.
5. Daily budgets may overspend on some days and underspend on others; judge weekly.

## Lesson 6.7: Naming conventions

Names let you, your team and Helix read the account at a glance and analyse results later.

**Campaign:** `[Number]-[Automation: Auto/Manual]-[Layer: Cold/Mixed/Warm/Hot]-[Targeting: Broad/Interest/LAL]-[Exclusions: None/Light/Harsh]-[BAU or Sale]`
Example: `03-Manual-Cold-Broad-Harsh-BAU`

**Ad:** `[Batch]-[Concept]-[Pillar]-[Format]-[Hook]-[Creator]-[Date]`
Example: `B14-OneStarRebuttal-Prove-Video-ReviewHook-Sam-2610`

Rename old campaigns to the convention so history becomes readable.

## Lesson 6.8: Creative concepts, angles and hooks

- **Concept:** the big idea (for example "one-star review rebuttal").
- **Angle:** the reason it matters to a specific person (for example "for tall men who can never find shirts that fit").
- **Hook:** the first 3 seconds.
- **Format:** video, static, carousel, catalog, collection, creator.
One batch tests one variable. Keep products and price points comparable within a batch.

## Lesson 6.9: Writing the creative brief

For each ad: goal and layer, pillar, customer and problem in their words, 3 hook options, key message, proof, offer and call to action, format and length, must-show and must-avoid, deadline, usage rights. (Full template in SOP 08.)

## Lesson 6.10: Testing methodology

| Rule | Default |
| --- | --- |
| Variables per batch | 1 |
| Ads per batch | 4 to 8 under $100/day per campaign, 8 to 12 at $100 to $500, 12 to 15 above |
| Spend before judging an ad | 1 to 1.5x target CPA (more for cold) |
| High-priced products | Use early signals: outbound CTR, cost per click, add-to-cart rate, how fast frequency builds |
| Budget for tests | 20 to 30% of total |
| Learning time | Avoid edits for 3 to 7 days after launch |
| Statistical caution | Under about 10 purchases per ad, treat results as directional |

**Sample size intuition:** to tell a 2% from a 3% conversion rate with reasonable confidence you need on the order of a few thousand visitors per variant. That is why ad tests lean on spend thresholds and leading indicators.

## Lesson 6.11: Reading metrics

| Metric | Tells you | Healthy signal |
| --- | --- | --- |
| Hook rate (3-second views ÷ impressions) | Does the first frame stop people? | Rough guide 25 to 35%+ on video |
| Hold rate (watch to 50% or ThruPlay ÷ 3-second views) | Does the story keep them? | Rising with iterations |
| Outbound CTR | Does the ad make them want to click? | 1 to 1.5%+, below 0.5% is a problem |
| CPM | Cost to reach 1,000 people | Compare over time and season, not across stores |
| Cost per outbound click | Combined effect of CPM and CTR | Must be low relative to RPV |
| Add to cart rate | Does the page convert interest? | Compare with site average |
| CPA / cost per purchase | Efficiency | Versus target for the layer |
| ROAS (platform) | Attributed return | Versus break-even and against MER trend |
| Frequency | How often the same people see it | Within layer limits |
| Reach vs spend growth | Are you reaching new people as you scale? | Reach should grow roughly with spend |

Engaging ad, poor CPA = page or offer mismatch. Low CTR across a batch = message or offer. Rising CPM with steady CTR = saturation or season.

## Lesson 6.12: Decision rules: scale, hold, refresh, kill

| Decision | When | Action |
| --- | --- | --- |
| **Scale** | CPA at or under target, frequency fine, 3-day and month-to-date MER on target | +20% budget a day, or copy the ad into another campaign |
| **Hold** | Learning, recently edited, or results mixed but improving | No changes for 3 days |
| **Refresh creative** | No strong ads left, frequency high, or fewer than 30% of the batch still performing | Load a new batch from your creative backlog |
| **Kill** | Spent the "bad" threshold (2x good CPA for its layer) with poor results or zero purchases | Turn off today |

## Lesson 6.13: Google campaign definitions

| Campaign | Purpose | Key settings |
| --- | --- | --- |
| Brand search | Protect your name cheaply | Small budget, impression share or manual bids, brand terms only |
| Brand shopping (optional) | Show your products on brand searches | Low priority, brand queries |
| Feed-only PMax / Shopping | Non-brand prospecting | Brand exclusions, products grouped by best sellers or margin tier, target ROAS above break-even |
| Non-brand search | Control on high-intent terms | Max 5 keywords per ad group, shared negatives, up to 15 headlines |
| Competitor search | Capture comparison shoppers | Honest comparison ads, monitor costs closely |
| Demand Gen / YouTube | Visual discovery | Judge with view-through metrics |
| Local | Physical store visits | Only if you have a shop |

New campaigns: about 2 weeks learning + 4 weeks evaluation at $50+/day.

## Lesson 6.14: Promotional and seasonal campaigns

- Build sale campaigns separately from evergreen (BAU) campaigns.
- Copy your best evergreen cold campaign as the base for the sale cold campaign.
- Warm and hot sale campaigns carry offer-led creative.
- Set spending limits. Plan the budget curve by day.
- Expect MER to look poor on some days (for example quiet mid-sale days); judge across the whole event.

### Black Friday plan (timeline)

| When | Do |
| --- | --- |
| 10 to 12 weeks out | Revenue target from last year and recent growth. Offer structure. Order stock and gifts. Start list-building. |
| 8 weeks | Brief sale creative (announcement, offer explainer, best sellers, gift guides, last chance). Plan landing pages. |
| 6 weeks | Build sale email and SMS schedule. Book creators. Confirm site speed and checkout. |
| 4 weeks | Build sale campaigns (off) and the hype campaign. Load creative into the build campaign. |
| 2 weeks | Freeze site code. Test discounts, gift thresholds, catalog sale prices. |
| 5 to 3 days | Hype phase: sign-up ads, teaser emails. Shift evergreen budget gradually. |
| Launch day | VIP early access, then everyone. Launch email + SMS. Sale campaigns on. |
| Mid-sale | New drop or limited bundle for 24 hours. Refresh creative. |
| Last 48 hours | Last-chance emails, SMS, urgency creative. |
| After | Ramp evergreen back up slowly. Nurture new buyers. Review against target. |

## Lesson 6.15: Common campaign mistakes

- Starting without break-even numbers.
- Too many campaigns for the budget (data split too thin).
- Editing daily so nothing leaves learning.
- Adding ads one at a time.
- Judging cold campaigns against warm ones.
- No creative ready when scaling.
- Turning everything off after a bad day.

## Lesson 6.16: The campaign brief template

Copy this for every new campaign. Helix pre-fills it from your scorecard.

```
CAMPAIGN BRIEF

1. Name (convention):
2. Channel: Meta / Google / TikTok / Pinterest / other
3. Job of the campaign: new buyers / warm / list growth / hype / catalog / sale
4. Objective and optimisation event:
5. Products and offer:
6. Numbers
   - AOV:            - VCR:           - Target MER:
   - Break-even CPA: - Target CPA:    - Layer CPA allowance:
   - Break-even ROAS:
7. Audience: broad / interests / lookalike / custom. Exclusions:
8. Countries and placements:
9. Budget: daily $____  test period ____ days  max loss you accept $____
10. Creative plan: concepts, angles, hooks, formats, number of ads, variable tested
11. Landing page: URL, does it match the ad message? (Y/N)
12. Tracking check: pixel + server events firing, purchase is the only primary conversion (Y/N)
13. Success criteria: CPA <= ____ after ____ spend; outbound CTR >= ____
14. Decision date:
15. Scale plan if it wins: +20%/day to $____, then copy winners to ____
16. Kill rule: spend ____ with CPA above ____ or zero purchases
17. Approvals: who approves launch and budget changes
```

## Self-check

1. Break-even CPA with AOV $120 and VCR 35%?
2. Why separate testing from scaling campaigns?
3. How many ads in a batch at $250/day?
4. A cold ad has 0.4% outbound CTR after enough spend. Decision?
5. Name the Google campaign that protects your brand name.
6. What happens 5 to 3 days before a big sale?

<details><summary>Answers</summary>

1. 120 x 0.65 = $78.
2. So proven campaigns are not reset by new ads, and tests get a fair, fixed budget.
3. 8 to 12.
4. Kill or rework the message; the click problem is creative or offer.
5. Brand search.
6. Hype phase: sign-up ads and teaser emails, gradual budget shift.
</details>
