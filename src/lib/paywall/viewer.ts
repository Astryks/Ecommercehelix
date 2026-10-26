import "server-only";
import { auth } from "@/auth";
import { ensureUser, getAccount } from "../repo";
import type { PlanId } from "../plans";
import { hasFullLearn } from "./access";

/** Who is looking at Learn content, without forcing a sign-in. Signed out = Free. */
export async function learnViewer(): Promise<{ signedIn: boolean; plan: PlanId; full: boolean }> {
  try {
    const s = await auth();
    if (!s?.user?.id) return { signedIn: false, plan: "free", full: false };
    const id = await ensureUser(s.user.id, s.user.email ?? "", s.user.name ?? "");
    const plan = (await getAccount(id)).plan;
    return { signedIn: true, plan, full: hasFullLearn(plan) };
  } catch (e) {
    console.error("[paywall] viewer lookup failed; treating as Free", (e as Error).message.slice(0, 200));
    return { signedIn: false, plan: "free", full: false };
  }
}
