/**
 * Pure social-profile mappers (no server-only) — tested in
 * tests/social-presence.test.ts. The Graph pull lives in
 * src/lib/social-presence.ts and imports these.
 */
import type { Signals } from "./audit";

export type SocialProfile = Signals["social"]["profiles"][number];

const REVIEW_WORDS = /review|love it|5 star|★★★★★|thank you|customer|unboxing/i;
const SELL_WORDS = /shop|buy|free|shipping|sale|new|collection|store|order|gift/i;

export function daysSince(iso: string, now = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000));
}

/** Pure: an Instagram business account + its last-10 media into a profile row. */
export function igProfileFromGraph(
  ig: { username?: string; biography?: string; website?: string },
  media: { timestamp?: string; caption?: string }[],
  now = new Date(),
): SocialProfile {
  const stamps = media.map((m) => m.timestamp ?? "").filter(Boolean).sort();
  const last = stamps.at(-1);
  const recent = stamps.filter((t) => daysSince(t, now) <= 28).length;
  const proof = media.filter((m) => REVIEW_WORDS.test(m.caption ?? "")).length;
  const bio = ig.biography ?? "";
  const site = ig.website ?? "";
  return {
    platform: "Instagram",
    handle: ig.username ? `@${ig.username}` : "",
    lastPostDays: last ? daysSince(last, now) : 999,
    postsPerWeek: Math.round((recent / 4) * 10) / 10,
    highlights: 3, // Graph API does not expose highlights — rule-neutral, manual check
    pinned: 1, // Graph API does not expose pinned posts — rule-neutral, manual check
    bioHasKeyword: SELL_WORDS.test(bio),
    linkOk: site.length > 0,
    linkHasUtm: site.includes("utm_"),
    proofInLast10: proof,
    unansweredQs: 0, // comment reads not pulled — rule-neutral
  };
}

/** Pure: a Facebook page + its latest post into a profile row. */
export function fbProfileFromGraph(page: { name?: string }, lastPostAt: string | null, now = new Date()): SocialProfile {
  return {
    platform: "Facebook",
    handle: page.name ?? "",
    lastPostDays: lastPostAt ? daysSince(lastPostAt, now) : 999,
    postsPerWeek: lastPostAt && daysSince(lastPostAt, now) <= 7 ? 1 : 0,
    highlights: 3,
    pinned: 1,
    bioHasKeyword: false, // page "about" is not pulled; neutral would be wrong, so this gap is real only if a bio check is added
    linkOk: true,
    linkHasUtm: false,
    proofInLast10: 0,
    unansweredQs: 0,
  };
}

/** Pure: does the live ad offer appear in any bio or recent caption? */
export function offerOnProfile(offer: string, texts: string[]): boolean {
  const words = offer.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3).slice(0, 3);
  if (words.length === 0) return true; // no offer to mismatch
  const hay = texts.join(" ").toLowerCase();
  return words.some((w) => hay.includes(w));
}
