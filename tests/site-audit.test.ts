import { describe, expect, it } from "vitest";
import { isPrivateIp, normaliseStoreUrl, robotsDisallows } from "@/lib/site-audit/guard";
import { collectFacts, findingsFrom, freeShippingQuote, topFixes, changesSince } from "@/lib/site-audit/checks";

describe("SSRF guard", () => {
  it("allows public http(s) only", () => {
    expect(normaliseStoreUrl("allbirds.com")?.toString()).toBe("https://allbirds.com/");
    expect(normaliseStoreUrl("ftp://x.com")).toBeNull();
    expect(normaliseStoreUrl("file:///etc/passwd")).toBeNull();
    expect(normaliseStoreUrl("http://localhost:3000")).toBeNull();
    expect(normaliseStoreUrl("http://127.0.0.1")).toBeNull();
    expect(normaliseStoreUrl("http://169.254.169.254/latest")).toBeNull();
    expect(normaliseStoreUrl("http://[::1]/")).toBeNull();
    expect(normaliseStoreUrl("https://user:pw@shop.com")).toBeNull();
    expect(normaliseStoreUrl("https://shop.com:8080")).toBeNull();
    expect(normaliseStoreUrl("intranet")).toBeNull();
  });
  it("knows private ranges", () => {
    for (const ip of ["10.1.2.3", "172.20.0.1", "192.168.1.1", "100.64.1.1", "0.0.0.0", "::ffff:10.0.0.1", "fd00::1", "fe80::1"]) expect(isPrivateIp(ip)).toBe(true);
    for (const ip of ["23.227.38.65", "1.1.1.1", "2606:4700::1111"]) expect(isPrivateIp(ip)).toBe(false);
  });
  it("reads robots.txt", () => {
    const r = "User-agent: *\nDisallow: /cart\nDisallow: /*?sort_by*\n\nUser-agent: BadBot\nDisallow: /";
    expect(robotsDisallows(r, "/cart.js")).toBe(true);
    expect(robotsDisallows(r, "/products.json")).toBe(false);
    expect(robotsDisallows(r, "/collections/all?sort_by=price")).toBe(true);
  });
});

const HOME = `<html><head><title>Linen Co: Linen bedding made in Portugal</title><meta name="viewport" content="width=device-width"><script src="https://cdn.shopify.com/x.js"></script><script>gtag('config','G-ABCDEF123')</script></head>
<body><div class="announcement"><span>Free shipping</span> on orders over $50</div><p>${"Linen bedding made in Portugal, washed for softness and made to last for years. ".repeat(6)}</p><a href="/pages/contact">Contact</a><a href="/policies/refund-policy">Returns</a></body></html>`;
const PDP = `<html><body><h1>Linen Duvet Cover</h1><span>$180.00</span><form><button name="add">Add to cart</button></form><div class="jdgm-preview-badge">4.8 stars (120 reviews)</div><script type="application/ld+json">{"@type":"Product","name":"Linen Duvet Cover"}</script><p>PayPal and Afterpay available</p><p>${"Our washed linen duvet cover is soft from the first night and gets softer with every wash. ".repeat(6)}</p></body></html>`;

describe("store check findings", () => {
  const input = {
    url: "https://linen.example",
    home: { status: 200, body: HOME, bytes: HOME.length, ms: 300 },
    products: [{ title: "Linen Duvet Cover", handle: "linen-duvet-cover", body_html: "<p>Soft washed linen. Made in Portugal.</p>", images: [1, 2], variants: [{ price: "180.00", compare_at_price: "400.00" }] }],
    product: { url: "https://linen.example/products/linen-duvet-cover", status: 200, body: PDP, bytes: PDP.length },
    cartStatus: null,
  };
  const facts = collectFacts(input);
  const all = findingsFrom(facts, input);
  const ids = all.map((f) => f.id);
  it("quotes the store's own content", () => {
    const thin = all.find((f) => f.id === "thin-description")!;
    expect(thin.quote).toContain('"Linen Duvet Cover"');
    expect(thin.quote).toContain("6 words");
    expect(all.find((f) => f.id === "threshold-low")!.quote).toContain("Free shipping on orders over $50");
  });
  it("spots the usual problems", () => {
    expect(ids).toContain("meta-desc");
    expect(ids).toContain("reviews-low");
    expect(ids).toContain("no-rating-schema");
    expect(ids).toContain("pdp-no-shipping");
    expect(ids).toContain("deep-discount");
    expect(ids).toContain("few-images");
    expect(ids).toContain("no-capture");
    expect(ids).toContain("no-meta-pixel");
    expect(ids).toContain("wallets-ok");
    expect(facts.pixels).toContain("Google Analytics");
    expect(facts.shopify).toBe(true);
  });
  it("puts the worst first and keeps 5", () => {
    const top = topFixes(all);
    expect(top).toHaveLength(5);
    expect(top[0].severity).toBe("high");
    expect(top.every((f) => f.severity !== "good")).toBe(true);
  });
  it("reads free shipping amounts", () => {
    expect(freeShippingQuote("FREE delivery when you spend £75 or more")?.from).toBe(75);
    expect(freeShippingQuote("No deals here")).toBeNull();
  });
  it("reports what changed", () => {
    const d = changesSince(all, all.filter((f) => f.id !== "meta-desc"));
    expect(d.fixed.map((f) => f.id)).toEqual(["meta-desc"]);
    expect(d.added).toEqual([]);
  });
});
