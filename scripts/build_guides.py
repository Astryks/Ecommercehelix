"""Draw Helix's own simplified screen illustrations (SVG) with numbered callouts.

These are original drawings, not screenshots. Real screens change often, so every guide links to the
platform's official help page as well. Output: public/guides/*.svg
Run: python3 scripts/build_guides.py
"""
import os
from html import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "guides")
os.makedirs(OUT, exist_ok=True)
W, H = 1200, 700
PINK = "#e11d48"
FONT = "font-family=\"Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif\""


def wrap(s, n):
    out, line = [], ""
    for w in s.split():
        if len(line) + len(w) + 1 > n:
            out.append(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        out.append(line)
    return out


class G:
    def __init__(self, title, app, accent):
        self.p = []
        self.accent = accent
        self.title, self.app = title, app

    def add(self, s):
        self.p.append(s)

    def rect(self, x, y, w, h, fill="#fff", stroke="#e2e8f0", r=8, sw=1):
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def text(self, x, y, s, size=13, weight=400, fill="#0f172a", anchor="start"):
        self.add(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{escape(s)}</text>')

    def button(self, x, y, w, label, primary=True, h=32):
        self.rect(x, y, w, h, self.accent if primary else "#fff", self.accent if primary else "#cbd5e1", 6)
        self.text(x + w / 2, y + h / 2 + 5, label, 13, 600, "#fff" if primary else "#0f172a", "middle")

    def field(self, x, y, w, label, value, h=34):
        self.text(x, y, label, 12, 600, "#475569")
        self.rect(x, y + 8, w, h, "#fff", "#cbd5e1", 6)
        self.text(x + 10, y + 8 + h / 2 + 5, value, 13, 400, "#0f172a")

    def toggle(self, x, y, on):
        self.rect(x, y, 36, 20, self.accent if on else "#cbd5e1", "none", 10)
        self.add(f'<circle cx="{x + (26 if on else 10)}" cy="{y + 10}" r="7" fill="#fff"/>')

    def line(self, x1, y1, x2, y2, c="#cbd5e1", w=1):
        self.add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"/>')

    def callout(self, n, x, y, tx=None, ty=None):
        if tx is not None:
            self.add(f'<line x1="{x}" y1="{y}" x2="{tx}" y2="{ty}" stroke="{PINK}" stroke-width="2.5" stroke-dasharray="5 4"/>')
            self.add(f'<circle cx="{tx}" cy="{ty}" r="5" fill="{PINK}"/>')
        self.add(f'<circle cx="{x}" cy="{y}" r="17" fill="{PINK}" stroke="#fff" stroke-width="3"/>')
        self.text(x, y + 6, str(n), 16, 800, "#fff", "middle")

    def highlight(self, x, y, w, h):
        self.add(f'<rect x="{x - 4}" y="{y - 4}" width="{w + 8}" height="{h + 8}" rx="10" fill="none" stroke="{PINK}" stroke-width="3"/>')

    def svg(self, steps, note):
        head = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{escape(self.title)}" {FONT}>',
                f'<title>{escape(self.title)}</title>',
                f'<rect width="{W}" height="{H}" rx="18" fill="#f8fafc"/>',
                # window
                '<rect x="20" y="20" width="820" height="620" rx="14" fill="#fff" stroke="#cbd5e1"/>',
                '<rect x="20" y="20" width="820" height="40" rx="14" fill="#f1f5f9"/><rect x="20" y="46" width="820" height="14" fill="#f1f5f9"/>',
                '<circle cx="44" cy="40" r="6" fill="#fca5a5"/><circle cx="64" cy="40" r="6" fill="#fcd34d"/><circle cx="84" cy="40" r="6" fill="#86efac"/>',
                f'<text x="430" y="45" font-size="13" fill="#64748b" text-anchor="middle">{escape(self.app)} (simplified drawing)</text>']
        # legend
        leg = [f'<rect x="860" y="20" width="320" height="620" rx="14" fill="#0f172a"/>']
        tl = wrap(self.title, 28)
        for j, ln in enumerate(tl):
            leg.append(f'<text x="884" y="{56 + j * 24}" font-size="18" font-weight="800" fill="#fff">{escape(ln)}</text>')
        y = 92 + (len(tl) - 1) * 24
        for i, s in enumerate(steps, 1):
            leg.append(f'<circle cx="896" cy="{y - 5}" r="13" fill="{PINK}"/><text x="896" y="{y}" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">{i}</text>')
            for j, ln in enumerate(wrap(s, 34)):
                leg.append(f'<text x="920" y="{y + j * 19}" font-size="14" fill="#e2e8f0">{escape(ln)}</text>')
            y += 19 * len(wrap(s, 34)) + 18
        foot = [f'<text x="24" y="668" font-size="12" fill="#64748b">{escape(note)}</text>',
                '<text x="1176" y="668" font-size="12" fill="#64748b" text-anchor="end">Ecommerce Helix guide · not a real screenshot</text></svg>']
        return "\n".join(head + self.p + leg + foot)


def save(name, g, steps, note="Screens change often. Labels on your screen may look a little different."):
    open(os.path.join(OUT, name + ".svg"), "w").write(g.svg(steps, note))


def ads_manager_frame(g, tab="Campaigns"):
    g.rect(20, 60, 56, 580, "#f8fafc", "#e2e8f0", 0)
    for i in range(6):
        g.rect(36, 84 + i * 48, 24, 24, "#e2e8f0", "none", 6)
    g.text(96, 92, "Ads Manager", 18, 800)
    for i, t in enumerate(["Campaigns", "Ad sets", "Ads"]):
        x = 96 + i * 150
        g.rect(x, 108, 140, 36, "#eff6ff" if t == tab else "#fff", g.accent if t == tab else "#e2e8f0", 6)
        g.text(x + 70, 131, t, 13, 700 if t == tab else 500, g.accent if t == tab else "#334155", "middle")


# ---------- Meta 1: create a Sales campaign ----------
g = G("Start a Sales campaign", "Meta Ads Manager", "#1877f2")
ads_manager_frame(g)
g.button(96, 160, 100, "+ Create")
g.rect(96, 208, 720, 30, "#f8fafc", "#e2e8f0", 4)
for i, h in enumerate(["Off/On", "Campaign", "Results", "Cost per result", "Amount spent"]):
    g.text(110 + i * 140, 228, h, 12, 700, "#475569")
for r in range(3):
    g.rect(96, 240 + r * 34, 720, 34, "#fff", "#f1f5f9", 0)
    g.rect(110, 248 + r * 34, 120, 14, "#e2e8f0", "none", 4)
# modal
g.add('<rect x="20" y="60" width="820" height="580" fill="#0f172a" opacity="0.35"/>')
g.rect(250, 150, 380, 420, "#fff", "#cbd5e1", 12)
g.text(274, 186, "Choose a campaign objective", 17, 800)
objs = ["Awareness", "Traffic", "Engagement", "Leads", "App promotion", "Sales"]
for i, o in enumerate(objs):
    y = 208 + i * 50
    sel = o == "Sales"
    g.rect(274, y, 332, 40, "#eff6ff" if sel else "#fff", g.accent if sel else "#e2e8f0", 8, 2 if sel else 1)
    g.add(f'<circle cx="296" cy="{y + 20}" r="8" fill="{"#1877f2" if sel else "#fff"}" stroke="#94a3b8"/>')
    g.text(316, y + 25, o, 14, 700 if sel else 500)
g.button(516, 520, 90, "Continue")
g.callout(1, 160, 150, 146, 168)
g.callout(2, 660, 478, 606, 478)
g.callout(3, 660, 536, 606, 536)
save("meta-1-create-sales-campaign", g, [
    "Open Ads Manager and press + Create.",
    "Pick Sales. This tells Meta to find people who buy, not just people who click.",
    "Press Continue. Name the campaign with your naming pattern on the next screen."])

# ---------- Meta 2: budget, pixel, audience ----------
g = G("Set budget, sales tracking and audience", "Meta Ads Manager", "#1877f2")
ads_manager_frame(g, "Ad sets")
g.rect(96, 160, 340, 460, "#fff", "#e2e8f0", 10)
g.text(116, 190, "Campaign", 15, 800)
g.field(116, 214, 300, "Budget", "Campaign budget · Daily")
g.field(116, 274, 300, "Daily budget", "$120.00")
g.field(116, 334, 300, "Bid strategy", "Highest volume")
g.rect(456, 160, 360, 460, "#fff", "#e2e8f0", 10)
g.text(476, 190, "Ad set", 15, 800)
g.field(476, 214, 320, "Conversion location", "Website")
g.field(476, 274, 320, "Pixel and event", "My store pixel · Purchase")
g.field(476, 334, 320, "Location", "Australia")
g.text(476, 404, "Advantage+ audience", 12, 600, "#475569")
g.toggle(756, 392, True)
g.text(476, 444, "Placements", 12, 600, "#475569")
g.rect(476, 452, 320, 34, "#eff6ff", "#93c5fd", 6)
g.text(486, 474, "Advantage+ placements (recommended)", 13)
g.callout(1, 76, 300, 116, 300)
g.callout(2, 836, 300, 796, 300)
g.callout(3, 836, 360, 796, 360)
g.callout(4, 836, 470, 796, 470)
save("meta-2-budget-pixel-audience", g, [
    "Set one daily budget for the whole campaign. Start at 2 to 3 times your target cost per sale.",
    "Choose Website, your pixel and the Purchase event, so Meta learns from real sales.",
    "Pick your country. Leave Advantage+ audience on so Meta can find buyers.",
    "Keep Advantage+ placements so your ads can show everywhere they work."])

# ---------- Meta 3: the ad ----------
g = G("Write the ad and add tracking", "Meta Ads Manager", "#1877f2")
ads_manager_frame(g, "Ads")
g.rect(96, 160, 420, 460, "#fff", "#e2e8f0", 10)
g.field(116, 190, 380, "Identity", "Your Facebook Page · Your Instagram")
g.text(116, 262, "Media", 12, 600, "#475569")
g.rect(116, 270, 380, 70, "#f8fafc", "#cbd5e1", 6)
g.text(306, 312, "+ Add video or image", 13, 600, "#475569", "middle")
g.field(116, 368, 380, "Primary text", "Real reviews, easy returns...")
g.field(116, 428, 380, "Headline", "See what customers love")
g.field(116, 488, 380, "Website URL", "https://yourstore.com")
g.field(116, 548, 380, "URL parameters", "utm_source=facebook&...")
g.rect(536, 160, 280, 400, "#f8fafc", "#e2e8f0", 10)
g.text(676, 188, "Preview", 13, 700, "#475569", "middle")
g.rect(566, 204, 220, 300, "#fff", "#e2e8f0", 10)
g.rect(578, 236, 196, 180, "#e2e8f0", "none", 6)
g.rect(578, 428, 140, 12, "#cbd5e1", "none", 4)
g.button(578, 452, 110, "Shop now", False, 28)
g.button(716, 580, 100, "Publish")
g.callout(1, 76, 214, 116, 214)
g.callout(2, 76, 305, 116, 305)
g.callout(3, 76, 394, 116, 394)
g.callout(4, 76, 570, 116, 570)
g.callout(5, 760, 540, 766, 580)
save("meta-3-write-the-ad", g, [
    "Choose your Facebook Page and Instagram account. The ad runs from them.",
    "Add your video or photo. Tall video works best.",
    "Write the main text and a short headline. Start with your best opening line.",
    "Add your store link and UTM tags, so you can see sales from this ad.",
    "Check the preview. Press Publish only when you are happy."])

# ---------- Meta 4: review a Helix paused draft ----------
g = G("Review a Helix draft and launch it", "Meta Ads Manager", "#1877f2")
ads_manager_frame(g)
g.rect(96, 160, 720, 30, "#f8fafc", "#e2e8f0", 4)
for x, h in [(110, "Off/On"), (180, "Campaign"), (470, "Spent"), (560, "Purchases"), (660, "Cost per purchase")]:
    g.text(x, 180, h, 12, 700, "#475569")
rows = [("Helix-Cold-Broad-TEST-20261006", False, "$0", "0", "n/a", True), ("01-Auto-Cold-Broad-BAU", True, "$952", "22", "$43.27", False), ("05-Warm-Visitors180", True, "$280", "14", "$20.00", False)]
for i, (n, on, sp, pu, cp, hl) in enumerate(rows):
    y = 192 + i * 46
    g.rect(96, y, 720, 46, "#fff7ed" if hl else "#fff", "#f1f5f9", 0)
    g.toggle(112, y + 13, on)
    g.text(180, y + 22, n, 13, 700 if hl else 500)
    g.text(180, y + 38, "Off · draft by Helix" if hl else "Active", 11, 400, "#64748b")
    g.text(470, y + 28, sp, 13); g.text(560, y + 28, pu, 13); g.text(660, y + 28, cp, 13)
g.text(330, 230, "Edit", 12, 700, g.accent)
g.highlight(96, 192, 720, 46)
g.rect(96, 360, 720, 250, "#f8fafc", "#e2e8f0", 10)
g.text(116, 390, "Before you switch it on", 15, 800)
for i, t in enumerate(["Change the text to sound like you", "Add your own video or photos", "Check the link opens the right page", "Check the daily budget is what you want"]):
    g.rect(116, 408 + i * 44, 18, 18, "#fff", "#94a3b8", 4)
    g.text(146, 422 + i * 44, t, 14)
g.callout(1, 60, 215, 96, 215)
g.callout(2, 420, 270, 362, 226)
g.callout(3, 150, 300, 130, 215)
save("meta-4-review-helix-draft", g, [
    "Find the campaign Helix made. It starts with 'Helix' and is switched off.",
    "Press Edit. Change the words, add your own photos or videos, and check the budget.",
    "When you are happy, flip the switch to On. That is you launching it. Helix never does this step."],
    "Helix only creates paused drafts. Nothing spends money until you switch it on.")

# ---------- Google 1: Performance Max ----------
g = G("Start a shopping campaign", "Google Ads", "#1a73e8")
g.rect(20, 60, 180, 580, "#f8fafc", "#e2e8f0", 0)
for i, t in enumerate(["Overview", "Campaigns", "Insights and reports", "Tools", "Billing"]):
    g.text(40, 100 + i * 40, t, 14, 700 if t == "Campaigns" else 400, g.accent if t == "Campaigns" else "#334155")
g.add(f'<circle cx="250" cy="110" r="22" fill="{g.accent}"/><text x="250" y="118" font-size="26" fill="#fff" text-anchor="middle">+</text>')
g.text(282, 116, "New campaign", 14, 600)
g.text(230, 176, "What is your goal?", 16, 800)
for i, o in enumerate(["Sales", "Leads", "Website traffic", "Awareness"]):
    x = 230 + i * 150
    sel = o == "Sales"
    g.rect(x, 190, 138, 70, "#e8f0fe" if sel else "#fff", g.accent if sel else "#e2e8f0", 8, 2 if sel else 1)
    g.text(x + 69, 230, o, 14, 700 if sel else 500, "#0f172a", "middle")
g.text(230, 300, "Campaign type", 16, 800)
for i, o in enumerate(["Performance Max", "Search", "Shopping", "Video"]):
    x = 230 + i * 150
    sel = o == "Performance Max"
    g.rect(x, 314, 138, 60, "#e8f0fe" if sel else "#fff", g.accent if sel else "#e2e8f0", 8, 2 if sel else 1)
    g.text(x + 69, 349, o, 13, 700 if sel else 500, "#0f172a", "middle")
g.field(230, 410, 560, "Product list (Merchant Center)", "My store products")
g.field(230, 480, 560, "Brand exclusions", "Exclude: your brand name")
g.button(690, 580, 100, "Continue")
g.callout(1, 430, 110, 395, 110)
g.callout(2, 380, 225, 368, 225)
g.callout(3, 380, 344, 368, 344)
g.callout(4, 812, 432, 790, 432)
g.callout(5, 812, 502, 790, 502)
save("google-1-performance-max", g, [
    "In Google Ads, press the + button to start a new campaign.",
    "Pick Sales as the goal.",
    "Pick Performance Max. It shows your products across Google.",
    "Link your product list from Merchant Center.",
    "Exclude your brand name, so this campaign finds new customers."])

# ---------- Google 2: search terms and negatives ----------
g = G("Block searches that waste money", "Google Ads", "#1a73e8")
g.rect(20, 60, 180, 580, "#f8fafc", "#e2e8f0", 0)
for i, t in enumerate(["Overview", "Campaigns", "Insights and reports", "  Search terms", "Tools"]):
    g.text(40, 100 + i * 40, t, 14, 700 if "Search" in t else 400, g.accent if "Search" in t else "#334155")
g.text(230, 100, "Search terms", 18, 800)
g.rect(230, 120, 590, 34, "#f8fafc", "#e2e8f0", 4)
for x, h in [(276, "Search term"), (560, "Clicks"), (640, "Cost ▼"), (730, "Sales")]:
    g.text(x, 142, h, 12, 700, "#475569")
terms = [("linen shirt pattern free", "41", "$64.20", "0", True), ("mens linen shirt", "88", "$51.10", "6", False), ("linen shirt jobs", "22", "$41.00", "0", True), ("linen shirt sale", "35", "$29.40", "3", False)]
for i, (t, c, co, sa, bad) in enumerate(terms):
    y = 156 + i * 40
    g.rect(230, y, 590, 40, "#fff1f2" if bad else "#fff", "#f1f5f9", 0)
    g.rect(244, y + 12, 16, 16, g.accent if bad else "#fff", "#94a3b8", 3)
    g.text(276, y + 25, t, 13); g.text(560, y + 25, c, 13); g.text(640, y + 25, co, 13); g.text(730, y + 25, sa, 13)
g.button(230, 340, 220, "Add as negative keyword")
g.callout(1, 210, 220, 196, 220)
g.callout(2, 690, 100, 668, 136)
g.callout(3, 212, 300, 244, 262)
g.callout(4, 480, 356, 450, 356)
save("google-2-block-wasted-searches", g, [
    "Open Insights and reports, then Search terms.",
    "Sort by Cost, highest first.",
    "Tick searches that cost money, never sold, and have nothing to do with your products.",
    "Press Add as negative keyword. Google stops showing your ads for them."])

# ---------- Shopify 1: read yesterday's numbers ----------
g = G("Find yesterday's numbers", "Shopify admin", "#008060")
g.rect(20, 60, 180, 580, "#f1f5f9", "#e2e8f0", 0)
for i, t in enumerate(["Home", "Orders", "Products", "Customers", "Analytics", "Marketing", "Settings"]):
    g.text(40, 100 + i * 40, t, 14, 700 if t == "Analytics" else 400, g.accent if t == "Analytics" else "#334155")
g.rect(230, 84, 150, 32, "#fff", "#cbd5e1", 6)
g.text(246, 105, "Yesterday ▾", 13, 600)
cards = [("Total sales", "$2,184"), ("Orders", "24"), ("Sessions", "1,090"), ("Conversion rate", "2.2%"), ("Average order value", "$91")]
for i, (k, v) in enumerate(cards):
    x = 230 + (i % 3) * 196
    y = 140 + (i // 3) * 120
    g.rect(x, y, 182, 100, "#fff", "#e2e8f0", 10)
    g.text(x + 16, y + 30, k, 13, 600, "#475569")
    g.text(x + 16, y + 70, v, 26, 800)
g.rect(230, 400, 574, 200, "#f0fdf4", "#86efac", 10)
g.text(250, 432, "Type these into Helix (Today > Update yesterday):", 14, 700, "#14532d")
for i, t in enumerate(["Sales: $2,184", "Orders: 24", "Meta and Google ad spend (Meta fills itself if connected)"]):
    g.text(270, 466 + i * 30, f"{i + 1}. {t}", 14, 400, "#14532d")
g.callout(1, 210, 260, 196, 260)
g.callout(2, 400, 100, 380, 100)
g.callout(3, 384, 172, 348, 196)
save("shopify-1-yesterdays-numbers", g, [
    "In Shopify, open Analytics.",
    "Set the date to Yesterday.",
    "Read Total sales and Orders. Type them into the Update yesterday box in Helix."])

# ---------- Shopify 2: free shipping threshold ----------
g = G("Set a free shipping amount", "Shopify admin", "#008060")
g.rect(20, 60, 180, 580, "#f1f5f9", "#e2e8f0", 0)
for i, t in enumerate(["Settings", "  General", "  Payments", "  Shipping and delivery", "  Taxes"]):
    g.text(40, 100 + i * 40, t, 14, 700 if "Shipping" in t else 400, g.accent if "Shipping" in t else "#334155")
g.text(230, 100, "Shipping and delivery", 18, 800)
g.rect(230, 120, 580, 120, "#fff", "#e2e8f0", 10)
g.text(250, 150, "General shipping rates", 14, 700)
g.text(250, 176, "Domestic · Standard $9.95", 13, 400, "#475569")
g.button(690, 190, 100, "Add rate", False)
g.add('<rect x="20" y="60" width="820" height="580" fill="#0f172a" opacity="0.3"/>')
g.rect(300, 250, 460, 330, "#fff", "#cbd5e1", 12)
g.text(324, 284, "Add rate", 17, 800)
g.field(324, 306, 410, "Rate name", "Free shipping")
g.field(324, 366, 410, "Price", "$0.00")
g.rect(324, 430, 18, 18, g.accent, g.accent, 4)
g.text(352, 444, "Offer free shipping over a minimum amount", 13)
g.field(324, 462, 410, "Minimum order amount", "$120.00")
g.button(654, 530, 80, "Done")
g.callout(1, 210, 220, 196, 220)
g.callout(2, 800, 206, 790, 206)
g.callout(3, 290, 440, 324, 440)
g.callout(4, 290, 492, 324, 492)
g.callout(5, 754, 546, 734, 546)
save("shopify-2-free-shipping", g, [
    "Open Settings, then Shipping and delivery.",
    "In your shipping rates, press Add rate.",
    "Name it Free shipping and turn on 'offer free shipping over a minimum amount'.",
    "Type your amount: about 1.3 times your AOV.",
    "Press Done, then Save."])

# ---------- Helix 1: daily update ----------
g = G("Update yesterday in Helix", "Ecommerce Helix", "#10b981")
g.rect(20, 60, 160, 580, "#0b1020", "none", 0)
for i, t in enumerate(["Today", "Insights", "Approvals", "Scorecard", "Campaigns"]):
    g.text(40, 100 + i * 36, t, 13, 700 if t == "Today" else 400, "#fff" if t == "Today" else "#94a3b8")
g.rect(200, 84, 620, 250, "#fff", "#e2e8f0", 12)
g.text(222, 116, "PROFIT YESTERDAY", 12, 700, "#64748b")
g.text(222, 176, "$412", 56, 800, "#059669")
g.text(222, 214, "What this means today: Better than your 7-day", 14, 400, "#334155")
g.text(222, 234, "average of $361. Keep doing what worked.", 14, 400, "#334155")
g.rect(200, 354, 620, 250, "#f8fafc", "#e2e8f0", 12)
g.text(222, 386, "Update yesterday (1 minute)", 15, 800)
g.field(222, 410, 280, "Sales ($)", "2,184")
g.field(518, 410, 280, "Orders", "24")
g.field(222, 474, 280, "Meta ads ($)  synced", "330")
g.field(518, 474, 280, "Google ads ($)", "95")
g.button(222, 548, 576, "Save and show my profit", True, 38)
g.callout(1, 190, 440, 222, 440)
g.callout(2, 830, 440, 798, 440)
g.callout(3, 190, 504, 222, 504)
g.callout(4, 530, 600, 510, 586)
g.callout(5, 400, 150, 372, 160)
save("helix-1-daily-update", g, [
    "Type yesterday's sales from your store.",
    "Type the number of orders.",
    "Check ad spend. Meta fills in by itself when connected. Add Google if you use it.",
    "Press Save.",
    "Read your profit and the one line that tells you what to do today."],
    "This is Helix itself. Your numbers stay private to your account.")
print("guides", len([f for f in os.listdir(OUT) if f.endswith('.svg')]))
