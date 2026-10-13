import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";
import { FEATURES } from "@/lib/content/features";
import { ARTICLES } from "@/lib/content/guides";
import { listModules } from "@/lib/learn";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, lastModified: Date = now) => ({ url: abs(path), lastModified, changeFrequency: "weekly" as const, priority });
  return [
    page("/", 1),
    page("/features", 0.9),
    ...FEATURES.map((f) => page(`/features/${f.slug}`, 0.9)),
    page("/guides", 0.8),
    ...ARTICLES.map((a) => page(`/guides/${a.slug}`, 0.8, new Date(a.updated))),
    page("/faq", 0.7),
    page("/help", 0.5),
    page("/about", 0.6),
    page("/privacy", 0.3),
    page("/terms", 0.3),
    page("/data-deletion", 0.3),
    page("/learn", 0.7),
    page("/learn/words", 0.5),
    page("/learn/goals", 0.5),
    ...listModules().map((m) => page(`/learn/${m.slug}`, 0.5)),
  ];
}
