import { describe, expect, it } from "vitest";
import { assertWriteAllowed, BUDGET_KEYS, GuardrailError, PAUSED } from "@/lib/meta/guardrail";

const ok = { approved: true };
const post = (path: string, params: Record<string, unknown>) => ({ method: "POST" as const, path, params });

describe("paused-only guardrail", () => {
  it("allows creating campaigns, ad sets and ads with status PAUSED", () => {
    for (const edge of ["campaigns", "adsets", "ads"]) {
      expect(() => assertWriteAllowed(post(`act_123/${edge}`, { name: "x", status: PAUSED }), ok)).not.toThrow();
    }
  });

  it("allows budgets on brand-new paused objects", () => {
    expect(() => assertWriteAllowed(post("act_123/campaigns", { name: "x", daily_budget: 5000, status: "PAUSED" }), ok)).not.toThrow();
  });

  it.each(["ACTIVE", "active", "Paused", "ARCHIVED", "DELETED", "", null, undefined, 1])("rejects creating with status %s", (status) => {
    for (const edge of ["campaigns", "adsets", "ads"]) {
      expect(() => assertWriteAllowed(post(`act_123/${edge}`, { name: "x", status }), ok)).toThrow(GuardrailError);
    }
  });

  it("rejects creating without an explicit status", () => {
    expect(() => assertWriteAllowed(post("act_123/ads", { name: "x" }), ok)).toThrow(/PAUSED/);
  });

  it("rejects configured_status or effective_status that is not PAUSED", () => {
    expect(() => assertWriteAllowed(post("act_123/campaigns", { status: "PAUSED", configured_status: "ACTIVE" }), ok)).toThrow(GuardrailError);
    expect(() => assertWriteAllowed(post("act_123/adcreatives", { status: "ACTIVE" }), ok)).toThrow(GuardrailError);
  });

  it("allows creatives and images, which cannot spend", () => {
    expect(() => assertWriteAllowed(post("act_123/adcreatives", { name: "c" }), ok)).not.toThrow();
    expect(() => assertWriteAllowed(post("/act_123/adimages", { bytes: "..." }), ok)).not.toThrow();
  });

  it("allows pausing an existing object with exactly { status: PAUSED }", () => {
    expect(() => assertWriteAllowed(post("120200000000001", { status: "PAUSED" }), ok)).not.toThrow();
  });

  it("rejects activating an existing object", () => {
    expect(() => assertWriteAllowed(post("120200000000001", { status: "ACTIVE" }), ok)).toThrow(GuardrailError);
  });

  it.each(BUDGET_KEYS)("rejects changing %s on an existing object", (key) => {
    expect(() => assertWriteAllowed(post("120200000000001", { [key]: 10000 }), ok)).toThrow(/budget/i);
    expect(() => assertWriteAllowed(post("120200000000001", { status: "PAUSED", [key]: 10000 }), ok)).toThrow(GuardrailError);
  });

  it("rejects any other edit to an existing object", () => {
    expect(() => assertWriteAllowed(post("120200000000001", { name: "renamed" }), ok)).toThrow(GuardrailError);
    expect(() => assertWriteAllowed(post("120200000000001", {}), ok)).toThrow(GuardrailError);
  });

  it("rejects copies, inline child specs and unknown endpoints", () => {
    expect(() => assertWriteAllowed(post("120200000000001/copies", { status_option: "ACTIVE" }), ok)).toThrow(GuardrailError);
    expect(() => assertWriteAllowed(post("act_123/campaigns", { status: "PAUSED", adset_spec: { status: "ACTIVE" } }), ok)).toThrow(GuardrailError);
    expect(() => assertWriteAllowed(post("act_123/customaudiences", { name: "a" }), ok)).toThrow(GuardrailError);
    expect(() => assertWriteAllowed(post("me/businesses", {}), ok)).toThrow(GuardrailError);
  });

  it("rejects deletes except revoking our own permissions", () => {
    expect(() => assertWriteAllowed({ method: "DELETE", path: "120200000000001", params: {} }, ok)).toThrow(GuardrailError);
    expect(() => assertWriteAllowed({ method: "DELETE", path: "me/permissions", params: {} }, ok)).not.toThrow();
  });

  it("rejects every write without approval", () => {
    expect(() => assertWriteAllowed(post("act_123/campaigns", { status: "PAUSED" }), { approved: false })).toThrow(/approval/);
    expect(() => assertWriteAllowed(post("120200000000001", { status: "PAUSED" }), { approved: false })).toThrow(/approval/);
  });
});
