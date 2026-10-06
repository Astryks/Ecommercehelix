import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listModules, renderModule } from "@/lib/learn";

export function generateStaticParams() {
  return listModules().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: renderModule(slug)?.title ?? "Learn" };
}

export default async function LearnModule({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const mod = renderModule(slug);
  if (!mod) notFound();
  const modules = listModules();
  const idx = modules.findIndex((m) => m.slug === slug);
  const meta = modules[idx];
  const prev = modules[idx - 1];
  const next = modules[idx + 1];
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
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Module {meta.number}</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight">{mod.title}</h1>
          <article
            className="prose prose-slate mt-8 max-w-none prose-headings:scroll-mt-6 prose-a:text-cyan-700 prose-h2:mt-12 prose-h2:border-t prose-h2:border-slate-200 prose-h2:pt-8 prose-table:text-sm prose-th:bg-slate-50 prose-th:px-3 prose-td:px-3 [&_h2_a]:no-underline [&_h3_a]:no-underline [&_h2_a]:text-slate-900 [&_h3_a]:text-slate-900 [&_details]:rounded-xl [&_details]:bg-slate-50 [&_details]:p-4 [&_summary]:cursor-pointer [&_summary]:font-medium"
            dangerouslySetInnerHTML={{ __html: mod.html }}
          />
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
