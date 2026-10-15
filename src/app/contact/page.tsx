import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactForm } from "@/components/ContactForm";
import { sendContact } from "./actions";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Send the E-commerce Helix team a message. A real person replies, usually within one business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-page pb-section">
        <h1 className="text-4xl text-slate-900 sm:text-5xl">Contact us</h1>
        <p className="mt-lead text-lg leading-8 text-slate-600">Questions, problems or ideas: send us a message and a real person will reply, usually within one business day. Looking for how-to steps? Try <Link href="/help" className="underline">Help and support</Link> first.</p>
        <div className="relative mt-block"><ContactForm action={sendContact} /></div>
      </main>
      <SiteFooter />
    </div>
  );
}
