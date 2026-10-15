import { describe, expect, it } from "vitest";
import { mergeProgress } from "@/components/learn/progress-store";

describe("lesson progress merge", () => {
  it("adds local ticks and keeps server ones", () => {
    const m = mergeProgress(["1.1#1"], ["1.1#2"], new Map());
    expect([...m.done].sort()).toEqual(["1.1#1", "1.1#2"]);
    expect(m.toAdd).toEqual(["1.1#2"]);
    expect(m.toRemove).toEqual([]);
  });
  it("an untick made before sign-in finished is not undone by the server", () => {
    const m = mergeProgress(["1.1#1", "1.1#2"], ["1.1#1", "1.1#2"], new Map([["1.1#2", false]]));
    expect([...m.done]).toEqual(["1.1#1"]);
    expect(m.toRemove).toEqual(["1.1#2"]);
  });
});
