import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SEQUENCE, anchorFor, lessonPath, sequenceIndex } from "@/lib/email/sequence";
import { dailyTasksEmail } from "@/lib/email/templates";
import { dueEmails } from "@/lib/email/schedule";

const c = { name: "Jamie Lee", baseUrl: "https://ecommercehelix.com", unsubUrl: "https://ecommercehelix.com/api/email/unsubscribe?t=tok&k=daily", postalAddress: null };
const textOf = (s: (typeof SEQUENCE)[number]) => [s.subject, s.preview, s.title, ...s.paras, s.action, s.lesson.label].join("\n");

describe("daily email sequence", () => {
  it("has 30 emails: 22 lessons and 8 founder stories, never two founder stories in a row", () => {
    expect(SEQUENCE).toHaveLength(30);
    expect(SEQUENCE.filter((s) => s.kind === "founder")).toHaveLength(8);
    SEQUENCE.forEach((s, i) => { if (s.kind === "founder") expect(SEQUENCE[(i + 1) % SEQUENCE.length].kind).toBe("lesson"); });
  });
  it("every subject, preview, title and link is different", () => {
    for (const k of ["subject", "preview", "title"] as const) expect(new Set(SEQUENCE.map((s) => s[k])).size).toBe(SEQUENCE.length);
    expect(new Set(SEQUENCE.map((s) => lessonPath(s.lesson))).size).toBe(SEQUENCE.length);
  });
  it("every link points at a real lesson heading on a real /learn page", () => {
    for (const s of SEQUENCE) {
      const md = fs.readFileSync(path.join(process.cwd(), "docs", "playbook", s.lesson.slug + ".md"), "utf8");
      expect(md.split("\n")).toContain(`## ${s.lesson.heading}`);
      expect(lessonPath(s.lesson)).toBe(`/learn/${s.lesson.slug}#${anchorFor(s.lesson.heading)}`);
    }
    expect(anchorFor("Lesson 1.1: Why revenue is the wrong scoreboard")).toBe("lesson-11-why-revenue-is-the-wrong-scoreboard");
  });
  it("keeps it short and plain, shows prices in US$ and never names banned words", () => {
    for (const s of SEQUENCE) {
      const t = textOf(s);
      expect(t).not.toMatch(/skool|ecommerce equation|black belt|australia|sydney|astryks|booking\.com|aramco/i);
      expect(t.replace(/US\$/g, "")).not.toMatch(/\$/);
      for (const sentence of t.split(/(?<=[.?!])\s+/)) expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(25);
      expect(s.subject.length).toBeLessThanOrEqual(50);
    }
  });
  it("steps through the sequence by days since sign-up, then repeats", () => {
    expect(sequenceIndex("2026-10-01", "2026-10-01")).toBe(0);
    expect(sequenceIndex("2026-10-01", "2026-10-04")).toBe(3);
    expect(sequenceIndex("2026-10-01", "2026-10-31")).toBe(0);
    const base = { createdAt: new Date("2026-10-10T15:00:00Z"), isDemo: false, country: "US", timezone: "America/New_York", status: "active", subscriptionId: null, currentPeriodEnd: null };
    const d = dueEmails(base, new Date("2026-10-15T11:30:00Z")).find((x) => x.kind === "daily");
    expect(d && d.kind === "daily" && d.step).toBe(5);
  });
  it("renders the day's email with its own subject, preview and lesson button", () => {
    const e = dailyTasksEmail(c, [{ title: "Check numbers", minutes: 2 }], "Friday", 2);
    expect(e.subject).toBe(SEQUENCE[2].subject);
    expect(e.html).toContain(SEQUENCE[2].preview);
    expect(e.html).toContain(`https://ecommercehelix.com${lessonPath(SEQUENCE[2].lesson)}`);
    expect(e.text).toContain("Your one step today:");
    expect(e.marketing).toBe(true); expect(e.html).toContain("unsubscribe?t=tok");
    expect(dailyTasksEmail(c, [], "Friday", 32).subject).toBe(SEQUENCE[2].subject);
  });
});
