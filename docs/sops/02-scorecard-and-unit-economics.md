# SOP 02: Daily scorecard and unit economics

> **In plain words.** Each morning you see one number: did the store make money yesterday? You enter your costs once (product cost, shipping, fees). After that, sales minus all costs and ad spend gives your profit for the day.

**Purpose.** Give the owner one honest number each morning: did we make money yesterday? Set up the cost drivers once so Helix can estimate daily contribution profit, MER and the store's own target MER.

**Copilot triggers**
- Onboarding, right after the audit.
- The user asks "am I profitable?", "what should my ROAS be?", or "is my MER good?".
- Monthly economics review.
- Any cost driver changes (new 3PL, new supplier price, price change).

## One-off setup (20 to 30 minutes)

1. **Variable costs per order** (use averages, not perfection):
   - Landed product cost as a % of revenue (product, freight in, duties).
   - Fulfilment and shipping per order (3PL pick/pack plus postage, net of shipping charged).
   - Packaging per order.
   - Payment fees (if unknown, use about 2.6% blended).
   - Other per-order costs (marketplace fees, inserts, gifts with purchase).
2. **Fixed monthly costs:**
   - Staff and contractors (including the founder's pay if they take one).
   - Software and apps.
   - Rent, insurance, accounting, other overheads.
   - Fixed marketing that is not ad spend (photo shoots, creator gifting, agency retainers).
3. Helix spreads fixed costs into a **daily allowance** (monthly total ÷ days in month).
4. **Backfill** the last 1 to 2 months of daily revenue, orders, sessions and ad spend from Shopify and ad platforms so trends are visible from day one.
5. **Wholesale and other channels:** keep online retail separate. Allocate a fair share of fixed costs to wholesale so online numbers are not distorted.

## The daily scorecard (2 minutes)

| Field | Source |
| --- | --- |
| Revenue (net of refunds and discounts) | Shopify |
| Orders, units, new vs returning customers | Shopify |
| Sessions | Shopify or analytics |
| Ad spend per channel | Meta, Google, TikTok, other |
| Estimated variable costs | Revenue x variable cost % plus per-order costs x orders |
| Daily fixed allowance | From setup |
| **Contribution profit** | Revenue - variable costs - ad spend |
| **Net profit (estimate)** | Contribution profit - daily fixed allowance |

**Ratios Helix calculates**
- **MER%** = total ad spend ÷ revenue. (The inverse, revenue ÷ ad spend, is sometimes called blended ROAS.)
- **Variable cost ratio (VCR)** = variable costs ÷ revenue.
- **Fixed cost ratio (FCR)** = fixed costs ÷ revenue.
- **Net profit %** = 100% - MER% - VCR - FCR.
- **Revenue per visit (RPV)** = revenue ÷ sessions. Also conversion rate, AOV and cost per visit (ad spend ÷ sessions).
- **New-customer cost** = ad spend ÷ new-customer orders.
- **Target MER%** = 100% - VCR - FCR - target net profit %.

## Decision rules

- Judge the business on 3-day rolling and month-to-date numbers, never on one day.
- If Shopify revenue and the sum of platform-reported revenue differ by more than 2x, trust Shopify and flag attribution.
- If VCR is above 50%, Helix will not suggest scaling ad spend until a cost or pricing fix is planned.
- If fixed costs are above 30% of revenue but everything else is healthy, growth is the fix. Do not cut the team you need to grow into.
- Ask the user to re-check cost drivers every quarter, or whenever Helix detects an AOV change above 15%.

## Who does what

| Helix can do | The user does |
| --- | --- |
| Pull revenue, orders, sessions, spend daily (read-only connections, no approval needed after connect) | Enter cost drivers once, confirm them quarterly |
| Calculate ratios and target MER | Decide target net profit % |
| Flag anomalies and tracking mismatches | Fix accounting categories with their bookkeeper |
| Send a morning scorecard push or email | Read it daily |

**Done when:** the scorecard shows yesterday's estimated profit and a target MER the user agrees with.

**Related:** SOP 03 (constraint diagnosis), SOP 17 (cash).
