import { runRules, type Insight, type Signals } from "./audit";

/**
 * Which blocks of real data a store actually has. Step 2 of the agent pivot:
 * the audit rules must only fire on blocks that are really synced. Anything
 * else is suppressed — never filled in with example numbers and presented
 * as if it were the store's own data. Demo users keep the old behaviour
 * (EXAMPLE_SIGNALS, everything marked example).
 *
 * Blocks that can never be covered today (no API pulls them in):
 * - checkout: checkout completion — Shopify sync pulls orders, not checkouts.
 * - device: mobile vs desktop conversion split — scorecard days carry no device split.
 * - searchTerms: Google search-term rows — the Google sync pulls campaign totals only.
 * - speed: PageSpeed score / LCP — the site check is plain fetches, no PageSpeed API.
 * - social: social presence — no social API is pulled.
 */
export type SyncCoverage = {
  funnel: boolean; // real scorecard days (orders/revenue/sessions) in the last 14 days
  meta: boolean; // Meta snapshot with impressions
  google: boolean; // Google Ads snapshot with campaigns
  email: boolean; // Klaviyo summary (connected + KLAVIYO=1)
  site: boolean; // a real store-check run with facts
  social: boolean; // social presence pull — not built yet
  peak: boolean; // calendar-computable, always true for real users
  checkout: boolean; // checkout completion — not collected yet
  device: boolean; // mobile/desktop split — not collected yet
  searchTerms: boolean; // Google search terms — not pulled yet
  speed: boolean; // PageSpeed score/LCP — no PageSpeed API yet
};

export const emptyCoverage = (): SyncCoverage => ({
  funnel: false, meta: false, google: false, email: false, site: false,
  social: false, peak: false, checkout: false, device: false,
  searchTerms: false, speed: false,
});

/** What each rule needs before it may fire. Thresholds live in audit.ts and are unchanged. */
export const RULE_NEEDS: Record<string, (keyof SyncCoverage)[]> = {
  "ad-good-site-bad": ["meta", "funnel"], // speed evidence is stripped when speed is unknown
  "atc-high-checkout-low": ["funnel", "checkout"],
  "site-good-ctr-weak": ["meta", "funnel"],
  fatigue: ["meta"],
  "views-no-clicks": ["meta"],
  "mer-drift": ["meta", "funnel"],
  "mobile-gap": ["funnel", "device"],
  "email-gap": ["email"],
  "search-term-waste": ["google", "searchTerms"],
  "social-profile-gaps": ["social"],
  "ads-social-mismatch": ["social"],
  "peak-runway": ["peak"],
};

/** Fallback for rules added later: map an insight's source tags to coverage blocks. */
const SOURCE_BLOCK: Record<string, keyof SyncCoverage> = {
  meta: "meta",
  shopify: "funnel",
  pagespeed: "speed",
  crawler: "site",
  klaviyo: "email",
  google: "google",
  instagram: "social",
  tiktok: "social",
  facebook: "social",
  calendar: "peak",
};

const SPEED_EVIDENCE = ["Mobile speed score", "LCP (mobile)"];

/**
 * Run the (unchanged) audit rules over signals, then keep only the insights
 * whose data is really there. Kept insights are real (example: false).
 * Speed evidence is dropped when there is no PageSpeed data, instead of
 * showing a made-up score.
 */
export function insightsFromSignals(signals: Signals, coverage: SyncCoverage): Insight[] {
  return runRules(signals, false)
    .filter((ins) => {
      const needs = RULE_NEEDS[ins.id] ?? ins.source.map((s) => SOURCE_BLOCK[s]).filter(Boolean);
      return needs.every((k) => coverage[k]);
    })
    .map((ins) =>
      coverage.speed
        ? ins
        : { ...ins, evidence: ins.evidence.filter((e) => !SPEED_EVIDENCE.includes(e.label)) },
    );
}
