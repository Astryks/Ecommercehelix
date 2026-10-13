import type { Metadata } from "next";

export const SITE_URL = "https://ecommercehelix.com";
export const SITE_NAME = "E-commerce Helix";
export const SITE_DESCRIPTION =
  "E-commerce Helix is self-serve growth software for online store owners: a daily profit dashboard, one clear growth task a day, Meta ads built as paused drafts, and email flows drafted for your approval.";

export const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "E-commerce Helix: grow your e-commerce business a little every day" };

export const abs = (path: string) => new URL(path, SITE_URL).toString();

/** Per-page metadata with canonical, Open Graph and Twitter tags. */
export function pageMeta({ title, description, path, type = "website" }: { title: string; description: string; path: string; type?: "website" | "article" }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type, locale: "en_AU", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}

export const ORG_ID = `${SITE_URL}/#organization`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs("/icon-512.png"),
    description: SITE_DESCRIPTION,
  };
}

export function websiteLd() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, publisher: { "@id": ORG_ID }, inLanguage: "en-AU" };
}

export function softwareLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "AUD" },
      { "@type": "Offer", name: "Starter", price: "29", priceCurrency: "AUD", description: "Per month" },
      { "@type": "Offer", name: "Growth", price: "59", priceCurrency: "AUD", description: "Per month" },
    ],
  };
}

/** Feature pages describe the software (self-serve), not a service. */
export function serviceLd(s: { name: string; description: string; path: string; serviceType: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME}: ${s.name}`,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: s.serviceType,
    operatingSystem: "Web",
    description: s.description,
    url: abs(s.path),
    publisher: { "@id": ORG_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "AUD", name: "Free" },
    audience: { "@type": "BusinessAudience", audienceType: "E-commerce business owners" },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: abs(t.path) })),
  };
}

export function articleLd(a: { title: string; description: string; path: string; published: string; updated: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    mainEntityOfPage: abs(a.path),
    datePublished: a.published,
    dateModified: a.updated,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    image: abs("/opengraph-image"),
  };
}
