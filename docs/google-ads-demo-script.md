# Google Ads API verification: demo video script

For the Google OAuth verification of the `https://www.googleapis.com/auth/adwords` scope (Cloud project `astryks`, consent app name "Astryks"). Target length 3 to 5 minutes. Record in one take if you can; cuts are fine between steps.

## Before you record

- Production build at https://ecommercehelix.com with `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET` set (without the developer token the card says "coming soon" and the flow cannot be shown).
- A Helix account on Starter or Growth (connect is a paid feature) and a Google account with access to at least one Google Ads account (a test account under the "E-commerce Helix" manager account is fine).
- If that Google account was connected before, remove Helix first at https://myaccount.google.com/connections so the full consent screen appears.
- Browser at 100% zoom, one clean window, address bar visible the whole time (reviewers check the URLs and the OAuth client ID). Close other tabs, hide bookmarks and notifications. Use English.
- Have no secrets on screen: no Vercel env pages, terminals or `.env` files.

## Scene 1: what the app is (20 seconds)

1. Open https://ecommercehelix.com.
2. Say: "This is E-commerce Helix, a web app that helps online store owners grow profitably. Owners can connect their own Google Ads account so Helix can show their ad results next to their store profit, and, only when they approve, create a paused draft campaign."
3. Scroll to the footer and click **Privacy**. Scroll to the "Google Ads data" section and pause on it for 3 seconds. Say: "Our privacy policy explains exactly which Google Ads data we read and store."

## Scene 2: sign in to the Helix web client (15 seconds)

1. Click **Sign in** and sign in to the Helix account.
2. The dashboard (Today) opens. Say: "This is the Helix web client. The Google Ads connection lives under Connections."

## Scene 3: the OAuth consent flow (60 seconds)

1. Go to **Dashboard > Integrations** (`/dashboard/integrations`) and scroll to the **Google Ads** card.
2. Say: "Helix only connects when the owner chooses to." Click **Connect Google Ads**.
3. The browser goes to `accounts.google.com`. Pause so the URL is readable. Pick the Google account.
4. On the consent screen, show the app name "Astryks", and the requested permission "See, edit, create and delete your Google Ads accounts and data". Say: "Helix asks for the Google Ads scope plus basic sign-in (email) and nothing else."
5. Click **Continue / Allow**.
6. You land back on `ecommercehelix.com/dashboard/integrations`. Say: "Google sends us an authorisation code. Our server swaps it for a refresh token, which is encrypted with AES-256-GCM before it is saved. It is never shown in the browser."

## Scene 4: picking the ad account (30 seconds)

1. The Google Ads card now shows **Pick the ad account Helix should read**, listing the accounts this login can access.
2. Say: "Helix lists the Google Ads accounts the owner can access, using the customers list and a one-line customer query for the name and currency." Pick the account.
3. Helix runs the first sync. Show the card with the account name, currency and **Last sync** time.

## Scene 5: how Ads data is used (60 seconds)

1. Say: "Once a day, and when the owner connects, Helix reads campaign results for the last 30 days: campaign id, name and status, date, cost, clicks, impressions, conversions and conversion value. It is a read-only report query; no keywords, search terms or user lists."
2. Go to **Numbers** (`/dashboard/numbers`). Show Google ad spend in the daily numbers and the MER / profit figures. Say: "Google spend is added to each day's ad spend, so the owner sees true profit after ads."
3. Go to **Numbers > Ad check** (`/dashboard/numbers/ad-check`). Say: "The monthly ad check uses the same figures to suggest fixes, like campaigns spending with no conversions. Helix suggests; the owner decides."
4. Say: "Helix never changes live campaigns or budgets and never turns on spend."

## Scene 6: the only write, a paused draft after approval (45 seconds)

1. Go to **Today** and open the task **Build a Google Search test campaign in your Google Ads account (paused)** (task id `build-google-campaign`), or the matching approval.
2. Say: "The only thing Helix ever creates is a new Search campaign and budget, and only after the owner presses Approve."
3. Click **Approve**. Then open Google Ads (ads.google.com) in a new tab, go to Campaigns and show the new `Helix-Search-TEST-<date>` campaign with status **Paused**.
4. Say: "It is created paused. The owner adds ad groups and ads and presses Enable themselves in Google Ads. The budget is capped between 10 and 100 a day and Helix checks the request is paused before it is sent."

## Scene 7: storage, disconnect and deletion (40 seconds)

1. Back in Helix on **Integrations**, scroll to the **Activity log** and show the Google Ads API calls listed. Say: "Every API call and every approval is logged for the owner."
2. Say: "What we store: the encrypted refresh token, the chosen customer id, account name and currency, and a daily summary of campaign results. That data is used only to show this owner their own numbers. It is not sold, shared or used for advertising, and it is not used to train AI models."
3. Click **Disconnect** on the Google Ads card. Say: "Disconnecting revokes our access at Google and deletes the token, the synced data and the drafts list."
4. Open https://myaccount.google.com/connections and show Helix is gone (or show it there before disconnecting and gone after).

## Close (10 seconds)

Say: "That is the full Google Ads flow in E-commerce Helix: owner-initiated consent, read-only reporting, and paused drafts only after approval." Stop recording.

## After recording

1. Upload to YouTube as **Unlisted**.
2. Add the link at https://console.cloud.google.com/auth/scopes?project=astryks.
3. Submit at https://console.cloud.google.com/auth/verification/submit?project=astryks (scope justification is already saved).

## Accuracy notes (keep in sync with the code)

- Scopes: `src/lib/google-ads/config.ts` (`GOOGLE_ADS_SCOPES`).
- Read query and daily sync: `syncGoogleAds` in `src/lib/google-ads/service.ts`, cron `/api/cron/google-ads-sync`.
- Paused campaign: `createPausedGoogleCampaign` and `assertPaused`.
- Disconnect and revoke: `disconnectGoogleAds`.
- If any of these change, update this script before recording.
