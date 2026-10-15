import { dayByTaskId } from "./tracks";
import { FLOWS } from "./seed/flows";
import { EXAMPLE_SIGNALS, runRules, type Signals } from "./audit";
import type { PlanId } from "./plans";

export type Actionable = { id: string; title: string; detail: string; tier: PlanId; estAiCost: number };

/** Resolve anything that can be delegated with "Do it for me": a curriculum day, an insight or an email flow. */
export function findActionable(id: string, signals: Signals = EXAMPLE_SIGNALS): Actionable | null {
  const found = dayByTaskId(id);
  const day = found?.day;
  if (day)
    return {
      id,
      title: `${found!.track.id === "starting" ? "Just starting, day" : "Day"} ${day.day}: ${day.doIt?.label ?? day.title}`,
      detail: `Here's your checklist for "${day.title}". Helix does not do these steps for you. Approving marks the task done.\n\n` + day.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
      tier: day.doIt?.tier ?? "starter",
      estAiCost: Math.round(day.minutes * 0.2) / 100 + 0.01,
    };
  if (id.startsWith("insight-")) {
    const ins = runRules(signals).find((i) => `insight-${i.id}` === id);
    if (ins?.doIt)
      return {
        id,
        title: `Insight: ${ins.doIt.label}`,
        detail: `${ins.title}\n\nEvidence:\n` + ins.evidence.map((e) => `- ${e.label}: ${e.value}${e.benchmark ? ` (${e.benchmark})` : ""}`).join("\n") + `\n\nHere's your checklist:\n` + ins.fix.map((f, i) => `${i + 1}. ${f}`).join("\n"),
        tier: ins.doIt.tier,
        estAiCost: ins.doIt.estAiCost,
      };
  }
  if (id === "build-google-campaign")
    return {
      id,
      title: "Build a Google Search test campaign in your Google Ads account (paused)",
      detail: "Helix will create in your own Google Ads account, PAUSED:\n1. A daily budget sized from your numbers (between 10 and 100 in your account currency)\n2. A Search campaign named Helix-Search-TEST-<date>, Maximise conversions, Google Search only\n\nYou then add ad groups, keywords and ads in Google Ads (the Guide me tab has the steps) and turn it on yourself. Nothing spends until you do. Helix never changes budgets on live campaigns.",
      tier: "starter",
      estAiCost: 0,
    };
  if (id === "build-meta-campaign")
    return {
      id,
      title: "Build a cold test campaign in your Meta account (paused)",
      detail: "Helix will create in your own ad account, all PAUSED:\n1. Campaign 03-Manual-Cold-Broad-Light-TEST-B16 (Sales, Purchase)\n2. One ad set: broad, your country, 18 to 65+, purchasers 180d excluded, suggested budget written into the draft\n3. Four ads with 3 primary texts, 3 headlines and UTMs\n\nNothing spends until you open Ads Manager and press Launch. Helix never changes budgets on live campaigns.",
      tier: "starter",
      estAiCost: 0.05,
    };
  if (id.startsWith("flow-")) {
    const f = FLOWS.find((x) => `flow-${x.id}` === id);
    if (f)
      return {
        id,
        title: `Copy for the ${f.name.toLowerCase()} flow`,
        detail: `Trigger: ${f.trigger}\nExit when: ${f.exitWhen}\nDiscount rule: ${f.discount}\n\nMessages:\n` + f.emails.map((e, i) => `${i + 1}. ${e.delay} · ${e.channel}${e.channel === "Email" ? ` · "${e.subject}"` : ""}\n   ${e.body}`).join("\n") + `\n\nHelix will give you this copy to paste into your email platform. Helix does not connect to Klaviyo or Shopify Email yet, so you build and switch on the flow yourself.`,
        tier: f.tier,
        estAiCost: 0.02 * f.emails.length,
      };
  }
  return null;
}
