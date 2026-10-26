/** Klaviyo (read-only private API key). Off unless KLAVIYO=1. Totals only: Helix never reads or stores profiles. */
export const KLAVIYO_BASE = "https://a.klaviyo.com/api";
export const KLAVIYO_REVISION = "2025-07-15";
/** Read scopes the key needs. Everything else stays "No access". */
export const KLAVIYO_SCOPES = ["Accounts: Read", "Campaigns: Read", "Flows: Read", "Lists: Read", "Metrics: Read"] as const;

export const klaviyoOn = (env: Record<string, string | undefined> = process.env) => env.KLAVIYO === "1" || env.KLAVIYO === "true";

/** Private keys start with pk_. Public site ids (6 chars) are not enough to read results. */
export function checkKeyShape(k: string): string | null {
  const t = k.trim();
  if (!t) return "Paste your private API key.";
  if (!/^pk_[A-Za-z0-9]{20,}$/.test(t)) return "That does not look like a Klaviyo private API key. It starts with pk_.";
  return null;
}

export type KlaviyoFlow = { id: string; name: string; status: string; trigger?: string | null };
export const FLOW_KINDS = [
  { kind: "welcome", label: "Welcome", re: /welcome|new subscriber|sign ?up/i },
  { kind: "abandoned", label: "Abandoned cart", re: /abandon|cart|checkout/i },
  { kind: "post-purchase", label: "Post-purchase", re: /post.?purchase|thank|after purchase|customer thank/i },
] as const;
export type FlowKind = (typeof FLOW_KINDS)[number]["kind"];

/** Which of the three key flows exist and are live. */
export function flowStatus(flows: KlaviyoFlow[]): Record<FlowKind, "live" | "off" | "missing"> {
  const out = {} as Record<FlowKind, "live" | "off" | "missing">;
  for (const k of FLOW_KINDS) {
    const m = flows.filter((f) => k.re.test(f.name));
    out[k.kind] = m.some((f) => f.status === "live") ? "live" : m.length ? "off" : "missing";
  }
  return out;
}

export type ReportRow = { groupings?: Record<string, string>; statistics?: Record<string, number> };
export type Totals = { revenue: number; sends: number; opens: number; clicks: number; conversions: number };
/** Sum a flow- or campaign-values report (email channel only). */
export function sumReport(rows: ReportRow[]): Totals {
  const t: Totals = { revenue: 0, sends: 0, opens: 0, clicks: 0, conversions: 0 };
  for (const r of rows) {
    if (r.groupings?.send_channel && r.groupings.send_channel !== "email") continue;
    const s = r.statistics ?? {};
    t.revenue += Number(s.conversion_value) || 0; t.sends += Number(s.recipients) || 0; t.opens += Number(s.opens_unique) || 0;
    t.clicks += Number(s.clicks_unique) || 0; t.conversions += Number(s.conversions) || 0;
  }
  t.revenue = Math.round(t.revenue * 100) / 100;
  return t;
}

export type KlaviyoSummary = { revenue30: number; flowRevenue30: number; campaignRevenue30: number; sends30: number; openRate: number; clickRate: number; conversions30: number; listSize: number; listGrowth30: number; flows: Record<FlowKind, "live" | "off" | "missing">; flowsOff: string[] };

/** "What to fix" items from the Klaviyo totals. */
export function klaviyoFixes(s: KlaviyoSummary): { id: string; title: string; why: string; href: string }[] {
  const out: { id: string; title: string; why: string; href: string }[] = [];
  const learn = "/dashboard/learn/klaviyo";
  if (s.flows.abandoned !== "live") out.push({ id: "kl-abandoned", title: "Turn on an abandoned cart email", why: "People who leave items in the cart are the easiest sales to win back. This flow is usually the top earner.", href: learn });
  if (s.flows.welcome !== "live") out.push({ id: "kl-welcome", title: "Turn on a welcome email", why: "New subscribers are most interested in the first few days. A welcome email with a small offer turns them into buyers.", href: learn });
  if (s.flows["post-purchase"] !== "live") out.push({ id: "kl-post", title: "Turn on a post-purchase email", why: "A thank-you and a tip after the order brings people back for a second order.", href: learn });
  if (s.sends30 > 500 && s.openRate < 0.2) out.push({ id: "kl-opens", title: "Fewer than 1 in 5 people open your emails", why: "Try shorter subject lines and remove people who have not opened in 90 days.", href: learn });
  if (s.listSize > 0 && s.listGrowth30 <= 0) out.push({ id: "kl-list", title: "Your email list did not grow this month", why: "Add a simple sign-up offer on your store so visitors join the list.", href: "/dashboard/store-check" });
  return out;
}
