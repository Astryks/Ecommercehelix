import type { ParsedLesson } from "../lesson-parse";

export type Teaser = { ref: string; title: string; summary: string[]; minutes: number; steps: number; href: string };

const clean = (s: string) =>
  s.replace(/<!--[\s\S]*?-->/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`>#|]/g, "").replace(/\s+/g, " ").trim();

const sentences = (s: string) => (clean(s).match(/[^.!?]+[.!?]+/g) ?? [clean(s)]).map((x) => x.trim()).filter(Boolean);

/** Pure: build the teaser from a parsed lesson. Uses only the "Why this matters" intro and the step count. */
export function teaserFromParsed(l: Pick<ParsedLesson, "ref" | "title" | "why" | "steps">, href: string): Teaser {
  const why = sentences(l.why).slice(0, 2).map((x) => (x.length > 220 ? x.slice(0, 217).replace(/\s+\S*$/, "") + "…" : x));
  const n = l.steps.length;
  const summary = [...why, n ? `${n} short step${n === 1 ? "" : "s"}, one action at a time, with what to expect after each.` : "A short read in plain English."];
  return { ref: l.ref, title: l.title, summary, minutes: Math.max(3, n * 2), steps: n, href };
}
