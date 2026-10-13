# Legal pages

/privacy, /terms and /data-deletion are plain-English pages written to match what the code does (hardened 13 Oct 2026: ACL guarantees wording, APPs, GDPR/UK GDPR legal bases and transfers, CCPA, subprocessor table, cookies and local storage, retention, auto-renewal, cancellation at period end and proration as set in the Stripe portal, Meta Platform Terms and Google Limited Use, under-18s, NSW law).

- Contact email: support@astryks.com (LEGAL_EMAIL in src/components/legal/LegalPage.tsx), shown as a mailto link.
- Facts they rely on: Neon database in AWS us-east-1, Vercel hosting, Resend email, Stripe billing (AUD, monthly), JWT session cookie only, no analytics, no AI, Meta token encrypted with AES-256-GCM (about 60 days), Meta data deletion callback at /api/meta/data-deletion. Update the pages if any of these change.

- Stripe customer portal (checked 13 Oct 2026, test mode): cancel at period end, plan changes prorated. Check the live-mode portal uses the same settings when Stripe goes live, or update /terms.
- Account deletion cancels the Stripe subscription immediately (src/app/dashboard/settings/account-actions.ts).
- Google is used only for optional sign-in (email, name, photo). If Google Ads or other Google APIs are added, update the Google section and the Limited Use statement.
