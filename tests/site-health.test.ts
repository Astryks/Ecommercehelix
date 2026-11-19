/**
 * Finishing step — checkout/pixel health from the site check.
 * healthFromFacts is conservative by design: unknown is null, never
 * assumed ok or broken. A dead checkout (cart endpoint erroring) and a
 * store with no tracking at all are the two things it can prove.
 */
import { describe, expect, it } from "vitest";
import { healthFromFacts, type Facts } from "@/lib/site-audit/checks";

const base: Facts = {
  homeTitle: "Test Store",
  metaDescription: null,
  viewport: true,
  homeKb: 120,
  scripts: 10,
  pixels: [],
  reviewApps: [],
  emailCapture: [],
  shippingText: null,
  freeShippingFrom: null,
  shopify: true,
  productCount: 5,
  medianPrice: 50,
  product: {
    title: "Test Product",
    url: "https://example.com/products/test",
    price: 50,
    compareAt: null,
    words: 200,
    images: 5,
    kb: 100,
    productLd: true,
    rating: true,
    reviewsBeforeBuy: true,
    pageWords: 200,
    shippingMention: true,
    returnsMention: true,
    wallets: ["Shop Pay"],
  },
  trust: { contact: true, about: true, returnsPage: true },
  cartOk: true,
  speed: null,
  homeWords: 500,
};

describe("healthFromFacts", () => {
  it("null facts = unknown, never assumed ok", () => {
    expect(healthFromFacts(null)).toEqual({ checkoutOk: null, pixelOk: null });
  });
  it("cart ok + product page + Meta pixel = both ok", () => {
    expect(healthFromFacts({ ...base, pixels: ["Meta pixel"] })).toEqual({ checkoutOk: true, pixelOk: true });
  });
  it("cart endpoint erroring = dead checkout", () => {
    // Base facts have no tracking pixel at all, so pixelOk is also false here.
    expect(healthFromFacts({ ...base, cartOk: false })).toEqual({ checkoutOk: false, pixelOk: false });
  });
  it("cart never checked = checkout unknown", () => {
    expect(healthFromFacts({ ...base, cartOk: null }).checkoutOk).toBeNull();
  });
  it("readable home page with no tracking at all = pixel broken", () => {
    expect(healthFromFacts(base).pixelOk).toBe(false);
  });
  it("tracking via Tag Manager only = pixel unknown, not assumed broken", () => {
    expect(healthFromFacts({ ...base, pixels: ["Google Tag Manager"] }).pixelOk).toBeNull();
  });
  it("thin/unreadable home page with no pixels = unknown, not broken", () => {
    expect(healthFromFacts({ ...base, homeWords: 10 }).pixelOk).toBeNull();
  });
});
