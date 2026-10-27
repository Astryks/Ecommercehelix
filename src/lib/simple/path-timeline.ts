import type { Quest, QuestSection } from "@/lib/quest";
import { sectionName } from "@/lib/quest";

export type NodeState = "done" | "here" | "ahead" | "locked";
export type TimelineNode = { ref: string; n: number; title: string; href: string; state: NodeState };
export type TimelineStage = { id: QuestSection["id"]; name: string; done: number; total: number; pct: number; complete: boolean; badge: string; nodes: TimelineNode[]; here: boolean };
export type Timeline = { stages: TimelineStage[]; done: number; total: number; pct: number; next: TimelineNode | null; toNextBadge: number | null; nextBadge: string | null; xp: number; level: number; xpToNext: number; freeOpen: number; lockedCount: number };

export const STAGE_BADGE: Record<QuestSection["id"], string> = { warmup: "Set up", attract: "Attract master", convert: "Convert master", grow: "Grow master" };

/**
 * Turns the quest into a timeline. Locked lessons are teaser nodes: we only pass their title and the unlock link,
 * never the lesson body, so nothing paid leaks. `canRead(ref)` follows the paywall config.
 */
export function buildTimeline(q: Quest, canRead: (ref: string) => boolean, unlockHref: string): Timeline {
  const nextRef = q.next?.ref ?? null;
  const stages = q.sections.filter((s) => s.total > 0).map((s): TimelineStage => ({
    id: s.id, name: sectionName(s.id), done: s.done, total: s.total, pct: s.pct, complete: s.complete, badge: STAGE_BADGE[s.id],
    here: s.items.some((i) => i.ref === nextRef),
    nodes: s.items.map((i) => {
      const open = canRead(i.ref);
      const state: NodeState = i.done ? "done" : !open ? "locked" : i.ref === nextRef ? "here" : "ahead";
      return { ref: i.ref, n: i.n, title: i.title, href: open || i.done ? i.href : unlockHref, state };
    }),
  }));
  const all = stages.flatMap((s) => s.nodes);
  // "Next step" = the first open, not-done lesson in order (a locked next lesson points at unlock).
  const next = all.find((n) => n.state === "here") ?? all.find((n) => n.state === "ahead") ?? all.find((n) => n.state === "locked") ?? null;
  const cur = stages.find((s) => !s.complete) ?? null;
  return {
    stages, done: q.done, total: q.total, pct: q.pct, next,
    toNextBadge: cur ? cur.total - cur.done : null, nextBadge: cur ? cur.badge : null,
    xp: q.xp, level: q.level, xpToNext: q.xpToNext,
    freeOpen: all.filter((n) => n.state !== "locked").length, lockedCount: all.filter((n) => n.state === "locked").length,
  };
}
