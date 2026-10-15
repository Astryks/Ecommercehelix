/**
 * Who may press "Check my store now", and when. Pure, so it is tested.
 * Free: the first check, then a retry after a failed one. Paid: again after 6 hours.
 * Everyone waits 10 minutes after a failed check, and one check runs at a time.
 */
export type Gate = "ok" | "running" | "upgrade" | "recent" | "wait";

export const HOURS_BETWEEN_MANUAL = 6;
export const MINUTES_AFTER_FAIL = 10;

export function checkGate(o: { last?: { ok: boolean; startedAt: string } | null; paid: boolean; running: boolean; now?: number }): Gate {
  const now = o.now ?? Date.now();
  if (o.running) return "running";
  const last = o.last;
  if (!last) return "ok";
  const age = now - Date.parse(last.startedAt);
  if (!last.ok) return age < MINUTES_AFTER_FAIL * 60_000 ? "wait" : "ok";
  if (!o.paid) return "upgrade";
  return age < HOURS_BETWEEN_MANUAL * 3_600_000 ? "recent" : "ok";
}
