import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StartCta } from "@/components/StartCta";
import { ARTICLES } from "@/lib/content/guides";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "E-commerce Growth Guides for Store Owners",
  description: "Free, practical guides for e-commerce owners: conversion rate, cart abandonment, Shopify growth, e-commerce SEO, break-even ROAS, email flows and scaling profitably.",
  path: "/guides",
});

export default function Guides() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-14">
        <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }]} />
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">E-commerce growth guides</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Plain-English answers to the questions store owners ask most. For step-by-step lessons, see <Link className="text-cyan-800 underline" href="/learn">the Helix Playbook</Link>.</p>
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <Link href={`/guides/${a.slug}`} className="card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <h2 className="text-lg font-semibold text-slate-900">{a.h1}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{a.description}</p>
              </Link>
            </li>
          ))}
        </ul>
        <StartCta />
      </main>
      <SiteFooter />
    </>
  );
}
