/** Monthly ad account check, graded from synced Meta/Google data (or daily numbers), with the top 3 fixes for Today. */
import type { DayInput, Settings } from "../scorecard";
import { lastNDays, real, stats } from "./common";

export type CheckItem = { id: string; name: string; grade: "pass" | "warn" | "fail" | "skip"; detail: string; fix?: { title: string; href: string } };
export type AdCheck = { month: string; items: CheckItem[]; score: number; fixes: { id: string; title: string; href: string }[] };
export type AdSignals = { metaConnected: boolean; googleConnected: boolean; pixel: boolean; frequency: number | null; ctr: number | null; cpa: number | null; campaigns: number; activeAds: number | null; spend30: number };

export function adCheck(days: DayInput[], s: Settings, today: string, sig: AdSignals, breakEvenCpa: number | null): AdCheck {
  const st = stats(lastNDays(real(days), today, 30), s);
  const items: CheckItem[] = [];
  const add = (i: CheckItem) => items.push(i);
  add(sig.metaConnected || sig.googleConnected ? { id: "connected", name: "Ad accounts connected", grade: "pass", detail: "Helix can read your ad results." } : { id: "connected", name: "Ad accounts connected", grade: "fail", detail: "Helix cannot see your ads yet.", fix: { title: "Connect your ad accounts", href: "/dashboard/connect" } });
  if (sig.metaConnected) add(sig.pixel ? { id: "tracking", name: "Sales tracking (pixel)", grade: "pass", detail: "A pixel is picked." } : { id: "tracking", name: "Sales tracking (pixel)", grade: "fail", detail: "No pixel picked, so Meta cannot learn who buys.", fix: { title: "Pick your Meta pixel in Connections", href: "/dashboard/integrations" } });
  const mer = st.x.netRevenue ? st.x.merPct : null;
  add(mer === null ? { id: "mer", name: "Ad spend vs target", grade: "skip", detail: "No sales or ad spend in the last 30 days." } : mer <= s.targetMerPct ? { id: "mer", name: "Ad spend vs target", grade: "pass", detail: `MER ${mer.toFixed(1)}%, inside your ${s.targetMerPct}% target.` } : { id: "mer", name: "Ad spend vs target", grade: mer <= s.targetMerPct * 1.2 ? "warn" : "fail", detail: `MER ${mer.toFixed(1)}%, above your ${s.targetMerPct}% target.`, fix: { title: "Pause the ad with the highest cost per sale", href: "/dashboard/campaigns" } });
  if (sig.cpa !== null && breakEvenCpa) add(sig.cpa <= breakEvenCpa ? { id: "cpa", name: "Cost per sale", grade: "pass", detail: `$${sig.cpa.toFixed(0)} per sale, under break-even $${breakEvenCpa.toFixed(0)}.` } : { id: "cpa", name: "Cost per sale", grade: "fail", detail: `$${sig.cpa.toFixed(0)} per sale, over break-even $${breakEvenCpa.toFixed(0)}.`, fix: { title: "Cut budgets on ads above break-even cost per sale", href: "/learn/20-ad-analysis-audiences-and-setup" } });
  if (sig.frequency !== null) add(sig.frequency <= 3 ? { id: "frequency", name: "Ad tiredness (frequency)", grade: "pass", detail: `People see your ads ${sig.frequency.toFixed(1)} times on average.` } : { id: "frequency", name: "Ad tiredness (frequency)", grade: "warn", detail: `People see your ads ${sig.frequency.toFixed(1)} times. They may be tired of them.`, fix: { title: "Add two fresh ads to your best campaign", href: "/learn/05-creative-strategy" } });
  if (sig.ctr !== null) add(sig.ctr >= 1 ? { id: "ctr", name: "Clicks (CTR)", grade: "pass", detail: `${sig.ctr.toFixed(2)}% of people click.` } : { id: "ctr", name: "Clicks (CTR)", grade: "warn", detail: `Only ${sig.ctr.toFixed(2)}% click. The hook may be weak.`, fix: { title: "Write three new opening lines for your ads", href: "/learn/05-creative-strategy" } });
  if (sig.campaigns > 6) add({ id: "structure", name: "Account set-up", grade: "warn", detail: `${sig.campaigns} campaigns split your budget thin.`, fix: { title: "Merge small campaigns into one or two", href: "/learn/06-defining-campaigns" } });
  else if (sig.campaigns > 0) add({ id: "structure", name: "Account set-up", grade: "pass", detail: `${sig.campaigns} campaigns. Simple is good.` });
  const graded = items.filter((i) => i.grade !== "skip");
  const score = graded.length ? Math.round((graded.reduce((a, i) => a + (i.grade === "pass" ? 1 : i.grade === "warn" ? 0.5 : 0), 0) / graded.length) * 100) : 0;
  const order = { fail: 0, warn: 1, pass: 2, skip: 3 };
  const fixes = [...items].sort((a, b) => order[a.grade] - order[b.grade]).filter((i) => i.fix).slice(0, 3).map((i) => ({ id: i.id, ...i.fix! }));
  return { month: today.slice(0, 7), items, score, fixes };
}
