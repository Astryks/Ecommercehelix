import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Sec, Mail, OPERATOR } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of service | E-commerce Helix", description: "The terms for using E-commerce Helix.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <LegalPage title="Terms of service" intro={`These terms are an agreement between you and ${OPERATOR}, who runs E-commerce Helix. By using Helix you agree to them.`}>
      <Sec title="What Helix is">
        <p>Helix is self-serve software for e-commerce store owners: lessons, a daily plan, a profit dashboard, a store check and, on paid plans, a Meta connection that reads your ad results and builds campaigns as paused drafts.</p>
        <p>Helix is education and tools. It is not financial, tax, accounting or legal advice. Check important decisions with a qualified adviser. Results depend on your store, products and market, and we do not promise any result.</p>
      </Sec>
      <Sec title="Your account">
        <p>Keep your sign-in email secure. You are responsible for what happens in your account and for the accuracy of the numbers you enter. You must be 18 or over, or old enough to run a business where you live.</p>
      </Sec>
      <Sec title="Plans and billing">
        <ul className="list-disc space-y-2 pl-6">
          <li>Paid plans are monthly subscriptions in Australian dollars (AUD), billed in advance by Stripe. Prices are shown on the <Link className="text-cyan-700 underline" href="/dashboard/billing">billing page</Link>. We are not registered for GST, so no GST is charged.</li>
          <li>You can cancel at any time from the billing page. You keep paid features until the end of the period you have paid for, and you are not charged again.</li>
          <li>We do not give refunds for change of mind or part months. Nothing in these terms limits your rights under the Australian Consumer Law. If the service has a major failure, you can ask for a refund or other remedy.</li>
          <li>If we change prices, we will tell you at least 30 days before the change applies to you.</li>
        </ul>
      </Sec>
      <Sec title="Meta and your ad spend">
        <p>Campaigns Helix builds are created paused in your own ad account. Nothing spends money until you review it and switch it on in Meta. You decide what to launch and you are responsible for your ad spend, your ads and for following Meta&apos;s advertising policies. Your use of Meta is also covered by Meta&apos;s own terms.</p>
      </Sec>
      <Sec title="Acceptable use">
        <p>Do not use Helix to break the law, to sell illegal or harmful products, to make false claims in ads, to access accounts or data that are not yours, or to overload, probe or copy the service. We may suspend accounts that do.</p>
      </Sec>
      <Sec title="Your content and ours">
        <p>Your data stays yours. You let us store and process it only to run Helix for you, as set out in our <Link className="text-cyan-700 underline" href="/privacy">privacy policy</Link>. Helix&apos;s software, lessons and design belong to us. You may use the lessons for your own business.</p>
      </Sec>
      <Sec title="Liability">
        <p>We work hard to keep Helix accurate and available, but it is provided as is. As far as the law allows, we are not liable for lost profits, lost sales, ad spend or indirect losses, and our total liability is limited to what you paid us in the 12 months before the claim. Where the Australian Consumer Law does not allow us to exclude a guarantee, our liability is limited to supplying the service again or paying for it to be supplied again.</p>
      </Sec>
      <Sec title="Ending the agreement">
        <p>You can stop at any time by deleting your account under Settings. We may close accounts that break these terms, and will give notice where we reasonably can.</p>
      </Sec>
      <Sec title="Law and contact">
        <p>These terms are governed by the law of New South Wales, Australia, and the courts of New South Wales have jurisdiction. Questions: <Mail />.</p>
      </Sec>
    </LegalPage>
  );
}
