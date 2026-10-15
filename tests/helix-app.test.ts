import { describe, expect, it } from "vitest";
import { pickTodayTasks, type TodayTask } from "@/lib/today-tasks";
import { numbersDays, totals } from "@/lib/numbers";
import { achievementsFor, nextToCelebrate } from "@/lib/achievements";
import { buildScorecardEmail } from "@/lib/scorecard-email";
import type { DayInput } from "@/lib/scorecard";

const t = (id: string, kind: TodayTask["kind"] = "day"): TodayTask => ({ id, title: id, why: "", minutes: 5, guideHref: "/", taskId: id, kind });
const S = { monthlyRevenueTarget: 0, targetMerPct: 30, fixedCostsMonthly: 0 };
const day = (date: string, x: Partial<DayInput> = {}): DayInput => ({ date, orders: 0, newCustomerOrders: 0, units: 0, sessions: 0, revenue: 0, newCustomerRevenue: 0, discounts: 0, refunds: 0, cogs: 0, shipping: 0, paymentFees: 0, adMeta: 0, adGoogle: 0, adTiktok: 0, adOther: 0, otherMarketing: 0, metaRevenue: 0, googleRevenue: 0, tiktokRevenue: 0, ...x });

describe("today tasks", () => {
  it("shows at most 3, season first, skips done", () => {
    const r = pickTodayTasks({ today: "2026-10-15", numbersMissingYesterday: true, season: [t("season-a", "season")], day: t("day-1"), insight: t("insight-x", "insight"), done: new Set() });
    expect(r.map((x) => x.id)).toEqual(["season-a", "day-1", "insight-x"]);
    const r2 = pickTodayTasks({ today: "2026-10-15", numbersMissingYesterday: true, season: [], day: t("day-1"), insight: null, done: new Set(["day-1"]) });
    expect(r2.map((x) => x.kind)).toEqual(["numbers"]);
  });
});

describe("numbers", () => {
  it("fills gaps, estimates cost of goods from unit cost, works out profit", () => {
    const rows = numbersDays([day("2026-10-14", { revenue: 200, orders: 4, units: 5, adMeta: 50, shipping: 10, paymentFees: 5 })], S, "2026-10-14", 3, 10);
    expect(rows.map((r) => r.hasData)).toEqual([false, false, true]);
    const d = rows[2];
    expect(d.cogs).toBe(50);
    expect(d.cogsEstimated).toBe(true);
    expect(d.profit).toBe(200 - 50 - 50 - 10 - 5);
    expect(d.roas).toBe(4);
    expect(d.costPerOrder).toBe(12.5);
    expect(totals(rows).revenue).toBe(200);
  });
  it("keeps real cost of goods when given", () => {
    expect(numbersDays([day("2026-10-14", { revenue: 100, units: 5, cogs: 20 })], S, "2026-10-14", 1, 10)[0].cogs).toBe(20);
  });
});

describe("achievements", () => {
  const base = { totalProfit: 0, bestDayProfit: 0, bestStreak: 0, tasksDone: 0, lessonsDone: 0, daysWithNumbers: 0, firstAd: false, goalsDone: 0 };
  it("earns profit milestones, streaks and first ad", () => {
    const keys = achievementsFor({ ...base, totalProfit: 1200, bestStreak: 7, firstAd: true, tasksDone: 1 }).map((a) => a.key);
    expect(keys).toEqual(expect.arrayContaining(["profit-100", "profit-1000", "streak-3", "streak-7", "first-ad", "first-task"]));
    expect(keys).not.toContain("profit-5000");
  });
  it("celebrates the newest unseen one only", () => {
    const all = achievementsFor({ ...base, tasksDone: 1, firstAd: true });
    expect(nextToCelebrate(all, new Set(["first-task"]))?.key).toBe("first-ad");
    expect(nextToCelebrate(all, new Set(all.map((a) => a.key)))).toBeNull();
  });
});

describe("monday scorecard email", () => {
  it("is null with no real numbers and compares weeks otherwise", () => {
    expect(buildScorecardEmail([], S, "2026-10-19", { baseUrl: "https://x" })).toBeNull();
    const days = [day("2026-10-12", { revenue: 300, orders: 3 }), day("2026-10-05", { revenue: 100, orders: 1 })];
    const m = buildScorecardEmail(days, S, "2026-10-19", { name: "Sam Lee", baseUrl: "https://x" })!;
    expect(m.subject).toContain("$300");
    expect(m.text).toContain("Hi Sam,");
    expect(m.text).toContain("up 200%");
  });
});

import { planToday } from "@/lib/today-tasks";
describe("planToday", () => {
  const t = (id: string, kind: TodayTask["kind"] = "day"): TodayTask => ({ id, title: id, why: "w", minutes: 10, guideHref: "/x", taskId: id, kind });
  it("groups into Morning check, Main focus, Before you finish, 5 to 7 tasks, season tagged first in main", () => {
    const p = planToday({ today: "2026-10-15", numbersMissingYesterday: true, season: [t("season-a", "season")], day: t("day-1"), insight: t("insight-x", "insight"), done: new Set(), hasAds: true, seasonTag: "Black Friday" });
    expect(p.blocks.map((b) => b.title)).toEqual(["Morning check", "Main focus", "Before you finish"]);
    expect(p.total).toBeGreaterThanOrEqual(5); expect(p.total).toBeLessThanOrEqual(7);
    expect(p.blocks[1].tasks[0].tag).toBe("Black Friday");
    expect(p.blocks[0].tasks[0].taskId).toBe("numbers-2026-10-15");
  });
  it("keeps done tasks with a tick and fills the bar", () => {
    const p = planToday({ today: "2026-10-15", numbersMissingYesterday: false, season: [], day: t("day-1"), insight: null, done: new Set(["numbers-2026-10-15", "routine-win-2026-10-15"]) });
    expect(p.done).toBe(2); expect(p.total).toBe(4); expect(p.pct).toBe(50);
  });
  it("never goes over the maximum", () => {
    const p = planToday({ today: "2026-10-15", numbersMissingYesterday: true, season: [t("season-a", "season")], day: t("day-1"), insight: t("insight-x", "insight"), done: new Set(), hasAds: true }, 5);
    expect(p.total).toBe(5);
  });
});
