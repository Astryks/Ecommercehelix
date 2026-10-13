import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConsultCta } from "@/components/ConsultCta";
import { FEATURES } from "@/lib/content/features";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "E-commerce Growth Tools for Store Owners",
  description: "Everything E-commerce Helix does to grow your online store: profit dashboard, daily growth plan, Meta ads, email flows, Black Friday plan and store audit.",
  path: "/features",
});

export default function Features() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-14">
        <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Features", path: "/features" }]} />
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">E-commerce growth tools for store owners</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Helix is software that works like a growth expert by your side. It explains every step and only acts with your approval.</p>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.slug}>
              <Link href={`/features/${f.slug}`} className="card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <h2 className="text-lg font-semibold text-slate-900">{f.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{f.description}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10"><Link className="font-medium text-cyan-800 hover:underline" href="/guides">Read the free guides for e-commerce owners</Link></p>
        <ConsultCta />
      </main>
      <SiteFooter />
    </>
  );
}
