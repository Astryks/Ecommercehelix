import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listModules } from "@/lib/learn";

export const metadata: Metadata = { title: "Learn" };

export default function Learn() {
  const modules = listModules();
  return (
    <>
      <SiteHeader dark={false} />
      <main className="mx-auto w-full max-w-6xl px-5 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Learn</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">The Helix Playbook</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {modules.length} modules and {modules.reduce((a, m) => a + m.lessons.filter((l) => l.title.startsWith("Lesson")).length, 0)} lessons on running a profitable online store. Every daily task links to the lesson that explains it. Each module starts with a short &ldquo;In plain words&rdquo; box, and the drawings show where to click. Free for everyone.
        </p>
        <p className="mt-4">
          <Link href="/learn/words" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-cyan-800 hover:border-cyan-300">
            New to this? Start with the words to know (one line each)
          </Link>
        </p>
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <li key={m.slug}>
              <Link href={`/learn/${m.slug}`} className="card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Module {m.number}</span>
                <h2 className="mt-2 text-lg font-semibold">{m.title}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{m.plain}</p>
                <p className="mt-4 text-xs text-slate-500">{m.lessons.filter((l) => l.title.startsWith("Lesson")).length} lessons</p>
              </Link>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
