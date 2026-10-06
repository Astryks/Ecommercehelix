import "server-only";
import { EXAMPLE_SIGNALS, runRules, type Insight, type Signals } from "./audit";
import { getDays } from "./repo";
import { getSnapshot } from "./meta/store";

/**
 * Audit signals for one user. When Meta is connected and synced, the Meta block comes from real
 * insights (plus store conversion and MER from the scorecard). Other blocks stay example data
 * until their integrations ship.
 */
export async function signalsFor(userId: string): Promise<{ signals: Signals; metaLive: boolean; syncedAt?: string }> {
  const snap = await getSnapshot(userId);
  if (!snap || snap.now.impressions === 0) return { signals: EXAMPLE_SIGNALS, metaLive: false };
  const days = await getDays(userId);
  const last = days.slice(-7);
  const prior = days.slice(-14, -7);
  const sum = (arr: typeof days, f: (d: (typeof days)[number]) => number) => arr.reduce((s, d) => s + f(d), 0);
  const ads = (d: (typeof days)[number]) => d.adMeta + d.adGoogle + d.adTiktok + d.adOther;
  const mer = (arr: typeof days) => {
    const rev = sum(arr, (d) => d.revenue);
    return rev ? (sum(arr, ads) / rev) * 100 : 0;
  };
  const sessions = sum(last, (d) => d.sessions);
  const storeCr = sessions ? (sum(last, (d) => d.orders) / sessions) * 100 : EXAMPLE_SIGNALS.funnel.cr;
  const { now, prev } = snap;
  const signals: Signals = {
    ...EXAMPLE_SIGNALS,
    period: `Meta data ${snap.window.since} to ${snap.window.until}`,
    funnel: { ...EXAMPLE_SIGNALS.funnel, cr: storeCr },
    meta: {
      hookRate: now.hookRate ?? 0,
      ctr: now.ctr,
      lpCr: now.lpViews ? (now.purchases / now.lpViews) * 100 : now.outboundClicks ? (now.purchases / now.outboundClicks) * 100 : 0,
      storeCr,
      freqNow: now.frequency, freqPrev: prev.frequency || now.frequency,
      cpmNow: now.cpm, cpmPrev: prev.cpm || now.cpm,
      ctrNow: now.ctr, ctrPrev: prev.ctr || now.ctr,
      roasNow: now.roas, roasPrev: prev.roas || now.roas,
      merNow: mer(last), merPrev: mer(prior),
      thruplayRate: now.impressions ? (now.thruplays / now.impressions) * 100 : 0,
    },
  };
  return { signals, metaLive: true, syncedAt: snap.syncedAt };
}

export async function insightsFor(userId: string): Promise<{ insights: Insight[]; signals: Signals; metaLive: boolean }> {
  const { signals, metaLive } = await signalsFor(userId);
  const insights = runRules(signals).map((i) => (metaLive && i.source.includes("meta") ? { ...i, example: false } : i));
  return { insights, signals, metaLive };
}
