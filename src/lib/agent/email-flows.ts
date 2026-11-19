/**
 * Step 3 — Email flows (Job 5a of the pivot, §11).
 *
 * The 9 flows themselves live in src/lib/seed/flows.json (copy + timing,
 * from docs/email-automation.md). This module is the agent layer:
 * eligibility (replenishment only for consumables, VIP only once there are
 * repeat buyers), writing-rule validation, and the approval payload.
 *
 * Klaviyo stays drafts-only: no sending, no flow-creation API calls.
 * If Klaviyo is not connected, the output is copy + timing to paste, or a
 * guided click-by-click setup — labelled as such, never presented as a
 * live flow. Flows are created in draft status first, live only after a
 * final check.
 */
import { FLOWS, type Flow } from "../seed/flows";
import type { KlaviyoSummary } from "../klaviyo/config";

export const FLOW_IDS = FLOWS.map((f) => f.id);

/** Klaviyo's own flow kinds only cover 3 of the 9; the rest are matched by name in the summary's flowsOff list. */
const KLAVIYO_KIND_FOR_FLOW: Record<string, string> = {
  welcome: "welcome",
  "abandoned-checkout": "abandoned",
  "abandoned-cart": "abandoned",
  "post-purchase": "post-purchase",
};

export type FlowContext = {
  /** Klaviyo read summary, when connected. Null = not connected. */
  klaviyo: KlaviyoSummary | null;
  /** Does the store sell consumables (skincare, supplements, food, pet)? Null = not known yet. */
  isConsumable?: boolean | null;
  /** Does the store have repeat buyers yet? Null = not known yet. */
  hasRepeatBuyers?: boolean | null;
  /** Flow ids already approved for setup (approval queue). */
  approvedFlowIds: string[];
};

export type FlowStatus = {
  flow: Flow;
  /** Live in Klaviyo, off, missing, or draft (approved, not yet live). */
  status: "live" | "off" | "missing" | "draft";
  eligible: boolean;
  eligibilityReason: string;
  /** Copy + timing to paste when Klaviyo is not connected. */
  setupMode: "klaviyo-draft" | "copy-to-paste";
};

export function flowStatuses(ctx: FlowContext): FlowStatus[] {
  return FLOWS.map((flow) => {
    const kind = KLAVIYO_KIND_FOR_FLOW[flow.id];
    const liveInKlaviyo = Boolean(ctx.klaviyo && kind && ctx.klaviyo.flows[kind as keyof KlaviyoSummary["flows"]] === "live");
    const status: FlowStatus["status"] = liveInKlaviyo
      ? "live"
      : ctx.approvedFlowIds.includes(flow.id)
        ? "draft"
        : ctx.klaviyo && kind
          ? ctx.klaviyo.flows[kind as keyof KlaviyoSummary["flows"]] === "off" ? "off" : "missing"
          : "missing";
    let eligible = true;
    let eligibilityReason = "Ready to draft.";
    if (flow.id === "replenishment" && ctx.isConsumable === false) {
      eligible = false;
      eligibilityReason = "Replenishment is only for consumables (skincare, supplements, food, pet) — this store does not sell them.";
    }
    if (flow.id === "vip" && ctx.hasRepeatBuyers === false) {
      eligible = false;
      eligibilityReason = "VIP needs repeat buyers first — there are none yet, so there is nobody to recognise.";
    }
    return {
      flow, status, eligible, eligibilityReason,
      setupMode: ctx.klaviyo ? "klaviyo-draft" : "copy-to-paste",
    };
  });
}

/** The flows the email-gap rule should suggest first: missing + eligible, Welcome and Abandoned Checkout first. */
export function missingFlows(ctx: FlowContext): FlowStatus[] {
  const order = ["welcome", "abandoned-checkout", "abandoned-cart", "post-purchase", "browse-abandonment", "review-request", "replenishment", "win-back", "vip"];
  return flowStatuses(ctx)
    .filter((s) => s.status !== "live" && s.eligible)
    .sort((a, b) => order.indexOf(a.flow.id) - order.indexOf(b.flow.id));
}

// ---------- Writing rules (docs/email-automation.md) ----------

export type FlowViolation = { message: number; rule: string; detail: string };

/**
 * Validate a flow's copy against Helix's writing rules:
 * one goal + one main button (implicit in the copy), subject under 45
 * characters, SMS always carries opt-out, discount rules (welcome: the
 * incentive in email 1 only, never bigger later; abandoned checkout: no
 * discount in email 1).
 */
export function validateFlow(flow: Flow): FlowViolation[] {
  const out: FlowViolation[] = [];
  flow.emails.forEach((m, i) => {
    if (m.channel === "Email" && m.subject.length >= 45)
      out.push({ message: i + 1, rule: "subject-under-45", detail: `Subject is ${m.subject.length} characters: "${m.subject}". Keep it under 45.` });
    if (m.channel === "SMS" && !/STOP/i.test(m.body))
      out.push({ message: i + 1, rule: "sms-opt-out", detail: "SMS must carry an opt-out (Reply STOP to opt out)." });
    if (m.channel === "SMS" && !/\[link\]|http/i.test(m.body))
      out.push({ message: i + 1, rule: "sms-link", detail: "SMS needs a link to the store or cart." });
  });
  if (flow.id === "welcome") {
    // The incentive belongs in email 1 only. An SMS reminder of the same
    // code is allowed; a new or bigger code in a later email is not.
    const laterDiscount = flow.emails.slice(1).some((m) => m.channel === "Email" && /WELCOME10|10% off|discount|% off/i.test(m.body) && !/still waiting|code is still/i.test(m.body));
    if (laterDiscount) out.push({ message: 0, rule: "welcome-discount-once", detail: "The sign-up incentive belongs in email 1 only — never a bigger code later in the flow." });
  }
  if (flow.id === "abandoned-checkout") {
    const first = flow.emails[0];
    if (first && /discount|% off|free shipping|gift/i.test(first.body))
      out.push({ message: 1, rule: "checkout-no-discount-first", detail: "No discount in email 1 of abandoned checkout." });
  }
  return out;
}

/** Approval payload for "Draft and set up this flow": full copy, timing, discount logic, setup mode. */
export function flowApproval(flow: Flow, ctx: FlowContext): { taskId: string; title: string; detail: string; estAiCost: number } {
  const st = flowStatuses(ctx).find((s) => s.flow.id === flow.id);
  const messages = flow.emails.map((m, i) => `${i + 1}. ${m.delay} — ${m.channel}${m.subject ? `: "${m.subject}"` : ""}\n   ${m.body}`).join("\n");
  return {
    taskId: `flow-${flow.id}`,
    title: `Draft ${flow.name} (${flow.emails.length} messages)`,
    detail:
      `Trigger: ${flow.trigger}\nGoal: ${flow.goal}\nExit when: ${flow.exitWhen}\nDiscount rule: ${flow.discount}\nWhat good looks like: ${flow.benchmark}\n\n${messages}\n\n` +
      (st?.setupMode === "klaviyo-draft"
        ? "On approval, Helix creates the templates and the flow in Klaviyo in DRAFT status first. It goes live only after a final check by you. Nothing is sent without that check."
        : "Klaviyo is not connected, so this is copy + timing to paste into your email tool (for example Shopify Email), with a guided click-by-click setup. It is NOT a live flow — the page labels it as copy to paste."),
    estAiCost: 0.11, // docs/pricing.md: flow draft (5 emails) $0.110
  };
}
