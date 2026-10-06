# Email and SMS automation: suggest, draft, approve, set up

Helix watches for missing or under-performing flows (the `email-gap` rule in the [audit engine](audit-engine.md)), suggests the flow with the evidence, drafts the copy and the flow logic in your brand voice, and sets it up in your email platform **only after you approve**. Every flow can also be done by hand with the guide in [Playbook Module 10](playbook/10-email-sms-whatsapp.md).

## How it works

1. **Detect.** Daily pull from the email platform: which flows exist, are live, and what they earn. Compare against the core set below and against store data (for example replenishment only for consumables, VIP only once there are repeat buyers).
2. **Suggest.** An insight in Today and Insights: "You have no abandoned checkout flow. Stores like yours often recover a meaningful share of checkouts with one." with the evidence (checkouts started, recovered, revenue).
3. **Draft.** Helix writes each message (subject, preview, body, SMS text) using your brand core, best sellers, reviews and offer rules. It also sets timing, filters and exit conditions.
4. **Approve.** You see the full flow in the approval queue: messages, timing, discount logic and estimated AI cost. Edit, approve or reject.
5. **Set up.** On approval, Helix creates templates, segments and the flow in **Klaviyo** through its API (draft status first, then live after a final check). For **Shopify Email** and **Shopify Flow**, where creation by API is limited, Helix prepares the content and a guided click-by-click setup, and verifies it once live.
6. **Watch.** Weekly: revenue per recipient, conversion, unsubscribe and spam rates. Helix suggests A/B tests on subject lines and timing.

Guardrails: no message goes live without approval; discounts follow your offer rules (new customers only, never bigger than your public offer); SMS always carries opt-out and respects quiet hours; flows start in draft; everything is logged and reversible.

Status in the app: the Email automation page lists all flows with **example** status and revenue, shows the drafts below, and "Draft and set up for me" creates an approval. Platform write calls are stubbed.

## The flows

| Flow | Trigger | Goal | Example status |
| --- | --- | --- | --- |
| [Welcome series](#welcome) | Joins the email or SMS list (pop-up, footer, competition) | Turn a new subscriber into a first-time buyer | live |
| [Abandoned checkout](#abandoned-checkout) | Started checkout, no order within 1 hour | Recover high-intent shoppers | live |
| [Abandoned cart](#abandoned-cart) | Added to cart, did not start checkout within 2 hours | Bring back shoppers who showed interest | not set up |
| [Browse abandonment](#browse-abandonment) | Viewed a product twice or more in 24 hours, no add to cart (known subscriber) | Help undecided shoppers choose | not set up |
| [Post-purchase](#post-purchase) | First order placed | Reduce buyer's remorse and returns, set up the second order | live |
| [Review request](#review-request) | Order delivered + 7 to 14 days (based on how long the product takes to show results) | Collect reviews, photos and UGC | live |
| [Replenishment](#replenishment) | Days since order reaches the typical usage period for a consumable (for example 25 days for a 30-day supply) | Win the reorder before they run out | not set up |
| [Win-back](#win-back) | No order for 1.5 to 2x your typical repeat interval (for example 120 days) | Re-engage lapsed customers before they are gone | not set up |
| [VIP and loyalty](#vip) | Third order, or lifetime spend above your top 10% threshold | Recognise your best customers and keep them | not set up |

<a id="welcome"></a>
### Welcome series

- **Trigger:** Joins the email or SMS list (pop-up, footer, competition)
- **Goal:** Turn a new subscriber into a first-time buyer
- **Exit when:** Places an order
- **Discount rule:** Deliver the sign-up incentive in email 1. Never send a bigger code later in the flow.
- **What good looks like:** Often 3 to 6% of store revenue once list growth is steady
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | Immediately | Email | Welcome in. Here's your 10% off | Plus the story behind [Brand] | Thanks for joining. Your code is WELCOME10, ready to use today. We started [Brand] because [one-line founder reason]. Our best sellers are a good place to start: [3 products with one line each]. |
| 2 | 1 day | Email | Why people switch to [Brand] | Three reasons, from real customers | Three reasons customers tell us they switched: [reason + short review], [reason + short review], [reason + short review]. Your code is still waiting. |
| 3 | 3 days | Email | Your questions, answered | Sizing, shipping, returns | Answer the top 4 questions from support: fit or sizing, shipping times, returns, care. Link to the guarantee. |
| 4 | 5 days | SMS | (SMS) |  | [Brand]: your 10% code WELCOME10 ends tomorrow night. Shop: [link] Reply STOP to opt out |
| 5 | 6 days | Email | Last day for your welcome code | After tonight it's gone | Short reminder with your best-selling product, top review and a clear button. |

<a id="abandoned-checkout"></a>
### Abandoned checkout

- **Trigger:** Started checkout, no order within 1 hour
- **Goal:** Recover high-intent shoppers
- **Exit when:** Places an order
- **Discount rule:** No discount in email 1. Optional small incentive in the last message for new customers only.
- **What good looks like:** Commonly the highest revenue-per-recipient flow
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 hour | Email | Did something go wrong? | Your cart is saved | Show the cart items, a reassuring line about shipping and returns, and one review. Button: Complete my order. |
| 2 | 4 hours | SMS | (SMS) |  | [Brand]: your cart is saved. Free shipping over $[threshold]. Finish here: [link] Reply STOP to opt out |
| 3 | 24 hours | Email | Still thinking it over? | Here's what others said | Address the top objection (price, fit, delivery). Add guarantee and 3 reviews. |
| 4 | 48 hours | Email | A little something to help you decide | For first orders only | New customers only: free shipping or a small gift. Returning customers get a reminder without incentive. |

<a id="abandoned-cart"></a>
### Abandoned cart

- **Trigger:** Added to cart, did not start checkout within 2 hours
- **Goal:** Bring back shoppers who showed interest
- **Exit when:** Starts checkout or orders
- **Discount rule:** None by default.
- **What good looks like:** Lower than checkout recovery but larger volume
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | 2 hours | Email | You left something behind | Still in stock, for now | Product image, price, one benefit, one review, button back to cart. |
| 2 | 1 day | Email | Pairs well with... | Customers also bought | Show the cart item plus a complementary product or bundle that reaches the free shipping threshold. |

<a id="browse-abandonment"></a>
### Browse abandonment

- **Trigger:** Viewed a product twice or more in 24 hours, no add to cart (known subscriber)
- **Goal:** Help undecided shoppers choose
- **Exit when:** Adds to cart or orders
- **Discount rule:** None.
- **What good looks like:** High volume, lower conversion; keep it helpful, not pushy
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | 4 hours | Email | Still deciding on [Product]? | A quick guide | One-paragraph guide to the product: who it suits, how it compares to the alternative, top review. |
| 2 | 2 days | Email | Our most loved picks | Based on what you looked at | Three related best sellers with short reasons. |

<a id="post-purchase"></a>
### Post-purchase

- **Trigger:** First order placed
- **Goal:** Reduce buyer's remorse and returns, set up the second order
- **Exit when:** Second order
- **Discount rule:** None in the thank-you. A loyalty or referral offer later.
- **What good looks like:** Improves repeat rate and reduces support tickets
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | Immediately after order | Email | Thank you, [Name]. Here's what happens next | Shipping, tracking and a tip | Thank you from the founder, shipping timeline, how to get the best out of the product. |
| 2 | On delivery + 2 days | Email | How to get the most from [Product] | 3 quick tips | Usage tips or a short video. Link to support. |
| 3 | 14 days | Email | Customers who bought this also love | Picked for you | Cross-sell based on the first product. Loyalty or referral offer. |

<a id="review-request"></a>
### Review request

- **Trigger:** Order delivered + 7 to 14 days (based on how long the product takes to show results)
- **Goal:** Collect reviews, photos and UGC
- **Exit when:** Leaves a review
- **Discount rule:** Optional small reward for photo or video reviews (follow platform and local rules; never pay for positive reviews only).
- **What good looks like:** Review volume feeds product page conversion and ad hooks
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | Delivery + 10 days | Email | Quick question about your [Product] | One click to rate | Star rating inside the email, ask for a photo. Short and personal. |
| 2 | Delivery + 17 days | SMS | (SMS) |  | [Brand]: how's your [Product]? A 30-second review helps a small business a lot: [link] Reply STOP to opt out |

<a id="replenishment"></a>
### Replenishment

- **Trigger:** Days since order reaches the typical usage period for a consumable (for example 25 days for a 30-day supply)
- **Goal:** Win the reorder before they run out
- **Exit when:** Reorders
- **Discount rule:** Subscribe-and-save option rather than a code.
- **What good looks like:** Strong for consumables: skincare, supplements, food, pet
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | Usage period - 5 days | Email | Running low on [Product]? | Reorder in one click | One-click reorder link, option to subscribe and save. |
| 2 | Usage period | SMS | (SMS) |  | [Brand]: time for a refill? Reorder in 1 tap: [link] Reply STOP to opt out |

<a id="win-back"></a>
### Win-back

- **Trigger:** No order for 1.5 to 2x your typical repeat interval (for example 120 days)
- **Goal:** Re-engage lapsed customers before they are gone
- **Exit when:** Orders
- **Discount rule:** Lead with what's new. Incentive only in the final email.
- **What good looks like:** Lifts repeat revenue; also cleans the list (suppress non-openers after)
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | Day 0 | Email | It's been a while. Here's what's new | New arrivals and favourites | New products, improvements, best sellers. No discount. |
| 2 | Day 7 | Email | We saved you something | A thank-you for coming back | Small incentive, clear expiry. |
| 3 | Day 14 | Email | Should we stay in touch? | One click to keep hearing from us | Ask to confirm interest; suppress if no engagement to protect deliverability. |

<a id="vip"></a>
### VIP and loyalty

- **Trigger:** Third order, or lifetime spend above your top 10% threshold
- **Goal:** Recognise your best customers and keep them
- **Exit when:** n/a (ongoing segment)
- **Discount rule:** Early access, gifts and surprise perks over blanket discounts.
- **What good looks like:** Top customers often drive a large share of profit
- **Plan:** Growth

| # | When | Channel | Subject | Preview | Draft body |
| --- | --- | --- | --- | --- | --- |
| 1 | On qualifying | Email | You're one of our favourite people | A thank-you from the founder | Personal thank-you, VIP perks: early access to launches and sales, a gift on the next order. |
| 2 | Before each launch or sale | Email | VIP early access starts now | 24 hours before everyone else | Early access link, limited quantity note if true. |

## Writing rules Helix follows

- One goal and one main button per email.
- Subject lines under 45 characters; preview text adds new information.
- Use customer language from reviews; show one review in most emails.
- Plain-text style for founder notes; designed blocks for product emails.
- Mobile first: short paragraphs, big buttons, images under 1 MB.
- Replace `[Brand]`, `[Product]` and other placeholders from store data; never invent claims, reviews or numbers.
