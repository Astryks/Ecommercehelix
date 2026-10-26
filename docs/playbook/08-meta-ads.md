# Module 8: Meta ads in practice

**Outcome:** you can build and run a Meta (Facebook and Instagram) ad account in about 10 minutes a day. And you can spend more without breaking what works.

**Related SOPs:** [05 Meta structure and scaling](../sops/05-meta-structure-and-scaling.md), [06 Meta daily optimisation](../sops/06-meta-daily-optimisation.md), [07 Creative testing](../sops/07-creative-testing.md)


<!-- plain:start -->
> **In plain words**
>
> **Stage:** Attract (get seen by people who want what you sell). Every lesson below is tagged with its stage; see [Attract, Convert, Grow](stages.md).
>
> **What it is:** How to set up and run Facebook and Instagram ads in about 10 minutes a day.
>
> **Why it matters:** For most stores, Meta is where most new customers come from. Doing the basics well beats clever tricks.
>
> **Do this:**
>
> 1. Set up your pixel so Meta can see sales.
> 2. Start one Sales campaign with broad targeting and 3 ads.
> 3. Each day, check cost per sale against your target and act on the plain-English verdict in Helix.
>
> **Words to know:**
>
> - **Pixel:** A small piece of code on your store that tells Meta when someone views, adds to cart or buys.
> - **Advantage+:** Meta's automatic settings that let its system choose audience, placements or budget for you.
> - **Learning phase:** The days after you start or make a big change to an ad set. Meta is still working out who to show it to. It usually ends after about 50 results in the week after that change.
> - **CPA:** Cost per acquisition: how much ad money it took to get one sale.
>
> All words are explained in the [glossary](../glossary.md).
<!-- plain:end -->

---

## Lesson 8.1: Find your way around Ads Manager
<!-- stage:attract -->

**Why this matters:** Ads Manager looks busy, but you only use a handful of parts. Once you know what each one is for, it stops being scary. It becomes a simple table you check for 5 minutes a day.

![Find your way around Meta Ads Manager](../../public/guides/meta-0-ads-manager-map.svg)

**The parts that matter:**

1. **Ad account** (top left): make sure it shows your store's account.
2. **Campaigns, Ad sets, Ads** tabs: three levels, from big (the goal) to small (what people see). Ticking a campaign filters the other tabs to it.
3. **+ Create**: starts a new campaign.
4. **Columns**: chooses which numbers the table shows. Save a "Daily" preset (Lesson 8.2).
5. **On/Off switch**: blue means on and spending; grey means off.
6. **Delivery**: **Active** means running. **Learning** means Meta is still working out who buys. **Learning limited** means too few results to finish learning. **In review** means Meta is checking the ad. It can also say **Off**, or **Rejected** (click it to see why).
7. **Results** and **Cost per result**: for a Sales campaign, purchases and the cost of each purchase. **Amount spent** is what you paid. **ROAS** (return on ad spend) is sales divided by spend.
8. **Date range** (top right): set it to **Last 7 days** for daily checks.

**Step 1.** Open Ads Manager (adsmanager.facebook.com, or Meta Business Suite **> All tools > Ads Manager**). Check the ad account name at the top left.

**Expected result:** You are in your store's ad account.

**Step 2.** Set the date range at the top right to **Last 7 days**.

**Expected result:** The table shows the last week.

**Step 3.** Click **Columns** and choose your **Daily** preset (or **Performance** if you have not made one yet).

**Expected result:** You see Results, Cost per result, Amount spent and ROAS.

**Step 4.** Click the **Campaigns** tab, then click a campaign name to open it. Look at the three levels (campaign, ad set, ad), but do not change anything. Close it with **X** or **Close**.

**Expected result:** You know where the budget, the audience and the ads live.

**Watch out:** Your screen may look a little different, because Meta tests new layouts. Look for the same words: Create, Columns, Delivery, Results. If a menu is missing, try the three-line menu at the top left. Or search the help centre for its name.

## Lesson 8.2: Account setup checklist
<!-- stage:attract -->

**Why this matters:** Ten minutes of setup before you spend money stops the most costly Meta problems. These are lost sales tracking, hacked accounts and spending that runs away. Do it once, one step at a time, and check it again every quarter.

**Where things live:** **Ads Manager** (adsmanager.facebook.com) is where you build and watch ads. **Business Settings** (business.facebook.com/settings) is where people, security and payment live. **Events Manager** is where your pixel lives. If you land in **Meta Business Suite** instead, click **All tools** (the grid icon in the left menu). Then pick the tool by name.

**Step 1.** Go to business.facebook.com/settings and click **Users > People**, then **Invite people**. Invite a second person you trust with **Full control** (Meta's name for admin).

**Expected result:** **People** lists two people with full control.

**Watch out:** One admin is a single point of failure. If that person is locked out or hacked, you lose the account.

**Step 2.** In the same Business Settings, open **Security Centre**. Switch on **Two-factor authentication** for everyone: a code from your phone as well as a password.

**Expected result:** Security Centre shows two-factor required for all admins.

**Step 3.** Still in **Security Centre**, click **Start verification**. Enter your legal business name, address, phone and website, exactly as on your official records (see [Meta: verify your business](https://www.facebook.com/business/help/2058515294227817)).

**Expected result:** Verification shows "In review" or "Verified". If you see "Ineligible for verification" or no button, you do not need it yet. Skip it and come back later.

**Step 4.** Add the Facebook & Instagram sales channel in Shopify.

1. In Shopify, click **Settings**, then **Sales channels**.
2. Open the Shopify App Store and search for **Facebook & Instagram**.
3. Click to add it, then **Start set up**.
4. Click **Connect account** and log in with your Facebook account.
5. Connect your business, ad account, Page and pixel, then click **Finish setup**.

**Expected result:** **Facebook & Instagram** appears under **Sales channels**, with your business, ad account, Page and pixel connected. See [Shopify: set up Facebook & Instagram](https://help.shopify.com/en/manual/online-sales-channels/facebook-instagram-by-meta/setup).

<!-- do:meta-connect -->

**Step 5.** Turn data sharing up to Maximum.

1. In Shopify, go to **Sales channels > Facebook & Instagram**.
2. Click **Settings**, then **Data sharing settings**.
3. Check **Customer data sharing** is on.
4. Under **Choose level**, pick **Maximum**.

This sends sales to Meta from the shopper's browser (the pixel) and from your store (the Conversions API). That way fewer sales go missing. See [Shopify: Facebook data sharing](https://help.shopify.com/en/manual/promoting-marketing/analyze-marketing/meta-data-sharing).

**Expected result:** Data sharing reads "Maximum".

**Step 6.** Open **Events Manager** (All tools > Events Manager) and click your pixel. Look at the **Purchase** row in the **Overview** tab.

**Expected result:** Purchase shows events from both **Browser** and **Server**, in your store's currency. If it shows nothing, place a small test order and check again in an hour.

**Step 7.** Set a spending limit so ads can never spend more than you choose.

1. In Ads Manager, click the menu (three lines, top left).
2. Click **Billing and payments**, then **Payment settings**.
3. Find **Account spending limit**, click **Options**, then **Set limit**.
4. Type the most you are happy to spend in total, and click **Save**.

**Expected result:** The account stops spending at your limit even if something goes wrong. The limit covers all spend over the account's life and does not reset each month. It takes about 15 minutes to start working (see [Meta: set an account spending limit](https://www.facebook.com/business/help/203321833042958)).

**Step 8.** Make a simple "Daily" view in Ads Manager.

1. Click **Columns** (above the table), then **Customise columns**.
2. Tick: Results, Cost per result, Amount spent and Purchase ROAS (sales for each $1 of ads). Also tick CTR (link), which is how many in 100 clicked. And tick Frequency, which is how often each person saw it.
3. Tick **Save as preset** and name it "Daily".
4. Click **Apply**.

**Expected result:** Choosing **Columns > Daily** shows the numbers you check every day.

**Step 9.** Add a weekly 5-minute reminder to your calendar. Look in Ads Manager for campaigns you did not make or budgets that jumped.

**Expected result:** A weekly check is in your calendar. If you ever find something odd, turn it off and remove unknown people in Business Settings. Then contact Meta support and dispute the charge with your bank.

<!-- do:calendar -->

**Step 10.** Later, once you have a few hundred visitors, save your visitor lists.

1. In Ads Manager, open **All tools**, then **Audiences**.
2. Click **Create audience**, then **Custom audience**, then **Website**.
3. Make "All visitors, last 30 days" and save.
4. Do the same for 180 days, and for purchasers.

**Expected result:** The audiences show "Ready" (they can take a few hours to fill).

## Lesson 8.3: Launch your first Meta ad in 30 minutes
<!-- stage:attract -->

**Why this matters:** Most people stall on their first ad because Ads Manager has hundreds of settings. You need about eight of them. This lesson walks you through a simple first campaign. You make one Sales campaign, one ad set and 3 to 5 ads. You use a budget you already know you can afford. Or let Helix build it for you as a paused draft.

**Words you will see:** a **campaign** holds the goal (Sales). An **ad set** holds the budget, who sees it and where. An **ad** is the video or image people see. The **pixel** tells Meta when someone buys. **Advantage+** means Meta makes some choices for you, which works well for most new stores.

**Step 1.** Check your setup. Open Events Manager (Ads Manager menu **> All tools > Events Manager**). Your pixel should show **Purchase** events from your store. If it does not, do Lesson 8.2 steps 4 to 6 first.

**Expected result:** You can see Purchase events, so Meta can learn who buys.

<!-- do:meta-connect -->

**Step 2.** Pick your daily budget.

- Selling under about $5,000 a month? Use $20 to $50 a day for two weeks.
- Selling more? Use about 2 times your break-even cost per sale each day (Helix shows it in **Profit**). Stay inside your marketing % guide from Lesson 1.9.

**Expected result:** You have one daily budget written down, for example $30 a day.

<!-- do:profit -->

**Step 3.** Get 3 to 5 ads ready. Use short videos or images of your best seller, each with a different opening line (the "hook"). Make them in 4:5 (feed) and 9:16 (Stories and Reels) sizes.

**Expected result:** 3 to 5 files in a folder, plus one main text and one headline you can reuse.

**Step 4.** Want Helix to build it? Click **Do it for me**, then skip to Step 9.

Helix makes the campaign, ad set and ads in your own ad account, switched off (paused). Nothing spends until you switch it on.

**Expected result:** A paused campaign named by Helix appears in Ads Manager, with "Off" under **Delivery**.

<!-- do:meta-draft -->

**Step 5.** Building it yourself? Create the campaign.

1. In Ads Manager, click **+ Create**.
2. Choose **Sales**, click **Continue**, then **OK**.
3. Check **Advantage+** at the top right reads **On**.
4. Name it "01-Sales-First" and click **Next**.

**Expected result:** The campaign settings page is open with Sales as the goal.

**Step 6.** In the budget box, set your daily budget from Step 2. Under **Conversion**, check your pixel is picked (Meta may call it a dataset) and the event is **Purchase**.

**Expected result:** Budget and Purchase event are set. If you see **Conversion location**, choose **Website**.

**Step 7.** Leave the audience on Meta's suggestion and placements on **Advantage+ placements**, then click **Next** to reach the ad.

**Expected result:** You are on the ad screen. If Meta shows a country box, set it to the countries you ship to.

**Step 8.** Add your ads.

1. Click **Add media** and upload your 3 to 5 images or videos.
2. Paste your main text into **Primary text**.
3. Paste your headline into **Headline**.
4. Paste your product page link into **Website URL**.
5. Look at the preview on the right and pick the phone view. Check nothing is cut off.

**Expected result:** Every ad shows the right image or video, text and link, with nothing cut off.

**Step 9.** Go live.

- Built it yourself? Click **Publish** (bottom right).
- Helix built it? Open it in Ads Manager. Check the budget, the ads and the link. Then click its On/Off switch so it turns blue.

**Expected result:** **Delivery** shows "In review", then "Learning" within a day.

**Step 10.** Leave it alone for 3 days. Then compare cost per purchase with your break-even cost per purchase from your profit setup.

**Expected result:** After 3 days you know if each ad is under, near or over break-even. Keep the best ones running.

**Watch out:** Big edits in the first days restart Meta's learning (Lesson 8.8). Change nothing for 3 days unless something is broken, such as a wrong link.

## Lesson 8.4: Automated vs manual campaigns
<!-- stage:attract -->

**Why this matters:** Every new Sales campaign now starts with **Advantage+ on**. Meta then chooses who sees the ad, where, and how the budget is split. If you narrow the budget, audience or placements, that part shows **Advantage+ off**. The campaign is then manual. Start with Advantage+ on for new customers. Go manual only when you need control (see [Meta: create an Advantage+ campaign](https://www.facebook.com/business/help/830005979993164)).

**Step 1.** Start a new sales campaign.

1. In Ads Manager, click **+ Create**.
2. Choose **Sales**, click **Continue**, then **OK**.
3. Check that **Advantage+** at the top right reads **On**. Leave budget, audience and placements as Meta sets them.

**Expected result:** Your main campaign for new customers is an Advantage+ sales campaign.

<!-- do:meta-draft -->

**Step 2.** Only for warm audiences or a test that needs control: repeat **+ Create > Sales > Continue**. Warm means people who visited or engaged. Set the audience or placements you need. Meta then shows **Advantage+ off** for that part.

**Expected result:** Warm and test campaigns are manual, with the audience you chose.

**Step 3.** At the ad level, open **Ad creative** and click **Set up creative** (or **Edit** by **Advantage+ creative**). Under **Enhancements**, switch off anything that changes how your ad looks, like added music. Some can only be switched off in **Advanced preview**, so check there too.

**Expected result:** The preview on the right shows your ad as you designed it. See [Meta: turn off creative enhancements](https://www.facebook.com/business/help/1082295769403815).

## Lesson 8.5: Ad formats
<!-- stage:attract -->

**Why this matters:** The format is the shape of the ad: video, image, carousel and more. Each format suits a different job, and the wrong one can hide a good message.

**Step 1.** For each ad in your next batch, pick the format from the table below that fits its job. For most cold ads, that is a single video in 9:16 and 4:5.

**Expected result:** Every brief names one format.

**Step 2.** Make each ad in both 4:5 (feed) and 9:16 (Stories and Reels) sizes.

**Expected result:** Each ad fits every placement without cropping.

**Step 3.** Keep all text inside the safe zones. Then Reels and Stories will not cut it off or cover it with buttons.

**Expected result:** Previewing the ad in Ads Manager shows no text hidden behind buttons.

### Good to know

| Format | Best for |
| --- | --- |
| Single video (9:16 tall and 4:5) | Most ads aimed at new people |
| Single image (4:5) | Bold statements, offers, reviews |
| Carousel (swipeable cards) | Several products, steps or reasons |
| Advantage+ catalog ads (once called dynamic product ads) | Showing people products they looked at; big product ranges |
| Collection | A shopping experience on mobile |
| Partnership ads | A creator's post run as an ad, showing both your names |
| Catalog ads with video | Product videos built from your product feed |

Meta recommends 4:5 for Facebook Feed and 9:16 for Stories and Reels (see [Meta: aspect ratios by placement](https://www.facebook.com/business/help/682655495435254)).

## Lesson 8.6: Show the right product to the right person with catalog ads
<!-- stage:attract -->

**Why this matters:** Catalog ads pick products from your store. They show each person the ones they looked at or are likely to want. Meta calls them Advantage+ catalog ads (once called dynamic product ads). They work best when you have more than a handful of products. They only work well if your product list and your pixel agree on which product is which.

**Step 1.** Sync your products. In Shopify, open the **Facebook & Instagram** sales channel and connect your catalog. Then, in Meta **Commerce Manager**, check that your products, prices and stock look right.

**Expected result:** Your products show in Commerce Manager with the same prices and stock as your store.

**Step 2.** Check that your pixel matches the catalog. In **Commerce Manager**, open your catalog, then **Events**. Look at how well your pixel's product events match your catalog (the match rate). Aim for close to 100%. If it is low, reconnect through the **Facebook & Instagram** sales channel. Do not add a second pixel.

**Expected result:** The pixel's views, add-to-carts and purchases point to products in your catalog.

**Step 3.** Make two or three product sets in Commerce Manager, for example best sellers, one main category, and in-stock products only.

**Expected result:** Product sets are ready to pick when you build the ad.

**Step 4.** Build a catalog campaign for almost-buyers. Create a **Sales** campaign, turn on your catalog and pick a product set. Show it to people who viewed a product or added to cart in the last 14 days, and leave out people who bought in the last 7 days. As a rule of thumb, start with about 10 to 20% of your Meta budget.

**Expected result:** People who looked but did not buy see the products they looked at.

<!-- do:meta-draft -->

**Step 5.** Optional: once that works, test a catalog ad for new people with broad targeting and your best-seller set.

**Expected result:** You know if catalog ads also find new buyers for you.

**Step 6.** Once a week, open Commerce Manager and fix any products with errors or wrong prices. Make sure sold-out products are hidden.

**Expected result:** No errors, and nobody sees an ad for something they cannot buy.

**Watch out:** If ads show the wrong price or a sold-out product, people click, get annoyed and leave. Keep the catalog clean before you add budget.

### Good to know

TikTok has catalog ads too. In TikTok Ads Manager, open **Assets > Catalog** to add products. You need at least 4 products that are in stock, approved and active to run them (see [TikTok: create Catalog Ads](https://ads.tiktok.com/help/article/how-to-create-catalog-ads-for-the-website-conversions-objective)).

## Lesson 8.7: Launching
<!-- stage:attract -->

**Why this matters:** How you launch decides how fairly ads are tested and whether they keep their likes and comments. Build new ads in a switched-off campaign, copy them across with the same post, and switch them on together.

**Step 1.** Make the new ads in your switched-off build campaign.

1. In Ads Manager, open the build campaign (its On/Off switch is grey).
2. Click the **Ads** tab.
3. Click **+ Create** and make one new ad. Repeat for each ad.

**Expected result:** The new ads sit in the paused build campaign, with "Off" under **Delivery**.

<!-- do:meta-draft -->

**Step 2.** Copy the new ads into your live campaign.

1. Tick the new ads.
2. Click **Duplicate**.
3. Choose the live campaign and ad set.
4. Click **Duplicate** again.

**Expected result:** Copies of the ads appear in the live ad set, still switched off.

**Step 3.** Open each copy and find the ad's **Ad setup** section. Choose **Use existing post** and pick the first ad's post, so likes and comments carry over.

**Expected result:** Each copy shows the same post as the original. If you do not see **Use existing post**, the first ad is not published yet. Publish it in the build campaign first.

**Step 4.** Tick all the new copies and switch them all on together. Then click **Publish** (bottom right) if Meta asks.

**Expected result:** All the new ads start on the same day, with **Delivery** showing "In review", then "Learning" or "Active".

**Step 5.** Leave them alone for 2 to 5 days before judging.

**Expected result:** You judge on settled numbers, not early noise.

**Watch out:** Only use ad scheduling for a specific reason, like a sale that starts at a set time.

### Good to know

<!-- guide:meta-1-create-sales-campaign -->
![Start a Sales campaign in Meta Ads Manager](../../public/guides/meta-1-create-sales-campaign.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.* Official help: [Meta: create a campaign in Ads Manager](https://www.facebook.com/business/help/1658289035439772)
<!-- /guide:meta-1-create-sales-campaign -->

<!-- guide:meta-2-budget-pixel-audience -->
![Set budget, sales tracking and audience](../../public/guides/meta-2-budget-pixel-audience.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.*
<!-- /guide:meta-2-budget-pixel-audience -->

<!-- guide:meta-3-write-the-ad -->
![Write the ad and add tracking](../../public/guides/meta-3-write-the-ad.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.*
<!-- /guide:meta-3-write-the-ad -->

<!-- guide:meta-4-review-helix-draft -->
![Review a Helix draft and launch it](../../public/guides/meta-4-review-helix-draft.svg)

*Drawing, not a real screenshot. Labels on your screen may look a little different.*
<!-- /guide:meta-4-review-helix-draft -->

## Lesson 8.8: The learning phase
<!-- stage:attract -->

**Why this matters:** The learning phase is the first days after you start or change an ad set. Meta is still working out who to show it to. It usually ends after about 50 results in the week after the last big edit. With fewer, **Delivery** shows "Learning limited". Results are unstable during learning. Knowing what resets it saves you from breaking good campaigns (see [Meta: the learning phase](https://www.facebook.com/business/help/112167992830700)).

**Step 1.** Before you edit a live ad set, check if the edit restarts learning. These do: changing ads, audience, conversion event or bid strategy, or pausing 7+ days. So can a big budget change, often over 20% ([Meta: significant edits](https://www.facebook.com/business/help/316478108955072)).

**Expected result:** You only make big edits on purpose.

**Step 2.** Launch new tests as new campaigns rather than editing working ones.

**Expected result:** Existing campaigns keep their learning, because new campaigns do not reset them.

**Step 3.** Judge results on the last 7 days, not one day.

**Expected result:** A great week one followed by a weaker week two does not panic you.

**Watch out:** Do not keep moving winning ads into "the best campaign". Copy them instead, so each campaign keeps what it learned.

## Lesson 8.9: Daily optimisation in 10 minutes
<!-- stage:attract -->

**Why this matters:** Ten minutes a day keeps Meta healthy. Five steps in the same order every day turn a confusing dashboard into one clear action. In Helix, **Your ads** shows the verdicts for you.

**Step 1.** Set your stance from your scorecard: push, careful push, hold or defend (Lesson 1.6).

**Expected result:** You have one word for today.

<!-- do:numbers -->

**Step 2.** In Ads Manager, set the date to **Last 7 days** and choose **Columns > Daily**. On the **Campaigns** tab, read each campaign's **Amount spent** and **Frequency** (how many times the same person saw your ads).

**Expected result:** You know whether any campaign is overspending or tiring its audience.

**Step 3.** Grade each ad. **Star:** great, keep it and give it more. **Steady:** fine, leave it. **Passenger:** little spend, little effect, leave it unless it starts spending. **Drain:** lots of spend, poor results, turn it off.

**Expected result:** Every ad has a grade, and drains are switched off.

**Step 4.** Label each campaign: winning, learning, shaky or dying.

**Expected result:** Every campaign has a label.

<!-- do:insights -->

**Step 5.** Take one action and write it in your decision log. [SOP 06](../sops/06-meta-daily-optimisation.md) has the full detail and numbers.

**Expected result:** One logged action a day, about 10 minutes in total.

## Lesson 8.10: Reach potential
<!-- stage:attract -->

**Why this matters:** Reach potential is how many people an ad can reach. After that, the same people start seeing it twice. An ad with a tiny reach cannot grow, even if its cost per sale is great.

**Step 1.** See which ads reach the most people.

1. In Ads Manager, open the **Ads** tab.
2. Set the date to **Last 7 days**.
3. Click **Columns**, then **Customise columns**. Tick **Reach** and **Frequency** and click **Apply**.
4. Click the **Reach** column header to sort.

**Expected result:** You can see which ads reach many people and which reach few.

**Step 2.** Mark ads with big reach and an OK cost per sale as growth candidates.

**Expected result:** You have a short list of ads that can take more spend.

**Step 3.** To spend more, pair your low-cost, low-reach ad with a high-reach ad in the same campaign.

**Expected result:** The campaign can grow without frequency climbing fast.

## Lesson 8.11: Managing expensive cold campaigns
<!-- stage:attract -->

**Why this matters:** Cold campaigns for new people always look costly. Meta misses many of the sales they cause, because people buy days later another way. Judging them wrongly leads to cutting the campaigns that feed the whole store.

**Step 1.** Compare cold campaigns only with other cold campaigns, never with warm ones.

**Expected result:** Your cold campaigns are ranked against each other.

**Step 2.** Watch the share of orders from new customers each week.

**Expected result:** You know whether cold spend is still bringing new buyers.

**Step 3.** Judge cold spend by your total MER trend on the Dashboard. MER is total ad spend as a share of total sales.

**Expected result:** You see the whole-store effect, not Meta's partial view.

**Watch out:** Cut cold spend only when MER gets worse and orders from new customers fall.

<!-- do:growth -->

## Lesson 8.12: Metrics by funnel layer
<!-- stage:attract -->

**Why this matters:** The funnel layer is how well the audience knows you: cold, mixed, warm or hot. Each layer has its own numbers to watch and its own allowance for cost per sale.

**Step 1.** Label each campaign with its layer using the naming pattern from Lesson 7.7.

**Expected result:** Every campaign name shows Cold, Mixed, Warm or Hot.

**Step 2.** Compare each campaign with the numbers in the table below for its layer. That includes how much it may pay for one sale (CPA).

**Expected result:** You judge each campaign against the right benchmark.

### Good to know

| Layer | Who | Main numbers to watch |
| --- | --- | --- |
| Cold | Never heard of you | Reach, CPM, hook rate, outbound CTR, share of new customers, cost per sale compared with 2 times target |
| Mixed | Cold and warm together | Cost per sale compared with 1.25 times target, frequency, share who engaged |
| Warm | Visited or engaged | Cost per sale compared with target, frequency |
| Hot | Added to cart or started checkout | Cost per sale compared with 0.75 times target, frequency |

## Lesson 8.13: Scaling challenge
<!-- stage:grow -->

**Why this matters:** A scaling challenge is a planned 2 to 4 week push to spend more. If you have new ads ready and a loss limit set, even a failed test teaches you. It shows what is holding you back.

**Step 1.** Prepare 6 to 10 new ads before you start.

**Expected result:** Fresh ads are ready to add as frequency rises.

**Step 2.** Write down the most you are willing to lose.

**Expected result:** You have a dollar limit that ends the challenge.

**Step 3.** Raise the budget a little.

1. Click the campaign name (if it uses campaign budget) or the ad set name (if it uses ad set budgets).
2. Raise **Daily budget** by 10 to 20%.
3. Click **Publish**.
4. Each day, write the spend and reach in your tracking sheet.

**Expected result:** You can see whether new spend is finding new people.

**Step 4.** Hold each new level for 10 to 14 days.

**Expected result:** MER has time to settle at each level.

**Step 5.** Read the result.

- Spend grew much faster than reach? Add new ads, or remove some exclusions.
- MER (total ad spend as a share of total sales) didn't settle? Go back one budget step and find out why.

**Expected result:** You have a clear next action, whether the challenge worked or not.

<!-- do:growth -->

## Lesson 8.14: Cost caps, bid caps and value rules
<!-- stage:grow -->

**Why this matters:** By default, Meta spends your whole budget and tries to get the most sales. Caps and rules let you tell Meta the most you will pay, or which buyers are worth more to you. Used well, they protect profit. Used too early, they stop your ads from spending at all.

**Step 1.** Only try this when a campaign already has at least 50 sales a week and steady results. That is a rule of thumb: caps need plenty of data to work (see [Meta: bid strategies](https://www.facebook.com/business/help/1619591734742116)). Check in Ads Manager on the **Campaigns** tab.

**Expected result:** You know if the campaign is ready. If not, keep the default setting.

**Step 2.** Find your break-even cost per sale from Lesson 1.5. Write it down.

**Expected result:** One number, for example $40.

**Step 3.** Duplicate the campaign. In the copy, find **Bid strategy**: on the campaign if it uses campaign budget, otherwise on the ad set. Choose **Cost per result goal** (once called a cost cap). Type a number a little under break-even, for example $36.

**Expected result:** A test copy that aims to keep the average cost per sale near your number. Meta does not guarantee it.

**Step 4.** Set the budget a bit higher than normal. Caps often spend less than the budget, so a bigger budget gives Meta room.

**Expected result:** The capped copy is not starved of money.

**Step 5.** Run both for 7 days. Compare total sales and cost per sale.

**Expected result:** You know if the cap made you more profit. If it barely spent, raise the cap by 10% and try again.

**Step 6.** Optional: in **Advertising settings** (under **All tools**), look for **Value rules**, if your account has them. They tell Meta to bid more for groups worth more to you, like an age group with bigger orders. Add one rule only if your own sales data proves that group spends more.

**Expected result:** At most one rule, backed by your own numbers.

**Watch out:** A bid cap (a hard limit on each bid) is stricter than a cost per result goal. It can stop delivery completely. Leave bid caps for experienced accounts.

## Lesson 8.15: Attribution settings
<!-- stage:attract -->

**Why this matters:** Attribution is how a platform decides which ad gets credit for a sale. Meta's standard setting credits sales within 1 or 7 days of a link click. It also credits sales within 1 day of a view or of another tap on the ad. That is not the full truth, so you need a second check (see [Meta: attribution settings](https://www.facebook.com/business/help/460276478298895)).

**Step 1.** In Ads Manager, click the **Columns** menu, then **Compare attribution models**. Tick **Incremental** and click **Apply**. It counts only sales Meta's model thinks the ad truly caused (see [Meta: incremental attribution results](https://www.facebook.com/business/help/1271619100603114)).

**Expected result:** You can see how much of Meta's reported sales are likely extra sales.

**Step 2.** Each week, compare Meta's reported sales with your real sales in Shopify. Also check your MER on the Dashboard (total ad spend as a share of total sales).

**Expected result:** You trust the store's numbers first and Meta's second.

<!-- do:growth -->

**Step 3.** When you spend enough, run a holdout test, as in Lesson 9.10. You hide ads from a group and compare.

**Expected result:** You have a measured answer to how many sales ads really cause.

## Lesson 8.16: Troubleshooting
<!-- stage:attract -->

**Why this matters:** Meta throws up a handful of common problems, from ads that will not spend to strange labels. Each has a known fix.

**Step 1.** Find your problem in the table below.

**Expected result:** You have the matching fix.

**Step 2.** Apply the fix and note it in your decision log with the date.

**Expected result:** The problem is fixed, and you can find what you did if it comes back.

### Good to know

| Problem | What to check |
| --- | --- |
| Ads only spend part of the budget | Budget too low for the audience, billing problems, policy limits, the schedule |
| Ads stuck "In review" | Review usually takes up to 24 hours. Check for policy or catalog errors. After 48 hours, copy the ad and try again. |
| Meta adds a discount label you did not set | The ad's Advantage+ creative enhancements and offer settings. Turn off automatic offers. |
| "Data restrictions applied" | Meta has put your store in a sensitive category. Ask for a review. |
| Instagram sells worse than Facebook | Usually fine. Judge both together. Only remove a placement with strong proof. |
| You reached the limit on ads | Archive dead ads. Combine ad sets. |
| You want ads to run only at certain hours | Ad sets with either budget type can use **Delivery scheduling** ([Meta: schedule an ad set](https://www.facebook.com/business/help/1381935425400769)). Most stores do better leaving ads on all day. Test it only with clear proof that some hours lose money. |
| You keep overspending in a sale | Set a spending limit on the campaign or the account before the sale starts. |

## Lesson 8.17: Meta ads 101 (start here if you have never run an ad)
<!-- stage:attract -->

**Why this matters:** Meta ads are paid posts that show on Facebook, Instagram, Messenger, WhatsApp and Threads. You pay so people who do not follow you see your product. This lesson explains the basics in plain words, then walks you through your very first ad.

**Step 1.** Learn where Meta ads can show. The main places are Feed, Stories, Reels, Explore, Marketplace and search results. Meta's name for these spots is **placements** (see [Meta: about ad placements](https://www.facebook.com/business/help/407108559393196)).

**Expected result:** You know an ad can appear in many spots, and that adding more placements does not raise the price.

<details><summary>More detail: the main placements</summary>

- **Feed:** the main scrolling list on Facebook and Instagram.
- **Stories:** full-screen vertical posts between friends' Stories.
- **Reels:** full-screen short videos in the Reels tab.
- **Explore:** the Instagram grid of suggested posts.
- **Marketplace:** the Facebook buy-and-sell area.
- **Search results:** next to Facebook, Marketplace and Instagram searches.

Meta suggests **Advantage+ placements**, which lets it pick the spots for you.
</details>

**Step 2.** Learn the difference between a post and an ad. A post, Story or Reel you share for free is **organic**. Your followers see it. An ad is **paid**. Meta shows it to new people you choose or that Meta finds.

**Expected result:** You can say which of your content is free and which is paid.

<details><summary>More detail: posts vs Stories vs Reels vs ads</summary>

| | What it is | What it is for | Size |
|---|---|---|---|
| Post | A photo or video on your profile | Show your products to followers | 4:5 tall photo |
| Story | Full-screen, vertical | Quick updates, behind the scenes | 9:16 |
| Reel | Full-screen short video | Get found by new people for free | 9:16 |
| Ad | Any of the above, paid | Reach new buyers and get sales | 4:5 for Feed, 9:16 for Stories and Reels |

Meta recommends 4:5 for Instagram Feed photos ([Meta Ads Guide: Instagram Feed image](https://www.facebook.com/business/ads-guide/update/image/instagram-feed)). It recommends 9:16 for Stories and Reels ([Stories](https://www.facebook.com/business/ads-guide/update/video/instagram-story), [Reels](https://www.facebook.com/business/ads-guide/update/video/instagram-reels)). Reels ads can run up to 15 minutes, but short videos of 15 to 30 seconds are easier to watch. Stories ads of 16 seconds or more may be split into several cards.
</details>

**Step 3.** Learn what a boosted post is. Boosting means paying to show a post you already made to more people. It is quick, but has fewer choices than an ad made in **Ads Manager** (see [Meta: boosted posts vs ads](https://www.facebook.com/business/help/317083072148603)).

**Expected result:** You know to make your first sales ad in Ads Manager, not with the Boost button.

**Step 4.** Learn the three layers of every Meta ad. The **campaign** holds your goal. The **ad set** holds the budget, schedule, audience and placements. The **ad** is what people see: the picture or video, the words and the link.

**Expected result:** You can say what each layer controls: goal, then who and how much, then what they see.

**Step 5.** Learn the six goals Meta calls **objectives**: Awareness, Traffic, Engagement, Leads, App promotion and Sales. For an online store, pick **Sales** (see [Meta: choose an ad objective](https://www.facebook.com/business/help/1438417719786914)).

**Expected result:** You know Sales tells Meta to find people likely to buy.

<details><summary>More detail: the six objectives in plain words</summary>

- **Awareness:** get seen by as many people as possible.
- **Traffic:** get clicks to your website.
- **Engagement:** get likes, comments or messages.
- **Leads:** get sign-ups, like an email list.
- **App promotion:** get app downloads.
- **Sales:** get people to buy. Best for a store.
</details>

**Step 6.** Before you start, tick off this list. Your store is live and you placed a test order. You have a Facebook Page, an Instagram account and a business portfolio (see [Meta: create a business portfolio](https://www.facebook.com/business/help/1710077379203657)). The pixel is connected and you have 3 ads ready.

**Expected result:** Every box is ticked. If one is not, finish it first in the lessons linked below.

<details><summary>More detail: how to connect the pixel and payment</summary>

- **Pixel:** connect it through the Facebook & Instagram app in Shopify. It tells Meta when someone buys ([Shopify: Facebook data sharing](https://help.shopify.com/en/manual/promoting-marketing/analyze-marketing/meta-data-sharing)).
- **Payment:** add a card in Ads Manager under billing. Then set an account spending limit as a safety net ([Meta: set an account spending limit](https://www.facebook.com/business/help/203321833042958)).
- Full walk-through: Lesson 8.1 and Lesson 8.2.
</details>

**Step 7.** Open Ads Manager and click **Create**. Pick **Sales**. Name the campaign with a date and goal, like "2026-11 Sales First".

**Expected result:** A new Sales campaign with a clear name is open. Menus move often, so if a button looks different, look for the same word nearby.

**Step 8.** Set a daily budget you are happy to lose while you learn, like $20 a day. Leave the audience and placements on Meta's suggestions.

**Expected result:** The ad set shows a small daily budget and **Advantage+** audience and placements.

**Step 9.** Add your 3 ads. Use 1 video in 9:16 and 2 photos in 4:5. Write one short line about the main benefit. Paste your product page link.

**Expected result:** The preview shows your ads with the right link and no cut-off text.

**Step 10.** Click **Publish**. Then leave it alone for 3 days. Only check that money is being spent and that sales show up.

**Expected result:** The ad is approved and spending. You have not changed anything yet.

<details><summary>More detail: after you launch</summary>

- **First 24 hours:** check the ad was approved and is spending.
- **Day 2 to 3:** check clicks and add-to-carts are coming in.
- **Do not** change the budget, audience or ads in the first 3 days. Each change makes Meta start learning again.
- **Common first-time mistakes:** using Boost instead of Ads Manager, picking Traffic or Engagement instead of Sales, a missing pixel, too small an audience, and changing things every day.
</details>

**Step 11.** Stuck? Search YouTube for "Meta Ads Manager tutorial for beginners 2026" or "how to create a sales campaign in Meta Ads Manager". Pick videos from the last 6 months, because menus change.

**Expected result:** You find a recent video that matches what you see on screen. If it does not match, try a newer one.

**Watch out:** If you get stuck, take a screenshot of your screen. Ask the Helix coach or another AI assistant "what do I click next?" and share the screenshot. **Next:** set up your accounts properly in Module 08 (Lesson 8.1), then read your results in Module 09.

## Lesson 8.18: Which channel first? A simple guide
<!-- stage:attract -->

**Why this matters:** Trying every channel at once spreads a small budget too thin. You learn nothing. Picking one first, based on your money, your product and your store, gets you real results faster.

**Step 1.** Check your store is ready. You need a live store, a test order, clear product pages and tracking. If not, finish "Get your store ready first" before any ads.

**Expected result:** You know if you can start paid ads now or should start with free posts and email.

**Step 2.** Check your budget. Under about $20 a day, start with free posts, email and SEO. From about $20 to $50 a day, pick one paid channel. Over $50 a day, you can test a second one.

**Expected result:** You know how many paid channels you can afford: none, one or two.

**Step 3.** Match your product. Use the table in **More detail** below to find the channel that fits what you sell.

**Expected result:** You have one first channel written down.

<details><summary>More detail: which channel fits your product</summary>

| Your product | Start with | Why |
|---|---|---|
| People already search for it by name | Google Search or Shopping | Buyers are looking right now |
| Eye-catching, impulse or new | Meta (Instagram and Facebook) | You can show it to people who did not know they wanted it |
| Fun to show on video, under about $50 | TikTok | Short real-looking videos sell it |
| Home, fashion, gifts, food or anything people plan | Pinterest | People save ideas there to buy later |
| Handmade or vintage | Etsy, plus your own store | Shoppers there want exactly that |

Not sure? Start with Meta. It works for most new stores and has the most beginner help.
</details>

**Step 4.** Open the 101 for that channel and follow its first-ad steps: Lesson 8.17 (Meta), Lesson 10.14 (Google), Lesson 11.14 (TikTok) or Lesson 11.15 (other channels).

**Expected result:** You are on the right lesson for your first channel.

**Watch out:** Give one channel at least 2 to 4 weeks before you add another. **Next:** Know who you are selling to, then plan your ads.

## Self-check

1. Name two edits that restart learning.
2. Why can an ad with a low cost per sale be a poor choice for scaling?
3. How should you judge cold campaigns?
4. What do you do if a campaign was hacked?

<details><summary>Answers</summary>

1. Any two of: a big budget change (often over 20%), changing ads, audience, conversion event or bid strategy, or pausing 7+ days.
2. It reaches few people before the same people see it again and again.
3. Against other cold campaigns, and by your total MER and new-customer trend.
4. Turn it off, remove unknown access, secure the admin logins, contact Meta support and dispute the charges.
</details>
