import { describe, expect, it } from "vitest";
import { majorToMinor, minorToMajor, normalise, toTrackerCampaign } from "@/lib/meta/insights";

describe("insights mapping", () => {
  const row = {
    campaign_id: "1", spend: "200", impressions: "10000", frequency: "1.5", inline_link_clicks: "150",
    outbound_clicks: [{ action_type: "outbound_click", value: "120" }],
    actions: [
      { action_type: "purchase", value: "5" },
      { action_type: "omni_purchase", value: "4" },
      { action_type: "video_view", value: "2800" },
    ],
    action_values: [{ action_type: "omni_purchase", value: "500" }],
  };

  it("computes CPA, ROAS, CTR and hook rate without double counting purchases", () => {
    const m = normalise(row);
    expect(m.purchases).toBe(4);
    expect(m.cpa).toBe(50);
    expect(m.roas).toBe(2.5);
    expect(m.ctr).toBeCloseTo(1.2);
    expect(m.hookRate).toBeCloseTo(28);
    expect(m.cpm).toBe(20);
  });

  it("handles currency minor units", () => {
    expect(minorToMajor("13800", "AUD")).toBe(138);
    expect(minorToMajor("5000", "JPY")).toBe(5000);
    expect(majorToMinor(12.5, "USD")).toBe(1250);
  });

  it("maps a campaign row for the tracker", () => {
    const c = toTrackerCampaign(
      { id: "1", name: "05-Warm-Visitors180", objective: "OUTCOME_SALES", effective_status: "ACTIVE", daily_budget: "4000", updated_time: new Date(Date.now() - 5 * 86_400_000).toISOString() },
      [{ id: "a", campaign_id: "1", learning_stage_info: { status: "SUCCESS" } }],
      row, "AUD",
    );
    expect(c).toMatchObject({ channel: "Meta", source: "live", layer: "Warm", budget: 40, spend: 200, purchases: 4, status: "Active", daysSinceEdit: 5 });
  });
});
