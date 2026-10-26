"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles, Brain, Trash2, Check } from "lucide-react";
import { coachAsk, coachMemoryDelete, coachMemoryEdit, coachOpen, coachTick } from "@/app/dashboard/coach-actions";
import type { CoachOpen } from "@/lib/coach/server";
import type { MemoryFact } from "@/lib/coach/memory";
import { MEMORY_LABEL } from "@/lib/coach/memory";

type Line = { role: "user" | "coach"; text: string; modeLabel?: string; tier?: string | null; links?: { title: string; href: string }[]; note?: string };

const MODE_STYLE: Record<string, string> = {
  "Your store": "bg-emerald-100 text-emerald-800",
  "Helix course": "bg-violet-100 text-violet-800",
  General: "bg-slate-200 text-slate-700",
};

/** Floating "Helix - Your business coach" chat. New chat each day; memory and tasks carry over. Mounted only when the feature flag is on. */
export function CoachWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "memory">("chat");
  const [data, setData] = useState<CoachOpen | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [facts, setFacts] = useState<MemoryFact[]>([]);
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  // ?coach=1 (from the welcome email) opens the coach straight away.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("coach") === "1") queueMicrotask(() => setOpen(true));
  }, []);

  useEffect(() => {
    if (!open || data) return;
    start(async () => {
      const d = await coachOpen();
      setData(d);
      setFacts(d.facts);
      setLines(d.messages.map((m) => {
        const meta = (m.meta ?? {}) as { modeLabel?: string; tier?: string; links?: { title: string; href: string }[] };
        return { role: m.role, text: m.text, modeLabel: meta.modeLabel, tier: meta.tier, links: meta.links };
      }));
    });
  }, [open, data]);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [lines, pending, open]);

  function ask(deep: boolean) {
    const text = q.trim();
    if (!text || pending) return;
    setQ("");
    setLines((l) => [...l, { role: "user", text }]);
    start(async () => {
      try {
        const a = await coachAsk(text, deep);
        const note = a.limited === "deep-cap" ? "No Deep dives left this month, so this is a quick answer." : a.limited ? undefined : `${a.left} messages left this month${a.deepLeft ? `, ${a.deepLeft} Deep dives` : ""}.`;
        setLines((l) => [...l, { role: "coach", text: a.text, modeLabel: a.limited && a.limited !== "deep-cap" ? undefined : a.modeLabel, tier: a.tier, links: a.links, note }]);
      } catch {
        setLines((l) => [...l, { role: "coach", text: "Sorry, something went wrong. Please try again." }]);
      }
    });
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-36 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#5A50D6] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#4a41c0] lg:bottom-20 lg:right-5" aria-label="Open Helix, your business coach">
          <MessageCircle className="h-5 w-5" aria-hidden /> Coach
        </button>
      )}
      {open && (
        <section role="dialog" aria-label="Helix - Your business coach" className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(640px,85vh)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-2xl">
          <header className="flex items-center justify-between rounded-t-2xl bg-[#1A1718] px-4 py-3 text-white pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-[#B9B3FF]" aria-hidden /> Helix - Your business coach</div>
            <div className="flex items-center gap-1">
              <button onClick={() => { const next = view === "chat" ? "memory" : "chat"; setView(next); if (next === "memory") start(async () => setFacts((await coachOpen()).facts)); }} className="rounded-lg p-1.5 hover:bg-white/10" aria-label={view === "chat" ? "What Helix remembers" : "Back to chat"} title={view === "chat" ? "What Helix remembers" : "Back to chat"}><Brain className="h-4 w-4" aria-hidden /></button>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Close coach"><X className="h-5 w-5" aria-hidden /></button>
            </div>
          </header>

          {view === "memory" ? (
            <div className="flex-1 overflow-y-auto p-4 text-sm">
              <p className="text-slate-600">What Helix remembers about your business. It never stores details about your customers. Change or delete anything.</p>
              {facts.length === 0 && <p className="mt-4 text-slate-500">Nothing yet. Chat with me about your store and goals and I&apos;ll keep notes here.</p>}
              <ul className="mt-3 space-y-2">
                {facts.map((f) => (
                  <li key={f.id ?? f.key} className="rounded-xl border border-slate-200 p-2">
                    <p className="text-xs font-semibold text-slate-500">{MEMORY_LABEL[f.kind]}</p>
                    <input defaultValue={f.fact} maxLength={240} className="mt-1 w-full rounded border border-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-300" aria-label="Edit note"
                      onBlur={(e) => { const v = e.target.value.trim(); if (f.id && v && v !== f.fact) start(async () => setFacts(await coachMemoryEdit(f.id!, v))); }} />
                    <button onClick={() => f.id && start(async () => setFacts(await coachMemoryDelete(f.id!)))} className="mt-1 inline-flex items-center gap-1 text-xs text-rose-700 hover:underline"><Trash2 className="h-3 w-3" aria-hidden /> Delete</button>
                  </li>
                ))}
              </ul>
              {facts.length > 0 && <button onClick={() => confirm("Delete everything Helix remembers?") && start(async () => setFacts(await coachMemoryDelete("all")))} className="mt-4 text-xs text-rose-700 underline">Delete all</button>}
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7F6F2] p-4 text-sm">
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-slate-800 shadow-sm">
                  <p className="whitespace-pre-line">{data?.greeting ?? "Hi, I'm here to help you grow your business. Ask me anything!"}</p>
                  {data && data.tasks.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {data.tasks.map((t) => (
                        <li key={t.id} className="flex items-start gap-2">
                          <button onClick={() => { const done = !t.done; setData({ ...data, tasks: data.tasks.map((x) => (x.id === t.id ? { ...x, done } : x)) }); start(() => coachTick(t.id, done)); }}
                            className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${t.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400 bg-white"}`} aria-label={t.done ? `Mark not done: ${t.title}` : `Mark done: ${t.title}`}>
                            {t.done && <Check className="h-3 w-3" aria-hidden />}
                          </button>
                          <span><Link href={t.href} className={`font-medium underline-offset-2 hover:underline ${t.done ? "text-slate-400 line-through" : "text-slate-900"}`}>{t.title}</Link><span className="block text-xs text-slate-500">{t.why}</span></span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {lines.map((l, i) => l.role === "user" ? (
                  <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#5A50D6] p-3 text-white">{l.text}</div>
                ) : (
                  <div key={i} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-slate-800 shadow-sm">
                    {l.modeLabel && <span className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${MODE_STYLE[l.modeLabel] ?? MODE_STYLE.General}`}>{l.modeLabel}{l.tier === "deep" ? " · Deep dive" : ""}</span>}
                    <p className="whitespace-pre-line">{l.text}</p>
                    {l.links && l.links.length > 0 && (
                      <div className="mt-2 border-t border-slate-100 pt-2">
                        <p className="text-xs font-semibold text-slate-500">Helix lessons</p>
                        <ul className="mt-1 space-y-0.5">{l.links.map((x) => <li key={x.href}><Link href={x.href} className="text-xs text-[#5A50D6] underline">{x.title}</Link></li>)}</ul>
                      </div>
                    )}
                    {l.note && <p className="mt-1.5 text-[11px] text-slate-400">{l.note}</p>}
                  </div>
                ))}
                {pending && <p className="text-xs text-slate-500">Helix is thinking...</p>}
                <div ref={end} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); ask(false); }} className="border-t border-slate-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="flex gap-2">
                  <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={1000} placeholder="Ask about your store or a lesson" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-base sm:text-sm" aria-label="Your question" />
                  <button type="submit" disabled={pending || !q.trim()} className="rounded-xl bg-[#5A50D6] px-3 text-white disabled:opacity-50" aria-label="Send"><Send className="h-4 w-4" aria-hidden /></button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <button type="button" onClick={() => ask(true)} disabled={pending || !q.trim()} className="inline-flex items-center gap-1 rounded-lg border border-[#5A50D6] px-2.5 py-1 text-xs font-semibold text-[#5A50D6] disabled:opacity-50"><Sparkles className="h-3 w-3" aria-hidden /> Deep dive</button>
                  <span className="text-[11px] text-slate-400">General education, not financial, legal or tax advice.</span>
                </div>
              </form>
            </>
          )}
        </section>
      )}
    </>
  );
}
