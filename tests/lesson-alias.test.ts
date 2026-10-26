import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import aliases from "@/lib/lesson-aliases.json";
import {
  MODULE_SLUGS, RENUMBERED, currentModuleSlug, oldAnchorsFor, storedStepKeysFor,
  toCurrentRef, toCurrentStepKey, toCurrentStepKeys, toStoredRef, toStoredStepKey,
} from "@/lib/lesson-alias";
import { lessonTaskId, parseLessonTaskId } from "@/lib/lesson-actions";
import { courseTaskId } from "@/lib/course-plan";
import { lessonStateFn } from "@/lib/lesson-done";
import { migrateOld } from "@/components/learn/progress-store";

const PB = path.join(process.cwd(), "docs", "playbook");
const files = fs.readdirSync(PB).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
const slugify = (t: string) => t.toLowerCase().trim().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");
const headings = files.flatMap((f) => [...fs.readFileSync(path.join(PB, f), "utf8").matchAll(/^## (Lesson (\d+\.\d+): .+)$/gm)].map((m) => ({ f, heading: m[1], ref: m[2], id: slugify(m[1]) })));
const current = new Set(headings.map((h) => h.ref));

describe("26 Oct 2026 reorder: old lesson numbers still work", () => {
  it("maps every permanent id to exactly one current lesson, and back", () => {
    const ids = Object.keys(RENUMBERED);
    const now = Object.values(RENUMBERED);
    expect(new Set(now).size).toBe(now.length);
    expect(new Set(now)).toEqual(current);
    for (const id of ids) expect(toStoredRef(toCurrentRef(id)), id).toBe(id);
  });

  it("resolves old refs to the lesson that has the same title now", () => {
    expect(toCurrentRef("7.14")).toBe("8.1"); // Find your way around Ads Manager, now first in the Meta module
    expect(toCurrentRef("7.1")).toBe("8.2");
    expect(toCurrentRef("20.2")).toBe("9.2");
    expect(toCurrentRef("20.14")).toBe("9.3"); // Meta audience check, next to audiences
    expect(toCurrentRef("12.12")).toBe("11.8"); // SEO basics, before SEO step by step
    expect(toCurrentRef("12.8")).toBe("11.9");
    expect(toCurrentRef("22.1")).toBe("13.1");
    expect(toCurrentRef("29.16")).toBe("30.16");
    expect(toCurrentRef("1.1")).toBe("1.1");
    expect(toCurrentRef("setup")).toBe("setup");
    expect(toStoredRef("8.1")).toBe("7.14");
    // Lessons added after the reorder get new permanent ids, so old saved "21.8" (now 4.6) is untouched.
    expect(toCurrentRef("22.19")).toBe("13.17"); // Privacy and cookie consent
    expect(toCurrentRef("23.8")).toBe("21.8"); // Product safety, labelling and recalls
    expect(toStoredRef("21.8")).toBe("23.8");
    expect(toCurrentRef("21.8")).toBe("4.6");
    // 27 Oct 2026 lessons: new permanent ids, old saved ids untouched.
    for (const [stored, shown] of [["3.12", "15.12"], ["10.18", "16.18"], ["5.23", "5.22"], ["12.13", "11.13"], ["16.10", "27.7"]]) {
      expect(toCurrentRef(stored)).toBe(shown);
      expect(toStoredRef(shown)).toBe(stored);
    }
    expect(toCurrentRef("5.22")).toBe("5.21");
  });

  it("keeps lessons merged before the reorder pointing at the right lesson and step", () => {
    expect(toCurrentRef("21.7")).toBe("3.7");
    expect(toCurrentRef("16.5")).toBe("26.1");
    expect(toCurrentStepKey("21.7#1")).toBe("3.7#5");
    expect(toCurrentStepKey("7.14#3")).toBe("8.1#3");
    expect(toCurrentStepKeys(["16.5#1", "28.1#3"])).toEqual(["26.1#3"]);
    expect(toStoredStepKey("8.1#3")).toBe("7.14#3");
    expect(storedStepKeysFor("3.7#5")).toEqual(expect.arrayContaining(["4.7#5", "21.7#1"]));
  });

  it("saved progress (old keys) reads as the same lesson and step today", () => {
    const old = ["7.14#1", "7.14#2", "22.16#1", "9.11#1"];
    const now = toCurrentStepKeys(old);
    expect(now).toEqual(["8.1#1", "8.1#2", "13.14#1", "14.10#1"]);
    for (const k of now) {
      const [ref, n] = k.split("#");
      const h = headings.find((x) => x.ref === ref)!;
      const md = fs.readFileSync(path.join(PB, h.f), "utf8").split(`## ${h.heading}`)[1].split(/\n## /)[0];
      expect(md, k).toContain(`**Step ${n}.**`);
    }
    // Browser copies saved before the reorder are moved over the same way.
    expect(migrateOld(old)).toEqual(now);
  });

  it("task ids keep the permanent id, so done lessons and course ticks stay done", () => {
    expect(lessonTaskId("8.1")).toBe("lesson-7-14");
    expect(lessonTaskId("8.1", 2)).toBe("lesson-7-14-s2");
    expect(parseLessonTaskId("lesson-7-14-s2")).toEqual({ ref: "8.1", step: 2 });
    expect(courseTaskId("first-100-visits", "8.1", 1)).toBe("course-first-100-visits-7-14-s1");
    for (const ref of current) expect(parseLessonTaskId(lessonTaskId(ref))?.ref, ref).toBe(ref);
    const state = lessonStateFn(["lesson-7-14"], ["9.2#1"]);
    expect(state("8.1")).toBe("done");
    expect(state("9.2")).toBe("started");
  });

  it("redirects every old module page to the renamed one, and old anchors land on the same lesson", () => {
    for (const [from, to] of Object.entries(MODULE_SLUGS)) {
      expect(fs.existsSync(path.join(PB, `${to}.md`)), to).toBe(true);
      expect(fs.existsSync(path.join(PB, `${from}.md`)), from).toBe(false);
      expect(currentModuleSlug(from)).toBe(to);
    }
    const ids = new Map(headings.map((h) => [h.id, h.ref]));
    for (const [anchor, v] of Object.entries(aliases.anchors as Record<string, { ref: string }>)) {
      const ref = toCurrentRef(v.ref);
      expect(current.has(ref), anchor).toBe(true);
      expect(oldAnchorsFor(ref), anchor).toContain(anchor);
      // An old anchor never steals the id of a different lesson.
      if (ids.has(anchor)) expect(ids.get(anchor), anchor).toBe(ref);
    }
    expect(oldAnchorsFor("8.1")).toContain("lesson-714-find-your-way-around-ads-manager");
  });
});
