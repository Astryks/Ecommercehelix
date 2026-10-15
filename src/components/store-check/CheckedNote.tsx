"use client";
import { useSearchParams } from "next/navigation";

const TEXT: Record<string, string> = {
  running: "A check is already running. Give it a minute, then refresh.",
  wait: "The last check did not work. Please wait 10 minutes, then try again.",
  recent: "You checked in the last 6 hours. Try again a bit later.",
};

/** Plain note after "Check my store now" was paused. */
export function CheckedNote() {
  const t = TEXT[useSearchParams().get("checked") ?? ""];
  return t ? <p className="mt-1 text-xs text-slate-600" role="status">{t}</p> : null;
}
