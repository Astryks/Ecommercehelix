/** Long-form owner guides at /guides. Markdown bodies, rendered on the server. No invented stats or case studies. */
export type Article = { slug: string; title: string; description: string; h1: string; published: string; updated: string; features: string[]; body: string };

const D = "2026-10-13";

export const ARTICLES: Article[] = [
  {
    slug: "how-to-increase-ecommerce-conversion-rate",
    title: "How to Increase Your E-commerce Conversion Rate",
    description: "A practical, owner-friendly guide to increasing your online store's conversion rate: measure it properly, fix the offer, product pages, trust, checkout and follow-up.",
    h1: "How to increase your e-commerce conversion rate",
    published: D, updated: D, features: ["store-audit", "email-automation"],
    body: `
Your conversion rate is the share of store visits that end in an order. If 1,000 people visit and 20 buy, your conversion rate is 2%. It matters because it multiplies everything else: every dollar you spend on ads and every hour you spend on content goes further when more visitors buy.

This guide walks through the fixes in the order that usually pays back fastest. None of them need a developer.

## First, measure it the right way

Before you change anything, write down three numbers for the last 30 days: sessions, orders and conversion rate. Shopify and most platforms show all three in their reports. Then look at the steps in between:

- **Add-to-cart rate:** how many visits add something to the cart.
- **Checkout rate:** how many carts reach checkout.
- **Checkout completion:** how many checkouts become orders.

The step with the biggest drop is where to start. A low add-to-cart rate points to the offer or product page. A big drop between cart and checkout points to surprise costs. A drop inside checkout points to payment, shipping options or trust.

Also split the numbers by device and by traffic source. Mobile visitors and cold ad traffic usually convert lower than desktop and returning visitors. That is normal; compare like with like.

## Fix the offer before the design

Most conversion problems are offer problems. Ask yourself, honestly, why someone should buy this product, from you, today.

- Is the price clear, and does it feel fair next to the alternatives?
- Is shipping cost and delivery time obvious before checkout?
- Is there a reason to buy now, such as a bundle, a free gift above a set amount, or a genuine deadline?

A simple, profitable lever is a **free-shipping threshold set a little above your average order value**. It nudges people to add one more item instead of discounting your margin away.

## Make product pages answer every question

A shopper on a product page is trying to answer: what is it, will it work for me, and what happens if it does not? Good product pages answer in that order.

1. A clear headline that says what the product does, not just its name.
2. Photos that show scale, detail and the product in use. Add short video if you can.
3. Benefits first, then specifications.
4. Real reviews close to the Add to cart button.
5. Shipping, returns and guarantee in plain words, visible without scrolling far.

Read your customer emails and reviews. The questions people ask before buying belong on the page.

## Build trust quickly

New visitors do not know you. Small signals add up: a real About page, a visible contact method, clear return terms, secure payment badges at checkout, and reviews with photos. Remove anything that looks broken or out of date, such as an expired sale banner.

## Remove friction from checkout

- Offer the express wallets your customers use (for example Shop Pay, Apple Pay, Google Pay, PayPal).
- Allow guest checkout.
- Show the full cost, including shipping, as early as possible.
- Keep form fields to what you need.
- Place a test order on mobile yourself every few months and note anything slow or confusing.

## Follow up with people who nearly bought

Many visitors are not ready on the first visit. Abandoned checkout, abandoned cart and browse reminders bring a share of them back, usually without a discount. See [the email flows every store needs](/guides/email-flows-every-store-needs) and [how to reduce cart abandonment](/guides/how-to-reduce-cart-abandonment).

## Test one change at a time

Change one thing, give it at least a couple of weeks or a few hundred orders' worth of data, and compare with the period before. If you change five things at once you will never know which one worked. Keep a simple log of what you changed and when.

## Watch profit, not just conversion rate

A big discount can lift conversion rate and still lose money. Judge every change by profit per visit, not by conversion rate alone.

## How Helix helps

Helix audits your store, ads and emails, then turns the biggest conversion fixes into short daily tasks with step-by-step instructions. See the [store audit](/features/store-audit) and the [profit dashboard](/features/profit-dashboard).
`,
  },
  {
    slug: "when-to-hire-an-ecommerce-consultant",
    title: "When to Hire an E-commerce Consultant or Agency (and When Not To)",
    description: "Should you hire an e-commerce growth consultant or agency? How to tell if you are ready, what to ask, how to judge results, and what you can do yourself first.",
    h1: "When to hire an e-commerce consultant or agency, and when not to",
    published: D, updated: D, features: ["daily-growth-plan", "profit-dashboard"],
    body: `
At some point most store owners wonder whether they should pay an e-commerce growth consultant or agency to take over. Sometimes that is the right call. Often it is too early, or the wrong kind of help. This guide helps you decide.

## Signs you are ready for outside help

- **You know your numbers.** You can say what a customer is worth to you, what you can afford to pay for a sale, and what your margin is after all costs.
- **The basics are in place.** Tracking works, your store converts reasonably, and you have core email flows running.
- **Your time is the bottleneck.** You know what needs doing, but you cannot do it all and run the business.
- **You have budget for both the fee and the work.** An agency fee is not the same as an ad budget or a stock budget. You need room for all three.

## Signs it is too early

- You are not sure whether you make a profit on each order.
- You hope someone else will "find" what works because you have not tested anything yet.
- The fee would take money that should go into ads or stock.

In these cases, the most valuable thing you can do is learn the fundamentals yourself. They do not leave when a contract ends.

## Consultant, agency, freelancer or software?

- **Consultant:** strategy and advice. Best when you have a team to carry out the work.
- **Agency:** strategy and execution, usually on a monthly retainer. Best when you need hands as well as heads.
- **Freelancer:** a specific skill, such as ad buying, email or design.
- **Software and courses:** a structured plan you carry out yourself, at a lower cost, while building your own skill.

These are not mutually exclusive. Many owners learn the basics with a tool, then bring in a specialist for one channel once it is working.

## Questions to ask before you hire

1. How will you measure success, and is it profit or only revenue?
2. Who owns the ad accounts, email platform and data? (The answer should be: you.)
3. What will you do in the first 30, 60 and 90 days?
4. What do you need from me each week?
5. How do I end the contract, and what do I keep?

Ask for examples you can verify, and be wary of guaranteed results. Nobody honest can promise them.

## How to judge results once you hire

Track the same numbers every week: revenue, ad spend, cost per sale against your break-even, returning customer rate and, above all, profit. Reports that are hard to check are a warning sign. If you understand the numbers yourself you can have a much better conversation with any partner. See [break-even ROAS explained](/guides/break-even-roas-explained).

## A middle path

E-commerce Helix is not an agency. It is software that works like a growth expert by your side: a [daily growth plan](/features/daily-growth-plan), a [profit dashboard](/features/profit-dashboard), and tools that prepare work for your approval. If you already work with an agency, Helix helps you read their results with your own eyes.
`,
  },
  {
    slug: "shopify-growth-checklist",
    title: "Shopify Growth Checklist: 30 Steps to Grow Your Store",
    description: "A practical Shopify growth checklist for store owners: setup, tracking, product pages, shipping, email, ads, retention and the weekly habits that compound.",
    h1: "The Shopify growth checklist",
    published: D, updated: D, features: ["daily-growth-plan", "meta-ads"],
    body: `
Use this checklist to find gaps in your Shopify store. Work through it in order: the early sections make the later ones work better. Do one or two items a day rather than all at once.

## Foundations

- [ ] Payments turned on, including express wallets your customers use.
- [ ] Tax settings set up correctly for where you sell.
- [ ] Shipping rates clear, with a free-shipping amount a little above your average order.
- [ ] A test order placed on mobile, from product page to confirmation email.
- [ ] A short main menu: shoppers should reach any product in two taps.
- [ ] Policies (shipping, returns, privacy, contact) linked in the footer.

## Tracking and numbers

- [ ] Meta tracking connected from Shopify (the Facebook and Instagram channel).
- [ ] Google Analytics or another analytics tool installed and checked.
- [ ] You know where to find yesterday's sales, orders and sessions in Shopify reports.
- [ ] You know your profit per order after product cost, shipping, fees and ads.
- [ ] You know your break-even cost per sale. See [break-even ROAS explained](/guides/break-even-roas-explained).

## Product pages and conversion

- [ ] Each product has a clear headline, real photos and benefits before specifications.
- [ ] Reviews show near the Add to cart button.
- [ ] Shipping and returns are visible on the product page.
- [ ] Your theme is updated, fast on mobile and edited safely in a duplicate first.
- [ ] Your best sellers are linked from the home page and menu.

More detail in [how to increase your e-commerce conversion rate](/guides/how-to-increase-ecommerce-conversion-rate).

## Email and SMS

- [ ] A sign-up form or pop-up with a clear reason to join.
- [ ] Welcome series live.
- [ ] Abandoned checkout and abandoned cart reminders live.
- [ ] Post-purchase and review request emails live.
- [ ] A regular campaign rhythm, such as one useful email a week.

See [the email flows every store needs](/guides/email-flows-every-store-needs).

## Traffic

- [ ] A paid channel with a fair test budget, judged against break-even.
- [ ] Fresh ad creative tested regularly, with strong openings in the first few seconds.
- [ ] Product titles, descriptions and collection pages written for search. See [e-commerce SEO basics](/guides/ecommerce-seo-basics).
- [ ] A content or social habit you can keep up.

## Retention and growth

- [ ] Bundles or add-ons to raise average order value.
- [ ] A win-back email for lapsed customers.
- [ ] Seasonal plans dated on your calendar, especially Black Friday. See the [Black Friday plan](/features/black-friday-plan).

## Weekly habits

- [ ] Check profit daily, not monthly.
- [ ] Review one channel each week and make one change.
- [ ] Write down what you changed and what happened.

## Let Helix order it for you

The Helix [daily growth plan](/features/daily-growth-plan) turns this kind of checklist into one 15-minute task a day, with drawings of exactly where to click in Shopify.
`,
  },
  {
    slug: "how-to-reduce-cart-abandonment",
    title: "How to Reduce Cart Abandonment on Your Online Store",
    description: "Why shoppers abandon carts and checkouts, and the practical fixes: clear costs, faster checkout, trust, and reminder emails that recover sales without big discounts.",
    h1: "How to reduce cart abandonment",
    published: D, updated: D, features: ["email-automation", "store-audit"],
    body: `
Cart abandonment is when a shopper adds something to their cart, or starts checkout, and leaves without paying. Some of it is unavoidable: people browse, compare and save items for later. But a good share is caused by things you can fix.

## Why shoppers leave

The common reasons are well known across e-commerce:

- **Surprise costs** at checkout, especially shipping, taxes or fees.
- **Being forced to create an account.**
- **A long or confusing checkout**, especially on mobile.
- **Missing payment options** they trust.
- **Doubts about delivery time or returns.**
- **Just browsing**, or comparing prices.

## Fix 1: show the full cost early

Put shipping costs and delivery times on product pages and in the cart, not only at the last step. A free-shipping threshold, shown as a progress bar in the cart, turns a cost into a reason to add one more item.

## Fix 2: make checkout fast

- Allow guest checkout.
- Offer express wallets such as Shop Pay, Apple Pay, Google Pay and PayPal.
- Remove optional fields.
- Test it yourself on a phone. If anything is slow or confusing for you, it is worse for a stranger.

## Fix 3: answer doubts at the point of purchase

Repeat your returns policy, delivery times and a contact option near the checkout button. Show secure payment marks. Keep reviews visible in the cart if your theme allows it.

## Fix 4: send reminders

Reminder emails are the single most reliable way to recover abandoned carts. A good setup has three flows:

1. **Abandoned checkout:** the shopper reached checkout and gave an email but did not pay. Send the first reminder within a few hours.
2. **Abandoned cart:** the shopper added to cart but did not reach checkout. Send to known subscribers.
3. **Browse abandonment:** the shopper viewed a product more than once but did not add it.

Keep the first email friendly and helpful: show the product, answer common questions, and make it easy to return. **Hold back the discount.** Many people come back without one. If you use a discount at all, keep it for new customers, in the last email, and never bigger than your public offer.

Add SMS only with clear consent, an opt-out on every message, and quiet hours respected.

## Fix 5: measure the right thing

Track checkout completion rate and recovered revenue from your reminder flows each week. Watch profit too: a recovery flow that gives every returning shopper a big discount can cost more than it brings in.

## Related guides

- [The email flows every store needs](/guides/email-flows-every-store-needs)
- [How to increase your e-commerce conversion rate](/guides/how-to-increase-ecommerce-conversion-rate)

Helix finds missing reminder flows, drafts them in your brand voice and sets them up after you approve. See [email automation](/features/email-automation).
`,
  },
  {
    slug: "ecommerce-seo-basics",
    title: "E-commerce SEO Basics for Store Owners",
    description: "E-commerce SEO basics in plain English: keyword research, product and collection pages, site structure, speed, structured data, content and how AI search finds stores.",
    h1: "E-commerce SEO basics for store owners",
    published: D, updated: D, features: ["store-audit", "daily-growth-plan"],
    body: `
Search engine optimisation (SEO) is how your store earns free visits from Google, Bing and, increasingly, AI assistants. It is slower than ads, but the visits keep coming once you have earned them. Here are the basics that matter most for an online store.

## 1. Know what your customers type

Start with the words customers use, not your internal product names. Look at:

- Google's autocomplete and the "People also ask" box for your product type.
- The search terms report in Google Ads, if you run them.
- Google Search Console, once your store is verified, which shows the searches you already appear for.
- Your customer emails and reviews.

Group the terms by intent. "Buy linen sheets queen" is ready to buy and belongs on a product or collection page. "How to wash linen sheets" is research and belongs in a guide.

## 2. Make collection pages work hard

Collection (category) pages often rank best for broad shopping terms. Give each one:

- A clear title tag and H1 that use the main term naturally.
- A short, useful introduction above or below the products.
- Links to related collections and guides.

## 3. Write real product pages

- Unique descriptions, not the manufacturer's copy.
- A title tag that includes the product type and a key attribute.
- Descriptive image file names and alt text that say what the image shows.
- Reviews on the page, which add fresh, relevant words over time.

## 4. Keep the structure simple

Every product should be reachable within a few clicks of the home page. Use a short main menu, breadcrumbs, and internal links from guides to the relevant products and collections. Avoid creating many near-identical pages through filters and tags.

## 5. Technical basics

- **Sitemap:** submit your sitemap in Google Search Console and Bing Webmaster Tools.
- **Canonical tags:** make sure product variants point to one main URL.
- **Speed:** compress images, remove unused apps and scripts, and test on mobile.
- **Structured data:** product, review and breadcrumb markup helps search engines understand the page. Most modern themes include some; check with Google's Rich Results Test.
- **robots.txt:** do not accidentally block pages you want found.

## 6. Content that answers questions

Guides, size charts, care instructions and comparisons answer the questions people ask before they buy. They earn links and visits, and they give you something useful to send in emails.

## 7. AI search

AI assistants such as ChatGPT, Perplexity, Gemini and Copilot summarise web pages to answer questions. To be included, make your pages easy to read and quote: clear headings, direct answers near the top, honest facts, and structured data. Do not block their crawlers in robots.txt unless you mean to.

## 8. Be patient and consistent

SEO usually takes months, not days. Improve a few pages each week and check Search Console monthly to see which pages are gaining impressions.

## Related

- [Shopify growth checklist](/guides/shopify-growth-checklist)
- [How to increase your e-commerce conversion rate](/guides/how-to-increase-ecommerce-conversion-rate)

The Helix Playbook includes step-by-step lessons on store setup and content. See the [daily growth plan](/features/daily-growth-plan).
`,
  },
  {
    slug: "break-even-roas-explained",
    title: "Break-even ROAS Explained: How Much Can You Pay for a Sale?",
    description: "How to work out your break-even ROAS and break-even cost per sale, so you know when your Facebook, Instagram or Google ads are profitable and when to scale or stop.",
    h1: "Break-even ROAS: how much can you afford to pay for a sale?",
    published: D, updated: D, features: ["profit-dashboard", "meta-ads"],
    body: `
ROAS means return on ad spend: how many dollars of sales you get for each $1 of ads. A ROAS of 3 means $3 of sales for every $1 spent. On its own it tells you very little. What matters is whether that ROAS is above or below your **break-even**.

## The idea in one sentence

Your break-even cost per sale is the most you can spend on ads to get one order and still not lose money on it.

## Step 1: work out what you keep from an average order

Start with your average order value (AOV). Then subtract every cost that comes with an order, except ads:

- Product cost (what you paid for the goods)
- Shipping and packaging you pay
- Payment fees
- Any app or platform fees charged per order
- An allowance for returns

What is left is your **contribution per order before ads**.

## Step 2: that is your break-even cost per sale

If you spend exactly that amount on ads to win the order, you make zero profit on it. Spend less and you profit; spend more and you lose money on the first order.

## Step 3: turn it into break-even ROAS

Break-even ROAS = average order value ÷ break-even cost per sale.

**A worked example with made-up numbers:** a store with an AOV of $80 whose product, shipping, fees and returns add up to $48 keeps $32 before ads. Its break-even cost per sale is $32, and its break-even ROAS is 80 ÷ 32 = 2.5. Any campaign running below a ROAS of 2.5 is losing money on the first order.

## Why it changes how you run ads

- **Scale** campaigns that run comfortably under your break-even cost per sale.
- **Give new tests a fair chance.** Ad platforms need enough sales to learn. Set a test budget you can afford at your break-even, and do not judge it after one or two days.
- **Stop or fix** campaigns that stay above break-even after a fair test.

## What about repeat customers?

If customers come back and buy again, you may choose to pay more than first-order break-even to win them. Do this deliberately, once you know your returning customer rate from real data. Until then, aim to profit on the first order.

## Raise the line instead of chasing cheaper clicks

You can raise your break-even by increasing average order value (bundles, a free-shipping threshold), lowering product or shipping costs, or reducing returns. Each one gives your ads more room.

## How Helix helps

The Helix [profit dashboard](/features/profit-dashboard) works out your break-even cost per sale from your own numbers and shows it next to your actual ad cost per sale every morning. With [Meta ads](/features/meta-ads) connected, every test is graded against it.

Related: [how to scale a DTC brand profitably](/guides/how-to-scale-a-dtc-brand-profitably).
`,
  },
  {
    slug: "email-flows-every-store-needs",
    title: "The E-commerce Email Flows Every Store Needs",
    description: "The automated email and SMS flows that drive repeat sales for online stores: welcome, abandoned checkout and cart, browse, post-purchase, reviews, replenishment, win-back and VIP.",
    h1: "The email flows every online store needs",
    published: D, updated: D, features: ["email-automation"],
    body: `
Automated email flows send the right message when a shopper does something, such as joining your list or leaving a checkout. Set them up once and they work every day. They are also the foundation of retention: getting customers to buy a second and third time.

Here are the core flows, roughly in the order to build them.

## 1. Welcome series

**Trigger:** someone joins your list. **Goal:** turn a new subscriber into a first-time buyer.

Send three to six emails over one to two weeks: say hello and deliver anything you promised, tell your story, show best sellers and reviews, and answer the usual objections. New subscribers are most interested right after they sign up.

## 2. Abandoned checkout

**Trigger:** started checkout, no order within about an hour. **Goal:** recover high-intent shoppers.

Two or three emails. Remind, reassure (delivery, returns, reviews), then a final nudge. Keep any discount for the last email and for new customers only.

## 3. Abandoned cart

**Trigger:** added to cart, did not start checkout within a couple of hours. Similar to abandoned checkout, a little softer.

## 4. Browse abandonment

**Trigger:** a known subscriber viewed a product more than once without adding it. **Goal:** help undecided shoppers choose. One or two helpful emails with the product and similar options.

## 5. Post-purchase

**Trigger:** first order placed. **Goal:** reduce buyer's remorse and returns, and set up the second order. Thank them, explain what happens next, and share how to get the best from the product.

## 6. Review request

**Trigger:** delivered, plus enough days for the product to show results. **Goal:** reviews, photos and user content you can use on product pages and in ads.

## 7. Replenishment

**Trigger:** the typical usage period for a consumable, for example around 25 days for a 30-day supply. **Goal:** win the reorder before they run out. Only for products people use up.

## 8. Win-back

**Trigger:** no order for about one and a half to two times your typical repeat interval. **Goal:** re-engage lapsed customers before they are gone.

## 9. VIP and loyalty

**Trigger:** a third order, or lifetime spend in your top group. **Goal:** recognise and keep your best customers, with early access rather than deep discounts.

## Rules that protect your profit and your list

- Discounts follow clear offer rules and are never bigger than your public offer.
- SMS only with consent, an opt-out on every message, and quiet hours respected.
- Watch revenue per recipient, unsubscribe and spam rates, and test subject lines and timing.

## Related

- [How to reduce cart abandonment](/guides/how-to-reduce-cart-abandonment)
- [Shopify growth checklist](/guides/shopify-growth-checklist)

Helix finds missing flows, drafts them in your brand voice and sets them up only after you approve. See [email automation](/features/email-automation).
`,
  },
  {
    slug: "how-to-scale-a-dtc-brand-profitably",
    title: "How to Scale a DTC Brand Profitably and Increase Online Sales",
    description: "How direct-to-consumer brands grow online sales without losing money: know your numbers, test creative, fix conversion, build retention, and scale ads against break-even.",
    h1: "How to scale a DTC brand profitably",
    published: D, updated: D, features: ["daily-growth-plan", "profit-dashboard", "meta-ads"],
    body: `
Growing sales is not hard if you are willing to lose money. Growing profit is. This guide covers how direct-to-consumer (DTC) brands increase online sales while keeping more of every dollar.

## Growth comes from three places

1. **Attract:** bring the right people to the store with ads, creative, content and social.
2. **Convert:** turn visits into sales with a strong offer, a trusted store, a smooth checkout and follow-up emails.
3. **Grow:** keep more of every sale and scale it: margin, order value, returning customers and team.

Most stores are strong in one and weak in another. Find the weakest and work there first.

## Step 1: know your numbers every day

You need four numbers before you scale: profit per order, break-even cost per sale, average order value and returning customer rate. Check profit daily. See [break-even ROAS explained](/guides/break-even-roas-explained).

## Step 2: fix conversion before you buy more traffic

Doubling ad spend into a store that converts poorly doubles the waste. Work through [how to increase your e-commerce conversion rate](/guides/how-to-increase-ecommerce-conversion-rate) first.

## Step 3: build the retention base

Set up the [core email flows](/guides/email-flows-every-store-needs) and grow your list. Returning customers cost far less to reach than new ones, and they make paid acquisition more forgiving.

## Step 4: make creative your main lever

On Meta and similar platforms, the creative now does much of the targeting. Keep a steady pipeline:

- Mine reviews and customer emails for the words people use.
- Write many openings for the first few seconds of a video.
- Test a handful at a time, keep the winners, retire the rest.
- Brief real customers or creators for authentic video.

## Step 5: scale in steps, against break-even

Increase budgets on campaigns that run comfortably under break-even in steady steps, and watch cost per sale after each change. If it rises above break-even and stays there, step back. Give new tests enough budget and time to learn.

## Step 6: raise average order value

Bundles, add-ons, a free-shipping threshold above your average order and gift sets lift order value without discounting your margin. Every dollar of extra order value gives your ads more room.

## Step 7: plan the big seasons early

Black Friday and Christmas can make or break the year. Plan the offer and the list weeks ahead. See the [Black Friday plan](/features/black-friday-plan).

## Step 8: build a team rhythm

As you grow, write down what works as simple playbooks, hold a short weekly meeting on the numbers, and hand repeatable work to others.

## Small gains, every day

The stores that win usually do the basics well, consistently. Helix is built on that idea: a [daily growth plan](/features/daily-growth-plan) with one task a day and a [profit dashboard](/features/profit-dashboard) that shows whether it worked.
`,
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
