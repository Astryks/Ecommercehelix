import { EXAMPLE_CAMPAIGNS } from "../campaigns";
import type { GraphResponse, Method, Transport } from "./graph";

/**
 * Mock Marketing API for running without a Meta app (META_MOCK=1 or no app configured in dev).
 * Returns fixture data shaped like real Graph API responses. Writes still pass the guardrail first.
 */

const ok = (body: unknown): GraphResponse => ({ status: 200, body, headers: { "x-business-use-case-usage": JSON.stringify({ "1111111111": [{ type: "ads_insights", call_count: 3, total_cputime: 2, total_time: 2, estimated_time_to_regain_access: 0 }] }) } });
const id = () => String(120200000000000 + Math.floor(Math.random() * 1e12));
const ACT = ["act_1111111111", "act_2222222222"];

const META_ROWS = EXAMPLE_CAMPAIGNS.filter((c) => c.channel === "Meta");
const campId = (i: number) => String(120210000000100 + i);

function isoDaysAgo(n: number) {
  const d = new Date(Date.now() - n * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function insightFor(c: (typeof META_ROWS)[number], scale = 1) {
  const r = (v: number) => String(Math.round(v * scale * 100) / 100);
  return {
    campaign_id: campId(META_ROWS.indexOf(c)), campaign_name: c.name,
    spend: r(c.spend), impressions: r(c.impressions), reach: r(c.impressions / c.frequency), frequency: String(c.frequency),
    inline_link_clicks: r(c.clicks * 1.3),
    outbound_clicks: [{ action_type: "outbound_click", value: r(c.clicks) }],
    actions: [
      { action_type: "omni_purchase", value: r(c.purchases) },
      { action_type: "landing_page_view", value: r(c.clicks * 0.8) },
      ...(c.threeSecViews ? [{ action_type: "video_view", value: r(c.threeSecViews) }] : []),
    ],
    action_values: [{ action_type: "omni_purchase", value: r(c.revenue) }],
    video_thruplay_watched_actions: c.threeSecViews ? [{ action_type: "video_view", value: r(c.threeSecViews * 0.35) }] : [],
  };
}

function sum(rows: ReturnType<typeof insightFor>[]) {
  const tot = (f: (x: ReturnType<typeof insightFor>) => number) => String(rows.reduce((s, x) => s + f(x), 0));
  const a = (x: ReturnType<typeof insightFor>, t: string) => Number(x.actions.find((y) => y.action_type === t)?.value ?? 0);
  return {
    spend: tot((x) => +x.spend), impressions: tot((x) => +x.impressions), reach: tot((x) => +x.reach), frequency: "1.9",
    inline_link_clicks: tot((x) => +x.inline_link_clicks),
    outbound_clicks: [{ action_type: "outbound_click", value: tot((x) => +x.outbound_clicks[0].value) }],
    actions: ["omni_purchase", "landing_page_view", "video_view"].map((t) => ({ action_type: t, value: tot((x) => a(x, t)) })),
    action_values: [{ action_type: "omni_purchase", value: tot((x) => +x.action_values[0].value) }],
    video_thruplay_watched_actions: [{ action_type: "video_view", value: tot((x) => +(x.video_thruplay_watched_actions[0]?.value ?? 0)) }],
  };
}

export const mockTransport: Transport = async (method: Method, url: string, body?: URLSearchParams) => {
  const u = new URL(url);
  const path = u.pathname.replace(/^\/v\d+\.\d+\//, "");
  const q = method === "GET" ? u.searchParams : (body ?? new URLSearchParams());

  if (path === "oauth/access_token") return ok({ access_token: `mock-token-${id()}`, token_type: "bearer", expires_in: 60 * 24 * 3600 });
  if (path === "me" && method === "GET") return ok({ id: "10000000001", name: "Demo store owner" });
  if (path === "me/permissions") {
    if (method === "DELETE") return ok({ success: true });
    return ok({ data: ["ads_management", "ads_read", "business_management", "pages_show_list", "pages_read_engagement", "instagram_basic"].map((p) => ({ permission: p, status: "granted" })) });
  }
  if (path === "me/adaccounts")
    return ok({ data: [
      { id: ACT[0], account_id: ACT[0].slice(4), name: "Linen Co. AU (mock)", currency: "AUD", timezone_name: "Australia/Sydney", account_status: 1 },
      { id: ACT[1], account_id: ACT[1].slice(4), name: "Linen Co. US (mock)", currency: "USD", timezone_name: "America/Los_Angeles", account_status: 1 },
    ] });
  if (path === "me/accounts")
    return ok({ data: [{ id: "100000000000333", name: "Linen Co. (mock page)", instagram_business_account: { id: "17841400000000444", username: "linenco.mock" } }] });

  const m = path.match(/^(act_\d+)\/(\w+)$/);
  if (m && method === "GET") {
    const edge = m[2];
    if (edge === "adspixels") return ok({ data: [{ id: "555000000000111", name: "Linen Co. Pixel (mock)", last_fired_time: new Date().toISOString() }] });
    if (edge === "campaigns")
      return ok({ data: META_ROWS.map((c, i) => ({
        id: campId(i), name: c.name, objective: "OUTCOME_SALES", status: c.status === "Paused" ? "PAUSED" : "ACTIVE",
        effective_status: c.status === "Paused" ? "PAUSED" : "ACTIVE", daily_budget: String(c.budget * 100),
        updated_time: new Date(Date.now() - c.daysSinceEdit * 86_400_000).toISOString(),
      })) });
    if (edge === "adsets")
      return ok({ data: META_ROWS.map((c, i) => ({ id: String(120220000000100 + i), campaign_id: campId(i), effective_status: "ACTIVE", learning_stage_info: { status: c.status === "Learning" ? "LEARNING" : "SUCCESS" } })) });
    if (edge === "insights") {
      const level = q.get("level");
      if (level === "campaign") return ok({ data: META_ROWS.map((c) => insightFor(c)) });
      if (q.get("time_increment") === "1")
        return ok({ data: Array.from({ length: 14 }, (_, k) => {
          const wobble = 0.85 + ((k * 37) % 30) / 100;
          return { ...sum(META_ROWS.map((c) => insightFor(c, wobble / 7))), date_start: isoDaysAgo(14 - k), date_stop: isoDaysAgo(14 - k) };
        }) });
      const prev = q.get("time_range") !== null;
      const s = sum(META_ROWS.map((c) => insightFor(c, prev ? 0.93 : 1)));
      return ok({ data: [{ ...s, frequency: prev ? "1.6" : "2.2", cpm: prev ? "10.40" : "12.20" }] });
    }
  }
  if (m && method === "POST") return ok({ id: id() });
  if (/^\d+$/.test(path) && method === "POST") return ok({ success: true });
  return { status: 400, body: { error: { message: `Mock has no fixture for ${method} ${path}`, code: 100 } }, headers: {} };
};
