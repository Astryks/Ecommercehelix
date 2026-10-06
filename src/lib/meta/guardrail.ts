/**
 * The paused-only write guardrail. Every non-GET Marketing API call passes through
 * assertWriteAllowed() before it reaches the network, in live and mock mode alike.
 *
 * Allowed:
 *  - Create campaigns, ad sets and ads in an ad account, only with status "PAUSED".
 *  - Create ad creatives and ad images (they cannot spend on their own).
 *  - Pause an existing object: POST /{id} with exactly { status: "PAUSED" }.
 *  - Revoke our own app permissions on disconnect: DELETE /me/permissions.
 * Everything else throws, including any other status, any budget or bid change on an
 * existing object, deletes, copies and inline child specs. Every write needs approval.
 */

export class GuardrailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuardrailError";
  }
}

export type WriteRequest = { method: "POST" | "DELETE"; path: string; params: Record<string, unknown> };
export type WriteContext = { approved: boolean; purpose?: "draft" | "pause" | "disconnect" };

export const PAUSED = "PAUSED" as const;

const STATUS_KEYS = ["status", "configured_status", "effective_status"];
const INLINE_SPECS = ["adset_spec", "campaign_spec", "adset_specs", "execution_options", "status_option"];
export const BUDGET_KEYS = [
  "daily_budget", "lifetime_budget", "spend_cap", "bid_amount", "bid_strategy", "bid_constraints",
  "daily_spend_cap", "lifetime_spend_cap", "daily_min_spend_target", "lifetime_min_spend_target",
  "budget_rebalance_flag", "is_adset_budget_sharing_enabled", "budget_schedule_specs", "roas_average_floor",
];

const CREATE_DELIVERING = /^act_\d+\/(campaigns|adsets|ads)$/;
const CREATE_ASSET = /^act_\d+\/(adcreatives|adimages)$/;
const EXISTING_OBJECT = /^\d+$/;

function clean(path: string) {
  return path.replace(/^\/+/, "").replace(/\?.*$/, "");
}

export function assertWriteAllowed(req: WriteRequest, ctx: WriteContext): void {
  const path = clean(req.path);
  const p = req.params ?? {};
  if (!ctx?.approved) throw new GuardrailError(`Blocked ${req.method} ${path}: writes need the user's approval.`);

  if (req.method === "DELETE") {
    if (path === "me/permissions" && Object.keys(p).length === 0) return;
    throw new GuardrailError(`Blocked DELETE ${path}: Helix never deletes objects.`);
  }
  if (req.method !== "POST") throw new GuardrailError(`Blocked ${String(req.method)} ${path}.`);

  for (const k of INLINE_SPECS) if (k in p) throw new GuardrailError(`Blocked ${path}: "${k}" is not allowed.`);
  for (const k of STATUS_KEYS) {
    if (k in p && p[k] !== PAUSED) throw new GuardrailError(`Blocked ${path}: ${k} must be PAUSED, got ${JSON.stringify(p[k])}.`);
  }

  if (CREATE_DELIVERING.test(path)) {
    if (p.status !== PAUSED) throw new GuardrailError(`Blocked ${path}: new campaigns, ad sets and ads must be created with status PAUSED.`);
    return;
  }
  if (CREATE_ASSET.test(path)) return;

  if (EXISTING_OBJECT.test(path)) {
    for (const k of BUDGET_KEYS) if (k in p) throw new GuardrailError(`Blocked ${path}: budget and bid changes on existing objects are made by you in Ads Manager.`);
    const keys = Object.keys(p);
    if (keys.length === 1 && keys[0] === "status" && p.status === PAUSED) return;
    throw new GuardrailError(`Blocked ${path}: Helix may only pause an existing object (fields sent: ${keys.join(", ") || "none"}).`);
  }

  throw new GuardrailError(`Blocked POST ${path}: endpoint is not on the paused-draft allowlist.`);
}
