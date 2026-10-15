/** The template library: short, copy-ready text in Helix's own words. Swap the [brackets] for your details. */
export type Template = { id: string; title: string; when: string; stage: "attract" | "convert" | "grow"; body: string };

export const TEMPLATES: Template[] = [
  {
    id: "creator-outreach", stage: "attract", title: "Message to a creator", when: "Asking a creator to try your product (4 to 6 weeks before a sale).",
    body: `Hi [name],\n\nI run [store name]. We make [product in a few words]. I love your posts about [something real you liked].\n\nCould I send you one for free? No strings. If you like it and want to share it, I can give you a code for your followers: [CODE] for [x]% off, and you earn [y]% of each sale.\n\nWould that suit you? Happy to send it to wherever is easiest.\n\nThanks,\n[your name]`,
  },
  {
    id: "gifting-note", stage: "attract", title: "Note in a gifted parcel", when: "Goes in the box when you send a creator a free product.",
    body: `Hi [name],\n\nThank you for trying [product]. No pressure to post. If you do share it, your code is [CODE] and your link is [link].\n\nAny questions, just reply to my message.\n\n[your name], [store name]`,
  },
  {
    id: "sale-announcement", stage: "convert", title: "Sale email", when: "The day a sale starts.",
    body: `Subject: It's on: [x]% off [what] until [day]\n\nHi [first name],\n\nOur [event] sale starts now. Take [x]% off [what] with code [CODE] until [day and time].\n\n[One line on your best seller and why people love it.]\n\n[Button: Shop the sale]\n\nWhen it ends, it ends.\n[store name]`,
  },
  {
    id: "last-chance", stage: "convert", title: "Last-chance email", when: "The final day of a sale.",
    body: `Subject: Last day for [x]% off\n\nHi [first name],\n\nA quick note: our sale ends tonight at [time].\n\nCode [CODE] still works until then.\n\n[Button: Shop before it ends]\n\n[store name]`,
  },
  {
    id: "announcement-bar", stage: "convert", title: "Announcement bar lines", when: "The thin strip at the top of your store.",
    body: `[Event] sale: [x]% off with code [CODE]\nFree shipping on orders over $[amount]\nOrder by [date] to get it in time for [event]\nSale ends [day] at midnight`,
  },
  {
    id: "welcome-email", stage: "grow", title: "Welcome email", when: "Sent right after someone joins your list.",
    body: `Subject: Welcome to [store name]\n\nHi [first name],\n\nThanks for joining us. Here is what we are about: [one line].\n\nAs a thank-you, here is [x]% off your first order: [CODE].\n\n[Button: Start shopping]\n\nReply any time. A real person reads every email.\n[your name]`,
  },
  {
    id: "review-request", stage: "grow", title: "Ask for a review", when: "About 7 to 10 days after an order arrives.",
    body: `Subject: How is your [product]?\n\nHi [first name],\n\nYour [product] should have arrived by now. Would you leave a short review? It takes a minute and helps other people choose.\n\n[Button: Leave a review]\n\nThank you,\n[store name]`,
  },
  {
    id: "thank-you", stage: "grow", title: "Thank-you after a sale", when: "The week after a big sale ends.",
    body: `Subject: Thank you\n\nHi [first name],\n\nThank you for being part of our [event] sale. It was our [biggest/busiest] week yet.\n\nYour order is on its way. If anything is not right, just reply and we will fix it.\n\n[store name]`,
  },
];
