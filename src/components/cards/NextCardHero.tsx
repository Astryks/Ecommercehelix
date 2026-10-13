import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { UserCards } from "@/lib/cards-user";

const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

/** The one clear path: the dashboard leads with the user's next card. */
export function NextCardHero({ uc, setup = null }: { uc: UserCards; setup?: "build" | "plan" | null }) {
  const card = uc.deck.cards[uc.index];
  const preview = plain(card.html).slice(0, 180);
  const label = uc.deck.id === "setup" ? uc.deck.title : `Lesson ${uc.deck.id}: ${uc.deck.title}`;
  return (
    <section className="card p-7" aria-labelledby="next-card-title">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your next card · {uc.todayLeft > 0 ? `${uc.todayLeft} of today's 3 cards left` : "today's 3 cards done"}</p>
      <p className="mt-1 text-sm text-slate-600">{label} · card {uc.index + 1} of {uc.deck.cards.length}</p>
      <h2 id="next-card-title" className="mt-3 font-hand text-3xl text-[#5A50D6]">{card.title}</h2>
      {preview && <p className="mt-2 text-[17px] text-[#1A1718]">{preview}{preview.length >= 180 ? "…" : ""}</p>}
      <Link href="/dashboard/cards" className="btn-primary mt-5 px-5 py-3">{uc.index === 0 && uc.fresh ? "Start" : "Open my card"} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      {setup && (
        <p className="mt-4 text-sm text-slate-600">
          Optional, any time: <Link href={setup === "build" ? "/start" : "/start?step=2"} className="font-semibold text-cyan-700 underline">answer a few questions</Link> so Helix can find what is holding your store back. About 2 minutes.
        </p>
      )}
    </section>
  );
}
