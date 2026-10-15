import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HelpGuides } from "@/components/HelpGuides";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help and support",
  description: "Simple step-by-step help for E-commerce Helix, and how to reach support.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pt-page pb-section">
        <h1 className="text-4xl text-slate-900 sm:text-5xl">Help and support</h1>
        <p className="mt-lead text-lg leading-8 text-slate-600">Some steps need your own accounts, so you do them and Helix shows you how. Each guide below is a few short steps. Still stuck? <Link className="underline" href="/contact">Contact us</Link> and a real person will reply, usually within one business day.</p>
        <div className="mt-block"><HelpGuides /></div>
      </main>
      <SiteFooter />
    </div>
  );
}
