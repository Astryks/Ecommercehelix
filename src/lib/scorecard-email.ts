import { derive, sum, type DayInput, type Settings } from "./scorecard";
import { addDays } from "./dates";

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

export type ScorecardEmail = { subject: string; text: string } | null;

/** The Monday scorecard: last week (Mon to Sun) against the week before, in plain words. Null when there is nothing real to report. */
export function buildScorecardEmail(days: DayInput[], settings: Settings, monday: string, opts: { name?: string; baseUrl: string }): ScorecardEmail {
  const real = days.filter((d) => !d.example);
  const inRange = (from: string, to: string) => real.filter((d) => d.date >= from && d.date <= to);
  const last = inRange(addDays(monday, -7), addDays(monday, -1));
  const prev = inRange(addDays(monday, -14), addDays(monday, -8));
  if (!last.length) return null;
  const a = derive(sum(last), settings, 7);
  const b = prev.length ? derive(sum(prev), settings, 7) : null;
  const change = (x: number, y: number | undefined) => (y === undefined || !y ? "" : ` (${x >= y ? "up" : "down"} ${Math.abs(Math.round(((x - y) / Math.abs(y)) * 100))}% on the week before)`);
  const hi = opts.name ? `Hi ${opts.name.split(" ")[0]},` : "Hi,";
  const lines = [
    hi, "", "Here is your week in Helix.", "",
    `Sales: ${money(a.netRevenue)}${change(a.netRevenue, b?.netRevenue)}`,
    `Profit after ads and costs: ${money(a.contribution)}${change(a.contribution, b?.contribution)}`,
    `Orders: ${sum(last).orders}`,
    a.adSpend ? `Ad spend: ${money(a.adSpend)} (MER ${a.merPct.toFixed(1)}%)` : "Ad spend: none recorded",
    "",
    a.contribution >= 0 ? "You kept money this week. Nice. Your next small step is waiting on Today." : "Costs were higher than sales this week. Open Numbers to see which day, then try the first step on Today.",
    "", `Open Helix: ${opts.baseUrl}/dashboard`,
    "", "You get this email on Mondays. To stop it, reply and tell us, and we will switch it off.",
  ];
  return { subject: `Your week: ${money(a.contribution)} profit on ${money(a.netRevenue)} sales`, text: lines.join("\n") };
}
