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

**Step 3.** Tell Google that a purchase is the only thing that counts.

1. In Google Ads, click **Goals**, then **Conversions**, then **Summary**.
2. Make **Purchase** the only **Primary** (main) action. Set the others to **Secondary**.
3. Turn on **Enhanced conversions**. It sends scrambled customer details so Google can match more sales.

**Expected result:** Only Purchase is marked Primary, and enhanced conversions show "Active".

**Watch out:** Check this monthly. Other actions such as page views sometimes become primary and inflate results.

**Step 4.** In Shopify's **Google & YouTube** app, connect Google Analytics 4 (GA4), then in Google Ads open **Admin > Linked accounts** (sometimes **Product links**) and link GA4.

**Expected result:** GA4 shows purchases, and Google Ads lists GA4 as linked.

**Step 5.** In **Tools > Shared library > Audience manager**, build site visitors, buyers and your email list (customer match).

**Expected result:** Three audiences show in Audience manager.

**Step 6.** In Google Ads open **Recommendations**, click **Auto-apply** (top right) and untick every auto-applied recommendation.

**Expected result:** Google cannot change your campaigns without your click.

**Step 7.** Rename each campaign with the pattern from Lesson 6.7 (click the campaign name, then the pencil next to it).

**Expected result:** Every campaign name shows its number, type and job.

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

**Step 1.** Clean up your searches once a week.

1. Open **Insights and reports**, then **Search terms**.
2. Tick searches that cost money but never sell. Click **Add as negative keyword**.
3. Tick searches that sell well. Click **Add as keyword**.

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

**Step 3.** Judge it by view-through results (people who saw the ad and bought later) and your total MER (total ad spend as a share of total sales) on the Dashboard.

**Expected result:** You judge it on the whole-store effect, not clicks alone.

<!-- do:growth -->

## Lesson 8.10: Seasonality and sales
<!-- stage:attract -->

**Why this matters:** Big sales change shopper behaviour overnight, and Google's bidding needs a nudge to keep up. Three settings make the difference.

**Step 1.** Tell Google a sale is coming.

1. Open **Tools**, then **Bid strategies**, then **Advanced controls**.
2. Add a seasonality adjustment for the first 1 to 2 days of the sale.
3. Set the expected conversion rate change to about +50%.
4. After the sale, delete it.

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

## Lesson 8.12: Launch your first Google campaign in 45 minutes
<!-- stage:attract -->

**Why this matters:** Google Ads tries to rush new owners into a guided "smart" campaign that spends money in places you cannot see. This lesson skips that and sets up the two campaigns most Shopify stores should start with: brand search (cheap, protects your name) and Performance Max fed by your products. Helix does not connect to Google Ads yet, so you follow these steps yourself.

**Words you will see:** **Merchant Center** holds your product list (the **feed**). **Performance Max** (PMax) shows your products across Shopping, Search, YouTube and Gmail. **Conversion** means a purchase Google can count. **Impression share** is how often your ad shows when someone searches your name.

**Step 1.** Make your Google Ads account without a campaign.

1. Go to ads.google.com and click **Start now**.
2. When it asks you to make a campaign, look for a small link near the bottom: **Switch to Expert Mode** or **Create an account without a campaign**.
3. Click it.

**Expected result:** You are creating an account, not a campaign.

**Step 2.** Choose your country, time zone and currency carefully, untick personalised strategist calls and promotional emails, then click **Submit** or **Continue**.

**Expected result:** The account is created. Time zone and currency cannot be changed later, so double-check them first.

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

**Step 6.** Build brand search: click **+ Create > Campaign**, choose **Sales** with the **Purchase** goal, then **Search**, and name it "01-Search-Brand".

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

**Step 11.** In the asset group, remove extra headlines, images, videos and sitelinks where Google lets you (click **Edit**, then the **x** next to each), and in campaign settings add your brand name under **Brand exclusions**. Click **Publish campaign**.

**Expected result:** Performance Max runs mainly from your product feed and leaves brand searches to the brand campaign.

**Step 12.** Leave both campaigns for 7 days, then compare spend, purchases and ROAS (sales for each $1 of ads) with your break-even ROAS from your profit setup.

**Expected result:** You know whether each campaign is above or below break-even, and Lesson 8.8 shows what to change.

**Watch out:** Google often suggests "recommendations" that raise budgets or add broad keywords. Do not apply them without reading each one, and keep auto-apply off (Lesson 8.1).

## Lesson 8.13: Find your way around Google Ads
<!-- stage:attract -->

**Why this matters:** Google Ads hides a lot behind menus. You only need a few screens: campaigns, search terms, conversions and recommendations.

**The parts that matter:** the **account picker** (top), the left menu with **Campaigns**, **Goals** (conversions), **Insights and reports** (search terms), **Tools** and **Billing**; the **date range** (top right); the table with **Cost**, **Conversions**, **Conv. value** and **Conv. value / cost** (this is ROAS); and the **Status** column (**Eligible** means running, **Limited** means held back by budget or bids).

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

**Watch out:** Google moves menus often. If you cannot find a page, use the search box at the top of Google Ads and type its name (for example "search terms").

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
