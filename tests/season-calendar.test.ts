import { describe, expect, it } from "vitest";
import { bannerFor, easter, featuredEvent, LUNAR, nthWeekdayOf, lastWeekdayOf, thanksgiving, CAL_EVENTS } from "@/lib/season-calendar";
import { promoCode, safeDiscountPct, seasonTasksFor, stageAt } from "@/lib/season-tasks";

describe("moving dates", () => {
  it("computes Easter for several years", () => {
    expect([2026, 2027, 2028, 2029, 2030].map(easter)).toEqual(["2026-04-05", "2027-03-28", "2028-04-16", "2029-04-01", "2030-04-21"]);
  });
  it("computes nth and last weekday holidays", () => {
    expect([2026, 2027, 2028].map(thanksgiving)).toEqual(["2026-11-26", "2027-11-25", "2028-11-23"]);
    expect(nthWeekdayOf(2026, 5, 0, 2)).toBe("2026-05-10"); // Mother's Day
    expect(nthWeekdayOf(2027, 6, 0, 3)).toBe("2027-06-20"); // Father's Day
    expect(lastWeekdayOf(2026, 5, 1)).toBe("2026-05-25"); // Memorial Day
    expect(lastWeekdayOf(2027, 5, 1)).toBe("2027-05-31");
    expect(nthWeekdayOf(2026, 9, 1, 1)).toBe("2026-09-07"); // Labor Day
  });
  it("has checked moon-based dates through at least 2030", () => {
    for (const y of [2026, 2027, 2028, 2029, 2030]) expect(LUNAR[y]).toBeDefined();
    expect(LUNAR[2027].diwali).toBe("2027-10-29");
    expect(LUNAR[2028].eid).toBe("2028-02-26");
  });
  it("every event has a date for 2026 to 2030", () => {
    for (const ev of CAL_EVENTS) for (const y of [2026, 2027, 2028, 2029, 2030]) expect(ev.span(y), `${ev.key} ${y}`).not.toBeNull();
  });
});

describe("banner", () => {
  it("shows Black Friday prep in October with a countdown", () => {
    const b = bannerFor("2026-10-15", "US");
    expect(b.key).toBe("bfcm-2026");
    expect(b.phase).toBe("prep");
    expect(b.text).toContain("build month for Black Friday");
    expect(b.badge).toBe("43 days to go");
  });
  it("starts the Black Friday window on 1 August, not before", () => {
    expect(featuredEvent("2026-08-01", "AU")?.event.key).toBe("bfcm");
    expect(featuredEvent("2026-07-31", "AU")?.event.key).not.toBe("bfcm");
  });
  it("says happening now on the first and last day", () => {
    expect(bannerFor("2026-11-27", "US")).toMatchObject({ key: "bfcm-2026", phase: "live" });
    const last = bannerFor("2026-11-30", "US");
    expect(last.phase).toBe("live");
    expect(last.badge).toBe("Last day");
  });
  it("moves to Christmas the day after Cyber Monday", () => {
    const b = bannerFor("2026-12-01", "US");
    expect(b.key).toBe("christmas-2026");
    expect(b.badge).toBe("24 days to go");
  });
  it("rolls over the new year", () => {
    expect(bannerFor("2026-12-31", "US")).toMatchObject({ key: "new-year-2026", phase: "live" });
    expect(bannerFor("2027-01-01", "US")).toMatchObject({ key: "new-year-2026", phase: "live" });
    expect(bannerFor("2027-01-02", "US").key).toBe("lunar-new-year-2027");
    expect(bannerFor("2027-01-02", "US").badge).toBe("35 days to go");
  });
  it("shows a calm fallback in a quiet time", () => {
    const b = bannerFor("2026-06-15", "AU");
    expect(b.phase).toBe("quiet");
    expect(b.badge).toContain("Next:");
  });
});

describe("seasonal tasks by week", () => {
  const done = new Set<string>();
  it("maps days before an event to the right stage", () => {
    const start = "2026-11-27", end = "2026-11-30";
    expect(stageAt("2026-09-18", start, end)).toBe("plan"); // 70 days out
    expect(stageAt("2026-10-15", start, end)).toBe("plan"); // 43 days out
    expect(stageAt("2026-10-16", start, end)).toBe("creators"); // 42 days out
    expect(stageAt("2026-11-06", start, end)).toBe("codes"); // 21 days out
    expect(stageAt("2026-11-13", start, end)).toBe("dress"); // 14 days out
    expect(stageAt("2026-11-26", start, end)).toBe("dress"); // 1 day out
    expect(stageAt("2026-11-27", start, end)).toBe("live");
    expect(stageAt("2026-12-07", start, end)).toBe("review");
    expect(stageAt("2026-12-08", start, end)).toBeNull();
    expect(stageAt("2026-09-17", start, end)).toBeNull(); // 71 days out
  });
  it("shows the current Black Friday step, then catch-ups", () => {
    const t = seasonTasksFor("2026-11-09", "US", done);
    expect(t[0].taskId).toBe("season-bfcm-2026-codes");
    expect(t.slice(1).map((x) => x.stage)).toEqual(["creators", "plan"]);
    expect(t.every((x, i) => x.catchUp === (i > 0))).toBe(true);
  });
  it("drops done steps", () => {
    const t = seasonTasksFor("2026-11-09", "US", new Set(["season-bfcm-2026-plan", "season-bfcm-2026-creators"]));
    expect(t.map((x) => x.stage)).toEqual(["codes"]);
  });
  it("checks numbers during the event and reviews after", () => {
    expect(seasonTasksFor("2026-11-28", "US", done)[0].stage).toBe("live");
    // The day after Cyber Monday, Christmas prep is the main task; Black Friday review is not ahead of it.
    expect(seasonTasksFor("2026-12-01", "US", done)[0].eventKey).toBe("christmas");
  });
  it("uses the store's own numbers", () => {
    expect(safeDiscountPct({ profitPerOrder: 20, price: 50 })).toBe(20);
    expect(safeDiscountPct({})).toBe(15);
    const t = seasonTasksFor("2026-09-20", "US", done, { profitPerOrder: 20, price: 50, dailyUnits: 4 });
    expect(t[0].stage).toBe("plan");
    expect(t[0].steps.join(" ")).toContain("$20");
    expect(t[0].steps.join(" ")).toContain("48 units");
    expect(promoCode(CAL_EVENTS.find((e) => e.key === "bfcm")!, 2026)).toBe("BFCM26");
  });
});
