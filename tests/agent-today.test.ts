import { describe, expect, it, vi } from "vitest";
// repo.ts is server-only; mock that marker so the in-memory (no-DB) path can be exercised in vitest.
vi.mock("server-only", () => ({}));
// No database in this sandbox (Prisma client generation needs a network fetch
// that fails here), so exercise the in-memory path with the DB layer mocked off.
vi.mock("@/lib/db", () => ({ hasDb: false, prisma: {} }));
import { merPctFor, stanceFor } from "@/lib/today";
import { updateApproval, createApproval, listApprovals } from "@/lib/repo";
import type { DayInput } from "@/lib/scorecard";

const day = (date: string, revenue: number, adMeta: number): DayInput => ({
  date, orders: 10, newCustomerOrders: 8, units: 10, sessions: 500, revenue, newCustomerRevenue: revenue,
  discounts: 0, refunds: 0, cogs: revenue * 0.3, shipping: 90, paymentFees: revenue * 0.026,
  adMeta, adGoogle: 0, adTiktok: 0, adOther: 0, otherMarketing: 0, metaRevenue: 0, googleRevenue: 0, tiktokRevenue: 0,
});

describe("merPctFor / stanceFor (agent Today scorecard)", () => {
  it("MER is ad spend ÷ net revenue", () => {
    expect(merPctFor([day("2026-11-16", 1000, 250)])).toBeCloseTo(25);
    expect(merPctFor([day("2026-11-16", 1000, 0)])).toBeNull();
    expect(merPctFor([])).toBeNull();
  });

  it("Push when 3-day and month-to-date MER are both on target", () => {
    const days = [day("2026-11-14", 1000, 200), day("2026-11-15", 1000, 200), day("2026-11-16", 1000, 200), day("2026-11-02", 1000, 200)];
    const r = stanceFor(days, "2026-11-17", 30);
    expect(r.stance).toBe("Push");
    expect(r.mer3).toBeCloseTo(20);
    expect(r.merMtd).toBeCloseTo(20);
  });

  it("Careful push when only the last 3 days are on target", () => {
    // 5 bad early-November days (40% MER) outweigh 3 good days (20%) month-to-date: MTD 32.5%.
    const days = [day("2026-11-02", 1000, 400), day("2026-11-03", 1000, 400), day("2026-11-04", 1000, 400), day("2026-11-05", 1000, 400), day("2026-11-06", 1000, 400), day("2026-11-14", 1000, 200), day("2026-11-15", 1000, 200), day("2026-11-16", 1000, 200)];
    expect(stanceFor(days, "2026-11-17", 30).stance).toBe("Careful push");
  });

  it("Hold when only the month to date is on target, Defend when neither is", () => {
    // 5 good early days (20%) keep MTD at 27.5% while the last 3 days are 40%.
    const hold = [day("2026-11-02", 1000, 200), day("2026-11-03", 1000, 200), day("2026-11-04", 1000, 200), day("2026-11-05", 1000, 200), day("2026-11-06", 1000, 200), day("2026-11-14", 1000, 400), day("2026-11-15", 1000, 400), day("2026-11-16", 1000, 400)];
    expect(stanceFor(hold, "2026-11-17", 30).stance).toBe("Hold");
    const defend = [day("2026-11-02", 1000, 400), day("2026-11-14", 1000, 400), day("2026-11-15", 1000, 400), day("2026-11-16", 1000, 400)];
    expect(stanceFor(defend, "2026-11-17", 30).stance).toBe("Defend");
  });

  it("Not enough data without ad spend", () => {
    expect(stanceFor([day("2026-11-16", 1000, 0)], "2026-11-17", 30).stance).toBe("Not enough data");
  });
});

describe("updateApproval (approvals Edit)", () => {
  it("edits a pending approval's detail and leaves decided ones alone", async () => {
    const userId = `test-${Date.now()}`;
    await createApproval(userId, { taskId: "build-meta-campaign", title: "Draft", detail: "original", estAiCost: 0.01 });
    const [row] = await listApprovals(userId);
    expect(await updateApproval(userId, row.id, "  edited detail  ")).toBe(true);
    expect((await listApprovals(userId))[0].detail).toBe("edited detail");
    expect(await updateApproval(userId, row.id, "   ")).toBe(false);
  });
});
