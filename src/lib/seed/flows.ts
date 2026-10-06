import data from "./flows.json";
import type { PlanId } from "../plans";

export type FlowMessage = { delay: string; channel: "Email" | "SMS"; subject: string; preview: string; body: string };
export type Flow = {
  id: string; name: string; trigger: string; goal: string; exitWhen: string; discount: string; benchmark: string;
  tier: PlanId; example: { status: string; revenue30d: number }; emails: FlowMessage[];
};

/** Email and SMS flows with draft copy (EXAMPLE status). Source: src/lib/seed/flows.json. */
export const FLOWS = data as Flow[];
