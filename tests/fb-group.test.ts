import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { approveUrl, groupUrl, removeUrl, signGroupLink, verifyGroupLink } from "@/lib/fb-group/links";
import { statusFrom, transition, type GroupEvent } from "@/lib/fb-group/state";
import { onSubscriptionChange } from "@/lib/fb-group/activation";
import { digestEmail } from "@/lib/fb-group/digest";

const S = "test-secret";
const now = Date.parse("2026-10-16T00:00:00Z");

describe("signed group links", () => {
  it("round-trips one action for one person", () => {
    const t = signGroupLink({ action: "approve", userId: "u1" }, S, now);
    expect(verifyGroupLink(t, S, now)).toEqual({ ok: true, action: "approve", userId: "u1" });
  });
  it("expires after 7 days", () => {
    const t = signGroupLink({ action: "remove", userId: "u1" }, S, now);
    expect(verifyGroupLink(t, S, now + 6.9 * 864e5).ok).toBe(true);
    expect(verifyGroupLink(t, S, now + 7.1 * 864e5)).toEqual({ ok: false, reason: "expired" });
  });
  it("rejects tampering, another secret and junk", () => {
    const t = signGroupLink({ action: "approve", userId: "u1" }, S, now);
    const [p, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ a: "remove", u: "u1", e: 9e9 })).toString("base64url");
    expect(verifyGroupLink(`${forged}.${sig}`, S, now).ok).toBe(false);
    expect(verifyGroupLink(`${p}.${sig}x`, S, now).ok).toBe(false);
    expect(verifyGroupLink(t, "other", now).ok).toBe(false);
    expect(verifyGroupLink("nope", S, now).ok).toBe(false);
    expect(verifyGroupLink(t, "", now).ok).toBe(false);
  });
  it("builds the Facebook pages", () => {
    const g = groupUrl({ FB_GROUP_URL: "https://www.facebook.com/groups/123/" })!;
    expect(approveUrl(g)).toBe("https://www.facebook.com/groups/123/member-requests");
    expect(removeUrl(g, "Ana Lee")).toBe("https://www.facebook.com/groups/123/members?search=Ana%20Lee");
    expect(groupUrl({ FB_GROUP_URL: "https://evil.example/groups/1" })).toBeNull();
  });
});

describe("moving between lists", () => {
  const ev = (kind: GroupEvent["kind"], m: number): GroupEvent => ({ userId: "u1", kind, at: new Date(now + m * 60_000).toISOString() });
  it("paid -> approve -> member -> cancelled -> remove -> paid again -> approve", () => {
    expect(statusFrom([ev("activated", 1)]).get("u1")?.status).toBe("approve");
    expect(statusFrom([ev("activated", 1), ev("approved", 2)]).get("u1")?.status).toBe("member");
    expect(statusFrom([ev("activated", 1), ev("approved", 2), ev("deactivated", 3)]).get("u1")?.status).toBe("remove");
    expect(statusFrom([ev("activated", 1), ev("approved", 2), ev("deactivated", 3), ev("activated", 4)]).get("u1")?.status).toBe("approve");
    expect(statusFrom([ev("activated", 1), ev("approved", 2), ev("deactivated", 3), ev("removed", 4)]).get("u1")?.status).toBe("done");
  });
  it("cancelling before being let in just drops off the approve list", () => {
    expect(statusFrom([ev("activated", 1), ev("deactivated", 2)]).get("u1")?.status).toBe("done");
  });
  it("detects start and end of paid", () => {
    expect(transition(null, { plan: "starter", status: "active" })).toBe("activated");
    expect(transition({ plan: "starter", status: "past_due" }, { plan: "starter", status: "active" })).toBeNull();
    expect(transition({ plan: "starter", status: "active" }, { plan: "free", status: "canceled" })).toBe("deactivated");
    expect(transition({ plan: "free", status: "canceled" }, { plan: "growth", status: "active" })).toBe("activated");
  });
});

describe("activation email", () => {
  function fakeDeps(group: string | null = "https://www.facebook.com/groups/123") {
    const claimed = new Set<string>();
    const sent: string[] = [];
    const events: string[] = [];
    return {
      sent, events,
      deps: {
        group,
        addEvent: async (_u: string, k: string) => { events.push(k); },
        lookup: async () => ({ email: "ana@example.com", name: "Ana" }),
        // Mirrors notify(): one send per user, kind and key. No real email.
        notify: (async (u: { userId: string; email: string }, kind: string, key: string, build: (l: { baseUrl: string; unsubUrl: string; prefsUrl: string }) => { subject: string } | null) => {
          if (claimed.has(`${u.userId}:${kind}:${key}`)) return "skipped";
          claimed.add(`${u.userId}:${kind}:${key}`);
          const m = build({ baseUrl: "https://x", unsubUrl: "", prefsUrl: "" });
          if (m) sent.push(`${u.email}:${m.subject}`);
          return "sent";
        }) as never,
      },
    };
  }
  it("sends once per subscription activation, even if the webhook repeats", async () => {
    const f = fakeDeps();
    const u = { userId: "u1", email: "ana@example.com", name: "Ana" };
    expect((await onSubscriptionChange(u, "sub_1", null, { plan: "starter", status: "active" }, f.deps)).email).toBe("sent");
    expect((await onSubscriptionChange(u, "sub_1", { plan: "free", status: "incomplete" }, { plan: "starter", status: "active" }, f.deps)).email).toBe("skipped");
    expect((await onSubscriptionChange(u, "sub_1", { plan: "starter", status: "active" }, { plan: "starter", status: "active" }, f.deps)).change).toBeNull();
    expect(f.sent).toHaveLength(1);
    expect(f.sent[0]).toMatch(/members group/i);
    expect((await onSubscriptionChange(u, "sub_2", { plan: "free", status: "canceled" }, { plan: "growth", status: "active" }, f.deps)).email).toBe("sent");
    expect(f.sent).toHaveLength(2);
  });
  it("skips the email when no group link is set, but still lists them to approve", async () => {
    const f = fakeDeps(null);
    const r = await onSubscriptionChange({ userId: "u1" }, "sub_1", null, { plan: "starter", status: "active" }, f.deps);
    expect(r.email).toBe("no-group");
    expect(f.events).toEqual(["activated"]);
    expect(f.sent).toHaveLength(0);
  });
  it("cancelling adds a removal, no email", async () => {
    const f = fakeDeps();
    const r = await onSubscriptionChange({ userId: "u1", email: "a@b.co" }, "sub_1", { plan: "starter", status: "active" }, { plan: "free", status: "canceled" }, f.deps);
    expect(r).toEqual({ change: "deactivated", email: null });
    expect(f.events).toEqual(["deactivated"]);
  });
});

describe("digest email", () => {
  it("has both sections with a button per person and the dashboard button", () => {
    const m = digestEmail({ approve: [{ userId: "a", name: "Ana <b>", email: "ana@x.co" }], remove: [], link: (a, p) => `https://h/act/${a}/${p.userId}`, dashboardUrl: "https://h/admin/community" });
    expect(m.subject).toBe("Members group: 1 to approve, 0 to remove");
    expect(m.html).toContain("https://h/act/approve/a");
    expect(m.html).toContain("Ana &lt;b&gt;");
    expect(m.html).toContain("Open dashboard");
    expect(m.text).toContain("To remove (0)");
  });
});
