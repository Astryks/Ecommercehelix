import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import learnPath from "@/lib/learn-path.json";
import stageMap from "@/lib/stage-map.json";
import { GOALS } from "@/lib/course-plan";
import { ADMIN_DATES, TOPICS } from "@/lib/business";
import { DAYS, START_DAYS } from "@/lib/seed/curriculum";
import { SEQUENCE } from "@/lib/email/sequence";
import { parseModuleSections, type ParsedLesson } from "@/lib/lesson-parse";

/** Every lesson reference in the course, app, emails and docs points at a lesson that exists now. */
const ROOT = process.cwd();
const PB = path.join(ROOT, "docs", "playbook");
const files = fs.readdirSync(PB).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
const slugify = (t: string) => t.toLowerCase().trim().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");
const mds = new Map(files.map((f) => [f.replace(/\.md$/, ""), fs.readFileSync(path.join(PB, f), "utf8")]));
const lessons = new Map<string, ParsedLesson>();
for (const md of mds.values()) for (const s of parseModuleSections(md)) if (s.kind === "lesson") lessons.set(s.ref, s);
const idsOf = (slug: string) => new Set([...(mds.get(slug) ?? "").matchAll(/^#{1,6} (.+)$/gm)].map((m) => slugify(m[1].replace(/[*`]/g, ""))));
const allLessonIds = new Set([...mds.keys()].flatMap((s) => [...idsOf(s)].filter((id) => id.startsWith("lesson-"))));

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "social" ? [] : walk(p);
    return /\.(md|ts|tsx|json|py)$/.test(e.name) ? [p] : [];
  });
}
const sources = [...walk(path.join(ROOT, "src")), ...walk(path.join(ROOT, "docs")), ...walk(path.join(ROOT, "scripts")), path.join(ROOT, "README.md")]
  .filter((p) => !p.endsWith("lesson-aliases.json"));
const text = new Map(sources.map((p) => [path.relative(ROOT, p), fs.readFileSync(p, "utf8")]));

describe("every lesson reference resolves", () => {
  it("module and lesson numbers read in order", () => {
    files.forEach((f, i) => expect(Number(f.slice(0, 2)), f).toBe(i + 1));
    for (const [slug, md] of mds) {
      const n = Number(slug.slice(0, 2));
      const refs = [...md.matchAll(/^## Lesson (\d+)\.(\d+):/gm)];
      refs.forEach((m, i) => expect(`${m[1]}.${m[2]}`, slug).toBe(`${n}.${i + 1}`));
    }
  });

  it('"Lesson x.y" in docs, app copy, emails and scripts', () => {
    for (const [f, t] of text) {
      for (const m of t.matchAll(/\bLessons? (\d{1,2}\.\d{1,2}(?:(?:, and |, or |, | and | or | to |\/)\d{1,2}\.\d{1,2})*)/g)) {
        for (const ref of m[1].match(/\d{1,2}\.\d{1,2}/g)!) expect(lessons.has(ref), `${f}: Lesson ${ref}`).toBe(true);
      }
    }
  });

  it("links to /learn pages and playbook files, with their anchors", () => {
    let n = 0;
    for (const [f, t] of text) {
      const hits = [...t.matchAll(/\/learn\/(\d\d-[a-z0-9-]+)(?:#([a-z0-9-]+))?/g), ...t.matchAll(/\b(\d\d-[a-z0-9-]+)\.md(?:#([a-z0-9-]+))?/g)];
      for (const m of hits) {
        if (fs.existsSync(path.join(ROOT, "docs", "sops", `${m[1]}.md`))) continue; // an SOP, not a module
        n++;
        expect(mds.has(m[1]), `${f}: ${m[1]}`).toBe(true);
        if (m[2]) expect(idsOf(m[1]).has(m[2]), `${f}: ${m[1]}#${m[2]}`).toBe(true);
      }
      for (const m of t.matchAll(/slug: "(\d\d-[a-z0-9-]+)"/g)) expect(mds.has(m[1]), `${f}: ${m[1]}`).toBe(true);
    }
    expect(n).toBeGreaterThan(500);
  });

  it("lesson anchors in code point at a lesson heading that exists", () => {
    for (const [f, t] of text) {
      if (!f.startsWith("src/")) continue;
      for (const m of t.matchAll(/\blesson-\d+-[a-z][a-z0-9]*(?:-[a-z0-9]+)*/g)) expect(allLessonIds.has(m[0]), `${f}: ${m[0]}`).toBe(true);
    }
  });

  it("refs in the course goals, learn path, curricula, business hub, store check, plan, stages and cards", () => {
    const refs: [string, string][] = [
      ...GOALS.flatMap((g) => g.lessons.map((r) => [`goal ${g.id}`, r] as [string, string])),
      ...learnPath.steps.flatMap((s) => s.refs.map((r) => [`learn path ${s.id}`, r] as [string, string])),
      ...[...DAYS, ...START_DAYS].map((d) => [`day ${d.day}`, d.learn.ref] as [string, string]),
      ...TOPICS.flatMap((t) => t.lessons.map((r) => [`topic ${t.id}`, r] as [string, string])),
      ...ADMIN_DATES.flatMap((a) => (a.lesson ? [[`admin ${a.key}`, a.lesson] as [string, string]] : [])),
      ...Object.keys(stageMap.lessons).map((r) => ["stage-map", r] as [string, string]),
      ...[...text.get("src/lib/site-audit/checks.ts")!.matchAll(/lesson: "(\d+\.\d+)"/g)].map((m) => ["store check", m[1]] as [string, string]),
      ...[...text.get("src/lib/plan12.ts")!.matchAll(/lesson:(\d+\.\d+)/g)].map((m) => ["12-week plan", m[1]] as [string, string]),
    ];
    expect(refs.length).toBeGreaterThan(500);
    for (const [where, ref] of refs) expect(lessons.has(ref), `${where}: ${ref}`).toBe(true);
    for (const f of fs.readdirSync(path.join(ROOT, "docs", "cards"))) {
      const deck = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "cards", f), "utf8")) as Record<string, { steps: unknown[] }>;
      for (const [ref, d] of Object.entries(deck)) {
        expect(ref.split(".")[0], `cards ${f}`).toBe(String(Number(f.slice(0, 2))));
        expect(lessons.get(ref)?.steps.length, `cards ${f} ${ref}`).toBe(d.steps.length);
      }
    }
  });

  it("daily emails link to real lessons", () => {
    for (const s of SEQUENCE) expect(mds.get(s.lesson.slug)?.split("\n"), s.subject).toContain(`## ${s.lesson.heading}`);
  });
});
