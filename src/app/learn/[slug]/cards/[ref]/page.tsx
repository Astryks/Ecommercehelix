import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getDeck } from "@/lib/cards";
import { pageMeta } from "@/lib/seo";
import { CardPlayer } from "@/components/cards/CardPlayer";

export async function generateMetadata({ params }: PageProps<"/learn/[slug]/cards/[ref]">): Promise<Metadata> {
  const { slug, ref } = await params;
  const d = getDeck(ref);
  return pageMeta({ title: d ? `${d.title} as cards` : "Lesson cards", description: d ? `Lesson ${d.id} one small card at a time.` : "Lesson cards", path: `/learn/${slug}/cards/${ref}` });
}

/** Any lesson as a card deck, in the same player as the dashboard. Progress is kept on this device. */
export default async function LessonCards({ params }: PageProps<"/learn/[slug]/cards/[ref]">) {
  const { slug, ref } = await params;
  const d = getDeck(ref);
  if (!d || d.slug !== slug) notFound();
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
