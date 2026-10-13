import { describe, it, expect } from "vitest";
import { safeDashboardPath, withParam } from "@/lib/safe-back";

describe("safe dashboard return path", () => {
  it("keeps dashboard paths, with or without a query string", () => {
    expect(safeDashboardPath("/dashboard/insights")).toBe("/dashboard/insights");
    expect(safeDashboardPath("/dashboard")).toBe("/dashboard");
    expect(safeDashboardPath("/dashboard/insights?tab=store&x=1")).toBe("/dashboard/insights?tab=store&x=1");
  });
  it("refuses other hosts and tricks", () => {
    for (const bad of ["https://evil.test", "//evil.test", "/dashboard/../signin", "/dashboardx", "/\\evil.test", "/dashboard?next=https://evil.test/a b", null, 5])
      expect(safeDashboardPath(bad)).toBe("/dashboard/insights");
  });
  it("adds a param with the right separator", () => {
    expect(withParam("/dashboard/insights", "checked", "recent")).toBe("/dashboard/insights?checked=recent");
    expect(withParam("/dashboard/insights?tab=a", "checked", "recent")).toBe("/dashboard/insights?tab=a&checked=recent");
  });
});
