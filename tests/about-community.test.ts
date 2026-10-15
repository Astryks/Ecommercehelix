import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const URL = "https://www.facebook.com/groups/1313305624157403";
const state = { session: null as null | { user: { id: string } }, plan: "free", status: "active" };
vi.mock("server-only", () => ({}));
vi.mock("@/auth", () => ({ auth: async () => state.session }));
vi.mock("@/lib/repo", () => ({
  getAccount: async () => ({ plan: state.plan }),
  getBilling: async () => ({ status: state.status }),
}));

import { communityAccess } from "@/lib/fb-group/state";
import { CommunityBlock } from "@/components/about/CommunityBlock";

const html = async () => renderToStaticMarkup(await CommunityBlock());

describe("About community block gating", () => {
  beforeEach(() => { process.env.FB_GROUP_URL = URL; delete process.env.FACEBOOK_GROUP_URL; state.session = null; state.plan = "free"; state.status = "active"; });

  it("helper: only active paid members get the link", () => {
    expect(communityAccess(null, URL)).toEqual({ kind: "locked" });
    expect(communityAccess({ plan: "free", status: "active" }, URL)).toEqual({ kind: "locked" });
    expect(communityAccess({ plan: "growth", status: "canceled" }, URL)).toEqual({ kind: "locked" });
    expect(communityAccess({ plan: "growth", status: "active" }, URL)).toEqual({ kind: "member", url: URL });
    expect(communityAccess({ plan: "growth", status: "active" }, null)).toEqual({ kind: "soon" });
  });

  it("logged out: members only, no URL in the HTML", async () => {
    const h = await html();
    expect(h).toContain("Members only, join Helix to get access");
    expect(h).toContain('href="/pricing"');
    expect(h).toContain("/signin");
    expect(h).not.toContain("facebook.com");
  });

  it("signed in but not paying: no URL", async () => {
    state.session = { user: { id: "u1" } };
    const h = await html();
    expect(h).toContain("Members only");
    expect(h).not.toContain("facebook.com");
  });

  it("cancelled paid plan: no URL", async () => {
    state.session = { user: { id: "u1" } }; state.plan = "growth"; state.status = "canceled";
    expect(await html()).not.toContain("facebook.com");
  });

  it("active paid member sees the link", async () => {
    state.session = { user: { id: "u1" } }; state.plan = "growth";
    const h = await html();
    expect(h).toContain(URL);
    expect(h).not.toContain("Members only");
  });

  it("falls back to FACEBOOK_GROUP_URL, and says coming soon when neither is set", async () => {
    state.session = { user: { id: "u1" } }; state.plan = "growth";
    delete process.env.FB_GROUP_URL; process.env.FACEBOOK_GROUP_URL = URL;
    expect(await html()).toContain(URL);
    delete process.env.FACEBOOK_GROUP_URL;
    const h = await html();
    expect(h).toContain("Link coming soon");
    expect(h).not.toContain("facebook.com");
  });
});
