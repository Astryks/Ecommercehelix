# Module 10: Google ads in practice

**Outcome:** a clean Google setup that shows your products to people already searching for them, at a profit. You can look after it once a week.

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

## Lesson 10.1: Find your way around Google Ads
<!-- stage:attract -->

**Why this matters:** Google Ads hides a lot behind menus. You only need a few screens: campaigns, search terms, conversions and recommendations.

**The parts that matter:** the **account picker** is at the top. The left menu has **Campaigns**, **Goals** (conversions), **Insights and reports** (search terms), **Tools** and **Billing**. The **date range** is at the top right. The table shows **Cost**, **Conversions** and conversion value per cost (this is ROAS). In the **Status** column, **Eligible** means running. **Limited** means held back by budget or bids.

**Step 1.** Open ads.google.com and check the account name and ID (top of the page) is your store's account.

**Expected result:** You are in the right account.

**Step 2.** Click **Campaigns** in the left menu and set the date range (top right) to **Last 7 days**.

**Expected result:** The table shows last week's campaigns.

**Step 3.** Show sales value in your table.

1. Click **Columns** (the bars icon above the table).
2. Add **Conv. value** and **Conv. value / cost**.
3. Click **Apply**.

**Expected result:** You can see sales and ROAS for each campaign.

**Step 4.** Click **Insights and reports > Search terms** to see what people typed before clicking your ads.

**Expected result:** You know where to find wasted searches each week.

**Watch out:** Google moves menus often. If you cannot find a page, use the search box at the top of Google Ads. Type its name, for example "search terms".

## Lesson 10.2: Foundations
<!-- stage:attract -->

**Why this matters:** A clean Google foundation means every dollar is tracked and nothing changes without you. Do this once before you spend money, tick each step, and recheck tracking monthly.

**Step 1.** In Google Ads, open **Admin > Access and security**. Check that you (not an agency) are an admin owner of the account.

**Expected result:** Your own email is listed with Admin access. If an agency owns it, ask them in writing to transfer ownership to you.

**Step 2.** In Shopify, install the **Google & YouTube** app. Connect your Google Ads account and Merchant Center (where Google keeps your product list, called a feed).

**Expected result:** The app shows both accounts connected and products syncing.

**Step 3.** Tell Google that a purchase is the only thing that counts.

1. In Google Ads, click **Goals**, then **Conversions**, then **Summary**.
2. Make **Purchase** the only **Primary** (main) action. Set the others to **Secondary**.
3. Turn on **Enhanced conversions**. It sends scrambled customer details so Google can match more sales.

**Expected result:** Only Purchase is marked Primary, and enhanced conversions show "Active".

**Watch out:** Check this monthly. Other actions such as page views sometimes become primary and inflate results.

**Step 4.** Connect Google Analytics 4 (GA4) to Shopify and Google Ads.

1. In Shopify's **Google & YouTube** app, connect GA4.
2. In Google Ads, click **Tools**, then **Data manager**, then **+ Connect product**.
3. Choose **Google Analytics (GA4) & Firebase** and pick your GA4 property.

**Expected result:** GA4 shows purchases, and Google Ads lists GA4 as linked (see [Google: link Google Ads and Analytics](https://support.google.com/google-ads/answer/7519537)).

**Step 5.** In **Tools > Shared library > Audience manager**, build site visitors, buyers and your email list (customer match).

**Expected result:** Three audiences show in Audience manager.

**Watch out:** Google only accepts customer lists from accounts with a good policy and payment history. Some uses also need more ad spend (see [Google: Customer Match policy](https://support.google.com/adspolicy/answer/6299717)).

**Step 6.** In Google Ads open **Recommendations**, click **Auto-apply** (top right) and untick every auto-applied recommendation.

**Expected result:** Google cannot change your campaigns without your click.

**Step 7.** Rename each campaign with the pattern from Lesson 7.7. Click the campaign name, then the pencil next to it.

**Expected result:** Every campaign name shows its number, type and job.

## Lesson 10.3: Product data
<!-- stage:attract -->

**Why this matters:** Shopping ads are built from your product feed. Better product data means better ads and cheaper clicks. Most gains come from titles, images and fixing errors.

**Step 1.** Rewrite product titles with search words first: brand, product type, then main feature. For example: "Helix Linen Shirt, Men's, Relaxed Fit, Sand". Put the most important words in the first 70 characters, because Google often shows only about 70.

**Expected result:** Your top 20 products have search-first titles.

**Step 2.** Use a clean main image of the product only, on a plain background.

**Expected result:** Main images show the product clearly with no text or logos over it.

**Step 3.** Check prices and shipping in the feed match your site. Add GTINs (barcode numbers) where you have them.

**Expected result:** Merchant Center shows no price or shipping mismatches.

**Step 4.** Add custom labels (your own tags) such as margin level, best seller or season.

**Expected result:** Products can be grouped and bid on by label.

**Step 5.** In Merchant Center open **Products**, then the **Needs attention** tab, and fix every issue.

**Expected result:** The **Needs attention** tab shows no errors.

## Lesson 10.4: Launch your first Google campaign in 45 minutes
<!-- stage:attract -->

**Why this matters:** Google Ads tries to rush new owners into a guided "smart" campaign. It spends money in places you cannot see. This lesson skips that. It sets up the two campaigns most Shopify stores should start with. One is brand search, which is cheap and protects your name. The other is Performance Max fed by your products. Helix does not connect to Google Ads yet, so you follow these steps yourself.

**Words you will see:** **Merchant Center** holds your product list (the **feed**). **Performance Max** (PMax) shows your products across Shopping, Search, YouTube and Gmail. **Conversion** means a purchase Google can count. **Impression share** is how often your ad shows when someone searches your name.

**Step 1.** Make your Google Ads account without a campaign.

1. Go to ads.google.com and click **Start now**.
2. When it asks you to make a campaign, look for a small link near the bottom. It says **Switch to Expert Mode** or **Create an account without a campaign**.
3. Click it.

**Expected result:** You are creating an account, not a campaign.

**Step 2.** Choose your country, time zone and currency carefully. Untick strategist calls and promo emails, then click **Submit** or **Continue**.

**Expected result:** The account is created. Time zone and currency cannot be changed later, so double-check them first (see [Google: time zone and currency](https://support.google.com/google-ads/answer/9842104)).

**Step 3.** Add a payment method under **Billing** (the menu on the left, or the tools icon on older screens).

**Expected result:** Billing shows a saved card or bank account.

**Step 4.** Connect Shopify to Google.

1. In Shopify, click **Apps** and search for **Google & YouTube**.
2. Click **Install**.
3. Click **Get started**.
4. Connect your Google account.
5. Connect Merchant Center.
6. Connect Google Ads.
7. If it offers to make a campaign, click skip.

**Expected result:** The app shows green ticks for your accounts, products syncing, **Conversion measurement** and **Conversion event settings**.

**Step 5.** Check purchases are what Google aims for.

1. In Google Ads, click **Goals**, then **Conversions**, then **Summary**.
2. Click **Edit goal** on Purchases. Check it says **Primary**.
3. Set page view and add to cart to **Secondary**.
4. Click **Save**.

**Expected result:** Only Purchase counts as a result, so Google optimises for sales.

**Step 6.** Build brand search: click **+ Create > Campaign** and choose **Sales** with the **Purchase** goal. Then pick **Search** and name it "01-Search-Brand".

**Expected result:** A new Search campaign is open.

**Step 7.** Set the bidding.

1. Under **Bidding**, choose **Target impression share**.
2. Set **Anywhere on results page** to 90%.
3. Set **Maximum CPC bid limit** (the most you pay for one click) to $0.50 to $1.

**Expected result:** Your ad shows for most searches of your name at a capped cost per click.

**Step 8.** Choose where the ads show.

1. Under **Networks**, untick **Search partners** and **Display Network**.
2. Under **Locations**, add the countries you ship to.
3. Open **Location options** and choose **Presence** (people who are in those places).

**Expected result:** The campaign runs only on Google search, for people where you ship.

**Step 9.** Add keywords and an ad, then publish.

1. Add your brand name as keywords, typed both ways: `[your brand]` and `"your brand"`. Add common misspellings too.
2. Write one ad with 10 to 15 short headlines and 4 descriptions.
3. Set the daily budget to $5 to $10.
4. Click **Publish campaign**.

**Expected result:** Brand search is live with status "Eligible" (it may say "Under review" for a few hours).

**Step 10.** Build a Performance Max campaign (Google's all-in-one shopping campaign).

1. Click **+ Create**, then **Campaign**.
2. Choose **Sales**, then **Performance Max**.
3. Pick your Merchant Center product feed.
4. Under **Bidding**, choose **Conversion value**. Leave the target empty for now.
5. Set a daily budget inside your marketing guide (Lesson 1.9).

**Expected result:** A Performance Max campaign is connected to your products with a budget.

**Step 11.** In the asset group, remove extra headlines, images, videos and sitelinks where Google lets you. Click **Edit**, then the **x** next to each. In campaign settings, add your brand name under **Brand exclusions**. Click **Publish campaign**.

**Expected result:** Performance Max runs mainly from your product feed and leaves brand searches to the brand campaign.

**Step 12.** Leave both campaigns for 7 days. Then compare spend, purchases and ROAS (sales for each $1 of ads) with your break-even ROAS from your profit setup.

**Expected result:** You know whether each campaign is above or below break-even, and Lesson 10.10 shows what to change.

**Watch out:** Google often suggests "recommendations" that raise budgets or add broad keywords. Do not apply them without reading each one, and keep auto-apply off (Lesson 10.2).

## Lesson 10.5: Campaign structures
<!-- stage:attract -->

**Why this matters:** The right Google setup depends on your size. Starting simple, then adding campaigns as you grow, keeps each campaign fed with enough data.

**Step 1.** If you are small, run brand search plus one Shopping campaign or feed-only Performance Max. In Performance Max (PMax), Google decides where to show your products across Search, Shopping, YouTube, Gmail and more.

**Expected result:** You have two campaigns: brand search and a product campaign.

**Step 2.** In the PMax campaign, give it only your product feed. Add no extra videos or images (that is what feed-only means). Leave out your brand name under **Brand exclusions**.

**Expected result:** PMax spends on new searches, while brand search covers your name.

**Step 3.** As you grow, add non-brand search for your top search words. Split PMax by best sellers or margin level.

**Expected result:** Bigger accounts have more control over where money goes.

**Step 4.** At larger scale, add new-customer campaigns, competitor search, Demand Gen and a campaign per country.

**Expected result:** Each campaign has one clear job.

**Watch out:** Standard Shopping gives more control over which searches you show for. Use it if PMax spends on searches you cannot control.

### Good to know

<!-- guide:google-1-performance-max -->
![Start a Performance Max campaign in Google Ads](../../public/guides/google-1-performance-max.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.* Official help: [Google: about Performance Max campaigns](https://support.google.com/google-ads/answer/10724817)
<!-- /guide:google-1-performance-max -->

## Lesson 10.6: Keyword research
<!-- stage:attract -->

**Why this matters:** Keywords are the search words you want your ads to show for. Buying words with clear intent bring buyers; vague words bring browsers.

**Step 1.** List buying words: "buy", "best", "price", or the product type plus a feature ("linen shirt men").

**Expected result:** You have 20 to 50 candidate keywords.

**Step 2.** In **Tools > Planning > Keyword Planner**, check monthly searches and competition for each.

**Expected result:** Each keyword has a volume and competition level.

**Step 3.** Group keywords by theme into small ad groups. A common rule of thumb is a handful of close keywords each.

**Expected result:** Each ad group is tightly themed.

**Step 4.** Make a shared list of negative keywords in **Tools > Shared library > Exclusion lists**, on the **Negative keyword lists** tab. These are words you never want to show for, like "free" or "jobs". Click **Apply to campaigns** and add the list to every campaign (see [Google: negative keyword lists](https://support.google.com/google-ads/answer/7449003)).

**Expected result:** Wasted searches are blocked across the account.

## Lesson 10.7: Writing search ads
<!-- stage:attract -->

**Why this matters:** Search ads are short, so every line has to earn its place. Mixing benefit, offer, proof and urgency lets Google find the best combination.

**Step 1.** Write up to 15 headlines. Mix product plus benefit, the offer, proof (reviews, years in business), urgency and your brand. Pin 1 or 2 only if they must always show.

**Expected result:** The ad strength meter shows "Good" or "Excellent".

**Watch out:** Pinning lowers ad strength, so pin as little as you can (see [Google: ad strength](https://support.google.com/google-ads/answer/9921843)).

**Step 2.** Write descriptions with reasons to buy, shipping and returns, and a call to action.

**Expected result:** Each description answers "why here, why now".

**Step 3.** Add extras: sitelinks to your best collections and callouts like "Free shipping". Add structured snippets (lists like styles or types) and images.

**Expected result:** Your ad takes more space on the results page.

## Lesson 10.8: Target ROAS
<!-- stage:grow -->

**Why this matters:** Target ROAS tells Google how many dollars of sales you want for each $1 of ads. Set it from your break-even, not a guess, and change it gently.

**Step 1.** Work out break-even ROAS: 1 divided by (1 minus VCR, your order costs as a share of sales). With VCR at 45%, that is about 1.82.

**Expected result:** You have your break-even ROAS.

<!-- do:metrics -->

**Step 2.** In the campaign's **Bidding** settings, set target ROAS above break-even with room for profit. For example, 2.4 if break-even is 1.82.

**Expected result:** Google bids to a target that leaves profit.

**Step 3.** Change targets in small steps, about 10% at a time (a common rule of thumb). Wait a week or two before the next change.

**Expected result:** Bidding stays stable while you tune it.

## Lesson 10.9: New customer acquisition
<!-- stage:attract -->

**Why this matters:** New customers grow the store; repeat customers are cheaper to reach in other ways. Google can bid more for new customers or show ads only to them.

**Step 1.** Upload your customer list in **Audience manager > Your data segments**.

**Expected result:** Google knows who has already bought.

**Step 2.** Open the campaign's **Customer acquisition** setting. Choose to bid higher for new customers than existing ones, or to only bid for new customers.

**Expected result:** The campaign favours new buyers. Bidding higher needs value-based bidding (target ROAS or maximise conversion value) and a Purchase goal (see [Google: customer lifecycle goals](https://support.google.com/google-ads/answer/12080169)).

**Watch out:** Accept a lower ROAS on new-customer campaigns only if those customers come back and buy again.

## Lesson 10.10: Weekly optimisation
<!-- stage:attract -->

**Why this matters:** Ten to twenty minutes once a week keeps Google profitable. Most waste hides in the search terms report.

**Step 1.** Clean up your searches once a week.

1. Open **Insights and reports**, then **Search terms**.
2. Tick searches that cost money but never sell. Click **Add as negative keyword**.
3. Tick searches that sell well. Click **Add as keyword**.

**Expected result:** Wasted searches are blocked and winners are targeted directly.

**Step 2.** Check **Performance Max insights** for which products, searches and assets do well.

**Expected result:** You know your top Performance Max products and themes.

**Watch out:** Performance Max now has its own search terms and channel reports. It also accepts negative keywords, so block junk there too (see [Google: more control in Performance Max](https://support.google.com/google-ads/answer/16451273)).

**Step 3.** Look for campaigns marked "Limited by budget"; if they hit your target, raise the budget by about 20%.

**Expected result:** Profitable campaigns are not held back.

**Step 4.** Compare brand and non-brand spend. Then fix any new issues in Merchant Center under **Products > Needs attention**.

**Expected result:** You know how much spend finds new searchers, and the feed is clean.

### Good to know

<!-- guide:google-2-block-wasted-searches -->
![Block searches that waste money](../../public/guides/google-2-block-wasted-searches.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.* Official help: [Google: search terms report](https://support.google.com/google-ads/answer/2472708)
<!-- /guide:google-2-block-wasted-searches -->

## Lesson 10.11: Demand Gen and YouTube
<!-- stage:attract -->

**Why this matters:** Demand Gen campaigns show videos and images on YouTube (including Shorts) and Discover (the Google app feed). They also show on Gmail and the Display Network (see [Google: about Demand Gen](https://support.google.com/google-ads/answer/13695777)). Your best social videos often work here with little change.

**Step 1.** Export your 3 best social videos in both vertical and horizontal versions.

**Expected result:** You have Demand Gen-ready video files.

**Step 2.** Create a Demand Gen campaign with those videos, aimed at your buyer and visitor audiences plus lookalikes.

**Expected result:** The campaign is live with proven creative.

**Step 3.** Judge it by view-through results: people who saw the ad and bought later. Also check your total MER on the Dashboard (total ad spend as a share of total sales).

**Expected result:** You judge it on the whole-store effect, not clicks alone.

<!-- do:growth -->

## Lesson 10.12: Seasonality and sales
<!-- stage:attract -->

**Why this matters:** Big sales change shopper behaviour overnight, and Google's bidding needs a nudge to keep up. Three settings make the difference.

**Step 1.** Tell Google a sale is coming.

1. Click **Tools**, then **Budgets and bidding**, then **Adjustments**, then the **Seasonal** tab (older screens say **Seasonality adjustments**).
2. Add a new adjustment and set its dates to cover the sale. It works best for short sales of 1 to 7 days.
3. Set the expected conversion rate change to what you saw in past sales. Google's own example is up to +50% for a 3-day sale.
4. Save it. When the dates end, Google goes back to normal by itself (see [Google: seasonality adjustments](https://support.google.com/google-ads/answer/10369906)).

**Expected result:** The adjustment shows as scheduled for the sale dates.

**Step 2.** Add promotion assets and sale prices to your product feed.

**Expected result:** Shopping ads show the sale price.

**Step 3.** Raise budgets slowly in the week before the event.

**Expected result:** Campaigns are not short of money when the sale starts.

<!-- do:bfcm -->

## Lesson 10.13: AI-driven changes in 2026
<!-- stage:attract -->

**Why this matters:** In 2026 Google turns on more AI features by itself. These include AI Max for Search and Shopping, and AI-written ad text. Google may also pick the landing page and show ads in AI Mode answers. From September 2026, Google began moving some Search campaigns to AI Max automatically (see [Google: DSA upgrade to AI Max](https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/)). These features can help, but only if you check what they do.

**Step 1.** Open **Campaigns** and review any campaign Google upgraded automatically.

**Expected result:** You know which campaigns now use AI features.

**Step 2.** Read the AI-written ad text and check every page it sends people to.

**Expected result:** Ads say only what you are happy with and land on the right pages.

**Step 3.** Check your brand exclusions are still in place. Check search terms and negatives twice a week instead of once.

**Expected result:** AI expansion does not spend on your brand or on junk searches.

## Lesson 10.14: Google 101 (start here if you have never run a Google ad)
<!-- stage:attract -->

**Why this matters:** On Google, many people are already **searching** for what you sell. On Meta and TikTok, people are **scrolling** and you catch their eye. Google ads meet buyers at the moment they look. This lesson explains the main types, then walks you through your first one.

**Step 1.** Learn the four main types. **Search** shows text ads on Google results. **Shopping** shows product photos with prices. **Performance Max** runs one campaign across all of Google. **Demand Gen** shows picture and video ads on YouTube, Discover and Gmail (see [Google Ads: choose a campaign type](https://support.google.com/google-ads/answer/2567043)).

**Expected result:** You can name the four types and where each one shows.

<details><summary>More detail: searching vs scrolling</summary>

| Type | People are... | Good for |
|---|---|---|
| Search | Typing what they want | Catching ready buyers |
| Shopping | Comparing products and prices | Stores with clear product photos |
| Performance Max | Anywhere on Google | Letting Google find buyers across all places |
| Demand Gen / YouTube | Watching and scrolling | Making new people want your product |

Shopping needs a Google Merchant Center account with your products in it. Performance Max can use the same product data. Demand Gen covers YouTube, including Shorts, plus Discover, Gmail and the Display Network ([Google Ads: about Demand Gen](https://support.google.com/google-ads/answer/13695777)).
</details>

**Step 2.** Learn what a small store should start with. Start with **Shopping or Performance Max** using your product feed. Add a small **Search** campaign for your brand name and your main product words. Leave YouTube and Demand Gen until sales are steady.

**Expected result:** You know your first Google campaign is about people already looking to buy.

**Step 3.** Before you start, tick off this list. Your store is live. You have a Google account. Your products are in Google Merchant Center with no errors. The Google tag tracks purchases.

**Expected result:** Every box is ticked. If not, the Google lessons in Module 10 show how.

<details><summary>More detail: accounts, tag and payment</summary>

- **Google Ads account:** sign up with your business name and website. You can skip the guided campaign and make the account first ([Google Ads: create an account](https://support.google.com/google-ads/answer/6366720)).
- **Time zone:** pick it carefully. Reports and billing use it.
- **Payment:** add a card, PayPal or bank. Google may hold a small temporary charge to check the card.
- **Tag and feed:** connect them through the Google & YouTube app in Shopify. See Lessons 10.1 to 10.3.
</details>

**Step 4.** In Google Ads, open **New campaign**. Pick the **Sales** goal.

**Expected result:** The campaign type screen opens. Menus change often, so look for the same words if the screen looks different.

**Step 5.** Pick **Performance Max** (or **Shopping**) and link your Merchant Center account.

**Expected result:** Your products show as linked to the new campaign.

**Step 6.** Name it with a date and type, like "2026-11 Performance Max All Products". Set a daily budget you are happy to lose while learning, like $20 a day.

**Expected result:** The campaign has a clear name and a small daily budget.

**Step 7.** Pick **Maximise conversion value** for bidding. Leave the target return on ad spend empty for now.

**Expected result:** Google will aim for the most sales value within your budget.

**Step 8.** Add your best product photos, your logo, 5 short headlines and 2 descriptions. Check the final link goes to your store.

**Expected result:** The ad strength shows Good or better and the preview looks right.

**Step 9.** Click **Publish campaign**. Then leave it alone for 1 to 2 weeks while Google learns.

**Expected result:** The campaign is live. You check daily that it spends, but you do not change it.

<details><summary>More detail: after you launch</summary>

- **First 24 to 72 hours:** check the campaign is approved and spending. Check Merchant Center has no new errors.
- **Do not** change the budget or bidding in the first 2 weeks. Each change restarts learning.
- **Common first-time mistakes:** leaving the guided setup on Smart or Display by accident, no purchase tracking, Merchant Center errors, too many changes too soon, and paying for clicks on your own brand only.
</details>

**Step 10.** Stuck? Search YouTube for "Google Ads tutorial for beginners 2026" or "Performance Max for Shopify setup 2026". Pick videos from the last 6 months, because menus change.

**Expected result:** You find a recent video that matches your screen. If not, try a newer one.

**Watch out:** Take a screenshot of where you are stuck. Ask the Helix coach or another AI assistant "what do I click next?" and share it. **Next:** the full Google setup in Module 10, starting with Lesson 10.1.

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
