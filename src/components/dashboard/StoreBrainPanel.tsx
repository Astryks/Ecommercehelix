"use client";

import { useState, useTransition } from "react";
import { Brain, Trash2 } from "lucide-react";
import { coachMemoryAdd, coachMemoryDelete, coachMemoryEdit } from "@/app/dashboard/coach-actions";
import { MEMORY_KINDS, MEMORY_LABEL, type MemoryFact, type MemoryKind } from "@/lib/coach/memory";

/** Store Brain: a read-only-at-a-glance view of what Helix remembers about this store, with edit/delete per fact. Reuses the coach's own memory actions. */
export function StoreBrainPanel({ initialFacts }: { initialFacts: MemoryFact[] }) {
  const [facts, setFacts] = useState<MemoryFact[]>(initialFacts);
  const [kind, setKind] = useState<MemoryKind>("goals");
  const [text, setText] = useState("");
  const [pending, start] = useTransition();

  return (
    <section aria-labelledby="brain-h" className="card p-5 sm:p-6" data-testid="store-brain">
      <h2 id="brain-h" className="flex items-center gap-2 text-xl font-semibold text-slate-900"><Brain className="h-5 w-5 text-[#5A50D6]" aria-hidden /> Store Brain — what Helix remembers</h2>
      <p className="mt-1 text-sm text-slate-600">Facts about your business only — never your customers. The coach uses these to personalise today&apos;s tasks and answers. Change or delete anything.</p>
      {facts.length === 0 && <p className="mt-4 text-sm text-slate-500">Nothing yet. Chat with the coach about your store and goals and it will keep notes here.</p>}
      <ul className="mt-4 space-y-2">
        {facts.map((f) => (
          <li key={f.id ?? `${f.kind}:${f.key}`} className="rounded-xl border border-slate-200 p-2">
            <p className="text-xs font-semibold text-slate-500">{MEMORY_LABEL[f.kind]}</p>
            <input defaultValue={f.fact} maxLength={240} className="mt-1 w-full rounded border border-transparent px-1 py-0.5 text-sm hover:border-slate-200 focus:border-slate-300" aria-label="Edit note"
              onBlur={(e) => { const v = e.target.value.trim(); if (f.id && v && v !== f.fact) start(async () => setFacts(await coachMemoryEdit(f.id!, v))); }} />
            <button onClick={() => f.id && start(async () => setFacts(await coachMemoryDelete(f.id!)))} className="mt-1 inline-flex items-center gap-1 text-xs text-rose-700 hover:underline"><Trash2 className="h-3 w-3" aria-hidden /> Delete</button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(e) => { e.preventDefault(); const v = text.trim(); if (!v) return; setText(""); start(async () => setFacts(await coachMemoryAdd(kind, v))); }}
      >
        <select value={kind} onChange={(e) => setKind(e.target.value as MemoryKind)} className="rounded-xl border border-slate-300 px-2 py-2 text-sm" aria-label="Fact type">
          {MEMORY_KINDS.map((k) => <option key={k} value={k}>{MEMORY_LABEL[k]}</option>)}
        </select>
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={240} placeholder="Add a fact, e.g. Goal: reach $1M this year" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" aria-label="Add a fact" />
        <button type="submit" disabled={pending || !text.trim()} className="btn-ghost text-sm disabled:opacity-50">Add</button>
      </form>
      {facts.length > 0 && <button onClick={() => confirm("Delete everything Helix remembers?") && start(async () => setFacts(await coachMemoryDelete("all")))} className="mt-3 text-xs text-rose-700 underline">Delete all</button>}
    </section>
  );
}
