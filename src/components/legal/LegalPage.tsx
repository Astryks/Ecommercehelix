import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const LEGAL_UPDATED = "13 October 2026";
/** Contact inbox for privacy, terms and deletion requests. */
export { SUPPORT_EMAIL as LEGAL_EMAIL } from "@/lib/support";
import { SUPPORT_EMAIL as LEGAL_EMAIL } from "@/lib/support";

export function Mail() {
  return <a className="break-all text-cyan-700 underline" href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;
}
export const OPERATOR = "Astryks";

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-12">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {LEGAL_UPDATED}</p>
        <p className="mt-4 text-slate-700">{intro}</p>
        <div className="legal mt-8 space-y-8 break-words text-slate-800">{children}</div>
        <p className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">Questions about this page? Email <Mail />.</p>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-hand text-2xl text-cyan-700">{title}</h2>
      <div className="mt-2 space-y-3 leading-7">{children}</div>
    </section>
  );
}
