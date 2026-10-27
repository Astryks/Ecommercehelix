/** "What is this page?" blurbs (max 2 short sentences) and the "what next" pointer for each main page. */
export type Guide = { title: string; what: string; next?: { label: string; href: string } };

export const GUIDES: Record<string, Guide> = {
  today: { title: "Today", what: "This is your daily home. We do 3 small steps together, and it takes about 5 minutes.", next: { label: "Learn something new", href: "/dashboard/learn" } },
  numbers: { title: "Numbers", what: "Here you see how much you sold and how much you kept. Add a few numbers each day and the charts fill in.", next: { label: "See your history", href: "/dashboard/numbers/history" } },
  history: { title: "History", what: "This shows your sales and profit over weeks, months and years. Use it to see if you are growing.", next: { label: "Back to Today", href: "/dashboard" } },
  tools: { title: "Tools", what: "These are small helpers that check your store for you. Open one when you want an answer to a question.", next: { label: "Back to Today", href: "/dashboard" } },
  learn: { title: "Learn", what: "These are short lessons that teach you to grow your store. Do the next one on the path, one at a time.", next: { label: "Back to Today", href: "/dashboard" } },
  courses: { title: "All lessons", what: "Every lesson, sorted into Start, Attract, Convert and Grow. Start at the top and work down.", next: { label: "Open your path", href: "/dashboard/learn" } },
  progress: { title: "Progress", what: "This shows how far you have come. Every lesson and every day of numbers moves you along the road to $100M.", next: { label: "Do today's steps", href: "/dashboard" } },
  settings: { title: "Settings", what: "This is where you change your store details, connections and plan. You don't need to visit often.", next: { label: "Back to Today", href: "/dashboard" } },
  help: { title: "Help", what: "Stuck? Here are simple guides and a way to ask us for help.", next: { label: "Back to Today", href: "/dashboard" } },
  onboarding: { title: "Getting started", what: "We ask a few quick questions about your store. Then we make a simple plan just for you." },
  coach: { title: "Coach", what: "The coach answers questions about your store in plain words. Ask it anything, like you would ask a friend." },
};
