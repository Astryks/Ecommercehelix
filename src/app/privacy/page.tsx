import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Sec, Mail, OPERATOR } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy policy | E-commerce Helix", description: "What E-commerce Helix collects, why, who helps us run it, where it is kept, how long, and your rights.", alternates: { canonical: "/privacy" } };

const a = "text-cyan-700 underline";

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" intro={`${OPERATOR} ("Helix", "we", "us") runs this service. This page explains in plain English what we collect, why, who helps us, where it is kept, how long we keep it and what you can do about it. We follow the privacy laws that apply where we operate. If you are in the European Economic Area or the UK, we are the controller of your personal data under the GDPR and UK GDPR. If you are in California, the CCPA section below also applies.`}>
      <Sec title="What we collect">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Sign-in details.</strong> Your email address. If you sign in with Google, also your name and profile photo from Google. Sign-in links are emailed through Resend.</li>
          <li><strong>Your store link and store check results.</strong> If you give us your store link, Helix reads your public home page, one product page, your public product list, cart endpoint and robots.txt. It keeps the results and the fix list.</li>
          <li><strong>Business numbers you enter.</strong> Daily sales, orders, ad spend, costs, prices, product and stock details, suppliers, goals and anything you upload by CSV.</li>
          <li><strong>Onboarding answers.</strong> Your country, revenue band and answers to the quick questions.</li>
          <li><strong>Progress.</strong> Lessons, cards and tasks you finish, plans, approvals and a log of actions in your account.</li>
          <li><strong>Meta data, only if you connect Meta.</strong> See below.</li>
          <li><strong>Shopify data, only if you connect Shopify.</strong> See below.</li>
          <li><strong>Google Ads data, only if you connect Google Ads.</strong> See below.</li>
          <li><strong>What you ask the AI helper.</strong> If you use an AI feature, the question you type or the data it summarises, and the answer. See below.</li>
          <li><strong>Messages you send us.</strong> If you use the contact form: your name, email address, topic and message. If you are signed in, also your account ID and plan.</li>
          <li><strong>Members group.</strong> On a paid plan, we keep a list of members to let into, or remove from, our private Facebook group. This holds your name, email address and plan status.</li>
          <li><strong>Community posts and requests.</strong> Wins you share on the Wins wall (with your first name), and store review requests you send us (your store link, your note and your email address, sent to our support inbox).</li>
          <li><strong>Billing status.</strong> Your plan and your Stripe customer and subscription IDs. We never see or store your card number.</li>
          <li><strong>Basic technical data.</strong> Our hosting provider processes IP addresses and request logs to deliver and protect the site.</li>
        </ul>
        <p>We do not ask for sensitive information (such as health, religion or political views). Please do not enter it. You can use the public lessons without giving us anything.</p>
      </Sec>

      <Sec title="Meta (Facebook and Instagram) data">
        <p>If you choose to connect Meta, you sign in with Facebook Login for Business and grant permissions on Meta&apos;s own screen. Helix then reads:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>your Facebook user ID and name,</li>
          <li>the ad accounts, Facebook Pages (and any linked Instagram account) and pixels you can access, so you can pick which ones to use,</li>
          <li>campaign results (spend, sales, cost per sale and similar insights), once a day.</li>
        </ul>
        <p>When you ask it to, Helix creates new campaigns in your ad account as paused drafts. It never switches on spend or changes live budgets.</p>
        <p>Your Meta access token is encrypted (AES-256-GCM) before it is stored. It lasts about 60 days, then Meta asks you to reconnect. Disconnect any time under Connections in Helix: we remove our access at Meta and delete the token and synced data. You can also remove Helix in Facebook under Business Integrations, and Meta tells us to delete your data.</p>
        <p><strong>Meta Platform Terms.</strong> We use Meta data only to show you your own results and build drafts you asked for. We do not sell it, license it, share it with advertisers or data brokers, use it to build profiles of people, or use it for any purpose other than providing Helix to you.</p>
      </Sec>

      <Sec title="Shopify data">
        <p>If you choose to connect Shopify, you approve Helix on Shopify&apos;s own screen. Helix asks only for read access to orders, products and inventory. Once a day it reads, for your store only: order dates, totals, discounts, refunds and line items (product name, SKU, quantity, price), product unit costs, product counts and stock levels. It turns these into daily totals and product lines in your dashboard. Helix does not store customer names, emails, phone numbers or addresses, and it never changes anything in your store.</p>
        <p>Your Shopify access token is encrypted (AES-256-GCM) before it is stored. Disconnect any time under Connections: we remove our access at Shopify and delete the token and the product lines that came from Shopify. Uninstalling Helix in your Shopify admin does the same. We also handle Shopify&apos;s privacy requests (customer data requests, customer erasure and shop erasure).</p>
      </Sec>

      <Sec title="Google data">
        <p>Google sign-in is optional. If you use it, Helix receives only your basic profile (email address, name and photo) to create and sign in to your account.</p>
        <p>If you choose to connect Google Ads, you sign in on Google&apos;s own screen and grant the Google Ads permission. Helix then reads the Google Ads accounts you can access (so you can pick one) and, once a day, campaign results for that account: campaign names and status, spend, clicks, impressions, conversions and conversion value. When you approve it in Helix, Helix creates a new Search campaign and budget in that account, always paused. It never switches on spend or changes live budgets. The Google refresh token is encrypted (AES-256-GCM) before it is stored. Disconnect any time under Connections: we revoke our access at Google and delete the token and synced data. You can also remove Helix in your Google Account under Third-party connections.</p>
        <p><strong>Google API Services User Data Policy.</strong> Helix&apos;s use and transfer of information received from Google APIs follows the <a className={a} href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including the Limited Use requirements. We use it only to sign you in and to show you your own ad results and build drafts you asked for, never for advertising, never sell it, never use it to train AI models, and do not let people read it except with your permission, for security, or where the law requires.</p>
      </Sec>

      <Sec title="AI features">
        <p>Some features can use AI to write short text: a plain-English summary of your store check, ad copy drafts and answers to &quot;I&apos;m lost&quot; questions. They only run when you press the button. Helix sends the request through the Vercel AI Gateway to the model provider (currently Google&apos;s Gemini models). We send only what the feature needs, such as your store link, store check findings, product name, plan and the question you typed. We do not send your email, name or tokens. Answers are cached so the same request is not sent twice, and each call is logged (feature, size and cost) to enforce monthly limits. We do not use your data to train AI models. The model provider handles each request under its own terms with Vercel. If AI is off or a limit is reached, Helix shows its standard advice instead.</p>
      </Sec>

      <Sec title="Why we use it (and our legal bases)">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>To provide Helix to you</strong>: your account, dashboard, lessons, store check and connections. GDPR basis: performance of our contract with you.</li>
          <li><strong>To bill paid plans</strong> and keep tax records. Basis: contract and legal obligation.</li>
          <li><strong>To keep Helix secure</strong> and prevent abuse. Basis: our legitimate interests in running a safe service.</li>
          <li><strong>To send sign-in links and service emails</strong> (such as receipts and important changes). Basis: contract.</li>
          <li><strong>Product emails</strong> (daily steps, event reminders, alerts, the weekly scorecard and win-back emails). We send these to account holders. In Australia this relies on consent inferred from your account under the Spam Act 2003. Elsewhere it relies on our legitimate interests. Every one has a one-click unsubscribe, and you can switch each type off in Settings.</li>
        </ul>
      </Sec>

      <Sec title="What we do not do">
        <p>We do not sell or rent your personal information, and we do not share it for cross-context behavioural advertising. Your data is only sent to an AI service when you press an AI button, as described above, and we never use it to train AI models. There are no analytics or advertising trackers on the site. We do not make automated decisions that have legal or similarly significant effects on you.</p>
      </Sec>

      <Sec title="Cookies and local storage">
        <p>We only use what is needed to run the site:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>a session cookie that keeps you signed in (and related security cookies used by our sign-in system),</li>
          <li>short-lived security cookies during Meta, Shopify and Google Ads sign-in,</li>
          <li>your browser&apos;s local storage to remember lesson ticks and card positions on your device.</li>
        </ul>
        <p>No tracking or advertising cookies, so there is no cookie banner. Clearing your browser data removes them; you will be signed out.</p>
      </Sec>

      <Sec title="Who helps us run Helix (subprocessors)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead><tr className="border-b border-slate-300"><th className="py-2 pr-4">Provider</th><th className="py-2 pr-4">What for</th><th className="py-2">Where</th></tr></thead>
            <tbody className="divide-y divide-slate-200">
              <tr><td className="py-2 pr-4 font-semibold">Vercel</td><td className="py-2 pr-4">Website and app hosting</td><td className="py-2">United States and global edge network</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">Neon</td><td className="py-2 pr-4">Database</td><td className="py-2">United States (AWS us-east-1)</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">Resend</td><td className="py-2 pr-4">Sign-in, service and product emails, and contact form messages</td><td className="py-2">United States</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">Stripe</td><td className="py-2 pr-4">Payments and subscriptions (card details go straight to Stripe)</td><td className="py-2">United States and other Stripe locations</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">Meta</td><td className="py-2 pr-4">Only if you connect it: reading your ad results, creating paused drafts</td><td className="py-2">United States and other Meta locations</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">Shopify</td><td className="py-2 pr-4">Only if you connect it: reading your orders, products and stock</td><td className="py-2">Canada, United States and other Shopify locations</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">Google</td><td className="py-2 pr-4">Only if you use Google sign-in or connect Google Ads (reading ad results, creating paused campaigns). Also the AI model provider behind the AI features</td><td className="py-2">United States and other Google locations</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">Vercel AI Gateway</td><td className="py-2 pr-4">Only when you use an AI feature: routes the request to the AI model provider</td><td className="py-2">United States and global edge network</td></tr>
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Sending data overseas">
        <p>Your data is stored and processed by our providers, mainly in the United States. We take reasonable steps so these providers protect it to a standard similar to the privacy laws we follow. For data from the EEA or UK, we rely on our providers&apos; data processing terms, including the European Commission&apos;s Standard Contractual Clauses and the UK Addendum, or the EU-US Data Privacy Framework where a provider is certified.</p>
      </Sec>

      <Sec title="How long we keep it">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Account data</strong>: while your account is open. When you delete your account, it is deleted from our database straight away.</li>
          <li><strong>Meta data</strong>: until you disconnect Meta or delete your account. The token expires by itself after about 60 days.</li>
          <li><strong>Shopify and Google Ads data</strong>: until you disconnect, uninstall or delete your account.</li>
          <li><strong>AI answers and usage logs</strong>: until you delete your account.</li>
          <li><strong>Wins and store review requests</strong>: until you delete your account or ask us to remove them. Copies of review emails stay in our support inbox for up to 2 years.</li>
          <li><strong>Billing records</strong>: Stripe keeps its own payment records for as long as the law requires.</li>
          <li><strong>Backups and logs</strong>: held by our providers and removed within their normal retention windows.</li>
        </ul>
      </Sec>

      <Sec title="Keeping it safe">
        <p>All traffic uses HTTPS. Meta, Shopify and Google tokens are encrypted. No system is perfectly secure; if a data breach is likely to cause you serious harm, we will tell you and the OAIC as the Notifiable Data Breaches scheme requires (and EEA/UK regulators where the GDPR requires).</p>
      </Sec>

      <Sec title="Your rights">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Access and export:</strong> Settings, then <em>Download my data</em>, gives you everything in one file.</li>
          <li><strong>Correct:</strong> change your details and numbers in the app, or email us.</li>
          <li><strong>Delete:</strong> Settings, then <em>Delete my account</em>. See <Link className={a} href="/data-deletion">data deletion</Link> for every option.</li>
          <li><strong>EEA and UK:</strong> you can also object to or restrict our use of your data, ask for portability, withdraw consent, and complain to your local data protection authority (in the UK, the ICO).</li>
          <li><strong>California (CCPA):</strong> you can ask to know what personal information we collect, use and disclose, ask us to delete or correct it, and you will not be treated differently for using these rights. We do not sell or share personal information, so there is nothing to opt out of. The categories we collect are listed above: identifiers, commercial information about your subscription, internet activity on Helix, and business data you enter.</li>
        </ul>
        <p>Contact us through <Mail /> using your sign-in address to use any right. We may need to confirm it is you. We reply within 30 days (or sooner where the law requires).</p>
      </Sec>

      <Sec title="Children">
        <p>Helix is for business owners aged 18 or over. It is not directed at children, and we do not knowingly collect data from anyone under 18. If you think a child has given us data, email us and we will delete it.</p>
      </Sec>

      <Sec title="Complaints">
        <p>Contact us through <Mail /> first and we will try to fix it. If you are not happy with our answer, you can complain to the privacy regulator where we operate or your local data protection authority.</p>
      </Sec>

      <Sec title="Changes">
        <p>If we change this policy we will update the date at the top, and email you before an important change takes effect.</p>
      </Sec>
    </LegalPage>
  );
}
