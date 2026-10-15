import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { lessonStateFn } from "@/lib/lesson-done";
import { listModules } from "@/lib/learn";

describe("lesson done", () => {
  it("all steps ticked counts as done, even without a task completion", () => {
    const st = lessonStateFn([], ["1.7#1", "1.7#2"]);
    expect(st("1.7", [1, 2])).toBe("done");
    expect(st("1.7", [1, 2, 3])).toBe("started");
    expect(st("1.8", [1])).toBe("new");
    expect(lessonStateFn(["lesson-1-8"], [])("1.8", [1])).toBe("done");
  });
  it("every lesson knows its step numbers", () => {
    const l = listModules().flatMap((m) => m.lessons).filter((x) => x.ref);
    expect(l.length).toBeGreaterThan(200);
    expect(l.every((x) => x.stepNs.length > 0)).toBe(true);
  });
});
