import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MODULE_SLUGS, toCurrentRef } from "@/lib/lesson-alias";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getDeck } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { CardPlayer } from "@/components/cards/CardPlayer";
import { learnViewer } from "@/lib/paywall/viewer";
import { canOpenDeck, unlockHref } from "@/lib/paywall/access";
import { teaserFor } from "@/lib/paywall/teaser";
import { LockedLesson } from "@/components/paywall/LockedLesson";

export async function generateMetadata({ params }: PageProps<"/learn/[slug]/cards/[ref]">): Promise<Metadata> {
  const { slug, ref } = await params;
  const d = getDeck(ref);
  return pageMeta({ title: d ? `${d.title} as cards` : "Lesson cards", description: d ? `Lesson ${d.id} one small card at a time.` : "Lesson cards", path: `/learn/${slug}/cards/${ref}` });
}

/** Any lesson as a card deck, in the same player as the dashboard. Progress is kept on this device. */
export default async function LessonCards({ params }: PageProps<"/learn/[slug]/cards/[ref]">) {
  const { slug, ref } = await params;
  // A link from before the 26 Oct 2026 reorder: old module slug and old lesson number.
  if (MODULE_SLUGS[slug]) permanentRedirect(`/learn/${MODULE_SLUGS[slug]}/cards/${toCurrentRef(ref)}`);
  const d = getDeck(ref);
  if (!d || d.slug !== slug) notFound();
  const viewer = await learnViewer();
  if (!canOpenDeck(viewer.plan, d.id)) {
    const t = teaserFor(d.id);
    if (!t) notFound();
    return (<><SiteHeader dark={false} /><main className="mx-auto max-w-3xl px-5 py-12"><LockedLesson t={t} unlockHref={unlockHref(viewer.signedIn)} /></main><SiteFooter /></>);
  }
  return (
    <>
      <SiteHeader dark={false} />
      <main className="px-5 py-12">
        <CardPlayer deckId={d.id} deckTitle={`Lesson ${d.id}: ${d.title}`} cards={d.cards} start={0} lessonHref={`/learn/${slug}`} />
      </main>
      <SiteFooter />
    </>
  );
}
