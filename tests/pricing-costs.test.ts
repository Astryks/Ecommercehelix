import { describe, expect, it } from "vitest";
import {
  ACTION_COSTS,
  CREDIT_USD,
  PAYG_PACK,
  AGENT_ADD_ON,
  contributionAtCap,
  costOf,
  creditsForProviderUsd,
  packContribution,
  stripeFeeUsd,
  topUpMargin,
} from "@/lib/pricing/costs";

describe("cost table — docs/pricing.md §3, exact figures", () => {
  it("1 credit = $0.01 provider cost", () => {
    expect(CREDIT_USD).toBe(0.01);
  });
  it("per-action buffered costs match the doc", () => {
    expect(ACTION_COSTS["store-audit"].providerUsd).toBe(0.042);
    expect(ACTION_COSTS["daily-plan"].providerUsd).toBe(0.023);
    expect(ACTION_COSTS["chat"].providerUsd).toBe(0.013);
    expect(ACTION_COSTS["deep-chat"].providerUsd).toBe(0.063);
    expect(ACTION_COSTS["approval-card"].providerUsd).toBe(0.009);
    expect(ACTION_COSTS["ad-batch"].providerUsd).toBe(0.132);
    expect(ACTION_COSTS["flow-draft"].providerUsd).toBe(0.165);
    expect(ACTION_COSTS["weekly-report"].providerUsd).toBe(0.12);
    expect(ACTION_COSTS["constraint-diagnosis"].providerUsd).toBe(0.098);
  });
  it("credits are the buffered cost x100", () => {
    for (const [id, c] of Object.entries(ACTION_COSTS)) {
      if (id === "coach-fast" || id === "coach-deep" || id === "memory-extract" || id === "tier0") continue;
      expect(c.credits).toBeCloseTo(c.providerUsd * 100, 1);
    }
  });
  it("wallet billing is 2x provider cost", () => {
    expect(costOf("flow-draft").walletUsd).toBeCloseTo(0.33, 2);
    expect(costOf("ad-batch").walletUsd).toBeCloseTo(0.26, 2);
    expect(costOf("chat").walletUsd).toBeCloseTo(0.03, 2);
  });
  it("credits for a bare provider-cost figure (approval cards)", () => {
    expect(creditsForProviderUsd(0.006)).toBe(0.6);
    expect(creditsForProviderUsd(0.11)).toBe(11);
    expect(creditsForProviderUsd(0)).toBe(0);
  });
});

describe("wallet top-up margins — docs/pricing.md §4", () => {
  it("matches the doc's table", () => {
    expect(topUpMargin(10)).toEqual({ stripeFee: 0.59, providerCost: 5, marginUsd: 4.41, marginPct: 44.1 });
    expect(topUpMargin(25)).toEqual({ stripeFee: 1.03, providerCost: 12.5, marginUsd: 11.47, marginPct: 45.9 });
    expect(topUpMargin(50)).toEqual({ stripeFee: 1.75, providerCost: 25, marginUsd: 23.25, marginPct: 46.5 });
  });
  it("stripe fee is 2.9% + $0.30 on one-off payments, + 0.7% Billing on subscriptions", () => {
    expect(stripeFeeUsd(10)).toBe(0.59);
    expect(stripeFeeUsd(25)).toBe(1.03);
    expect(stripeFeeUsd(50)).toBe(1.75);
    expect(stripeFeeUsd(29)).toBe(1.14); // one-off: no Billing fee
    expect(stripeFeeUsd(29, true)).toBe(1.34); // subscription: +0.7%
    expect(stripeFeeUsd(59, true)).toBe(2.42);
  });
});

describe("margin proof at the cap — every pack must clear 70% contribution", () => {
  it("Starter weekly grant: 60 credits/week, nominal and worst case", () => {
    const nominal = contributionAtCap("starter");
    expect(nominal.creditsPerMonth).toBe(260); // 60 x 52/12 — weekly expiry, not 300
    expect(nominal.providerUsd).toBe(2.6);
    expect(nominal.contributionUsd).toBeCloseTo(22.56, 2);
    expect(nominal.contributionPct).toBeGreaterThanOrEqual(70);
    // Worst case: every credit spent on the least efficient action
    // (a generic chat, $0.013 provider for 1.3 credits).
    const worst = contributionAtCap("starter", 0.013);
    expect(worst.providerUsd).toBeCloseTo(3.38, 2);
    expect(worst.contributionPct).toBeGreaterThanOrEqual(70);
  });
  it("Growth weekly grant: 180 credits/week, nominal and worst case", () => {
    const nominal = contributionAtCap("growth");
    expect(nominal.creditsPerMonth).toBe(780);
    expect(nominal.providerUsd).toBe(7.8);
    expect(nominal.contributionUsd).toBeCloseTo(44.78, 2);
    expect(nominal.contributionPct).toBeGreaterThanOrEqual(70);
    const worst = contributionAtCap("growth", 0.013);
    expect(worst.providerUsd).toBeCloseTo(10.14, 2);
    expect(worst.contributionPct).toBeGreaterThanOrEqual(70);
  });
  it("PAYG pack: $10 = 500 credits, 7-day expiry (aligned to the $10 wallet top-up, finishing step)", () => {
    expect(PAYG_PACK).toEqual({ priceUsd: 10, credits: 500, expiresDays: 7 });
    const p = packContribution("payg");
    expect(p.providerUsd).toBe(5.0);
    expect(p.contributionUsd).toBeCloseTo(4.41, 2);
    expect(p.contributionPct).toBeCloseTo(44, 0);
    // At least 2x the provider cost it covers, at its cap.
    expect(p.priceUsd / p.providerUsd).toBeGreaterThanOrEqual(2);
  });
  it("agent add-on: +$29/mo for +120 credits/week", () => {
    expect(AGENT_ADD_ON).toEqual({ priceUsd: 29, extraCreditsPerWeek: 120 });
    const p = packContribution("add-on");
    expect(p.providerUsd).toBeCloseTo(5.2, 2);
    expect(p.contributionPct).toBeGreaterThanOrEqual(70);
    expect(p.priceUsd / p.providerUsd).toBeGreaterThanOrEqual(2);
  });
});
