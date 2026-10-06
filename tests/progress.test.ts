import { describe, expect, it } from "vitest";
import { dayProgress } from "@/lib/progress";

const DAYS = [1, 2, 3, 4].map((day) => ({ day, stage: 1 }));
const run = (done: number[], today: number[], ahead = false) =>
  dayProgress({
    days: DAYS,
    doneIds: new Set(done.map((d) => `day-${d}`)),
    completedToday: today.map((d) => `day-${d}`),
    ahead,
    unlocked: () => true,
    taskId: (d) => `day-${d}`,
  });

describe("day progress", () => {
  it("starts at day 1", () => {
    const p = run([], []);
    expect(p.current?.day).toBe(1);
    expect(p.lessonDoneToday).toBe(false);
  });

  it("day 2 done early (quick update) does not hide day 1 or show the done banner", () => {
    const p = run([2], [2]);
    expect(p.nextDay?.day).toBe(1);
    expect(p.current?.day).toBe(1);
    expect(p.lessonDoneToday).toBe(false);
    expect(p.status(DAYS[0])).toBe("today");
    expect(p.status(DAYS[1])).toBe("done");
  });

  it("after finishing day 1 with day 2 already done, next is day 3 and the banner shows", () => {
    const p = run([1, 2], [1, 2]);
    expect(p.nextDay?.day).toBe(3);
    expect(p.current).toBeUndefined();
    expect(p.lessonDoneToday).toBe(true);
    expect(p.status(DAYS[2])).toBe("tomorrow");
  });

  it("ahead=1 opens the next lesson now", () => {
    const p = run([1], [1], true);
    expect(p.current?.day).toBe(2);
    expect(p.status(DAYS[1])).toBe("today");
  });

  it("a gap is filled first: lowest unfinished day wins", () => {
    const p = run([1, 3, 4], []);
    expect(p.current?.day).toBe(2);
  });

  it("days finished on earlier dates do not trigger the banner", () => {
    const p = run([1], []);
    expect(p.lessonDoneToday).toBe(false);
    expect(p.current?.day).toBe(2);
  });
});
