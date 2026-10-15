"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import type { AiState } from "@/app/dashboard/ai-actions";

const NOTE: Record<string, string> = {
  off: "AI write-ups are not switched on yet, so this is Helix's standard advice.",
  budget: "AI is paused for this month, so this is Helix's standard advice.",
  cap: "You have used this month's AI write-ups on your plan, so this is Helix's standard advice.",
  error: "The AI did not answer, so this is Helix's standard advice.",
};

/** A button (or a question box) that asks a server action for a short AI text, with a rule-based fallback. */
export function AiBox({ action, label, question, placeholder, defaultValue }: { action: (prev: AiState, form: FormData) => Promise<AiState>; label: string; question?: boolean; placeholder?: string; defaultValue?: string }) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <div>
      <form action={run} className={question ? "flex flex-col gap-2 sm:flex-row" : ""}>
        {question && <input name="q" maxLength={600} required defaultValue={defaultValue} placeholder={placeholder ?? "Where are you stuck?"} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />}
        <button className="btn-ghost whitespace-nowrap text-sm" disabled={pending}><Sparkles className="h-4 w-4 text-violet-600" aria-hidden /> {pending ? "Thinking..." : label}</button>
      </form>
      {state && (
        <div className="mt-3 rounded-xl bg-violet-50 p-3 text-sm text-slate-800">
          <p className="whitespace-pre-line">{state.text}</p>
          <p className="mt-2 text-xs text-slate-500">
            {state.source === "ai" ? `Written by AI from your own data. Check it before you use it.${state.left !== undefined ? ` ${state.left} AI uses left this month.` : ""}` : state.source === "cache" ? "Saved answer (did not use an AI credit)." : NOTE[state.reason ?? "off"] ?? ""}
          </p>
        </div>
      )}
    </div>
  );
}
