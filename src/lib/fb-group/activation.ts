import "server-only";
/** What happens when a paid membership starts or ends. The webhook calls this. */
import { notify } from "../email/notify";
import { hasDb, prisma } from "../db";
import { communityJoinEmail } from "../email/templates";
import type { PlanId } from "../plans";
import { addGroupEvent } from "./store";
import { groupUrl } from "./links";
import { transition } from "./state";

type Person = { email: string | null; name: string | null };
type Deps = { notify: typeof notify; addEvent: typeof addGroupEvent; group: string | null; lookup: (userId: string) => Promise<Person | null> };
const real = (): Deps => ({
  notify, addEvent: addGroupEvent, group: groupUrl(),
  lookup: async (id) => (hasDb ? prisma.user.findUnique({ where: { id }, select: { email: true, name: true } }) : null),
});

/**
 * Start: email the join link once per subscription (skipped when no group link is set; the digest says so)
 * and add them to "to approve" (which also takes them off "to remove"). End: move them to "to remove".
 */
export async function onSubscriptionChange(
  u: { userId: string; email?: string | null; name?: string | null },
  subId: string,
  before: { plan?: string | null; status?: string | null } | null,
  after: { plan: string; status: string },
  deps: Deps = real(),
): Promise<{ change: "activated" | "deactivated" | null; email: "sent" | "skipped" | "failed" | "off" | "no-group" | null }> {
  const change = transition(before, after);
  if (!change) return { change, email: null };
  await deps.addEvent(u.userId, change);
  if (change === "deactivated") return { change, email: null };
  if (!deps.group) return { change, email: "no-group" };
  const group = deps.group;
  if (!u.email) { const p = await deps.lookup(u.userId); u = { ...u, email: p?.email ?? null, name: u.name ?? p?.name ?? null }; }
  const email = u.email ? await deps.notify({ userId: u.userId, email: u.email, plan: after.plan.toLowerCase() as PlanId }, "community", `join:${subId}`, (l) => communityJoinEmail({ name: u.name ?? undefined, baseUrl: l.baseUrl }, group)) : "skipped";
  return { change, email };
}
