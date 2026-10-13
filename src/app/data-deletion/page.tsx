import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Sec, Mail } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Data deletion | E-commerce Helix", description: "How to delete your E-commerce Helix data, including data from Meta.", alternates: { canonical: "/data-deletion" } };

export default async function DataDeletion({ searchParams }: PageProps<"/data-deletion">) {
  const sp = await searchParams;
  const code = typeof sp.code === "string" ? sp.code.replace(/[^a-f0-9]/gi, "").slice(0, 32) : "";
  return (
    <LegalPage title="Data deletion" intro="You can delete your data from E-commerce Helix at any time. Pick whichever way suits you.">
      {code && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Your request from Meta was received and the Meta data Helix held for that Facebook account has been deleted. Confirmation code: <strong>{code}</strong>
        </p>
      )}
      <Sec title="Option 1: delete your whole account in Helix">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Sign in and open <strong>Settings</strong>.</li>
          <li>Optional: click <strong>Download my data</strong> to keep a copy.</li>
          <li>Under <strong>Delete my account</strong>, type DELETE and click the button.</li>
        </ol>
        <p>Everything in your account is deleted from our database straight away. This also removes Helix&apos;s access to your Meta account and cancels any paid plan at Stripe immediately, so you are not charged again. Stripe keeps its own payment records as the law requires, and our providers&apos; backups roll off within their normal retention windows.</p>
      </Sec>
      <Sec title="Option 2: remove only your Meta data">
        <ol className="list-decimal space-y-2 pl-6">
          <li>In Helix, open <strong>Connections</strong> and click <strong>Disconnect</strong> under Meta. Helix removes its access at Meta and deletes the token and synced results.</li>
          <li>Or, on Facebook, go to <strong>Settings and privacy</strong>, then <strong>Settings</strong>, then <strong>Business integrations</strong>, find E-commerce Helix and click <strong>Remove</strong>. Meta then tells Helix, and Helix deletes the Meta data it holds for you.</li>
        </ol>
      </Sec>
      <Sec title="Option 3: email us">
        <p>Email <Mail /> from the address you sign in with and ask us to delete your account. We will confirm within 30 days. We may ask you to confirm it is you.</p>
      </Sec>
      <Sec title="More about your data">
        <p>Our <Link className="text-cyan-700 underline" href="/privacy">privacy policy</Link> explains what we keep, for how long and your other rights.</p>
      </Sec>
    </LegalPage>
  );
}
