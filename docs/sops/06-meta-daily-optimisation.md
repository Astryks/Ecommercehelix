# SOP 06: Meta daily optimisation

**Purpose.** A 5 to 10 minute daily routine that turns off what is losing, feeds what is winning and decides when a campaign needs new ads. Defence first, then offence.

**Copilot triggers**
- Every day in the daily loop (ad action).
- Any campaign's cost per purchase rises 30%+ over its 7-day average.
- Frequency crosses the "high" line for its layer.

## Step 1. Business numbers first

Before opening Ads Manager, read the scorecard stance (Push, Careful push, Hold, Defend) from the 3-day and month-to-date MER (see the Compound Plan, section 2). The stance sets how aggressive today's changes are.

| Stance | Budget | Optimisation |
| --- | --- | --- |
| Push | Up to +20% on best campaigns | Light |
| Careful push | +10 to 20% | Light to regular |
| Hold | No change | Regular |
| Defend | Up to -20% | Aggressive, plus full diagnosis (SOP 03) |

## Step 2. Campaign level: direct money

1. Check each campaign's spend share against the layer ranges (SOP 05). Move budget toward the layer that is under-funded and performing, max 20% a day.
2. Check campaign frequency against the layer target. High frequency in Cold means the creative pool is exhausted or the budget is too high for the audience.
3. Check the audience segment split (share of spend on new vs engaged vs existing).

## Step 3. Ad level: grade every ad that has spent enough

Only grade an ad once it has spent at least the good CPP threshold.

- Good CPP = AOV x target MER x layer multiplier (Cold 2.0, Mixed 1.25, Warm 1.0, Hot 0.75).
- Bad CPP = 2 x good CPP.
- CPP window: last 4 days. Frequency window: last 7 days. (For long consideration products, widen both.)
- Frequency lines (fine / high): Cold 1.4 / 1.8, Mixed 1.8 / 2.0, Warm 2.0 / 2.4, Hot 2.4 / 3.0.

| Grade | Rule | Action today |
| --- | --- | --- |
| Star | Good CPP, fine frequency | Keep. Consider copying into another campaign. Brief iterations. |
| Steady | Good CPP and high frequency, or middling CPP and fine frequency | Keep. Note for refresh. |
| Passenger | Middling CPP and high frequency | Turn off when the next batch is ready. |
| Drain | Bad CPP, or spent the bad threshold with no purchase | Turn off now. |

**High-reach ads:** an ad that reaches far more people before frequency hits 2 can be worth more than an ad with a slightly lower CPP. Favour reach when scaling.

**A star that turns into a budget hog:** if a former star now has high frequency and middling CPP but still takes most of the spend, turn it off or move it to another campaign so budget flows to fresher ads.

## Step 4. Campaign state: does it need new ads?

| State | Signs | Action |
| --- | --- | --- |
| Winning | At least one Star, MER on target | Do not add ads. |
| Learning | Changed in the last 3 to 7 days | Leave alone. |
| Shaky | No Star, Steady ads with rising frequency | Prepare a batch in the build campaign, add in 1 to 2 days. |
| Dying | No Star and under 30% of the original batch still running | Add a batch now, or close the campaign. |

Batch size by daily campaign spend: up to $100 is 4 to 8 ads; $100 to $500 is 8 to 12; over $500 is 12 to 15. Adding ads resets learning, so add them in one go, not one at a time.

## Step 5. Weekly product fit snapshot

For each product, plot last month's ad spend against return. Products with high spend and good return get more creative and budget. Products with low spend and good return may deserve a test. Products with high spend and poor return need offer or page work.

## Saved columns (set up once)

Delivery, budget, amount spent, purchases, cost per purchase, purchase value, ROAS, reach, frequency, impressions, CPM, cost per 1,000 reached, AOV (custom: purchase value ÷ purchases), outbound CTR, outbound clicks, cost per outbound click, adds to cart, cost per add to cart.

## Who does what

| Helix can do | The user does |
| --- | --- |
| Pull data and grade ads daily (read-only) | Review the grade list (30 seconds) |
| Pause Drain ads (one approval can cover "pause all Drains today") | Approve, or set an auto-approve rule for pauses only |
| Prepare budget moves within the 20% rule (exact values and deep links) | Make the budget change in Ads Manager |
| Duplicate ads from a build campaign into campaigns, added paused | Switch the new ads on |

**Auto-pause option (proposed, opt-in, Growth):** users may allow Helix to pause ads that meet the Drain rule without asking, within limits (max 3 pauses a day, never the last active ad in a campaign). Pausing only reduces spend. Helix never raises, lowers or resumes spend itself. See [Execution model](../execution-model.md).

**Related:** SOP 05, 07.
