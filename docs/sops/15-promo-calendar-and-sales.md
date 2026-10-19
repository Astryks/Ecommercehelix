# SOP 15: Promo calendar and sale playbook

> **In plain words.** Plan the year's launches and sales ahead. Big days should be big and profitable. Customers should not learn to wait for discounts. Helix warns you weeks ahead of each key date on Today and the home page. One click adds a dated prep plan.

**Purpose.** Plan a year of launches and sales so revenue peaks are big and profitable. Do not train customers to wait for discounts.

**Copilot triggers**
- Monthly review (rolling 90-day calendar).
- 6 to 8 weeks before a big seasonal sale (Black Friday, end of financial year, local holidays).
- Automatic seasonal alerts from the real date (`src/lib/seasons.ts`). Black Friday shows from 1 August (about 17 weeks out). In 2026, Black Friday is 27 November and Cyber Monday is 30 November. Other alerts show this many weeks out: Christmas cut-offs 8, Boxing Day and New Year 5, Valentine's Day 6. Also Mother's Day 8, EOFY 6, Father's Day 7. Each alert offers a one-click prep plan with dated steps and appears in the weekly report. A Monday reminder email is built, but sending is switched off for now. Push reminders are not live yet.
- The user asks "how should I run my sale?" or "how much should I spend during the sale?".

## Calendar principles

- **3 to 4 big revenue peaks a year.** More than that teaches customers to wait.
- **Planned events beat sugar rushes.** Build interest for weeks. Then the event lifts 4 to 6 weeks of revenue, not 1 to 2.
- **Small regular drops.** Release new products or colours in small drops (1 to 3 items). A fixed day and time builds a habit.
- **Relevance moments.** Gifting days with curated gift edits and e-gift cards, no store-wide discount needed.
- **Soft tools first.** Gift with purchase, bundles, VIP codes and gift cards before store-wide discounts. Use deep discounts mainly to clear old stock.

## Sale playbook (Helix version)

**6 to 8 weeks out**
- Set the revenue target from last year's event and recent growth. Back-solve stock and ad budget.
- Decide the offer structure (store-wide, tiered, gift, mystery bundle, mid-sale drop).
- Confirm stock and gift orders. Best sellers for Black Friday need ordering 10 to 12 weeks out, so order earlier than this. Check weeks of cover (SOP 17).
- Start list-building (competitions, lead ads, collaborations).
- Brief sale creative: announcement, offer explainer, best sellers, gift guides, last chance.

**1 to 2 weeks out**
- Build sale campaigns separately from evergreen ones. Load creative into the build campaign.
- Build the hype page (sign up for early access).
- Clone abandonment flows into sale versions.
- Test discount logic and gift thresholds on the live store.

**Hype (3 to 5 days before)**
- Hype ads to collect sign-ups. Emails building anticipation.
- Gradually shift evergreen budget toward hype and warm audiences rather than cutting it all at once.

**Launch**
- VIPs get early access (for example 48 hours), then subscribers and hype sign-ups, then everyone.
- Launch email and one SMS. Sale ads say the offer and product in the first seconds.
- Expect to spend more per order; the higher conversion rate during sales usually makes up for it.

**Mid-sale**
- Refresh offers: a new drop or limited bundle for 24 hours.
- Mid-sale email, social proof ("best sellers going fast" only if true).

**Last chance**
- Last 24 to 48 hours: last-chance emails and SMS. Final send on the last day, morning.

**After the sale**
- Expect a hangover: lower revenue and higher costs for a week or two. Do not rebuild the account.
- Ramp evergreen campaigns back up gradually.
- Nurture new buyers: thank you, how to use, results, then a small time-limited offer for a second purchase.
- Review: revenue vs target, MER, new customers, stock left, what to repeat.

## Legal and practical checks

- If some products are excluded, say so clearly in ads and on site.
- Only show a "was" price you really charged for a reasonable time before the sale. Otherwise the saving can be misleading (see [ACCC: two-price comparisons](https://www.accc.gov.au/publications/advertising-selling/advertising-and-selling-guide/pricing/two-price-comparison-advertising) and [FTC: former price comparisons](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-233/section-233.1)).
- Show a clear refund and exchange policy for sale items before purchase. It can limit change-of-mind returns only.
- In Australia, never say "no refunds on sale items". Faulty sale items still get a repair, replacement or refund (see [ACCC: consumers' rights and obligations](https://www.accc.gov.au/business/treating-customers-fairly/consumers-rights-obligations)).
- Make sure discounted prices pass correctly to Google and Meta catalogs.

## Who does what

| Helix can do (with approval) | The user does |
| --- | --- |
| Draft the 90-day and 12-month calendar | Approve dates and offers |
| Model target, stock and budget for the event | Order stock and gifts |
| Draft sale emails, SMS, ads and the hype page copy | Approve every send and ad |
| Suggest budget shifts between evergreen and sale campaigns | Approve the media plan and make the changes in your ad accounts |

**Related:** SOP 12, 13, 14, 17.
