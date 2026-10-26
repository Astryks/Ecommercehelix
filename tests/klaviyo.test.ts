import { describe, expect, it } from "vitest";
import { checkKeyShape, flowStatus, klaviyoFixes, klaviyoOn, sumReport, type KlaviyoSummary } from "@/lib/klaviyo/config";
import { googleScopes, GOOGLE_ADS_SCOPES } from "@/lib/google-ads/config";
import { coachWelcomeEmail, dailyEmail } from "@/lib/email/templates";
import { composeDaily } from "@/lib/email/daily-mix";

const c = { name: "Sam Lee", baseUrl: "https://helix.test", unsubUrl: "https://helix.test/u" };

describe("klaviyo", () => {
  it("flag", () => { expect(klaviyoOn({ KLAVIYO: "1" })).toBe(true); expect(klaviyoOn({})).toBe(false); });
  it("key shape", () => {
    expect(checkKeyShape("pk_" + "a".repeat(30))).toBeNull();
    expect(checkKeyShape("abc")).not.toBeNull();
  });
  it("flow status", () => {
    const s = flowStatus([{ id: "1", name: "Welcome Series", status: "live" }, { id: "2", name: "Abandoned Cart", status: "draft" }]);
    expect(s.welcome).toBe("live");
    expect(s.abandoned).toBe("off");
    expect(s["post-purchase"]).toBe("missing");
  });
  it("sums report rows", () => {
    const t = sumReport([{ statistics: { conversion_value: 10, recipients: 100, opens_unique: 30, clicks_unique: 5, conversions: 1 } }, { statistics: { conversion_value: 5, recipients: 50 } }]);
    expect(t.revenue).toBe(15);
    expect(t.sends).toBe(150);
  });
  it("fixes point at the help page", () => {
    const s: KlaviyoSummary = { revenue30: 0, flowRevenue30: 0, campaignRevenue30: 0, sends30: 1000, openRate: 0.1, clickRate: 0.01, conversions30: 0, listSize: 100, listGrowth30: 0, flows: { welcome: "live", abandoned: "missing", "post-purchase": "off" }, flowsOff: [] };
    const f = klaviyoFixes(s);
    expect(f[0].id).toBe("kl-abandoned");
    expect(f.map((x) => x.id)).toEqual(expect.arrayContaining(["kl-post", "kl-opens", "kl-list"]));
  });
});

describe("ga4 scope is opt-in", () => {
  it("normal google connect never asks for analytics", () => {
    expect(GOOGLE_ADS_SCOPES.join(" ")).not.toMatch(/analytics/);
    expect(googleScopes(false, { GA4_SESSIONS: "1" }).join(" ")).not.toMatch(/analytics/);
    expect(googleScopes(true, { GA4_SESSIONS: "1" }).join(" ")).toMatch(/analytics\.readonly/);
    expect(googleScopes(true, {}).join(" ")).not.toMatch(/analytics/);
  });
});

describe("coach emails", () => {
  it("daily email lists coach tasks", () => {
    const e = dailyEmail(c, composeDaily({ seed: "u1", date: "2026-10-27" } as never), [{ title: "Check your refunds", href: "/dashboard/numbers" }]);
    expect(e.text).toMatch(/From your Helix coach today/);
    expect(e.html).toMatch(/Check your refunds/);
  });
  it("welcome email opens the coach", () => {
    const e = coachWelcomeEmail(c, "Starter", [{ title: "Set a goal", href: "/dashboard/goals" }]);
    expect(e.html).toMatch(/coach=1/);
    expect(e.text).toMatch(/Set a goal/);
  });
});
