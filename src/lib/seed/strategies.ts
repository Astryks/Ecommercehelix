/** Growth strategies, each offered one at a time: what, why, how, then "Want me to do it for you?". */
export type Strategy = { id: string; emoji: string; title: string; what: string; why: string; how: string[]; helix: string; watch: string; tone: string };

export const STRATEGIES: Strategy[] = [
  {
    id: "daily", emoji: "📈", title: "The daily profit habit",
    what: "Two minutes each morning to add yesterday's numbers and see your profit.",
    why: "You cannot grow what you do not measure. Seeing profit every day stops small leaks becoming big ones.",
    how: ["Add yesterday's sales, orders and ad spend.", "Read the big profit number and the one-line note.", "Do one small task to improve it."],
    helix: "Pulls your ad spend in automatically and tells you in plain words what changed.",
    watch: "Profit, every day", tone: "from-sky-500/15 to-indigo-500/10",
  },
  {
    id: "abandoned", emoji: "🛒", title: "Win back almost-buyers",
    what: "Friendly reminder emails to people who added to cart or started checkout but did not pay.",
    why: "These people nearly bought. A reminder brings many back, usually without a discount.",
    how: ["Turn on checkout reminders.", "Add cart and browsing reminders.", "Only offer a discount to new customers, in the last email."],
    helix: "Writes the emails in your voice and sets them up after you approve.",
    watch: "Email sales and profit", tone: "from-amber-500/15 to-orange-500/10",
  },
  {
    id: "welcome", emoji: "👋", title: "Welcome emails",
    what: "Three to six emails that greet new subscribers and help them make a first order.",
    why: "New subscribers are most interested right after they sign up. This often becomes one of your best earners.",
    how: ["Add a sign-up pop-up.", "Turn on the welcome series.", "Send yourself a test."],
    helix: "Writes the series from your best sellers and brand voice for you to approve.",
    watch: "Email sales and profit", tone: "from-lime-500/15 to-emerald-500/10",
  },
  {
    id: "hooks", emoji: "🎬", title: "Ads that stop the scroll",
    what: "Short videos from real people, with openings that grab attention in the first 3 seconds.",
    why: "If nobody stops scrolling, nobody buys. Better openings lower your ad cost per sale.",
    how: ["Pull phrases from your reviews.", "Write 20 openings.", "Test 3 to 6 at a time, keep the winners."],
    helix: "Writes openings and creator briefs, builds the ads as paused drafts, and grades every test.",
    watch: "Ad cost per sale and profit", tone: "from-fuchsia-500/15 to-violet-500/10",
  },
  {
    id: "launch", emoji: "🚀", title: "New product launch",
    what: "A waitlist, early access for your best customers, launch day and a push halfway through.",
    why: "A launch turns a new product into an event, so more people buy at full price.",
    how: ["Open a waitlist page.", "Plan the emails and ads.", "Plan a 24-hour push mid-launch."],
    helix: "Writes the checklist, emails and creative briefs.",
    watch: "Profit during the launch", tone: "from-cyan-500/15 to-sky-500/10",
  },
  {
    id: "bfcm", emoji: "🛍️", title: "Black Friday plan",
    what: "A 12-week plan: target, offer, list building, build-up, sale days and a calm finish.",
    why: "The biggest week of the year is won weeks before it starts, and a bad offer can wipe out your profit.",
    how: ["Set a profit target.", "Pick an offer that keeps your margin.", "Put emails and ads on a timeline."],
    helix: "Builds the timeline, checks the profit on each offer, and drafts emails and sale ads for your approval.",
    watch: "Profit, compared with your target", tone: "from-violet-500/15 to-indigo-500/10",
  },
  {
    id: "christmas", emoji: "🎁", title: "Christmas gifting",
    what: "Gift guides, bundles, gift cards and clear delivery cut-off dates.",
    why: "Gift shoppers want ideas and certainty. Clear cut-offs and bundles lift order size without discounts.",
    how: ["Make 2 or 3 gift bundles.", "Publish a gift guide.", "Show delivery cut-off dates everywhere."],
    helix: "Suggests gift bundles from your best sellers and reminds customers before cut-offs.",
    watch: "AOV (average order value) and profit", tone: "from-emerald-500/15 to-teal-500/10",
  },
  {
    id: "valentines", emoji: "💌", title: "Valentine's and Mother's Day",
    what: "A small gift edit and a free gift with purchase instead of a store-wide discount.",
    why: "A free gift lifts order size and keeps more profit than a big discount.",
    how: ["Pick 6 to 10 giftable products.", "Choose a free gift above a set amount.", "Email and advertise the edit."],
    helix: "Plans the edit, writes the email and builds the ads as paused drafts, then waits for your OK.",
    watch: "Profit during the promotion", tone: "from-rose-500/15 to-pink-500/10",
  },
];
