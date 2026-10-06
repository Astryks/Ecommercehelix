export type Channel = "Meta" | "Google" | "TikTok";
export type Layer = "Cold" | "Mixed" | "Warm" | "Hot";
export type Recommendation = "Scale" | "Hold" | "Kill" | "Refresh creative";

export type Campaign = {
  id: string;
  channel: Channel;
  name: string;
  objective: string;
  layer: Layer;
  budget: number; // daily
  spend: number; // last 7 days
  purchases: number;
  revenue: number; // platform-attributed, last 7 days
  impressions: number;
  clicks: number; // outbound
  threeSecViews: number;
  frequency: number;
  daysSinceEdit: number;
  status: "Active" | "Learning" | "Paused";
  testStage: "Testing" | "Scaling" | "Evergreen" | "Sale";
  /** "live" rows come from a connected ad account; everything else is example data. */
  source?: "live" | "example";
  externalId?: string;
};

export type Targets = { aov: number; targetMerPct: number; vcrPct: number };

const MULT: Record<Layer, number> = { Cold: 2.0, Mixed: 1.25, Warm: 1.0, Hot: 0.75 };
const FREQ: Record<Layer, [number, number]> = { Cold: [1.4, 1.8], Mixed: [1.8, 2.0], Warm: [2.0, 2.4], Hot: [2.4, 3.0] };

export function metrics(c: Campaign) {
  const cpa = c.purchases > 0 ? c.spend / c.purchases : null;
  const roas = c.spend > 0 ? c.revenue / c.spend : 0;
  const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
  const cpm = c.impressions > 0 ? (c.spend / c.impressions) * 1000 : 0;
  const hookRate = c.impressions > 0 && c.threeSecViews > 0 ? (c.threeSecViews / c.impressions) * 100 : null;
  return { cpa, roas, ctr, cpm, hookRate };
}

/** Decision rules from SOP 06 / Learn module 6.12. */
export function recommend(c: Campaign, t: Targets): { rec: Recommendation; reason: string } {
  const m = metrics(c);
  const good = t.aov * (t.targetMerPct / 100) * MULT[c.layer];
  const bad = good * 2;
  const breakEvenRoas = 1 / (1 - t.vcrPct / 100);
  const [fine, high] = FREQ[c.layer];

  if (c.status === "Paused") return { rec: "Hold", reason: "Paused. Review before relaunching." };
  if (c.status === "Learning" || c.daysSinceEdit < 3)
    return { rec: "Hold", reason: `Edited ${c.daysSinceEdit} day(s) ago. Let it learn for 3 to 7 days.` };

  if (c.channel === "Google") {
    if (c.spend < 2 * good) return { rec: "Hold", reason: "Not enough spend to judge yet." };
    if (m.roas >= breakEvenRoas * 1.5) return { rec: "Scale", reason: `ROAS ${m.roas.toFixed(2)} well above break-even ${breakEvenRoas.toFixed(2)}. Raise budget to $${Math.round(c.budget * 1.2)}/day in Google Ads (you make this change).` };
    if (m.roas < breakEvenRoas) return { rec: "Kill", reason: `ROAS ${m.roas.toFixed(2)} below break-even ${breakEvenRoas.toFixed(2)}. Helix can pause it after your approval; then fix feed and negatives.` };
    return { rec: "Hold", reason: `ROAS ${m.roas.toFixed(2)} between break-even and target. Optimise search terms and feed.` };
  }

  if (c.spend < good) return { rec: "Hold", reason: `Spent $${c.spend.toFixed(0)}, under one target CPA ($${good.toFixed(0)}). Wait for signal.` };
  if ((c.purchases === 0 && c.spend >= bad) || (m.cpa !== null && m.cpa >= bad))
    return { rec: "Kill", reason: `CPA ${m.cpa ? "$" + m.cpa.toFixed(0) : "none"} vs bad line $${bad.toFixed(0)} for ${c.layer}. Helix can pause it after your approval.` };
  if (c.frequency > high || (m.hookRate !== null && m.hookRate < 20) || m.ctr < 0.5)
    return {
      rec: "Refresh creative",
      reason:
        c.frequency > high
          ? `Frequency ${c.frequency.toFixed(1)} above ${high} for ${c.layer}. Helix can add a new batch as paused ads.`
          : m.ctr < 0.5
            ? `Outbound CTR ${m.ctr.toFixed(2)}% under 0.5%. New message or hooks.`
            : `Hook rate ${m.hookRate?.toFixed(0)}% is weak. Test new first 3 seconds.`,
    };
  if (m.cpa !== null && m.cpa <= good && c.frequency <= fine)
    return { rec: "Scale", reason: `CPA $${m.cpa.toFixed(0)} at or under $${good.toFixed(0)}, frequency ${c.frequency.toFixed(1)}. Raise budget to $${Math.round(c.budget * 1.2)}/day in Ads Manager (you make this change).` };
  return { rec: "Hold", reason: `CPA $${m.cpa?.toFixed(0)} between good ($${good.toFixed(0)}) and bad ($${bad.toFixed(0)}). Keep watching.` };
}

export const EXAMPLE_TARGETS: Targets = { aov: 92, targetMerPct: 30, vcrPct: 40 };

/** EXAMPLE DATA for the Campaign Tracker until ad accounts are connected. */
export const EXAMPLE_CAMPAIGNS: Campaign[] = [
  { id: "c1", channel: "Meta", name: "01-Auto-Cold-Broad-Light-BAU", objective: "Sales · Purchase", layer: "Cold", budget: 140, spend: 952, purchases: 22, revenue: 2090, impressions: 98000, clicks: 1240, threeSecViews: 30400, frequency: 1.3, daysSinceEdit: 6, status: "Active", testStage: "Scaling" },
  { id: "c2", channel: "Meta", name: "02-Manual-Cold-Broad-Harsh-BAU", objective: "Sales · Purchase", layer: "Cold", budget: 90, spend: 615, purchases: 6, revenue: 540, impressions: 71000, clicks: 520, threeSecViews: 19800, frequency: 1.9, daysSinceEdit: 9, status: "Active", testStage: "Evergreen" },
  { id: "c3", channel: "Meta", name: "03-Manual-Cold-Broad-Light-TEST-B15", objective: "Sales · Purchase", layer: "Cold", budget: 60, spend: 118, purchases: 2, revenue: 190, impressions: 14000, clicks: 160, threeSecViews: 4100, frequency: 1.1, daysSinceEdit: 2, status: "Learning", testStage: "Testing" },
  { id: "c4", channel: "Meta", name: "04-Auto-Mixed-Broad-None-BAU", objective: "Sales · Purchase", layer: "Mixed", budget: 80, spend: 560, purchases: 9, revenue: 860, impressions: 52000, clicks: 230, threeSecViews: 8300, frequency: 2.6, daysSinceEdit: 12, status: "Active", testStage: "Evergreen" },
  { id: "c5", channel: "Meta", name: "05-Manual-Warm-Visitors180-BAU", objective: "Sales · Purchase", layer: "Warm", budget: 40, spend: 280, purchases: 14, revenue: 1330, impressions: 21000, clicks: 330, threeSecViews: 6900, frequency: 1.9, daysSinceEdit: 8, status: "Active", testStage: "Evergreen" },
  { id: "c6", channel: "Meta", name: "06-Manual-Hot-CartCheckout-BAU", objective: "Sales · Purchase", layer: "Hot", budget: 15, spend: 105, purchases: 1, revenue: 88, impressions: 6000, clicks: 60, threeSecViews: 0, frequency: 3.4, daysSinceEdit: 20, status: "Active", testStage: "Evergreen" },
  { id: "c7", channel: "Google", name: "G1-Brand-Search", objective: "Sales · Purchase", layer: "Warm", budget: 25, spend: 168, purchases: 19, revenue: 1820, impressions: 3100, clicks: 610, threeSecViews: 0, frequency: 1, daysSinceEdit: 30, status: "Active", testStage: "Evergreen" },
  { id: "c8", channel: "Google", name: "G2-PMax-FeedOnly-Hero-NonBrand", objective: "Sales · tROAS 2.2", layer: "Cold", budget: 70, spend: 470, purchases: 9, revenue: 790, impressions: 61000, clicks: 900, threeSecViews: 0, frequency: 1, daysSinceEdit: 14, status: "Active", testStage: "Scaling" },
  { id: "c9", channel: "Google", name: "G3-Search-NonBrand-Linen", objective: "Sales · Max conv value", layer: "Cold", budget: 30, spend: 205, purchases: 1, revenue: 92, impressions: 4200, clicks: 140, threeSecViews: 0, frequency: 1, daysSinceEdit: 18, status: "Active", testStage: "Testing" },
  { id: "c10", channel: "TikTok", name: "T1-Purchase-Broad-Spark", objective: "Sales · Complete payment", layer: "Cold", budget: 50, spend: 340, purchases: 4, revenue: 350, impressions: 88000, clicks: 300, threeSecViews: 14100, frequency: 1.5, daysSinceEdit: 7, status: "Active", testStage: "Testing" },
];
