/** Campaign builder content: proven structures, original EXAMPLE swipe ads, and build checklists ("Guide me" mode). */

export const STRUCTURES = [
  {
    band: "Under $100/day",
    meta: ["01 Cold: automated sales campaign, broad, light exclusions, 4 to 8 ads", "Warm and hot covered by the automated campaign for now"],
    google: ["Brand search (small budget, never limited)", "Feed-only PMax or Standard Shopping with brand excluded"],
    note: "Keep it simple. One campaign that learns fast beats five that never exit learning.",
  },
  {
    band: "$100 to $500/day",
    meta: ["01 Cold: automated, broad, light exclusions", "02 Cold: manual, broad, harsh exclusions (new customers)", "03 Mixed: automated with existing-customer cap 10 to 20%", "04 Warm: visitors 180 days, engagers, minus purchasers", "Build campaign (always off) for staging ads"],
    google: ["Brand search", "Feed-only PMax, hero products split out", "Non-brand search on 1 to 2 product themes"],
    note: "Add one layer at a time. Each needs enough budget for several purchases a week.",
  },
  {
    band: "Over $500/day",
    meta: ["Cold split by offer or product line", "Dedicated testing campaign (manual, 3 to 6 ads per ad set)", "Mixed, Warm and Hot layers with frequency watched by layer", "Partnership ads inside cold campaigns", "Build campaign for staging"],
    google: ["Brand search", "PMax split by margin tier", "Standard Shopping for query control", "Search by theme", "Demand Gen or YouTube for reach"],
    note: "Scale horizontally (new campaigns, new countries) when vertical steps stop holding MER.",
  },
];

export const SWIPES = [
  { format: "Talking head testimonial · 9:16", hook: "I nearly returned this. Then week two happened.", primary: "I bought it for the hot days and expected another stiff linen shirt. It softened after two washes and now it's the one I reach for first. Free returns if it's not for you.", headline: "The shirt that gets better every wash", cta: "Shop now" },
  { format: "One-star rebuttal · 9:16", hook: "\"Too expensive for a shirt.\" Fair. Here's where the money goes.", primary: "European flax, stitched seams that do not twist, and a fit tested on 40 real bodies. Cheaper shirts last a summer. This one lasts years.", headline: "Why it costs what it costs", cta: "Learn more" },
  { format: "Listicle · 4:5 video", hook: "4 reasons this is the only shirt I packed for Bali", primary: "1. Dries overnight. 2. No ironing. 3. Works at the beach and at dinner. 4. Doesn't cling in humidity. Free shipping over $150.", headline: "Pack one shirt, not five", cta: "Shop now" },
  { format: "Static review · 4:5", hook: "★★★★★ \"Finally a linen shirt that fits broad shoulders.\"", primary: "Over 2,000 five-star reviews. Sizes S to 3XL with a fit guide that actually works.", headline: "Find your fit in 30 seconds", cta: "Shop now" },
  { format: "Sale · 9:16", hook: "Our biggest sale of the year ends at midnight.", primary: "30% off everything, plus a free canvas cap over $150. Last chance before we go back to full price for the year.", headline: "30% off ends tonight", cta: "Shop now" },
];

export const META_STEPS = [
  { step: "Write the campaign brief first", detail: "Target CPA, layer, budget, kill and scale rules.", shot: "Brief template in Helix" },
  { step: "Create campaign: objective Sales", detail: "Choose automated or manual setup.", shot: "Ads Manager: objective picker" },
  { step: "Name it with your convention", detail: "Example: 03-Manual-Cold-Broad-Light-TEST-B16", shot: "Campaign name field" },
  { step: "Set budget", detail: "About 2 to 3x target CPA per day. Campaign budget for automated, ad set budget for tight tests.", shot: "Budget and schedule panel" },
  { step: "Conversion location and event", detail: "Website, Purchase. Keep attribution setting consistent.", shot: "Conversion settings" },
  { step: "Audience", detail: "Broad with country and age. Add exclusions for the layer.", shot: "Audience controls" },
  { step: "Placements", detail: "Advantage placements unless you have a reason.", shot: "Placements" },
  { step: "Ads", detail: "3 to 6 ads testing one variable. Primary text, headline, link with UTMs.", shot: "Ad setup: media, text, destination" },
  { step: "Check creative enhancements", detail: "Turn off anything that changes your message.", shot: "Enhancements toggles" },
  { step: "Preview every placement on mobile", detail: "Captions and text inside safe zones.", shot: "Preview panel" },
  { step: "Publish, then hands off for 3 days", detail: "Unless something is broken.", shot: "Review and publish" },
];

export const GOOGLE_STEPS = [
  { step: "Fix the feed", detail: "Titles with search words, images, price, availability, GTIN or brand.", shot: "Merchant Center: products" },
  { step: "Brand search campaign", detail: "Sales goal, brand keywords, sitelinks and callouts, never budget limited.", shot: "Google Ads: new search campaign" },
  { step: "Feed-only PMax", detail: "Link Merchant Center, no extra assets, exclude your brand.", shot: "PMax asset group settings" },
  { step: "Bidding", detail: "Maximise conversion value first; add target ROAS after 30+ conversions in 30 days.", shot: "Bidding panel" },
  { step: "Weekly search terms", detail: "Add negatives, promote converting terms to feed titles.", shot: "Search terms report" },
];

export const PRELAUNCH = [
  "Tracking: Purchase is the only primary conversion and fires once",
  "Landing page matches the ad's promise and offer",
  "Budget is within your daily cap",
  "Naming follows the convention",
  "Kill and scale rules written in the brief",
  "Creative enhancements reviewed",
];
