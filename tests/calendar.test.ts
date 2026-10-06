import { guidesForDay } from "@/lib/guides";
import { describe, expect, it } from "vitest";
import { easterSunday, nthWeekday, primaryAlert, seasonalAlerts, upcomingEvents } from "@/lib/seasons";
import { buildIcs } from "@/lib/ics";
import { TRACKS, dayByTaskId, toTrack } from "@/lib/tracks";
import { dayProgress } from "@/lib/progress";

describe("calendar dates", () => {
  it("computes Easter, US Father's Day and Click Frenzy", () => {
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
    expect(nthWeekday(2027, 6, 0, 3)).toBe("2027-06-20");
    const au = upcomingEvents("2026-10-06", "AU");
    expect(au.find((e) => e.eventKey === "click-frenzy")?.date).toBe("2026-11-10");
  });
  it("lists events by country, soonest first", () => {
    const au = upcomingEvents("2026-10-06", "AU").map((e) => e.eventKey);
    const us = upcomingEvents("2026-10-06", "US").map((e) => e.eventKey);
    expect(au.slice(0, 4)).toEqual(["click-frenzy", "singles-day", "black-friday", "cyber-monday"]);
    expect(au).toContain("boxing-day");
    expect(au).toContain("back-to-school-au");
    expect(au).toContain("easter");
    expect(au).not.toContain("halloween");
    expect(us[0]).toBe("halloween");
    expect(us).toContain("fathers-day-us");
    expect(us).toContain("memorial-day");
    expect(us).not.toContain("boxing-day");
    expect(us).not.toContain("eofy");
  });
  it("keeps Black Friday as the October alert in both countries", () => {
    expect(primaryAlert("2026-10-06", "AU")?.eventKey).toBe("black-friday");
    expect(primaryAlert("2026-10-06", "US")?.eventKey).toBe("black-friday");
    expect(primaryAlert("2027-05-20", "US")?.eventKey).toBe("fathers-day-us");
    expect(seasonalAlerts("2027-06-01", "US").map((a) => a.eventKey)).not.toContain("eofy");
  });
});

describe("ics export", () => {
  const ics = buildIcs("2026-10-06", "AU", { baseUrl: "https://helix.test", stamp: "20261006T000000Z" });
  it("is a valid calendar with folded CRLF lines", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(ics.split("BEGIN:VEVENT").length).toBe(ics.split("END:VEVENT").length);
  });
  it("includes dates and prep reminders", () => {
    expect(ics).toContain("SUMMARY:Black Friday\r\n");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261127");
    expect(ics).toContain("SUMMARY:Start prep: Christmas shipping cut-offs");
    expect(ics).toContain("SUMMARY:Click Frenzy");
  });
});

describe("tracks", () => {
  it("has a lighter Just starting track and the full Growing track", () => {
    expect(TRACKS.starting.days).toHaveLength(28);
    expect(TRACKS.growing.days).toHaveLength(64);
    expect(Math.max(...TRACKS.starting.days.map((d) => d.minutes))).toBeLessThanOrEqual(15);
    expect(toTrack("starting")).toBe("starting");
    expect(toTrack("nonsense")).toBe("growing");
  });
  it("keeps progress separate per track", () => {
    expect(dayByTaskId("start-25")?.day.title).toBe("Set up your first campaign, paused");
    expect(dayByTaskId("day-1")?.track.id).toBe("growing");
    const T = TRACKS.starting;
    const p = dayProgress({ days: T.days, doneIds: new Set(["day-1", "day-2", "start-21"]), completedToday: [], ahead: false, unlocked: () => true, taskId: T.taskId });
    expect(p.nextDay?.day).toBe(1);
  });
  it("shows Shopify drawings on the Just starting store setup days only", () => {
    expect(guidesForDay(2, "starting")).toHaveLength(0);
    expect(guidesForDay(16, "starting").map((g) => g.file)).toEqual(["shopify-6-taxes", "shopify-7-payments"]);
    expect(guidesForDay(2).map((g) => g.file)).toContain("shopify-1-yesterdays-numbers");
  });
});
