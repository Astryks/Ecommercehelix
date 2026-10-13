"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, HeartHandshake } from "lucide-react";
import type { Card } from "@/lib/cards";

export type SetupValues = Record<string, string>;
type Props = {
  deckId: string;
  deckTitle: string;
  cards: Card[];
  start: number;
  lost?: boolean;
  nextHref?: string | null; // where Next goes after the last card
  lessonHref?: string | null;
  /** Signed-in player: save position (and setup answers) on the server. Otherwise localStorage. */
  onMove?: (deck: string, index: number, forward: boolean) => Promise<void>;
  onSetup?: (values: SetupValues) => Promise<void>;
  setup?: SetupValues;
  todayLeft?: number | null;
};

const LS = (deck: string) => `helix-cards-${deck}`;
const num = (s: string | undefined) => Math.max(0, Number(s) || 0);
const $ = (n: number) => (n < 0 ? "-" : "") + "$" + Math.abs(n).toFixed(2);

function Dots({ n, at }: { n: number; at: number }) {
  // Up to 12 dots; long decks show a window around the current card.
  const max = 12;
  const from = n <= max ? 0 : Math.min(Math.max(0, at - 5), n - max);
  const shown = Array.from({ length: Math.min(n, max) }, (_, i) => from + i);
  return (
    <div className="flex items-center justify-center gap-1.5" aria-label={`Card ${at + 1} of ${n}`} role="img">
      {from > 0 && <span className="text-xs text-slate-400">…</span>}
      {shown.map((i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full border-[1.5px] border-[#1A1718] ${i === at ? "bg-[#5A50D6] !border-[#5A50D6]" : i < at ? "bg-[#1A1718]/70" : "bg-transparent"}`} />
      ))}
      {from + max < n && <span className="text-xs text-slate-400">…</span>}
    </div>
  );
}

function Profit({ v }: { v: SetupValues }) {
  const price = num(v.price);
  const fees = Math.round(((price * num(v.feePct)) / 100 + num(v.feeFixed)) * 100) / 100;
  const extra = num(v.freightDuty) + num(v.packaging);
  const rows: [string, number][] = [
    ["Product cost", num(v.productCost)],
    ...(extra > 0 ? ([["Freight, duty and packaging (saved before)", extra]] as [string, number][]) : []),
    ["Posting it", num(v.shipToCustomer)],
    ["Payment fee", fees],
    ["Ads", num(v.marketingPerOrder)],
  ];
  const left = Math.round((price - rows.reduce((s, r) => s + r[1], 0)) * 100) / 100;
  const orders = Math.round(num(v.ordersPerMonth));
  return (
    <div className="space-y-3">
      <p>You sell {v.productName ? <strong>{v.productName}</strong> : "one item"} for <strong>{$(price)}</strong>. Then these come out:</p>
      <ul className="space-y-1">
        {rows.map(([l, c]) => (
          <li key={l} className="flex justify-between border-b border-dashed border-slate-300 py-1"><span>{l}</span><span>-{$(c)}</span></li>
        ))}
      </ul>
      <p className="text-lg">What&apos;s left from one order: <strong className={left < 0 ? "text-red-700" : ""}>{$(left)}</strong></p>
      {left < 0 ? (
        <p>That&apos;s below zero, so each order loses money right now. That&apos;s okay to find out. It&apos;s the first thing we&apos;ll fix together.</p>
      ) : (
        orders > 0 && <p>With about {orders} orders a month, that&apos;s about <strong>{$(left * orders)}</strong> a month, before monthly bills like your shop plan and apps.</p>
      )}
    </div>
  );
}

export function CardPlayer({ deckId, deckTitle, cards, start, lost = false, nextHref, lessonHref, onMove, onSetup, setup = {}, todayLeft = null }: Props) {
  const [i, setI] = useState(Math.min(start, cards.length - 1));
  const [values, setValues] = useState<SetupValues>(setup);
  const [typing, setTyping] = useState(true);
  const [pending, startT] = useTransition();
  const [moved, setMoved] = useState(0);

  useEffect(() => {
    if (onMove) return;
    try {
      const s = Number(localStorage.getItem(LS(deckId)));
      if (s > 0 && s < cards.length) setI(s);
    } catch { /* private mode */ }
  }, [deckId, cards.length, onMove]);

  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 450);
    return () => clearTimeout(t);
  }, [i]);

  const card = cards[i];
  const go = (to: number) => {
    const forward = to > i;
    if (to >= cards.length) {
      if (nextHref) window.location.href = nextHref;
      return;
    }
    if (to < 0) return;
    setI(to);
    if (forward) setMoved((m) => m + 1);
    try { localStorage.setItem(LS(deckId), String(to)); } catch { /* ignore */ }
    startT(async () => {
      if (forward && card.kind === "input" && onSetup) await onSetup(values);
      if (onMove) await onMove(deckId, to, forward);
    });
  };

  const field = card.field;
  const input = (k: string, label: string, opts: { text?: boolean; step?: string; prefix?: string; suffix?: string } = {}) => (
    <label className="mt-4 block">
      <span className="text-sm font-semibold">{label}</span>
      <span className="mt-1 flex items-center gap-2">
        {opts.prefix && <span className="text-lg">{opts.prefix}</span>}
        <input
          autoFocus
          className="w-full rounded-xl border-[1.5px] border-[#1A1718] bg-white px-4 py-3 text-lg"
          type={opts.text ? "text" : "number"}
          inputMode={opts.text ? "text" : "decimal"}
          min={0}
          step={opts.step ?? "0.01"}
          value={values[k] ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") go(i + 1); }}
        />
        {opts.suffix && <span className="text-lg">{opts.suffix}</span>}
      </span>
    </label>
  );

  const doneToday = todayLeft !== null && moved >= todayLeft && todayLeft > 0;

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{deckTitle}</p>
      <div className="mt-3"><Dots n={cards.length} at={i} /></div>
      <section className="card mt-5 min-h-[320px] p-7" aria-live="polite">
        {lost && card.simpleHtml && (
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><HeartHandshake className="h-4 w-4 text-[#5A50D6]" aria-hidden /> Okay, don&apos;t worry. Let&apos;s make this one even smaller.</p>
        )}
        <h2 className="font-hand text-3xl text-[#5A50D6]">{card.title}</h2>
        {typing ? (
          <p className="mt-4 flex gap-1" aria-label="Typing"><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400" /><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" /><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" /></p>
        ) : (
          <div className="mt-4 space-y-3 text-[17px] leading-relaxed text-[#1A1718] [&_a]:font-semibold [&_a]:text-cyan-700 [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_table]:text-sm">
            {card.kind === "profit" ? <Profit v={values} /> : <div dangerouslySetInnerHTML={{ __html: lost && card.simpleHtml ? card.simpleHtml : card.html }} />}
            {!lost && card.expectedHtml && (
              <div className="rounded-xl bg-emerald-50 p-4 text-[15px]"><p className="font-semibold">You&apos;ll know it worked when:</p><div dangerouslySetInnerHTML={{ __html: card.expectedHtml }} /></div>
            )}
            {!lost && card.watchHtml && (
              <div className="rounded-xl bg-amber-50 p-4 text-[15px]"><p className="font-semibold">Careful:</p><div dangerouslySetInnerHTML={{ __html: card.watchHtml }} /></div>
            )}
            {field === "productName" && input("productName", "I sell…", { text: true })}
            {field && field !== "productName" && field !== "fees" && input(field, field === "ordersPerMonth" ? "Orders a month" : "Amount", field === "ordersPerMonth" ? { step: "1" } : { prefix: "$" })}
            {field === "fees" && (
              <div className="grid grid-cols-2 gap-3">
                {input("feePct", "Percent", { suffix: "%" })}
                {input("feeFixed", "Plus per order", { prefix: "$" })}
              </div>
            )}
          </div>
        )}
      </section>
      {doneToday && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-sm">That&apos;s today&apos;s cards done. Lovely work. Come back tomorrow, or keep going if you feel like it.</p>
      )}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="btn-ghost disabled:opacity-30"><ArrowLeft className="h-4 w-4" aria-hidden /> Back</button>
        <span className="text-sm text-slate-500">{i + 1} of {cards.length}{pending ? " · saving" : ""}</span>
        <button type="button" onClick={() => go(i + 1)} disabled={i === cards.length - 1 && !nextHref} className="btn-primary disabled:opacity-30">{i === cards.length - 1 ? "Next deck" : "Next"} <ArrowRight className="h-4 w-4" aria-hidden /></button>
      </div>
      {lessonHref && <p className="mt-4 text-center text-sm"><Link href={lessonHref} className="text-cyan-700 underline">See the whole lesson on one page</Link></p>}
    </div>
  );
}
