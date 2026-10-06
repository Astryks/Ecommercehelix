import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EVENTS, SEASON_TASK_ID, alertByKey, blackFriday, nextTasks, nthWeekday, primaryAlert, seasonalAlerts } from "@/lib/seasons";

const slugify = (t: string) => t.toLowerCase().trim().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");

describe("season dates", () => {
  it("computes Black Friday as the day after the 4th Thursday of November", () => {
    expect(blackFriday(2026)).toBe("2026-11-27");
    expect(blackFriday(2025)).toBe("2025-11-28");
    expect(blackFriday(2027)).toBe("2027-11-26");
  });
  it("computes Mother's Day and Australian Father's Day", () => {
    expect(nthWeekday(2027, 5, 0, 2)).toBe("2027-05-09");
    expect(nthWeekday(2026, 9, 0, 1)).toBe("2026-09-06");
  });
});

describe("seasonal alerts", () => {
  it("shows the October Black Friday message in early October", () => {
    const a = primaryAlert("2026-10-06");
    expect(a?.key).toBe("black-friday-2026");
    expect(a?.headline).toBe("It's October. Black Friday planning needs to start now: order stock, lock your offer, start creative.");
    expect(a?.daysTo).toBe(52);
  });
  it("marks tasks whose due date has passed as overdue", () => {
    const a = primaryAlert("2026-10-06")!;
    expect(a.tasks.find((t) => t.id === "offer")?.overdue).toBe(true); // due 2 Oct
    expect(a.tasks.find((t) => t.id === "list")?.overdue).toBe(false); // due 16 Oct
  });
  it("puts Christmas cut-offs on top in early December", () => {
    const keys = seasonalAlerts("2026-12-05").map((a) => a.key);
    expect(keys[0]).toBe("christmas-2026");
    expect(keys).toContain("boxing-day-2026");
  });
  it("covers the rest of the year", () => {
    expect(primaryAlert("2027-01-10")?.eventKey).toBe("valentines");
    expect(primaryAlert("2027-04-01")?.eventKey).toBe("mothers-day");
    expect(primaryAlert("2027-06-01")?.eventKey).toBe("eofy");
    expect(primaryAlert("2027-08-01")?.eventKey).toBe("fathers-day");
    expect(primaryAlert("2027-07-10")).toBeNull();
  });
  it("keeps a plan viewable after its alert window and orders next tasks", () => {
    const a = alertByKey("black-friday-2026", "2027-01-20");
    expect(a?.date).toBe("2026-11-27");
    const bf = primaryAlert("2026-10-06")!;
    const next = nextTasks(bf, new Set([bf.tasks[0].taskId]));
    expect(next.map((t) => t.id)).toEqual(["stock", "creative", "list"]);
  });
  it("uses task ids the server accepts and lesson links that exist", () => {
    const dir = path.join(__dirname, "..", "docs", "playbook");
    for (const ev of EVENTS) for (const t of ev.tasks) {
      expect(`season-${ev.key}-2026-${t.id}`).toMatch(SEASON_TASK_ID);
      if (!t.learn) continue;
      const md = fs.readFileSync(path.join(dir, t.learn.slug + ".md"), "utf8");
      const anchors = [...md.matchAll(/^## (.+)$/gm)].map((m) => slugify(m[1]));
      expect(anchors).toContain(t.learn.anchor);
    }
  });
});

describe("seasonal nudges", async () => {
  const { buildNudge } = await import("@/lib/nudges");
  const bf = primaryAlert("2026-10-06")!;
  it("invites users without a plan and lists next steps for users with one", () => {
    const invite = buildNudge(bf, { name: "Sam Lee", planAdded: false, done: new Set(), baseUrl: "https://x.test" })!;
    expect(invite.email.subject).toBe("It's October. Black Friday planning needs to start now (52 days to go)");
    expect(invite.email.text).toContain("Hi Sam,");
    expect(invite.push.url).toBe("https://x.test/dashboard#season");
    const withPlan = buildNudge(bf, { planAdded: true, done: new Set([bf.tasks[0].taskId]), baseUrl: "" })!;
    expect(withPlan.push.body).toBe("Next: Order stock and gifts");
  });
  it("stays quiet once the plan is finished", () => {
    expect(buildNudge(bf, { planAdded: true, done: new Set(bf.tasks.map((t) => t.taskId)), baseUrl: "" })).toBeNull();
  });
});
