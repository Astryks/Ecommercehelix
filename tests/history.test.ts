import { describe, expect, it } from "vitest";
import { bestStreak, monthly, timeline } from "@/lib/history";

describe("progress history", () => {
  const h = {
    completions: [{ taskId: "a", completedOn: "2026-09-01" }, { taskId: "b", completedOn: "2026-09-02" }, { taskId: "c", completedOn: "2026-10-05" }],
    steps: [{ stepKey: "1.7#1", at: "2026-10-05T01:00:00Z" }, { stepKey: "1.7#2", at: "2026-10-05T02:00:00Z" }],
    events: [{ kind: "goal_done", ref: "profit-dashboard", at: "2026-10-05T03:00:00Z" }],
  };
  it("finds the best streak", () => expect(bestStreak(["2026-09-01", "2026-09-02", "2026-09-04"])).toBe(2));
  it("builds a day timeline and monthly recap", () => {
    const t = timeline(h);
    expect(t[0]).toMatchObject({ date: "2026-10-05", tasks: 1, goals: ["profit-dashboard"] });
    expect(t[0].lessons.get("1.7")).toBe(2);
    expect(monthly(h)).toEqual([{ month: "2026-10", tasks: 1, steps: 2, goals: 1, activeDays: 1 }, { month: "2026-09", tasks: 2, steps: 0, goals: 0, activeDays: 2 }]);
  });
});
