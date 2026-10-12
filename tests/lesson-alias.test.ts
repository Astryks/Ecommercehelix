import { describe, expect, it } from "vitest";
import { canonicalRef, canonicalStepKey, canonicalStepKeys, oldAnchorsFor } from "@/lib/lesson-alias";

describe("merged and renamed lessons", () => {
  it("points merged lessons at the lesson that absorbed them", () => {
    expect(canonicalRef("21.7")).toBe("4.7");
    expect(canonicalRef("16.5")).toBe("28.1");
    expect(canonicalRef("1.1")).toBe("1.1");
  });
  it("moves saved step ticks onto the matching step", () => {
    expect(canonicalStepKey("21.7#1")).toBe("4.7#5");
    expect(canonicalStepKey("3.2#1")).toBe("3.2#1");
    expect(canonicalStepKeys(["16.5#1", "28.1#3"])).toEqual(["28.1#3"]);
  });
  it("keeps old anchors for renamed headings", () => {
    expect(oldAnchorsFor("3.2")).toContain("lesson-32-sharpen-the-promise");
    expect(oldAnchorsFor("4.7")).toContain("lesson-217-community-not-just-audience");
  });
});
