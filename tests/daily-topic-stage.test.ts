import { describe, expect, it } from "vitest";
import { TOPICS, topicFor, topicForStage } from "@/lib/daily-topic";

const add = (d: string, n: number) => new Date(Date.parse(d + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);

describe("daily topic follows the user's stage", () => {
  it("keeps the shared topic when the user is at or before its stage", () => {
    const d = "2026-10-28"; // early in the cycle: an Attract topic
    expect(topicFor(d).stage).toBe("attract");
    expect(topicForStage(d, null).ref).toBe(topicFor(d).ref);
    expect(topicForStage(d, "attract").ref).toBe(topicFor(d).ref);
  });
  it("gives a later-stage user a topic from their own stage", () => {
    expect(topicForStage("2026-10-28", "grow").stage).toBe("grow");
    expect(topicForStage("2026-10-28", "convert").stage).toBe("convert");
  });
  it("never repeats yesterday's topic, for any stage, over two full cycles", () => {
    for (const stage of [null, "attract", "convert", "grow"] as const) {
      let d = "2026-10-27";
      let prev = topicForStage(d, stage).ref;
      for (let i = 0; i < TOPICS.length * 2; i++) {
        d = add(d, 1);
        const t = topicForStage(d, stage);
        expect(t.ref).not.toBe(prev);
        prev = t.ref;
      }
    }
  });
});
