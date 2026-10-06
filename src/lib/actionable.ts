import { DAYS, dayTaskId } from "./seed/curriculum";
import { FLOWS } from "./seed/flows";
import { EXAMPLE_SIGNALS, runRules } from "./audit";
import type { PlanId } from "./plans";

export type Actionable = { id: string; title: string; detail: string; tier: PlanId; estAiCost: number };

/** Resolve anything that can be delegated with "Do it for me": a curriculum day, an insight or an email flow. */
export function findActionable(id: string): Actionable | null {
  const day = DAYS.find((d) => dayTaskId(d.day) === id);
  if (day?.doIt)
    return {
      id,
      title: `Day ${day.day}: ${day.doIt.label}`,
      detail: `Helix prepared "${day.title}". Here is the plan. Nothing goes live until you approve.\n\n` + day.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
      tier: day.doIt.tier,
      estAiCost: Math.round(day.minutes * 0.2) / 100 + 0.01,
    };
  if (id.startsWith("insight-")) {
    const ins = runRules(EXAMPLE_SIGNALS).find((i) => `insight-${i.id}` === id);
    if (ins?.doIt)
      return {
        id,
        title: `Insight: ${ins.doIt.label}`,
        detail: `${ins.title}\n\nEvidence:\n` + ins.evidence.map((e) => `- ${e.label}: ${e.value}${e.benchmark ? ` (${e.benchmark})` : ""}`).join("\n") + `\n\nHelix will:\n` + ins.fix.map((f, i) => `${i + 1}. ${f}`).join("\n"),
        tier: ins.doIt.tier,
        estAiCost: ins.doIt.estAiCost,
      };
  }
  if (id === "build-meta-campaign")
    return {
      id,
      title: "Build a cold test campaign in your Meta account (paused)",
      detail: "Helix will create in your own ad account, all PAUSED:\n1. Campaign 03-Manual-Cold-Broad-Light-TEST-B16 (Sales, Purchase)\n2. One ad set: broad, AU, 18 to 65+, purchasers 180d excluded, suggested budget written into the draft\n3. Four ads with 3 primary texts, 3 headlines and UTMs\n\nNothing spends until you open Ads Manager and press Launch. Helix never changes budgets on live campaigns.",
      tier: "starter",
      estAiCost: 0.05,
    };
  if (id.startsWith("flow-")) {
    const f = FLOWS.find((x) => `flow-${x.id}` === id);
    if (f)
      return {
        id,
        title: `Set up the ${f.name.toLowerCase()} flow`,
        detail: `Trigger: ${f.trigger}\nExit when: ${f.exitWhen}\nDiscount rule: ${f.discount}\n\nMessages:\n` + f.emails.map((e, i) => `${i + 1}. ${e.delay} · ${e.channel}${e.channel === "Email" ? ` · "${e.subject}"` : ""}\n   ${e.body}`).join("\n") + `\n\nOn approval Helix creates the templates and flow in your email platform as a draft, then switches it live after a final check.`,
        tier: f.tier,
        estAiCost: 0.02 * f.emails.length,
      };
  }
  return null;
}
