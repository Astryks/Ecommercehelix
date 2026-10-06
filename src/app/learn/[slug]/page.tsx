import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listModules, renderLessonPage } from "@/lib/learn";
import { LessonSteps, PROSE } from "@/components/learn/LessonSteps";
import { termsIn } from "@/lib/glossary";

export function generateStaticParams() {
  return listModules().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: renderLessonPage(slug)?.title ?? "Learn" };
}

export default async function LearnModule({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const mod = renderLessonPage(slug);
  if (!mod) notFound();
  const modules = listModules();
  const idx = modules.findIndex((m) => m.slug === slug);
  const meta = modules[idx];
  const prev = modules[idx - 1];
  const next = modules[idx + 1];
  const words = termsIn(mod.text, 14);
  return (
    <>
      <SiteHeader dark={false} />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
          <Link href="/learn" className="text-sm font-medium text-cyan-700 hover:underline">All modules</Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">In this module</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {meta.lessons.map((l) => (
              <li key={l.id}><a href={`#${l.id}`} className="text-slate-600 hover:text-slate-900">{l.title}</a></li>
            ))}
          </ul>
        </aside>
        <main className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Module {meta.number}</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight">{mod.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>{mod.lessonCount} lessons, {mod.stepCount} steps</span>
            <span aria-hidden>·</span>
            <span>One instruction at a time, each with the result to expect. Tick steps as you go; Helix remembers.</span>
          </div>
          <div className="mt-6">
            {mod.sections.map((s, i) =>
              s.kind === "lesson" ? (
                <LessonSteps key={s.lesson.id} lesson={s.lesson} />
              ) : (
                <article
                  key={i}
                  className={`${PROSE} prose-headings:scroll-mt-6 prose-p:my-4 prose-h2:mt-12 prose-h2:border-t prose-h2:border-slate-200 prose-h2:pt-8 [&_h2_a]:no-underline [&_h3_a]:no-underline [&_h2_a]:text-slate-900 [&_h3_a]:text-slate-900`}
                  dangerouslySetInnerHTML={{ __html: s.html }}
                />
              ),
            )}
          </div>
          {words.length > 0 && (
            <section aria-labelledby="words-title" className="mt-14 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 id="words-title" className="text-lg font-semibold">Words to know in this module</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm md:grid-cols-2">
                {words.map((w) => (
                  <div key={w.term}>
                    <dt className="font-semibold text-slate-900">{w.term}</dt>
                    <dd className="text-slate-600">{w.means}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/learn/words" className="mt-4 inline-block text-sm font-medium text-cyan-700 hover:underline">All words to know</Link>
            </section>
          )}
          <nav className="mt-14 flex justify-between gap-4 border-t border-slate-200 pt-6 text-sm" aria-label="Module navigation">
            {prev ? <Link href={`/learn/${prev.slug}`} className="text-cyan-700 hover:underline">← {prev.title}</Link> : <span />}
            {next ? <Link href={`/learn/${next.slug}`} className="text-cyan-700 hover:underline">{next.title} →</Link> : <span />}
          </nav>
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
