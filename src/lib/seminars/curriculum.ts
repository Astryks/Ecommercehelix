/**
 * Daily Seminars curriculum: 15-20 minute seminar episodes, each clubbing 3-4 related Helix concepts.
 * Sources: the Helix Playbook lessons (/learn) and the 40-chapter teen course scripts (chapter numbers in `chapters`).
 * `order` is the first-pass teaching order (it builds: make -> launch -> attract -> convert -> grow).
 * `events` are season-calendar keys (src/lib/season-calendar.ts); the rotation pulls those episodes forward before the event.
 */
export type SeminarSection = { title: string; minutes: number; points: string[] };
export type Seminar = {
  id: string; // stable slug, never renamed (purchases are keyed on it)
  order: number;
  cluster: string;
  stage: "Start" | "Launch" | "Attract" | "Convert" | "Grow";
  title: string;
  hook: string;
  concepts: string[];
  chapters: number[];
  sections: SeminarSection[];
  minutes: number;
  takeaways: string[];
  events: string[];
  learnLinks: string[];
};

type C = { name: string; points: [string, string] };
type Raw = { id: string; cluster: string; stage: Seminar["stage"]; title: string; hook: string; concepts: C[]; chapters: number[]; example: string; action: string; takeaways: string[]; events?: string[]; learn?: string[] };

const RAW: Raw[] = [
  { id: "idea-to-first-design", cluster: "make", stage: "Start", title: "From Idea to First Design", hook: "Every brand starts as one scribble. Here is how to turn yours into something a maker can build.", chapters: [1, 2], concepts: [
    { name: "Pick a problem, not a product", points: ["Write the one annoyance your product fixes in a single sentence.", "Check 10 real reviews of rivals for the same complaint."] },
    { name: "Sketch, then simplify", points: ["Three sketches, then cut every feature that does not fix the problem.", "A simple design is cheaper to make and easier to sell."] },
    { name: "Proof people want it", points: ["Post the sketch and ask 'would you buy this for $X?'", "Count yeses with a price, not compliments."] },
    { name: "The one-page brief", points: ["What it is, who it is for, size, colours, target cost.", "This page is what you send makers."] }],
    example: "Jessie's sock idea: from 'my socks slip' to a one-page brief in an afternoon.", action: "Write your one-page brief tonight.", takeaways: ["Start from a problem buyers already complain about.", "Simplify before you spend.", "A one-page brief saves weeks of back-and-forth with makers."] },
  { id: "makers-fabric-sizes", cluster: "make", stage: "Start", title: "Makers, Materials and Getting Sizes Right", hook: "The cheapest sample is the one you do not have to redo.", chapters: [2, 3, 4], concepts: [
    { name: "Finding and vetting a maker", points: ["Ask three makers the same brief and compare answers, not just price.", "Minimum order, sample cost, lead time: get all three in writing."] },
    { name: "Choosing materials", points: ["Feel, durability and cost: pick two.", "Ask for swatches before samples."] },
    { name: "Measurements and size charts", points: ["Size returns are the most avoidable returns.", "Publish a chart in cm and inches with how-to-measure."] }],
    example: "How one wrong measurement doubles your return rate, and the 10-minute fix.", action: "Request quotes from three makers with the same brief.", takeaways: ["Compare makers on MOQ, sample cost and lead time.", "Swatches first, samples second.", "A clear size chart cuts returns."] },
  { id: "print-files-deal-brand", cluster: "launch", stage: "Launch", title: "Print Files, the Deal and Your Brand", hook: "The details nobody shows you: files, contracts and a name people remember.", chapters: [5, 6], concepts: [
    { name: "Print-ready files", points: ["Vector files, exact colour codes, a mockup with measurements.", "Approve a physical sample before the full run."] },
    { name: "Doing the deal", points: ["Deposit, balance, defects policy and delivery date in writing.", "Never pay 100% up front for a first order."] },
    { name: "A brand people remember", points: ["Name, one colour, one promise.", "Say the promise on every page and pack."] }],
    example: "A 30/70 deposit deal and what to do when the sample is wrong.", action: "Write your brand promise in under 10 words.", takeaways: ["Approve a real sample first.", "Get defects and dates in writing.", "One promise, repeated everywhere."] },
  { id: "store-and-first-sale", cluster: "launch", stage: "Launch", title: "Store Live, First Sale Done", hook: "Your store does not need to be perfect. It needs to be trusted and to work.", chapters: [6, 9], learn: ["/learn"], concepts: [
    { name: "The minimum trusted store", points: ["Clear photos, price, delivery time, returns policy, contact.", "Test checkout yourself on a phone."] },
    { name: "Trust signals", points: ["Real reviews, real address or ABN, secure checkout badges.", "Shipping costs shown before checkout."] },
    { name: "Your first 10 sales", points: ["Friends and family are fine: ask for honest reviews in return.", "Each sale teaches you something; write it down."] }],
    example: "The pre-launch checklist the Helix store check runs on every site.", action: "Do a full test order on your phone and note every snag.", takeaways: ["Trust beats beauty.", "Show shipping and returns early.", "First sales are for learning and reviews."] },
  { id: "true-cost-per-unit", cluster: "money", stage: "Launch", title: "What One Unit Really Costs", hook: "Most new stores lose money on every order and do not know it yet.", chapters: [7, 23], events: ["eofy"], concepts: [
    { name: "Landed cost", points: ["Product + freight + duty + packaging = landed cost.", "Work it out per unit, not per order."] },
    { name: "The hidden costs", points: ["Payment fees, shipping, returns and discounts.", "Add them line by line to see contribution."] },
    { name: "Contribution margin", points: ["Price minus every variable cost.", "This is the pot that pays for ads and profit."] },
    { name: "Price it so it pays", points: ["Aim for at least 3x landed cost as a start.", "Check your margin survives a 20% discount."] }],
    example: "Jessie's $25 socks: from 'I make $15' to 'I make $6.40'.", action: "Fill in the Helix profit setup with your real numbers.", takeaways: ["Know landed cost per unit.", "Contribution margin funds ads and profit.", "Test your margin against discounts."] },
  { id: "know-your-customer", cluster: "customer", stage: "Attract", title: "Know Your Customer Better Than They Do", hook: "Ads, pages and emails all get easier when you know exactly who you are talking to.", chapters: [8], events: ["back-to-school"], concepts: [
    { name: "One buyer, described", points: ["Age, place, problem, what they tried, what they fear.", "Write it as a real person with a name."] },
    { name: "Mine reviews and comments", points: ["Copy exact phrases buyers use; reuse them in ads.", "Look for the 'finally' moments."] },
    { name: "Jobs to be done", points: ["People hire a product to do a job.", "Sell the job, not the features."] }],
    example: "Turning 20 one-star reviews of a rival into five ad angles.", action: "Write a one-paragraph buyer profile using real quotes.", takeaways: ["Describe one real buyer.", "Steal their words for your copy.", "Sell the job done."] },
  { id: "website-that-converts", cluster: "convert-page", stage: "Convert", title: "Pages That Turn Visitors Into Buyers", hook: "Most visitors leave within seconds. Here is what makes them stay and buy.", chapters: [9, 20, 21], concepts: [
    { name: "Above the fold", points: ["Product, promise, price and button visible without scrolling.", "Phone first: most buyers are on mobile."] },
    { name: "Answer objections", points: ["Sizing, delivery, returns, 'will it work for me' near the button.", "An FAQ under the button beats a long About page."] },
    { name: "Speed and friction", points: ["Every second of load time costs sales.", "Cut checkout fields and surprise fees."] },
    { name: "Test one change at a time", points: ["Headline, photo or offer: one test, two weeks.", "Judge on conversion rate, not opinions."] }],
    example: "Before and after of a product page that went from 1.1% to 2.3% conversion.", action: "Run the Helix store check and fix the top three findings.", takeaways: ["Promise, price and button above the fold.", "Answer objections near the button.", "Test one change at a time."] },
  { id: "email-foundations", cluster: "email", stage: "Attract", title: "Emails That Work While You Sleep", hook: "Email is the one channel you own. Set it up once and it sells every day.", chapters: [10, 26], concepts: [
    { name: "Capture: the sign-up offer", points: ["A small reason to join: tip sheet, early access or a small discount.", "Pop-up after some scrolling, not instantly."] },
    { name: "The welcome series", points: ["3-5 emails: story, best seller, proof, offer.", "Usually the highest-earning flow."] },
    { name: "Abandoned cart and browse", points: ["Remind within an hour, then a day later.", "Answer the objection, do not just discount."] },
    { name: "Campaign rhythm", points: ["One useful email a week beats a sale blast a day.", "Keep the list clean: remove the long-unengaged."] }],
    example: "A five-email welcome flow, written live.", action: "Write your first welcome email today.", takeaways: ["Own your audience with email.", "Welcome and cart flows first.", "Useful weekly emails, not daily blasts."] },
  { id: "social-and-search", cluster: "organic", stage: "Attract", title: "Instagram, TikTok and Search Without Ads", hook: "Free reach is not free; it costs consistency. Here is how to spend it well.", chapters: [11, 12], concepts: [
    { name: "Content pillars", points: ["Three themes: show it, teach it, behind the scenes.", "Rotate them so you never stare at a blank page."] },
    { name: "Short video that hooks", points: ["First second: movement or a bold claim.", "One idea per video; end with a reason to follow."] },
    { name: "Search basics (SEO)", points: ["Name products the way people search.", "One helpful guide page per big question."] },
    { name: "Markets and local", points: ["Weekend markets give instant feedback and content.", "Collect emails at the stall."] }],
    example: "One market day turned into 12 posts and 40 email sign-ups.", action: "Plan a week of posts using the three pillars.", takeaways: ["Pillars beat blank pages.", "Hook in the first second.", "Name things how buyers search."] },
  { id: "creators-and-partners", cluster: "creators", stage: "Attract", title: "Creators, Influencers and Partners", hook: "Someone else already has your customers' attention. Borrow it fairly.", chapters: [13], events: ["mothers-day"], concepts: [
    { name: "Picking creators", points: ["Fit and engagement beat follower count.", "Micro creators often return more per dollar."] },
    { name: "The fair deal", points: ["Gift, flat fee or commission; agree usage rights.", "Disclosure is required: #ad or paid partnership."] },
    { name: "Creator content as ads", points: ["Ask for raw clips you can run as ads.", "Whitelisting lets you run ads from their account."] },
    { name: "Partner brands", points: ["Find a brand with the same buyer, not the same product.", "Swap email features or bundle together."] }],
    example: "Ten micro creators vs one big one: the real numbers.", action: "List 20 creators your buyer already follows.", takeaways: ["Fit over follower count.", "Always disclose.", "Get usage rights for ads."] },
  { id: "ad-budget-and-first-test", cluster: "ads-meta", stage: "Attract", title: "Your Ad Limit and Your First Facebook Test", hook: "Know what you can afford to pay for a sale before you spend a dollar.", chapters: [14, 15], concepts: [
    { name: "Break-even CPA", points: ["Your contribution margin is the most you can pay for a sale.", "Target CPA sits below it to leave profit."] },
    { name: "Daily budget sizing", points: ["Enough to get about 50 results a week per ad set, or test smaller and patiently.", "Never spend money you cannot lose while testing."] },
    { name: "A simple first campaign", points: ["One sales campaign, broad audience, 3-5 creatives.", "Let it run 3-4 days before judging."] }],
    example: "Setting a $30/day test for a $40 product with a $16 margin.", action: "Work out your break-even CPA in the Helix plan.", takeaways: ["Know your break-even CPA first.", "Start simple and broad.", "Give tests time before judging."] },
  { id: "audiences-and-angles", cluster: "ads-meta", stage: "Attract", title: "Audiences, Angles and Ad Ideas", hook: "The same product can be sold ten ways. Find the one that clicks.", chapters: [16, 17], concepts: [
    { name: "Broad vs interest vs lookalike", points: ["Modern ad systems find buyers well with broad targeting.", "Your creative is now your targeting."] },
    { name: "Angles", points: ["Problem, result, social proof, comparison, founder story.", "Test angles before polishing visuals."] },
    { name: "Ads people watch", points: ["Hook, problem, product, proof, offer in under 30 seconds.", "Captions on: most watch muted."] }],
    example: "Five angles for one product, scripted on screen.", action: "Write five hooks, one per angle.", takeaways: ["Creative is the targeting now.", "Test angles first.", "Captions on, hook fast."] },
  { id: "read-results-test-stop", cluster: "numbers", stage: "Attract", title: "Read Results: When to Test, Scale or Stop", hook: "Most ad money is wasted by deciding too early or too late.", chapters: [18, 29], concepts: [
    { name: "The numbers in order", points: ["CTR (do they stop?), CPC, conversion rate, CPA.", "Find the first broken number."] },
    { name: "Stop rules", points: ["Spent 2x target CPA with no sale: stop that ad.", "Write rules before you launch, not after."] },
    { name: "The morning check", points: ["Five minutes: spend, sales, CPA, any broken number.", "No tinkering every hour."] }],
    example: "Reading a real ads dashboard from top to bottom.", action: "Write your stop and scale rules on one card.", takeaways: ["Find the first broken number.", "Set stop rules in advance.", "A five-minute morning check."] },
  { id: "google-tiktok-pinterest", cluster: "ads-other", stage: "Attract", title: "Beyond Facebook: Google, TikTok and Pinterest", hook: "Once one channel works, the next one should catch a different buyer.", chapters: [19], events: ["summer-deal-days"], concepts: [
    { name: "Google Search and Shopping", points: ["Catch people already searching.", "Clean product feed and titles matter most."] },
    { name: "TikTok ads", points: ["Native-looking video, creator style.", "Fast creative fatigue: refresh often."] },
    { name: "Pinterest", points: ["Planning mindset: gifts, homes, events.", "Starts working weeks before seasons."] },
    { name: "When to add a channel", points: ["Only after the first is profitable and steady.", "Give each new channel its own test budget."] }],
    example: "Matching three products to the best second channel.", action: "Pick your second channel and set a test budget.", takeaways: ["Search catches intent.", "TikTok needs fresh creative.", "Add channels one at a time."] },
  { id: "reviews-service-feedback", cluster: "convert-trust", stage: "Convert", title: "Reviews, Service and Feedback Loops", hook: "Happy customers sell for you, if you ask them.", chapters: [22], concepts: [
    { name: "Getting reviews", points: ["Ask after delivery, when the product is in hand.", "Photo reviews convert best."] },
    { name: "Service that sells", points: ["Fast replies, clear policies, kind tone.", "Fix it first, argue never."] },
    { name: "Feedback into product", points: ["Tag every complaint; fix the top one each month.", "Tell customers what you changed."] }],
    example: "A three-step review request flow.", action: "Set up a post-delivery review email.", takeaways: ["Ask after delivery.", "Fix first.", "Close the loop on feedback."] },
  { id: "offers-bundles-addons", cluster: "pricing", stage: "Convert", title: "Offers, Bundles and Add-ons That Raise AOV", hook: "Selling a bit more to each buyer is the cheapest growth there is.", chapters: [24, 27], events: ["valentines", "fathers-day"], concepts: [
    { name: "Average order value", points: ["AOV = revenue / orders.", "Every dollar of AOV lifts what you can pay for ads."] },
    { name: "Bundles", points: ["Group what is used together; price below separate total.", "Name bundles by the job they do."] },
    { name: "Add-ons and thresholds", points: ["A small add-on at checkout.", "Free shipping set just above current AOV."] },
    { name: "Offers that keep margin", points: ["Gift with purchase often beats % off.", "Check contribution margin on every offer."] }],
    example: "Lifting AOV from $38 to $51 with one bundle and a threshold.", action: "Design one bundle and check its margin.", takeaways: ["AOV raises your ad limit.", "Bundle by job.", "Gifts often beat discounts."] },
  { id: "bfcm-playbook", cluster: "promos", stage: "Convert", title: "Black Friday and Cyber Monday: The Full Playbook", hook: "The biggest four days of the year reward stores that plan early.", chapters: [25, 26, 34], events: ["bfcm", "thanksgiving"], concepts: [
    { name: "Plan the offer", points: ["One clear, margin-checked offer; no confusing tiers.", "Decide the date range and stick to it."] },
    { name: "Stock and shipping", points: ["Order stock weeks ahead.", "Publish delivery cut-offs."] },
    { name: "Build the list early", points: ["Early-access sign-ups from October.", "Email and SMS do most BFCM sales."] },
    { name: "Ads during the rush", points: ["Costs per click rise; warm audiences convert best.", "Raise budgets gradually on winners."] }],
    example: "A week-by-week BFCM calendar from 8 weeks out.", action: "Write your BFCM offer and check its margin.", takeaways: ["Plan the offer and stock early.", "Grow your list before the rush.", "Warm audiences win when ads get expensive."] },
  { id: "christmas-gifting", cluster: "promos", stage: "Convert", title: "Christmas: Gift Guides, Cut-offs and Last-Minute Sales", hook: "Gift buyers are not your usual buyers. Sell to the giver.", chapters: [24, 25, 36], events: ["christmas", "boxing-day"], concepts: [
    { name: "Sell to the giver", points: ["Gift guides by person and budget.", "Gift wrap, gift notes and gift receipts."] },
    { name: "Shipping cut-offs", points: ["Show the last order date for Christmas delivery everywhere.", "After cut-off: switch to gift cards."] },
    { name: "Gift cards", points: ["Instant, no stock, no shipping.", "Often spent in January with extra purchases."] },
    { name: "Boxing Day and returns", points: ["Plan clearance and a simple returns process.", "Gift returns are a chance to exchange, not refund."] }],
    example: "A one-page gift guide that doubled December email clicks.", action: "Publish your Christmas shipping cut-off dates.", takeaways: ["Sell to the gift giver.", "Cut-offs, then gift cards.", "Turn returns into exchanges."] },
  { id: "emails-that-close", cluster: "email", stage: "Convert", title: "Promotional Emails That Close the Sale", hook: "Campaign emails sell when they are timed, short and specific.", chapters: [26], events: ["singles-day", "new-year"], concepts: [
    { name: "Subject lines", points: ["Specific beats clever.", "Preview text finishes the thought."] },
    { name: "The sale sequence", points: ["Teaser, launch, reminder, last chance.", "Last-chance emails often earn the most."] },
    { name: "Segments", points: ["Buyers vs non-buyers get different messages.", "VIPs get early access."] }],
    example: "A four-email sale sequence for a 48-hour event.", action: "Draft a four-email sequence for your next promo.", takeaways: ["Specific subject lines.", "Teaser to last chance.", "Segment buyers and non-buyers."] },
  { id: "ctr-cvr-aov", cluster: "numbers", stage: "Convert", title: "The Big Three: CTR, Conversion Rate and AOV", hook: "Three numbers explain almost every store. Learn to read them like a doctor.", chapters: [27, 29], concepts: [
    { name: "Click-through rate", points: ["Do people stop and click? It is a creative test.", "Low CTR: fix the hook, not the page."] },
    { name: "Conversion rate", points: ["Of visitors, how many buy? It is a page and offer test.", "Low conversion: fix trust, offer or friction."] },
    { name: "Average order value", points: ["How much per order? It is a bundle and pricing test.", "Raise AOV to afford more ads."] },
    { name: "Funnel math", points: ["Visits x conversion x AOV = revenue.", "Small gains in each multiply."] }],
    example: "Diagnosing three stores from their numbers alone.", action: "Write down your three numbers from the last 30 days.", takeaways: ["CTR tests creative.", "Conversion tests page and offer.", "Gains multiply through the funnel."] },
  { id: "cpa-roas-mer", cluster: "numbers", stage: "Convert", title: "CPA, ROAS, MER and Break-Even", hook: "Ad platforms report one number. Your bank account reports another.", chapters: [28, 32], events: ["eofy"], concepts: [
    { name: "CPA", points: ["Ad spend / purchases.", "Compare to break-even CPA."] },
    { name: "ROAS vs break-even ROAS", points: ["Revenue / ad spend.", "Break-even ROAS = 1 / contribution margin %."] },
    { name: "MER", points: ["Total revenue / total marketing spend.", "The honest blended number."] },
    { name: "Profit after ads", points: ["Contribution minus ad spend minus fixed costs.", "The number that matters."] }],
    example: "Why a 3x ROAS can still lose money.", action: "Calculate your break-even ROAS.", takeaways: ["Know break-even ROAS.", "MER is the honest view.", "Profit after ads is the goal."] },
  { id: "scale-what-works", cluster: "scale", stage: "Grow", title: "Scale What Works Without Breaking It", hook: "Scaling too fast kills more good ads than bad creative.", chapters: [30], concepts: [
    { name: "Vertical scaling", points: ["Raise budgets 20-30% every few days on winners.", "Watch CPA after each step."] },
    { name: "Horizontal scaling", points: ["New angles, new audiences, new channels.", "Feed the account fresh creative weekly."] },
    { name: "Operations keep up", points: ["Stock, service and shipping must scale too.", "Plan stock for the sales you are buying."] }],
    example: "A $50 to $500 a day scaling plan over six weeks.", action: "Pick your best ad and set a scaling ladder.", takeaways: ["Scale in steps.", "Fresh creative weekly.", "Operations must keep up."] },
  { id: "retention-and-ltv", cluster: "retention", stage: "Grow", title: "Bring Them Back: Reorders and Lifetime Value", hook: "The second sale is cheaper than the first. Design for it.", chapters: [31], events: ["new-year"], concepts: [
    { name: "Lifetime value", points: ["Average order x orders per customer x margin.", "Higher LTV lets you pay more to get a customer."] },
    { name: "Post-purchase flow", points: ["Thank you, how to use it, review ask, next product.", "Timing matches when they run out."] },
    { name: "Loyalty and subscriptions", points: ["Reward repeat buyers; subscribe-and-save for consumables.", "Keep it simple."] }],
    example: "Raising repeat rate from 18% to 27% with one email flow.", action: "Map your post-purchase emails by day.", takeaways: ["LTV raises your ad limit.", "Time reorder reminders.", "Simple loyalty works."] },
  { id: "cash-profit-borrowing", cluster: "cash", stage: "Grow", title: "Cash, Profit and When to Borrow", hook: "Profitable stores still run out of money. Here is why.", chapters: [32, 34], events: ["eofy"], concepts: [
    { name: "Profit vs cash", points: ["Stock and ads are paid before sales come in.", "Track cash weekly."] },
    { name: "Cash conversion cycle", points: ["Days to sell stock + days to get paid - days you can delay paying.", "Shorten it to grow faster."] },
    { name: "Borrowing safely", points: ["Borrow for stock that already sells, not for experiments.", "Know the true cost of revenue-based financing."] }],
    example: "A store growing 30% a month that nearly ran out of cash.", action: "Build a 13-week cash forecast.", takeaways: ["Profit is not cash.", "Shorten the cash cycle.", "Borrow only for proven stock."] },
  { id: "suppliers-and-quality", cluster: "ops", stage: "Grow", title: "Suppliers, Quality Checks and Stock Planning", hook: "One bad batch can undo a year of good reviews.", chapters: [33, 34], events: ["summer-deal-days"], concepts: [
    { name: "Picking a supplier", points: ["Samples, references, factory checks.", "Have a back-up supplier."] },
    { name: "Quality checks", points: ["Agree a defect limit and inspect before shipping.", "Photos and measurements from the line."] },
    { name: "Reorder points", points: ["Daily sales x lead time + safety stock.", "Plan seasonal peaks months ahead."] }],
    example: "Working out a reorder point for a product selling 12 a day.", action: "Set a reorder point for your best seller.", takeaways: ["Always have a back-up supplier.", "Inspect before it ships.", "Reorder on a formula."] },
  { id: "safe-legal-records", cluster: "legal", stage: "Grow", title: "Grown-Up Basics: Safe, Legal and Tax-Ready", hook: "Boring until it is very expensive. Twenty minutes now saves months later.", chapters: [35, 36], events: ["eofy"], concepts: [
    { name: "Business set-up", points: ["ABN or equivalent, business name, separate bank account.", "Know when GST or sales tax registration applies."] },
    { name: "Product safety and claims", points: ["Follow safety standards for your category.", "Only make claims you can prove."] },
    { name: "Records", points: ["Keep every invoice and receipt digitally.", "Monthly bookkeeping beats a tax-time panic."] },
    { name: "Consumer law basics", points: ["Customers have rights to refunds for faulty items.", "Clear policies protect you too."] }],
    example: "An end-of-financial-year checklist for a small store.", action: "Open a separate business account if you have not.", takeaways: ["Separate business money.", "Only claim what you can prove.", "Monthly books, calm tax time."] },
  { id: "returns-and-shipping", cluster: "ops", stage: "Grow", title: "Shipping, Returns and the Delivery Experience", hook: "Delivery is part of the product. Customers judge you at the doorstep.", chapters: [36], events: ["boxing-day"], concepts: [
    { name: "Shipping options", points: ["Flat rate, free over threshold, express.", "Show delivery times, not just prices."] },
    { name: "Packaging", points: ["Protective first, pretty second.", "An insert card with a reason to come back."] },
    { name: "Returns policy", points: ["Clear and simple; exchanges first.", "Track return reasons to fix products."] }],
    example: "Setting a free shipping threshold that raised AOV and margin.", action: "Rewrite your returns policy in plain words.", takeaways: ["Show delivery times.", "Use the insert card.", "Track return reasons."] },
  { id: "sell-overseas", cluster: "global", stage: "Grow", title: "Selling Overseas", hook: "Your next market might be a time zone away.", chapters: [37], events: ["singles-day"], concepts: [
    { name: "Choosing a market", points: ["Start where your language, shipping and demand line up.", "Check the size of the market with search data."] },
    { name: "Duties, taxes and currency", points: ["Show prices in local currency.", "Know who pays duties and say so."] },
    { name: "Shipping and returns abroad", points: ["Test delivery times with a real order.", "Local returns address if volume grows."] }],
    example: "Opening the US from Australia: a 30-day plan.", action: "Pick one overseas market and price a test shipment.", takeaways: ["Start with an easy market.", "Local currency and clear duties.", "Test delivery yourself."] },
  { id: "systems-and-hiring", cluster: "systems", stage: "Grow", title: "Systems: Fix the Bottleneck and Hire Help", hook: "You are the bottleneck. That is the good news: it can be fixed.", chapters: [38], concepts: [
    { name: "Find the bottleneck", points: ["What stops more sales this week?", "Fix that one thing before anything else."] },
    { name: "Write it down", points: ["Every repeat task becomes a checklist.", "Checklists are how you hand work over."] },
    { name: "First hires", points: ["Hire for the task that drains you most.", "Start part-time or freelance with a trial."] }],
    example: "Turning customer service into a 10-step checklist.", action: "Write a checklist for one task you repeat weekly.", takeaways: ["Fix the bottleneck first.", "Checklists make work hand-over-able.", "Hire for the draining task."] },
  { id: "founder-habits-stories", cluster: "founder", stage: "Grow", title: "Founder Habits and Stories From Side Hustle to Brand", hook: "Tactics change. Habits compound.", chapters: [39, 40], events: ["new-year"], concepts: [
    { name: "Daily and weekly habits", points: ["Morning numbers check, weekly review, monthly plan.", "Protect deep work time."] },
    { name: "Founder stories", points: ["What growing brands did in year one.", "Common thread: one channel, one hero product, relentless testing."] },
    { name: "Avoid burnout", points: ["Set work hours; automate the repeats.", "Celebrate small wins."] }],
    example: "A founder's weekly review, step by step.", action: "Schedule your first weekly review.", takeaways: ["Habits compound.", "One hero product, one channel, then expand.", "Protect your energy."] } ,
];

// Second set: remixed "deep dive" seminars that club concepts across stages, so later cycles feel new.
const RAW2: Raw[] = [
  { id: "valentines-launch", cluster: "promos", stage: "Convert", title: "Valentine's Day: Gifts, Bundles and Last-Minute Buyers", hook: "Love is a deadline. Plan for the people who leave it late.", chapters: [24, 25, 26], events: ["valentines"], concepts: [
    { name: "Gift positioning", points: ["For him, for her, for friends (Galentine's).", "Show it gift-wrapped."] },
    { name: "Bundles for couples", points: ["Pairs and matching sets.", "Price below the separate total."] },
    { name: "Countdown emails", points: ["Order-by dates in every email.", "Gift card email after the cut-off."] }],
    example: "A Valentine's two-week email and ad calendar.", action: "Make one gift bundle and set the order-by date.", takeaways: ["Sell the gift.", "Pairs bundle well.", "Cut-off dates drive urgency."] },
  { id: "mothers-fathers-day", cluster: "promos", stage: "Convert", title: "Mother's Day and Father's Day Campaigns", hook: "Two of the biggest gifting days, and the buyer is rarely the user.", chapters: [13, 24, 26], events: ["mothers-day", "fathers-day"], concepts: [
    { name: "Gift guides by budget", points: ["Under $25, under $50, premium.", "Personalisation sells."] },
    { name: "Creator gift content", points: ["Creators showing the gift being opened.", "Brief them 4 weeks ahead."] },
    { name: "Sensitive opt-outs", points: ["Let people opt out of these emails.", "It builds trust."] }],
    example: "A gift guide built from your best sellers.", action: "Draft a three-tier gift guide.", takeaways: ["Budget-tier gift guides.", "Brief creators early.", "Offer an opt-out."] },
  { id: "back-to-school", cluster: "promos", stage: "Attract", title: "Back to School: Parents, Teens and Timing", hook: "Parents plan, teens decide. Speak to both.", chapters: [8, 11, 24], events: ["back-to-school"], concepts: [
    { name: "Two buyers", points: ["Parents care about price and durability.", "Teens care about style and what friends use."] },
    { name: "Content for teens", points: ["Short video, real students.", "Haul and 'what's in my bag' formats."] },
    { name: "Bundles and value", points: ["School-pack bundles.", "Multi-buy savings."] }],
    example: "One product, two ads: parent angle vs teen angle.", action: "Write one ad for each buyer.", takeaways: ["Speak to parent and teen.", "Haul formats work.", "Value bundles."] },
  { id: "prime-day-mid-year", cluster: "promos", stage: "Convert", title: "Prime Day and Mid-Year Sales: Compete or Counter-Program", hook: "When giants discount, small brands need a smarter play.", chapters: [19, 25, 28], events: ["summer-deal-days", "eofy"], concepts: [
    { name: "Compete or counter", points: ["Run your own sale alongside, or stand out with value-adds.", "Never race to the bottom on margin."] },
    { name: "Ad costs in peak weeks", points: ["CPMs climb; focus on warm audiences.", "Lower spend on cold prospecting."] },
    { name: "EOFY stock clear", points: ["Clear slow stock before 30 June.", "Cash in hand before the new year."] }],
    example: "A mid-year plan for a store with $20k of slow stock.", action: "List your slow stock and a clearance price.", takeaways: ["Counter-program the giants.", "Warm audiences in peaks.", "Clear stock for cash."] },
  { id: "singles-day-and-asia", cluster: "global", stage: "Grow", title: "Singles' Day (11.11) and Selling Into Asia", hook: "The world's biggest shopping day is not in America.", chapters: [37, 25], events: ["singles-day"], concepts: [
    { name: "What 11.11 is", points: ["A mega-sale that started in China and spread across Asia.", "Shoppers expect bundles and gifts."] },
    { name: "Marketplaces vs your store", points: ["Marketplaces bring traffic but take fees.", "Test with a small range."] },
    { name: "A light 11.11 promo", points: ["A small offer as a warm-up to BFCM.", "Gauge demand cheaply."] }],
    example: "Using 11.11 as a BFCM dress rehearsal.", action: "Plan a small 11.11 test offer.", takeaways: ["11.11 is huge in Asia.", "Marketplaces trade fees for traffic.", "Use it as a rehearsal."] },
  { id: "new-year-reset", cluster: "founder", stage: "Grow", title: "New Year Reset: Goals, Numbers and a 90-Day Plan", hook: "January is when good stores plan and great stores already have a plan.", chapters: [39, 29, 32], events: ["new-year"], concepts: [
    { name: "Review the year", points: ["Best products, channels and months.", "What to stop doing."] },
    { name: "The goals ladder", points: ["Visits, conversion, AOV, orders, revenue, profit.", "One target per rung."] },
    { name: "90-day plan", points: ["Three priorities, weekly reviews.", "Book the reviews now."] }],
    example: "Turning last year's numbers into this quarter's three goals.", action: "Set your 90-day top three.", takeaways: ["Review before you plan.", "Targets on each rung.", "Three priorities only."] },
  { id: "halloween-easter-seasonal", cluster: "promos", stage: "Attract", title: "Seasonal Moments: Halloween, Easter and Micro-Events", hook: "Small seasons give small brands big, cheap attention.", chapters: [11, 17, 25], events: ["halloween", "easter"], concepts: [
    { name: "Find your season", points: ["Not every season fits; pick the ones your buyer cares about.", "Micro-events: national days, local festivals."] },
    { name: "Themed creative", points: ["Refresh product photos and ads for the season.", "Themed packaging inserts."] },
    { name: "Limited editions", points: ["Small runs create urgency.", "Pre-orders reduce stock risk."] }],
    example: "A limited-edition run sold on pre-order.", action: "Pick two seasons that fit your buyer.", takeaways: ["Choose fitting seasons.", "Theme the creative.", "Pre-order limited runs."] },
  { id: "creative-testing-system", cluster: "creative", stage: "Attract", title: "A Creative Testing System You Can Run Weekly", hook: "Winning ads are found, not made. Build the machine that finds them.", chapters: [16, 17, 18], concepts: [
    { name: "The creative pipeline", points: ["Ideas list, scripts, shoot day, edit, launch.", "Five new ads a week is a good rhythm."] },
    { name: "Test structure", points: ["One variable at a time: hook, format or angle.", "Same budget per test."] },
    { name: "Recycling winners", points: ["New hooks on a winning body.", "Turn winning ads into emails and pages."] }],
    example: "One shoot day producing 15 ad variations.", action: "Fill an ideas list with 20 hooks.", takeaways: ["Run a weekly pipeline.", "Test one variable.", "Recycle winners everywhere."] },
  { id: "profit-first-store", cluster: "money", stage: "Grow", title: "Building a Profit-First Store", hook: "Revenue is vanity. Here is how to make every order count.", chapters: [7, 23, 28, 32], concepts: [
    { name: "The profit waterfall", points: ["Revenue down to net profit, line by line.", "Find the biggest leak."] },
    { name: "Price increases", points: ["Small increases often lose fewer sales than feared.", "Test on new customers first."] },
    { name: "Cutting costs without cutting quality", points: ["Renegotiate freight and packaging yearly.", "Cancel unused apps."] }],
    example: "Finding $1,200 a month in a store's profit waterfall.", action: "Open your profit waterfall and find the biggest leak.", takeaways: ["Read the waterfall.", "Test price increases.", "Review costs yearly."] },
  { id: "first-90-days", cluster: "launch", stage: "Launch", title: "Your First 90 Days: A Week-by-Week Launch Plan", hook: "The first three months set your habits, numbers and story.", chapters: [6, 9, 10, 14], concepts: [
    { name: "Weeks 1-4: trust and basics", points: ["Store check, policies, welcome email.", "First 10 sales and reviews."] },
    { name: "Weeks 5-8: first tests", points: ["Organic content rhythm.", "Small ad test with stop rules."] },
    { name: "Weeks 9-12: double down", points: ["Keep the channel that works.", "Plan stock for growth."] }],
    example: "A real 12-week launch calendar.", action: "Put weeks 1-4 into your calendar.", takeaways: ["Basics first.", "Small tests with rules.", "Double down on what works."] },
  { id: "landing-pages-for-ads", cluster: "convert-page", stage: "Convert", title: "Landing Pages Built for Ads", hook: "Sending ad traffic to your home page is paying for people to get lost.", chapters: [20, 21, 27], concepts: [
    { name: "Match the ad", points: ["The page repeats the ad's promise and image.", "One product, one action."] },
    { name: "Proof stack", points: ["Reviews, before/after, guarantees.", "Put proof near the button."] },
    { name: "Measure the page", points: ["Conversion rate by traffic source.", "Fix pages with high traffic and low conversion first."] }],
    example: "Rebuilding a landing page to match a winning ad.", action: "Make one landing page for your best ad.", takeaways: ["Match the ad's promise.", "Stack proof by the button.", "Fix big-traffic pages first."] },
  { id: "community-and-word-of-mouth", cluster: "retention", stage: "Grow", title: "Community, Referrals and Word of Mouth", hook: "The best marketing is a customer who will not stop talking about you.", chapters: [12, 22, 31], concepts: [
    { name: "Referral programs", points: ["Give-get rewards for both sides.", "Ask right after a happy moment."] },
    { name: "Community spaces", points: ["A group or close friends list for your fans.", "Let members shape new products."] },
    { name: "User-generated content", points: ["Repost customers' photos with permission.", "Run it as ads."] }],
    example: "A give-$10-get-$10 program and its numbers.", action: "Set up a simple referral offer.", takeaways: ["Give-get referrals.", "Let fans shape products.", "UGC makes great ads."] },
  { id: "inventory-for-peaks", cluster: "ops", stage: "Grow", title: "Stock for Peak Season Without Drowning in Inventory", hook: "Too little stock loses sales. Too much stock loses cash.", chapters: [33, 34, 32], events: ["bfcm", "christmas"], concepts: [
    { name: "Forecasting peaks", points: ["Last year's sales x growth x peak multiplier.", "Plan by product, not total."] },
    { name: "Lead times", points: ["Factories close for holidays; order early.", "Freight slows down in peak months."] },
    { name: "After the peak", points: ["Plan clearance for leftovers.", "Use pre-orders for slow sizes."] }],
    example: "A peak-season stock forecast for five products.", action: "Forecast your top product for the next peak.", takeaways: ["Forecast by product.", "Order before factory holidays.", "Plan the clearance too."] },
  { id: "ai-tools-for-small-stores", cluster: "systems", stage: "Grow", title: "Using AI and Automation in a Small Store", hook: "Let tools do the repeats so you can do the thinking.", chapters: [38, 39], concepts: [
    { name: "Where automation helps", points: ["Emails, reports, reorder alerts, FAQ replies.", "Automate checklists you already trust."] },
    { name: "Where humans matter", points: ["Brand voice, product decisions, tricky service cases.", "Always review what AI writes."] },
    { name: "Your weekly review with Helix", points: ["Scorecard, goals and the daily tasks.", "Act on one finding a week."] }],
    example: "Automating the Monday numbers report.", action: "List three tasks to automate.", takeaways: ["Automate trusted checklists.", "Humans own voice and decisions.", "Act on one finding a week."] },
  { id: "subscription-and-consumables", cluster: "retention", stage: "Grow", title: "Subscriptions and Consumables: Recurring Revenue", hook: "Get paid every month for something people already buy every month.", chapters: [31, 23], concepts: [
    { name: "Does a subscription fit?", points: ["Products used up on a schedule fit best.", "Test with subscribe-and-save."] },
    { name: "Churn", points: ["Skip and pause beat cancel.", "Check in before the second box."] },
    { name: "Pricing a subscription", points: ["A small saving vs one-off.", "Margin must survive the discount."] }],
    example: "Working out subscriber LTV with churn.", action: "Decide whether a subscription fits your product.", takeaways: ["Fit the use-up cycle.", "Offer skip and pause.", "Keep margin after the discount."] },
  { id: "product-photos-and-video", cluster: "creative", stage: "Attract", title: "Product Photos and Video on a Phone", hook: "Your photos do the selling before your words are read.", chapters: [6, 17, 20], concepts: [
    { name: "The core shots", points: ["Hero on white, in use, close detail, scale.", "Natural light near a window."] },
    { name: "Simple video", points: ["Unboxing, how-to, before/after.", "Vertical first."] },
    { name: "Consistency", points: ["Same background and light for every product.", "Builds a recognisable look."] }],
    example: "A phone-only shoot for one product, start to finish.", action: "Reshoot your best seller's four core shots.", takeaways: ["Four core shots.", "Vertical video first.", "Consistent look."] },
];

const intro = (r: Raw): SeminarSection => ({ title: `Welcome: ${r.title}`, minutes: 2, points: [r.hook, `Today's ${r.concepts.length} ideas: ${r.concepts.map((c) => c.name).join(", ")}.`] });

function build(r: Raw, order: number): Seminar {
  const n = r.concepts.length;
  const per = n >= 4 ? 3 : 4; // 3 concepts x 4 min or 4 concepts x 3 min = 12 min of teaching
  const sections: SeminarSection[] = [
    intro(r),
    ...r.concepts.map((c, i) => ({ title: `Part ${i + 1}: ${c.name}`, minutes: per, points: c.points })),
    { title: "Worked example", minutes: 3, points: [r.example] },
    { title: "Your action and recap", minutes: 2, points: [r.action, ...r.takeaways.slice(0, 2)] },
  ];
  return {
    id: r.id, order, cluster: r.cluster, stage: r.stage, title: r.title, hook: r.hook,
    concepts: r.concepts.map((c) => c.name), chapters: r.chapters, sections,
    minutes: sections.reduce((a, s) => a + s.minutes, 0),
    takeaways: r.takeaways, events: r.events ?? [], learnLinks: r.learn ?? ["/learn"],
  };
}

export const SEMINARS: Seminar[] = [...RAW, ...RAW2].map((r, i) => build(r, i + 1));
export const seminarById = (id: string) => SEMINARS.find((s) => s.id === id);
