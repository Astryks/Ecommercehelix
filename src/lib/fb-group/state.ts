/**
 * Who should be let into, or taken out of, the members Facebook group. Pure, so it is tested.
 * Every change is an event; the newest event for a person decides their state.
 */
export type GroupEventKind = "activated" | "approved" | "deactivated" | "removed" | "done";
export type GroupEvent = { userId: string; kind: GroupEventKind; at: string };
export type GroupStatus = "approve" | "remove" | "member" | "done";

/** The newest event wins. Paying again moves someone from "remove" back to "approve". */
export function statusFrom(events: GroupEvent[]): Map<string, { status: GroupStatus; since: string }> {
  const out = new Map<string, { status: GroupStatus; since: string; wasMember: boolean }>();
  for (const e of [...events].sort((a, b) => a.at.localeCompare(b.at))) {
    const cur = out.get(e.userId) ?? { status: "done" as GroupStatus, since: e.at, wasMember: false };
    if (e.kind === "activated") out.set(e.userId, { status: cur.status === "member" ? "member" : "approve", since: e.at, wasMember: cur.wasMember || cur.status === "member" });
    else if (e.kind === "approved") out.set(e.userId, { status: "member", since: e.at, wasMember: true });
    // Cancelled: only someone let into the group needs removing; a pending request just drops off.
    else if (e.kind === "deactivated") out.set(e.userId, { status: cur.status === "member" || cur.wasMember ? "remove" : "done", since: e.at, wasMember: cur.wasMember });
    else out.set(e.userId, { status: "done", since: e.at, wasMember: false });
  }
  return new Map([...out].map(([k, v]) => [k, { status: v.status, since: v.since }]));
}

/** Paid and active (past_due keeps access while the card is retried). */
export const isActivePaid = (plan: string | null | undefined, status: string | null | undefined) =>
  Boolean(plan && plan.toLowerCase() !== "free" && ["active", "trialing", "past_due"].includes(String(status)));

/** Did this Stripe update start (or restart) a paid membership, or end one? */
export function transition(before: { plan?: string | null; status?: string | null } | null, after: { plan: string; status: string }): "activated" | "deactivated" | null {
  const was = isActivePaid(before?.plan, before?.status);
  const now = isActivePaid(after.plan, after.status);
  return !was && now ? "activated" : was && !now ? "deactivated" : null;
}

export type CommunityAccess = { kind: "member"; url: string } | { kind: "soon" } | { kind: "locked" };
/** Who may see the members group link. Used by Plan and billing and the About page. */
export function communityAccess(acct: { plan?: string | null; status?: string | null } | null, url: string | null | undefined): CommunityAccess {
  if (!acct || !isActivePaid(acct.plan, acct.status)) return { kind: "locked" };
  return url ? { kind: "member", url } : { kind: "soon" };
}
