import { describe, expect, it } from "vitest";
import { tiktokCheck, tiktokDailySpend, tiktokMode } from "../src/lib/tiktok/config";
import { cleanPropertyId, ga4Sessions } from "../src/lib/google-ads/config";

describe("tiktok", () => {
  it("is off without the flag and keys", () => {
    expect(tiktokMode({ TIKTOK_APP_ID: "a", TIKTOK_APP_SECRET: "b" })).toBe("off");
    expect(tiktokMode({ TIKTOK_ADS: "1" })).toBe("off");
    expect(tiktokMode({ TIKTOK_ADS: "1", TIKTOK_APP_ID: "a", TIKTOK_APP_SECRET: "b" })).toBe("live");
  });
  it("sums spend per day", () => {
    expect(tiktokDailySpend([
      { dimensions: { stat_time_day: "2026-10-26 00:00:00" }, metrics: { spend: "10.505" } },
      { dimensions: { stat_time_day: "2026-10-26 00:00:00" }, metrics: { spend: "1" } },
      { dimensions: { stat_time_day: "2026-10-25 00:00:00" }, metrics: { spend: "x" } },
      { dimensions: {}, metrics: { spend: "5" } },
    ])).toEqual([{ date: "2026-10-25", value: 0 }, { date: "2026-10-26", value: 11.51 }]);
  });
  it("throws on non-zero code", () => {
    expect(() => tiktokCheck({ code: 40105, message: "token expired" })).toThrow(/40105/);
    expect(tiktokCheck({ code: 0, data: { a: 1 } })).toEqual({ a: 1 });
  });
});

describe("ga4", () => {
  it("parses runReport rows", () => {
    expect(ga4Sessions({ rows: [{ dimensionValues: [{ value: "20261026" }], metricValues: [{ value: "42" }] }, { dimensionValues: [{ value: "bad" }] }] })).toEqual([{ date: "2026-10-26", value: 42 }]);
  });
  it("cleans property ids", () => {
    expect(cleanPropertyId("properties/123456")).toBe("123456");
  });
});
