import { describe, expect, it } from "vitest";
import { assertAllPaused, draftAdInput, pausedAdGroupOps } from "../src/lib/google-ads/config";

describe("google ads paused ad group draft", () => {
  const input = draftAdInput(["Linen Throw Blanket", "Linen Throw Blanket", "Wool Socks!"], "Cosy Co", "https://cosy.myshopify.com");
  it("builds keywords and copy within limits", () => {
    expect(input.keywords).toContain("linen throw blanket");
    expect(input.keywords).toContain("buy wool socks");
    expect(input.headlines.every((h) => h.length <= 30)).toBe(true);
    expect(input.descriptions.every((d) => d.length <= 90)).toBe(true);
    expect(input.headlines.length).toBeGreaterThanOrEqual(3);
  });
  it("creates only PAUSED things", () => {
    const b = pausedAdGroupOps("123", "customers/123/campaigns/9", "T", input);
    expect(() => assertAllPaused(b)).not.toThrow();
    expect(b.mutateOperations.some((o) => "adGroupAdOperation" in o)).toBe(true);
    const bad = { mutateOperations: [{ adGroupOperation: { create: { status: "ENABLED" } } }] };
    expect(() => assertAllPaused(bad)).toThrow(/paused/);
  });
  it("skips the ad without an https final URL", () => {
    const b = pausedAdGroupOps("1", "c", "T", draftAdInput(["X"], null, "http://x.com"));
    expect(b.mutateOperations.some((o) => "adGroupAdOperation" in o)).toBe(false);
  });
});
