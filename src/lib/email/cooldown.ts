/**
 * One-off nudges (reorder, cash, product alerts) email at most once per trigger, then stay quiet for a cooldown.
 * An alert is emailed only when it is newly open (refreshUser returns only new or reopened alerts) AND the same
 * alert key was not emailed in the last `days` days. Pure, so it can be tested without a database.
 */
export const ALERT_COOLDOWN_DAYS = 30;
const dayMs = 864e5;
const toDay = (d: string | Date) => Math.floor((typeof d === "string" ? Date.parse(d.slice(0, 10) + "T12:00:00Z") : d.getTime()) / dayMs);

export function emailableAlerts<T extends { key: string }>(fresh: T[], lastSent: Map<string, string | Date>, today: string, days = ALERT_COOLDOWN_DAYS): T[] {
  const t = toDay(today);
  return fresh.filter((a) => {
    const last = lastSent.get(a.key);
    return last === undefined || t - toDay(last) >= days;
  });
}
