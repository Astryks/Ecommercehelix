"use client";
import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import type { ContactResult } from "@/lib/contact";

const TOPICS = ["General question", "Billing and plans", "Technical problem", "Connecting my store or ads", "Feedback or idea", "Privacy or data"];

export function ContactForm({ action, name = "", email = "", topic = "" }: {
  action: (p: ContactResult | null, f: FormData) => Promise<ContactResult>;
  name?: string; email?: string; topic?: string;
}) {
  const [state, run, pending] = useActionState(action, null);
  if (state?.ok) {
    return (
      <div className="card p-6" role="status" data-testid="contact-sent">
        <p className="flex items-center gap-2 font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" aria-hidden /> Thanks, your message is on its way.</p>
        <p className="mt-2 text-sm text-slate-600">A real person replies to your email, usually within one business day.</p>
      </div>
    );
  }
  // Keep what was typed when the server sends the form back with an error.
  const kept = state?.values;
  const field = "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200";
  return (
    <form key={state ? JSON.stringify(state.values ?? {}) : "new"} action={run} className="card space-y-4 p-6" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">Your name
          <input name="name" required maxLength={100} defaultValue={kept?.name ?? name} autoComplete="name" className={field} />
        </label>
        <label className="block text-sm font-semibold text-slate-800">Email
          <input name="email" type="email" required maxLength={200} defaultValue={kept?.email ?? email} autoComplete="email" className={field} />
        </label>
      </div>
      <label className="block text-sm font-semibold text-slate-800">Topic
        <select name="topic" required defaultValue={TOPICS.includes(kept?.topic ?? topic) ? (kept?.topic ?? topic) : ""} className={field}>
          <option value="" disabled>Pick one</option>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="block text-sm font-semibold text-slate-800">Message
        <textarea name="message" required minLength={10} maxLength={5000} rows={6} defaultValue={kept?.message ?? ""} className={field} placeholder="Tell us what you were trying to do and what happened. Screenshots help, we can ask for them by email." />
      </label>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {state?.error && <p className="text-sm font-medium text-rose-700" role="alert">{state.error}</p>}
      <button disabled={pending} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
        <Send className="h-4 w-4" aria-hidden /> {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
