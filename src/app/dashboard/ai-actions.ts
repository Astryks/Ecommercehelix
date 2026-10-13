"use server";

import { requireUser } from "@/lib/session";
import { getAccount, getProductName } from "@/lib/repo";
import { auditRuns } from "@/lib/site-audit/run";
import { starterCopy } from "@/lib/meta/drafts";
import { aiText, PROMPTS, type AiResult } from "@/lib/ai/service";
import { auditFallback, helpFallback } from "@/lib/ai/fallbacks";

export type AiState = (AiResult & { at: number }) | null;

/** Short write-up of the latest store check. Built from the saved findings on the server, never from client text. */
export async function aiAuditWriteup(_prev: AiState): Promise<AiState> {
  const u = await requireUser("/dashboard/insights");
  const run = (await auditRuns(u.id, 1))[0];
  const findings = (run?.findings ?? []).filter((f) => f.severity !== "good");
  const fallback = auditFallback(findings);
  if (!run || findings.length === 0) return { text: fallback, source: "rules", at: Date.now() };
  const prompt = `Store: ${run.url}\nFindings (severity, title, what we saw, fix):\n` + findings.slice(0, 12).map((f) => `- [${f.severity}] ${f.title} | saw: ${f.quote.slice(0, 200)} | fix: ${f.fix}`).join("\n");
  return { ...(await aiText(u.id, "audit", PROMPTS.audit, prompt, fallback)), at: Date.now() };
}

/** Ad copy drafts for the user's store and hero product. Text only: nothing is sent to an ad account. */
export async function aiAdCopy(_prev: AiState): Promise<AiState> {
  const u = await requireUser("/dashboard/campaigns/new");
  const [acct, product] = await Promise.all([getAccount(u.id), getProductName(u.id)]);
  const store = acct.storeUrl ?? "your store";
  const fallback = starterCopy(store).flatMap((c) => [`Primary: ${c.primary}`, `Headline: ${c.headline}`]).join("\n");
  const prompt = `Store website: ${store}\nHero product: ${product || "not given"}\nCountry: ${acct.country}\nWrite cold-audience ad copy drafts.`;
  return { ...(await aiText(u.id, "adcopy", PROMPTS.adcopy, prompt, fallback)), at: Date.now() };
}

/** "I'm lost": free-text help. */
export async function aiHelp(_prev: AiState, form: FormData): Promise<AiState> {
  const u = await requireUser("/dashboard");
  const q = String(form.get("q") ?? "").trim().slice(0, 600);
  if (q.length < 3) return { text: "Type a few words about where you are stuck.", source: "rules", at: Date.now() };
  const acct = await getAccount(u.id);
  const prompt = `Plan: ${acct.plan}. Store saved: ${acct.storeUrl ? "yes" : "no"}. Onboarded: ${acct.onboarded ? "yes" : "no"}.\nQuestion: ${q}`;
  return { ...(await aiText(u.id, "help", PROMPTS.help, prompt, helpFallback(q))), at: Date.now() };
}
