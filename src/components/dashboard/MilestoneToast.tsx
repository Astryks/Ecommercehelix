"use client";
import { useEffect, useState } from "react";
import { PartyPopper, X } from "lucide-react";

/** A small celebration when a new achievement is reached. It is marked seen as soon as it shows. */
export function MilestoneToast({ title, note, keys, markSeen }: { title: string; note: string; keys: string[]; markSeen: (keys: string[]) => Promise<void> }) {
  const [open, setOpen] = useState(true);
  useEffect(() => { void markSeen(keys); }, [keys, markSeen]);
  if (!open) return null;
  return (
    <div role="status" className="celebrate fixed inset-x-4 top-4 z-50 mx-auto max-w-md overflow-hidden rounded-2xl border-[1.5px] border-[#5A50D6] bg-white p-4 shadow-lg">
      <span className="confetti" aria-hidden />
      <div className="relative flex items-start gap-3">
        <PartyPopper className="h-6 w-6 flex-none text-[#5A50D6]" aria-hidden />
        <div className="flex-1">
          <p className="font-hand text-xl text-cyan-700">Well done!</p>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-700">{note}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" aria-hidden /></button>
      </div>
    </div>
  );
}
