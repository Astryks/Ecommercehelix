/** One place for the support contact, used by the Need help box, the help page and the legal pages. */
export const SUPPORT_EMAIL = "support@astryks.com";

export function supportMailto(topic?: string): string {
  const subject = `E-commerce Helix help${topic ? `: ${topic}` : ""}`;
  const body = "Tell us what you were trying to do, what you expected and what happened instead. A screenshot helps.";
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type HelpGuide = { id: string; title: string; why: string; steps: string[] };

/** Things Helix cannot do for you yet, with simple steps to do them yourself. */
export const HELP_GUIDES: HelpGuide[] = [
  {
    id: "daily-numbers",
    title: "Add your sales and costs by hand",
    why: "Until your store is connected, Helix needs your daily sales to work out profit. It takes about a minute a day.",
    steps: [
      "In your store admin, open Analytics, then Reports, then Sales over time. Set the date to yesterday.",
      "Note total sales, discounts, returns and the number of orders.",
      "In Helix, open Today and fill in Update yesterday. Press Save and show my profit.",
      "Have many days to add? Open Your numbers, press Template to download the CSV, fill one row per day, then use Import CSV.",
    ],
  },
  {
    id: "meta-manual",
    title: "Add your Meta ad spend while Meta is not connected",
    why: "Meta only lets invited testers connect until it approves Helix. You can still track ad spend by hand.",
    steps: [
      "Open Meta Ads Manager (adsmanager.facebook.com) and pick your ad account at the top left.",
      "Set the date range to Yesterday, top right.",
      "Read Amount spent in the totals row at the bottom of the table. For sales from ads, use Columns, then Performance, and read Purchases conversion value.",
      "In Helix, type the amount spent into Meta ads ($) on Today, or into Your numbers for that day. Press Save.",
    ],
  },
  {
    id: "meta-reconnect",
    title: "Your Page, ad account or pixel is missing in Helix",
    why: "Facebook only shares what you tick when you connect. Anything made later is not shared until you reconnect.",
    steps: [
      "Open Connections in Helix and press Disconnect next to Meta.",
      "Press Connect Meta and sign in to Facebook.",
      "When Facebook asks which ad accounts, Pages and pixels to share, tick the ones for your store. Press Continue.",
      "Back in Helix, pick them and press Save choice.",
    ],
  },
  {
    id: "store-check",
    title: "The store check could not read your store",
    why: "Helix reads your public home page and one product page. It cannot get past a store password or a block on bots.",
    steps: [
      "Open Settings and check your store address starts with https:// and opens in a private browser window.",
      "If your store still has a password page, remove it when you open (Shopify: Online Store, Preferences, Password protection).",
      "Run the check again from What to fix.",
    ],
  },
  {
    id: "google-ads",
    title: "Google Ads",
    why: "Helix gives step-by-step Google Ads setup lessons. A Google Ads connection is on the way; until then, you click and Helix guides you.",
    steps: [
      "Open Learn and go to the Google Ads lessons (module 9).",
      "Follow each step in your own Google Ads account. Each step says exactly where to click.",
      "Add your daily Google ad spend in Update yesterday so it counts in your profit.",
    ],
  },
  {
    id: "billing",
    title: "Change your plan, card or invoices",
    why: "Payments are handled securely by Stripe. Helix never sees your card.",
    steps: [
      "Open Plan & billing in Helix.",
      "Press Manage billing. Stripe opens in a new page.",
      "Change your plan or card, download invoices, or cancel. Cancelling keeps paid features to the end of the month you paid for.",
    ],
  },
  {
    id: "delete",
    title: "Download or delete your data",
    why: "Your data is yours.",
    steps: [
      "Open Settings.",
      "Press Download my data to get everything Helix stores about you as one file.",
      "To close your account, type DELETE in the box at the bottom of Settings and press Delete my account. This removes your data, disconnects Meta and stops any paid plan.",
    ],
  },
];
