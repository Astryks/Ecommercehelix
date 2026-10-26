import "server-only";
import { findLesson } from "../learn";
import { lessonLink } from "../lesson-links";
import { teaserFromParsed, type Teaser } from "./teaser-core";

const cache = new Map<string, Teaser | null>();
/** Title, a 2-3 line "what you'll learn" and time. Never the steps themselves. */
export function teaserFor(ref: string): Teaser | null {
  if (cache.has(ref)) return cache.get(ref)!;
  const l = findLesson(ref);
  const t = l ? teaserFromParsed(l, lessonLink(ref)?.href ?? `/learn/${l.slug}`) : null;
  cache.set(ref, t);
  return t;
}
export type { Teaser };
