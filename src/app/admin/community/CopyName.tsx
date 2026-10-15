"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyName({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => { void navigator.clipboard?.writeText(name).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); }); }} aria-label={`Copy ${name}`}>
      {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />} {done ? "Copied" : "Copy name"}
    </button>
  );
}
