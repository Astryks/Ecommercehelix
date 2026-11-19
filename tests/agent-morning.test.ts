import { describe, expect, it } from "vitest";
import { qaWalk, scorecardBrief, DAY_FIELD_SOURCES, fieldsStillManual, type QaInput } from "@/lib/agent/morning";
import { exampleDays, type Settings } from "@/lib/scorecard";

const SETTINGS: Settings = { monthlyRevenueTarget: 60000, targetMerPct: 30, fixedCostsMonthly: 9000 };
const NOW = "2026-11-19T08:00:00.000Z";

const base = (over: Partial<QaInput> = {}): QaInput => ({
  days: exampleDays("2026-11-19").map((d) => ({ ...d, example: false })),
  settings: SETTINGS,
  yesterday: "2026-11-18",
  sameWeekdayLastWeek: "2026-11-11",
  heroStockDaysLeft: 30,
  refundRatePct7d: 2,
  checkoutOk: true,
  pixelOk: true,
  lastSyncAt: { shopify: NOW, meta: NOW, google: NOW, tiktok: NOW },
  now: NOW,
  ...over,
});

describe("7am QA walk — exceptions that interrupt", () => {
  it("flags revenue down >40% vs the same weekday last week", () => {
    const days = base().days.map((d) => (d.date === "2026-11-18" ? { ...d, revenue: 100, orders: 1 } : d));
    const out = qaWalk(base({ days }));
    expect(out.some((e) => e.key === "revenue-drop" && e.interrupt)).toBe(true);
  });

  it("flags spend with zero orders as a dead-checkout red flag", () => {
    const days = base().days.map((d) => (d.date === "2026-11-18" ? { ...d, orders: 0, adMeta: 300 } : d));
    const out = qaWalk(base({ days }));
    expect(out.some((e) => e.key === "spend-no-orders" && e.interrupt)).toBe(true);
  });

  it("flags a hero product out of stock and a refund spike", () => {
    const out = qaWalk(base({ heroStockDaysLeft: 0, refundRatePct7d: 8.5 }));
    expect(out.map((e) => e.key)).toContain("hero-out-of-stock");
    expect(out.map((e) => e.key)).toContain("refund-spike");
  });

  it("logs a stale feed silently — no interrupt", () => {
    const out = qaWalk(base({ lastSyncAt: { shopify: NOW, meta: "2026-11-15T08:00:00.000Z", google: NOW, tiktok: NOW } }));
    const stale = out.find((e) => e.key === "stale-meta");
    expect(stale).toBeDefined();
    expect(stale!.interrupt).toBe(false);
  });

  it("is quiet on a normal day — 'nothing needs you today' is valid", () => {
    expect(qaWalk(base()).filter((e) => e.interrupt)).toHaveLength(0);
  });
});

describe("8am scorecard brief", () => {
  it("reports stance, CPA vs break-even, and a stale badge when a feed is stale", () => {
    const b = scorecardBrief(base().days, SETTINGS, "2026-11-19", { shopify: NOW, meta: "2026-11-15T08:00:00.000Z", google: NOW, tiktok: NOW }, NOW);
    expect(b.stale).toBe(true);
    expect(b.staleFeeds).toContain("meta");
    expect(b.lines.join(" ")).toContain("Stale");
    expect(b.breakEvenCpa).toBeGreaterThan(0);
  });

  it("says so plainly when there are no numbers yet", () => {
    const b = scorecardBrief([], SETTINGS, "2026-11-19", { shopify: null, meta: null, google: null, tiktok: null }, NOW);
    expect(b.boring).toBe(true);
    expect(b.lines[0]).toContain("No numbers");
  });
});

describe("DayInput field sources", () => {
  it("names all 21 fields with an auto source", () => {
    expect(DAY_FIELD_SOURCES).toHaveLength(21);
    for (const f of DAY_FIELD_SOURCES) expect(f.autoSource.length).toBeGreaterThan(0);
  });

  it("asks the owner for only revenue/orders when Shopify is not connected, and only channel spend otherwise", () => {
    expect(fieldsStillManual({ shopify: false, meta: true, google: true, tiktok: true, ga4: false })).toEqual(["orders", "revenue"]);
    expect(fieldsStillManual({ shopify: true, meta: false, google: true, tiktok: true, ga4: true })).toEqual(["adMeta"]);
    expect(fieldsStillManual({ shopify: true, meta: true, google: true, tiktok: true, ga4: true })).toEqual([]);
  });
});
