import { describe, expect, it } from "vitest";
import { EXAMPLE_SIGNALS, type Signals } from "@/lib/audit";
import { emptyCoverage, insightsFromSignals, type SyncCoverage } from "@/lib/signal-coverage";

/** Signals that would trigger most rules if the data were all real. */
const liveSignals = (): Signals => ({
  ...EXAMPLE_SIGNALS,
  period: "Your data, last 7 days",
  funnel: { sessions: 8000, cr: 2.5, mobileCr: 2.5, desktopCr: 2.5, atcRate: 9, atcBenchmark: 6, checkoutCompletion: 100, aov: 92 },
  meta: {
    hookRate: 31, ctr: 0.4, lpCr: 0.9, storeCr: 2.5,
    freqNow: 2.3, freqPrev: 1.7, cpmNow: 12.1, cpmPrev: 10.2, ctrNow: 0.4, ctrPrev: 1.4,
    roasNow: 2.5, roasPrev: 2.55, merNow: 26.9, merPrev: 23.1, thruplayRate: 18,
  },
  google: { brandSharePct: 31, wastedTerms: [], targetCpa: 55 },
  email: { revenueSharePct: 11, missingFlows: ["Abandoned cart", "Browse abandonment", "Win-back"] },
  social: { profiles: [], liveAdOfferOnProfile: true, liveAdOffer: "" },
  daysToBlackFriday: 52,
  hasPeakPlan: false,
});

const covered = (): SyncCoverage => ({
  ...emptyCoverage(), funnel: true, meta: true, google: true, email: true, site: true, peak: true,
});

const ids = (ins: { id: string }[]) => ins.map((i) => i.id).sort();

describe("insightsFromSignals — only rules with real data may fire", () => {
  it("fires the evaluable rules on real Meta + funnel + email data, marked as real", () => {
    const out = insightsFromSignals(liveSignals(), covered());
    expect(ids(out)).toEqual([
      "email-gap", "fatigue", "mer-drift", "peak-runway", "site-good-ctr-weak", "views-no-clicks",
    ]);
    expect(out.every((i) => i.example === false)).toBe(true);
  });

  it("fires ad-good-site-bad on real ad + funnel data but strips the PageSpeed evidence", () => {
    const s = liveSignals();
    s.meta = { ...s.meta, hookRate: 31, ctr: 1.4, ctrNow: 1.4, ctrPrev: 1.4, lpCr: 0.9 };
    const out = insightsFromSignals(s, covered());
    const hit = out.find((i) => i.id === "ad-good-site-bad");
    expect(hit).toBeDefined();
    expect(hit!.evidence.map((e) => e.label)).not.toContain("Mobile speed score");
    expect(hit!.evidence.map((e) => e.label)).not.toContain("LCP (mobile)");
    expect(hit!.evidence.some((e) => e.label.startsWith("Hook rate"))).toBe(true);
  });

  it("raises nothing when nothing is synced — no guessing from empty data", () => {
    expect(insightsFromSignals(liveSignals(), emptyCoverage())).toEqual([]);
  });

  it("suppresses rules whose data is never collected, even when the numbers would trigger them", () => {
    const s = liveSignals();
    // Mobile converts at a quarter of desktop; carts pile up at checkout; wasted search terms exist.
    s.funnel = { ...s.funnel, mobileCr: 0.8, desktopCr: 3.3, checkoutCompletion: 30 };
    s.google = { ...s.google, wastedTerms: [{ term: "free pattern", spend: 64 }] };
    s.social = {
      profiles: [{ platform: "Instagram", handle: "@x", lastPostDays: 30, postsPerWeek: 0.5, highlights: 1, pinned: 0, bioHasKeyword: false, linkOk: false, linkHasUtm: false, proofInLast10: 0, unansweredQs: 5 }],
      liveAdOfferOnProfile: false,
      liveAdOffer: "Weekend Bundle",
    };
    const out = insightsFromSignals(s, covered());
    expect(ids(out)).not.toContain("mobile-gap");
    expect(ids(out)).not.toContain("atc-high-checkout-low");
    expect(ids(out)).not.toContain("search-term-waste");
    expect(ids(out)).not.toContain("social-profile-gaps");
    expect(ids(out)).not.toContain("ads-social-mismatch");
  });

  it("suppresses Meta rules when Meta is not synced, but keeps email and peak rules", () => {
    const c = covered();
    c.meta = false;
    c.funnel = false;
    const out = insightsFromSignals(liveSignals(), c);
    expect(ids(out)).toEqual(["email-gap", "peak-runway"]);
  });
});
