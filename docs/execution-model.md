# Execution model: Helix drafts, you launch

**Decision (6 Oct 2026):** Helix never turns on ad spend. It does the heavy lifting, then hands the final switch to the owner.

## The two modes

### 1. Draft & you launch (default when an ad account is connected)

Helix builds the complete campaign and pushes it into the user's **own** Meta or Google account as **paused drafts** through the official APIs:

- campaign structure and naming (per [Module 6](playbook/06-defining-campaigns.md) and [SOP 05](sops/05-meta-structure-and-scaling.md))
- audiences and exclusions (custom audiences, lookalikes, customer lists, negatives)
- a budget suggestion (written into the draft, based on target CPA and the user's spend cap)
- ad copy (primary text, headlines, descriptions) and UTMs
- creative: the brief, hook variants and, where the user supplies or approves assets, the ads themselves
- the campaign brief and kill/scale rules attached as a note in Helix

The user opens Ads Manager (Helix gives a deep link and a 6-point pre-launch checklist), reviews the drafts and **presses Launch themselves**.

### 2. Guide me (no account connected, or the user prefers to build)

Helix shows:

- proven ad structures by spend level (Cold, Mixed, Warm, Hot; testing vs scaling; Google brand search, feed-only PMax, non-brand search)
- a swipe file of **original example** ads (clearly labelled EXAMPLE): hooks, primary text, headlines, scripts and briefs to adapt
- a step-by-step build checklist for Ads Manager and Google Ads, with screenshot placeholders that will be replaced by annotated screenshots
- the same campaign brief and pre-launch checklist

The user builds the campaign; Helix checks it afterwards once the account is connected (or the user ticks the checklist).

## What Helix may and may not do

| Action | Helix | User |
| --- | --- | --- |
| Read account data, grade ads, raise insights | Yes (read-only scopes) | |
| Create campaigns, ad sets, ads | Yes, **always paused** | Presses Launch |
| Add new ads to a live ad set | Yes, **added paused** | Switches them on |
| Create audiences, customer lists, negative keyword lists | Yes, after approval (no spend) | Approves |
| Change a budget, bid or target on a live campaign | **No.** Helix prepares the exact change (from $120 to $144, +20%) with a deep link | Makes the change in their account |
| Launch, resume or unpause anything | **No** | Always the user |
| Pause an ad that meets the kill rule (reduces spend) | Yes, after approval | Approves (open question: allow an opt-in auto-pause rule) |
| Billing, payment methods, spend caps, verification | No | Always the user |

Guardrails in the executor:

1. Every create call sets status `PAUSED` (Meta) or `PAUSED` (Google). The executor rejects any payload with an active status.
2. The executor has no code path that writes `daily_budget`, `lifetime_budget`, bid or target values on an entity whose status is active. Budget numbers exist only on paused drafts.
3. Every change is logged with a before/after snapshot and a one-tap revert for drafts and pauses.
4. Approvals expire after 24 hours and re-check live state before executing.

## How it shows up in the app

- **Campaign tracker:** recommendations read "Scale: raise budget to $168/day in Ads Manager (you make this change)". Kills offer "Pause for me (with approval)".
- **Campaign builder** (`/dashboard/campaigns/new`): a mode switch between Draft & you launch and Guide me.
- **Daily curriculum:** "I'll do it for you" on ad days means "I'll build it as paused drafts in your account".
- **Approvals:** draft cards say "Creates paused drafts. Nothing spends until you press Launch in Ads Manager."

## Why

Owners keep control of money and accounts, which is the point of Helix (see the About page). It also lowers platform-policy and liability risk, simplifies API app review (fewer write scopes on live spend), and builds the owner's skill: they see and understand every campaign before it runs.
