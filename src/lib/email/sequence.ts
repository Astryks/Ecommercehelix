/**
 * The daily email sequence: 30 different emails, one a day from sign-up, then it starts again.
 * Two kinds, mixed: practical lessons from the Helix Playbook, and short founder stories.
 * Each email teaches one idea, gives one small action for today and links to one real lesson.
 * Founder facts are sourced in docs/email-sequence-sources.md. Stories name no brands or people (owner rule, 20 Oct 2026). Prices are in US dollars.
 * Pure data, so tests check every link against docs/playbook.
 */

export type SequenceEmail = {
  kind: "lesson" | "founder";
  subject: string;
  preview: string;
  title: string;
  paras: string[];
  action: string;
  /** slug = docs/playbook file name without .md; heading = the exact "## Lesson x.y: ..." text. */
  lesson: { slug: string; heading: string; label: string };
};

/** Same rule as slugify() in src/lib/learn.ts, which makes the lesson anchors. */
export const anchorFor = (heading: string) => heading.toLowerCase().trim().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");
export const lessonPath = (l: SequenceEmail["lesson"]) => `/learn/${l.slug}#${anchorFor(l.heading)}`;

export const SEQUENCE: SequenceEmail[] = [
  {
    kind: "lesson", subject: "Big sales day. So why is there no money?", preview: "Sales are not the score. Here is the number that is.", title: "Sales are not the score",
    paras: ["A shop can sell US$5,000 in a day and still lose money.", "Why? Some of that money pays for the product. Some pays for shipping. Some pays for ads. What is left over is profit. Profit is the real score.", "So when you look at your store, do not stop at sales. Ask: what did I keep?"],
    action: "Find last month's net sales in your store and write that one number down.",
    lesson: { slug: "01-daily-profit-foundations", heading: "Lesson 1.1: Why revenue is the wrong scoreboard", label: "Read: sales are not the score" },
  },
  {
    kind: "lesson", subject: "Your 2-minute morning habit", preview: "One number, one choice, then get on with your day.", title: "Two minutes every morning",
    paras: ["Pilots check their plane before every flight. Store owners can do the same, and it only takes two minutes.", "Look at one number first: did you make a profit yesterday? Then pick one word for today. Push, hold or defend.", "Small problems are cheap to fix when you spot them early."],
    action: "Open Today in Helix and read your profit for yesterday.",
    lesson: { slug: "01-daily-profit-foundations", heading: "Lesson 1.6: A 2-minute morning routine", label: "Learn the 2-minute routine" },
  },
  {
    kind: "founder", subject: "She cut the feet off her pantyhose", preview: "How Sara Blakely turned US$5,000 into Spanx.", title: "Founder story: Sara Blakely",
    paras: ["Sara Blakely sold fax machines door to door for seven years.", "One day she wanted to wear white pants, but nothing underneath looked right. So she grabbed scissors and cut the feet off her pantyhose. It worked.", "She started Spanx in 2000 with US$5,000 of her own savings and no business degree. Factories told her no for two years. She kept asking until one said yes.", "Later, her product sat in a quiet corner of a big store. So she put it next to the tills herself. It sold so well that the store let her keep doing it."],
    action: "Look at your products and ask: which one do people really want? Check last month's sales for each one.",
    lesson: { slug: "03-offer-and-product", heading: "Lesson 3.7: Check people really want your product", label: "Check what people really want" },
  },
  {
    kind: "lesson", subject: "What does one order really cost you?", preview: "The product is only part of it.", title: "What one order costs",
    paras: ["When someone buys from you, you pay for more than the product.", "There is the product itself. There is the cost to ship it here. There is the box and the postage to send it out. Add them all up and you know your real cost.", "Many stores find the product alone is 20% to 40% of the price."],
    action: "Pick your best seller. Write down its price and everything you pay to get it to a customer.",
    lesson: { slug: "01-daily-profit-foundations", heading: "Lesson 1.2: Your cost drivers", label: "Work out your costs" },
  },
  {
    kind: "lesson", subject: "The line you should not cross", preview: "How much you can spend on ads and still win.", title: "Find your break-even line",
    paras: ["Ads cost money. Spend too much and every sale loses money. Spend too little and nobody finds you.", "Your break-even number is the line in the middle. Under the line, ads pay you back. Over the line, they eat your profit.", "For example, a target of 30% means you can spend US$30 on ads for every US$100 of sales."],
    action: "Work out your target with the simple sum in the lesson, then type it into Helix.",
    lesson: { slug: "01-daily-profit-foundations", heading: "Lesson 1.5: Your target MER and break-even numbers", label: "Find your break-even line" },
  },
  {
    kind: "founder", subject: "Shoes in the trunk of a car", preview: "Nike started with a handshake and US$500 each.", title: "Founder story: Phil Knight",
    paras: ["Phil Knight was a runner. His coach was Bill Bowerman.", "In 1964 they shook hands, put in US$500 each and ordered 300 pairs of running shoes. They called the company Blue Ribbon Sports.", "Phil sold the shoes from the trunk of his green car. He went to the people he knew: runners. Years later, the company became Nike.", "He did not start big. He started close to home, with people who already cared."],
    action: "Think of one way people near you could buy from you this week, like free pickup.",
    lesson: { slug: "22-shopify-store-setup", heading: "Lesson 22.18: Sell to people near you", label: "Sell to people near you" },
  },
  {
    kind: "lesson", subject: "\"But will it work for me?\"", preview: "Answer the worry before they ask.", title: "Give people a reason to believe",
    paras: ["People do not buy until they believe it will work for them.", "Every \"what if\" in their head is a wall. What if it does not fit? What if it breaks? What if it is a waste of money?", "You knock each wall down with proof: a review, a photo, a guarantee or a short video."],
    action: "Write down five reasons someone might not buy from you. Then write one proof for each.",
    lesson: { slug: "03-offer-and-product", heading: "Lesson 3.3: Give people reasons to believe you", label: "Turn worries into proof" },
  },
  {
    kind: "lesson", subject: "Look at your product page on your phone", preview: "Can you see the price and the button without scrolling?", title: "The product page test",
    paras: ["Most people decide to buy on the product page. Most of them are on a phone.", "So open your page on your phone. Can you see the price, the stars and the Add to cart button straight away?", "Then look at the photos. Do they show the product in real life, how big it is and the best detail up close?"],
    action: "Open your best product page on your phone and fix one thing that is hard to see.",
    lesson: { slug: "22-shopify-store-setup", heading: "Lesson 22.5: Product pages: titles, photos and descriptions", label: "Fix your product page" },
  },
  {
    kind: "founder", subject: "From pizza delivery to Gymshark", preview: "A sewing machine, a garage and a smart idea at a show.", title: "Founder story: Ben Francis",
    paras: ["At 19, Ben Francis delivered pizzas for Pizza Hut. He used that money to help start Gymshark in his parents' garage.", "He and his friend Lewis bought a sewing machine and a screen printer. His mum sent him videos to teach him how to sew.", "In 2013 they took their clothes to a fitness show. They had no money for ads. So they gave free clothes to fitness YouTubers they looked up to.", "Those creators wore the clothes in their videos. Sales jumped from about US$450 a day to about US$45,000 a day."],
    action: "Search Instagram or TikTok for people who already talk about the problem your product fixes. Save five.",
    lesson: { slug: "19-creators-ugc-and-video-ads", heading: "Lesson 19.2: Finding the right creators", label: "Find the right creators" },
  },
  {
    kind: "lesson", subject: "Strangers trust strangers", preview: "Why one honest review beats your best sentence.", title: "Let customers do the talking",
    paras: ["You can say your product is great. But people trust other customers more than they trust you.", "That is why reviews matter so much. Show the stars near the top of the page. Show photos from real buyers.", "And never fake a review. It breaks the law in most countries, and people can tell."],
    action: "Ask three happy customers for an honest review today.",
    lesson: { slug: "22-shopify-store-setup", heading: "Lesson 22.7: Reviews", label: "Get more reviews" },
  },
  {
    kind: "lesson", subject: "You have 3 seconds", preview: "The first moment of an ad decides everything.", title: "Stop the scroll",
    paras: ["People scroll fast. Your ad has about three seconds to make them stop.", "That first moment is called the hook. It can be a surprising picture, a bold line or a question that makes people curious.", "A hook that calls out a group works well too, like \"For runners with flat feet...\""],
    action: "Write three different first lines for your next ad.",
    lesson: { slug: "05-creative-strategy", heading: "Lesson 5.7: Hooks (first 0 to 3 seconds)", label: "Write better hooks" },
  },
  {
    kind: "founder", subject: "The sweaty T-shirt that started a company", preview: "A grandma's basement and 500 shirts.", title: "Founder story: the sweaty T-shirt",
    paras: ["One founder played football at college. He hated how his cotton shirts got heavy with sweat.", "So in 1996 he made a better shirt. He worked from his grandma's basement and paid a garment maker to make 500 of them.", "He put the shirts in the trunk of his car and drove from college to college. His first big sale was 200 shirts at US$12 each.", "That first year, his sportswear brand made US$17,000 in sales. It started with one clear problem and a good maker."],
    action: "Write a short list of exactly what you want your product made from and what it should cost you.",
    lesson: { slug: "14-inventory-cash-planning", heading: "Lesson 14.8: Finding and vetting suppliers", label: "Find a good maker" },
  },
  {
    kind: "lesson", subject: "Why faces sell better than logos", preview: "People trust people.", title: "Real people sell",
    paras: ["Picture two ads. One is a shiny logo. The other is a real person saying, \"I switched, and here is why.\"", "Most people trust the second one. It feels real.", "Photos and videos made by customers and creators are called UGC. You can start small: send your product to a few creators and see who makes great videos."],
    action: "Make a list of 10 creators who might like your product.",
    lesson: { slug: "19-creators-ugc-and-video-ads", heading: "Lesson 19.1: Why other people's faces sell your product", label: "Start with creators" },
  },
  {
    kind: "lesson", subject: "The worry nobody says out loud", preview: "Find it and your words feel personal.", title: "Find the hidden worry",
    paras: ["Every product fixes a problem people talk about. \"My dog pulls on the lead.\"", "But there is often a quiet worry under it. \"I hate walking him past other dogs because people stare.\"", "When your words name that quiet worry, people feel you really get them."],
    action: "Write your product's main problem in one line. Under it, write the worry people feel but do not say.",
    lesson: { slug: "29-customers-partners-and-rhythm", heading: "Lesson 29.2: Find the worry behind the purchase", label: "Find the hidden worry" },
  },
  {
    kind: "founder", subject: "Why were glasses so expensive?", preview: "Four friends asked a simple question and built a glasses brand.", title: "Founder story: fairly priced glasses",
    paras: ["Four friends at business school asked a simple question. Why can glasses cost over US$700?", "They first planned to sell glasses for US$45. But their costs doubled, so that price could not work.", "So they asked lots of people what felt fair. US$100 felt not too pricey, but still good quality. That became the price.", "They launched in February 2010. Within four weeks, 20,000 people were on a waiting list."],
    action: "Ask three people in your target market what price feels fair for your product, and write down their answers.",
    lesson: { slug: "03-offer-and-product", heading: "Lesson 3.6: Pricing that is easy to accept", label: "Price it so it feels fair" },
  },
  {
    kind: "lesson", subject: "One more thing in the cart", preview: "Bigger orders make every visitor worth more.", title: "Make each order a bit bigger",
    paras: ["AOV means average order value. It is your sales divided by your orders.", "If each order gets a little bigger, every visitor is worth more, and you can afford to win more customers.", "Easy ways to start: a bundle of things that go together, or a \"goes well with\" idea in the cart."],
    action: "Pick two products that go well together and plan a bundle.",
    lesson: { slug: "09-website-and-cro", heading: "Lesson 9.10: Order value", label: "Grow your order size" },
  },
  {
    kind: "lesson", subject: "Where should free shipping start?", preview: "A simple rule of thumb you can set today.", title: "Set your free shipping amount",
    paras: ["About 7 in 10 online carts get left behind. Surprise costs, like shipping, are the top reason.", "A free shipping amount helps. Shoppers often add one more item to reach it.", "A common rule of thumb: set it about 20 to 30% above your average order value. That is your free shipping amount."],
    action: "Find your average order value and add 20 to 30%.",
    lesson: { slug: "09-website-and-cro", heading: "Lesson 9.11: Shipping psychology", label: "Set free shipping the smart way" },
  },
  {
    kind: "founder", subject: "One pair bought, one pair given", preview: "How a sad fact became a sock brand.", title: "Founder story: one pair given",
    paras: ["Two friends read a fact online. Socks are the most requested clothing item at homeless shelters.", "They could not stop thinking about it. They spent two years making a really comfy sock.", "Then they made a promise: for every pair bought, one pair is given away. Their first goal was 1 million pairs in 10 years. They did it in about two and a half years.", "Their reason for existing was clear, so people knew why to pick them."],
    action: "Write your brand promise in one sentence: why should someone pick you?",
    lesson: { slug: "04-brand-and-content", heading: "Lesson 4.1: The brand core", label: "Write your brand promise" },
  },
  {
    kind: "lesson", subject: "Emails that work while you sleep", preview: "Five little email series that send themselves.", title: "Let emails do the work",
    paras: ["A flow is a set of emails that sends itself when someone does something.", "Someone joins your list? They get a welcome email. Someone leaves items in their cart? They get a gentle reminder.", "Set them up once and they help every single day."],
    action: "Check your email app. Do you have a welcome email set up? If not, start there.",
    lesson: { slug: "10-email-sms-whatsapp", heading: "Lesson 10.2: The five core flows and extras", label: "Set up your email flows" },
  },
  {
    kind: "lesson", subject: "Ask at the happy moment", preview: "A friend's tip is the best ad there is.", title: "Ask for a referral",
    paras: ["When a friend says \"you should try this\", we listen. It is the most trusted way to find new customers.", "Most stores never ask. Or they ask at the wrong time.", "The best time is when people feel happy, like the day after their parcel arrives. Give a small reward to both the customer and their friend."],
    action: "Choose a small reward you can afford for both the customer and the friend.",
    lesson: { slug: "29-customers-partners-and-rhythm", heading: "Lesson 29.4: Ask happy customers to refer a friend", label: "Start getting referrals" },
  },
  {
    kind: "founder", subject: "She built the audience first", preview: "Emily Weiss had readers before she had products.", title: "Founder story: Emily Weiss",
    paras: ["In 2010, Emily Weiss started a beauty blog called Into The Gloss. She asked women about their beauty routines.", "The site became known for those interviews.", "In 2014, her team launched Glossier, a beauty brand inspired by the people who use it.", "When the products arrived, people were already listening."],
    action: "Check how many people are on your email list today, and set a small goal to grow it.",
    lesson: { slug: "11-list-and-audience-growth", heading: "Lesson 11.1: Why build the list", label: "Grow your own audience" },
  },
  {
    kind: "lesson", subject: "Where is my order?", preview: "Answer the same five questions once, well.", title: "Kind, fast answers",
    paras: ["Most customer messages ask the same few things. Where is my order? Can I swap the size? How do I return this?", "Fast, friendly answers turn a worried buyer into a buyer who comes back.", "Write each answer once, in your own voice, and save it."],
    action: "Read your last 20 customer messages and find the question that comes up most.",
    lesson: { slug: "23-fulfilment-shipping-returns", heading: "Lesson 23.7: Customer service that keeps customers", label: "Make support easy" },
  },
  {
    kind: "lesson", subject: "Do the sale maths first", preview: "A discount takes money out of every order.", title: "Before you pick a discount",
    paras: ["A discount does not only cost you on the extra sales. It costs you on every order.", "Say you make US$30 profit on a US$60 item. A 20% discount takes US$12 off. Now you keep US$18, so you need more sales just to stay even.", "Do the maths first. Then pick a discount that still leaves you better off."],
    action: "Write down the price and the profit on your best seller.",
    lesson: { slug: "13-promotions-and-sales", heading: "Lesson 13.13: Work out your sale numbers before you pick the discount", label: "Do the sale maths" },
  },
  {
    kind: "founder", subject: "Two spikes an hour, US$1.50 each", preview: "Yvon Chouinard, a car full of gear and very little money.", title: "Founder story: Yvon Chouinard",
    paras: ["In 1957, Yvon Chouinard bought an old forge and taught himself to be a blacksmith. He set up in a chicken coop in his parents' backyard.", "He made steel spikes for rock climbers. He could make two an hour and sold them for US$1.50 each.", "He sold them from the back of his car. Money was tight. Some weeks he lived on 50 cents to a dollar a day.", "Years later, he started Patagonia. In the early days, every dollar counted."],
    action: "Pick one way to free up cash this month, like asking a supplier if you can pay a bit later.",
    lesson: { slug: "14-inventory-cash-planning", heading: "Lesson 14.3: Five cash levers", label: "Free up your cash" },
  },
  {
    kind: "lesson", subject: "How long is your money stuck?", preview: "Count the days from paying a supplier to getting paid.", title: "Count the stuck days",
    paras: ["You pay for stock. It sits on a shelf. Someone buys it. Then the money reaches your bank.", "All that time, your cash is stuck. The longer it is stuck, the more cash you need to grow.", "Example: US$27,000 of stock, and you sell US$300 of it a day. That stock sits for 90 days."],
    action: "Work out how many days your stock sits before it sells.",
    lesson: { slug: "14-inventory-cash-planning", heading: "Lesson 14.12: Count the days your cash is stuck", label: "Count your stuck days" },
  },
  {
    kind: "lesson", subject: "Lock your doors", preview: "One stolen password can cost more than a bad month.", title: "Keep your accounts safe",
    paras: ["Thieves love ad accounts, because they can spend your money fast.", "The best lock is a second check when you log in. It is called two-factor authentication.", "Use an app for the codes, not text messages. Text codes can be stolen."],
    action: "Turn on two-factor login for your store account today.",
    lesson: { slug: "25-account-safety-agencies", heading: "Lesson 25.1: Lock down every account", label: "Lock down your accounts" },
  },
  {
    kind: "lesson", subject: "Make saying yes feel safe", preview: "Remove the risk and more people buy.", title: "Take the risk away",
    paras: ["Buying online feels a bit risky. What if it is the wrong size? What if nobody answers my question?", "Every worry you remove helps more people say yes.", "Simple fixes: photo reviews, a size chart, a chat button and a real face on your About page."],
    action: "Add a photo of you and two friendly sentences to your About page.",
    lesson: { slug: "03-offer-and-product", heading: "Lesson 3.5: Take the risk off the buyer", label: "Make buying feel safe" },
  },
  {
    kind: "lesson", subject: "Who is your customer, really?", preview: "Use their words, not your guesses.", title: "Picture one real customer",
    paras: ["It is easy to guess who your customer is. Guesses often send you the wrong way.", "Real words work better. Read your reviews and messages. Copy the exact words people use.", "Then you can use those same words in your ads and on your pages."],
    action: "Copy 10 real quotes from your reviews or messages into one note.",
    lesson: { slug: "04-brand-and-content", heading: "Lesson 4.2: Customer profiles", label: "Build a customer profile" },
  },
  {
    kind: "lesson", subject: "Too many things to do?", preview: "Pick one or two. Give them real time.", title: "One or two big things",
    paras: ["When you try to do ten things at once, most of them end up half done.", "Pick one or two big things for the next six weeks. Put real time for them in your calendar.", "Every Friday, check how they are going."],
    action: "Write down the one or two things that matter most for the next six weeks.",
    lesson: { slug: "16-founder-team-productivity", heading: "Lesson 16.3: A few priorities at a time, in short planning blocks", label: "Pick your priorities" },
  },
  {
    kind: "lesson", subject: "Start a wins file today", preview: "For the days when it all feels hard.", title: "Keep your wins",
    paras: ["Every store owner has weeks where nothing seems to work.", "On those days, proof of what you have already done helps you think clearly again.", "Keep a note called Wins. Add every kind review, record day and problem you solved."],
    action: "Make a note on your phone called Wins and add one win from this week.",
    lesson: { slug: "29-customers-partners-and-rhythm", heading: "Lesson 29.16: Keep a wins file for hard weeks", label: "Start your wins file" },
  },
];

/** Which email a user gets on a local date: day 0 is the day they signed up; the sequence then repeats. */
export function sequenceIndex(signupDay: string, today: string): number {
  const days = Math.round((Date.parse(today + "T12:00:00Z") - Date.parse(signupDay + "T12:00:00Z")) / 864e5);
  const n = SEQUENCE.length;
  return ((days % n) + n) % n;
}
