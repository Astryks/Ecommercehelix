# SOP 13: Email and SMS flows

> **In plain words.** Flows are emails and texts that send by themselves, like after someone joins your list or leaves a cart. Set them up once and they earn every day without more ad spend.

**Purpose.** Build the automated messages that earn money every day without new ad spend. Across Klaviyo stores, flows earn nearly 41% of email revenue from about 5% of sends (see [Klaviyo: 2026 benchmarks](https://www.klaviyo.com/products/email-marketing/benchmarks)). Many healthy stores aim for 40 to 50%.

**Copilot triggers**
- Email platform connected, or none detected during the audit.
- Any core flow missing or performing below benchmark.
- Friday retention day.
- The user asks "which email flows do I need?" or "is Klaviyo worth it?".

## The five core flows

| Flow | Trigger | Timing | Typical role |
| --- | --- | --- | --- |
| Welcome | Signs up | Email 1 immediately, 3 to 6 emails over about 2 weeks | Often a top earner |
| Browse abandonment | Viewed product, no cart | First email after 3 to 4+ hours | Small but steady |
| Cart abandonment | Added to cart, no checkout | First email after 1 to 2 hours | Often a top earner |
| Checkout abandonment | Started checkout, no order | First email about 1 hour | Often a top earner |
| Post-purchase | Placed order | Thank you, how to use, review request, cross-sell, replenishment | Builds repeat rate |

The five core flows usually drive the large majority of flow revenue. Add win-back, back-in-stock, price-drop and sunset flows after these work.

## Build rules

- Welcome flow: a unique, expiring code if you offer one. Optionally escalate the offer once after about 2 weeks for non-buyers.
- Use zero-party data from the pop-up (what they are shopping for) to personalise welcome emails.
- Abandonment flows run about 7 days. Split new and returning customers: discounts to new customers only.
- Turn off Smart Sending on time-critical flow emails, such as welcome email 1. Klaviyo leaves it on for most flow emails by default. Its 16-hour window can skip them (see [Klaviyo: Smart Sending](https://help.klaviyo.com/hc/en-us/articles/115002779311)).
- Plain-text founder-style emails often get the highest clicks. Mix them in.
- During sales, swap in sale-specific abandonment flows and turn evergreen discounts off, at the same scheduled time.

## SMS (only where it adds)

- Use SMS where email failed, not as a copy of every email.
- Welcome: one SMS about 30 minutes after email 1 if not purchased.
- Checkout abandonment: one SMS after the second email.
- Text only people who gave clear consent to SMS. Every message needs your business name and a free, working opt-out.
- Australia: honour opt-outs within 5 working days (see [ACMA: avoid sending spam](https://www.acma.gov.au/avoid-sending-spam)). Register brand sender IDs on the SMS Sender ID Register. Since 1 July 2026, unregistered names show as "Unverified" (see [ACMA: SMS Sender ID Register](https://www.acma.gov.au/sms-sender-id-register)).
- US: marketing texts need prior express written consent under the TCPA. Send only between 8am and 9pm in the recipient's time zone (see [47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200)). Some states set tighter hours. Business text numbers also need carrier registration (10DLC) or toll-free verification (Lesson 25.6).

## Health benchmarks

| Metric | Flows | Campaigns |
| --- | --- | --- |
| Open rate | Rule of thumb: above 30% | Rule of thumb: above 30% |
| Click rate | About 5.6% average | About 1.7% average |
| Placed order rate | About 13 times campaigns | Rule of thumb: 0.05%+ |
| Unsubscribe rate | | Rule of thumb: under 0.3% |

Click rates are Klaviyo's 2026 averages (see [Klaviyo: 2026 benchmarks](https://www.klaviyo.com/products/email-marketing/benchmarks)). Rules of thumb are labelled. Open rates are inflated by privacy features. Use clicks and revenue per recipient as the truth.

## Deliverability

- Authenticate the domain (SPF, DKIM, DMARC). Consider BIMI later.
- Gmail requires this for senders of over 5,000 emails a day. It also needs one-click unsubscribe and spam complaints under 0.3%, ideally under 0.1% (see [Google: email sender guidelines](https://support.google.com/a/answer/81126)).
- Warm up new sending: start with the most engaged segment. As a rule of thumb, grow each send by no more than about 1.5x the previous one.
- Pause flows with very low engagement. Suppress invalid and never-engaged profiles.
- Watch for spikes in bounces from particular providers.

## Loyalty and repeat

- Rule of thumb: build a loyalty program only if 12-month repeat rate is above about 15 to 20%.
- Cashback rate should follow net margin (lower margin, smaller reward).

## Who does what

| Helix can do (with approval) | The user does |
| --- | --- |
| Audit flows and benchmarks (read-only) | Choose the platform and pay for it |
| Draft flow structure, copy and subject lines | Approve copy and brand look |
| Create flows in Klaviyo as drafts (Growth) | Approve going live |
| Weekly flow report | Set discount policy |

Helix never turns a flow live or sends to a list without approval.

**Email rules.** Every marketing email needs consent, your business name and a working unsubscribe. In Australia, honour unsubscribes within 5 working days (ACMA, above). In the US, honour them within 10 business days and include a postal address (see [FTC: CAN-SPAM guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)).

**Related:** SOP 14, 15.
