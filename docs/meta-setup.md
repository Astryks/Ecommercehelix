# Meta setup: what Sid needs to do

This is the checklist to switch the Meta integration from mock mode to your real Meta app. The code is done. These steps happen in Meta's dashboards and in Vercel.

**Short version:** create a Business app, add Facebook Login for Business and the Marketing API, make a login configuration, set five environment variables, test with your own ad account, then get Business Verification and App Review so other people can connect.

Graph API and Marketing API version used: **v26.0** (released 29 July 2026). Change it with `META_GRAPH_VERSION` if Meta releases a newer one.

---

## 1. Create the Meta developer app

1. Go to [developers.facebook.com](https://developers.facebook.com/) and log in with the Facebook account that is an admin of your business portfolio.
2. Click **My Apps**, then **Create app**.
3. Pick the use case **Create and manage ads with the Marketing API**. If asked for an app type, pick **Business**.
4. Name it "Ecommerce Helix" and add your contact email.
5. Connect it to your business portfolio (the one that owns ecommercehelix.com).
6. In the app dashboard, add the product **Facebook Login for Business**.

## 2. Fill in the basic settings

Go to **App settings > Basic**:

1. Copy the **App ID** into `META_APP_ID`.
2. Click **Show** next to App Secret and copy it into `META_APP_SECRET`. Never paste it into code or chat.
3. Add **App domains**: `ecommercehelix.com` (and your Vercel preview domain if you test there).
4. Add a **Privacy Policy URL**, a **Terms of Service URL** and **User data deletion** instructions URL. Review fails without these. (We still need to publish these pages; see open question 8 in STATUS.md.)
5. Add an app icon (1024 x 1024) and pick the category **Business and pages**.

## 3. Set the redirect URI

Go to **Facebook Login for Business > Settings**:

1. Turn on **Client OAuth login**, **Web OAuth login**, **Enforce HTTPS** and **Use Strict Mode for redirect URIs**.
2. In **Valid OAuth Redirect URIs** add exactly:
   - `https://ecommercehelix.com/api/meta/callback`
   - `https://<your-vercel-preview-domain>/api/meta/callback` (optional, for testing)
3. For local testing, `http://localhost:3000/api/meta/callback` works while the app is in Development mode.
4. Set `APP_URL=https://ecommercehelix.com` in Vercel so the app always sends the same redirect URI.

## 4. Create the login configuration

Facebook Login for Business uses a **configuration** instead of a scope list.

1. Go to **Facebook Login for Business > Configurations > Create configuration**.
2. Name: "Helix ads connect".
3. Token type: **User access token**. Expiry: **60 days** (Helix exchanges it for a long-lived token and shows the expiry date; the user reconnects when it runs out).
4. Assets: **Ad accounts**, **Pages**, **Instagram accounts**, **Datasets (pixels)**.
5. Permissions:
   - `ads_management` (create paused drafts)
   - `ads_read` (read results)
   - `business_management` (see ad accounts owned by a business portfolio)
   - `pages_show_list` (list Pages to run ads from)
   - `pages_read_engagement` (read Page details)
   - `instagram_basic` (see the Instagram account linked to the Page; drop it if you want a smaller review)
6. Save and copy the **Configuration ID** into `META_CONFIG_ID`. Without it, the app falls back to the classic scope list.

## 5. Set environment variables in Vercel

Project > Settings > Environment Variables:

| Variable | Value | Notes |
| --- | --- | --- |
| `META_APP_ID` | From step 2 | |
| `META_APP_SECRET` | From step 2 | Secret. Used for the token exchange and `appsecret_proof` on every call. |
| `META_CONFIG_ID` | From step 4 | Facebook Login for Business configuration. |
| `TOKEN_ENCRYPTION_KEY` | Run `openssl rand -hex 32` | 32 bytes. Encrypts access tokens (AES-256-GCM). If you change it, everyone must reconnect. |
| `CRON_SECRET` | Run `openssl rand -hex 32` | Vercel sends it to the daily sync route. |
| `APP_URL` | `https://ecommercehelix.com` | Keeps the redirect URI stable. |
| `DATABASE_URL` | Your Postgres URL | Then run `npm run db:push` once to create the new tables. |
| `META_MOCK` | leave unset | Set to `1` only to force mock mode. |
| `META_GRAPH_VERSION` | leave unset | Defaults to `v26.0`. |

The daily sync runs from `vercel.json` at 19:00 UTC (6:00 am Sydney in summer, 5:00 am in winter).

## 6. Test with your own ad account (Development mode)

In Development mode only people with a role on the app can connect. That is enough to test everything end to end.

1. Deploy, sign in to Helix, open **Connections** and press **Connect Meta**.
2. Approve the permissions. Pick your ad account, Page and pixel and press **Save choices**.
3. Press **Sync now**. Check the Campaign tracker shows your campaigns and the scorecard shows Meta ad spend.
4. Go to **Build a campaign**, press **Build paused drafts in my account** and approve it.
5. Open Ads Manager: you should see one campaign, one ad set and three ads, all **Off**. Delete them by hand when done. Helix never deletes anything.
6. Check **Connections > Activity log** lists every call.

## 7. Business Verification

Needed before other businesses can connect.

1. Go to **Business settings > Security center > Start verification** (or Meta Business Suite > Settings > Business info).
2. Enter the legal business name, address, phone and website exactly as on your registration documents (ABN or ASIC extract for Australia).
3. Upload one document that shows the legal name and address (registration certificate, utility bill or bank statement).
4. Confirm by email, phone or domain verification. Domain verification is quickest: add the DNS TXT record Meta gives you.
5. It usually takes a few working days.

## 8. App Review (Advanced Access)

Each permission needs **Advanced Access** before customers outside your business can use it. Request them under **App Review > Permissions and features**.

For each permission, write one short paragraph on how Helix uses it and attach a screencast.

**Screencast checklist (Meta rejects most first submissions for missing one of these):**

1. Record the full flow in one take: sign in to Helix, press **Connect Meta**, the Meta login dialog, the permissions screen, and the return to Helix.
2. Show the exact place each permission is used:
   - `ads_read`: Sync now, then the Campaign tracker and scorecard ad spend.
   - `ads_management`: build a campaign, approve it, then show the paused campaign in Ads Manager.
   - `business_management`: the ad account picker listing business-owned accounts.
   - `pages_show_list` and `pages_read_engagement`: the Page picker.
   - `instagram_basic`: the Instagram handle shown next to the Page.
3. Use English UI, a mouse pointer you can see, and captions or on-screen notes explaining each step. No audio needed.
4. Keep it under about 5 minutes per video. 1080p is fine.
5. Give reviewers a working Helix login (a test user) in the submission notes, plus steps to reproduce.
6. Explain the safety model in the notes: campaigns are created paused, Helix never activates them or edits live budgets, every action needs user approval, and users can disconnect at any time (which revokes our permissions and deletes their token).

**Marketing API access level:** new apps start with Standard Access to the Marketing API (lower rate limits). Apply for **Ads Management Standard Access** in App Review once you meet Meta's usage thresholds shown on that page. Helix handles rate limits with backoff, but higher access means fewer waits.

## 9. Go live

1. When the permissions are approved, switch the app from **Development** to **Live** at the top of the dashboard.
2. Remove `ALLOW_DEV_LOGIN` and make sure `META_MOCK` is not set in production.
3. Connect once more with your own account to confirm.

## What the code does (for reference)

- **Connect:** `/api/meta/connect` sends the user to the Facebook Login for Business dialog with a random `state` kept in an httpOnly cookie. `/api/meta/callback` checks the state, swaps the code for a token, then swaps that for a long-lived token, and stores it encrypted with AES-256-GCM (key: `TOKEN_ENCRYPTION_KEY`, bound to the user id).
- **Pick assets:** ad account, Page (and linked Instagram) and pixel. IDs are checked against what the token can actually see.
- **Read:** daily cron (`/api/cron/meta-sync`) and **Sync now** pull campaign insights for the last 7 days, the 7 days before, and 14 days of daily spend. Spend, purchases, CPA, ROAS, outbound CTR, CPM, frequency, hook rate (3-second video views divided by impressions) and ThruPlay rate feed the Campaign tracker, the scorecard's Meta ad spend and the audit rules.
- **Rate limits:** reads retry throttling and server errors with exponential backoff and jitter, and honour `estimated_time_to_regain_access` from Meta's usage headers. Writes retry only when Meta rejected them for rate limits, never after a server error, so nothing is created twice. Waits over 60 seconds stop the sync and the next run continues.
- **Write:** only after approval. One Sales campaign (`OUTCOME_SALES`) with campaign budget and lowest-cost bidding, one ad set with Advantage+ audience and automatic placements optimising for purchases on the pixel, and three link ads. Everything is created with `status=PAUSED`. The guardrail in `src/lib/meta/guardrail.ts` throws on any other status, any budget or bid change on an existing object, deletes, copies and unknown endpoints. Tests: `npm test`.
- **Audit log:** every Graph API call (method, path, result, HTTP status, attempt, timing, parameter names, never values or tokens), every approval and every blocked write is written to the `AuditLog` table and shown under Connections.
- **Disconnect:** revokes the app's permissions at Meta (`DELETE /me/permissions`, the only delete the guardrail allows) and deletes the token and synced data.
- **Mock mode:** with no Meta app (or `META_MOCK=1`) the same code runs against fixture data with no network calls.
