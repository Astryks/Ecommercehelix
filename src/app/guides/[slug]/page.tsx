import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StartCta } from "@/components/StartCta";
import { JsonLd } from "@/components/JsonLd";
import { ARTICLES, articleBySlug } from "@/lib/content/guides";
import { featureBySlug } from "@/lib/content/features";
import { articleLd, pageMeta } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  return a ? pageMeta({ title: a.title, description: a.description, path: `/guides/${a.slug}`, type: "article" }) : {};
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const path = `/guides/${a.slug}`;
  const html = marked.parse(a.body.replace(/^- \[ \] /gm, "- ☐ "), { async: false }) as string;
  const more = ARTICLES.filter((o) => o.slug !== a.slug).slice(0, 4);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pt-page pb-section">
        <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: a.h1, path }]} />
        <article>
          <h1 className="mt-block text-4xl text-slate-900 sm:text-5xl">{a.h1}</h1>
          <p className="mt-3 text-sm text-slate-500">Updated <time dateTime={a.updated}>{new Date(a.updated).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</time> · E-commerce Helix</p>
          <div className="prose prose-slate mt-8 max-w-none prose-a:text-cyan-800" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Tools that help</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            {a.features.map((s) => featureBySlug(s)).filter(Boolean).map((f) => <li key={f!.slug}><Link className="text-cyan-800 underline" href={`/features/${f!.slug}`}>{f!.name}</Link></li>)}
          </ul>
          <h2 className="mt-10 text-2xl font-semibold text-slate-900">More guides</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            {more.map((o) => <li key={o.slug}><Link className="text-cyan-800 underline" href={`/guides/${o.slug}`}>{o.h1}</Link></li>)}
          </ul>
        </section>
        <StartCta />
      </main>
      <SiteFooter />
      <JsonLd data={articleLd({ title: a.title, description: a.description, path, published: a.published, updated: a.updated })} />
    </>
  );
}
