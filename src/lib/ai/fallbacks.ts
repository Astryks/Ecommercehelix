import type { Finding } from "../site-audit/checks";

const RANK = { high: 0, medium: 1, low: 2, good: 3 } as const;

/** Rule-based write-up used when AI is off, capped or failing. */
export function auditFallback(findings: Finding[]): string {
  const open = findings.filter((f) => f.severity !== "good").sort((a, b) => RANK[a.severity] - RANK[b.severity]);
  if (open.length === 0) return "No store check yet, or nothing to fix. Run a store check first.";
  const high = open.filter((f) => f.severity === "high").length;
  return [`${open.length} things to fix${high ? `, ${high} of them high priority` : ""}. Start here:`, ...open.slice(0, 3).map((f, i) => `${i + 1}. ${f.title}: ${f.fix}`)].join("\n");
}

const HELP: [RegExp, string][] = [
  [/profit|margin|cost|cogs|fee/i, "Open Profit and finish profit setup (about 10 minutes). It shows your real profit per order and where each dollar goes."],
  [/ad|meta|facebook|instagram|campaign|roas|google/i, "Open Connections to link your ad accounts, then Campaigns to build a paused draft. Nothing spends until you press Launch in the ad platform."],
  [/shopify|order|sales|revenue|number|scorecard/i, "Open Scorecard and add yesterday's numbers (or connect Shopify under Connections when it is live). Two minutes a day is enough."],
  [/email|klaviyo|flow/i, "Open Email for the 9 flow blueprints with ready-to-paste copy."],
  [/traffic|conversion|cart|checkout|store|site|page/i, "Run the Store check under Insights. It reads your public pages and lists the top fixes in order."],
  [/stock|inventory|supplier/i, "Open Stock to see reorder dates from your on-hand counts and supplier lead times."],
];

export function helpFallback(q: string): string {
  const hit = HELP.find(([re]) => re.test(q));
  return (hit ? hit[1] : "Start on Today: it shows the one next step for your store. If you have not yet, finish profit setup, then add yesterday's numbers on Scorecard.") + " You can also browse Learn for step-by-step lessons.";
}
