/**
 * Finishing step — PageSpeed pull: parsing is pure and tested; the fetch
 * is graceful (no key = null, failed pull = null, never a fake score).
 */
import { describe, expect, it, vi } from "vitest";
import { parsePageSpeedResponse, fetchPageSpeed } from "@/lib/pagespeed";

const SAMPLE = {
  lighthouseResult: {
    categories: { performance: { score: 0.62 } },
    audits: { "largest-contentful-paint": { displayValue: "2.3 s", numericValue: 2340 } },
  },
};

describe("parsePageSpeedResponse", () => {
  it("reads the mobile performance score and LCP", () => {
    expect(parsePageSpeedResponse(SAMPLE)).toEqual({ score: 62, lcpSeconds: 2.3 });
  });
  it("returns nulls for an empty/garbled response", () => {
    expect(parsePageSpeedResponse({})).toEqual({ score: null, lcpSeconds: null });
    expect(parsePageSpeedResponse(null)).toEqual({ score: null, lcpSeconds: null });
  });
});

describe("fetchPageSpeed", () => {
  it("returns null without a key — no pull, no invented score", async () => {
    const fetchFn = vi.fn();
    await expect(fetchPageSpeed("https://example.com", undefined, fetchFn as never)).resolves.toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });
  it("returns score + LCP on a good pull", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, json: async () => SAMPLE });
    const r = await fetchPageSpeed("https://example.com", "key", fetchFn as never);
    expect(r?.score).toBe(62);
    expect(r?.lcpSeconds).toBe(2.3);
    expect(typeof r?.fetchedAt).toBe("string");
  });
  it("returns null on a failed pull", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    await expect(fetchPageSpeed("https://example.com", "key", fetchFn as never)).resolves.toBeNull();
  });
});
