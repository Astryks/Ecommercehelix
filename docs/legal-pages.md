# Legal pages: drafts

/privacy, /terms and /data-deletion (added 13 Oct 2026) are plain-English drafts written to match what the code does. They have not been reviewed by a lawyer. Have an Australian lawyer review them before relying on them, especially the refund, liability and overseas data transfer sections.

- Contact email: support@astryks.com (LEGAL_EMAIL in src/components/legal/LegalPage.tsx), shown as a mailto link.
- Facts they rely on: Neon database in AWS us-east-1, Vercel hosting, Resend email, Stripe billing (AUD, monthly), JWT session cookie only, no analytics, no AI, Meta token encrypted with AES-256-GCM (about 60 days), Meta data deletion callback at /api/meta/data-deletion. Update the pages if any of these change.
