import "server-only";
import { listModules } from "./learn";

let cache: Map<string, { href: string; title: string }> | null = null;

/** "26.1" -> { href: "/learn/26-...#lesson-261-...", title: "GST in Australia: ..." }. */
export function lessonLink(ref: string): { href: string; title: string } | null {
  if (!cache) {
    cache = new Map();
    for (const m of listModules()) {
      for (const l of m.lessons) {
        const hit = l.title.match(/^Lesson (\d+\.\d+):\s*(.+)$/);
        if (hit) cache.set(hit[1], { href: `/learn/${m.slug}#${l.id}`, title: hit[2] });
      }
    }
  }
  return cache.get(ref) ?? null;
}
