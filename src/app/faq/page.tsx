import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StartCta } from "@/components/StartCta";
import { JsonLd } from "@/components/JsonLd";
import { HOME_FAQ } from "@/lib/content/faq";
import { FEATURES } from "@/lib/content/features";
import { faqLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "FAQ: E-commerce Helix Questions Answered",
  description: "Answers to common questions about E-commerce Helix: who it is for, whether it is an agency or consultant, ad spend, platforms, pricing and results.",
  path: "/faq",
});

const ALL = [...HOME_FAQ, ...FEATURES.flatMap((f) => f.faq)];

export default function Faq() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-14">
        <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]} />
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Frequently asked questions</h1>
        <h2 className="mt-12 text-2xl font-semibold text-slate-900">About Helix</h2>
        <dl className="mt-4 space-y-6">
          {HOME_FAQ.map((f) => <div key={f.q}><dt className="font-semibold text-slate-900">{f.q}</dt><dd className="mt-2 leading-7 text-slate-700">{f.a}</dd></div>)}
        </dl>
        {FEATURES.map((f) => (
          <section key={f.slug} className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-900"><Link className="hover:underline" href={`/features/${f.slug}`}>{f.name}</Link></h2>
            <dl className="mt-4 space-y-6">
              {f.faq.map((q) => <div key={q.q}><dt className="font-semibold text-slate-900">{q.q}</dt><dd className="mt-2 leading-7 text-slate-700">{q.a}</dd></div>)}
            </dl>
          </section>
        ))}
        <StartCta />
      </main>
      <SiteFooter />
      <JsonLd data={faqLd(ALL)} />
    </>
  );
}
