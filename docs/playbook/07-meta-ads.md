# Module 7: Meta ads in practice

**Outcome:** you can build, run and optimise a Meta account daily in 10 minutes, and scale it without wrecking performance.

**Related SOPs:** [05](../sops/05-meta-structure-and-scaling.md), [06](../sops/06-meta-daily-optimisation.md), [07](../sops/07-creative-testing.md)


<!-- plain:start -->
> **In plain words**
>
> **What it is:** How to set up and run Facebook and Instagram ads in about 10 minutes a day.
>
> **Why it matters:** For most stores, Meta is where most new customers come from. Doing the basics well beats clever tricks.
>
> **Do this:**
>
> 1. Set up your pixel so Meta can see sales.
> 2. Start one Sales campaign with broad targeting and 3 ads.
> 3. Each day, check cost per sale against your target and act on the plain-English verdict in Helix.
>
> **Words to know:**
>
> - **Pixel:** A small piece of code on your store that tells Meta when someone views, adds to cart or buys.
> - **Advantage+:** Meta's automatic settings that let its system choose audience, placements or budget for you.
> - **Learning phase:** The first days after you start or change an ad set, while Meta works out who to show it to. Results jump around, so wait.
> - **CPA:** Cost per acquisition: how much ad money it took to get one sale.
>
> All words are explained in the [glossary](../glossary.md).
<!-- plain:end -->

---

## Lesson 7.1: Account setup checklist
- [ ] Business verified, two admins, two-factor on every admin.
- [ ] Pixel and server-side events (conversions API) connected through your store platform; currency matches.
- [ ] Catalog connected and synced; sale prices pass through.
- [ ] Audience segments defined (new, engaged, existing customers).
- [ ] Custom audiences built (visitors 30/180, viewers, add to cart, checkout, purchasers, engagers, email list).
- [ ] Saved columns (SOP 06).
- [ ] Account spending limit as a safety net.
- [ ] Regular check for hacked campaigns: unknown campaigns, sudden huge budgets. If hacked, remove access, contact support, dispute charges.

## Lesson 7.2: Automated vs manual campaigns
Automated sales campaigns let the platform choose budget, audience and placements. Manual campaigns give you control over audiences, exclusions and placements. Most accounts run both: automated for broad cold and mixed, manual for warm and specific tests. Turn off "show as carousel or collection" type automations if they break your creative.

## Lesson 7.3: Ad formats
| Format | Best for |
| --- | --- |
| Single video (9:16 and 4:5) | Most prospecting |
| Single image (4:5) | Bold statements, offers, reviews |
| Carousel | Multiple products, steps, reasons |
| Catalog / dynamic product ads | Retargeting viewed products, large ranges |
| Collection | Mobile shopping experiences |
| Partnership ads | Creator content from their handle |
| Catalog product video | Automated product videos from templates |

Keep text inside safe zones so Reels and Stories do not crop it.

## Lesson 7.4: Launching
1. Stage new ads in the build campaign (always off).
2. Duplicate into target campaigns using the existing post so likes and comments carry over.
3. Launch in one go per batch.
4. Expect 2 to 5 days before signals settle.
5. Use ad scheduling only for specific needs (sale start times).

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

## Lesson 7.5: The learning phase
- Big edits (creative swaps, audience changes, budget jumps over 20%) restart learning.
- New campaigns do not reset existing ones.
- Good early CPA can worsen in week two; judge on 7-day trends.
- Do not keep moving winning ads into "the best campaign"; copy instead and let each campaign keep its learning.

## Lesson 7.6: Daily optimisation in 10 minutes
1. Business stance from the scorecard.
2. Campaign budgets and frequency.
3. Grade ads: Star, Steady, Passenger, Drain (thresholds in SOP 06).
4. Campaign state: winning, learning, shaky, dying.
5. One action, logged.

## Lesson 7.7: Reach potential
How many people can an ad reach before frequency hits 2? Ads with big reach at acceptable CPA are scalable; ads with tiny reach before frequency climbs are not, even with a great CPA. Pair a low-CPA ad with a high-reach ad to scale.

## Lesson 7.8: Managing expensive cold campaigns
Cold campaigns look expensive because attribution undercounts them. Compare cold with cold, watch new-customer share, and judge them by total MER trend. Cut them only when MER and new-customer orders both fall.

## Lesson 7.9: Metrics by funnel layer
| Layer | Main metrics |
| --- | --- |
| Cold | Reach, CPM, hook rate, outbound CTR, new-customer share, CPA vs 2x target |
| Mixed | CPA vs 1.25x target, frequency, engaged share |
| Warm | CPA vs target, frequency |
| Hot | CPA vs 0.75x target, frequency |

## Lesson 7.10: Scaling challenge
A structured 2 to 4 week push: prepare creative, set the maximum loss, step budgets 10 to 20% a day, track reach vs spend growth, hold new levels 10 to 14 days. If spend rose much faster than reach, add creative or loosen exclusions. If MER did not settle, step back and diagnose; a failed test still teaches you the next constraint.

## Lesson 7.11: Attribution settings
Platform attribution (for example 7-day click, 1-day view) is not your truth. Incrementality-style attribution options and holdout tests help estimate real lift. Always reconcile with Shopify revenue and MER.

## Lesson 7.12: Troubleshooting
| Symptom | Check |
| --- | --- |
| Partial delivery | Budget too low for audience, billing, policy limits, schedule |
| Ads stuck in processing | Policy review, catalog errors; wait 24 to 48 hours, then duplicate |
| Platform adds a discount label you did not set | Promotions settings in the ad; turn off auto-offers |
| Data restrictions applied | Category classification; request a review |
| Instagram converts worse than Facebook | Usually fine; judge blended. Exclude placements only with strong evidence. |
| Ad limit reached | Archive dead ads, consolidate ad sets |

## Self-check
1. Name two edits that restart learning.
2. Why can a low-CPA ad be a poor scaling choice?
3. How do you judge cold campaigns?
4. What do you do with a hacked campaign?

<details><summary>Answers</summary>

1. Budget change over 20%, adding or swapping creative, audience change (any two).
2. Small reach before frequency climbs.
3. Against other cold campaigns and by total MER and new-customer trend.
4. Turn it off, remove unknown access, secure admins, contact support, dispute charges.
</details>
