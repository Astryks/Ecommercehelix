/**
 * Store check heuristics. Pure functions over fetched HTML and JSON, no AI and no network,
 * so they are unit-tested with saved pages. Every finding quotes what we saw on the store.
 */

export type Severity = "high" | "medium" | "low" | "good";
export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  /** What we saw, quoting the store's own content. */
  quote: string;
  /** What to do about it, in one or two plain sentences. */
  fix: string;
  /** Playbook lesson ref, e.g. "9.4". */
  lesson?: string;
};

export type ShopifyProduct = { title: string; handle: string; body_html?: string | null; images?: unknown[]; variants?: { price?: string; compare_at_price?: string | null }[] };

export type AuditInput = {
  url: string;
  home: { status: number; body: string; bytes: number; ms: number } | null;
  products: ShopifyProduct[] | null;
  product: { url: string; status: number; body: string; bytes: number } | null;
  cartStatus: number | null;
  skipped?: string[];
};

export type Facts = {
  homeTitle: string | null;
  metaDescription: string | null;
  viewport: boolean;
  homeKb: number;
  scripts: number;
  pixels: string[];
  reviewApps: string[];
  emailCapture: string[];
  shippingText: string | null;
  freeShippingFrom: number | null;
  shopify: boolean;
  productCount: number | null;
  medianPrice: number | null;
  product: null | {
    title: string;
    url: string;
    price: number | null;
    compareAt: number | null;
    words: number;
    images: number;
    kb: number;
    productLd: boolean;
    rating: boolean;
    reviewsBeforeBuy: boolean;
    /** Readable words on the page. Low means a script-only page or a bot check. */
    pageWords: number;
    shippingMention: boolean;
    returnsMention: boolean;
    wallets: string[];
  };
  trust: { contact: boolean; about: boolean; returnsPage: boolean };
  /** Words of readable text on the home page. Very low means a script-only page or a bot check. */
  homeWords: number;
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'").replace(/&ndash;|&mdash;/g, "-").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
export const textOf = (html: string) => clean(decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<(?:[^>"']|"[^"]*"|'[^']*')*>/g, " ")));
const cut = (s: string, n = 90) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

export function metaContent(html: string, name: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const t of tags) {
    if (new RegExp(`(?:name|property)\\s*=\\s*["']${name}["']`, "i").test(t)) {
      const c = t.match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i);
      if (c) return clean(decode(c[1] ?? c[2] ?? ""));
    }
  }
  return null;
}
export const titleOf = (html: string) => {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? clean(decode(m[1])) : null;
};

const PIXELS: [string, RegExp][] = [
  ["Meta pixel", /fbq\(|connect\.facebook\.net\/[^"']*fbevents/i],
  ["Google Analytics", /gtag\(|google-analytics\.com|G-[A-Z0-9]{6,}/],
  ["Google Tag Manager", /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/],
  ["TikTok pixel", /analytics\.tiktok\.com|ttq\.load/i],
  ["Pinterest tag", /pintrk\(|s\.pinimg\.com\/ct/i],
];
const REVIEW_APPS: [string, RegExp][] = [
  ["Judge.me", /judge\.me|jdgm-/i], ["Okendo", /okendo/i], ["Yotpo", /yotpo/i], ["Stamped", /stamped\.io|stamped-/i],
  ["Loox", /loox\.io|loox-/i], ["Reviews.io", /reviews\.io|reviewsio/i], ["Trustpilot", /trustpilot/i], ["Shopify Product Reviews", /spr-badge|shopify-product-reviews/i],
];
const CAPTURE: [string, RegExp][] = [
  ["Klaviyo", /klaviyo/i], ["Privy", /privy\.com|widget\.privy/i], ["Omnisend", /omnisend/i], ["Justuno", /justuno/i], ["Mailchimp", /chimpstatic|list-manage\.com/i], ["Shopify Forms", /shopify-forms|forms\.shopifyapps/i],
];
const WALLETS: [string, RegExp][] = [
  ["Shop Pay", /shop-?pay|shopify-payment-button/i], ["Apple Pay", /apple.?pay/i], ["Google Pay", /google.?pay|gpay/i], ["PayPal", /paypal/i],
  ["Afterpay", /afterpay|clearpay/i], ["Klarna", /klarna/i], ["Zip", /\bzip(?:pay|money)?\b|zip\.co/i], ["Affirm", /affirm/i],
];
/** Names apps by kind, not by vendor, in what we show the owner (Shop Pay is Shopify's own). */
const BNPL = new Set(["Afterpay", "Klarna", "Zip", "Affirm"]);
function walletText(found: string[]): string {
  const parts: string[] = [];
  if (found.includes("Shop Pay")) parts.push("Shop Pay");
  if (found.some((w) => w !== "Shop Pay" && !BNPL.has(w))) parts.push(parts.length ? "other express wallets" : "express wallets");
  if (found.some((w) => BNPL.has(w))) parts.push("buy now pay later");
  return parts.join(", ").replace(/, ([^,]*)$/, " and $1");
}
const hits = (html: string, list: [string, RegExp][]) => list.filter(([, re]) => re.test(html)).map(([n]) => n);

const money = (s?: string | null) => (s == null || s === "" ? null : Number.isFinite(Number(s)) ? Number(s) : null);
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const a = [...xs].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

/** The first product link on the home page, for stores without /products.json. */
export function firstProductLink(html: string, base: string): string | null {
  const m = html.match(/href\s*=\s*["']([^"'#?]*\/products?\/[a-z0-9][^"'#?]*)["']/i);
  if (!m) return null;
  try { return new URL(m[1], base).toString(); } catch { return null; }
}

/** Text pieces between tags, so a quote never runs across menu items. */
export const textNodes = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/gi, "<x>").replace(/<style[\s\S]*?<\/style>/gi, "<x>").replace(/<\/?(?:span|strong|em|b|i|small|sup|sub|font|u|mark|s)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, "").split(/<(?:[^>"']|"[^"]*"|'[^']*')*>/).map((t) => clean(decode(t))).filter((t) => t.length > 1);

export function freeShippingQuote(textOrHtml: string): { quote: string; from: number | null } | null {
  const nodes = /</.test(textOrHtml) ? textNodes(textOrHtml) : [textOrHtml];
  const re = /free (?:standard |express )?(?:shipping|delivery)/i;
  const node = nodes.find((n) => re.test(n) && n.length <= 160) ?? nodes.find((n) => re.test(n));
  if (!node) return null;
  const m = node.match(/[^.!|]{0,60}free (?:standard |express )?(?:shipping|delivery)[^.!|]{0,60}/i)!;
  const quote = clean(m[0]);
  const n = quote.match(/(?:over|above|from|orders? of|spend)\s*(?:[A-Z]{1,3})?\s*[$£€]?\s*(\d{2,4})(?:\.\d{2})?/i) ?? quote.match(/[$£€]\s*(\d{2,4})(?:\.\d{2})?\+?/);
  return { quote, from: n ? Number(n[1]) : null };
}

const addToCartAt = (html: string) => {
  const re = /name=["']add["']|add[ -]?to[ -]?(?:cart|bag|basket)|product-form__submit|buy now/i;
  const m = re.exec(html);
  return m ? m.index : -1;
};
const RATING_MARK = /jdgm-preview-badge|yotpo[^"']*(?:bottomline|star)|okeReviews-reviewsSummary|loox-rating|stamped-product-reviews-badge|spr-badge|data-rating|aggregateRating|★|\d(?:\.\d)? ?(?:out of 5|stars)|\(\d+ reviews?\)|\d+ reviews/i;

export function collectFacts(i: AuditInput): Facts {
  const home = i.home?.body ?? "";
  const homeText = textOf(home);
  const ship = freeShippingQuote(home);
  const prices = (i.products ?? []).map((p) => money(p.variants?.[0]?.price)).filter((x): x is number => x !== null && x > 0);
  const p0 = i.products?.[0];
  const ph = i.product?.body ?? "";
  const atc = addToCartAt(ph);
  const ratingAt = ph.search(RATING_MARK);
  const ld = ph.replace(/\s+/g, "");
  let product: Facts["product"] = null;
  if (i.product && i.product.status < 400) {
    const pt = textOf(ph);
    const titleFromPage = metaContent(ph, "og:title") ?? titleOf(ph) ?? "your product";
    const bodyWords = p0?.body_html != null ? textOf(p0.body_html).split(" ").filter(Boolean).length : textOf((ph.match(/<div[^>]*class=["'][^"']*(?:product__description|product-description|description)[^"']*["'][^>]*>([\s\S]{0,8000}?)<\/div>/i) ?? [])[1] ?? "").split(" ").filter(Boolean).length;
    product = {
      title: p0?.title ? clean(decode(p0.title)) : titleFromPage,
      url: i.product.url,
      price: money(p0?.variants?.[0]?.price) ?? money(metaContent(ph, "product:price:amount") ?? metaContent(ph, "og:price:amount")),
      compareAt: money(p0?.variants?.[0]?.compare_at_price),
      words: bodyWords,
      images: Array.isArray(p0?.images) ? p0!.images!.length : (ph.match(/<img\b/gi) ?? []).length,
      kb: Math.round(i.product.bytes / 1024),
      pageWords: pt.split(" ").filter(Boolean).length,
      productLd: /"@type":"Product"/i.test(ld),
      rating: /aggregateRating/i.test(ph),
      reviewsBeforeBuy: ratingAt >= 0 && (atc < 0 || ratingAt < atc),
      shippingMention: /shipping|delivery|dispatch/i.test(pt),
      returnsMention: /return|refund|exchange|guarantee/i.test(pt),
      wallets: hits(ph, WALLETS),
    };
  }
  return {
    homeTitle: titleOf(home),
    metaDescription: metaContent(home, "description"),
    viewport: /name\s*=\s*["']viewport["']/i.test(home),
    homeKb: Math.round((i.home?.bytes ?? 0) / 1024),
    scripts: (home.match(/<script\b/gi) ?? []).length,
    pixels: hits(home, PIXELS),
    reviewApps: [...new Set([...hits(home, REVIEW_APPS), ...hits(ph, REVIEW_APPS)])],
    emailCapture: hits(home, CAPTURE),
    shippingText: ship?.quote ?? null,
    freeShippingFrom: ship?.from ?? null,
    shopify: /cdn\.shopify\.com|Shopify\.theme|myshopify\.com/i.test(home) || i.products !== null,
    productCount: i.products ? i.products.length : null,
    medianPrice: median(prices),
    product,
    homeWords: homeText.split(" ").filter(Boolean).length,
    trust: { contact: /href=["'][^"']*contact/i.test(home), about: /href=["'][^"']*(?:about|our-story)/i.test(home), returnsPage: /href=["'][^"']*(?:refund|return)/i.test(home) },
  };
}

const RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2, good: 3 };

/** Turn facts into findings, worst first. Things done well come last as "good". */
export function findingsFrom(f: Facts, i: Pick<AuditInput, "url">): Finding[] {
  const out: Finding[] = [];
  const add = (x: Finding) => out.push(x);
  const host = (() => { try { return new URL(i.url).hostname.replace(/^www\./, ""); } catch { return i.url; } })();
  const p = f.product;
  const thinHome = f.homeWords < 60;
  if (thinHome) add({ id: "home-unreadable", severity: "low", title: "We could only read part of your home page", quote: `Your home page gave us ${f.homeWords} word${f.homeWords === 1 ? "" : "s"} of text${f.homeTitle ? "" : " and no title"}. It may build itself with JavaScript or block automated checks.`, fix: "Search engines and AI shopping tools read pages the same way. Ask your developer whether the home page content is in the HTML." });

  if (thinHome) { /* home page findings need a readable page */ } else if (!f.homeTitle) add({ id: "title-missing", severity: "high", title: "Your home page has no title", quote: `We found no <title> on ${host}.`, fix: "Add a page title with your brand and what you sell, about 50 to 60 characters. It is the blue link people see on Google.", lesson: "9.2" });
  else if (f.homeTitle.length > 70) add({ id: "title-long", severity: "low", title: "Your home page title gets cut off on Google", quote: `"${cut(f.homeTitle, 100)}" is ${f.homeTitle.length} characters.`, fix: "Keep it under about 60 characters, brand plus what you sell.", lesson: "9.2" });
  else if (f.homeTitle.length < 15) add({ id: "title-short", severity: "low", title: "Your home page title doesn't say what you sell", quote: `Your title is just "${f.homeTitle}".`, fix: "Add what you sell after your brand, for example \"Brand: Linen bedding made in Portugal\".", lesson: "9.2" });
  if (!thinHome && !f.metaDescription) add({ id: "meta-desc", severity: "medium", title: "No description for Google to show", quote: `${host} has no meta description, so Google picks random text from the page.`, fix: "Write one or two sentences (about 150 characters) with what you sell and why people buy from you.", lesson: "9.2" });
  if (!f.viewport) add({ id: "viewport", severity: "high", title: "Your store may not fit phone screens", quote: "We found no viewport tag on your home page.", fix: "Most shoppers are on phones. Ask your theme developer to add the standard viewport tag.", lesson: "9.4" });
  if (f.homeKb > 500 || f.scripts > 60) add({ id: "heavy-home", severity: f.homeKb > 900 || f.scripts > 90 ? "high" : "medium", title: "Your home page is heavy", quote: `Your home page HTML is ${f.homeKb} KB with ${f.scripts} script tags, before any images load.`, fix: "Each app adds code to every page. Remove apps you no longer use and check your phone speed in PageSpeed Insights.", lesson: "9.4" });

  if (p && p.pageWords < 80) add({ id: "pdp-unreadable", severity: "low", title: "We could only read part of your product page", quote: `The page for "${cut(p.title, 60)}" gave us ${p.pageWords} word${p.pageWords === 1 ? "" : "s"} of text. It may build itself with JavaScript or block automated checks.`, fix: "Search engines and AI shopping tools read pages the same way. Ask your developer whether the product details are in the HTML." });
  if (p && p.pageWords >= 80) {
    const name = `"${cut(p.title, 60)}"`;
    if (p.words < 80) add({ id: "thin-description", severity: "high", title: "Your product description is thin", quote: `${name} has only ${p.words} words of description.`, fix: "Best sellers usually have 150+ words: who it's for, what it's made of, sizing or fit, care, and delivery. Answer the top 3 questions people ask you.", lesson: "9.5" });
    if (!p.rating && f.reviewApps.length === 0) add({ id: "no-reviews", severity: "high", title: "No reviews on your product page", quote: `We saw no review app or star rating on ${name}.`, fix: "Add a reviews app and ask your last 20 customers for a review. Show the stars near the price.", lesson: "9.2" });
    else if (!p.reviewsBeforeBuy) add({ id: "reviews-low", severity: "medium", title: "Your reviews sit below the add to cart button", quote: `On ${name} the first rating we saw comes after the buy button.`, fix: "Put a star rating and review count next to the price, so shoppers see proof before they decide.", lesson: "9.2" });
    if (p.productLd && !p.rating && f.reviewApps.length) add({ id: "no-rating-schema", severity: "low", title: "Google can't see your star rating", quote: `${name} has product data for Google but no rating in it, although you use a reviews app.`, fix: "Turn on rich snippets or structured data in your reviews app settings so stars can show in search results.", lesson: "9.2" });
    if (!p.productLd) add({ id: "no-product-ld", severity: "low", title: "Your product page has no product data for Google", quote: `We found no Product structured data on ${name}.`, fix: "Most current Shopify themes add this for you. If yours doesn't, ask your theme developer or use a free structured data app.", lesson: "9.2" });
    if (!p.shippingMention) add({ id: "pdp-no-shipping", severity: "high", title: "Shipping isn't mentioned on your product page", quote: `${name} doesn't mention shipping or delivery anywhere we could read.`, fix: "Surprise shipping costs are the top reason people leave at checkout. Add one line under the price: cost, free shipping amount and delivery time.", lesson: "9.11" });
    if (!p.returnsMention && !f.trust.returnsPage) add({ id: "no-returns", severity: "medium", title: "No returns or guarantee message", quote: `We saw no returns, refund or guarantee text on ${name} or a returns link on your home page.`, fix: "Add a short, clear guarantee near the buy button and a returns page in your footer.", lesson: "9.2" });
    if (p.compareAt && p.price && p.compareAt > p.price) {
      const off = Math.round((1 - p.price / p.compareAt) * 100);
      if (off >= 40) add({ id: "deep-discount", severity: "medium", title: "A deep markdown on a key product", quote: `${name} is ${price$(p.price)}, down from ${price$(p.compareAt)} (${off}% off).`, fix: "Check this still makes a profit after product, shipping, fees and ads. Use your profit dashboard before the next promotion.", lesson: "9.12" });
    }
    if (p.images > 30) add({ id: "many-images", severity: "low", title: "A lot of images on one product", quote: `${name} has ${p.images} images.`, fix: "Keep the best 6 to 10. Too many slows the page on phones.", lesson: "9.4" });
    else if (p.images < 3) add({ id: "few-images", severity: "medium", title: "Few product photos", quote: `${name} has ${p.images} image${p.images === 1 ? "" : "s"}.`, fix: "Aim for 5 to 8: product on white, in use, close-up detail, scale or sizing, and a customer photo.", lesson: "9.2" });
    if (p.kb > 600) add({ id: "heavy-pdp", severity: "medium", title: "Your product page is heavy", quote: `The page for ${name} is ${p.kb} KB of HTML.`, fix: "Remove unused apps and widgets from product pages and test the speed on your phone.", lesson: "9.4" });
    if (p.wallets.length === 0) add({ id: "no-wallets", severity: "medium", title: "No express payment or buy now pay later shown", quote: `We saw no Shop Pay, express wallet or buy now pay later on ${name}.`, fix: "Turn on express checkout buttons in your payment settings. They cut typing on phones.", lesson: "9.2" });
    else add({ id: "wallets-ok", severity: "good", title: "Express payments are shown", quote: `${name} shows ${walletText(p.wallets)}.`, fix: "" });
  } else if (!p) add({ id: "no-product", severity: "medium", title: "We couldn't open a product page", quote: `We couldn't find or open a product page from ${host}.`, fix: "Make sure your home page links to your best seller. Shoppers should reach a product in one tap." });

  if (thinHome) { /* skip */ } else if (f.shippingText) {
    if (f.freeShippingFrom && f.medianPrice && f.freeShippingFrom < f.medianPrice * 0.9) add({ id: "threshold-low", severity: "medium", title: "Your free shipping amount is below a typical order", quote: `Your site says "${cut(f.shippingText)}", but your typical product is about ${Math.round(f.medianPrice)}.`, fix: "Set the free shipping amount a little above your average order (about 20 to 30% higher), so it nudges people to add one more thing.", lesson: "9.11" });
    else if (f.freeShippingFrom && f.medianPrice && f.freeShippingFrom > f.medianPrice * 3) add({ id: "threshold-high", severity: "low", title: "Your free shipping amount may be out of reach", quote: `Your site says "${cut(f.shippingText)}", about ${Math.round(f.freeShippingFrom / f.medianPrice)}x your typical product price of ${Math.round(f.medianPrice)}.`, fix: "Most people won't spend 3x to save on shipping. Try a threshold about 20 to 30% above your average order.", lesson: "9.11" });
    else add({ id: "shipping-ok", severity: "good", title: "Free shipping is clear on your home page", quote: `"${cut(f.shippingText)}"`, fix: "" });
  } else add({ id: "no-shipping-msg", severity: "medium", title: "No free shipping message on your home page", quote: `We saw no free shipping or delivery message on ${host}'s home page.`, fix: "If you offer free shipping over an amount, say it in the announcement bar. If you don't, consider it, set a little above your average order.", lesson: "9.11" });

  if (thinHome) { /* skip */ } else if (f.emailCapture.length === 0) add({ id: "no-capture", severity: "medium", title: "No email sign-up tool seen", quote: "We didn't see an email sign-up form or tool in your home page source.", fix: "Most visitors don't buy on the first visit. A sign-up offer lets you email them, and it's usually the cheapest sale you'll make.", lesson: "10.2" });
  else add({ id: "capture-ok", severity: "good", title: "You collect emails", quote: `We saw ${f.emailCapture.includes("Shopify Forms") ? "Shopify Forms" : "an email sign-up tool"} on your home page.`, fix: "" });

  if (!thinHome && !f.pixels.includes("Meta pixel")) add({ id: "no-meta-pixel", severity: f.pixels.includes("Google Tag Manager") ? "low" : "medium", title: "No Meta pixel seen in your page source", quote: f.pixels.length ? `We saw ${f.pixels.join(", ")}, but not the Meta pixel. It may load through Tag Manager or Shopify's Facebook app.` : "We saw no tracking pixels in your page source. They may load through an app.", fix: "If you run or plan to run Meta ads, check in Meta Events Manager that purchases are being tracked.", lesson: "20.9" });
  if (!thinHome && !f.trust.contact) add({ id: "no-contact", severity: "low", title: "No contact link on your home page", quote: `We found no link to a contact page on ${host}.`, fix: "Put a contact link in your footer. Being easy to reach builds trust.", lesson: "9.2" });

  return out.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
}

/** The prioritised fix list: worst first, at most `n`. */
export const topFixes = (all: Finding[], n = 5) => all.filter((x) => x.severity !== "good").slice(0, n);

/** What changed since the last check, in plain words. */
export function changesSince(prev: Finding[], now: Finding[]): { fixed: Finding[]; added: Finding[] } {
  const p = new Set(prev.filter((x) => x.severity !== "good").map((x) => x.id));
  const n = new Set(now.filter((x) => x.severity !== "good").map((x) => x.id));
  return { fixed: prev.filter((x) => x.severity !== "good" && !n.has(x.id)), added: now.filter((x) => x.severity !== "good" && !p.has(x.id)) };
}

/** A store price as "$25.00". Shopify gives no currency here; $ is the usual sign for Helix stores. */
function price$(n: number) { return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
