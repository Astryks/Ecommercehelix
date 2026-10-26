import { describe, expect, test } from "vitest";
import { didIGrow, localDays, personalBests, rollup, spreadManual, targetFor, targetHistory, targetStreak, ytd, type ScoreDay } from "../src/lib/scoreboard/core";
import { growPlan, GROW_TASK_ID } from "../src/lib/scoreboard/grow-plan";
import { parseLastYearCsv } from "../src/lib/scoreboard/csv";
import { addDays } from "../src/lib/dates";
import type { DayInput } from "../src/lib/scorecard";

const day = (date: string, sales: number, costs = sales * 0.7, extra: Partial<ScoreDay> = {}): ScoreDay => ({ date, sales, costs, profit: sales - costs, orders: Math.round(sales / 50), adSpend: sales * 0.2, source: "manual", example: false, ...extra });
const series = (end: string, n: number, f: (i: number) => number) => Array.from({ length: n }, (_, i) => day(addDays(end, -(n - 1 - i)), f(i)));

describe("targets", () => {
  test("flat history: target is the average plus 5%, rounded to $10", () => {
    const t = targetFor(series("2026-10-26", 28, () => 1000), "2026-10-27");
    expect(t.amount).toBe(1050);
    expect(t.custom).toBe(false);
  });
  test("custom goal wins", () => {
    expect(targetFor(series("2026-10-26", 28, () => 1000), "2026-10-27", 2222).amount).toBe(2222);
  });
  test("not enough data: no target", () => {
    expect(targetFor(series("2026-10-26", 3, () => 1000), "2026-10-27").amount).toBeNull();
  });
  test("trend is capped at +10%", () => {
    const d = series("2026-10-26", 28, (i) => (i < 14 ? 500 : 2000));
    const t = targetFor(d, "2026-10-27");
    expect(t.basis.trendPct).toBeGreaterThan(100);
    // base = 0.6 x same-weekday avg (2000,2000,500,500) + 0.4 x 14-day avg (2000) = 1550; x1.10 cap x1.05
    expect(t.amount).toBe(1790);
  });
  test("same weekday counts more", () => {
    // Mondays sell 2000, other days 1000.
    const d = series("2026-10-25", 28, (i) => (new Date(addDays("2026-10-25", -(27 - i)) + "T12:00:00Z").getUTCDay() === 1 ? 2000 : 1000));
    const mon = targetFor(d, "2026-10-26").amount!; // a Monday
    const tue = targetFor(d, "2026-10-27").amount!;
    expect(mon).toBeGreaterThan(tue);
  });
  test("last year's same day is blended in when both years exist", () => {
    const d = series("2026-10-26", 400, () => 1000);
    const spike = d.find((x) => x.date === addDays("2026-10-27", -364))!;
    spike.sales = 5000;
    expect(targetFor(d, "2026-10-27").amount!).toBeGreaterThan(1050);
  });
});

describe("did I grow", () => {
  const base = series("2026-10-25", 28, () => 1000);
  test("yes when above the usual weekday", () => {
    const r = didIGrow([...base, day("2026-10-26", 1300)], "2026-10-26");
    expect(r.verdict).toBe("yes");
    expect(r.hitTarget).toBe(true);
    expect(r.vsUsual?.pct).toBe(30);
  });
  test("not yet when just under", () => expect(didIGrow([...base, day("2026-10-26", 950)], "2026-10-26").verdict).toBe("not-yet"));
  test("no when clearly under", () => expect(didIGrow([...base, day("2026-10-26", 500)], "2026-10-26").verdict).toBe("no"));
  test("no-data is honest", () => expect(didIGrow(base, "2026-10-26").verdict).toBe("no-data"));
});

describe("streaks", () => {
  test("counts consecutive target hits ending yesterday", () => {
    const d = series("2026-10-23", 28, () => 1000);
    d.push(day("2026-10-24", 2000), day("2026-10-25", 2000), day("2026-10-26", 2000));
    const s = targetStreak(targetHistory(d, "2026-10-26"), "2026-10-26");
    expect(s.current).toBe(3);
    expect(s.best).toBeGreaterThanOrEqual(3);
  });
  test("a missed day breaks it", () => {
    const h = [{ date: "2026-10-24", hit: true }, { date: "2026-10-25", hit: false }, { date: "2026-10-26", hit: true }];
    expect(targetStreak(h, "2026-10-26")).toEqual({ current: 1, best: 1, hits: 2 });
  });
});

describe("rollups", () => {
  const d = series("2026-03-31", 90, () => 100); // 1 Jan to 31 Mar 2026
  test("months", () => {
    const m = rollup(d, "month");
    expect(m.map((x) => x.key)).toEqual(["2026-01-01", "2026-02-01", "2026-03-01"]);
    expect(m[1].sales).toBe(2800);
    expect(m[0].marginPct).toBe(30);
    expect(m[0].roas).toBe(5);
  });
  test("weeks start Monday", () => {
    const w = rollup(d, "week");
    expect(w[0].key).toBe("2025-12-29");
    expect(w[1].key).toBe("2026-01-05");
    expect(w[1].sales).toBe(700);
  });
  test("years", () => expect(rollup(d, "year")[0]).toMatchObject({ key: "2026-01-01", sales: 9000, label: "2026" }));
  test("manual months fill gaps only", () => {
    const merged = spreadManual(d, [{ kind: "month", start: "2025-12-01", sales: 3100, costs: 2000, adSpend: 0, orders: 31 }, { kind: "month", start: "2026-01-01", sales: 99999, costs: 0, adSpend: 0, orders: 0 }]);
    const m = rollup(merged, "month");
    expect(m[0]).toMatchObject({ key: "2025-12-01" });
    expect(Math.round(m[0].sales)).toBe(3100);
    expect(m[1].sales).toBe(3100); // January keeps daily data
  });
  test("personal bests", () => {
    const b = personalBests([...d, day("2026-02-14", 900)]);
    expect(b.find((x) => x.kind === "day")).toMatchObject({ key: "2026-02-14", sales: 900 });
    expect(b.find((x) => x.kind === "month")?.key).toBe("2026-02-01"); // Feb holds the 900 day
  });
});

describe("year to date vs last year", () => {
  test("same calendar span", () => {
    const d = [...series("2025-12-31", 365, () => 100), ...series("2026-10-26", 299, () => 120)];
    const y = ytd(d, "2026-10-26");
    expect(y.lyTo).toBe("2025-10-26");
    expect(y.now.days).toBe(299);
    expect(y.ly.days).toBe(299);
    expect(y.salesChangePct).toBe(20);
    expect(y.lyCoverage).toBe(1);
  });
  test("leap day maps to 28 Feb", () => expect(ytd([], "2028-02-29").lyTo).toBe("2027-02-28"));
  test("missing last year: no change %", () => expect(ytd(series("2026-10-26", 10, () => 1), "2026-10-26").salesChangePct).toBeNull());
});

describe("time zones", () => {
  // 13:30 UTC on 26 Oct = 00:30 on 27 Oct in Sydney (AEDT, UTC+11), still 26 Oct in London and New York.
  const t = new Date("2026-10-26T13:30:00Z");
  test("Sydney", () => expect(localDays(t, "Australia/Sydney")).toEqual({ today: "2026-10-27", yesterday: "2026-10-26" }));
  test("London", () => expect(localDays(t, "Europe/London")).toEqual({ today: "2026-10-26", yesterday: "2026-10-25" }));
  test("Los Angeles", () => expect(localDays(new Date("2026-10-27T06:00:00Z"), "America/Los_Angeles").today).toBe("2026-10-26"));
  test("Perth (no daylight saving)", () => expect(localDays(new Date("2026-10-26T16:30:00Z"), "Australia/Perth").today).toBe("2026-10-27"));
  test("bad zone falls back", () => expect(localDays(t, "Not/AZone").today).toMatch(/^\d{4}-\d{2}-\d{2}$/));
});

describe("grow plan", () => {
  const raw = (date: string, o: Partial<DayInput>): DayInput => ({ date, orders: 10, newCustomerOrders: 5, units: 10, sessions: 1000, revenue: 1000, newCustomerRevenue: 0, discounts: 0, refunds: 0, cogs: 300, shipping: 50, paymentFees: 30, adMeta: 100, adGoogle: 0, adTiktok: 0, adOther: 0, otherMarketing: 0, metaRevenue: 0, googleRevenue: 0, tiktokRevenue: 0, ...o });
  const week = (o: Partial<DayInput>) => Array.from({ length: 7 }, (_, i) => raw(addDays("2026-10-26", -i), o));
  test("weak ads and low conversion", () => {
    const t = growPlan({ today: "2026-10-27", days: week({ adMeta: 800 }), verdict: "no", completedIds: [] });
    expect(t.map((x) => x.rule)).toEqual(["weak-ads", "conversion", "email"]);
    expect(t.every((x) => GROW_TASK_ID.test(x.taskId))).toBe(true);
  });
  test("strong day: scale gently", () => {
    const t = growPlan({ today: "2026-10-27", days: week({ sessions: 300 }), verdict: "yes", completedIds: [] });
    expect(t[0].rule).toBe("scale");
    expect(t[0].stage).toBe("grow");
  });
  test("no repeats of a rule done in the last week", () => {
    const t = growPlan({ today: "2026-10-27", days: week({ sessions: 300 }), verdict: "yes", completedIds: ["grow-scale-2026-10-25"] });
    expect(t.some((x) => x.rule === "scale")).toBe(false);
  });
  test("no data asks for numbers first", () => expect(growPlan({ today: "2026-10-27", days: [], verdict: "no-data", completedIds: [] })[0].rule).toBe("numbers"));
});

test("last-year CSV", () => {
  const r = parseLastYearCsv("period,sales,costs,ad_spend,orders\n2025-01,\"12,000\",8400,2100,140\n2025-03-03,500,300,0,5\nbad,1,1,1,1\n");
  expect(r).toEqual([{ kind: "month", start: "2025-01-01", sales: 12000, costs: 8400, adSpend: 2100, orders: 140 }, { kind: "week", start: "2025-03-03", sales: 500, costs: 300, adSpend: 0, orders: 5 }]);
});
