# SOP 05: Meta account structure and scaling

> **In plain words.** Keep your Meta (Facebook and Instagram) ads simple: one campaign to find new customers, one to remind past visitors, and a place to test new ads. Raise budgets in small steps, only while sales stay profitable.

**Purpose.** Give Meta a simple structure that separates new customers from warm audiences, gives creative room to be tested, and can be scaled in safe steps.

**Copilot triggers**
- Meta connected for the first time.
- The account has more than 10 active campaigns, or campaigns with overlapping audiences.
- Spend is scaling into a new bracket (under $500/day, $500 to $1,000, $1,000 to $3,000, over $3,000).
- The user asks "how should I set up my campaigns?" or "should I use Advantage+?".

## Funnel layers (Helix names)

| Layer | Who | Default share of Meta spend | Frequency target (campaign, 7 days) |
| --- | --- | --- | --- |
| **Cold** | New people. Broad targeting, at least 70% of spend should reach new audiences, existing customers excluded or near zero | 30 to 50% | 1 to 2 |
| **Mixed** | Mostly new, with at least 20% reaching engaged people (180-day visitors and email list) | 30 to 40% | 2 to 3.5 |
| **Warm** | Site visitors, social engagers, subscribers who have not bought | 20 to 30% | Up to about 4 for the engaged segment |
| **Hot** | Cart and checkout abandoners, past buyers (repeat offers) | Small, often inside Warm | Up to 3 at ad level |

Use Meta's audience segment settings (new, engaged, existing customers) so reporting shows the share of spend reaching each group.

## Starting structure by spend

| Daily Meta spend | Campaigns |
| --- | --- |
| Under $100 | 1 Cold (broad, Advantage+ sales or manual broad) + 1 Warm. Start around 70 to 80% Cold. |
| $100 to $500 | Cold, Mixed, Warm, plus a paused **build campaign** for staging new ads |
| $500 to $1,000 | Add a second Cold campaign with a different exclusion setting, or a separate testing campaign |
| $1,000+ | Add campaigns per country or per major product line. Separate sale campaigns from evergreen ones during big events. |

**Build campaign.** A campaign that always stays off. Build every new ad there first, then duplicate into the live campaigns that need it. This avoids rebuilding the same ad several times and keeps naming consistent.

**Naming.** Use a fixed pattern so humans and Helix can read the account at a glance:
`[Layer]-[Type]-[Audience]-[Exclusions]-[Offer or BAU]` for campaigns, and
`[Batch]-[Concept]-[Format]-[Hook]-[Creator]` for ads.

## Steps (first build)

1. Audit the current account: active campaigns, spend split, audiences, exclusions, frequency, learning status.
2. Propose the target structure for the spend bracket. Show what stays, what merges, what pauses.
3. Create audiences: website visitors (30/180 days), engagers, email list, purchasers (180 days, all time), and a 1% to 5% lookalike of purchasers if useful. Broad targeting is the default for Cold; test interests only after you have winning ads.
4. Create a build campaign and load the best existing ads into it.
5. Launch new campaigns with the best 4 to 8 proven ads each. Do not turn off the old structure the same day. Shift budget over 1 to 2 weeks in steps of no more than 20% a day.
6. Set up saved columns (SOP 06).

## Scaling rules

- **Vertical:** raise budget by up to 20% a day on a campaign that is performing. Larger jumps reset learning.
- **Horizontal:** start a new campaign or ad set (new audience, new country, star ads copied in) when vertical steps run out. New campaigns do not disturb existing ones.
- **Hold period:** after a step-up, hold 10 to 14 days. MER often worsens at first and settles in most cases. If it does not settle, step back.
- **Reach check:** when scaling, compare spend growth to reach growth. If spend rose 50% but reach rose 20%, you are paying more to hit the same people. Add new creative or loosen targeting.
- **Exclusions:** campaigns with tighter existing-customer exclusions often look worse on CPP but bring more new customers. When scaling for growth, favour them.
- **Multiple ad sets:** keep structure lean. More ad sets split the learning data.

## Who does what

| Helix can do (with approval) | The user does |
| --- | --- |
| Audit structure and propose changes (read-only) | Approve the target structure |
| Create audiences, a build campaign and draft campaigns in your account, all paused | Review the drafts in Ads Manager and press Launch yourself |
| Prepare budget changes (exact new value and a deep link) | Make every budget change on live campaigns yourself; set the spend cap and payment method |
| Rename campaigns and ads to the naming pattern | Confirm business verification and policy issues |

**Guardrails:** Helix never turns on spend. Everything it creates is paused, it never edits budgets on live campaigns, and it logs every change with a one-tap revert. See [Execution model](../execution-model.md). Without a connected account, Helix runs in Guide me mode: structures, original example ads and a click-by-click build checklist.

**Related:** SOP 06, 07.
