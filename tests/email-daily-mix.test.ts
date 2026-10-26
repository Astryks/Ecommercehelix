import { describe, expect, it } from "vitest";
import { composeDaily, OPENERS, SUBJECTS, WINS, THEMES, ideaFor, dayNumber, numbersLine, type DailyFacts } from "@/lib/email/daily-mix";
import { dailyEmail } from "@/lib/email/templates";
import { addDays } from "@/lib/dates";

const c = { name: "Jamie Lee", baseUrl: "https://ecommercehelix.com", unsubUrl: "https://ecommercehelix.com/api/email/unsubscribe?t=tok&k=daily", postalAddress: null };
const facts: DailyFacts = {
  lesson: { title: "Find your break-even line", step: "Work out the most you can pay in ads for one order.", href: "/learn/some-module#lesson-x", minutes: 10 },
  goal: { title: "Set up your profit dashboard", day: 2, days: 3 },
  numbers: { sales: 1240, orders: 18, adSpend: 310, merPct: 25, avgSales: 1100, avgMerPct: 27 },
  hasAnyNumbers: true, hasAds: true,
};
const days = (from: string, n: number) => Array.from({ length: n }, (_, i) => addDays(from, i));

describe("daily email: different every day", () => {
  it("has big enough pools in plain words", () => {
    expect(new Set(SUBJECTS).size).toBeGreaterThanOrEqual(30);
    expect(new Set(OPENERS).size).toBeGreaterThanOrEqual(30);
    expect(new Set(WINS).size).toBeGreaterThanOrEqual(20);
    for (const t of Object.values(THEMES)) expect(t.tasks.length).toBeGreaterThanOrEqual(5);
  });
  it("is the same for the same user and day", () => {
    expect(composeDaily({ seed: "user-1", date: "2026-10-27", facts })).toEqual(composeDaily({ seed: "user-1", date: "2026-10-27", facts }));
  });
  it("never repeats a subject, opener or idea for one user within 30 days", () => {
    for (const seed of ["user-1", "cm9abc123", "z"]) {
      const mixes = days("2026-10-26", 30).map((date) => composeDaily({ seed, date, facts }));
      for (const k of ["subject", "opener", "idea"] as const) expect(new Set(mixes.map((m) => m[k])).size).toBe(30);
      expect(new Set(mixes.map((m) => m.tasks.map((t) => t.title).join("|"))).size).toBe(30);
    }
  });
  it("shares the day's topic subject across users but varies the opener", () => {
    const mixes = Array.from({ length: 20 }, (_, i) => composeDaily({ seed: `user-${i}`, date: "2026-10-27" }));
    expect(new Set(mixes.map((m) => m.subject)).size).toBe(1);
    expect(new Set(mixes.map((m) => m.opener)).size).toBeGreaterThan(10);
  });
  it("follows the weekday theme and rotates the theme task week to week", () => {
    expect(composeDaily({ seed: "u", date: "2026-10-27" }).title).toBe("Tuesday: ads check");
    expect(composeDaily({ seed: "u", date: "2026-10-26" }).title).toBe("Monday: plan the week");
    const tues = days("2026-10-27", 35).filter((_, i) => i % 7 === 0).map((date) => composeDaily({ seed: "u", date, facts }).tasks[1].title);
    expect(new Set(tues).size).toBe(5);
    tues.forEach((t) => expect(THEMES.ads.tasks.map((x) => x.title)).toContain(t));
    // A store with no ad spend gets a free way to find customers instead.
    const organic = composeDaily({ seed: "u", date: "2026-10-27", facts: { ...facts, hasAds: false } }).tasks[1].title;
    expect(THEMES.ads.tasks.map((x) => x.title)).not.toContain(organic);
  });
  it("uses the next lesson, goal and numbers when known, and links the lesson", () => {
    const m = composeDaily({ seed: "u", date: "2026-10-27", facts });
    expect(m.tasks[2].title).toContain("Find your break-even line");
    expect(m.goalLine).toBe("You are working on: Set up your profit dashboard (day 2 of 3).");
    expect(m.numbersLine).toBe("Yesterday: $1,240 in sales from 18 orders, up 13% on your 7-day average of $1,100. You spent $310 on ads (MER 25%, 27% over the week).");
    const e = dailyEmail(c, m);
    expect(e.html).toContain("https://ecommercehelix.com/learn/some-module#lesson-x");
    expect(e.text).toContain("Next lesson: Find your break-even line");
  });
  it("works for a new user with no numbers, goal or lesson, and never invents numbers", () => {
    for (const date of days("2026-10-26", 14)) {
      const m = composeDaily({ seed: "new", date });
      expect(m.goalLine).toBeNull(); expect(m.numbersLine).toBeNull();
      expect(m.button).toEqual({ label: "Open Today", href: "/dashboard" });
      expect(m.tasks[0].title).toMatch(/yesterday|Numbers/i);
      expect([m.subject, m.opener, ...m.tasks.map((t) => t.title)].join(" ")).not.toMatch(/\$\d/);
      const e = dailyEmail(c, m);
      expect(e.html).toContain("https://ecommercehelix.com/dashboard");
    }
    expect(numbersLine({ sales: 50, orders: 1, adSpend: 0, merPct: 0, avgSales: null, avgMerPct: null })).toBe("Yesterday: $50 in sales from 1 order.");
  });
  it("puts sale prep in on alternate days when a season task is due", () => {
    const ms = days("2026-11-02", 4).map((date) => composeDaily({ seed: "u", date, season: "Plan your Black Friday offer" }));
    expect(ms.filter((m) => m.tasks.some((t) => t.title === "Plan your Black Friday offer"))).toHaveLength(2);
  });
  it("rotates story, tip and word ideas", () => {
    const d = dayNumber("2026-10-26");
    const kinds = [0, 1, 2].map((k) => ideaFor("u", d + k).text);
    expect(kinds.some((t) => t.startsWith("Tip of the day:"))).toBe(true);
    expect(kinds.some((t) => t.startsWith("Word of the day:"))).toBe(true);
  });
  it("stays short, keeps the unsubscribe footer and fits a sensible subject length", () => {
    for (const date of days("2026-10-26", 40)) {
      const m = composeDaily({ seed: "len", date, facts, season: "Plan your Black Friday offer" });
      expect(m.subject.length).toBeLessThanOrEqual(70);
      expect(m.tasks).toHaveLength(4);
      const e = dailyEmail(c, m);
      expect(e.marketing).toBe(true); expect(e.html).toContain("unsubscribe?t=tok"); expect(e.text).toContain("Unsubscribe:");
      expect(e.text.length).toBeLessThan(2200);
    }
  });
  it.runIf(process.env.PREVIEW === "1")("prints 7 sample days", () => {
    for (const date of days("2026-10-26", 7)) {
      const e = dailyEmail(c, composeDaily({ seed: "preview-user", date, facts: date < "2026-10-29" ? facts : undefined }));
      console.log(`--- ${date}\nSubject: ${e.subject}\n${e.text.split("\nThe Helix team")[0]}\n`);
    }
  });
});
