"""Adds a short 'In plain words' box to the top of every playbook module and
embeds the step-by-step drawings from public/guides/ under the right lessons.

Safe to run again: it replaces its own blocks (between the HTML comment markers).
Run: python3 scripts/plain_layer.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from glossary_source import G  # noqa: E402

DEFS = {t[0]: t[2] for t in G}
PB = os.path.join(ROOT, "docs", "playbook")

# module number: (what it is, why it matters, [do this steps], [words to know])
PLAIN = {
 1: ("Each morning you check one number: did yesterday make a profit?",
     "Sales can go up while you lose money. Profit is what pays you, so every other choice starts here.",
     ["Write down your costs once: product cost, shipping, payment fees and monthly bills.",
      "Each morning, type yesterday's sales, orders and ad spend into Helix (2 minutes).",
      "Read the profit number and the one line that tells you what to do today."],
     ["Profit", "Revenue", "Break-even ROAS", "MER"]),
 2: ("Before you change anything, find the one thing holding profit back.",
     "Fixing the wrong thing wastes weeks. Usually only one problem is the real blocker at a time.",
     ["Look at your numbers: visits, conversion rate, order value and ad costs.",
      "Find the weakest one compared with a healthy range.",
      "Fix only that one this week, then check again."],
     ["Conversion rate", "AOV", "CPA"]),
 3: ("Your offer is what people get and why they should buy now.",
     "A great offer makes every ad and email work better. A weak one makes everything cost more.",
     ["Write down why a customer should buy from you instead of waiting.",
      "Add one reason to act now, like a bundle, a gift or free shipping over an amount.",
      "Check which products make the most profit and push those first."],
     ["Margin", "Bundle", "Guarantee"]),
 4: ("Your brand is how people recognise and remember you.",
     "People buy from brands they trust. A clear brand makes ads cheaper and customers more loyal.",
     ["Write one sentence on who you help and how.",
      "Pick 3 to 4 topics you will always post about.",
      "Post on a simple, steady schedule you can keep."],
     ["Organic", "UGC"]),
 5: ("A simple system for making ads: plan, write, film, test, repeat.",
     "The ad itself is the biggest lever you control. New, better ads are what keep sales growing.",
     ["Pick one reason to buy (an angle) and write 3 opening lines (hooks).",
      "Make 3 short ads, phone video is fine.",
      "Test them side by side and keep the one with the lowest cost per sale."],
     ["Creative", "Hook", "Angle", "Hook rate"]),
 6: ("How to plan one ad campaign from start to finish.",
     "A plan with clear numbers tells you when to spend more, wait or stop, so you never guess.",
     ["Set your target cost per sale from your break-even numbers.",
      "Choose the goal (sales), the audience and the daily budget.",
      "Launch, wait for enough data, then decide: spend more, wait, new ads or stop."],
     ["Campaign", "Ad set", "Target CPA", "Break-even CPA"]),
 7: ("How to set up and run Facebook and Instagram ads in about 10 minutes a day.",
     "For most stores, Meta is where most new customers come from. Doing the basics well beats clever tricks.",
     ["Set up your pixel so Meta can see sales.",
      "Start one Sales campaign with broad targeting and 3 ads.",
      "Each day, check cost per sale against your target and act on the plain-English verdict in Helix."],
     ["Pixel", "Advantage+", "Learning phase", "CPA"]),
 8: ("How to show your products on Google when people search for them.",
     "People on Google are already looking to buy. It catches demand your other ads create.",
     ["Connect your product list (Merchant Center).",
      "Start a Performance Max campaign and exclude your brand name.",
      "Once a week, block searches that cost money and never sell."],
     ["PMax", "Product feed", "Search terms", "Negative keyword"]),
 9: ("How to turn more of your visitors into buyers, and get bigger orders.",
     "If more visitors buy, every ad dollar goes further without spending more.",
     ["Make the top of each product page clear: what it is, price, reviews, add to cart.",
      "Remove anything that slows checkout and turn on express payment buttons.",
      "Set a free shipping amount a bit above your average order."],
     ["Conversion rate", "Above the fold", "Free shipping threshold", "AOV"]),
 10: ("Emails and texts that send themselves when someone does something, plus regular newsletters.",
      "Your list is free to reach. Good automatic emails earn money every day while you sleep.",
      ["Turn on the welcome, abandoned checkout and thank-you emails first.",
       "Send a helpful email to your list once or twice a week.",
       "Check sales from email each week and fix the weakest flow."],
      ["Flow", "Abandoned checkout", "Segment", "Campaign email"]),
 11: ("Ways to collect more emails and followers you can reach for free.",
      "A bigger list makes every launch and sale cheaper, because you do not have to pay to reach them.",
      ["Add a pop-up with a clear reason to sign up.",
       "Run ads that collect emails when ad costs are low.",
       "Welcome every new subscriber with a short series."],
      ["Pop-up", "Custom audience", "LTV"]),
 12: ("When to add TikTok, Pinterest and search, and how to be found by AI assistants.",
      "New channels can help, but only after Meta and Google are working. Add one at a time.",
      ["Only start a new channel once your main ads are profitable.",
       "Reuse your best ads, edited for the new channel.",
       "Write clear product titles and descriptions so search engines understand them."],
      ["SEO", "Meta description", "Organic"]),
 13: ("How to plan sales and launches so they make money, not just noise.",
      "Busy periods can make your year. Planned sales are far more profitable than last-minute ones.",
      ["Mark your big dates for the year.",
       "For each sale, set a profit target and the discount you can afford.",
       "Warm up your list and audiences before the sale starts."],
      ["Warm audience", "Margin"]),
 14: ("How to keep the right amount of stock and enough cash in the bank.",
      "Running out of stock stops sales. Too much stock ties up cash you need for ads.",
      ["Check how many weeks of stock you have for your best sellers.",
       "Order before you drop below your safe level.",
       "Keep a simple 13-week cash forecast and update it weekly."],
      ["Weeks of cover", "Cash forecast"]),
 15: ("A careful way to start selling in other countries.",
      "New countries can add growth, but only if shipping, prices and ads make sense there.",
      ["Start with the country that already buys from you most.",
       "Set local prices and clear shipping costs.",
       "Test small ad budgets before you go big."],
      ["Conversion rate", "CPA"]),
 16: ("How to spend your time on what grows the business, and when to get help.",
      "You are the bottleneck. A simple weekly rhythm keeps you focused and calm.",
      ["Block 15 minutes each morning for your numbers and one task.",
       "Write down tasks you repeat and hand them off when you can.",
       "Hire for the job that frees most of your time first."],
      ["KPI"]),
 17: ("How to use AI tools safely to save hours each week.",
      "AI can draft ads, emails and reports fast. You still check and approve.",
      ["Give your AI helper notes about your brand, customers and offers.",
       "Use it for first drafts, then edit in your own words.",
       "Never let it spend money or send messages without your approval."],
      ["Creative", "Campaign email"]),
 18: ("Which apps and tools you need at each stage, and which to skip.",
      "Too many apps slow your store and cost money. Fewer, better tools win.",
      ["List every app you pay for.",
       "Remove ones you do not use each week.",
       "Add a tool only when it solves a problem you have today."],
      ["Landing page"]),
 19: ("How to work with creators and make video ads people watch.",
      "Real people showing your product often sell better than polished brand ads.",
      ["Find 3 small creators who already like your kind of product.",
       "Send a short brief: the problem, the product, the opening line ideas.",
       "Run their best video as a partnership ad and compare cost per sale."],
      ["Creator", "UGC", "Partnership ad", "Hook"]),
 20: ("How to set up ads correctly and read your results like a pro.",
      "Good setup means you can trust the numbers. Good reading means you fix the real problem.",
      ["Check that your pixel and sales tracking work before you spend.",
       "Set up your campaign step by step (drawings below).",
       "When results drop, check in order: the ad, the page, the offer, the checkout."],
      ["Pixel", "UTM", "Attribution", "Funnel"]),
 21: ("How to make your social profiles look trustworthy and match your ads.",
      "People check your profile before they buy. A good one turns ad viewers into followers and buyers.",
      ["Make your bio say who you help and link to your best page.",
       "Pin 3 posts: your best product, real reviews and your story.",
       "Post on a schedule you can keep."],
      ["Organic", "UGC"]),
}

# (module file prefix, lesson heading prefix, guide file, alt text, official help label, url)
MH = "https://www.facebook.com/business/help/1658289035439772"
GUIDES = [
 ("07", "## Lesson 7.4", "meta-1-create-sales-campaign", "Start a Sales campaign in Meta Ads Manager", "Meta: create a campaign in Ads Manager", MH),
 ("07", "## Lesson 7.4", "meta-2-budget-pixel-audience", "Set budget, sales tracking and audience", None, None),
 ("07", "## Lesson 7.4", "meta-3-write-the-ad", "Write the ad and add tracking", None, None),
 ("07", "## Lesson 7.4", "meta-4-review-helix-draft", "Review a Helix draft and launch it", None, None),
 ("20", "## Lesson 20.3", "meta-1-create-sales-campaign", "Start a Sales campaign in Meta Ads Manager", "Meta: create a campaign in Ads Manager", MH),
 ("20", "## Lesson 20.3", "meta-2-budget-pixel-audience", "Set budget, sales tracking and audience", None, None),
 ("20", "## Lesson 20.3", "meta-3-write-the-ad", "Write the ad and add tracking", None, None),
 ("20", "## Lesson 20.3", "meta-4-review-helix-draft", "Review a Helix draft and launch it", None, None),
 ("08", "## Lesson 8.3", "google-1-performance-max", "Start a Performance Max campaign in Google Ads", "Google: about Performance Max campaigns", "https://support.google.com/google-ads/answer/10724817"),
 ("08", "## Lesson 8.8", "google-2-block-wasted-searches", "Block searches that waste money", "Google: search terms report", "https://support.google.com/google-ads/answer/2472708"),
 ("20", "## Lesson 20.4", "google-1-performance-max", "Start a Performance Max campaign in Google Ads", "Google: about Performance Max campaigns", "https://support.google.com/google-ads/answer/10724817"),
 ("20", "## Lesson 20.4", "google-2-block-wasted-searches", "Block searches that waste money", "Google: add negative keywords", "https://support.google.com/google-ads/answer/2453972"),
 ("09", "## Lesson 9.11", "shopify-2-free-shipping", "Set a free shipping amount in Shopify", "Shopify: set up shipping rates", "https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates"),
 ("01", "## Lesson 1.3", "shopify-1-yesterdays-numbers", "Find yesterday's numbers in Shopify", "Shopify: reports and analytics", "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports"),
 ("01", "## Lesson 1.3", "helix-1-daily-update", "Update yesterday in Helix", None, None),
]

START, END = "<!-- plain:start -->", "<!-- plain:end -->"


def plain_box(n):
    what, why, steps, words = PLAIN[n]
    lines = [START, "> **In plain words**", ">", f"> **What it is:** {what}", ">", f"> **Why it matters:** {why}", ">", "> **Do this:**", ">"]
    lines += [f"> {i}. {s}" for i, s in enumerate(steps, 1)]
    lines += [">", "> **Words to know:**", ">"]
    for w in words:
        lines.append(f"> - **{w}:** {DEFS[w]}")
    lines += [">", "> All words are explained in the [glossary](../glossary.md).", END]
    return "\n".join(lines)


def guide_block(g):
    _, _, name, alt, label, url = g
    out = [f"<!-- guide:{name} -->", f"![{alt}](../../public/guides/{name}.svg)", ""]
    out.append(f"*Drawing, not a real screenshot. Labels on your screen may look a little different.*" + (f" Official help: [{label}]({url})" if url else ""))
    out.append(f"<!-- /guide:{name} -->")
    return "\n".join(out)


def main():
    for f in sorted(os.listdir(PB)):
        if not re.match(r"^\d\d-.*\.md$", f):
            continue
        n = int(f[:2])
        p = os.path.join(PB, f)
        md = open(p).read()
        md = re.sub(r"\n?<!-- plain:start -->.*?<!-- plain:end -->\n?", "\n", md, flags=re.S)
        md = re.sub(r"\n?<!-- guide:([a-z0-9-]+) -->.*?<!-- /guide:\1 -->\n?", "\n", md, flags=re.S)
        md = re.sub(r"\n{3,}", "\n\n", md)
        # plain box goes right before the first horizontal rule
        i = md.index("\n---\n")
        md = md[:i] + "\n\n" + plain_box(n) + "\n" + md[i:]
        # guides go at the end of the named lesson (before the next ## heading)
        for heading in dict.fromkeys(g[1] for g in GUIDES if g[0] == f[:2]):
            blocks = "\n\n".join(guide_block(g) for g in GUIDES if g[0] == f[:2] and g[1] == heading)
            s = md.index(heading)
            nxt = md.find("\n## ", s + 3)
            nxt = len(md) if nxt == -1 else nxt
            md = md[:nxt].rstrip("\n") + "\n\n" + blocks + "\n" + md[nxt:]
        open(p, "w").write(md)
    print("plain layer:", len(PLAIN), "modules,", len(GUIDES), "guide embeds")


if __name__ == "__main__":
    main()
