import type { Rollup, ScoreDay } from "@/lib/scoreboard/core";

export type ChartMode = "day" | "week" | "month";
export type ChartPoint = { label: string; sales: number; profit: number };

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function dayLabel(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${SHORT[m - 1]}`;
}

/** Real (non-example kept, since demo shows example) days with any sales or costs. */
export function daySeries(days: ScoreDay[], last = 30): ChartPoint[] {
  return days.filter((d) => d.sales || d.costs).slice(-last).map((d) => ({ label: dayLabel(d.date), sales: Math.round(d.sales), profit: Math.round(d.profit) }));
}

export function rollupSeries(rows: Rollup[] | undefined | null, last = 12): ChartPoint[] {
  return (rows ?? []).filter((r) => r.sales || r.costs).slice(-last).map((r) => ({ label: r.label, sales: Math.round(r.sales), profit: Math.round(r.profit) }));
}

/** Plain one-liner under the chart, comparing the last point with the one before. No invented numbers. */
export function chartSentence(points: ChartPoint[], mode: ChartMode, what: "sales" | "profit"): string | null {
  if (points.length < 2) return null;
  const a = points[points.length - 2][what], b = points[points.length - 1][what];
  const unit = mode === "day" ? "day" : mode;
  const word = what === "sales" ? "Sales" : "Profit";
  if (b > a) return `${word} went up from the ${unit} before. Nice!`;
  if (b < a) return `${word} went down from the ${unit} before. That's normal sometimes. Keep going.`;
  return `${word} stayed the same as the ${unit} before.`;
}
