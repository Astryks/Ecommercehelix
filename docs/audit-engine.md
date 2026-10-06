# Proactive audit engine and Insights

Helix does not wait to be asked. It audits the store and connected ad accounts on a schedule, compares signals across sources, and raises **insights**: a finding with evidence, why it matters, a suggested fix, and either **Do it for me** (creates an approval) or **Show me how** (opens the Learn lesson). The best one or two insights also appear in the Today feed next to the day's lesson.

Status in the app today: the Insights page and Today feed show **seeded example insights** (clearly labelled EXAMPLE). The rules engine (`src/lib/audit.ts`) runs for real on example signals. Crawlers and API pulls are stubbed.

---

## 1. Schedules

| Job | Frequency | Plan | Source |
| --- | --- | --- | --- |
| Site crawl (home, top 10 product pages, collection, cart) | Weekly, plus on demand | Free (monthly cap), paid weekly | Headless browser |
| PageSpeed (mobile and desktop) on home and top 3 product pages | Weekly | All | Google PageSpeed Insights API |
| Store checklist (pop-up, reviews, shipping info, policies, trust, payment options) | Weekly | All | Crawl output + rules |
| Shopify sales pull (orders, AOV, products, new vs returning, add-to-cart and checkout funnel) | Daily 5:00 local | Starter+ | Shopify Admin API + analytics |
| Meta insights pull (campaign, ad set, ad: spend, impressions, reach, frequency, CPM, CTR, 3s views, ThruPlays, purchases, value) | Daily 5:30 local, intraday light check in peak | Starter+ | Meta Marketing API, Insights endpoint |
| Google Ads pull (campaigns, search terms, Shopping products, conversions, value) | Daily 5:30 local | Starter+ (Growth for both platforms) | Google Ads API (GAQL) |
| Email platform pull (flows live, flow revenue, list growth, campaign results) | Daily | Growth | Klaviyo API / Shopify Email |
| Social presence audit (bio, link, highlights, pinned posts, cadence, proof, comment replies, ad consistency) | Weekly | All (public data); insights with account connection | Public profile fetch; Instagram Graph API, TikTok and Facebook Page APIs once connected |
| Cross-diagnosis rules | After each pull | All with data | Rules engine |
| Weekly report build | Monday 6:00 local | Growth | All of the above |

Jobs run from a queue (for example Vercel Cron triggering a worker, or a hosted queue such as Inngest or QStash). Each job writes raw snapshots, then normalised daily metrics, then insights.

## 2. Architecture

```
 Scheduler (cron)
   ├─ SiteAuditJob ──> crawler (headless Chromium) ─┐
   ├─ PageSpeedJob ──> PSI API ─────────────────────┤
   ├─ ShopifyPullJob ─> Admin API ──────────────────┤──> raw_snapshots (JSON, 90 days)
   ├─ MetaPullJob ───> Marketing API insights ──────┤
   ├─ GooglePullJob ─> Google Ads API ──────────────┤
   └─ EmailPullJob ──> Klaviyo API ─────────────────┘
                                  │
                         normaliser (per source)
                                  │
                       daily_metrics (store, day, source, entity, metric, value)
                                  │
                rules engine (deterministic, versioned rules)
                                  │
       insights (id, rule, severity, evidence JSON, fix, action, status)
                                  │
         ranker (impact x confidence x effort, dedupe, cooldown)
                                  │
     Today feed (top 1 to 2)  ·  Insights panel (all)  ·  Weekly report
                                  │
      "Do it for me" ──> approval ──> executor (platform API) ──> audit log
```

Design rules:

- **Deterministic first.** Rules decide what is wrong using thresholds and comparisons. The language model only writes the explanation and drafts fixes. This keeps cost low and results explainable.
- **Evidence or it does not ship.** Every insight carries the numbers and the comparison it was based on, and the date range.
- **Cooldowns.** The same rule does not re-raise for the same entity for 7 days unless it gets worse.
- **Confidence.** Rules require minimum sample sizes (for example 1,000 impressions, 300 sessions, 2x target CPA spend) before firing.
- **Read-only by default.** Pulls use read scopes. Write scopes are requested only when the user turns on "Do it for me" for that platform, and every write goes through an approval.

## 3. Site audit checklist (crawler + PageSpeed)

The social presence audit uses the checklist in [Playbook Lesson 21.9](playbook/21-brand-and-social-presence.md#lesson-219-the-social-presence-audit-what-helix-checks).

| Check | How | Fires when |
| --- | --- | --- |
| Mobile speed | PSI mobile performance score, LCP, INP, CLS | Score < 50 or LCP > 4s |
| Hero clarity | Home above the fold has headline, value proposition, CTA | Missing headline or CTA in first viewport |
| Product page proof | Reviews widget and star rating near price | No reviews above the fold |
| Shipping clarity | Shipping cost or threshold visible on product page or cart | Not found |
| Free shipping threshold | Threshold vs AOV | Threshold > 1.5x AOV or < AOV |
| Email capture | Pop-up or embedded form present | None found |
| Trust | Returns policy, contact, guarantee, payment badges | Two or more missing |
| Payment options | Wallets and buy now pay later visible at checkout | Missing |
| Images | Count, alt text, size | Fewer than 4 images on top products, images > 500 KB |
| Broken links and 404s | Crawl | Any on top pages |
| Tracking | Pixel and tag presence on page load | Missing |
| SEO basics | Title, meta description, H1, structured data | Missing on top pages |

## 4. Cross-diagnosis rules

These combine site and ad signals to find the real cause. They mirror [Playbook Lesson 20.7](playbook/20-ad-analysis-audiences-and-setup.md).

| Rule id | Condition (last 7 days unless stated) | Diagnosis | Suggested fix | Action |
| --- | --- | --- | --- | --- |
| `ad-good-site-bad` | Ad hook rate ≥ 25% and outbound CTR ≥ 1.2%, but landing page conversion rate < 50% of store average | Site or landing page problem | Mobile speed, message match, offer clarity above the fold, trust, mobile checkout | Do it for me: draft page fixes · Show me how: Module 9 |
| `atc-high-checkout-low` | Add-to-cart rate ≥ store benchmark but checkout completion < 40% | Checkout friction | Show shipping cost early, add wallets and buy now pay later, remove forced account, show delivery dates | Do it for me: draft shipping message and checkout settings checklist |
| `site-good-ctr-weak` | Site conversion rate ≥ benchmark on organic and email, Meta CTR < 0.8% across the account | Creative problem | New hooks and angles, test new formats, put the offer in the ad | Do it for me: write a creative brief |
| `fatigue` | Frequency up ≥ 25% week on week and CPM up ≥ 15% while CTR falls | Creative fatigue or saturation | Load a new batch, broaden, check reach vs spend | Do it for me: draft batch brief |
| `low-hook` | Hook rate < 20% on ads with ≥ 2,000 impressions | Weak opening | Re-cut first 3 seconds, test visual and verbal hooks | Show me how: Module 19 |
| `good-hook-low-hold` | Hook rate ≥ 30%, hold rate < 25% | Weak body | Show product sooner, add proof, tighten | Show me how: Lesson 19.9 |
| `views-no-clicks` | ThruPlays high, outbound CTR < 0.5% | Missing or weak CTA | Clear CTA and offer in ad | Do it for me: draft new CTAs |
| `mer-drift` | Platform ROAS stable, MER up ≥ 3 points over 14 days | Over-attribution, retargeting taking credit | Shift budget to cold, check new customer share | Show me how: Lesson 20.9 |
| `mobile-gap` | Mobile CR < 50% of desktop CR | Mobile UX | Mobile speed, sticky add to cart, simplify | Do it for me: draft fixes |
| `aov-levers` | AOV flat, no bundle or threshold detected | Missing AOV levers | Free shipping threshold at about 1.3x AOV, bundles, gift | Do it for me: set threshold message (approval) |
| `google-brand-share` | Brand search > 40% of Google spend | Non-brand under-invested or brand overpaying | Feed titles, PMax with brand exclusion | Do it for me: feed title rewrite |
| `search-term-waste` | Search terms with spend ≥ 1x target CPA and 0 conversions | Wasted spend | Add negatives | Do it for me: add negatives (approval) |
| `email-gap` | Email revenue share < 15% of total, or a core flow missing | Retention gap | Turn on missing flows | Do it for me: draft the flow |
| `stock-ads` | Ad spend on products with < 14 days of stock | Stockout risk | Shift budget, set back-in-stock flow | Show me how: Module 14 |
| `social-profile-gaps` | Two or more of: bio without product keyword, broken or untracked link, no post in 14 days or under 2 posts a week, fewer than 3 highlights, no pinned posts, no proof in last 10 posts, unanswered questions over 48h | Profile losing trust from ad viewers | Rewrite bio, fix link with UTMs, add highlights, pin best posts, set cadence | Do it for me: draft bios, highlights plan and calendar · Show me how: Module 21 |
| `ads-social-mismatch` | Offer or product in live ads not found in bio, pinned or last 9 posts | Inconsistent message | Mention offer in bio, pin a post, add a highlight | Show me how: Lesson 21.2 |
| `peak-runway` | Within 10 weeks of Black Friday and no plan | Unprepared for peak | Start the peak plan | Do it for me: build timeline |

## 5. Insight object

```ts
type Insight = {
  id: string;
  rule: string;            // e.g. "ad-good-site-bad"
  area: "site" | "ads" | "checkout" | "creative" | "email" | "google" | "stock" | "social";
  severity: "high" | "medium" | "low";
  title: string;           // plain English
  evidence: { label: string; value: string; benchmark?: string }[];
  why: string;             // why it matters, in money terms where possible
  fix: string[];           // suggested steps
  doIt?: { label: string; tier: "free" | "starter" | "growth"; estAiCost: number };
  learn: { slug: string; anchor?: string; label: string };
  detectedAt: string;      // ISO date
  source: string[];        // e.g. ["meta", "shopify"]
  example?: boolean;       // seeded example data
};
```

## 6. Cost control

Rules run in code (free). The model is only called to phrase the top insights and to draft fixes after the user taps Do it for me, using a small model for phrasing and a larger one only for drafting. Weekly crawl is capped at 15 pages per store on Free. All AI usage draws from the plan allowance, then the prepaid balance, and stops at $0.

## 7. Build order

1. PageSpeed + crawler checklist (no auth needed, works from a URL). Week 1 to 2.
2. Shopify read pull and funnel metrics. Week 2 to 3.
3. Meta insights pull and the ad rules. Week 3 to 4.
4. Cross-diagnosis rules that need both. Week 4.
5. Google pull and search term rules. Week 5.
6. Klaviyo pull and email gap rules. Week 6.
7. Social presence audit (public profile checks first, account insights later). Week 6.
