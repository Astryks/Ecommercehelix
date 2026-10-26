import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { MILESTONES, FREE_LEVELS, levelFromNumbers, positionFor, progressToNext, xpFor, coachLine, allJourneyLessonRefs, teaserOf } from "@/lib/journey";
import { journeyView } from "@/lib/journey-view";
import { lessonLink } from "@/lib/lesson-links";
import { canReadLesson } from "@/lib/paywall/access";

const f = (lifetimeOrders: number, lifetimeSales: number, last30Sales: number) => ({ lifetimeOrders, lifetimeSales, last30Sales });

describe("Road to $100M", () => {
  it("has 7 levels, each with 3 numbers and 5 moves", () => {
    expect(MILESTONES.map((m) => m.level)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const m of MILESTONES) { expect(m.numbers).toHaveLength(3); expect(m.moves).toHaveLength(5); expect(m.whatChanges.length).toBeGreaterThan(1); }
  });
  it("every move links to a real lesson", () => {
    for (const r of allJourneyLessonRefs()) expect(lessonLink(r), r).not.toBeNull();
  });
  it("levels 1-2 only point to free lessons", () => {
    for (const m of MILESTONES.filter((x) => x.level <= FREE_LEVELS)) for (const x of m.moves) expect(canReadLesson("free", x.lesson!), x.lesson).toBe(true);
  });
  it("places the marker from real numbers", () => {
    expect(levelFromNumbers(f(0, 0, 0))).toBe(0);
    expect(levelFromNumbers(f(1, 40, 40))).toBe(1);
    expect(levelFromNumbers(f(30, 1200, 300))).toBe(2);
    expect(levelFromNumbers(f(300, 50_000, 12_000))).toBe(3);
    expect(levelFromNumbers(f(9, 9e6, 900_000))).toBe(5);
    expect(levelFromNumbers(f(9, 9e8, 9_000_000))).toBe(7);
    expect(progressToNext(f(300, 50_000, 42_000), 3)).toBeCloseTo(0.5);
  });
  it("real numbers win over the picked level; picked level used otherwise", () => {
    expect(positionFor(f(1, 50, 50), 6)).toEqual({ level: 1, source: "numbers" });
    expect(positionFor(f(0, 0, 0), 4)).toEqual({ level: 4, source: "self" });
    expect(positionFor(null, 99)).toEqual({ level: 0, source: "none" });
  });
  it("Free gets levels 1-2 in full and only teasers after (no numbers or moves sent)", () => {
    const v = journeyView("free", false);
    expect(v.filter((x) => x.open).map((x) => x.level)).toEqual([1, 2]);
    const locked = v.find((x) => x.level === 5)!;
    expect(locked.open).toBe(false);
    expect(JSON.stringify(locked)).not.toContain("Give every job and number one owner");
    expect(Object.keys(teaserOf(MILESTONES[4]))).not.toContain("moves");
    expect(journeyView("starter", true).every((x) => x.open)).toBe(true);
  });
  it("XP adds lesson XP and actions", () => {
    expect(xpFor({ lessonXp: 100, tasksDone: 2, goalsDone: 1, daysWithNumbers: 3 })).toBe(100 + 10 + 50 + 15);
  });
  it("coach line names the level and the next stop", () => {
    expect(coachLine({ level: 0, source: "none" })).toBeNull();
    expect(coachLine({ level: 3, source: "numbers" })).toMatch(/level 3 of 7.*\$10k a month.*\$1M a year/);
  });
  it("never names outside courses or platforms", () => {
    const text = JSON.stringify(MILESTONES).toLowerCase();
    for (const bad of ["skool", "$100m framework", "100m framework"]) expect(text).not.toContain(bad);
  });
});
