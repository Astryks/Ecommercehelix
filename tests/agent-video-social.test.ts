import { describe, expect, it } from "vitest";
import { buildVideoBrief, canAutoPost, checkNeverPost, manualUploadPacket, PLATFORM_POSTING, type SocialDraft } from "@/lib/agent/video-social";
import { DEFAULT_AGENT_SETTINGS } from "@/lib/agent/autonomy";

const input = (over: Record<string, unknown> = {}) => ({
  productName: "Linen Shirt",
  productPrice: 89,
  reviewPhrases: ["It fits perfectly and the fabric breathes", "I get compliments every time I wear it"],
  openings: ["Stop scrolling — this shirt changed my mornings", "Three reasons this linen shirt sells out", "The shirt our customers keep reordering"],
  ugcAvailable: true,
  ugcPermission: true,
  stockDaysLeft: 30,
  bannedWords: ["miracle", "guaranteed"],
  discountCeilingPct: 20,
  ...over,
});

describe("video briefs — draft-only assembly", () => {
  it("builds 3 variants, 9:16, one variable different per variant, hook in the first 3 seconds", () => {
    const b = buildVideoBrief(input());
    expect(b.variants).toHaveLength(3);
    expect(b.variants.every((v) => v.format === "9:16")).toBe(true);
    expect(new Set(b.variants.map((v) => v.variable)).size).toBe(3);
    expect(b.variants[0].hook).toBe("Stop scrolling — this shirt changed my mornings");
    expect(b.blockedBy).toBeNull();
  });

  it("blocks a brief when the hero product has under 14 days of stock", () => {
    const b = buildVideoBrief(input({ stockDaysLeft: 5 }));
    expect(b.variants).toHaveLength(0);
    expect(b.blockedBy).toContain("Reorder first");
  });

  it("flags photo-only variants when there is no UGC with permission", () => {
    const b = buildVideoBrief(input({ ugcAvailable: false, ugcPermission: false }));
    expect(b.checks.notes.join(" ")).toContain("needs creator clip");
  });
});

describe("social auto-post — off by default, price/promo always needs approval", () => {
  const draft = (over: Partial<SocialDraft> = {}): SocialDraft => ({
    channel: "instagram", caption: "New drop is here", hashtags: ["#new"], isPriceOrPromo: false, neverPostMatch: null, ...over,
  });

  it("never auto-posts with the default settings", () => {
    expect(canAutoPost(draft(), DEFAULT_AGENT_SETTINGS, 0).allowed).toBe(false);
  });

  it("auto-posts only with an explicit per-channel opt-in, inside the per-day cap", () => {
    const s = { ...DEFAULT_AGENT_SETTINGS, autoPost: { ...DEFAULT_AGENT_SETTINGS.autoPost, instagram: { enabled: true, perDayCap: 1 } } };
    expect(canAutoPost(draft(), s, 0).allowed).toBe(true);
    expect(canAutoPost(draft(), s, 1).allowed).toBe(false);
  });

  it("always requires approval for price / promotion posts, even with auto-post on", () => {
    const s = { ...DEFAULT_AGENT_SETTINGS, autoPost: { ...DEFAULT_AGENT_SETTINGS.autoPost, instagram: { enabled: true, perDayCap: 1 } } };
    const r = canAutoPost(draft({ isPriceOrPromo: true }), s, 0);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("always need approval");
  });

  it("honours the never-post list", () => {
    expect(checkNeverPost("Big 20% off sale today", ["promotion", "discount"])).toBeNull();
    expect(checkNeverPost("Our new promotion is live", ["promotion", "discount"])).toBe("promotion");
  });

  it("documents the platform limits honestly — TikTok is draft-inbox, not auto-publish", () => {
    expect(PLATFORM_POSTING.tiktok.capability).toBe("draft-inbox");
    expect(PLATFORM_POSTING.instagram.capability).toBe("scheduled-publish");
  });

  it("falls back to a manual upload packet and says so", () => {
    const b = buildVideoBrief(input());
    const p = manualUploadPacket(b.variants[0], "tiktok");
    expect(p.files).toHaveLength(3);
    expect(p.note).toContain("did not auto-post");
  });
});
