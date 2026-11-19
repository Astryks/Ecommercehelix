import { describe, expect, it } from "vitest";
import { flowStatuses, missingFlows, validateFlow, flowApproval, FLOW_IDS } from "@/lib/agent/email-flows";
import { FLOWS } from "@/lib/seed/flows";

const ctx = (over: Record<string, unknown> = {}) => ({
  klaviyo: null, isConsumable: null, hasRepeatBuyers: null, approvedFlowIds: [], ...over,
});

describe("email flows — the 9 flows", () => {
  it("has all 9 flows with copy and timing", () => {
    expect(FLOW_IDS).toHaveLength(9);
    expect(FLOW_IDS).toContain("welcome");
    expect(FLOW_IDS).toContain("abandoned-checkout");
    expect(FLOW_IDS).toContain("vip");
    for (const f of FLOWS) expect(f.emails.length).toBeGreaterThanOrEqual(2);
  });

  it("suggests Welcome and Abandoned Checkout first when nothing is live", () => {
    const missing = missingFlows(ctx());
    expect(missing[0].flow.id).toBe("welcome");
    expect(missing[1].flow.id).toBe("abandoned-checkout");
    expect(missing).toHaveLength(9);
  });

  it("holds replenishment back for non-consumables and VIP until there are repeat buyers", () => {
    const s = flowStatuses(ctx({ isConsumable: false, hasRepeatBuyers: false }));
    expect(s.find((x) => x.flow.id === "replenishment")!.eligible).toBe(false);
    expect(s.find((x) => x.flow.id === "vip")!.eligible).toBe(false);
    expect(s.find((x) => x.flow.id === "welcome")!.eligible).toBe(true);
  });

  it("labels copy-to-paste when Klaviyo is not connected", () => {
    const s = flowStatuses(ctx());
    expect(s.every((x) => x.setupMode === "copy-to-paste")).toBe(true);
  });

  it("marks a flow live from the Klaviyo summary", () => {
    const klaviyo = {
      revenue30: 5000, flowRevenue30: 2000, campaignRevenue30: 1000, sends30: 10000, openRate: 0.4, clickRate: 0.05,
      conversions30: 50, listSize: 2000, listGrowth30: 100,
      flows: { welcome: "live", abandoned: "missing", "post-purchase": "off" },
      flowsOff: ["Abandoned cart", "Post-purchase"],
    } as never;
    const s = flowStatuses(ctx({ klaviyo }));
    expect(s.find((x) => x.flow.id === "welcome")!.status).toBe("live");
    expect(s.find((x) => x.flow.id === "welcome")!.setupMode).toBe("klaviyo-draft");
    expect(s.find((x) => x.flow.id === "post-purchase")!.status).toBe("off");
  });
});

describe("email flows — writing rules", () => {
  it("passes the shipped flow copy: subjects under 45 chars, SMS opt-out present", () => {
    for (const f of FLOWS) {
      const v = validateFlow(f);
      expect(v, `${f.id}: ${JSON.stringify(v)}`).toHaveLength(0);
    }
  });

  it("catches a long subject and an SMS without opt-out", () => {
    const bad = { ...FLOWS[0], emails: [
      { delay: "Immediately", channel: "Email" as const, subject: "This subject line is far too long to ever pass the forty-five character rule", preview: "", body: "Hi" },
      { delay: "5 days", channel: "SMS" as const, subject: "", preview: "", body: "Your code ends tonight. Shop now." },
    ] };
    const v = validateFlow(bad);
    expect(v.map((x) => x.rule)).toContain("subject-under-45");
    expect(v.map((x) => x.rule)).toContain("sms-opt-out");
  });
});

describe("email flows — approval payload", () => {
  it("is draft-first and says so, with the full copy and the discount rule", () => {
    const ap = flowApproval(FLOWS.find((f) => f.id === "abandoned-checkout")!, ctx());
    expect(ap.taskId).toBe("flow-abandoned-checkout");
    expect(ap.detail).toContain("Did something go wrong?");
    expect(ap.detail).toContain("No discount in email 1");
    expect(ap.detail).toContain("NOT a live flow");
    expect(ap.estAiCost).toBe(0.11);
  });
});
