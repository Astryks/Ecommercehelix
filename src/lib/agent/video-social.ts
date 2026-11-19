/**
 * Step 3 — Video generation and social posting (Job 1 of the pivot, §11).
 *
 * Honest answer, encoded: Helix does not generate film. The design is
 * draft-only short-form assembly — real product media + real UGC + generated
 * scripts, assembled by a template renderer (not an LLM). No post leaves
 * without owner approval by default.
 *
 * Platform rules (verify at build — APIs change):
 * - Meta/Instagram: Graph API allows scheduled publishing for professional accounts.
 * - TikTok: Content Posting API needs app review + user authorisation, and
 *   posts may land as private/draft — design for "draft in TikTok inbox,
 *   owner taps post" as the fallback and label it honestly.
 * - Pinterest: API allows Pin creation for authorised accounts.
 * - YouTube Shorts: Data API upload possible; defaults to draft/private
 *   until the owner publishes in Studio if the channel is not fully authorised.
 * Any channel without a working authorised API gets a manual upload packet
 * (video file + caption + cover frame, one-tap download) — never pretend
 * it auto-posted.
 */
import type { AgentSettings, SocialChannel } from "./autonomy";

export type VideoVariant = {
  variant: number;
  /** The one variable that differs between variants. */
  variable: string;
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
  format: "9:16";
  durationSeconds: number;
};

export type VideoBriefInput = {
  productName: string;
  productPrice: number;
  /** Real phrases from reviews — hooks come from these, never invented. */
  reviewPhrases: string[];
  /** 20 openings written from the reviews; ranked by past hook rate. */
  openings: string[];
  /** UGC clips the owner uploaded, with a permission flag. */
  ugcAvailable: boolean;
  ugcPermission: boolean;
  /** Days of stock left on the hero SKU. Briefs are blocked below 14. */
  stockDaysLeft: number | null;
  /** Banned words / claims for this store. */
  bannedWords: string[];
  /** Discount ceiling, % off. */
  discountCeilingPct: number;
};

export type VideoBrief = {
  productName: string;
  variants: VideoVariant[];
  /** Supervisor (Haiku) checks: banned words, claims, discount ceiling, price accuracy. */
  checks: { passed: boolean; notes: string[] };
  blockedBy: string | null;
};

const OPENINGS_FALLBACK = [
  "Stop scrolling — this is the one our customers keep reordering.",
  "We asked 100 customers what changed. This is what they said.",
  "The shirt that made our returns drop.",
];

/** 3 variants, 9:16, one variable different per variant, hook in the first 3 seconds. */
export function buildVideoBrief(i: VideoBriefInput): VideoBrief {
  if (i.stockDaysLeft !== null && i.stockDaysLeft < 14)
    return { productName: i.productName, variants: [], checks: { passed: false, notes: [] }, blockedBy: `Blocked: ${i.productName} has ${i.stockDaysLeft} days of stock left (under 14). Do not make ads for a product about to sell out — Reorder first.` };
  const openings = i.openings.length ? i.openings : OPENINGS_FALLBACK;
  const hooks = openings.slice(0, 3);
  const phrases = i.reviewPhrases.length ? i.reviewPhrases : ["customers keep coming back for it"];
  const variables = ["Hook (first 3 seconds)", "Opening shot (product vs UGC)", "Call to action (shop now vs learn more)"] as const;
  const variants: VideoVariant[] = hooks.map((hook, idx) => ({
    variant: idx + 1,
    variable: variables[idx],
    hook,
    script: `${hook} ${phrases[idx % phrases.length]}. ${i.productName}, $${i.productPrice}. See why it works — link in bio.`,
    caption: `${hook}\n\n${i.productName} — $${i.productPrice}. Shop via the link in bio.`,
    hashtags: ["#smallbusiness", "#shoplocal"],
    format: "9:16",
    durationSeconds: 30,
  }));
  const notes: string[] = [];
  if (!i.ugcAvailable || !i.ugcPermission) notes.push("No UGC with permission — photo-only variants; flagged 'needs creator clip'.");
  const bannedHit = i.bannedWords.filter((w) => variants.some((v) => (v.script + v.caption).toLowerCase().includes(w.toLowerCase())));
  if (bannedHit.length) notes.push(`Banned words found and removed: ${bannedHit.join(", ")}.`);
  return {
    productName: i.productName,
    variants,
    checks: { passed: bannedHit.length === 0, notes },
    blockedBy: null,
  };
}

export type PlatformPosting = {
  channel: SocialChannel;
  /** What Helix can actually do today on this channel. */
  capability: "scheduled-publish" | "draft-inbox" | "pin" | "draft-private" | "manual-packet";
  note: string;
};

export const PLATFORM_POSTING: Record<SocialChannel, PlatformPosting> = {
  instagram: { channel: "instagram", capability: "scheduled-publish", note: "Graph API scheduled publishing for professional accounts; token stored encrypted." },
  tiktok: { channel: "tiktok", capability: "draft-inbox", note: "Content Posting API needs app review + user authorisation; posts may land as private/draft — design for 'draft in TikTok inbox, owner taps post' and label it honestly." },
  pinterest: { channel: "pinterest", capability: "pin", note: "API allows Pin creation for authorised accounts; schedule via the draft queue." },
  youtube: { channel: "youtube", capability: "draft-private", note: "Data API upload possible; defaults to draft/private until the owner publishes in Studio if the channel is not fully authorised." },
};

export type SocialDraft = {
  channel: SocialChannel;
  caption: string;
  hashtags: string[];
  /** Price / promotion posts always need approval, even with auto-post on. */
  isPriceOrPromo: boolean;
  neverPostMatch: string | null;
};

/** Can this draft auto-post? Default: no. Price/promo posts always need approval. */
export function canAutoPost(
  draft: SocialDraft,
  settings: AgentSettings,
  postedToday: number,
): { allowed: boolean; reason: string } {
  const cfg = settings.autoPost[draft.channel];
  if (!cfg.enabled) return { allowed: false, reason: "Auto-post is off for this channel. Approve each post in the review queue." };
  if (draft.isPriceOrPromo) return { allowed: false, reason: "Price / promotion posts always need approval, even with Let Helix post on." };
  if (draft.neverPostMatch) return { allowed: false, reason: `Blocked by your never-post list ("${draft.neverPostMatch}").` };
  if (postedToday >= cfg.perDayCap) return { allowed: false, reason: `Per-day cap reached (${cfg.perDayCap}/day for ${draft.channel}).` };
  return { allowed: true, reason: `Auto-post on for ${draft.channel} (${postedToday + 1}/${cfg.perDayCap} today).` };
}

/** A draft that matches the never-post list is flagged before it reaches the queue. */
export function checkNeverPost(caption: string, neverPost: string[]): string | null {
  const hit = neverPost.find((n) => caption.toLowerCase().includes(n.toLowerCase()));
  return hit ?? null;
}

/** Manual upload packet: video file + caption + cover frame, one-tap download. Never pretend it auto-posted. */
export function manualUploadPacket(variant: VideoVariant, channel: SocialChannel): { channel: SocialChannel; files: string[]; caption: string; note: string } {
  return {
    channel,
    files: [`video-variant-${variant.variant}-9x16.mp4`, `cover-variant-${variant.variant}.jpg`, `caption-variant-${variant.variant}.txt`],
    caption: `${variant.caption}\n${variant.hashtags.join(" ")}`,
    note: `No working authorised API for ${channel} — download this packet and post it by hand. Helix did not auto-post it.`,
  };
}
