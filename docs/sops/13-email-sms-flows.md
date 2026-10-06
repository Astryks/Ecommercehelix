# SOP 13: Email and SMS flows

> **In plain words.** Flows are emails and texts that send by themselves when someone does something, like joining your list or leaving a cart. Set them up once and they earn every day without more ad spend.

**Purpose.** Build the automated messages that earn money every day without new ad spend. For most stores, flows should make about half of email revenue and campaigns the other half.

**Copilot triggers**
- Email platform connected, or none detected during the audit.
- Any core flow missing or performing below benchmark.
- Friday retention review.
- The user asks "which email flows do I need?" or "is Klaviyo worth it?".

## The five core flows

| Flow | Trigger | Timing | Rough share of total store revenue (healthy store) |
| --- | --- | --- | --- |
| Welcome | Signs up | Email 1 immediately, 3 to 6 emails over about 2 weeks | Around 5 to 6% |
| Browse abandonment | Viewed product, no cart | First email after 3 to 4+ hours | Small but steady |
| Cart abandonment | Added to cart, no checkout | First email after 1 to 2 hours | 2 to 4% |
| Checkout abandonment | Started checkout, no order | First email about 1 hour | Around 4% |
| Post-purchase | Placed order | Thank you, how to use, review request, cross-sell, replenishment | Builds repeat rate |

The five core flows usually drive the large majority of flow revenue. Add win-back, back-in-stock, price-drop and sunset flows after these work.

## Build rules

- Welcome flow: a unique, expiring code if you offer one. Optionally escalate the offer once after about 2 weeks for non-buyers.
- Use zero-party data from the pop-up (what they are shopping for) to personalise welcome emails.
- Abandonment flows run about 7 days. Split new and returning customers: discounts to new customers only.
- Turn off smart sending on flows so time-critical messages are not skipped.
- Plain-text founder-style emails often get the highest clicks. Mix them in.
- During sales, swap in sale-specific abandonment flows and turn evergreen discounts off, at the same scheduled time.

## SMS (only where it adds)

- Use SMS where email failed, not as a copy of every email.
- Welcome: one SMS about 30 minutes after email 1 if not purchased.
- Checkout abandonment: one SMS after the second email.
- Respect quiet hours and local rules (for example sender ID registration in Australia).

## Health benchmarks

| Metric | Flows | Campaigns |
| --- | --- | --- |
| Open rate | Above 35% | Around 35 to 40% |
| Click rate | Above 1% | Around 1.3% |
| Placed order rate | | Around 0.05%+ |
| Unsubscribe rate | | Under 0.3% |

Open rates are inflated by privacy features; use clicks and revenue per recipient as the truth.

## Deliverability

- Authenticate the domain (SPF, DKIM, DMARC). Consider BIMI later.
- Warm up new sending: start with the most engaged segment, then grow each send by no more than about 1.5x the previous one.
- Pause flows with very low engagement. Suppress invalid and never-engaged profiles.
- Watch for spikes in bounces from particular providers.

## Loyalty and repeat

- Only build a loyalty program if 12-month repeat rate is above about 15 to 20%.
- Cashback rate should follow net margin (lower margin, smaller reward).

## Who does what

| Helix can do (with approval) | The user does |
| --- | --- |
| Audit flows and benchmarks (read-only) | Choose the platform and pay for it |
| Draft flow structure, copy and subject lines | Approve copy and brand look |
| Create flows in Klaviyo as drafts (Growth) | Approve going live |
| Weekly flow report | Set discount policy |

Helix never turns a flow live or sends to a list without approval.

**Related:** SOP 14, 15.
