import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = { title: "Words to know" };

export default function Words() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <>
      <SiteHeader dark={false} />
      <main className="mx-auto w-full max-w-4xl px-5 py-14">
        <Link href="/learn" className="text-sm font-medium text-cyan-700 hover:underline">All modules</Link>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Words to know</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Every tricky word in Helix, explained in one line. You do not need to learn them all. Come back here whenever a word is new.
        </p>
        <dl className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {terms.map((t) => (
            <div key={t.term} id={t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="grid gap-1 p-5 sm:grid-cols-[200px_1fr] sm:gap-6">
              <dt className="font-semibold text-slate-900">
                {t.term}
                {t.aka.length > 0 && <span className="block text-xs font-normal text-slate-500">also: {t.aka.join(", ")}</span>}
              </dt>
              <dd className="text-slate-600">{t.means}</dd>
            </div>
          ))}
        </dl>
      </main>
      <SiteFooter />
    </>
  );
}
