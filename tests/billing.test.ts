import { describe, it, expect } from "vitest";
import { planForStatus } from "@/lib/billing";

describe("planForStatus", () => {
  it("keeps the paid plan while active, trialing or past due", () => {
    expect(planForStatus("active", "growth")).toBe("growth");
    expect(planForStatus("trialing", "starter")).toBe("starter");
    expect(planForStatus("past_due", "starter")).toBe("starter");
  });
  it("drops to free when the subscription ends or is unpaid", () => {
    for (const s of ["canceled", "unpaid", "incomplete_expired", "incomplete", "paused"]) expect(planForStatus(s, "growth")).toBe("free");
  });
});
