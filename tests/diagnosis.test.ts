import { describe, expect, it } from "vitest";
import { diagnose, goalsFromDiagnosis } from "@/lib/diagnosis";
import { DEFAULT_GOALS } from "@/lib/goals";

describe("diagnosis", () => {
  it("profit first when margin unknown", () => expect(diagnose({ margin: "dk", revenue: "20-80k" }).bottleneck).toBe("profit-leak"));
  it("no traffic", () => {
    const d = diagnose({ margin: "60+", revenue: "none", visitors: "lt1k" });
    expect(d.bottleneck).toBe("no-traffic");
    expect(d.startGoal).toBe("first-100-visits");
    expect(d.track).toBe("starting");
  });
  it("not converting quotes their numbers", () => {
    const d = diagnose({ margin: "60+", revenue: "20-80k", visitors: "5-20k", cr: "lt1" });
    expect(d.bottleneck).toBe("not-converting");
    expect(d.sentence).toContain("5,000 to 20,000");
  });
  it("costly ads, small orders, leaky bucket, scale", () => {
    expect(diagnose({ margin: "40-60", revenue: "20-80k", visitors: "1-5k", cr: "2-3", adSpend: "1-5k" }).bottleneck).toBe("costly-ads");
    expect(diagnose({ margin: "40-60", revenue: "5-20k", visitors: "1-5k", cr: "2-3", aov: "lt40" }).bottleneck).toBe("small-orders");
    expect(diagnose({ margin: "60+", revenue: "80k+", visitors: "1-5k", cr: "2-3", repeat: "lt10" }).bottleneck).toBe("leaky-bucket");
    expect(diagnose({ margin: "60+", revenue: "80k+", visitors: "1-5k", cr: "3+", repeat: "25+", hours: "1-2" })).toMatchObject({ bottleneck: "ready-to-scale", weeks: 24 });
  });
  it("prefills goals", () => expect(goalsFromDiagnosis({ aov: "40-80" }, DEFAULT_GOALS.growing).aov).toBe(66));
});
