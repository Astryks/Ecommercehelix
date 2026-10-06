"""Build docs/email-automation.md from src/lib/seed/flows.json."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
flows = json.load(open(os.path.join(ROOT, "src", "lib", "seed", "flows.json")))
L = ["# Email and SMS automation: suggest, draft, approve, set up", "",
"Helix watches for missing or under-performing flows (the `email-gap` rule in the [audit engine](audit-engine.md)), suggests the flow with the evidence, drafts the copy and the flow logic in your brand voice, and sets it up in your email platform **only after you approve**. Every flow can also be done by hand with the guide in [Playbook Module 10](playbook/10-email-sms-whatsapp.md).", "",
"## How it works", "",
"1. **Detect.** Daily pull from the email platform: which flows exist, are live, and what they earn. Compare against the core set below and against store data (for example replenishment only for consumables, VIP only once there are repeat buyers).",
"2. **Suggest.** An insight in Today and Insights: \"You have no abandoned checkout flow. Stores like yours often recover a meaningful share of checkouts with one.\" with the evidence (checkouts started, recovered, revenue).",
"3. **Draft.** Helix writes each message (subject, preview, body, SMS text) using your brand core, best sellers, reviews and offer rules. It also sets timing, filters and exit conditions.",
"4. **Approve.** You see the full flow in the approval queue: messages, timing, discount logic and estimated AI cost. Edit, approve or reject.",
"5. **Set up.** On approval, Helix creates templates, segments and the flow in **Klaviyo** through its API (draft status first, then live after a final check). For **Shopify Email** and **Shopify Flow**, where creation by API is limited, Helix prepares the content and a guided click-by-click setup, and verifies it once live.",
"6. **Watch.** Weekly: revenue per recipient, conversion, unsubscribe and spam rates. Helix suggests A/B tests on subject lines and timing.", "",
"Guardrails: no message goes live without approval; discounts follow your offer rules (new customers only, never bigger than your public offer); SMS always carries opt-out and respects quiet hours; flows start in draft; everything is logged and reversible.", "",
"Status in the app: the Email automation page lists all flows with **example** status and revenue, shows the drafts below, and \"Draft and set up for me\" creates an approval. Platform write calls are stubbed.", "",
"## The flows", "",
"| Flow | Trigger | Goal | Example status |", "| --- | --- | --- | --- |"]
for f in flows:
    L.append(f'| [{f["name"]}](#{f["id"]}) | {f["trigger"]} | {f["goal"]} | {f["example"]["status"]} |')
L.append("")
for f in flows:
    L += [f'<a id="{f["id"]}"></a>', f'### {f["name"]}', "",
          f'- **Trigger:** {f["trigger"]}', f'- **Goal:** {f["goal"]}', f'- **Exit when:** {f["exitWhen"]}',
          f'- **Discount rule:** {f["discount"]}', f'- **What good looks like:** {f["benchmark"]}', f'- **Plan:** {f["tier"].title()}', "",
          "| # | When | Channel | Subject | Preview | Draft body |", "| --- | --- | --- | --- | --- | --- |"]
    for i, e in enumerate(f["emails"]):
        subj = e["subject"] if e["channel"] == "Email" else "(SMS)"
        L.append(f'| {i+1} | {e["delay"]} | {e["channel"]} | {subj} | {e["preview"]} | {e["body"]} |')
    L.append("")
L += ["## Writing rules Helix follows", "",
"- One goal and one main button per email.",
"- Subject lines under 45 characters; preview text adds new information.",
"- Use customer language from reviews; show one review in most emails.",
"- Plain-text style for founder notes; designed blocks for product emails.",
"- Mobile first: short paragraphs, big buttons, images under 1 MB.",
"- Replace `[Brand]`, `[Product]` and other placeholders from store data; never invent claims, reviews or numbers.", ""]
open(os.path.join(ROOT, "docs", "email-automation.md"), "w").write("\n".join(L))
print("ok", len(flows))
