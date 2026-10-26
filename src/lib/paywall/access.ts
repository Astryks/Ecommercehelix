import { PLAN_RANK, type PlanId } from "../plans";
import { FREE_LESSONS } from "./free-lessons";

const FREE = new Set(FREE_LESSONS);

/**
 * The plan already reflects the Stripe status (see planForStatus in billing.ts):
 * active, trialing and past_due (card retry grace) keep Starter or Growth;
 * canceled, unpaid and incomplete_expired drop to Free.
 */
export const hasFullLearn = (plan: PlanId | null | undefined) => PLAN_RANK[plan ?? "free"] >= PLAN_RANK.starter;
export const isFreeLesson = (ref: string) => FREE.has(ref);
export const canReadLesson = (plan: PlanId | null | undefined, ref: string) => hasFullLearn(plan) || FREE.has(ref);

/** Where the "Unlock with Starter" button goes. Signed-in users go straight to billing (Stripe checkout lives there). */
export const unlockHref = (signedIn: boolean) => (signedIn ? "/dashboard/billing" : "/#pricing");
export const UNLOCK_LABEL = "Unlock with Starter";

/** Lesson ref from a /learn lesson link (module slug + "#lesson-<digits>-<title>" anchor). */
export function refFromLearnHref(href: string): string | null {
  const m = href.match(/\/learn\/(\d\d)-[a-z0-9-]+#lesson-(\d+)-/);
  if (!m) return null;
  const mod = String(Number(m[1]));
  return m[2].startsWith(mod) && m[2].length > mod.length ? `${mod}.${m[2].slice(mod.length)}` : null;
}

/** Card deck ids are lesson refs (plus the "setup" deck, which is always open). */
export const canOpenDeck = (plan: PlanId | null | undefined, deckId: string) => deckId === "setup" || canReadLesson(plan, deckId);

/** Coach context for locked lessons: a short taste only, plus a pointer to unlock. */
export const COACH_TEASER_CHARS = 280;
export function gateCoachHit<T extends { text: string; href: string; tokens: number }>(plan: PlanId, hit: T): T {
  const ref = refFromLearnHref(hit.href);
  if (!ref || canReadLesson(plan, ref)) return hit;
  const text = `${hit.text.slice(0, COACH_TEASER_CHARS).replace(/\s+\S*$/, "")}… [This is a locked lesson. Give the owner one short insight only, never the steps, and tell them the full lesson unlocks with Starter.]`;
  return { ...hit, text, tokens: Math.ceil(text.length / 4) };
}
