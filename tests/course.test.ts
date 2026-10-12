import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseModuleSections, type ParsedLesson } from "@/lib/lesson-parse";
import { buildDays, COURSE_TASK_ID, currentDay, dayDone, estimateMinutes, finishStatus, GOALS, goalsFor, nextGoalId, slotDated, type FinishCtx, type Lookup } from "@/lib/course-plan";

const PB = path.join(__dirname, "..", "docs", "playbook");
const lessons = new Map<string, ParsedLesson>();
for (const f of fs.readdirSync(PB).filter((f) => /^\d\d-.*\.md$/.test(f)))
  for (const s of parseModuleSections(fs.readFileSync(path.join(PB, f), "utf8"))) if (s.kind === "lesson") lessons.set(s.ref, s);
const lookup: Lookup = (ref) => {
  const l = lessons.get(ref);
  return l ? { ref, title: l.title, href: `/learn/x#${ref}`, steps: l.steps.map((s) => ({ n: s.n, instruction: s.instruction, expected: s.expected, action: s.action })) } : null;
};
const ctx = (o: Partial<FinishCtx> = {}): FinishCtx => ({ realDays7: 7, realDays30: 30, sessionsPerDay7: 0, atcPct7: null, crPct7: 0, aov7: 0, marginPct30: 0, revenue30: 0, revenuePrev30: 0, returningPct30: 0, merPct30: 30, targetMerPct: 30, costsEntered: false, baselineAov: 50, ...o });

describe("Helix Course plan", () => {
  it("links every goal to real lessons and builds days of 1 to 5 tasks", () => {
    for (const g of GOALS) {
      for (const ref of g.lessons) expect(lessons.has(ref), `${g.id} ${ref}`).toBe(true);
      const days = buildDays(g, lookup);
      expect(days.length, g.id).toBeGreaterThanOrEqual(3);
      for (const d of days) {
        expect(d.tasks.length).toBeGreaterThanOrEqual(1);
        expect(d.tasks.length).toBeLessThanOrEqual(5);
        for (const t of d.tasks) {
          expect(COURSE_TASK_ID.test(t.id), t.id).toBe(true);
          expect(t.title.length).toBeGreaterThan(10);
          expect(t.expected.length).toBeGreaterThan(5);
          expect(t.minutes).toBeGreaterThan(0);
        }
      }
    }
  });
  it("has light and busy days", () => {
    const sizes = GOALS.flatMap((g) => buildDays(g, lookup).map((d) => d.tasks.length));
    expect(sizes).toContain(1);
    expect(Math.max(...sizes)).toBeGreaterThanOrEqual(4);
  });
  it("orders goals numbers first, then attract, convert, grow, run, on every track", () => {
    const order = ["numbers", "attract", "convert", "grow", "run"];
    for (const t of ["starting", "growing", "scaling"] as const) {
      const ph = goalsFor(t).map((g) => order.indexOf(g.phase));
      expect([...ph].sort((a, b) => a - b)).toEqual(ph);
      expect(goalsFor(t)[0].id).toBe("true-profit");
    }
  });
  it("uses plain copy with no em-dashes", () => {
    for (const g of GOALS) for (const s of [g.title, g.finishLine, g.why]) expect(s).not.toMatch(/\u2014/);
  });
  it("tracks the current day and unlocks the next when ticked", () => {
    const days = buildDays(GOALS[0], lookup);
    const done = new Set<string>();
    expect(currentDay(days, done)).toEqual({ n: 1, allDone: false });
    for (const t of days[0].tasks) done.add(t.id);
    expect(dayDone(days[0], done)).toBe(true);
    expect(currentDay(days, done).n).toBe(2);
    for (const d of days) for (const t of d.tasks) done.add(t.id);
    expect(currentDay(days, done)).toEqual({ n: days.length, allDone: true });
  });
  it("checks finish lines against real numbers", () => {
    const atc = GOALS.find((g) => g.id === "add-to-cart-8")!;
    expect(finishStatus(atc, ctx({ atcPct7: 6 }), 5, 5, false).met).toBe(false);
    expect(finishStatus(atc, ctx({ atcPct7: 6 }), 5, 5, false).pct).toBe(75);
    expect(finishStatus(atc, ctx({ atcPct7: 8.4 }), 5, 5, false).met).toBe(true);
    // Not enough data: the owner can confirm once the days are done.
    expect(finishStatus(atc, ctx({ realDays30: 1, atcPct7: null }), 5, 5, false).canSelfConfirm).toBe(true);
    const visits = GOALS.find((g) => g.id === "1000-visits")!;
    expect(finishStatus(visits, ctx({ sessionsPerDay7: 1200, merPct30: 40 }), 5, 5, false).met).toBe(false);
    const aov = GOALS.find((g) => g.id === "aov-plus-10")!;
    expect(finishStatus(aov, ctx({ aov7: 56 }), 5, 5, false).met).toBe(true);
    const self = GOALS.find((g) => g.id === "email-flows")!;
    expect(finishStatus(self, ctx(), 4, 4, false).met).toBe(false);
    expect(finishStatus(self, ctx(), 4, 4, true).met).toBe(true);
  });
  it("moves to the next goal in order", () => {
    expect(nextGoalId("starting", [])).toBe("true-profit");
    expect(nextGoalId("starting", ["true-profit"])).toBe("daily-numbers");
    expect(nextGoalId("growing", goalsFor("growing").map((g) => g.id))).toBeNull();
  });
  it("slots up to two dated tasks due within a week", () => {
    const dated = [
      { id: "a", title: "A", due: "2026-10-15", why: "x", href: "/", minutes: 10, kind: "season" as const },
      { id: "b", title: "B", due: "2026-10-14", why: "x", href: "/", minutes: 10, kind: "admin" as const },
      { id: "c", title: "C", due: "2026-12-01", why: "x", href: "/", minutes: 10, kind: "season" as const },
    ];
    const out = slotDated([], dated, "2026-10-13", new Set());
    expect(out.map((d) => d.id)).toEqual(["b", "a"]);
  });
  it("estimates time from the kind of step", () => {
    expect(estimateMinutes("Open Shopify and check the report.")).toBe(5);
    expect(estimateMinutes("Write the role as outcomes.")).toBe(20);
  });
});
