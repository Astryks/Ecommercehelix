import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BFCM_STAGES, EVENTS, SEASON_TASK_ID, alertByKey, bfcmPlanEntries, bfcmTask, bfcmTip, blackFriday, nextTasks, nthWeekday, primaryAlert, seasonalAlerts, upcomingEvents } from "@/lib/seasons";

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
    expect(a?.headline).toBe("It's October, the build month for Black Friday: finalise your ads, warm up your audiences, build your emails and load stock.");
    expect(a?.daysTo).toBe(52);
    expect(a?.reviewing).toBe(false);
  });
  it("marks tasks whose due date has passed as overdue", () => {
    const a = primaryAlert("2026-10-06")!;
    expect(a.tasks.find((t) => t.id === "offer")?.overdue).toBe(true); // due 11 Sep
    expect(a.tasks.find((t) => t.id === "creative")?.overdue).toBe(true); // due 2 Oct
    expect(a.tasks.find((t) => t.id === "warmup")?.overdue).toBe(false); // due 9 Oct
    expect(a.tasks.find((t) => t.id === "emails")?.due).toBe("2026-10-16");
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
    expect(next.map((t) => t.id)).toEqual(["angles", "list", "offertest"]);
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
    expect(invite.email.subject).toBe("It's October, the build month for Black Friday (52 days to go)");
    expect(invite.email.text).toContain("Hi Sam,");
    expect(invite.push.url).toBe("https://x.test/dashboard#season");
    const withPlan = buildNudge(bf, { planAdded: true, done: new Set([bf.tasks[0].taskId]), baseUrl: "" })!;
    expect(withPlan.push.body).toBe("Next: Start testing ad angles and creatives");
  });
  it("stays quiet once the plan is finished", () => {
    expect(buildNudge(bf, { planAdded: true, done: new Set(bf.tasks.map((t) => t.taskId)), baseUrl: "" })).toBeNull();
  });
});

describe("Black Friday all year", () => {
  it("starts the plan on 1 August, not in October", () => {
    expect(seasonalAlerts("2026-07-31").map((a) => a.eventKey)).not.toContain("black-friday");
    const aug = seasonalAlerts("2026-08-01").find((a) => a.eventKey === "black-friday")!;
    expect(aug.key).toBe("black-friday-2026");
    expect(aug.headline).toBe("It's August, and Black Friday starts now: look back at last year, set your targets and start testing ads and offers.");
    expect(aug.tasks.find((t) => t.id === "lookback")?.due).toBe("2026-08-01");
    expect(upcomingEvents("2026-06-01", "AU").find((e) => e.eventKey === "black-friday")?.prepFrom).toBe("2026-08-01");
    expect(upcomingEvents("2027-06-01", "US").find((e) => e.eventKey === "black-friday")?.prepFrom).toBe("2027-08-01");
  });
  it("has a staged plan: August, September, October, November, then a December and January review", () => {
    const a = alertByKey("black-friday-2026", "2026-08-01")!;
    const month = (id: string) => a.tasks.find((t) => t.id === id)!.due.slice(0, 7);
    for (const id of ["lookback", "angles", "list", "offertest"]) expect(month(id)).toBe("2026-08");
    for (const id of ["stock", "offer", "scale"]) expect(month(id)).toBe("2026-09");
    for (const id of ["creative", "warmup", "emails", "loaded", "campaigns"]) expect(month(id)).toBe("2026-10");
    for (const id of ["freeze", "hype", "launch", "monitor"]) expect(month(id)).toBe("2026-11");
    expect(month("review")).toBe("2026-12");
    expect(month("nextyear")).toBe("2027-01");
    // Stock is ordered 10 to 12 weeks before the sale.
    const weeksOut = (Date.parse("2026-11-27") - Date.parse(a.tasks.find((t) => t.id === "stock")!.due)) / (7 * 86_400_000);
    expect(weeksOut).toBeGreaterThanOrEqual(10);
    expect(weeksOut).toBeLessThanOrEqual(12);
    // Every stage lists real task ids, and every task is in a stage.
    const staged = BFCM_STAGES.flatMap((s) => s.taskIds);
    for (const id of staged) expect(bfcmTask(id)).toBeDefined();
    expect(new Set(staged).size).toBe(EVENTS.find((e) => e.key === "black-friday")!.tasks.length);
  });
  it("uses the right headline for each month", () => {
    expect(primaryAlert("2026-09-10", "US")?.headline).toMatch(/^It's September, time to commit for Black Friday:/);
    expect(seasonalAlerts("2026-11-20").find((a) => a.eventKey === "black-friday")?.headline).toBe("Black Friday is 7 days away: freeze site changes, test every discount code and start your hype ads.");
    expect(seasonalAlerts("2026-11-28").find((a) => a.eventKey === "black-friday")?.headline).toMatch(/^Black Friday weekend is live/);
  });
  it("keeps the review steps open into January, but never above an upcoming date", () => {
    const dec = seasonalAlerts("2026-12-10");
    const bf = dec.find((a) => a.eventKey === "black-friday")!;
    expect(bf.reviewing).toBe(true);
    expect(bf.headline).toMatch(/^Black Friday and Cyber Monday are done/);
    expect(dec[0].eventKey).toBe("christmas");
    expect(dec.at(-1)?.eventKey).toBe("black-friday");
    expect(seasonalAlerts("2027-01-20").map((a) => a.eventKey)).not.toContain("black-friday");
  });
  it("gives a light test-now nudge outside the plan, and none while it runs", () => {
    expect(bfcmTip("2026-10-06")).toBeNull();
    expect(bfcmTip("2026-12-20")).toBeNull();
    const feb = bfcmTip("2027-02-15")!;
    expect(feb.title).toBe("Test now for Black Friday");
    expect(feb.text).toMatch(/ad angle/);
    expect(feb.daysToPlanning).toBe(167);
    expect(bfcmTip("2027-07-25")?.text).toMatch(/1 August/);
  });
  it("puts each prep step on the calendar on its date", () => {
    const e = bfcmPlanEntries("2026-10-06", "AU");
    expect(e.find((x) => x.key === "bfcm-2026-warmup")?.date).toBe("2026-10-09");
    expect(e.find((x) => x.key === "bfcm-2026-creative")).toBeUndefined(); // already past
    expect(e.find((x) => x.key === "bfcm-2027-lookback")?.date).toBe("2027-08-01");
    expect(e.every((x) => x.kind === "prep" && x.planKey?.startsWith("black-friday-"))).toBe(true);
    expect(e.map((x) => x.date)).toEqual([...e.map((x) => x.date)].sort());
  });
});
