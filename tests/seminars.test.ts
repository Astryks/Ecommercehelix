import { describe, it, expect } from "vitest";
import { SEMINARS } from "@/lib/seminars/curriculum";
import { seminarForDate, baseForDate, cycleOrder, schedule, EPOCH, MIN_GAP, seededShuffle } from "@/lib/seminars/rotation";
import { addDays } from "@/lib/dates";

describe("seminar curriculum", () => {
  it("has 40+ unique seminars, 15-20 minutes, 3-4 concepts each", () => {
    expect(SEMINARS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(SEMINARS.map((s) => s.id)).size).toBe(SEMINARS.length);
    for (const s of SEMINARS) {
      expect(s.minutes).toBeGreaterThanOrEqual(15);
      expect(s.minutes).toBeLessThanOrEqual(20);
      expect(s.concepts.length).toBeGreaterThanOrEqual(3);
      expect(s.concepts.length).toBeLessThanOrEqual(4);
      expect(s.takeaways.length).toBeGreaterThanOrEqual(3);
    }
  });
  it("covers every teen-course chapter 1-40", () => {
    const ch = new Set(SEMINARS.flatMap((s) => s.chapters));
    for (let i = 1; i <= 40; i++) expect(ch.has(i), `chapter ${i}`).toBe(true);
  });
});

describe("daily rotation", () => {
  it("is deterministic", () => {
    expect(seminarForDate("2027-03-04").seminar.id).toBe(seminarForDate("2027-03-04").seminar.id);
    expect(seededShuffle([1, 2, 3, 4, 5], 7)).toEqual(seededShuffle([1, 2, 3, 4, 5], 7));
  });
  it("first pass covers every seminar once and builds from Start", () => {
    const first = cycleOrder(0);
    expect(new Set(first.map((s) => s.id)).size).toBe(SEMINARS.length);
    expect(first[0].stage).toBe("Start");
    expect(first[first.length - 1].stage).toBe("Grow");
  });
  it("each cycle is a permutation, differs from the last, and never repeats a cluster back-to-back", () => {
    let prevLast = cycleOrder(0).at(-1)!;
    for (let c = 1; c <= 8; c++) {
      const o = cycleOrder(c);
      expect(new Set(o.map((s) => s.id)).size).toBe(SEMINARS.length);
      expect(o.map((s) => s.id)).not.toEqual(cycleOrder(c - 1).map((s) => s.id));
      expect(o[0].cluster).not.toBe(prevLast.cluster);
      for (let i = 1; i < o.length; i++) expect(o[i].cluster, `cycle ${c} pos ${i}`).not.toBe(o[i - 1].cluster);
      prevLast = o.at(-1)!;
    }
  });
  it("base schedule never repeats a seminar within MIN_GAP days", () => {
    const seen = new Map<string, number>();
    for (let d = 0; d < SEMINARS.length * 8; d++) {
      const id = baseForDate(addDays(EPOCH, d)).id;
      const last = seen.get(id);
      if (last !== undefined) expect(d - last).toBeGreaterThanOrEqual(MIN_GAP);
      seen.set(id, d);
    }
  });
  it("pulls BFCM and Christmas seminars forward in the weeks before", () => {
    const bf = schedule("2026-11-06", 22).filter((p) => p.reason === "event");
    expect(bf.length).toBeGreaterThan(0);
    expect(bf.some((p) => p.seminar.events.includes("bfcm"))).toBe(true);
    const xmas = schedule("2027-12-04", 21).filter((p) => p.event?.key === "christmas");
    expect(xmas.length).toBeGreaterThan(0);
  });
  it("never shows the same seminar on two days in a row, across two years", () => {
    const s = schedule(EPOCH, 730);
    for (let i = 1; i < s.length; i++) expect(s[i].seminar.id).not.toBe(s[i - 1].seminar.id);
  });
});
