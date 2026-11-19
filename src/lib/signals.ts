import "server-only";
import { EXAMPLE_SIGNALS, runRules, type Insight, type Signals } from "./audit";
import { emptyCoverage, insightsFromSignals, type SyncCoverage } from "./signal-coverage";
import { getDays, getSeasonPlans, getSettings } from "./repo";
import { getSnapshot } from "./meta/store";
import { getGoogleSnapshot } from "./google-ads/service";
import { klaviyoOn } from "./klaviyo/config";
import { klaviyoSummary } from "./klaviyo/service";
import { auditRuns } from "./site-audit/run";
import { getSocialPresence } from "./social-presence";
import { blackFriday } from "./seasons";
import { addDays, isoDay } from "./dates";
import { isDemoUserId } from "./demo-auth";
import { derive, sum, type DayInput } from "./scorecard";
import { targetsFrom } from "./targets";

export type LiveSignals = {
  insights: Insight[];
  signals: Signals;
  metaLive: boolean;
  coverage: SyncCoverage;
  demo: boolean;
};

/**
 * Audit signals for one user, built from real synced data where it exists.
 *
 * - Demo users: the old EXAMPLE_SIGNALS, everything marked example (the demo
 *   is how the product is tried with zero keys).
 * - Real users: funnel from real scorecard days, Meta/Google from their
 *   snapshots, email from Klaviyo, site from the latest store check, peak
 *   from the calendar. Blocks with no real data are filled with neutral
 *   values that cannot trigger a rule, and insightsFromSignals() drops any
 *   rule whose data is missing — so a real user never sees an insight
 *   computed from made-up numbers. Thresholds in audit.ts are unchanged.
 */
export async function signalsFor(userId: string): Promise<{ signals: Signals; metaLive: boolean; coverage: SyncCoverage; demo: boolean }> {
  if (isDemoUserId(userId)) return { signals: EXAMPLE_SIGNALS, metaLive: false, coverage: emptyCoverage(), demo: true };

  const today = isoDay();
  const [days, snap, gaSnap, kSum, runs, plans, settings, presence] = await Promise.all([
    getDays(userId),
    getSnapshot(userId),
    getGoogleSnapshot(userId).catch(() => null),
    klaviyoOn() ? klaviyoSummary(userId).catch(() => null) : Promise.resolve(null),
    auditRuns(userId, 1).catch(() => []),
    getSeasonPlans(userId).catch(() => []),
    getSettings(userId).catch(() => null),
    getSocialPresence(userId).catch(() => null),
  ]);

  const realDays = days.filter((d) => !d.example);
  const last14 = realDays.filter((d) => d.date >= addDays(today, -14));
  const last7 = realDays.filter((d) => d.date >= addDays(today, -7));
  const prior7 = realDays.filter((d) => d.date >= addDays(today, -14) && d.date < addDays(today, -7));
  const sum7 = sum(last7);
  const d7 = derive(sum7, { monthlyRevenueTarget: 0, targetMerPct: 0, fixedCostsMonthly: 0 });
  const mer = (arr: DayInput[]) => {
    const t = sum(arr);
    const net = t.revenue - t.discounts - t.refunds;
    return net > 0 ? ((t.adMeta + t.adGoogle + t.adTiktok + t.adOther) / net) * 100 : 0;
  };
  const sessions7 = sum7.sessions;
  const storeCr = sessions7 > 0 ? (sum7.orders / sessions7) * 100 : 0;

  const metaLive = Boolean(snap && snap.now.impressions > 0);
  const funnelLive = last14.filter((d) => d.orders > 0).length >= 3;
  const googleLive = Boolean(gaSnap && gaSnap.campaigns.length > 0);
  const emailLive = Boolean(kSum);
  const siteRun = runs.find((r) => r.ok && r.facts);
  const siteLive = Boolean(siteRun?.facts);

  const facts = siteRun?.facts ?? null;
  const coverage: SyncCoverage = {
    ...emptyCoverage(),
    funnel: funnelLive,
    meta: metaLive,
    google: googleLive,
    email: emailLive,
    site: siteLive,
    social: Boolean(presence), // weekly Graph pull (finishing step); TikTok profile still needs Login Kit
    peak: true, // calendar-computable
    checkout: false, // Shopify sync pulls orders, not checkouts
    device: false, // scorecard days carry no mobile/desktop split
    searchTerms: Boolean(gaSnap?.searchTermsSynced), // Google search-term pull (finishing step)
    speed: Boolean(facts?.speed), // PageSpeed pull, key-gated (finishing step)
  };

  const revenue30 = sum(realDays.filter((d) => d.date >= addDays(today, -30)));
  const net30 = revenue30.revenue - revenue30.discounts - revenue30.refunds;
  const gaSpend = gaSnap ? gaSnap.campaigns.reduce((s, c) => s + c.spend, 0) : 0;
  const gaBrandSpend = gaSnap ? gaSnap.campaigns.filter((c) => /brand/i.test(c.name)).reduce((s, c) => s + c.spend, 0) : 0;

  const bf = blackFriday(Number(today.slice(0, 4)));
  const bfDate = bf < today ? blackFriday(Number(today.slice(0, 4)) + 1) : bf;
  const daysToBf = Math.max(0, Math.round((new Date(`${bfDate}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000));

  const { now, prev } = snap ?? { now: null, prev: null };
  const signals: Signals = {
    period: coverage.funnel || coverage.meta || coverage.google || coverage.email || coverage.site
      ? `Your data, last 7 days to ${addDays(today, -1)}`
      : "No synced data yet — connect Shopify or Meta, or add yesterday's numbers on the Scorecard.",
    site: {
      mobileSpeedScore: facts?.speed?.score ?? 100, // real when a PageSpeed pull ran; evidence is stripped when it did not (see signal-coverage.ts)
      lcpSeconds: facts?.speed?.lcpSeconds ?? 1,
      hasPopup: (facts?.emailCapture.length ?? 0) > 0,
      reviewsAboveFold: facts?.product?.reviewsBeforeBuy ?? false,
      shippingInfoOnPdp: Boolean(facts?.shippingText),
      freeShipThreshold: facts?.freeShippingFrom ?? 0,
      trustItemsMissing: [],
    },
    funnel: {
      sessions: sessions7,
      cr: storeCr,
      mobileCr: storeCr, // no device split: neutral, mobile-gap rule stays suppressed
      desktopCr: storeCr,
      atcRate: d7.atcRate,
      atcBenchmark: 6,
      checkoutCompletion: 100, // not collected: neutral, rule stays suppressed
      aov: d7.aov,
    },
    meta: now
      ? {
          hookRate: now.hookRate ?? 0,
          ctr: now.ctr,
          lpCr: now.lpViews ? (now.purchases / now.lpViews) * 100 : now.outboundClicks ? (now.purchases / now.outboundClicks) * 100 : 0,
          storeCr,
          freqNow: now.frequency, freqPrev: prev?.frequency || now.frequency,
          cpmNow: now.cpm, cpmPrev: prev?.cpm || now.cpm,
          ctrNow: now.ctr, ctrPrev: prev?.ctr || now.ctr,
          roasNow: now.roas, roasPrev: prev?.roas || now.roas,
          merNow: mer(last7), merPrev: mer(prior7),
          thruplayRate: now.impressions ? (now.thruplays / now.impressions) * 100 : 0,
        }
      : { ...EXAMPLE_SIGNALS.meta, hookRate: 0, ctr: 0, lpCr: 0, storeCr, freqNow: 0, freqPrev: 0, cpmNow: 0, cpmPrev: 0, ctrNow: 0, ctrPrev: 0, roasNow: 0, roasPrev: 0, merNow: 0, merPrev: 0, thruplayRate: 0 },
    google: {
      brandSharePct: gaSpend > 0 ? (gaBrandSpend / gaSpend) * 100 : 0,
      // Wasted = spent >= 1x break-even CPA with 0 conversions (audit.ts rule).
      // Break-even CPA = AOV x what is kept before ads, from the store's own costs.
      wastedTerms: (() => {
        const tg = settings ? targetsFrom(days, settings) : null;
        const beCpa = tg ? tg.aov * (1 - tg.vcrPct / 100) : 0;
        return (gaSnap?.searchTerms ?? []).filter((t) => beCpa > 0 && t.spend >= beCpa && t.conversions === 0).map((t) => ({ term: t.term, spend: t.spend }));
      })(),
      targetCpa: settings ? Math.round(targetsFrom(days, settings).aov * (1 - targetsFrom(days, settings).vcrPct / 100) * 100) / 100 : 0,
    },
    email: {
      revenueSharePct: kSum && net30 > 0 ? (kSum.revenue30 / net30) * 100 : 0,
      missingFlows: kSum ? kSum.flowsOff : [],
    },
    social: presence
      ? { profiles: presence.profiles, liveAdOfferOnProfile: presence.liveAdOfferOnProfile, liveAdOffer: presence.liveAdOffer }
      : {
          profiles: [], // no social pull yet
          liveAdOfferOnProfile: true, // neutral: mismatch rule stays suppressed
          liveAdOffer: "",
        },
    daysToBlackFriday: daysToBf,
    hasPeakPlan: plans.some((p) => /^black-friday-\d{4}$/.test(p.planKey)),
  };
  return { signals, metaLive, coverage, demo: false };
}

export async function insightsFor(userId: string): Promise<LiveSignals> {
  if (isDemoUserId(userId)) {
    return { insights: runRules(EXAMPLE_SIGNALS, true), signals: EXAMPLE_SIGNALS, metaLive: false, coverage: emptyCoverage(), demo: true };
  }
  const { signals, metaLive, coverage, demo } = await signalsFor(userId);
  return { insights: insightsFromSignals(signals, coverage), signals, metaLive, coverage, demo };
}
