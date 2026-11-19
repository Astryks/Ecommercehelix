/** Finishing step — social presence mappers are pure and tested; the Graph pull itself needs a live token. */
import { describe, expect, it } from "vitest";
import { daysSince, fbProfileFromGraph, igProfileFromGraph, offerOnProfile } from "@/lib/social-profile";

const NOW = new Date("2026-11-19T12:00:00Z");

describe("igProfileFromGraph", () => {
  it("reads last post, cadence and proof from the last 10 media", () => {
    const media = [
      { timestamp: "2026-11-18T10:00:00Z", caption: "Our customers love it — 5 star review" },
      { timestamp: "2026-11-10T10:00:00Z", caption: "New collection" },
      { timestamp: "2026-10-20T10:00:00Z", caption: "Sale ends soon" },
    ];
    const p = igProfileFromGraph({ username: "myshop", biography: "Shop our new collection — free shipping", website: "https://myshop.com?utm_source=ig" }, media, NOW);
    expect(p.handle).toBe("@myshop");
    expect(p.lastPostDays).toBe(1);
    expect(p.postsPerWeek).toBe(0.5);
    expect(p.proofInLast10).toBe(1);
    expect(p.bioHasKeyword).toBe(true);
    expect(p.linkOk).toBe(true);
    expect(p.linkHasUtm).toBe(true);
    expect(p.highlights).toBe(3); // neutral: Graph cannot report highlights
    expect(p.pinned).toBe(1); // neutral: Graph cannot report pinned posts
  });
  it("a stale profile with no posts is flagged, not hidden", () => {
    const p = igProfileFromGraph({ username: "myshop", biography: "", website: "" }, [], NOW);
    expect(p.lastPostDays).toBe(999);
    expect(p.bioHasKeyword).toBe(false);
    expect(p.linkOk).toBe(false);
  });
});

describe("fbProfileFromGraph", () => {
  it("uses the latest post date", () => {
    expect(fbProfileFromGraph({ name: "My Shop" }, "2026-11-15T10:00:00Z", NOW).lastPostDays).toBe(4);
    expect(fbProfileFromGraph({ name: "My Shop" }, null, NOW).lastPostDays).toBe(999);
  });
});

describe("offerOnProfile", () => {
  it("matches an offer word in a bio or caption", () => {
    expect(offerOnProfile("Weekend Bundle: free gift over $150", ["Free gift with every bundle this weekend"])).toBe(true);
    expect(offerOnProfile("Weekend Bundle: free gift over $150", ["Just our normal collection"])).toBe(false);
    expect(offerOnProfile("", ["anything"])).toBe(true); // no offer, nothing to mismatch
  });
  it("daysSince is non-negative", () => {
    expect(daysSince("2026-11-20T00:00:00Z", NOW)).toBe(0);
  });
});
