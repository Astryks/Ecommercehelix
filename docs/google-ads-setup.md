# Google Ads setup (for Sid)

Helix connects to each user's own Google Ads account with Google OAuth (scope `https://www.googleapis.com/auth/adwords`, plus `openid email` to show which login is connected), offline access so the daily sync works. Until `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET` and `GOOGLE_ADS_DEVELOPER_TOKEN` are all set in Vercel, the Google Ads card says "Coming soon" and the routes redirect back without error.

## What the code does
- `GET /api/google-ads/connect` (Starter or above) → Google consent with `access_type=offline&prompt=consent` → `GET /api/google-ads/callback` checks state, exchanges the code and stores the **refresh token** AES-256-GCM encrypted in `GoogleAdsConnection`.
- The user picks an ad account from `customers:listAccessibleCustomers` (and optionally a manager account ID, sent as `login-customer-id`).
- Daily cron `/api/cron/google-ads-sync` (19:15 UTC) runs one GAQL report (campaign × day, last 30 days: cost, clicks, impressions, conversions, conversion value). Spend goes into Scorecard `adGoogle`, conversion value into `googleRevenue`, so ROAS by channel and blended MER include Google. A snapshot shows per-campaign results on Connections.
- **Paused campaigns only.** "Build a paused Google Search campaign" (Campaigns → Build) creates an approval. Only when the user presses Approve does Helix create a campaign budget and a Search campaign with `status: PAUSED` (enforced in code by `assertPaused`, unit-tested). Helix never enables, resumes or changes live budgets.
- Disconnect revokes the token at Google and deletes the token, snapshot and connection.
- API version: REST `v25` (override with `GOOGLE_ADS_API_VERSION`). Google sunsets versions about yearly, so bump it each year.

## 1. Google Cloud project and OAuth client
1. https://console.cloud.google.com → create a project `E-commerce Helix` (or reuse the sign-in project; a separate client is cleaner).
2. **APIs & Services → Library → Google Ads API → Enable.**
3. **OAuth consent screen (Google Auth Platform)**: External, app name `E-commerce Helix`, support email, homepage `https://ecommercehelix.com`, privacy policy `https://ecommercehelix.com/privacy`, terms `https://ecommercehelix.com/terms`, authorised domain `ecommercehelix.com`. Add the scope `.../auth/adwords` (sensitive) plus `openid` and `email`.
4. **Credentials → Create credentials → OAuth client ID → Web application.** Authorised redirect URI: `https://ecommercehelix.com/api/google-ads/callback`.
5. Copy the client ID and secret into Vercel (Production): `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`.
6. **Verification**: while the app is in "Testing", only test users you add (max 100) can connect and refresh tokens expire after 7 days. To go public, press **Publish app** and submit for **sensitive scope verification**: domain verification in Search Console, the privacy policy (already covers Google Ads data and the Limited Use statement), and a short YouTube (unlisted) demo video showing the consent screen, the account picker, the daily data in Helix, the Approve → paused campaign flow, and Disconnect. Usually a few days to a few weeks.

## 2. Developer token (approval steps)
1. Create a **Google Ads manager account** (MCC) at https://ads.google.com/home/tools/manager-accounts/ using the business email. It does not need to manage any client accounts.
2. In the manager account: **Admin (Tools) → API Center**. Accept the API Terms and fill in the form (company name, website `https://ecommercehelix.com`, API contact email that is monitored). You get a developer token at **Test access** straight away. Test access only works with test accounts, so it is enough for building and demos but not for real users.
3. Apply for **Basic Access** from the same API Center page (Access level → Apply for Basic Access). The form asks for:
   - the company and how Helix uses the API: "Self-serve reporting tool for small online stores. Each store owner connects their own Google Ads account with OAuth. Helix reads campaign performance daily (GAQL campaign report) to show spend and ROAS next to their store sales, and, only after the owner approves in Helix, creates a Search campaign and budget with status PAUSED. Helix never enables campaigns or changes live budgets."
   - a **design document** (PDF): what Helix reads and writes, the paused-only rule, screenshots of Connections and the approval screen, and the data retention and deletion (disconnect deletes everything). Use the bullets above.
   - whether you create campaigns (yes, paused), whether it is for your own accounts or clients' (clients' own accounts via OAuth), and the expected daily operations (well under 15,000).
   Google reviews Basic Access in about 3 to 10 business days and may email follow-up questions to the API contact address. Reply promptly.
4. When approved, put the token in Vercel: `GOOGLE_ADS_DEVELOPER_TOKEN`. Redeploy. The card switches from "Coming soon" to "Connect Google Ads".
5. Standard Access is only needed above 15,000 operations a day.

## 3. Test
Make a Google Ads **test manager account** and a test client account under it, connect from Helix (with Test access), enter the manager ID in "Manager account ID" if the client is reached through it, Sync now, then Campaigns → Build → "Build a paused Google Search campaign" → Approve. Check it appears paused in Google Ads, then Disconnect.
