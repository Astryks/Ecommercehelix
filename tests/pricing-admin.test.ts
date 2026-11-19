/** Finishing step — admin role check for the all-orgs margin view. */
import { describe, expect, it } from "vitest";
import { isHelixAdmin } from "@/lib/pricing/admin";

describe("isHelixAdmin", () => {
  const env = { HELIX_ADMIN_EMAILS: "Sid@example.com, ops@helix.test" };
  it("matches case-insensitively, with spaces", () => {
    expect(isHelixAdmin("sid@example.com", env)).toBe(true);
    expect(isHelixAdmin("  OPS@helix.test  ", env)).toBe(true);
  });
  it("rejects anyone not listed, and empty email", () => {
    expect(isHelixAdmin("someone@else.com", env)).toBe(false);
    expect(isHelixAdmin("", env)).toBe(false);
  });
  it("rejects everyone when the list is unset", () => {
    expect(isHelixAdmin("sid@example.com", {})).toBe(false);
  });
});
