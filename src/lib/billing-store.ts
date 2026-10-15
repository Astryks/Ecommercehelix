import "server-only";
import { hasDb, prisma } from "./db";
import type { PlanId } from "./plans";

const toEnum = (p: PlanId) => p.toUpperCase() as "FREE" | "STARTER" | "GROWTH";

/** Record a Stripe event id. Returns false when it was already processed (webhook retries are ignored). */
export async function claimEvent(id: string, type: string): Promise<boolean> {
  if (!hasDb) return true;
  const r = await prisma.stripeEvent.createMany({ data: [{ id, type }], skipDuplicates: true });
  return r.count === 1;
}
/** Let Stripe retry if processing failed after the claim. */
export async function releaseEvent(id: string) {
  if (hasDb) await prisma.stripeEvent.deleteMany({ where: { id } });
}

export type SubRow = { userId: string; email: string; name: string; plan: PlanId; status: string; cancelAtPeriodEnd: boolean; currentPeriodEnd: Date | null; lastEventAt: Date | null; customerId: string | null; subscriptionId: string | null };
const fromEnum = (p: string) => p.toLowerCase() as PlanId;

export async function findSub(where: { subscriptionId?: string; customerId?: string; userId?: string }): Promise<SubRow | null> {
  if (!hasDb || !(where.subscriptionId || where.customerId || where.userId)) return null;
  const s = await prisma.subscription.findFirst({
    where: where.subscriptionId ? { stripeSubscriptionId: where.subscriptionId } : where.customerId ? { stripeCustomerId: where.customerId } : { userId: where.userId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!s) return null;
  return { userId: s.userId, email: s.user.email ?? "", name: s.user.name ?? "", plan: fromEnum(s.plan), status: s.status, cancelAtPeriodEnd: s.cancelAtPeriodEnd, currentPeriodEnd: s.currentPeriodEnd, lastEventAt: s.lastEventAt, customerId: s.stripeCustomerId, subscriptionId: s.stripeSubscriptionId };
}

export type SubPatch = Partial<{ plan: PlanId; status: string; cancelAtPeriodEnd: boolean; currentPeriodEnd: Date | null; priceId: string | null; customerId: string; subscriptionId: string; lastEventAt: Date }>;
export async function writeSub(userId: string, p: SubPatch) {
  if (!hasDb) return;
  const data = {
    ...(p.plan ? { plan: toEnum(p.plan) } : {}), ...(p.status ? { status: p.status } : {}),
    ...(p.cancelAtPeriodEnd !== undefined ? { cancelAtPeriodEnd: p.cancelAtPeriodEnd } : {}),
    ...(p.currentPeriodEnd !== undefined ? { currentPeriodEnd: p.currentPeriodEnd } : {}),
    ...(p.priceId !== undefined ? { priceId: p.priceId } : {}),
    ...(p.customerId ? { stripeCustomerId: p.customerId } : {}), ...(p.subscriptionId ? { stripeSubscriptionId: p.subscriptionId } : {}),
    ...(p.lastEventAt ? { lastEventAt: p.lastEventAt } : {}),
  };
  await prisma.subscription.upsert({ where: { userId }, create: { userId, ...data }, update: data });
}
