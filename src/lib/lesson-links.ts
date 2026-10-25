import "server-only";
import { listModules } from "./learn";
import { ANCHORS, toCurrentRef } from "./lesson-alias";

let cache: Map<string, { href: string; title: string }> | null = null;

/** A current lesson ref: "22.1" -> { href: "/learn/22-...#lesson-221-...", title: "GST: ..." }. */
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

/** Every old heading anchor mapped to the exact lesson link it now lives at. */
export function oldAnchorLinks(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [a, v] of Object.entries(ANCHORS)) {
    const l = lessonLink(toCurrentRef(v.ref));
    if (l) out[a] = l.href;
  }
  return out;
}
