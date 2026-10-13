"use client";

import { useFormStatus } from "react-dom";

/** A submit button that shows a calm "working" message while the server action runs. */
export function PendingButton({ children, pending, className = "btn-primary px-6 py-3 text-base" }: { children: React.ReactNode; pending: string; className?: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button className={className} disabled={busy} aria-live="polite">
      {busy ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />{pending}</span> : children}
    </button>
  );
}
