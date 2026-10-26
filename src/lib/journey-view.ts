import "server-only";
import { MILESTONES, canSeeLevel, teaserOf, type Milestone } from "./journey";
import { lessonLink } from "./lesson-links";
import { canReadLesson } from "./paywall/access";
import type { PlanId } from "./plans";

export type MoveView = { text: string; href: string | null; locked: boolean };
export type MilestoneView =
  | ({ open: true; moveLinks: MoveView[] } & Milestone)
  | ({ open: false } & ReturnType<typeof teaserOf>);

/**
 * Server-side paywall for the road: Free gets levels 1-2 in full and only the
 * summary of the rest (numbers, moves and the business shape are never sent).
 * Lesson links carry a lock when the lesson itself is paid.
 */
export function journeyView(plan: PlanId, paid: boolean): MilestoneView[] {
  return MILESTONES.map((m) => {
    if (!canSeeLevel(paid, m.level)) return { open: false as const, ...teaserOf(m) };
    const moveLinks = m.moves.map((x) => {
      const l = x.lesson ? lessonLink(x.lesson) : null;
      return { text: x.text, href: l?.href ?? null, locked: Boolean(x.lesson && !canReadLesson(plan, x.lesson)) };
    });
    return { open: true as const, ...m, moveLinks };
  });
}
