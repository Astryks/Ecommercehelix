import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { getDeck } from "@/lib/cards";
import { setupValues, userCards } from "@/lib/cards-user";
import { getAccount, saveCardState } from "@/lib/repo";
import { canOpenDeck, unlockHref } from "@/lib/paywall/access";
import { teaserFor } from "@/lib/paywall/teaser";
import { LockedLesson } from "@/components/paywall/LockedLesson";
import { isoDay } from "@/lib/dates";
import { CardPlayer } from "@/components/cards/CardPlayer";
import { saveCardPos, saveSetupAnswers } from "./actions";

export const metadata: Metadata = { title: "Your cards" };

export default async function CardsPage({ searchParams }: PageProps<"/dashboard/cards">) {
  const sp = await searchParams;
  const u = await requireUser("/dashboard/cards");
  let uc = await userCards(u.id);
  const want = typeof sp.deck === "string" ? sp.deck : null;
  const lost = sp.lost === "1";
  // "I'm lost" with no progress at all: start from Step 1, understand your business.
  const restart = lost && uc.fresh;
  if ((want && want !== uc.deck.id && getDeck(want)) || (restart && uc.deck.id !== "setup")) {
    const id = restart ? "setup" : want!;
    await saveCardState(u.id, { ...uc.state, deck: id, index: 0, day: uc.state.day || isoDay() });
    uc = await userCards(u.id);
  }
  const plan = (await getAccount(u.id)).plan;
  if (!canOpenDeck(plan, uc.deck.id)) {
    const t = teaserFor(uc.deck.id);
    return <div className="mx-auto max-w-3xl py-4">{t ? <LockedLesson t={t} unlockHref={unlockHref(true)} /> : <p>This lesson opens with Starter.</p>}</div>;
  }
  const setup = uc.deck.id === "setup" ? await setupValues(u.id) : undefined;
  return (
    <div className="py-4">
      <CardPlayer
        key={uc.deck.id + (lost ? "-lost" : "")}
        deckId={uc.deck.id}
        deckTitle={uc.deck.id === "setup" ? uc.deck.title : `Lesson ${uc.deck.id}: ${uc.deck.title}`}
        cards={uc.deck.cards}
        start={uc.index}
        lost={lost}
        nextHref={uc.nextDeck ? `/dashboard/cards?deck=${uc.nextDeck}` : null}
        lessonHref={uc.deck.slug ? `/learn/${uc.deck.slug}` : null}
        onMove={saveCardPos}
        onSetup={saveSetupAnswers}
        setup={setup}
        todayLeft={uc.todayLeft}
      />
    </div>
  );
}
