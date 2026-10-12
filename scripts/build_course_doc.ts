// Regenerates the generated parts of docs/playbook/course.md from src/lib/course-plan.ts.
// Run: npx vite-node scripts/build_course_doc.ts
import fs from "node:fs";
import path from "node:path";
import { parseModuleSections, type ParsedLesson } from "../src/lib/lesson-parse";
import { buildDays, COURSE_TRACKS, GOALS, goalTier, PHASES, type Lookup } from "../src/lib/course-plan";

const root = path.join(__dirname, "..");
const PB = path.join(root, "docs", "playbook");
const lessons = new Map<string, ParsedLesson>();
for (const f of fs.readdirSync(PB).filter((f) => /^\d\d-.*\.md$/.test(f)))
  for (const s of parseModuleSections(fs.readFileSync(path.join(PB, f), "utf8"))) if (s.kind === "lesson") lessons.set(s.ref, s);
const lookup: Lookup = (ref) => {
  const l = lessons.get(ref);
  return l ? { ref, title: l.title, href: "", steps: l.steps.map((s) => ({ n: s.n, instruction: s.instruction, expected: s.expected, action: s.action })) } : null;
};
const trackNames = (ts: string[]) => ts.map((t) => COURSE_TRACKS.find((x) => x.id === t)!.name).join(", ");
const TIER = { free: "Free", starter: "Starter", growth: "Growth" } as const;

const table = ["| # | Goal | Finish line | Days | Stage | Tracks | Plan | Checked by |", "|---|---|---|---|---|---|---|---|",
  ...GOALS.map((g, i) => `| ${i + 1} | ${g.title} | ${g.finishLine} | ${buildDays(g, lookup).length} | ${PHASES[g.phase].name} | ${trackNames(g.tracks)} | ${TIER[goalTier(g)]} | ${g.finish.kind === "self" ? "You confirm" : "Your numbers"} |`)].join("\n");

const sections = GOALS.map((g) => {
  const days = buildDays(g, lookup);
  return `### ${g.title}\n\n**Finish line:** ${g.finishLine}  \n**Why this matters:** ${g.why}  \n**Lessons:** ${g.lessons.join(", ")} · **Days:** ${days.length} (${days.map((d) => d.tasks.length).join(", ")} tasks, about ${days.map((d) => d.tasks.reduce((a, t) => a + t.minutes, 0)).join(", ")} min)`;
}).join("\n\n");

const sg = GOALS.find((g) => g.id === "profit-dashboard")!;
const sd = buildDays(sg, lookup)[1];
const sample = `Goal: ${sg.title}, day 2:\n\n` + sd.tasks.map((t) => `- [ ] ${t.title} *You will have:* ${t.expected} (${t.minutes} min, Lesson ${t.lessonRef} step ${t.step})`).join("\n");

const p = path.join(PB, "course.md");
let doc = fs.readFileSync(p, "utf8");
const between = (a: string, b: string, body: string) => {
  const i = doc.indexOf(a), j = doc.indexOf(b);
  if (i < 0 || j < 0) throw new Error(`missing ${a} or ${b}`);
  doc = doc.slice(0, i + a.length) + "\n\n" + body + "\n\n" + doc.slice(j);
};
between("## All goals in order", "Goal numbers on screen", table);
between("## Goals, days and tasks", "## A sample day", "Each goal's tasks are the steps of the lessons listed, in order. Days follow a light and busy rhythm, and no task is estimated at more than 20 minutes.\n\n" + sections);
between("## A sample day", "## New lessons added", sample);
fs.writeFileSync(p, doc);
console.log("course.md updated", GOALS.length, "goals");
