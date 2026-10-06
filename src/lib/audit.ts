import type { PlanId } from "./plans";

/**
 * Proactive audit rules engine (see docs/audit-engine.md).
 * Deterministic rules over normalised signals produce insights with evidence.
 * In this version the signals are EXAMPLE data; crawlers and API pulls are stubbed.
 */

export type Signals = {
  period: string;
  site: { mobileSpeedScore: number; lcpSeconds: number; hasPopup: boolean; reviewsAboveFold: boolean; shippingInfoOnPdp: boolean; freeShipThreshold: number; trustItemsMissing: string[] };
  funnel: { sessions: number; cr: number; mobileCr: number; desktopCr: number; atcRate: number; atcBenchmark: number; checkoutCompletion: number; aov: number };
  meta: { hookRate: number; ctr: number; lpCr: number; storeCr: number; freqNow: number; freqPrev: number; cpmNow: number; cpmPrev: number; ctrNow: number; ctrPrev: number; roasNow: number; roasPrev: number; merNow: number; merPrev: number; thruplayRate: number };
  google: { brandSharePct: number; wastedTerms: { term: string; spend: number }[]; targetCpa: number };
  email: { revenueSharePct: number; missingFlows: string[] };
  social: {
    profiles: { platform: "Instagram" | "TikTok" | "Facebook"; handle: string; lastPostDays: number; postsPerWeek: number; highlights: number; pinned: number; bioHasKeyword: boolean; linkOk: boolean; linkHasUtm: boolean; proofInLast10: number; unansweredQs: number }[];
    liveAdOfferOnProfile: boolean;
    liveAdOffer: string;
  };
  daysToBlackFriday: number;
  hasPeakPlan: boolean;
};

export type Insight = {
  id: string;
  rule: string;
  area: "site" | "ads" | "checkout" | "creative" | "email" | "google" | "peak" | "social";
  severity: "high" | "medium" | "low";
  title: string;
  evidence: { label: string; value: string; benchmark?: string }[];
  why: string;
  fix: string[];
  doIt?: { label: string; tier: PlanId; estAiCost: number };
  learn: { slug: string; anchor?: string; label: string };
  source: string[];
  example: boolean;
};

const pct = (n: number, dp = 1) => `${n.toFixed(dp)}%`;

export function runRules(s: Signals, example = true): Insight[] {
  const out: Insight[] = [];
  const m = s.meta;

  if (m.hookRate >= 25 && m.ctr >= 1.2 && m.lpCr < s.funnel.cr * 0.5)
    out.push({
      id: "ad-good-site-bad", rule: "ad-good-site-bad", area: "site", severity: "high",
      title: "Your ads are working. The landing page is losing the sale.",
      evidence: [
        { label: "Hook rate (Meta, 7d)", value: pct(m.hookRate, 0), benchmark: "25%+" },
        { label: "Outbound CTR", value: pct(m.ctr, 2), benchmark: "1.2%+" },
        { label: "Conversion rate from Meta traffic", value: pct(m.lpCr, 2), benchmark: `Store average ${pct(s.funnel.cr, 2)}` },
        { label: "Mobile speed score", value: String(s.site.mobileSpeedScore), benchmark: "50+" },
      ],
      why: "People stop, watch and click, then leave. Every extra click you pay for is wasted until the page matches the ad and loads fast on mobile.",
      fix: ["Check the ad promise appears in the first screen of the landing page.", "Compress the big top images and remove unused apps to improve mobile speed.", "Add reviews and the guarantee near add to cart.", "Test the mobile checkout yourself."],
      doIt: { label: "Draft landing page fixes", tier: "growth", estAiCost: 0.06 },
      learn: { slug: "20-ad-analysis-audiences-and-setup", anchor: "lesson-207-cross-diagnosis-is-it-the-ad-the-page-the-offer-or-the-checkout", label: "Cross-diagnosis" },
      source: ["meta", "shopify", "pagespeed"], example,
    });

  if (s.funnel.atcRate >= s.funnel.atcBenchmark && s.funnel.checkoutCompletion < 40)
    out.push({
      id: "atc-high-checkout-low", rule: "atc-high-checkout-low", area: "checkout", severity: "high",
      title: "Lots of carts, not many checkouts. Something at checkout is putting people off.",
      evidence: [
        { label: "Add-to-cart rate", value: pct(s.funnel.atcRate), benchmark: `Benchmark ${pct(s.funnel.atcBenchmark)}` },
        { label: "Checkout completion", value: pct(s.funnel.checkoutCompletion, 0), benchmark: "45%+" },
        { label: "Shipping cost shown on product page", value: s.site.shippingInfoOnPdp ? "Yes" : "No" },
      ],
      why: "These shoppers wanted the product. Usually a surprise shipping cost, few payment options or a forced account stops them.",
      fix: ["Show shipping cost or the free shipping threshold on product pages and in the cart.", "Turn on express wallets and buy now pay later.", "Allow guest checkout.", "Show estimated delivery dates."],
      doIt: { label: "Draft shipping message and checkout checklist", tier: "starter", estAiCost: 0.03 },
      learn: { slug: "09-website-and-cro", anchor: "lesson-911-shipping-psychology", label: "Shipping psychology" },
      source: ["shopify", "crawler"], example,
    });

  if (s.funnel.cr >= 2 && m.ctr < 0.8)
    out.push({
      id: "site-good-ctr-weak", rule: "site-good-ctr-weak", area: "creative", severity: "medium",
      title: "Your site converts well, but your ads are not getting the click.",
      evidence: [{ label: "Store conversion rate", value: pct(s.funnel.cr, 2) }, { label: "Meta outbound CTR", value: pct(m.ctr, 2), benchmark: "1%+" }],
      why: "The store is ready for more traffic. New hooks and angles are the fastest way to unlock it.",
      fix: ["Write new hooks from reviews.", "Test a new format.", "Put the offer in the ad."],
      doIt: { label: "Write a creative brief", tier: "starter", estAiCost: 0.04 },
      learn: { slug: "19-creators-ugc-and-video-ads", anchor: "lesson-198-hooks-that-win-the-first-three-seconds", label: "Hooks" },
      source: ["meta", "shopify"], example,
    });

  const freqUp = (m.freqNow - m.freqPrev) / m.freqPrev;
  const cpmUp = (m.cpmNow - m.cpmPrev) / m.cpmPrev;
  if (freqUp >= 0.25 && cpmUp >= 0.15 && m.ctrNow < m.ctrPrev)
    out.push({
      id: "fatigue", rule: "fatigue", area: "creative", severity: "medium",
      title: "Creative fatigue: the same people are seeing the same ads.",
      evidence: [
        { label: "Frequency", value: `${m.freqPrev.toFixed(1)} → ${m.freqNow.toFixed(1)}`, benchmark: "Cold under 1.8" },
        { label: "CPM", value: `$${m.cpmPrev.toFixed(2)} → $${m.cpmNow.toFixed(2)}` },
        { label: "CTR", value: `${pct(m.ctrPrev, 2)} → ${pct(m.ctrNow, 2)}` },
      ],
      why: "Rising frequency and CPM with falling CTR means costs will keep climbing until fresh creative goes in.",
      fix: ["Load a new batch of 4 to 8 ads on your best concept.", "Retire ads with falling CTR.", "Check reach is still growing with spend."],
      doIt: { label: "Draft the next creative batch brief", tier: "starter", estAiCost: 0.04 },
      learn: { slug: "06-defining-campaigns", anchor: "lesson-612-decision-rules-scale-hold-refresh-kill", label: "Decision rules" },
      source: ["meta"], example,
    });

  if (m.thruplayRate >= 15 && m.ctr < 0.5)
    out.push({
      id: "views-no-clicks", rule: "views-no-clicks", area: "creative", severity: "low",
      title: "People watch your videos but do not click. Strengthen the call to action.",
      evidence: [{ label: "ThruPlay rate", value: pct(m.thruplayRate, 0) }, { label: "Outbound CTR", value: pct(m.ctr, 2) }],
      why: "Attention without action usually means a missing CTA or an offer that is not in the ad.",
      fix: ["End with a specific CTA and reason to act now.", "Show the offer on screen."],
      learn: { slug: "19-creators-ugc-and-video-ads", anchor: "lesson-199-scripting", label: "Scripting" },
      source: ["meta"], example,
    });

  if (m.roasNow >= m.roasPrev * 0.95 && m.merNow - m.merPrev >= 3)
    out.push({
      id: "mer-drift", rule: "mer-drift", area: "ads", severity: "medium",
      title: "Platform ROAS looks steady, but your real MER is getting worse.",
      evidence: [{ label: "Meta ROAS", value: `${m.roasPrev.toFixed(2)} → ${m.roasNow.toFixed(2)}` }, { label: "MER", value: `${pct(m.merPrev)} → ${pct(m.merNow)}` }],
      why: "Retargeting may be taking credit for sales that would have happened anyway, while fewer new customers arrive.",
      fix: ["Shift budget toward cold campaigns.", "Check new customer share.", "Plan a one-week holdout test."],
      learn: { slug: "20-ad-analysis-audiences-and-setup", anchor: "lesson-209-attribution-and-incrementality", label: "Attribution" },
      source: ["meta", "shopify"], example,
    });

  if (s.funnel.mobileCr < s.funnel.desktopCr * 0.5)
    out.push({
      id: "mobile-gap", rule: "mobile-gap", area: "site", severity: "medium",
      title: "Mobile converts at less than half the desktop rate.",
      evidence: [{ label: "Mobile CR", value: pct(s.funnel.mobileCr, 2) }, { label: "Desktop CR", value: pct(s.funnel.desktopCr, 2) }, { label: "LCP (mobile)", value: `${s.site.lcpSeconds.toFixed(1)}s`, benchmark: "Under 2.5s" }],
      why: "Most of your traffic is mobile. Closing even part of this gap is often the biggest win available.",
      fix: ["Speed up the mobile product page.", "Add a sticky add-to-cart button.", "Shorten the page above the fold."],
      doIt: { label: "Draft mobile fixes", tier: "growth", estAiCost: 0.05 },
      learn: { slug: "09-website-and-cro", anchor: "lesson-94-speed", label: "Speed" },
      source: ["shopify", "pagespeed"], example,
    });

  if (s.email.missingFlows.length)
    out.push({
      id: "email-gap", rule: "email-gap", area: "email", severity: s.email.missingFlows.length >= 3 ? "high" : "medium",
      title: `${s.email.missingFlows.length} email flows are missing. That is money left on the table every day.`,
      evidence: [{ label: "Email share of revenue", value: pct(s.email.revenueSharePct, 0), benchmark: "20%+ is common for healthy stores" }, { label: "Missing", value: s.email.missingFlows.join(", ") }],
      why: "Flows run 24/7 and catch shoppers at their highest intent. Each one is set up once and keeps earning.",
      fix: ["Open Email automation.", "Review the drafts for the missing flows.", "Approve to set them up."],
      doIt: { label: "Draft and set up the missing flows", tier: "growth", estAiCost: 0.12 },
      learn: { slug: "10-email-sms-whatsapp", anchor: "lesson-102-the-five-core-flows-and-extras", label: "Core flows" },
      source: ["klaviyo"], example,
    });

  if (s.google.wastedTerms.length)
    out.push({
      id: "search-term-waste", rule: "search-term-waste", area: "google", severity: "low",
      title: `${s.google.wastedTerms.length} Google search terms spent money with no sales.`,
      evidence: s.google.wastedTerms.map((t) => ({ label: `"${t.term}"`, value: `$${t.spend.toFixed(0)}, 0 sales`, benchmark: `Target CPA $${s.google.targetCpa}` })),
      why: "Irrelevant searches drain budget from the ones that sell.",
      fix: ["Add these as negative keywords.", "Review search terms weekly."],
      doIt: { label: "Add negatives (with approval)", tier: "starter", estAiCost: 0.01 },
      learn: { slug: "08-google-ads", anchor: "lesson-88-weekly-optimisation", label: "Weekly optimisation" },
      source: ["google"], example,
    });


  const gaps = s.social.profiles.flatMap((p) => {
    const g: string[] = [];
    if (!p.bioHasKeyword) g.push(`${p.platform}: bio does not say what you sell`);
    if (!p.linkOk) g.push(`${p.platform}: link missing or broken`);
    else if (!p.linkHasUtm) g.push(`${p.platform}: link has no UTM tracking`);
    if (p.lastPostDays > 14) g.push(`${p.platform}: last post ${p.lastPostDays} days ago`);
    else if (p.postsPerWeek < 2) g.push(`${p.platform}: ${p.postsPerWeek} posts a week`);
    if (p.platform === "Instagram" && p.highlights < 3) g.push(`Instagram: only ${p.highlights} highlights`);
    if (p.pinned === 0) g.push(`${p.platform}: no pinned posts`);
    if (p.proofInLast10 === 0) g.push(`${p.platform}: no reviews or customer content in last 10 posts`);
    if (p.unansweredQs > 0) g.push(`${p.platform}: ${p.unansweredQs} unanswered questions`);
    return g;
  });
  if (gaps.length >= 2)
    out.push({
      id: "social-profile-gaps", rule: "social-profile-gaps", area: "social", severity: gaps.length >= 5 ? "medium" : "low",
      title: `Your social profiles have ${gaps.length} gaps that cost you trust from ad viewers.`,
      evidence: gaps.slice(0, 6).map((g) => { const [k, v] = g.split(": "); return { label: k, value: v }; }),
      why: "Many people tap your profile after seeing an ad. A stale or unclear profile loses them before they reach your store.",
      fix: ["Rewrite bios: what you sell, proof, reason to tap now.", "Fix links and add UTMs.", "Add Reviews, Best sellers and Shipping highlights.", "Pin your best product video, proof and brand story.", "Set a posting rhythm you can keep."],
      doIt: { label: "Draft bios, highlights plan and a 4-week calendar", tier: "starter", estAiCost: 0.04 },
      learn: { slug: "21-brand-and-social-presence", anchor: "lesson-212-profile-checklist-instagram-tiktok-facebook", label: "Profile checklist" },
      source: ["instagram", "tiktok", "facebook"], example,
    });
  if (!s.social.liveAdOfferOnProfile)
    out.push({
      id: "ads-social-mismatch", rule: "ads-social-mismatch", area: "social", severity: "low",
      title: "Your ads promote an offer your profiles never mention.",
      evidence: [{ label: "Live ad offer", value: s.social.liveAdOffer }, { label: "On Instagram or TikTok profile", value: "Not found in bio, pinned posts or last 9 posts" }],
      why: "Shoppers who check you out after the ad expect to see the same offer. A mismatch lowers trust and conversion.",
      fix: ["Mention the offer in your bio line 3.", "Pin a post about it.", "Add it to a highlight while it runs."],
      learn: { slug: "21-brand-and-social-presence", anchor: "lesson-212-profile-checklist-instagram-tiktok-facebook", label: "Consistency with ads" },
      source: ["meta", "instagram"], example,
    });

  if (s.daysToBlackFriday <= 70 && !s.hasPeakPlan)
    out.push({
      id: "peak-runway", rule: "peak-runway", area: "peak", severity: "high",
      title: `Black Friday is ${Math.round(s.daysToBlackFriday / 7)} weeks away and there is no plan yet.`,
      evidence: [{ label: "Days to Black Friday", value: String(s.daysToBlackFriday) }, { label: "Peak plan", value: "Not started" }],
      why: "Offer, creative, list size, stock and site speed are decided weeks before the sale. Starting now gives you time to do it well.",
      fix: ["Set a revenue target.", "Choose the offer.", "Check stock for best sellers.", "Book creative and email dates."],
      doIt: { label: "Build your Black Friday timeline", tier: "growth", estAiCost: 0.08 },
      learn: { slug: "06-defining-campaigns", anchor: "lesson-614-promotional-and-seasonal-campaigns", label: "Promotional campaigns" },
      source: ["calendar"], example,
    });

  const rank = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

/** EXAMPLE signals until real pulls are connected. */
export const EXAMPLE_SIGNALS: Signals = {
  period: "Last 7 days (example)",
  site: { mobileSpeedScore: 38, lcpSeconds: 4.6, hasPopup: true, reviewsAboveFold: false, shippingInfoOnPdp: false, freeShipThreshold: 150, trustItemsMissing: ["guarantee", "payment badges"] },
  funnel: { sessions: 7400, cr: 2.2, mobileCr: 1.4, desktopCr: 3.3, atcRate: 9.1, atcBenchmark: 7.5, checkoutCompletion: 34, aov: 92 },
  meta: { hookRate: 31, ctr: 1.4, lpCr: 0.9, storeCr: 2.2, freqNow: 2.3, freqPrev: 1.7, cpmNow: 12.1, cpmPrev: 10.2, ctrNow: 1.1, ctrPrev: 1.4, roasNow: 2.5, roasPrev: 2.55, merNow: 26.9, merPrev: 23.1, thruplayRate: 12 },
  google: { brandSharePct: 31, wastedTerms: [{ term: "free linen shirt pattern", spend: 64 }, { term: "linen shirt jobs", spend: 41 }], targetCpa: 55 },
  email: { revenueSharePct: 11, missingFlows: ["Abandoned cart", "Browse abandonment", "Win-back"] },
  social: {
    profiles: [
      { platform: "Instagram", handle: "@examplelinen", lastPostDays: 9, postsPerWeek: 1.5, highlights: 2, pinned: 0, bioHasKeyword: false, linkOk: true, linkHasUtm: false, proofInLast10: 1, unansweredQs: 4 },
      { platform: "TikTok", handle: "@examplelinen", lastPostDays: 23, postsPerWeek: 0.5, highlights: 0, pinned: 1, bioHasKeyword: true, linkOk: false, linkHasUtm: false, proofInLast10: 0, unansweredQs: 0 },
    ],
    liveAdOfferOnProfile: false,
    liveAdOffer: "Weekend Bundle: free gift over $150",
  },
  daysToBlackFriday: 52,
  hasPeakPlan: false,
};

export const SOCIAL_CHECKLIST_EXAMPLE = [
  { check: "Instagram bio says what you sell", result: "Brand name only", status: "red" as const },
  { check: "Link in bio", result: "Works, no UTMs; TikTok link missing", status: "amber" as const },
  { check: "Highlights (Reviews, Best sellers, Shipping)", result: "2 of 4", status: "amber" as const },
  { check: "Pinned posts", result: "None on Instagram", status: "red" as const },
  { check: "Posting cadence (4 weeks)", result: "IG 1.5/wk · TikTok 0.5/wk", status: "amber" as const },
  { check: "Proof in last 10 posts", result: "1 review post", status: "amber" as const },
  { check: "Comment replies", result: "4 questions unanswered > 48h", status: "red" as const },
  { check: "Same handle on every platform", result: "Yes", status: "green" as const },
];

export const SITE_CHECKLIST_EXAMPLE = [
  { check: "Mobile speed score", result: "38 / 100", status: "red" as const },
  { check: "Largest contentful paint (mobile)", result: "4.6s", status: "red" as const },
  { check: "Reviews above the fold on top products", result: "Missing on 3 of 5", status: "amber" as const },
  { check: "Shipping cost or threshold on product pages", result: "Not found", status: "red" as const },
  { check: "Free shipping threshold vs AOV", result: "$150 vs $92 AOV (too high)", status: "amber" as const },
  { check: "Email capture pop-up", result: "Found, 2.1% sign-up", status: "amber" as const },
  { check: "Guarantee and trust badges", result: "Guarantee missing", status: "amber" as const },
  { check: "Express wallets at checkout", result: "Found", status: "green" as const },
  { check: "Pixel and tag on page load", result: "Found", status: "green" as const },
  { check: "Titles and meta descriptions", result: "4 duplicates", status: "amber" as const },
];
