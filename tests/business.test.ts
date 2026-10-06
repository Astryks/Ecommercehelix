import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ADMIN_DATES, BIZ_TASK_ID, MODULE_SLUGS, THRESHOLDS, TOPICS, adminDates, adminDueSoon, calendarWithAdmin } from "@/lib/business";
import { buildIcs } from "@/lib/ics";

const PB = path.join(process.cwd(), "docs", "playbook");
const lessonExists = (ref: string) => {
  const mod = Number(ref.split(".")[0]);
  const file = fs.readdirSync(PB).find((f) => f.startsWith(String(mod).padStart(2, "0") + "-"));
  return file ? fs.readFileSync(path.join(PB, file), "utf8").includes(`## Lesson ${ref}:`) : false;
};

describe("run your business topics", () => {
  it("has 13 topics, each linking to real lessons", () => {
    expect(TOPICS).toHaveLength(13);
    for (const t of TOPICS) for (const ref of t.lessons) expect(lessonExists(ref), ref).toBe(true);
    for (const a of ADMIN_DATES) expect(lessonExists(a.lesson), a.key).toBe(true);
  });
  it("every tax lesson carries the not-advice note and official sources", () => {
    for (const t of TOPICS.filter((x) => x.tax)) {
      for (const ref of t.lessons) {
        const md = fs.readFileSync(path.join(PB, MODULE_SLUGS[Number(ref.split(".")[0])] + ".md"), "utf8");
        const body = md.split(`## Lesson ${ref}:`)[1].split("\n## ")[0];
        expect(body, ref).toContain("General information, not tax or legal advice");
        expect(body, ref).toMatch(/\]\(https:\/\/(www\.)?(ato\.gov\.au|ird\.govt\.nz|irs\.gov|cdtfa\.ca\.gov|gov\.uk|canada\.ca|cbp\.gov|tpb\.gov\.au|vat-one-stop-shop|irs\.treasury\.gov)/);
      }
    }
  });
  it("lists thresholds with official sources and no em-dashes", () => {
    expect(THRESHOLDS.length).toBeGreaterThanOrEqual(8);
    for (const r of THRESHOLDS) {
      expect(r.source.url).toMatch(/^https:\/\//);
      expect(r.rule).not.toContain("\u2014");
    }
  });
});

describe("business admin dates", () => {
  it("Australia in early October: BAS and tax return are due soon", () => {
    const soon = adminDueSoon("2026-10-06", "AU", new Set());
    expect(soon.map((a) => a.adminKey)).toEqual(["bas-q1", "tax-return-au"]);
    expect(soon[0].date).toBe("2026-10-28");
    expect(soon[0].daysTo).toBe(22);
    expect(BIZ_TASK_ID.test(soon[0].taskId)).toBe(true);
  });
  it("hides items you marked done", () => {
    const soon = adminDueSoon("2026-10-06", "AU", new Set(["biz-bas-q1-2026"]));
    expect(soon.map((a) => a.adminKey)).toEqual(["tax-return-au"]);
  });
  it("US gets 1099, tax day and estimated payments, not BAS", () => {
    const keys = adminDates("2026-10-06", "US", 365).map((a) => a.adminKey);
    expect(keys).toContain("us-1099");
    expect(keys).toContain("us-tax-day");
    expect(keys).toContain("us-est-q4");
    expect(keys.some((k) => k.startsWith("bas"))).toBe(false);
    const april = adminDates("2027-03-20", "US", 30).find((a) => a.adminKey === "us-tax-day");
    expect(april?.date).toBe("2027-04-15");
  });
  it("quarterly security checks apply to both countries", () => {
    for (const c of ["AU", "US"] as const) expect(adminDates("2026-12-28", c, 10).some((a) => a.adminKey === "security-q1")).toBe(true);
  });
  it("calendar merges admin with sale dates in order, and the .ics includes them", () => {
    const cal = calendarWithAdmin("2026-10-06", "AU", 60);
    expect(cal.some((e) => e.kind === "admin" && e.name.startsWith("BAS due"))).toBe(true);
    expect(cal.some((e) => e.eventKey === "black-friday")).toBe(true);
    expect(cal.map((e) => e.date)).toEqual([...cal.map((e) => e.date)].sort());
    expect(buildIcs("2026-10-06", "AU", { baseUrl: "https://helix.test", stamp: "20261006T000000Z" })).toContain("SUMMARY:BAS due (July to September)");
  });
});
