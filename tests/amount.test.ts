import { describe, expect, it } from "vitest";
import { readAmount } from "@/lib/amount";

describe("readAmount", () => {
  it("reads money the way people type it", () => {
    expect(readAmount("$60")).toBe(60);
    expect(readAmount("1,75")).toBe(1.75);
    expect(readAmount("1,234.50")).toBe(1234.5);
    expect(readAmount(" 12 ")).toBe(12);
    expect(readAmount(".5")).toBe(0.5);
  });
  it("gives null for blank or junk, so saved values are kept", () => {
    expect(readAmount("")).toBeNull();
    expect(readAmount(undefined)).toBeNull();
    expect(readAmount("abc")).toBeNull();
    expect(readAmount("1.2.3")).toBeNull();
  });
});
