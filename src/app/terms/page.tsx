import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Sec, Mail, OPERATOR } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of service | E-commerce Helix", description: "The terms for using E-commerce Helix: plans, auto-renewal, cancelling, refunds, your consumer rights and more.", alternates: { canonical: "/terms" } };

const a = "text-cyan-700 underline";

export default function Terms() {
  return (
    <LegalPage title="Terms of service" intro={`These terms are an agreement between you and ${OPERATOR}, who runs E-commerce Helix ("Helix", "we", "us"). By creating an account or using Helix you agree to them. Please read the billing part carefully: paid plans renew automatically every month until you cancel.`}>
      <Sec title="What Helix is">
        <p>Helix is self-serve software for e-commerce store owners: lessons, a daily plan, a profit dashboard, a store check and, on paid plans, a Meta connection that reads your ad results and builds campaigns as paused drafts. There are no calls, no consulting and no done-for-you service.</p>
      </Sec>

      <Sec title="No guarantee of results, not advice">
        <p>Helix is education and tools. It is general information, not financial, investment, tax, accounting or legal advice, and it does not take your personal circumstances into account. Results depend on your store, products, market and decisions. We do not promise any sales, profit or other result. You decide what to do in your business and in your ad accounts.</p>
      </Sec>

      <Sec title="Who can use Helix">
        <p>You must be 18 or over and use Helix for your business. Keep your sign-in email secure. You are responsible for activity in your account and for the accuracy of the numbers you enter.</p>
      </Sec>

      <Sec title="Plans, prices and auto-renewal">
        <ul className="list-disc space-y-2 pl-6">
          <li>Free costs nothing. Starter is US$29 a month and Growth is US$59 a month, in US dollars, charged in advance by Stripe. We are not registered for GST, so no GST is charged. Prices are shown in US dollars. If your card is in another currency, your bank converts it and may add its own foreign transaction or currency fees. The price you see at Stripe Checkout before you pay is the price you are charged.</li>
          <li><strong>Auto-renewal:</strong> a paid plan is a subscription. It renews automatically each month on the same date and your card is charged the plan price until you cancel.</li>
          <li>If a payment fails, Stripe will try again over the next few days. If it still fails, your account may move back to Free.</li>
          <li>Changing plans happens in <em>Manage billing</em> (the Stripe customer portal). Stripe adjusts the charge for the part of the month left (proration).</li>
          <li>If we change prices, we will email you at least 30 days before the new price applies to you, so you can cancel first.</li>
        </ul>
      </Sec>

      <Sec title="Cancelling">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Cancel anytime, in one click. No lock-in.</strong> Open <Link className={a} href="/dashboard/billing">Plan &amp; billing</Link>, press <em>Cancel anytime</em> and confirm. You can undo it with one click before your period ends. You keep paid features until the end of the month you have paid for, and you are not charged again.</li>
          <li>If you delete your account under Settings, your subscription is cancelled straight away and your data is deleted. You are not charged again.</li>
          <li>Your profit dashboard, daily numbers and lessons stay free after you cancel.</li>
        </ul>
      </Sec>

      <Sec title="Refunds and your consumer rights">
        <p>Our services come with guarantees that cannot be excluded under the Australian Consumer Law. For major failures with the service, you are entitled to cancel your service contract and to a refund for the unused portion, or to compensation for its reduced value. You are also entitled to be compensated for any other reasonably foreseeable loss or damage. If a failure does not amount to a major failure, you are entitled to have problems with the service rectified in a reasonable time and, if this is not done, to cancel your contract and obtain a refund for the unused portion.</p>
        <p>Apart from those rights, we do not give refunds for change of mind or for part months. If something has gone wrong, email <Mail /> and we will look at it fairly. Consumers in other countries keep any rights their local law gives them that cannot be excluded.</p>
      </Sec>

      <Sec title="Meta, Google, Shopify and your ad spend">
        <p>Campaigns Helix builds are created paused in your own ad account, and only after you press Approve in Helix. Nothing spends money until you review it and switch it on in Meta or Google Ads. You are responsible for your ads, your ad spend and following Meta&apos;s and Google&apos;s advertising policies and terms. AI-written text (summaries, ad copy drafts and help answers) can be wrong, so check it before you use it. Connecting Meta, Shopify or Google Ads, or signing in with Google, is optional, and your use of those services is also covered by their own terms. How we handle data from them is in our <Link className={a} href="/privacy">privacy policy</Link>.</p>
      </Sec>

      <Sec title="Acceptable use">
        <p>Do not use Helix to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>break any law, or sell illegal, unsafe or counterfeit products,</li>
          <li>make false or misleading claims, including in ads,</li>
          <li>enter or check stores, accounts or data you are not allowed to use,</li>
          <li>send spam or harass anyone,</li>
          <li>probe, overload, scrape, copy or reverse engineer the service, or get around limits or security,</li>
          <li>share your account or resell Helix.</li>
        </ul>
        <p>We may suspend or close accounts that do, with notice where we reasonably can.</p>
      </Sec>

      <Sec title="Your content and ours">
        <p>Your data stays yours. You let us store and process it only to run Helix for you, as set out in our <Link className={a} href="/privacy">privacy policy</Link>. Helix&apos;s software, lessons and design belong to us. You may use the lessons for your own business, but not republish or sell them.</p>
      </Sec>

      <Sec title="AI features">
        <p>Some features use AI to write short text, only when you press the button: a summary of your store check, ad copy drafts and answers to &quot;I&apos;m lost&quot; questions. AI text can be wrong or incomplete. Check it before you rely on it or publish it; you are responsible for what you publish. Each plan has a monthly AI allowance; when it runs out you still get Helix&apos;s standard advice. We never use your data to train AI models.</p>
      </Sec>

      <Sec title="Community and the Wins wall">
        <p>Paying members may be invited to a private members group run on Facebook; Facebook&apos;s own terms apply there and we may remove anyone who breaks these terms. If you share a win on the Wins wall, it shows with your first name only after we check it, and you let us show it inside Helix. Do not share anything private, untrue, rude or that belongs to someone else. We can hide or remove any post at any time. You can ask us to remove your post by emailing support.</p>
      </Sec>

      <Sec title="Store reviews and emails">
        <p>If you ask us to review your store, we give general feedback by email. It is not professional, legal, tax or financial advice and we do not promise results. Helix may email you a short weekly scorecard of your own numbers; you can ask us to stop at any time.</p>
      </Sec>

      <Sec title="Availability and changes">
        <p>We work to keep Helix accurate and available but cannot promise it will always be error-free or online. We may improve or change features. If we make a change that significantly reduces what a paid plan includes, we will tell you and you can cancel.</p>
      </Sec>

      <Sec title="Limitation of liability">
        <p>To the extent permitted by law, and except for the consumer guarantees and rights that cannot be excluded:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>we are not liable for lost profits, lost sales, ad spend, lost data or indirect or consequential loss,</li>
          <li>our total liability to you is limited to the amount you paid us in the 12 months before the claim,</li>
          <li>where the Australian Consumer Law lets us limit our liability for a failure to meet a guarantee, our liability is limited to supplying the service again or paying the cost of having it supplied again.</li>
        </ul>
        <p>Nothing in these terms limits liability that cannot be limited by law, such as for fraud.</p>
      </Sec>

      <Sec title="Ending the agreement">
        <p>You can stop at any time by cancelling and deleting your account under Settings. We may close accounts that break these terms. If we ever close Helix, we will give you at least 30 days&apos; notice and time to download your data.</p>
      </Sec>

      <Sec title="Changes to these terms">
        <p>We will update the date at the top when we change these terms, and email you before an important change takes effect. If you keep using Helix after that, the new terms apply.</p>
      </Sec>

      <Sec title="Governing law and contact">
        <p>These terms are governed by the law of New South Wales, Australia, and you and we submit to the courts of New South Wales. This does not take away any right you have to bring a claim where you live under consumer law. Questions or complaints: <Mail />.</p>
      </Sec>
    </LegalPage>
  );
}
