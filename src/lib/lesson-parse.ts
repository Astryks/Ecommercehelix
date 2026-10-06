/**
 * Parse a playbook module (markdown) into sections. Lessons written in the step
 * format become structured objects; everything else stays as markdown.
 * Pure and client-safe so it can be unit tested.
 *
 * Lesson format:
 *   ## Lesson 7.1: Title
 *   <!-- stage:attract -->        (optional)
 *   <!-- do:KEY -->               (optional, lesson-level action)
 *   **Why this matters:** ...
 *   **Step 1.** one instruction
 *   **Expected result:** ...
 *   **Watch out:** ...            (optional)
 *   <!-- do:KEY -->               (optional, step action)
 *   ### Good to know              (optional: notes, tables, drawings)
 */
export type ParsedStep = { n: number; instruction: string; expected: string; watchOut: string | null; action: string | null };
export type ParsedLesson = { kind: "lesson"; heading: string; ref: string; title: string; why: string; notice: string | null; doIt: string | null; steps: ParsedStep[]; extra: string };
export type ParsedSection = { kind: "markdown"; heading: string | null; md: string } | ParsedLesson;

const STEP_RE = /^\*\*Step (\d+)\.\*\*\s*/;

export function parseModuleSections(md: string): ParsedSection[] {
  const body = md.replace(/^# .+$/m, "");
  const parts = body.split(/^(?=## )/m);
  const out: ParsedSection[] = [];
  for (const part of parts) {
    const h = part.match(/^## (.+)$/m);
    if (!h || !part.startsWith("## ")) {
      if (part.trim()) out.push({ kind: "markdown", heading: null, md: part });
      continue;
    }
    const lesson = parseLesson(h[1], part.slice(h[0].length));
    out.push(lesson ?? { kind: "markdown", heading: h[1], md: part });
  }
  return out;
}

export function parseLesson(heading: string, body: string): ParsedLesson | null {
  const ref = heading.match(/^Lesson (\d+\.\d+):\s*(.+)$/);
  if (!ref || !/\*\*Why this matters:\*\*/.test(body)) return null;
  const [main, ...rest] = body.split(/^### Good to know\s*$/m);
  let extra = rest.join("### Good to know");
  // A legal or advice notice ("General information, not ... advice") belongs at the top, not in Good to know.
  let notice: string | null = null;
  const q = extra.match(/(?:^>.*\n?)+/m);
  if (q && /General information/i.test(q[0])) {
    notice = q[0].trim();
    extra = extra.replace(q[0], "");
  }
  const blocks = main.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  let why = "";
  let doIt: string | null = null;
  const steps: ParsedStep[] = [];
  for (const b of blocks) {
    const doM = b.match(/^<!-- do:([a-z0-9-]+) -->$/);
    if (doM) {
      if (steps.length) steps[steps.length - 1].action = doM[1];
      else doIt = doM[1];
      continue;
    }
    if (/^<!--[\s\S]*-->$/.test(b)) {
      const inner = b.match(/<!-- do:([a-z0-9-]+) -->/);
      if (inner && !steps.length) doIt = inner[1];
      continue;
    }
    if (b.startsWith("**Why this matters:**")) { why = b.replace("**Why this matters:**", "").trim(); continue; }
    const s = b.match(STEP_RE);
    if (s) { steps.push({ n: Number(s[1]), instruction: b.replace(STEP_RE, "").trim(), expected: "", watchOut: null, action: null }); continue; }
    const cur = steps[steps.length - 1];
    if (b.startsWith("**Expected result:**") && cur) { cur.expected = b.replace("**Expected result:**", "").trim(); continue; }
    if (b.startsWith("**Watch out:**") && cur) { cur.watchOut = b.replace("**Watch out:**", "").trim(); continue; }
    // Anything else: keep it with the current step's instruction, or as extra.
    if (cur) cur.instruction += "\n\n" + b;
    else extra = b + "\n\n" + extra;
  }
  return { kind: "lesson", heading, ref: ref[1], title: ref[2], why, notice, doIt, steps, extra: extra.trim() };
}
