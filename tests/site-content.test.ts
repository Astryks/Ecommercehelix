import { describe, expect, it } from "vitest";
import { siteContent, weekNumber, weeklyTip, previewDate } from "@/lib/site-content";
import { TIPS, EVENT_CONTENT } from "@/content/site-content";
import { TEMPLATES } from "@/lib/templates";
import { CAL_EVENTS, featuredEvent } from "@/lib/season-calendar";
import fs from "node:fs";

describe("site content engine", () => {
  it("has 20+ evergreen tips with unique keys and links", () => {
    expect(TIPS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(TIPS.map((t) => t.key)).size).toBe(TIPS.length);
  });
  it("every lesson link points at a real module, every template id exists", () => {
    const mods = fs.readdirSync("docs/playbook").map((f) => f.replace(/\.md$/, ""));
    const links = [...TIPS.map((t) => t.cta.href), ...Object.values(EVENT_CONTENT).map((e) => e.lesson.href)];
    for (const h of links.filter((h) => h.startsWith("/learn/"))) expect(mods).toContain(h.slice(7).split("#")[0]);
    const ids = TEMPLATES.map((t) => t.id);
    for (const e of Object.values(EVENT_CONTENT)) for (const t of e.templates) expect(ids).toContain(t);
  });
  it("event content keys match calendar events", () => {
    const keys = CAL_EVENTS.map((e) => e.key);
    for (const k of Object.keys(EVENT_CONTENT)) expect(keys).toContain(k);
  });
  it("Black Friday week 2026 features BFCM (Thanksgiving 26 Nov, sale 27-30 Nov)", () => {
    const c = siteContent("2026-11-20");
    expect(c.mode).toBe("event"); expect(c.eventKey).toBe("bfcm"); expect(c.heroExtra).toMatch(/Black Friday/);
    expect(siteContent("2027-11-27").eventKey).toBe("bfcm"); // 2027: Thanksgiving 25 Nov
  });
  it("Christmas wins in mid-December, Mother's Day in early May, EOFY in late June", () => {
    expect(siteContent("2026-12-15").eventKey).toBe("christmas");
    expect(siteContent("2027-05-01").eventKey).toBe("mothers-day"); // 9 May 2027
    expect(featuredEvent("2026-06-25")?.event.key).toBe("eofy");
  });
  it("mid-year deal days use Amazon's announced dates, else the 2nd Tuesday of July", () => {
    expect(CAL_EVENTS.find((e) => e.key === "summer-deal-days")?.span(2026)).toEqual({ start: "2026-06-23", end: "2026-06-26" }); // Prime Day 2026
    expect(featuredEvent("2027-07-13")?.event.key).toBe("summer-deal-days");
  });
  it("tip rotates on Mondays and stays the same all week", () => {
    expect(weeklyTip("2026-03-02").key).toBe(weeklyTip("2026-03-08").key); // Mon..Sun
    expect(weeklyTip("2026-03-09").key).not.toBe(weeklyTip("2026-03-08").key);
    expect(weekNumber("2026-03-09") - weekNumber("2026-03-02")).toBe(1);
  });
  it("quiet dates show a tip banner linking to a lesson or tool", () => {
    const c = siteContent("2026-07-20", "AU");
    expect(c.mode).toBe("tip"); expect(c.eventKey).toBeNull(); { expect(c.banner.text).toMatch(/^Tip of the week/); expect(c.banner.href).toMatch(/^\//); }
    expect(c.templates.length).toBeGreaterThan(0);
  });
  it("date preview never works in production", () => {
    expect(previewDate("2026-11-20", { VERCEL_ENV: "production" })).toBeNull();
    expect(previewDate("2026-11-20", { VERCEL_ENV: "preview" })).toBe("2026-11-20");
    expect(previewDate("bad", {})).toBeNull();
  });
});
