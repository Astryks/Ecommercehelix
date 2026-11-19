import { describe, expect, it } from "vitest";
import { evaluateCampaign, evaluateCampaigns, autonomousGate, parseAgentSettings, matchCampaignStock, DEFAULT_AGENT_SETTINGS, KILL_TEST_SPEND } from "@/lib/agent/autonomy";
import type { Campaign, Targets } from "@/lib/campaigns";

const T: Targets = { aov: 92, targetMerPct: 30, vcrPct: 40 }; // break-even CPA $55.20
const NOW = "2026-11-19T08:00:00.000Z";

const camp = (over: Partial<Campaign> = {}): Campaign => ({
  id: "c1", channel: "Meta", name: "01-Cold-Broad", objective: "Sales", layer: "Cold",
  budget: 140, spend: 952, purchases: 22, revenue: 2090, impressions: 98000, clicks: 1240,
  threeSecViews: 30400, frequency: 1.3, daysSinceEdit: 6, status: "Active", testStage: "Scaling", ...over,
});

const ctx = (over: Record<string, unknown> = {}) => ({
  settings: DEFAULT_AGENT_SETTINGS, breakEvenCpa: 55.2, autoPausedToday: 0,
  stockDaysLeft: 30, lastSyncAt: NOW, now: NOW, spendToday: 100, ...over,
});

describe("autonomy ladder — kill rule", () => {
  it("kills a campaign that spent $150+ over 3 days with 0 orders, once the test was fair", () => {
    const d = evaluateCampaign(camp({ spend: 200, purchases: 0, revenue: 0, daysSinceEdit: 5 }), T, ctx());
    expect(d.action).toBe("kill");
    expect(d.fairTest).toBe(true);
    expect(d.reason).toContain(`$${KILL_TEST_SPEND}`);
    expect(d.revert.kind).toBe("resume");
    // Propose-only default: no auto action.
    expect(d.autoAllowed).toBe("none");
  });

  it("kills on ROAS below 0.7 after a fair test", () => {
    const d = evaluateCampaign(camp({ spend: 200, purchases: 2, revenue: 100, daysSinceEdit: 5 }), T, ctx());
    expect(d.action).toBe("kill");
    expect(d.evidence.find((e) => e.label === "ROAS")?.value).toBe("0.50x");
  });

  it("never kills before a fair test — too little spend or too recent an edit", () => {
    const tooLittle = evaluateCampaign(camp({ spend: 40, purchases: 0, revenue: 0, daysSinceEdit: 5 }), T, ctx());
    expect(tooLittle.action).not.toBe("kill");
    const tooSoon = evaluateCampaign(camp({ spend: 200, purchases: 0, revenue: 0, daysSinceEdit: 1 }), T, ctx());
    expect(tooSoon.action).not.toBe("kill");
    expect(tooSoon.fairTest).toBe(false);
  });

  it("never auto-pauses a campaign on the never-pause list", () => {
    const s = { ...DEFAULT_AGENT_SETTINGS, mode: "assisted" as const, neverPause: ["c1"] };
    const d = evaluateCampaign(camp({ spend: 200, purchases: 0, revenue: 0, daysSinceEdit: 5 }), T, ctx({ settings: s }));
    expect(d.action).toBe("kill");
    expect(d.autoAllowed).toBe("none");
    expect(d.blockedBy).toBe("never-pause-list");
  });

  it("assisted mode auto-pauses a loser, within the per-day cap", () => {
    const s = { ...DEFAULT_AGENT_SETTINGS, mode: "assisted" as const };
    const d = evaluateCampaign(camp({ spend: 200, purchases: 0, revenue: 0, daysSinceEdit: 5 }), T, ctx({ settings: s }));
    expect(d.autoAllowed).toBe("pause");
    const capped = evaluateCampaign(camp({ spend: 200, purchases: 0, revenue: 0, daysSinceEdit: 5 }), T, ctx({ settings: s, autoPausedToday: 3 }));
    expect(capped.autoAllowed).toBe("none");
  });
});

describe("autonomy ladder — scale", () => {
  it("proposes a +20% scale with the previous budget saved for undo, never auto at L1/L2", () => {
    const d = evaluateCampaign(camp(), T, ctx());
    expect(d.action).toBe("scale");
    expect(d.approval.detail).toContain("$168");
    expect(d.revert).toEqual({ kind: "restore-budget", previousBudgetPerDay: 140, note: expect.stringContaining("Undo restores") });
    expect(d.autoAllowed).toBe("none");
  });

  it("blocks scaling when the winner has under 14 days of stock", () => {
    const d = evaluateCampaign(camp(), T, ctx({ stockDaysLeft: 6 }));
    expect(d.action).toBe("scale");
    expect(d.blockedBy).toBe("stock-low");
    expect(d.approval.detail).toContain("Reorder first");
    expect(d.autoAllowed).toBe("none");
  });

  it("blocks autonomous scaling without a daily cap, allows it with one", () => {
    const noCap = { ...DEFAULT_AGENT_SETTINGS, mode: "autonomous" as const, dailySpendCap: 0 };
    const d = evaluateCampaign(camp(), T, ctx({ settings: noCap }));
    expect(d.blockedBy).toBe("daily-cap");
    const capped = { ...DEFAULT_AGENT_SETTINGS, mode: "autonomous" as const, dailySpendCap: 500 };
    const ok = evaluateCampaign(camp(), T, ctx({ settings: capped }));
    expect(ok.autoAllowed).toBe("scale");
    expect(ok.blockedBy).toBeNull();
  });

  it("says 'data unreliable — do not scale' on a stale feed", () => {
    const d = evaluateCampaign(camp(), T, ctx({ lastSyncAt: "2026-11-15T08:00:00.000Z" }));
    expect(d.action).toBe("hold");
    expect(d.reason).toContain("Data unreliable");
    expect(d.blockedBy).toBe("stale-feed");
  });

  it("sorts kill before scale before refresh", () => {
    const out = evaluateCampaigns([
      camp({ id: "ok", spend: 952, purchases: 22, revenue: 2090 }),
      camp({ id: "dead", spend: 200, purchases: 0, revenue: 0, daysSinceEdit: 5 }),
    ], T, ctx());
    expect(out[0].campaignId).toBe("dead");
    expect(out[0].action).toBe("kill");
  });
});

describe("autonomous gate", () => {
  it("requires 30 days of L2, revert rate under 5%, and a cap", () => {
    expect(autonomousGate({ l2Days: 10, revertRatePct: 0, dailySpendCap: 500 }).allowed).toBe(false);
    expect(autonomousGate({ l2Days: 40, revertRatePct: 6, dailySpendCap: 500 }).allowed).toBe(false);
    expect(autonomousGate({ l2Days: 40, revertRatePct: 2, dailySpendCap: 0 }).allowed).toBe(false);
    expect(autonomousGate({ l2Days: 40, revertRatePct: 2, dailySpendCap: 500 }).allowed).toBe(true);
  });
});

describe("parseAgentSettings", () => {
  it("defaults to propose-only and clamps the scale step to 20%", () => {
    const s = parseAgentSettings({ mode: "autonomous", maxScalePct: 90, maxConcurrentTests: 99 });
    expect(s.mode).toBe("autonomous");
    expect(s.maxScalePct).toBe(20);
    expect(s.maxConcurrentTests).toBe(6);
  });
  it("rejects an unknown mode", () => {
    expect(parseAgentSettings({ mode: "yolo" as never }).mode).toBe("propose");
  });
});

describe("per-campaign stock blocking (finishing step)", () => {
  it("matches a campaign to a product by SKU or name in the campaign name", () => {
    const rows = [
      { sku: "LIN-SHIRT-01", name: "Linen Shirt", daysLeft: 5 },
      { sku: "WOOL-02", name: "Wool Scarf", daysLeft: 40 },
    ];
    expect(matchCampaignStock("Cold · Linen Shirt — Broad", rows)?.sku).toBe("LIN-SHIRT-01");
    expect(matchCampaignStock("LIN-SHIRT-01 retargeting", rows)?.name).toBe("Linen Shirt");
    expect(matchCampaignStock("Cold · Broad", rows)).toBeNull();
    expect(matchCampaignStock("Wool Scarf + Linen Shirt launch", rows)?.name).toBe("Linen Shirt"); // longest match wins
  });

  it("blocks scaling only for the campaign whose product is low on stock", () => {
    const byCampaign = new Map([["c1", 5]]);
    const labels = new Map([["c1", "Linen Shirt (LIN-SHIRT-01)"]]);
    const low = evaluateCampaign(camp({ id: "c1", name: "Linen Shirt — Cold" }), T, ctx({ stockDaysLeft: null, stockDaysByCampaign: byCampaign, stockLabelByCampaign: labels }));
    expect(low.blockedBy).toBe("stock-low");
    expect(low.approval.detail).toContain("Linen Shirt (LIN-SHIRT-01) has 5 days of stock left");
    const other = evaluateCampaign(camp({ id: "c2", name: "Wool Scarf — Cold" }), T, ctx({ stockDaysLeft: null, stockDaysByCampaign: byCampaign, stockLabelByCampaign: labels }));
    expect(other.blockedBy).toBeNull();
    expect(other.action).toBe("scale");
  });

  it("unknown SKU stays unknown — no stock block is invented", () => {
    const d = evaluateCampaign(camp(), T, ctx({ stockDaysLeft: null }));
    expect(d.blockedBy).toBeNull();
  });
});
