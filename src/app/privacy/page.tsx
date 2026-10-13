import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Sec, Mail, OPERATOR } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy policy | E-commerce Helix", description: "What E-commerce Helix collects, why, where it is kept and how to export or delete it.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" intro={`E-commerce Helix ("Helix", "we") is run by ${OPERATOR}. This page explains, in plain English, what we collect, why, where it is kept and what you can do about it. We follow the Australian Privacy Principles in the Privacy Act 1988, and we aim to meet the GDPR and UK GDPR for people in Europe and the UK.`}>
      <Sec title="What we collect">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Your sign-in details.</strong> Your email address (and your name and photo if you sign in with Google). Sign-in links are sent by email through Resend.</li>
          <li><strong>Your store link and store check results.</strong> If you give us your store link, Helix reads your public home page, one product page and robots.txt, and keeps the results and the fix list.</li>
          <li><strong>The numbers you enter.</strong> Daily sales, orders, ad spend, costs, product and stock details, suppliers, goals and anything you upload by CSV.</li>
          <li><strong>Your onboarding answers.</strong> Your country, revenue band and the answers to the quick questions.</li>
          <li><strong>Your progress.</strong> Lessons and tasks you finish, plans, approvals and a log of actions in your account.</li>
          <li><strong>Meta data, only if you connect Meta.</strong> See the next section.</li>
          <li><strong>Billing status.</strong> Your plan, and the Stripe customer and subscription IDs. Not your card details.</li>
        </ul>
      </Sec>
      <Sec title="Meta (Facebook and Instagram) data">
        <p>If you choose to connect Meta, you sign in with Facebook Login for Business and grant permissions on Meta&apos;s own screen. With those permissions Helix reads:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>your Facebook user ID and name,</li>
          <li>the ad accounts, Facebook Pages (and any linked Instagram account) and pixels you can access, so you can pick which ones to use,</li>
          <li>campaign results (spend, sales, cost per sale and similar insights), once a day.</li>
        </ul>
        <p>When you ask it to, Helix creates new campaigns in your ad account as paused drafts. It never switches on spend or changes live budgets.</p>
        <p>Your Meta access token is encrypted (AES-256-GCM) before it is stored. It lasts about 60 days, after which Meta asks you to reconnect. You can disconnect at any time under Connections in Helix, which removes our access at Meta and deletes the token and synced data. You can also remove Helix in your Facebook settings under Business Integrations.</p>
        <p>We use Meta data only to show you your results and build drafts for you. We do not sell it, share it with advertisers or data brokers, or use it to build profiles for anyone else, as Meta&apos;s Platform Terms require.</p>
      </Sec>
      <Sec title="Why we use it">
        <p>To run the service you signed up for (your contract with us), to keep your account secure, to send sign-in links and service emails, and to bill paid plans. We do not send marketing emails without your consent.</p>
      </Sec>
      <Sec title="No selling, no AI, no ad tracking">
        <p>We do not sell or rent your data. Helix does not use AI today, so your data is not sent to any AI service. There are no analytics or advertising trackers on the site.</p>
      </Sec>
      <Sec title="Cookies">
        <p>We only use cookies needed to run the site: a session cookie that keeps you signed in, and a short-lived security cookie during Meta sign-in. No tracking or advertising cookies.</p>
      </Sec>
      <Sec title="Who helps us run Helix">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Vercel</strong> hosts the website and app.</li>
          <li><strong>Neon</strong> hosts the database, in the United States (AWS us-east-1).</li>
          <li><strong>Resend</strong> sends sign-in and service emails.</li>
          <li><strong>Stripe</strong> handles payments. Card details go straight to Stripe and never touch our servers.</li>
          <li><strong>Meta</strong>, only if you connect it.</li>
        </ul>
        <p>This means your data is stored and processed outside Australia, mainly in the United States. We pick providers that protect data to a standard similar to the Australian Privacy Principles, and rely on their standard contractual protections for European and UK data.</p>
      </Sec>
      <Sec title="How long we keep it">
        <p>We keep your data while your account is open. When you delete your account, your data is deleted from our database straight away. Stripe keeps its own billing records as the law requires. Backups held by our database host roll off within their normal retention window.</p>
      </Sec>
      <Sec title="Your choices and rights">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>See and export:</strong> Settings, then <em>Download my data</em>, gives you everything in one file.</li>
          <li><strong>Correct:</strong> change your details and numbers in the app, or email us.</li>
          <li><strong>Delete:</strong> Settings, then <em>Delete my account</em>. See <Link className="text-cyan-700 underline" href="/data-deletion">data deletion</Link> for every option.</li>
          <li>If you are in Europe or the UK you can also object to or restrict our use of your data, and complain to your local data protection authority.</li>
        </ul>
      </Sec>
      <Sec title="Contact and complaints">
        <p>Email <Mail />. We aim to reply within 30 days. If you are not happy with our answer, you can complain to the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au.</p>
      </Sec>
      <Sec title="Changes">
        <p>If we change this policy we will update the date at the top, and tell you by email if the change is important.</p>
      </Sec>
    </LegalPage>
  );
}
