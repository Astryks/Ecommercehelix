import { describe, expect, it } from "vitest";
import { buildPlan, currentBlock, totalWeeks, weekOf } from "@/lib/plan12";

describe("12-week plan", () => {
  it("profit first, review last, 12 weeks", () => {
    const p = buildPlan({ bottleneck: "not-converting", weeks: 12 });
    expect(p[0].id).toBe("profit");
    expect(p[3].id).toBe("convert");
    expect(p.at(-1)!.id).toBe("review");
    expect(totalWeeks(p)).toBe(12);
  });
  it("stretches to 24 weeks", () => expect(totalWeeks(buildPlan({ bottleneck: "no-traffic", weeks: 24 }))).toBe(24));
  it("step 1 is profit until it is saved", () => {
    const p = buildPlan({ bottleneck: "no-traffic", weeks: 12 });
    expect(currentBlock(p, 6, { profitSaved: false, numbersSaved: true, fixesDone: true }).id).toBe("profit");
    expect(currentBlock(p, 6, { profitSaved: true, numbersSaved: true, fixesDone: false }).id).toBe("attract");
    expect(weekOf("2026-10-01", "2026-10-15", 12)).toBe(3);
  });
});
