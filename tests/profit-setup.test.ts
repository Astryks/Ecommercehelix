import { describe, expect, it } from "vitest";
import { EXAMPLE_INPUTS, marketingGuide, readMarketing, waterfall } from "@/lib/profit-setup";

describe("profit setup", () => {
  it("works the $60 example down to net profit", () => {
    const w = waterfall(EXAMPLE_INPUTS);
    expect(w.landed).toBe(15);
    expect(w.fees).toBe(1.35);
    expect(w.beforeMarketing).toBe(33.15);
    expect(w.contribution).toBe(18.15);
    expect(w.netPerOrder).toBe(15.25);
    expect(w.layers.at(-1)!.left).toBe(15.25);
    expect(Math.round(w.breakEvenMerPct)).toBe(55);
    expect(w.breakEvenRoas).toBeCloseTo(1.81, 2);
    expect(w.month.net).toBe(3050);
  });
  it("gives a marketing guide by stage", () => {
    expect(marketingGuide(0).stage).toBe("pre");
    expect(marketingGuide(20_000)).toMatchObject({ low: 10, high: 30 });
    expect(marketingGuide(250_000)).toMatchObject({ low: 15, high: 25 });
    expect(readMarketing(60, 20_000, 55).tone).toBe("red");
    expect(readMarketing(35, 20_000, 55).tone).toBe("amber");
    expect(readMarketing(20, 20_000, 55).tone).toBe("green");
    expect(readMarketing(20, 1000, 55).tone).toBe("none");
  });
});
