import aliases from "./lesson-aliases.json";

/**
 * Lessons that were merged into another lesson, and headings that were renamed.
 * Old step ticks, links and anchors keep working through this map.
 */
type Merged = Record<string, { to: string; steps: Record<string, number> }>;
const MERGED = aliases.lessons as Merged;
export const ANCHORS = aliases.anchors as Record<string, { ref: string }>;

/** "21.7" -> "4.7" for a merged lesson; any other ref is returned unchanged. */
export const canonicalRef = (ref: string) => MERGED[ref]?.to ?? ref;

/** "21.7#2" -> "4.7#6": a tick saved on a merged lesson's step lands on the matching step. */
export function canonicalStepKey(key: string): string {
  const [ref, n] = key.split("#");
  const m = MERGED[ref];
  if (!m) return key;
  return `${m.to}#${m.steps[n] ?? n}`;
}

export const canonicalStepKeys = (keys: string[]) => [...new Set(keys.map(canonicalStepKey))];

/** Old heading anchors that now point at a lesson, for the given current ref. */
export const oldAnchorsFor = (ref: string) => Object.entries(ANCHORS).filter(([, v]) => canonicalRef(v.ref) === ref).map(([a]) => a);
