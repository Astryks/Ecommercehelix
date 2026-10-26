import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StartCta } from "@/components/StartCta";
import { JsonLd } from "@/components/JsonLd";
import { FEATURES, featureBySlug } from "@/lib/content/features";
import { articleBySlug } from "@/lib/content/guides";
import { faqLd, pageMeta, serviceLd } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/features/[slug]">): Promise<Metadata> {
  const f = featureBySlug((await params).slug);
  return f ? pageMeta({ title: f.title, description: f.description, path: `/features/${f.slug}` }) : {};
}

export default async function FeaturePage({ params }: PageProps<"/features/[slug]">) {
  const f = featureBySlug((await params).slug);
  if (!f) notFound();
  const path = `/features/${f.slug}`;
  const others = FEATURES.filter((o) => o.slug !== f.slug);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pt-page pb-section">
        <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Features", path: "/features" }, { name: f.name, path }]} />
        <h1 className="mt-stack text-4xl text-slate-900 sm:text-5xl">{f.h1}</h1>
        <p className="mt-lead text-lg leading-8 text-slate-600">{f.intro}</p>
        {f.sections.map((s) => (
          <section key={s.h2} className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-900">{s.h2}</h2>
            {s.body.map((b) => <p key={b} className="mt-4 leading-7 text-slate-700">{b}</p>)}
            {s.list && <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
          </section>
        ))}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Which plan includes it</h2>
          <p className="mt-4 leading-7 text-slate-700">{f.plan} <Link className="text-cyan-800 underline" href="/#pricing">See pricing</Link>.</p>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Questions</h2>
          <dl className="mt-4 space-y-6">
            {f.faq.map((q) => (
              <div key={q.q}><dt className="font-semibold text-slate-900">{q.q}</dt><dd className="mt-2 leading-7 text-slate-700">{q.a}</dd></div>
            ))}
          </dl>
          <p className="mt-6"><Link className="text-cyan-800 underline" href="/faq">More answers in the FAQ</Link></p>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Related guides</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            {f.guides.map((g) => articleBySlug(g)).filter(Boolean).map((a) => <li key={a!.slug}><Link className="text-cyan-800 underline" href={`/guides/${a!.slug}`}>{a!.h1}</Link></li>)}
          </ul>
          <h2 className="mt-10 text-2xl font-semibold text-slate-900">More from Helix</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            {others.map((o) => <li key={o.slug}><Link className="text-cyan-800 underline" href={`/features/${o.slug}`}>{o.name}</Link></li>)}
          </ul>
        </section>
        <StartCta />
      </main>
      <SiteFooter />
      <JsonLd data={[serviceLd({ name: f.name, description: f.description, path, serviceType: f.serviceType }), faqLd(f.faq)]} />
    </>
  );
}
