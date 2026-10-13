import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HelpGuides } from "@/components/HelpGuides";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/support";

export const metadata: Metadata = {
  title: "Help and support",
  description: "Simple step-by-step help for E-commerce Helix, and how to reach support.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-12">
        <h1 className="text-3xl sm:text-4xl">Help and support</h1>
        <p className="mt-3 text-slate-700">Some steps need your own accounts, so you do them and Helix shows you how. Each guide below is a few short steps. Still stuck? Email <a className="underline" href={supportMailto()}>{SUPPORT_EMAIL}</a> and a real person will reply, usually within one business day.</p>
        <div className="mt-8"><HelpGuides /></div>
      </main>
      <SiteFooter />
    </div>
  );
}
