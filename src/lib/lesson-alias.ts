import aliases from "./lesson-aliases.json";

/**
 * Lesson ids, pure and client-safe.
 *
 * The course was reordered on 26 Oct 2026 (Attract, Convert, Grow), which changed most lesson
 * numbers. Saved progress never moves: step ticks, task ids, the card player position and store
 * check findings are saved under each lesson's permanent id (its number before the reorder; lessons
 * added later use new ids past the end of their old module: 12.12, 20.14, 22.19, 23.8, then 3.12, 10.18, 5.23, 12.13, 16.10, 7.17, 7.18, 8.14, 12.14 and 12.15). Screens, links and code use the number shown
 * now. Convert with toStoredRef / toCurrentRef at the edges where data is saved or read.
 *
 * Lessons merged into another lesson earlier (permanent ids) and renamed headings keep working too.
 */
type Merged = Record<string, { to: string; steps: Record<string, number> }>;
const MERGED = aliases.lessons as Merged;
/** Permanent id -> number shown now. */
export const RENUMBERED = aliases.renumbered as Record<string, string>;
/** Number shown now -> permanent id. */
const STORED: Record<string, string> = Object.fromEntries(Object.entries(RENUMBERED).map(([k, v]) => [v, k]));
/** Old module page slug -> new slug ("07-meta-ads" -> "08-meta-ads"). */
export const MODULE_SLUGS = aliases.modules as Record<string, string>;
/** Old heading anchor -> permanent id of the lesson it now lives in. */
export const ANCHORS = aliases.anchors as Record<string, { ref: string }>;

/** A saved (permanent) id -> the number shown now. "21.7" (merged) -> "3.7"; "7.14" -> "8.1". Unknown refs come back unchanged. */
export function toCurrentRef(stored: string): string {
  const id = MERGED[stored]?.to ?? stored;
  return RENUMBERED[id] ?? id;
}

/** The number shown now -> the permanent id saved with progress. "8.1" -> "7.14". Unknown refs come back unchanged. */
export const toStoredRef = (current: string): string => STORED[current] ?? current;

/** A saved step key -> the current one: "21.7#2" -> "3.7#6" (merged lesson, matching step), "7.14#3" -> "8.1#3". */
export function toCurrentStepKey(key: string): string {
  const [ref, n] = key.split("#");
  const m = MERGED[ref];
  const id = m ? m.to : ref;
  const step = m ? (m.steps[n] ?? n) : n;
  return `${RENUMBERED[id] ?? id}#${step}`;
}

/** A current step key -> the saved one: "8.1#3" -> "7.14#3". */
export function toStoredStepKey(key: string): string {
  const [ref, n] = key.split("#");
  return `${toStoredRef(ref)}#${n}`;
}

export const toCurrentStepKeys = (keys: string[]) => [...new Set(keys.map(toCurrentStepKey))];

/** Saved keys that read as this current key (the permanent one and any merged lesson's steps), so unticking clears them all. */
export function storedStepKeysFor(current: string): string[] {
  const [ref, n] = current.split("#");
  const id = toStoredRef(ref);
  const out = [`${id}#${n}`];
  for (const [old, m] of Object.entries(MERGED)) {
    if (m.to !== id) continue;
    for (const [from, to] of Object.entries(m.steps)) if (String(to) === n) out.push(`${old}#${from}`);
  }
  return out;
}

/** Old heading anchors that now point at a lesson, for the given current ref. */
export const oldAnchorsFor = (ref: string) => Object.entries(ANCHORS).filter(([, v]) => toCurrentRef(v.ref) === ref).map(([a]) => a);

/** Old module slug -> current slug (current slugs come back unchanged). */
export const currentModuleSlug = (slug: string) => MODULE_SLUGS[slug] ?? slug;
