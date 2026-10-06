# Module 8: Google ads in practice

**Outcome:** a clean Google setup that shows your products to people already searching for them, at a profit, and that you can look after once a week.

**Related SOP:** [09 Google Shopping, PMax and Search](../sops/09-google-shopping-pmax-search.md)


<!-- plain:start -->
> **In plain words**
>
> **Stage:** Attract (get seen by people who want what you sell). Every lesson below is tagged with its stage; see [Attract, Convert, Grow](stages.md).
>
> **What it is:** How to show your products on Google when people search for them.
>
> **Why it matters:** People on Google are already looking to buy. It catches demand your other ads create.
>
> **Do this:**
>
> 1. Connect your product list (Merchant Center).
> 2. Start a Performance Max campaign and exclude your brand name.
> 3. Once a week, block searches that cost money and never sell.
>
> **Words to know:**
>
> - **PMax:** A Google campaign type that shows your products across Search, Shopping, YouTube and more from one campaign.
> - **Product feed:** The list of your products, prices and photos that Google and Meta read to make shopping ads.
> - **Search terms:** The exact words people typed into Google before they saw or clicked your ad.
> - **Negative keyword:** A word you tell Google never to show your ads for, to stop wasted clicks.
>
> All words are explained in the [glossary](../glossary.md).
<!-- plain:end -->

---

## Lesson 8.1: Foundations
<!-- stage:attract -->

**Why this matters:** A clean Google foundation means every dollar is tracked and nothing changes without you. Do this once before you spend money, tick each step, and recheck tracking monthly.

**Step 1.** In Google Ads open **Admin > Access and security** and confirm you (not an agency) are an admin owner of the account.

**Expected result:** Your own email is listed with Admin access. If an agency owns it, ask them in writing to transfer ownership to you.

**Step 2.** In Shopify install the **Google & YouTube** app and connect your Google Ads account and Merchant Center (where Google keeps your product list, called a feed).

**Expected result:** The app shows both accounts connected and products syncing.

**Step 3.** In Google Ads go to **Goals > Conversions > Summary** and make **Purchase** the only primary (main) conversion, then turn on **Enhanced conversions** (hashed customer details that match more sales).

**Expected result:** Only Purchase is marked Primary, and enhanced conversions show "Active".

**Watch out:** Check this monthly. Other actions such as page views sometimes become primary and inflate results.

**Step 4.** Set up Google Analytics 4 (GA4) with ecommerce events and link it to Google Ads under **Admin > Product links**.

**Expected result:** GA4 shows purchases, and Google Ads lists GA4 as linked.

**Step 5.** In **Tools > Shared library > Audience manager**, build site visitors, buyers and your email list (customer match).

**Expected result:** Three audiences show in Audience manager.

**Step 6.** In **Recommendations > Auto-apply**, turn off auto-applied recommendations, and name campaigns with the pattern from Lesson 6.7.

**Expected result:** Google cannot change campaigns without your click, and names are consistent.

## Lesson 8.2: Product data
<!-- stage:attract -->

**Why this matters:** Shopping ads are built from your product feed, so better product data means better ads and cheaper clicks. Most gains come from titles, images and fixing errors.

**Step 1.** Rewrite product titles with search words first: brand, product type, then key feature (for example "Acme Linen Shirt, Men's, Relaxed Fit, Sand").

**Expected result:** Your top 20 products have search-first titles.

**Step 2.** Use a clean main image of the product only, on a plain background.

**Expected result:** Main images show the product clearly with no text or logos over it.

**Step 3.** Check prices and shipping in the feed match your site, and add GTINs (barcode numbers) where you have them.

**Expected result:** Merchant Center shows no price or shipping mismatches.

**Step 4.** Add custom labels (your own tags) such as margin level, best seller or season.

**Expected result:** Products can be grouped and bid on by label.

**Step 5.** In Merchant Center open **Products > Diagnostics** and fix every error.

**Expected result:** The diagnostics page shows zero errors.

## Lesson 8.3: Campaign structures
<!-- stage:attract -->

**Why this matters:** The right Google setup depends on your size. Starting simple, then adding campaigns as you grow, keeps each campaign fed with enough data.

**Step 1.** If you are small, run brand search plus one feed-only Performance Max (PMax: Google decides where to show your products across Search, Shopping, YouTube and Gmail) or Shopping campaign.

**Expected result:** You have two campaigns: brand search and a product campaign.

**Step 2.** In the PMax campaign, give it only your product feed (no extra videos or images, which is what feed-only means) and exclude your brand name under **Brand exclusions**.

**Expected result:** PMax spends on new searches, while brand search covers your name.

**Step 3.** As you grow, add non-brand search for your top search terms and split PMax by best sellers or margin level.

**Expected result:** Bigger accounts have more control over where money goes.

**Step 4.** At larger scale, add new-customer campaigns, competitor search, Demand Gen and a campaign per country.

**Expected result:** Each campaign has one clear job.

**Watch out:** Standard Shopping gives more control over which searches you show for. Use it if PMax spends on searches you cannot control.

### Good to know

<!-- guide:google-1-performance-max -->
![Start a Performance Max campaign in Google Ads](../../public/guides/google-1-performance-max.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.* Official help: [Google: about Performance Max campaigns](https://support.google.com/google-ads/answer/10724817)
<!-- /guide:google-1-performance-max -->

## Lesson 8.4: Keyword research
<!-- stage:attract -->

**Why this matters:** Keywords are the search words you want your ads to show for. Buying words with clear intent bring buyers; vague words bring browsers.

**Step 1.** List buying words: "buy", "best", "price", or the product type plus a feature ("linen shirt men").

**Expected result:** You have 20 to 50 candidate keywords.

**Step 2.** In **Tools > Keyword Planner**, check monthly searches and competition for each.

**Expected result:** Each keyword has a volume and competition level.

**Step 3.** Group keywords by theme into small ad groups of 5 keywords or fewer.

**Expected result:** Each ad group is tightly themed.

**Step 4.** Create a shared negative keyword list (words you never want to show for, like "free" or "jobs") in **Shared library > Negative keyword lists** and apply it to every campaign.

**Expected result:** Wasted searches are blocked across the account.

## Lesson 8.5: Writing search ads
<!-- stage:attract -->

**Why this matters:** Search ads are short, so every line has to earn its place. Mixing benefit, offer, proof and urgency lets Google find the best combination.

**Step 1.** Write up to 15 headlines mixing product plus benefit, the offer, proof (reviews, years in business), urgency and your brand, and pin 1 or 2 so they always show.

**Expected result:** The ad strength meter shows "Good" or "Excellent".

**Step 2.** Write descriptions with reasons to buy, shipping and returns, and a call to action.

**Expected result:** Each description answers "why here, why now".

**Step 3.** Add assets: sitelinks to your best collections, callouts like "Free shipping", structured snippets (lists like styles or types) and images.

**Expected result:** Your ad takes more space on the results page.

## Lesson 8.6: Target ROAS
<!-- stage:grow -->

**Why this matters:** Target ROAS tells Google how many dollars of sales you want for each $1 of ads. Set it from your break-even, not a guess, and change it gently.

**Step 1.** Work out break-even ROAS as 1 divided by (1 minus VCR); with VCR at 45% that is about 1.82.

**Expected result:** You have your break-even ROAS.

<!-- do:metrics -->

**Step 2.** In the campaign's **Bidding** settings, set target ROAS above break-even with room for profit (for example 2.4 if break-even is 1.82).

**Expected result:** Google bids to a target that leaves profit.

**Step 3.** Change targets in steps of about 10% at a time, and recheck results after each Google bidding update.

**Expected result:** Bidding stays stable while you tune it.

## Lesson 8.7: New customer acquisition
<!-- stage:attract -->

**Why this matters:** New customers grow the store; repeat customers are cheaper to reach in other ways. Google can bid more for new customers or show ads only to them.

**Step 1.** Upload your customer list in **Audience manager > Your data segments**.

**Expected result:** Google knows who has already bought.

**Step 2.** In the campaign's **Customer acquisition** setting, choose either "Bid higher for new customers" or "Only bid for new customers".

**Expected result:** The campaign favours new buyers.

**Watch out:** Accept a lower ROAS on new-customer campaigns only if those customers come back and buy again.

## Lesson 8.8: Weekly optimisation
<!-- stage:attract -->

**Why this matters:** Ten to twenty minutes once a week keeps Google profitable. Most waste hides in the search terms report.

**Step 1.** Open **Insights and reports > Search terms**, add searches that cost money and never sell as negative keywords, and add searches that sell well as keywords.

**Expected result:** Wasted searches are blocked and winners are targeted directly.

**Step 2.** Check **Performance Max insights** for which products, searches and assets do well.

**Expected result:** You know your top PMax products and themes.

**Step 3.** Look for campaigns marked "Limited by budget"; if they hit your target, raise the budget by about 20%.

**Expected result:** Profitable campaigns are not held back.

**Step 4.** Compare brand and non-brand spend, then fix any new errors in **Merchant Center > Diagnostics**.

**Expected result:** You know how much spend finds new searchers, and the feed is clean.

### Good to know

<!-- guide:google-2-block-wasted-searches -->
![Block searches that waste money](../../public/guides/google-2-block-wasted-searches.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.* Official help: [Google: search terms report](https://support.google.com/google-ads/answer/2472708)
<!-- /guide:google-2-block-wasted-searches -->

## Lesson 8.9: Demand Gen and YouTube
<!-- stage:attract -->

**Why this matters:** Demand Gen campaigns show short videos and images across YouTube, Discover (the Google app feed) and Gmail. Your best social videos often work here with little change.

**Step 1.** Export your 3 best social videos in both vertical and horizontal versions.

**Expected result:** You have Demand Gen-ready video files.

**Step 2.** Create a Demand Gen campaign with those videos, aimed at your buyer and visitor audiences plus lookalikes.

**Expected result:** The campaign is live with proven creative.

**Step 3.** Judge it by view-through results (people who saw the ad and bought later) and your total MER on the Dashboard.

**Expected result:** You judge it on the whole-store effect, not clicks alone.

<!-- do:growth -->

## Lesson 8.10: Seasonality and sales
<!-- stage:attract -->

**Why this matters:** Big sales change shopper behaviour overnight, and Google's bidding needs a nudge to keep up. Three settings make the difference.

**Step 1.** In **Tools > Bid strategies > Advanced controls**, add a seasonality adjustment for the first 1 to 2 days of the sale, expecting about 50% higher conversion rate, then remove it after.

**Expected result:** Google bids up for the sale's first days and returns to normal after.

**Step 2.** Add promotion assets and sale prices to your product feed.

**Expected result:** Shopping ads show the sale price.

**Step 3.** Raise budgets slowly in the week before the event.

**Expected result:** Campaigns are not short of money when the sale starts.

<!-- do:bfcm -->

## Lesson 8.11: AI-driven changes in 2026
<!-- stage:attract -->

**Why this matters:** In 2026 Google adds more AI features automatically: AI Max for Search and Shopping, AI-written ad text, final URL expansion (Google picks the landing page) and ads in AI Mode answers. They can help, but only if you check what they do.

**Step 1.** Open **Campaigns** and review any campaign Google upgraded automatically.

**Expected result:** You know which campaigns now use AI features.

**Step 2.** Read the AI-written ad text and check every page it sends people to.

**Expected result:** Ads say only what you are happy with and land on the right pages.

**Step 3.** Confirm your brand exclusions are still in place, and check search terms and negatives twice a week instead of once.

**Expected result:** AI expansion does not spend on your brand or on junk searches.

## Self-check

1. How many main (primary) conversions should you have?
2. What goes at the start of a Shopping product title?
3. VCR is 45%. What is break-even ROAS?
4. Name three weekly Google checks.

<details><summary>Answers</summary>

1. One: purchase.
2. The words people search: brand, product type, key feature.
3. 1 ÷ 0.55 = about 1.82.
4. Any three of: search terms, Performance Max insights, campaigns limited by budget, brand versus non-brand split, Merchant Center errors.
</details>
