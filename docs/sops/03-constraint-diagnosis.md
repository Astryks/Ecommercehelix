# SOP 03: Constraint diagnosis

> **In plain words.** Find the one thing holding profit back most, and fix that first. If ads are the problem, fix ads. If visitors arrive but do not buy, fix the site. If sales are fine but profit is thin, fix costs.

**Purpose.** Find the single biggest thing holding profit back, so Helix suggests the right fix. Ads only fix ad problems. Site problems need site fixes. Cost problems need cost fixes.

**Copilot triggers**
- Month-to-date and 3-day MER both above target ("Defend" stance).
- Net profit below 0% for a calendar month.
- The user asks "why are sales down?", "why is my ROAS dropping?", or "should I spend more?".
- Monthly economics review.

## Step 1. Name the constraint type

| Type | Signs | Typical fixes |
| --- | --- | --- |
| **Throughput** (not enough orders) | Healthy ratios but small revenue, low sessions | More traffic, better creative, more channels, better conversion |
| **Efficiency** (costs eat the profit) | VCR, FCR or MER outside healthy bands | Cost, pricing, AOV, ad efficiency |
| **Capacity** (cannot serve more) | Stockouts, cash tied up, fulfilment delays | Stock planning, cash forecasting, 3PL, supplier terms |

Throughput is the most common real constraint. Many owners think they have an ad problem when they really have a traffic-volume or conversion problem.

## Step 2. Place the store in one of five situations

1. **Profitable (10%+ net):** scale.
2. **Fixed costs heavy:** scale carefully. Each extra sale spreads the fixed base. Example: a $50k/month store with MER 20%, VCR 40% and FCR 30% makes 10%. At $100k with the same fixed dollars, FCR halves to 15%, so profit rises even if MER worsens a little.
3. **Variable costs heavy:** stop and fix. Check product cost, shipping (above 15% of revenue is a red flag), packaging, pricing, product mix and AOV. Scaling a store that loses money on each order loses more money.
4. **MER heavy:** go to Step 3 before touching ads.
5. **Borderline on everything:** fix MER first, then variable costs, then scale.

## Step 3. Diagnose high MER

1. **Temporary shock?** Check for a best seller out of stock, a recent sale (hangover), seasonality, a competitor sale, a tracking break, a site outage or a policy rejection. If yes, fix or wait. Do not rebuild.
2. **Split traffic cost from revenue per visit.**
   - RPV below the category benchmark (about $2.50 to $4 for most categories; fashion often lower): site or offer problem.
   - RPV fine: ad problem.
3. **If RPV is the problem, split CR from AOV.** There is no universal "good" conversion rate; there is only a good RPV for your price point.
   - Low AOV: bundles, cart tiers, post-purchase upsell (SOP 12).
   - Low CR on a high-priced product: risk reversal such as trials, samples, guarantees, finance options (SOP 04).
   - Low CR generally: clarity, proof, friction fixes (SOP 11).
4. **If ads are the problem:**
   - Outbound CTR below 0.5%: creative, message or offer in the ad (SOP 07, 08).
   - CTR healthy but cost per click high relative to RPV: CPMs are high. Check frequency, audience saturation, season.
   - Engaging ads with poor cost per purchase: the landing page does not deliver what the ad promised (SOP 11).
   - There is no universal cost-per-click benchmark. What matters is cost per click versus RPV.

## Step 4. Model a scale test (only when ready)

1. Pick spend steps (for example $300, $600, $900 a day).
2. Assume efficiency drops as spend rises. Helix models a falling RPV-adjusted return per step from the store's own history.
3. Find the breakeven revenue at which extra spend still makes money after variable and fixed costs.
4. If breakeven requires more than doubling the business, fix the cost or conversion drivers first.
5. Write down the maximum you are willing to lose on the test (the extra spend). That is the worst case.
6. Prepare creative before scaling. A scale-up with tired ads usually fails.

## Who does what

| Helix can do | The user does |
| --- | --- |
| Run the diagnosis from connected data (read-only) | Confirm any temporary shocks Helix cannot see |
| Explain the result in plain words with the numbers | Choose which fix to pursue |
| Generate the fix tasks into Today and the Roadmap | Approve any scale test and its maximum loss |

**Done when:** the user can say in one sentence what the constraint is and has one fix scheduled.

**Related:** SOP 02, 04, 06, 11, 12.
