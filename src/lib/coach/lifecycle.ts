import "server-only";
import { hasDb, prisma } from "../db";
import { getAccount, getDays, getProfitSetup } from "../repo";
import { auditRuns } from "../site-audit/run";
import { waterfall } from "../profit-setup";
import { claimSend, unclaimSend } from "../email/prefs";
import { notify } from "../email/notify";
import { coachWelcomeEmail } from "../email/templates";
import type { PlanId } from "../plans";
import { coachEnabled } from "./config";
import { shouldWelcome, storeFacts, welcomeMessage, type StoreSummaryInput } from "./memory";
import { addMessage, saveFacts, today } from "./store";
import { openCoach } from "./server";
import { klaviyoSummary } from "../klaviyo/service";

/**
 * Learn the store: turn store totals (Shopify, numbers, store check, profit setup, Klaviyo) into coach memory.
 * Totals only, never customer details. Safe to call often; facts are upserted by key and never overwrite the owner's own edits.
 */
export async function learnStore(userId: string): Promise<number> {
  if (!coachEnabled()) return 0;
  try {
    const [shop, profit, days, runs, top, conns, email] = await Promise.all([
      hasDb ? prisma.shopifyConnection.findUnique({ where: { userId }, select: { shopName: true, shop: true, currency: true, productCount: true, status: true } }) : null,
      getProfitSetup(userId).catch(() => null),
      getDays(userId).catch(() => []),
      auditRuns(userId, 1).catch(() => []),
      hasDb ? prisma.productSale.groupBy({ by: ["name"], where: { userId, example: false }, _sum: { units: true }, orderBy: { _sum: { units: "desc" } }, take: 3 }).catch(() => []) : [],
      connectedChannels(userId),
      klaviyoSummary(userId).catch(() => null),
    ]);
    const last = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
    const sum = (f: (d: (typeof last)[number]) => number) => last.reduce((a, d) => a + (f(d) || 0), 0);
    const w = profit && profit.price > 0 ? waterfall(profit) : null;
    const run = runs[0];
    const input: StoreSummaryInput = {
      shopName: shop && shop.status === "active" ? shop.shopName || shop.shop : null, currency: shop?.currency ?? null, productCount: shop?.productCount ?? 0,
      last30: last.length ? { orders: sum((d) => d.orders), revenue: sum((d) => d.revenue), adSpend: sum((d) => d.adMeta + d.adGoogle + d.adTiktok + d.adOther), profit: w ? sum((d) => d.orders) * w.netPerOrder : null } : null,
      topProducts: top.map((t) => t.name).filter(Boolean),
      channels: conns,
      storeCheck: run?.ok && run.findings.length ? { score: Math.max(0, 100 - run.findings.filter((f) => f.severity === "high").length * 15 - run.findings.filter((f) => f.severity === "medium").length * 5), topIssue: run.findings.find((f) => f.severity === "high")?.title ?? run.findings.find((f) => f.severity === "medium")?.title ?? null } : null,
      profit: profit && profit.price > 0 ? { avgOrder: profit.price, margin: w ? w.beforeMarketing / profit.price : null } : null,
      email: email ? { revenue30: email.revenue30, listGrowth30: email.listGrowth30, flowsOff: email.flowsOff } : null,
    };
    const facts = storeFacts(input);
    if (facts.length) await saveFacts(userId, facts, [], "sync");
    return facts.length;
  } catch (e) {
    console.error("[coach] learnStore failed", (e as Error).message.slice(0, 200));
    return 0;
  }
}

async function connectedChannels(userId: string): Promise<string[]> {
  if (!hasDb) return [];
  const [meta, google, tiktok, shop, klav] = await Promise.all([
    prisma.metaConnection.findUnique({ where: { userId }, select: { userId: true } }).catch(() => null),
    prisma.googleAdsConnection.findUnique({ where: { userId }, select: { userId: true } }).catch(() => null),
    prisma.tikTokConnection.findUnique({ where: { userId }, select: { userId: true } }).catch(() => null),
    prisma.shopifyConnection.findUnique({ where: { userId }, select: { status: true } }).catch(() => null),
    prisma.klaviyoConnection.findUnique({ where: { userId }, select: { status: true } }).catch(() => null),
  ]);
  return [shop?.status === "active" && "Shopify", meta && "Meta ads", google && "Google Ads", tiktok && "TikTok ads", klav?.status === "active" && "Klaviyo"].filter(Boolean) as string[];
}

/** shouldWelcome: true for a live paid Starter/Growth sub. The welcome itself is once per subscription id, so repeats are safe. */
export { shouldWelcome };

/**
 * Welcome on subscribe: once per subscription (claimed in EmailSent as kind "coach-welcome-chat"), the coach posts a first
 * message in the coach window, and a welcome email goes out through notify (its own once-per-key claim).
 */
export async function coachWelcome(userId: string, subId: string, plan: PlanId): Promise<{ chat: boolean; email: string }> {
  if (!coachEnabled()) return { chat: false, email: "off" };
  const label = plan === "growth" ? "Growth" : "Starter";
  let chat = false;
  try {
    await learnStore(userId);
    if (await claimSend(userId, "coach-welcome-chat", subId)) {
      try {
        const acct = await getAccount(userId);
        await addMessage(userId, today(), "coach", welcomeMessage((acct.name || "").split(" ")[0] ?? "", label), { modeLabel: "Helix course", welcome: true });
        chat = true;
      } catch (e) { await unclaimSend(userId, "coach-welcome-chat", subId); throw e; }
    }
  } catch (e) { console.error("[coach] welcome chat failed", (e as Error).message.slice(0, 200)); }
  let email = "skipped";
  try {
    const u = hasDb ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }) : null;
    if (u?.email && process.env.EMAILS_LIVE === "1") {
      email = await notify({ userId, email: u.email, plan }, "coach-welcome", subId, async (l) => {
        const tasks = (await openCoach(userId)).tasks.map(({ title, href }) => ({ title, href }));
        return coachWelcomeEmail({ name: u.name ?? "", baseUrl: l.baseUrl, unsubUrl: l.unsubUrl, prefsUrl: l.prefsUrl }, label, tasks);
      });
    }
  } catch (e) { console.error("[coach] welcome email failed", (e as Error).message.slice(0, 200)); }
  return { chat, email };
}
