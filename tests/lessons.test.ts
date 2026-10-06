import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseModuleSections, type ParsedLesson } from "@/lib/lesson-parse";
import { KNOWN_ACTION_KEYS, lessonAction, lessonTaskId, parseLessonTaskId, STEP_KEY, stepKey } from "@/lib/lesson-actions";
import { glossify } from "@/lib/glossary";

const DIR = path.join(process.cwd(), "docs", "playbook");
const files = fs.readdirSync(DIR).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
const modules = files.map((f) => ({ f, md: fs.readFileSync(path.join(DIR, f), "utf8") }));
const lessons = modules.flatMap(({ f, md }) => parseModuleSections(md).filter((s): s is ParsedLesson => s.kind === "lesson").map((l) => ({ f, l })));

describe("step-format lessons", () => {
  it("every lesson heading in every module is in the step format", () => {
    for (const { f, md } of modules) {
      const headings = (md.match(/^## Lesson \d+\.\d+:/gm) ?? []).length;
      const parsed = lessons.filter((x) => x.f === f).length;
      expect(parsed, f).toBe(headings);
    }
    expect(lessons.length).toBeGreaterThanOrEqual(255);
  });

  it("each lesson has a short why and numbered steps with an expected result", () => {
    for (const { l } of lessons) {
      expect(l.why.length, l.ref).toBeGreaterThan(40);
      expect(l.steps.length, l.ref).toBeGreaterThan(0);
      l.steps.forEach((s, i) => {
        expect(s.n, `${l.ref} step order`).toBe(i + 1);
        expect(s.instruction.length, `${l.ref} step ${s.n}`).toBeGreaterThan(10);
        expect(s.expected.length, `${l.ref} step ${s.n} expected`).toBeGreaterThan(5);
      });
    }
  });

  it("every Do it for me key is known", () => {
    for (const { l } of lessons) {
      for (const k of [l.doIt, ...l.steps.map((s) => s.action)]) if (k) expect(KNOWN_ACTION_KEYS, `${l.ref} ${k}`).toContain(k);
    }
  });

  it("uses no em or en dashes in lesson copy", () => {
    for (const { f, md } of modules) expect(/[\u2013\u2014]/.test(md), f).toBe(false);
  });

  it("covers the Run your business modules 23 to 28", () => {
    for (const n of [23, 24, 25, 26, 27, 28]) expect(lessons.some(({ l }) => l.ref.startsWith(`${n}.`)), String(n)).toBe(true);
  });

  it("moves advice notices to the top of the lesson", () => {
    const l = lessons.find(({ l }) => l.ref === "26.1")!.l;
    expect(l.notice).toMatch(/General information/);
    expect(l.extra).not.toMatch(/General information/);
  });
});

describe("lesson actions and ids", () => {
  it("round-trips task ids", () => {
    expect(lessonTaskId("7.1")).toBe("lesson-7-1");
    expect(lessonTaskId("22.10", 3)).toBe("lesson-22-10-s3");
    expect(parseLessonTaskId("lesson-22-10-s3")).toEqual({ ref: "22.10", step: 3 });
    expect(parseLessonTaskId("lesson-7-1")).toEqual({ ref: "7.1", step: null });
    expect(parseLessonTaskId("lesson-x")).toBeNull();
    expect(STEP_KEY.test(stepKey("7.1", 3))).toBe(true);
  });

  it("maps keys to links, delegated actions or a request", () => {
    expect(lessonAction("numbers")).toMatchObject({ kind: "link", href: "/dashboard/scorecard#entry" });
    expect(lessonAction("meta-draft")).toMatchObject({ kind: "delegate", actionableId: "build-meta-campaign" });
    expect(lessonAction("flow-welcome")).toMatchObject({ kind: "delegate", actionableId: "flow-welcome" });
    expect(lessonAction(null).kind).toBe("request");
    expect(lessonAction("flow-nope").kind).toBe("request");
  });
});

describe("glossary tooltips", () => {
  it("wraps the first use of a term once and skips links", () => {
    const seen = new Set<string>();
    const a = glossify("<p>Check ROAS today. ROAS again.</p>", seen);
    expect(a.match(/class="gloss"/g)?.length).toBe(1);
    const b = glossify("<p>ROAS once more</p>", seen);
    expect(b).not.toMatch(/gloss/);
    expect(glossify('<p><a href="/x">ROAS</a></p>')).not.toMatch(/gloss/);
  });
});
